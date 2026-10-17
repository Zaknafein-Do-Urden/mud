// 存档：localStorage 自动存档 + 文本导出导入。见 DEVLOG D-001 / D-002 / D-005。

import { newPlayer } from './character.js';

const PREFIX = 'wuxia-mud:'; // 同一 github.io 用户下所有项目共享 localStorage，必须加前缀
// 存档位：默认 1；地址栏 ?slot=2 可以用另一个存档（同一浏览器开两个窗口联机时用）
const SLOT = (typeof location !== 'undefined' && new URLSearchParams(location.search).get('slot')) || '1';
const SLOT_KEY = PREFIX + 'save:' + SLOT.replace(/[^\w-]/g, '');
const EXPORT_TAG = 'WXMUD1';
export const SAVE_VERSION = 10;

export function newState(startRoom) {
  const now = Date.now();
  return {
    v: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    player: newPlayer(startRoom),
    flags: {},
    visited: {},
    day: 1, // 第几日：坐车、住店会过日子；市集行情按日子波动
    claimed: {}, // 已领取的一次性主线奖励
  };
}

// 存档格式升级：migrations[n] 把 v=n 的存档升级到 v=n+1
const migrations = {
  // v2：共享世界的剧情标记加上 world. 命名空间（STORY.md §4.2）
  1: (s) => {
    const flags = {};
    for (const [k, v] of Object.entries(s.flags)) flags[k.includes('.') ? k : `world.${k}`] = v;
    return { ...s, flags };
  },
  // v3：角色加入属性、武功、装备栏、潜能、门派（战斗系统）
  2: (s) => {
    const base = newPlayer(s.player.room);
    return { ...s, player: { ...base, ...s.player, hp: null, inventory: s.player.inventory } };
  },
  // v4：实战经验、叛师记录、冻结武功（D-035、D-037）
  3: (s) => ({ ...s, player: { exp: {}, formerSects: [], frozen: {}, ...s.player } }),
  // v5：金钱、钱庄、货物、日子；铜钱物品折成现钱；姓名性别留空，读档时请玩家补填（D-040、D-041）
  4: (s) => {
    const { coin = 0, ...inventory } = s.player.inventory;
    return {
      ...s,
      day: 1,
      claimed: {},
      player: { surname: '', given: '', gender: '男', ...s.player, inventory, money: 200 + coin, bank: 0, cargo: {} },
    };
  },
  // v6：天赋（D-044）
  5: (s) => ({ ...s, player: { talents: {}, ...s.player } }),
  // v7：兵器装备（D-057）。基本刀法、剑法后来改为去武馆学（D-061），不再补给
  6: (s) => ({ ...s, player: { equip: { weapon: null }, ...s.player } }),
  // v8：修复"没点收下就离开对话、任务物品再也拿不到"的老存档（D-067）
  7: (s) => {
    const flags = { ...s.flags };
    const inventory = { ...s.player.inventory };
    // 老乞丐：给了钱、没收竹哨。清掉"已结识"，再给一文钱就能重来
    if (flags['world.beggar_friend'] && !flags['world.got_whistle']) delete flags['world.beggar_friend'];
    // 射雕第二章结尾没收腰牌：没有腰牌就问不到嘉兴的线索
    if (flags['shediao.ch2_done'] && !flags['shediao.lead_jiaxing'] && !inventory['shediao.duan_token']) inventory['shediao.duan_token'] = 1;
    // 竹哨第二章：进过暗室、没收燕翎剑
    if (s.visited?.['feiyan.zhaji'] && !inventory['feiyan.yanling']) inventory['feiyan.yanling'] = 1;
    return { ...s, flags, player: { ...s.player, inventory } };
  },
  // v9：射雕剧情新增的秘籍，补给已经走过那几章的老存档（D-071）
  8: (s) => {
    const f = s.flags ?? {};
    const inventory = { ...s.player.inventory };
    const skills = { ...s.player.skills };
    const skillcap = { ...(s.player.skillcap ?? {}) };
    if (f['shediao.ch2_done']) { inventory['shediao.yang_spear'] ??= 1; skills['shediao.yangqiang'] ??= 1; }
    if (f['shediao.ch3_done']) skills['quanzhen.jianfa'] ??= 1;
    if (f['shediao.ch5_done']) { skillcap['quanzhen.jianfa'] = Math.max(skillcap['quanzhen.jianfa'] ?? 0, 40); skillcap['shediao.yangqiang'] = Math.max(skillcap['shediao.yangqiang'] ?? 0, 30); }
    return { ...s, player: { ...s.player, inventory, skills, skillcap } };
  },
  // v10：天赋树重做成五条机制线，天赋点改由门派阶位和走完的主线给（D-107）。旧天赋全部退回
  9: (s) => ({ ...s, player: { ...s.player, talents: {} } }),
};

/** 已开始的主线 id（用于决定加载哪些内容） */
export function startedStorylines(state) {
  return Object.keys(state?.flags ?? {}).filter((k) => k.endsWith('.started')).map((k) => k.slice(0, -'.started'.length));
}

function migrate(state) {
  if (typeof state?.v !== 'number') throw new Error('不是有效的存档');
  if (state.v > SAVE_VERSION) throw new Error('存档来自更新版本的游戏，请先刷新页面');
  while (state.v < SAVE_VERSION) {
    state = migrations[state.v](state);
    state.v++;
  }
  return state;
}

export function saveLocal(state) {
  state.updatedAt = Date.now();
  try {
    localStorage.setItem(SLOT_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // 隐私模式或存储被禁用：游戏照常进行，只是不能自动存档
  }
}

export function loadLocal() {
  try {
    const raw = localStorage.getItem(SLOT_KEY);
    return raw ? migrate(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function clearLocal() {
  try { localStorage.removeItem(SLOT_KEY); } catch { /* 忽略 */ }
}

// ---- 导出 / 导入 ----
// 格式：WXMUD1:<base64(deflate(json))>:<校验码>
// 校验码仅用于发现复制粘贴损坏，不是防篡改。

async function pipe(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromBase64(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

// FNV-1a 32 位，足够检测传输损坏
function checksum(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export async function exportText(state) {
  const json = new TextEncoder().encode(JSON.stringify(state));
  const body = toBase64(await pipe(json, new CompressionStream('deflate')));
  return `${EXPORT_TAG}:${body}:${checksum(body)}`;
}

export async function importText(text) {
  const parts = text.replace(/\s+/g, '').split(':');
  if (parts.length !== 3 || parts[0] !== EXPORT_TAG) throw new Error('无法识别的存档文本');
  const [, body, sum] = parts;
  if (checksum(body) !== sum) throw new Error('存档文本已损坏（可能复制不完整）');
  const json = await pipe(fromBase64(body), new DecompressionStream('deflate'));
  return migrate(JSON.parse(new TextDecoder().decode(json)));
}
