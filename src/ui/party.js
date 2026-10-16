// 联机控制（D-048）：开设 / 加入队伍、消息收发、按接收者分发输出、出招倒计时、客人一侧的结算。
// 引擎只认命令；这里负责把命令和输出在房主与客人之间搬运。协议见 docs/MULTIPLAYER.md §8。

import { openTransport, makeRoomCode } from '../net/transport.js';
import { GUEST_LOCAL, HOST_PRIVATE, MAX_GUESTS } from '../game-party.js';
import { gainExp } from '../character.js';
import { regionOf } from './map.js';

export const PROTOCOL = 1;
const ROUND_SECONDS = 20; // 组队时每回合出招时限
const COMBAT_CLS = new Set(['round', 'omen', 'hint', 'act', 'tag', 'hit', 'fx', 'combat', 'team']);

/** 把战斗文字里自己的名字换成"你"（D-048：组队战斗用真名，各人看到的视角不同） */
export function personalize(entries, name) {
  if (!name) return entries;
  return entries.map((e) => (COMBAT_CLS.has(e.cls) && e.text.includes(name) ? { ...e, text: e.text.replaceAll(name, '你') } : e));
}

/**
 * @param {{
 *   game: () => any, db: () => any, contentHash: string,
 *   print: (entries: any[]) => void, refresh: () => void, save: () => void,
 * }} hooks
 */
