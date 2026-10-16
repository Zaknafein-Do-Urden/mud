// 战斗引擎：纯逻辑。战斗状态是普通对象，可以直接写进存档（刷新页面后接着打）。
// 规则见 COMBAT.md：同时出招、刚巧守相克、内力、预兆与虚招。
// 随机数由战斗自带的种子产生，便于联机时由主机统一结算（D-008）。

import { STANCES, parseNums, innerOf, maxHp, maxMp, speed, innerBonus, movesOf } from './character.js';
import { parseList } from './content.js';
import { tal } from './talents.js';

// 攻方势 × 受方姿态 → 伤害倍率（COMBAT.md §4.2，D-017：先用 1.5 / 0.5）
const MULT = {
  刚: { 刚: 1.0, 巧: 0.5, 守: 1.5, 无: 1.2 },
  巧: { 刚: 1.5, 巧: 1.0, 守: 0.5, 无: 1.2 },
};
const OUTCOME = {
  '刚守': '$n的守势被这一招硬生生震开！（破防）',
  '刚巧': '$n身形一晃，这一招大半落了空。（落空）',
  '巧刚': '$n招式未发，已被抢先击中！（抢攻）',
  '巧守': '$n双手一圈，将这一招化去大半。（化解）',
};
const OMEN = {
  刚: '$N深吸一口气，劲力缓缓聚向双臂……',
  巧: '$N脚下碎步游走，手上虚虚实实……',
  守: '$N沉腰坐马，双臂护在身前……',
};
const PARTS = ['胸口', '小腹', '肩头', '左臂', '右臂', '后心', '面门', '腰间', '膝弯'];
const REST_RATE = 0.1;

