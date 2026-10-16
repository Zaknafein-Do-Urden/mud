// 角色数值：派生属性、武功上限、装备栏。纯函数，供引擎和战斗使用。见 COMBAT.md §2、SECT.md §4。

import { tal } from './talents.js';

export const STANCES = ['刚', '巧', '守'];
export const MAX_OUTER = 4;
export const BASE_CAP = 50; // 基础武功上限

const num = (v, d = 0) => (v === undefined || v === '' ? d : Number(v));

/** 'a=1, b=2' → {a: 1, b: 2}（数值） */
export function parseNums(s = '') {
  const out = {};
  for (const part of s.split(',')) {
    const [k, v] = part.split('=').map((x) => x.trim());
    if (k) out[k] = Number(v ?? 0);
  }
  return out;
}

export function newPlayer(startRoom) {
  return {
    name: '无名氏',
    surname: '',
    given: '',
    gender: '男',
    room: startRoom,
    attrs: { 根骨: 20, 身法: 20, 悟性: 20 },
    hp: null, // null 表示满血（首次计算时填入）
    potential: 0,
    inventory: {},
    money: 200, // 身上的现钱（文）
    bank: 0, // 钱庄存款
    cargo: {}, // 马车上的货物 {goodsId: 件数}
    // 开局只会一门庄稼把式；其他基础武功去城里的武馆花钱学（D-061）
    skills: { 'base.quan': 10 },
    loadout: { outer: ['base.quan'], inner: null, light: null },
    exp: {}, // 武功实战经验 {skillId: exp}
    sect: null, // {id, rep, rank}
    formerSects: [], // 叛出过的门派（不能再回去）
    frozen: {}, // 叛师后被冻结的武功 {skillId: true}：不能再提升
    lastInn: null,
    talents: {}, // 天赋 {天赋id: 等级}（D-044）
    equip: { weapon: null }, // 装备的兵器（物品 id，D-057）
  };
}

/** 角色当前的内功、轻功等级 */
export function innerOf(db, p) {
  const id = p.loadout.inner;
  return { id, lv: id ? p.skills[id] ?? 0 : 0, skill: id ? db.skill[id] : null };
}

/** 所有已学内功的等级 × 系数之和：内功增加的气血、内力是永久的，与当前装备哪门内功无关 */
function innerSum(db, p, prop, dflt) {
  let sum = 0;
  for (const [id, lv] of Object.entries(p.skills)) {
    const sk = db.skill[id];
    if (sk?.props.kind === '内功') sum += lv * num(sk.props[prop], dflt);
  }
  return sum;
}

export function maxHp(db, p) {
  return Math.round((100 + p.attrs.根骨 * 5 + innerSum(db, p, 'hp', 6)) * (1 + 0.05 * tal(p, 'tiegu')));
}

export function maxMp(db, p) {
  return Math.round(50 + p.attrs.根骨 * 2 + innerSum(db, p, 'mp', 8));
}

/** 已学内功中的最高等级（用于外功上限：内功根基决定外功能练多高） */
export function bestInnerLv(db, p) {
  return Math.max(0, ...Object.entries(p.skills).filter(([id]) => db.skill[id]?.props.kind === '内功').map(([, lv]) => lv));
}

/** 身法：先天身法 + 轻功等级 / 4 */
export function speed(db, p) {
  const id = p.loadout.light;
  return p.attrs.身法 + (id ? Math.floor((p.skills[id] ?? 0) / 4) : 0) + 2 * tal(p, 'xunjie');
}

/** 内功威力加成（含亲和势） */
export function innerBonus(innerLv, innerSkill, stance) {
  let b = 1 + innerLv * 0.01;
  if (innerSkill && innerSkill.props.affinity === stance) b += innerLv * 0.005;
  return b;
}

/** 武功等级上限：取 内功+20（外功/轻功）、门派阶位上限、典籍上限 中的最小值。叛师后冻结的武功不能再升 */
export function skillCap(db, p, id) {
  const sk = db.skill[id];
  if (!sk) return 0;
  if (p.frozen?.[id]) return p.skills[id] ?? 0;
  const caps = [];
  if (sk.props.kind !== '内功') caps.push(bestInnerLv(db, p) + 20);
  if (id.startsWith('base.')) caps.push(BASE_CAP);
  else if (sk.props.sect) {
    const sect = db.sect[sk.props.sect];
    const mine = p.sect?.id === sk.props.sect;
    const rankCaps = (sect?.props.caps ?? '').split(',').map(Number);
    caps.push(mine ? rankCaps[p.sect.rank] ?? 0 : num(sk.props.cap, 0));
  } else {
    // 门派之外的武功：典籍上限；剧情可以用 cap 效果提高（如独门武功随章节解锁）
    caps.push(Math.max(num(sk.props.cap, 100), p.skillcap?.[id] ?? 0));
  }
  return Math.min(...caps);
}

/** 修炼一级所需潜能 */
export function trainCost(p, lv) {
  return Math.ceil((lv + 1) * 5 * (20 / p.attrs.悟性));
}

/** 某门武功已解锁的招式 */
export function movesOf(db, skillId, lv) {
  return Object.values(db.move)
    .filter((m) => m.props.skill === skillId && num(m.props.level) <= lv)
    .sort((a, b) => num(a.props.level) - num(b.props.level));
}

/** 门派的阶位表 [{name, rep}] */
export function sectRanks(sect) {
  return (sect?.props.ranks ?? '').split(',').map((x) => {
    const [name, rep] = x.split('=').map((s) => s.trim());
    return { name, rep: Number(rep) };
  }).filter((r) => r.name);
}

// ---- 实战经验（D-035）----
// 战斗中用哪门武功，哪门武功就长经验。对手越强（相对于这门武功的等级），长得越快，
// 于是"用 1 级的门派武功还是 10 级的基础武功"成为一个取舍：眼前的胜算，还是长远的成长。

/** 升到下一级所需经验 */
export function expNeed(lv) {
  return (lv + 1) * 20;
}

/** 每用一次招式（或内功、轻功运转一回合）获得的经验 */
export function expPerUse(foeLv, skillLv) {
  const r = Math.min(3, Math.max(0.2, foeLv / Math.max(1, skillLv)));
  return Math.round(10 * r);
}

/** 增加经验并处理升级（受上限限制，到顶后经验不再累积）。返回升了几级 */
export function gainExp(db, p, id, amount) {
  if (p.skills[id] === undefined || amount <= 0) return 0;
  p.exp ??= {};
  let gained = 0;
  let exp = (p.exp[id] ?? 0) + amount;
  while (p.skills[id] < skillCap(db, p, id) && exp >= expNeed(p.skills[id])) {
    exp -= expNeed(p.skills[id]);
    p.skills[id]++;
    gained++;
  }
  p.exp[id] = p.skills[id] >= skillCap(db, p, id) ? 0 : exp;
  return gained;
}

// ---- 兵器（D-057）----

/** 需要相应兵器才能施展的武功类型 */
export const ARMED = ['刀', '剑', '棍', '鞭'];

/** 物品是否是兵器 */
export const isWeaponItem = (db, id) => db.item[id]?.props.slot === 'weapon';

/** 身上装备的兵器（物品块），没有或不在背包里则为 null */
export function weaponOf(db, p) {
  const id = p.equip?.weapon;
  return id && (p.inventory?.[id] ?? 0) > 0 && db.item[id] ? db.item[id] : null;
}