export function initParty(hooks) {
  let net = null;
  let role = null; // 'host' | 'guest' | null
  let hostPid = null;
  let guestView = { combat: null, deadline: 0, room: null, visited: null, members: [] };
  let timer = null;
  let timerRound = 0;
  let deadline = 0;
  let joinTimeout = null;
  let lastPosRoom = null;

  const sys = (text, cls = 'party') => hooks.print([{ cls, text }]);

  // ================= 房主 =================

  async function host() {
    const g = hooks.game();
    if (role) return;
    if (g.room()?.props.inn !== 'true') { sys('要在旅店或门派驻地才能开设队伍。', 'err'); return; }
    const code = makeRoomCode();
    try {
      net = await openTransport(code);
    } catch (err) {
      sys(`联机服务连接失败：${err.message}`, 'err');
      return;
    }
    role = 'host';
    g.partyStart(code);
    net.onMessage(onHostMessage);
    net.onPeerLeave((pid) => { if (g.member(pid)) show(g.removeMember(pid)); });
    sys(`你开设了队伍，暗号是「${code}」。把暗号告诉朋友，在旅店或门派驻地输入"加入队伍 ${code}"即可加入（最多 ${MAX_GUESTS} 人）。`);
    hooks.refresh();
  }

  function onHostMessage(msg, pid) {
    const g = hooks.game();
    if (!msg || typeof msg !== 'object') return;
    if (msg.t === 'hello') {
      if (g.member(pid)) return;
      const reject = (reason) => net.send({ t: 'reject', reason }, pid);
      if (msg.v !== PROTOCOL || msg.hash !== hooks.contentHash) return reject('游戏版本不一致，请双方都刷新页面后再试。');
      if (g.party.members.length >= MAX_GUESTS) return reject('队伍已满。');
      if (!msg.char?.name) return reject('角色数据有误。');
      const out = g.addMember(pid, msg.char);
      net.send({ t: 'welcome', code: g.party.code, host: g.state.player.name }, pid);
      show(out);
      show(g.guestCmd(pid, 'look')); // 让新来的人看到眼前的情景
      lastPosRoom = null;
      sendPos(true);
      return;
    }
    if (!g.member(pid)) return;
    if (msg.t === 'cmd' && typeof msg.text === 'string') show(g.guestCmd(pid, msg.text.slice(0, 200)));
    else if (msg.t === 'char' && msg.char) g.updateSnap(pid, msg.char);
    else if (msg.t === 'bye') show(g.removeMember(pid));
  }

  /** 客人引起的输出：分发后把房主自己的那份显示出来，并存档 */
  function show(out) {
    hooks.print(dispatch(out));
    hooks.save();
    hooks.refresh();
  }

  /**
   * 房主一侧：把引擎输出分发出去。本地显示自己的那份，给每位客人发他的那份。
   * @param {string} [verb] 房主自己执行的命令动词；私事（看状态、买卖、存钱等）不广播
   */
  function dispatch(out, verb) {
    const g = hooks.game();
    const local = personalize(out.filter((e) => !e.to || e.to === 'host'), g.state.player.name);
    if (role !== 'host') return local;
    const privateCmd = verb && HOST_PRIVATE.has(verb);
    for (const m of g.party.members) {
      const mine = privateCmd ? out.filter((e) => e.to === m.pid) : out.filter((e) => !e.to || e.to === m.pid);
      if (mine.length) net.send({ t: 'out', entries: personalize(mine, m.name) }, m.pid);
    }
    // 战后结算
    for (const o of g.outbox.splice(0)) net.send(o.msg, o.to);
    afterChange();
    return local;
  }

  /** 每次状态变化后：同步战斗面板、位置、队伍名单，管理出招倒计时 */
  function afterChange() {
    const g = hooks.game();
    if (role !== 'host') return;
    const b = g.state.battle;
    if (b && g.party.members.length) {
      if (b.round !== timerRound) startTimer(b.round);
    } else stopTimer();
    for (const m of g.party.members) {
      net.send({ t: 'combat', view: b ? g.combatView(m.pid) : null, left: b ? secondsLeft() : 0 }, m.pid);
    }
    sendPos();
    net.send({ t: 'members', list: g.partyView().members });
  }

  function sendPos(force) {
    const g = hooks.game();
    const room = g.state.player.room;
    if (!force && room === lastPosRoom) return;
    lastPosRoom = room;
    const region = regionOf(room);
    const visited = Object.keys(g.state.visited).filter((r) => regionOf(r) === region);
    net.send({ t: 'pos', room, visited });
  }

  function startTimer(round) {
    stopTimer();
    timerRound = round;
    deadline = Date.now() + ROUND_SECONDS * 1000;
    timer = setInterval(() => {
      if (Date.now() < deadline) { hooks.refresh(); return; }
      stopTimer();
      const out = hooks.game().combatTimeout();
      hooks.print(dispatch(out));
      hooks.save();
      hooks.refresh();
    }, 1000);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    if (!hooks.game()?.state.battle) timerRound = 0;
  }

  const secondsLeft = () => Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

  function disband() {
    const g = hooks.game();
    if (role !== 'host') return;
    net.send({ t: 'bye', reason: `${g.state.player.name}解散了队伍。` });
    cleanup();
    g.partyEnd();
    sys('你解散了队伍。');
    hooks.refresh();
  }

  // ================= 客人 =================

  async function join(code) {
    const g = hooks.game();
    if (role) return;
    if (!code) { sys('加入哪个队伍？例如：加入队伍 燕子-1234', 'err'); return; }
    if (g.room()?.props.inn !== 'true') { sys('要在旅店或门派驻地才能加入队伍。', 'err'); return; }
    if (g.state.battle) return;
    try {
      net = await openTransport(code.trim());
    } catch (err) {
      sys(`联机服务连接失败：${err.message}`, 'err');
      return;
    }
    role = 'joining';
    sys(`正在寻找暗号为「${code}」的队伍……`);
    const hello = (pid) => net.send({ t: 'hello', v: PROTOCOL, hash: hooks.contentHash, char: g.state.player }, pid);
    net.onPeerJoin(hello);
    net.onMessage(onGuestMessage);
    net.onPeerLeave((pid) => {
      if (pid === hostPid) { sys('与队长失去了联系，队伍解散了。'); leaveGuest(false); }
    });
    hello(); // 已经在房间里的人也打个招呼
    joinTimeout = setTimeout(() => {
      if (role === 'joining') { sys('找不到这个队伍。请确认暗号，或者让队长重新开设。', 'err'); cleanup(); hooks.refresh(); }
    }, 20000);
  }

  function onGuestMessage(msg, pid) {
    if (!msg || typeof msg !== 'object') return;
    const g = hooks.game();
    if (msg.t === 'welcome' && role === 'joining') {
      role = 'guest';
      hostPid = pid;
      clearTimeout(joinTimeout);
      sys(`你加入了${msg.host}的队伍。跟随队长行动；点击出口、人物、选项会变成向队长的建议。`);
      guestView.code = msg.code;
      hooks.onJoined?.();
      hooks.refresh();
      return;
    }
    if (msg.t === 'reject' && role === 'joining') { sys(`加入失败：${msg.reason}`, 'err'); cleanup(); hooks.refresh(); return; }
    if (pid !== hostPid) return;
    if (msg.t === 'out') hooks.print(msg.entries ?? []);
    else if (msg.t === 'combat') { guestView.combat = msg.view; guestView.deadline = Date.now() + (msg.left ?? 0) * 1000; hooks.refresh(); }
    else if (msg.t === 'pos') { guestView.room = msg.room; guestView.visited = msg.visited; hooks.refresh(); }
    else if (msg.t === 'members') { guestView.members = msg.list ?? []; hooks.refresh(); }
    else if (msg.t === 'settle') applySettle(msg);
    else if (msg.t === 'bye') { sys(msg.reason ?? '队伍解散了。'); leaveGuest(false); }
  }

  /** 客人一侧：把房主发来的战后结算写入自己的存档（同一套公式，结果与房主那边的快照一致） */
  function applySettle(msg) {
    const g = hooks.game();
    const p = g.state.player;
    g.state.settled ??= {};
    const key = `${guestView.code ?? ''}#${msg.seq}`;
    if (g.state.settled[key]) return; // 重复的包直接忽略
    g.state.settled[key] = true;
    for (const [id, amt] of Object.entries(msg.exp ?? {})) gainExp(hooks.db(), p, id, amt);
    p.potential = (p.potential ?? 0) + (msg.potential ?? 0);
    if (typeof msg.hp === 'number') p.hp = msg.hp;
    g.normalizeHp();
    hooks.save();
    sendChar();
    hooks.refresh();
  }

  function sendChar() {
    if (role === 'guest') net.send({ t: 'char', char: hooks.game().state.player }, hostPid);
  }

  /**
   * 客人输入的命令：查看自己的命令在本地执行；战斗中的出招、看、说、建议发给房主；
   * 其余的（走动、交谈、选择……）自动变成向队长的建议。返回要显示的条目。
   */
  function guestRun(cmd) {
    const g = hooks.game();
    const [verb] = cmd.trim().split(/\s+/);
    const v = verb.toLowerCase();
    if (['离开队伍', '退出队伍'].includes(v)) { leaveGuest(true); return []; }
    if (GUEST_LOCAL.has(v) || v === '修炼') {
      if (v === '修炼') return [{ cls: 'err', text: '在队伍中不能修炼。离队后去旅店或本门驻地吧。' }];
      const out = g.exec(cmd);
      if (['装备', 'equip', '卸下', 'unequip', '天赋', 'talent'].includes(v)) sendChar();
      return out;
    }
    if (guestView.combat || ['l', 'look', '看', '观察', '说', 'say', '建议', 'suggest'].includes(v)) {
      net.send({ t: 'cmd', text: cmd }, hostPid);
      return [];
    }
    net.send({ t: 'cmd', text: `建议 ${cmd}` }, hostPid);
    return [];
  }

  function leaveGuest(notify) {
    if (notify && net) net.send({ t: 'bye' }, hostPid);
    cleanup();
    sys('你离开了队伍，回到了自己的江湖。');
    hooks.print(hooks.game().exec('look')); // 客人回到加入时所在的旅店（D-011）
    hooks.refresh();
  }

  function cleanup() {
    stopTimer();
    clearTimeout(joinTimeout);
    if (net) net.leave();
    net = null;
    role = null;
    hostPid = null;
    guestView = { combat: null, deadline: 0, room: null, visited: null, members: [] };
  }

  return {
    host, join, disband, dispatch, guestRun,
    leave: () => (role === 'host' ? disband() : role ? leaveGuest(true) : null),
    role: () => role,
    isHost: () => role === 'host',
    isGuest: () => role === 'guest',
    /** 客人看到的战斗面板数据（来自房主） */
    guestCombat: () => (role === 'guest' ? guestView.combat : null),
    /** 当前回合剩余秒数（房主本地计时；客人按房主发来的剩余时间） */
    secondsLeft: () => (role === 'host' ? (timer ? secondsLeft() : 0) : Math.max(0, Math.ceil((guestView.deadline - Date.now()) / 1000))),
    /** 地图：客人显示房主所在的位置 */
    mapOverride: () => (role === 'guest' && guestView.room ? { room: guestView.room, visited: guestView.visited } : null),
    members: () => (role === 'host' ? hooks.game().partyView()?.members ?? [] : guestView.members),
    code: () => (role === 'host' ? hooks.game().party?.code : null),
    afterChange,
  };
}
