// 网络传输层（D-007、D-048）。对上层只提供：send / onMessage / onPeerJoin / onPeerLeave / leave。
//
// 两种实现：
// - trystero：WebRTC 点对点，借助公共 Nostr 中继完成信令。正式联机用。
// - local：BroadcastChannel，只能在同一个浏览器的不同标签页之间通信。用于开发测试，
//   以及一台电脑上开两个窗口体验联机。地址栏加 ?net=local 即可使用。

const APP_ID = 'wuxia-mud-jianghuyeyu';
const TRYSTERO = 'https://esm.sh/trystero@0.21.5/nostr';

/**
 * @typedef {{
 *   selfId: string,
 *   send: (msg: any, peerId?: string) => void,
 *   onMessage: (fn: (msg: any, peerId: string) => void) => void,
 *   onPeerJoin: (fn: (peerId: string) => void) => void,
 *   onPeerLeave: (fn: (peerId: string) => void) => void,
 *   leave: () => void,
 * }} Transport
 */

/** @returns {Promise<Transport>} */
export async function openTransport(roomCode, kind = defaultKind()) {
  return kind === 'local' ? openLocal(roomCode) : openTrystero(roomCode);
}

export function defaultKind() {
  return new URLSearchParams(location.search).get('net') === 'local' ? 'local' : 'trystero';
}

async function openTrystero(roomCode) {
  const { joinRoom, selfId } = await import(TRYSTERO);
  const room = joinRoom({ appId: APP_ID }, roomCode);
  const [sendMsg, getMsg] = room.makeAction('msg');
  return {
    selfId,
    send: (msg, peerId) => sendMsg(msg, peerId ?? null),
    onMessage: (fn) => getMsg((data, peerId) => fn(data, peerId)),
    onPeerJoin: (fn) => room.onPeerJoin(fn),
    onPeerLeave: (fn) => room.onPeerLeave(fn),
    leave: () => room.leave(),
  };
}

/** 同一浏览器内的标签页之间通信。用心跳判断对方是否还在。 */
function openLocal(roomCode) {
  const selfId = Math.random().toString(36).slice(2, 10);
  const ch = new BroadcastChannel(`${APP_ID}:${roomCode}`);
  const peers = new Map(); // peerId → 最后一次听到的时间
  let onMsg = () => {};
  let onJoin = () => {};
  let onLeave = () => {};
  const post = (type, data, to) => ch.postMessage({ type, from: selfId, to: to ?? null, data });

  const seen = (id) => {
    const isNew = !peers.has(id);
    peers.set(id, Date.now());
    if (isNew) { post('here', null, id); onJoin(id); }
  };

  ch.onmessage = (e) => {
    const { type, from, to, data } = e.data;
    if (from === selfId || (to && to !== selfId)) return;
    if (type === 'bye') { if (peers.delete(from)) onLeave(from); return; }
    seen(from);
    if (type === 'msg') onMsg(data, from);
  };

  const beat = setInterval(() => {
    post('ping');
    const now = Date.now();
    for (const [id, t] of peers) if (now - t > 8000) { peers.delete(id); onLeave(id); }
  }, 2000);
  const bye = () => post('bye');
  window.addEventListener('beforeunload', bye);
  setTimeout(() => post('hello'), 0);

  return Promise.resolve({
    selfId,
    send: (msg, peerId) => post('msg', msg, peerId),
    onMessage: (fn) => { onMsg = fn; },
    onPeerJoin: (fn) => { onJoin = fn; },
    onPeerLeave: (fn) => { onLeave = fn; },
    leave: () => { bye(); clearInterval(beat); window.removeEventListener('beforeunload', bye); ch.close(); },
  });
}

/** 生成房间暗号：两个字 + 四位数字，便于口头或聊天软件里传达 */
export function makeRoomCode() {
  const WORDS = ['燕子', '青竹', '白鹤', '流云', '寒江', '孤舟', '明月', '松风', '梅雪', '铁剑', '青锋', '落霞'];
  return WORDS[Math.floor(Math.random() * WORDS.length)] + '-' + String(Math.floor(1000 + Math.random() * 9000));
}