// ---- 随机数（mulberry32，状态存在 battle.seed 中）----
function rand(b) {
  b.seed = (b.seed + 0x6d2b79f5) | 0;
  let t = b.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (b, arr) => arr[Math.floor(rand(b) * arr.length)];

const num = (v, d = 0) => (v === undefined || v === '' ? d : Number(v));
const alive = (u) => u.hp > 0;

function fill(tpl, ctx) {
  return tpl
    .replaceAll('$N', ctx.N ?? '')
    .replaceAll('$n', ctx.n ?? '')
    .replaceAll('$招', ctx.move ?? '')
    .replaceAll('$部位', ctx.part ?? '');
}

/** 招式的完整信息 */
export function moveInfo(db, moveId) {
  const m = db.move[moveId];
  const sk = db.skill[m.props.skill];
  return {
    id: moveId,
    name: m.props.name,
    skill: m.props.skill,
    skillName: sk?.props.name ?? '',
    stance: sk?.props.stance,
    power: num(m.props.power),
    mp: num(m.props.mp),
    effects: parseList(m.props.effects),
    omen: m.props.omen,
    text: m.lines.map((l) => l.text).join(''),
  };
}

// ---- 建立战斗 ----

function playerUnit(db, p) {
  const inner = innerOf(db, p);
  const mhp = maxHp(db, p);
  return {
    key: 'p0', side: 'p', name: '你', isPlayer: true,
    hp: p.hp ?? mhp, maxHp: mhp, mp: maxMp(db, p), maxMp: maxMp(db, p),
    speed: speed(db, p), innerLv: inner.lv, innerId: inner.id, wuxing: p.attrs.悟性,
    skills: { ...p.skills }, outer: [...p.loadout.outer], light: p.loadout.light,
    talents: { ...(p.talents ?? {}) },
    status: {}, intent: null,
    used: {}, // 各武功本场使用次数（战后折算实战经验）
    rounds: 0, // 本场运功回合数（内功、轻功的经验）
  };
}

function enemyUnit(db, foe, i) {
  const attrs = parseNums(foe.props.attrs);
  const skills = parseNums(foe.props.skills);
  const innerId = Object.keys(skills).find((id) => db.skill[id]?.props.kind === '内功') ?? null;
  const innerLv = innerId ? skills[innerId] : 0;
  const innerSk = innerId ? db.skill[innerId] : null;
  const gg = attrs.根骨 ?? 15;
  const mhp = Math.round((100 + gg * 5 + innerLv * num(innerSk?.props.hp, 6)) * num(foe.props.hpx, 1));
  const mmp = Math.round(50 + gg * 2 + innerLv * num(innerSk?.props.mp, 8));
  return {
    key: 'e' + i, side: 'e', name: foe.props.name, foe: foe.id,
    hp: mhp, maxHp: mhp, mp: mmp, maxMp: mmp,
    speed: attrs.身法 ?? 15, innerLv, innerId, wuxing: attrs.悟性 ?? 10,
    skills, outer: Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功'),
    cunning: num(foe.props.cunning), ai: parseNums(foe.props.ai), pattern: parseList(foe.props.pattern), patIdx: 0,
    potential: num(foe.props.potential),
    level: avgLevel(skills),
    status: {}, intent: null,
  };
}

function avgLevel(skills) {
  const lvs = Object.values(skills);
  return lvs.length ? lvs.reduce((a, c) => a + c, 0) / lvs.length : 1;
}

/** 创建战斗。battleBlock 来自内容中的 battle 块 */
export function createBattle(db, battleBlock, player, seed) {
  const foes = parseList(battleBlock.props.enemies).map((id) => db.enemy[id]);
  const units = foes.map((f, i) => enemyUnit(db, f, i));
  // 同名敌人加上甲乙丙，便于在文字里区分
  const LABEL = '甲乙丙丁戊己庚辛';
  for (const name of new Set(units.map((u) => u.name))) {
    const same = units.filter((u) => u.name === name);
    if (same.length > 1) same.forEach((u, i) => { u.name = name + LABEL[i]; });
  }
  return {
    id: battleBlock.id,
    seed: seed | 0,
    round: 0,
    foeLv: Math.max(1, ...units.map((u) => u.level)), // 对手水平，用于折算实战经验
    units: [playerUnit(db, player), ...units],
    over: null,
    lastTarget: null,
  };
}

// ---- 可选招式 ----

/** 某单位当前可用的全部招式（按装备顺序） */
export function unitMoves(db, u) {
  return u.outer.flatMap((sid) => movesOf(db, sid, u.skills[sid] ?? 0).map((m) => ({ ...moveInfo(db, m.id), lv: u.skills[sid] ?? 0 })));
}

export const playerUnitOf = (b) => b.units.find((u) => u.isPlayer);
export const enemiesOf = (b) => b.units.filter((u) => u.side === 'e');

// ---- 回合开始：敌人决定意图，透露预兆 ----

function chooseEnemyIntent(db, b, u) {
  const moves = unitMoves(db, u).filter((m) => m.mp <= u.mp);
  if (!moves.length) return { type: 'rest' };
  const stances = STANCES.filter((s) => moves.some((m) => m.stance === s));
  let stance;
  if (u.pattern.length) {
    stance = u.pattern[u.patIdx++ % u.pattern.length];
    if (!stances.includes(stance)) stance = pick(b, stances);
  } else {
    const weights = stances.map((s) => u.ai[s] ?? 1);
    let r = rand(b) * weights.reduce((a, c) => a + c, 0);
    stance = stances.find((s, i) => (r -= weights[i]) < 0) ?? stances[0];
  }
  // 该势中威力最大的招式
  const move = moves.filter((m) => m.stance === stance).sort((a, c) => c.power - a.power)[0];
  const foes = b.units.filter((x) => x.side !== u.side && alive(x));
  const target = stance === '守' ? u.key : pick(b, foes).key;
  return { type: 'move', move: move.id, stance, target };
}

export function beginRound(db, b, emit) {
  b.round++;
  emit('round', `【第 ${b.round} 回合】`);
  const me = playerUnitOf(b);
  for (const u of enemiesOf(b).filter(alive)) {
    u.intent = u.status.点穴 ? { type: 'stunned' } : chooseEnemyIntent(db, b, u);
    if (u.intent.type === 'stunned') { emit('omen', `${u.name}穴道受制，僵立当场。`); continue; }
    if (u.intent.type === 'rest') { emit('omen', `${u.name}气息粗重，似乎想要调匀内息。`); continue; }
    // 虚招：显示另一种势的预兆
    let shown = u.intent.stance;
    const feint = rand(b) * 100 < u.cunning;
    if (feint) shown = pick(b, STANCES.filter((s) => s !== shown));
    const sample = unitMoves(db, u).find((m) => m.stance === shown && m.omen);
    emit('omen', fill(sample?.omen ?? OMEN[shown], { N: u.name }));
    // 看破：只给看破的人看（D-017）
    if (feint && rand(b) * 100 < me.wuxing * 2 + 10 * tal(me, 'huiyan')) emit('hint', `你察觉${u.name}的气息与架势并不相合……`);
  }
}

// ---- 玩家出招 ----

/**
 * 解析玩家输入：'3'、'3 2'（第 2 个敌人）、'0' / '调息'。
 * 返回错误信息字符串，或 null 表示已设定意图。
 */
export function setPlayerIntent(db, b, input) {
  const me = playerUnitOf(b);
  if (me.status.点穴) { me.intent = { type: 'stunned' }; return null; }
  const [a, t] = input.trim().split(/\s+/);
  if (a === '0' || a === '调息') { me.intent = { type: 'rest' }; return null; }
  const moves = unitMoves(db, me);
  const m = moves[Number(a) - 1];
  if (!m) return '没有这一招。输入招式编号，0 为调息。';
  if (m.mp > me.mp) return `内力不足（需要 ${m.mp}，现有 ${me.mp}）。可以输入 0 调息。`;
  const foes = enemiesOf(b).filter(alive);
  let target;
  if (m.stance === '守') target = me.key;
  else if (t) {
    target = (foes[Number(t) - 1] ?? foes.find((f) => f.name === t))?.key;
    if (!target) return '没有这个对手。';
  } else target = foes.find((f) => f.key === b.lastTarget)?.key ?? foes[0].key;
  b.lastTarget = target;
  me.intent = { type: 'move', move: m.id, stance: m.stance, target };
  return null;
}

// ---- 结算 ----

export function resolveRound(db, b, emit) {
  const units = b.units.filter(alive);
  const byKey = Object.fromEntries(b.units.map((u) => [u.key, u]));
  const posture = {};
  const protects = {};
  const sayN = (u) => u.name;

  // ① 被点穴的、调息的
  for (const u of units) {
    if (u.status.点穴) { u.intent = { type: 'stunned' }; delete u.status.点穴; }
    if (u.intent?.type === 'stunned') {
      if (u.isPlayer) emit('fx', '你穴道受制，动弹不得！');
      posture[u.key] = '无';
    } else if (u.intent?.type === 'rest') {
      const gain = Math.min(u.maxMp - u.mp, Math.round(u.maxMp * (REST_RATE + 0.03 * tal(u, 'tuna'))));
      u.mp += gain;
      posture[u.key] = '无';
      emit('fx', `${sayN(u)}盘膝调息，内力略有恢复。（内力 +${gain}）`);
    }
  }

  // ② 守势
  for (const u of units) {
    if (u.intent?.type !== 'move' || u.intent.stance !== '守') continue;
    const m = moveInfo(db, u.intent.move);
    if (u.mp < m.mp) { posture[u.key] = '无'; emit('fx', `${sayN(u)}内力不济，守势未能摆开。`); continue; }
    u.mp -= m.mp;
    if (u.used) u.used[m.skill] = (u.used[m.skill] ?? 0) + 1;
    posture[u.key] = '守';
    const guarded = byKey[u.intent.target];
    if (guarded && guarded !== u) protects[guarded.key] = u.key;
    emit('act', fill(m.text || '$N使出「$招」，守住门户。', { N: sayN(u), n: guarded?.name, move: m.name }));
  }
  for (const u of units) if (u.intent?.type === 'move' && u.intent.stance !== '守') posture[u.key] = u.intent.stance;

  // ③④ 巧招先、刚招后，各自按身法排序
  const order = ['巧', '刚'].flatMap((st) => units
    .filter((u) => u.intent?.type === 'move' && u.intent.stance === st)
    .map((u) => ({ u, tie: rand(b) }))
    .sort((x, y) => y.u.speed - x.u.speed || x.tie - y.tie)
    .map((x) => x.u));

  for (const u of order) {
    if (!alive(u)) continue;
    const m = moveInfo(db, u.intent.move);
    if (u.mp < m.mp) { emit('fx', `${sayN(u)}内力不济，招式使到一半便泄了气。`); continue; }
    u.mp -= m.mp;
    if (u.used) u.used[m.skill] = (u.used[m.skill] ?? 0) + 1;
    let target = byKey[u.intent.target];
    if (!target || !alive(target)) target = b.units.find((x) => x.side !== u.side && alive(x));
    if (!target) continue;
    // 护法：改打护法者
    const guard = byKey[protects[target.key]];
    if (guard && alive(guard) && guard !== u) {
      emit('fx', `${guard.name}抢上一步，挡在${target.name}身前。`);
      target = guard;
    }
    attack(db, b, u, target, m, posture[target.key] ?? '无', emit);
    if (enemiesOf(b).every((e) => !alive(e)) || !alive(playerUnitOf(b))) break;
  }

  // ⑤ 回合结束：内伤
  for (const u of b.units) if (u.isPlayer && alive(u)) u.rounds++;
  for (const u of b.units.filter(alive)) {
    if (u.status.内伤 > 0) {
      const d = Math.min(u.hp, u.status.内伤dot ?? 5);
      u.hp -= d;
      emit('fx', `${sayN(u)}内伤发作，脸色一白。（气血 -${d}）`);
      if (--u.status.内伤 <= 0) { delete u.status.内伤; delete u.status.内伤dot; }
      if (!alive(u)) emit('fx', `${sayN(u)}支撑不住，倒在地上。`);
    }
    u.intent = null;
  }

  if (enemiesOf(b).every((e) => !alive(e))) b.over = 'win';
  else if (!alive(playerUnitOf(b))) b.over = 'lose';
}

function attack(db, b, u, target, m, tPosture, emit) {
  const ctx = { N: u.name, n: target.name, move: m.name, part: pick(b, PARTS) };
  emit('act', fill(m.text || '$N使出一招「$招」，攻向$n$部位。', ctx));

  const innerSk = u.innerId ? db.skill[u.innerId] : null;
  const talentPower = 1 + 0.04 * (m.stance === '刚' ? tal(u, 'manli') : tal(u, 'ruili'));
  const value = m.power * (1 + (u.skills[m.skill] ?? 0) * 0.02) * innerBonus(u.innerLv, innerSk, m.stance) * talentPower;
  let mult = MULT[m.stance][tPosture] ?? 1;
  // 天赋对克制倍率的修正（D-044）
  if (m.stance === '刚' && tPosture === '守') {
    if (tal(u, 'pojia')) mult = 1.8;
    if (tal(target, 'taishan')) mult *= 1.3 / 1.5;
  }
  if (m.stance === '刚' && tPosture === '巧' && tal(u, 'wangqian')) mult = 0.65;
  if (m.stance === '巧' && tPosture === '守' && tal(u, 'youren')) mult = 0.65;
  const armor = 100 / (100 + target.innerLv);
  const flaw = target.status.破绽 ? 1.3 : 1;
  if (flaw > 1) delete target.status.破绽;
  const dmg = Math.max(1, Math.round(value * mult * armor * flaw * (0.9 + rand(b) * 0.2)));

  const outcome = OUTCOME[m.stance + tPosture];
  if (outcome) emit('tag', fill(outcome, ctx));
  else if (tPosture === '无') emit('tag', fill('$n门户大开，结结实实挨了这一下。', ctx));
  target.hp = Math.max(0, target.hp - dmg);
  emit('hit', `${target.name}${woundText(dmg / target.maxHp)}。（气血 -${dmg}）`, { target: target.key });

  // 招式附加效果：只在没有被克制时生效
  if (mult >= 1 && alive(target)) {
    for (const e of m.effects) {
      const [kind, k] = e.split(':');
      if (kind === '内伤') { target.status.内伤 = 3; target.status.内伤dot = Math.max(3, Math.round(dmg * 0.2 * (1 + 0.25 * tal(u, 'zhongchuang')))); emit('fx', `${target.name}受了内伤。`); }
      else if (kind === '点穴') { target.status.点穴 = 1; emit('fx', `${target.name}被点中穴道，下一回合动弹不得！`); }
      else if (kind === '破绽') { target.status.破绽 = 1; emit('fx', `${target.name}露出了破绽。`); }
      else if (kind === '吸内' || kind === '化内') {
        const drain = Math.min(target.mp, Math.round(dmg * num(k, 1)));
        target.mp -= drain;
        if (kind === '吸内') u.mp = Math.min(u.maxMp, u.mp + Math.round(drain / 2));
        emit('fx', `${target.name}只觉内力源源外泄！（内力 -${drain}）`);
      }
    }
  }

  // 守势化解巧招：反震
  if (m.stance === '巧' && tPosture === '守' && alive(u)) {
    const gm = target.intent?.type === 'move' ? moveInfo(db, target.intent.move) : null;
    if (gm) {
      const tInner = target.innerId ? db.skill[target.innerId] : null;
      const counter = gm.power * (1 + (target.skills[gm.skill] ?? 0) * 0.02) * innerBonus(target.innerLv, tInner, '守');
      const cd = Math.max(1, Math.round(counter * (100 / (100 + u.innerLv)) * (1 + 0.25 * tal(target, 'fanzhen')) * (tal(u, 'youren') ? 0.5 : 1)));
      u.hp = Math.max(0, u.hp - cd);
      emit('tag', `反震之力直透${u.name}臂膀！（气血 -${cd}）`);
      if (!alive(u)) emit('fx', `${u.name}倒在地上。`);
    }
  }
  if (!alive(target)) emit('fx', `${target.name}倒地不起。`);
}

function woundText(ratio) {
  if (ratio < 0.05) return '只是擦破了点皮';
  if (ratio < 0.12) return '受了点轻伤';
  if (ratio < 0.25) return '受创不轻';
  return '一口鲜血喷了出来';
}

/** 气血的文字描述（敌人只显示文字状态，不显示具体数值之外的信息） */
export function hpText(u) {
  const r = u.hp / u.maxHp;
  if (u.hp <= 0) return '倒地';
  if (r > 0.8) return '神完气足';
  if (r > 0.5) return '略有损伤';
  if (r > 0.25) return '受创不轻';
  return '摇摇欲坠';
}

/**
 * 晋阶考核：与一位"势均力敌"的同门过招。对手照搬玩家当前的属性、武功和装备（SECT.md §3）。
 */
export function createExamBattle(db, player, examinerName, exam, seed) {
  const me = playerUnit(db, player);
  me.hp = me.maxHp; // 考核前师父让你调息好
  const mirror = {
    ...structuredClone(me),
    key: 'e0', side: 'e', name: examinerName, isPlayer: false, used: undefined,
    cunning: 20, ai: {}, pattern: [], patIdx: 0, potential: 0,
    level: avgLevel(Object.fromEntries(me.outer.map((id) => [id, me.skills[id] ?? 1]))),
  };
  return { id: '__exam__', exam, seed: seed | 0, round: 0, foeLv: mirror.level, units: [me, mirror], over: null, lastTarget: null };
}

/**
 * 按水平生成敌人的战斗（如劫匪）：以 enemy 模板为蓝本，武功等级都换成 level。
 * meta 会挂在战斗对象上（如 {robbery: {...}}），供战后处理。
 */
export function createScaledBattle(db, foeIds, level, meta, seed) {
  const lv = Math.max(1, Math.round(level));
  const units = foeIds.map((id, i) => {
    const foe = db.enemy[id];
    const scaled = {
      ...foe,
      props: {
        ...foe.props,
        skills: Object.keys(parseNums(foe.props.skills)).map((s) => `${s}=${lv}`).join(', '),
        attrs: `根骨=${12 + Math.floor(lv / 4)}, 身法=${12 + Math.floor(lv / 5)}, 悟性=10`,
        potential: String(Math.round(lv * 2.5)),
      },
    };
    return enemyUnit(db, scaled, i);
  });
  const LABEL = '甲乙丙丁';
  if (units.length > 1) units.forEach((u, i) => { u.name += LABEL[i]; });
  const player = meta.player;
  delete meta.player;
  return { id: '__scaled__', ...meta, seed: seed | 0, round: 0, foeLv: lv, units: [playerUnit(db, player), ...units], over: null, lastTarget: null };
}
