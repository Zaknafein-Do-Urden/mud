// 战斗引擎：纯逻辑。战斗状态是普通对象，可以直接写进存档（刷新页面后接着打）。
// 规则见 COMBAT.md：同时出招、刚巧守相克、内力、预兆与虚招。
// 随机数由战斗自带的种子产生，便于联机时由主机统一结算（D-008）。

import { STANCES, parseNums, innerOf, maxHp, maxMp, speed, innerBonus, movesOf, ARMED, weaponOf, isWeaponItem } from './character.js';
import { parseList } from './content.js';
import { tal } from './talents.js';
import { ATTACK, OMEN as WEAPON_OMEN, WEAPON_NAME } from './weapons.js';

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
// 通用预兆文案：每种势多种写法，每次随机挑一种（D-050）。招式自己写的 omen 也会混进来。
const OMENS = {
  刚: [
    '$N深吸一口气，劲力缓缓聚向双臂……',
    '$N双脚踏地，脚下的尘土被震得微微扬起……',
    '$N肩膀一沉，筋骨咯咯作响，像一张拉满的弓……',
    '$N瞪圆了眼睛，一股凶悍之气扑面而来……',
    '$N把全身的分量都压到了前脚上……',
    '$N拳头攥得发白，手臂上青筋一根根暴起……',
    '$N闷哼一声，衣袖鼓荡，似有千斤之力蓄在其中……',
    '$N缓缓抬起手来，动作虽慢，却带着一股压迫……',
  ],
  巧: [
    '$N脚下碎步游走，手上虚虚实实……',
    '$N身形一晃，忽左忽右，叫人捉摸不定……',
    '$N手腕轻抖，指尖像蝴蝶一样上下翻飞……',
    '$N眼珠骨碌一转，嘴角浮起一丝狡黠……',
    '$N足尖点地，整个人轻飘飘地绕着你转起圈来……',
    '$N五指并拢，似指似掌，专往你身上的空隙里瞄……',
    '$N身子一矮，像一只伺机而动的狸猫……',
    '$N袖口微动，手已不知藏到了何处……',
  ],
  守: [
    '$N沉腰坐马，双臂护在身前……',
    '$N收住脚步，周身上下守得滴水不漏……',
    '$N双手交叠于胸前，气息悠长，似在以逸待劳……',
    '$N眯起眼睛，一动不动，只等你先出手……',
    '$N退了半步，重心压得极低，稳如磐石……',
    '$N两臂缓缓画圈，把门户封得严严实实……',
    '$N屏住呼吸，肌肉绷紧，摆出一副挨打的架势……',
    '$N双掌一前一后，护住了周身要害……',
  ],
};
// 看不出端倪的预兆：强敌（obscure）用，要靠悟性、慧眼看穿（D-050）
const OMEN_VAGUE = [
  '$N神色如常，看不出半点端倪……',
  '$N的身形忽然变得模糊起来，招式藏而不露……',
  '$N气息内敛，动静之间毫无破绽可寻……',
  '$N似动非动，叫人猜不透下一步……',
  '$N眼神一凝，周身却没有半分多余的动作……',
  '$N的架势平平无奇，偏偏又处处藏着后手……',
];
const OMEN_REST = [
  '$N气息粗重，似乎想要调匀内息。',
  '$N额头见汗，脚步也慢了下来。',
  '$N退开一步，胸口起伏不定。',
  '$N暗暗吸了一口长气，显然内力已有些不济。',
];
const STANCE_HINT = { 刚: '刚猛重招', 巧: '轻巧快招', 守: '守势' };
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
    .replaceAll('$W', ctx.W ?? '')
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
    stance: m.props.stance ?? sk?.props.stance, // 招式可以有自己的势（如庄稼把式三势俱全，D-070）
    weapon: sk?.props.weapon ?? '拳', // 武功用的兵器（D-052）
    support: m.props.support === 'true', // 辅助招式：作用在队友（或自己）身上（D-064）
    power: num(m.props.power),
    mp: num(m.props.mp),
    effects: parseList(m.props.effects),
    omen: m.props.omen,
    text: m.lines.map((l) => l.text).join(''),
  };
}

// ---- 建立战斗 ----

/**
 * 玩家单位。单人时名字是"你"；组队时用真名（每个接收者看到的文字再把自己的名字换成"你"，见 D-048）。
 */
function playerUnit(db, p, key = 'p0', pid = 'host', named = false) {
  const inner = innerOf(db, p);
  const mhp = maxHp(db, p);
  return {
    key, pid, side: 'p', name: named ? p.name : '你', isPlayer: true, lastTarget: null,
    hp: p.hp ?? mhp, maxHp: mhp, mp: maxMp(db, p), maxMp: maxMp(db, p),
    speed: speed(db, p), innerLv: inner.lv, innerId: inner.id, wuxing: p.attrs.悟性,
    skills: { ...p.skills }, outer: [...p.loadout.outer], light: p.loadout.light,
    talents: { ...(p.talents ?? {}) },
    // 兵器（D-057）：wtype 兵器类型，wbonus 伤害加成 %，wid 物品 id；disarmed 被缴械
    ...playerWeapon(db, p),
    // 轻功（D-062）：等级与已解锁的特性
    ...playerLight(db, p),
    bag: Object.keys(p.inventory ?? {}).filter((id) => isWeaponItem(db, id)),
    status: {}, intent: null,
    used: {}, // 各武功本场使用次数（战后折算实战经验）
    rounds: 0, // 本场运功回合数（内功、轻功的经验）
  };
}

function playerLight(db, p) {
  const id = p.loadout.light;
  const lv = id ? p.skills[id] ?? 0 : 0;
  // 特性写法：traits: 燕返@1, 回旋@30, 燕回巢@60（达到等级才生效）
  const traits = (id ? db.skill[id]?.props.traits ?? '' : '').split(',').map((t) => t.trim()).filter(Boolean)
    .map((t) => t.split('@')).filter(([, need]) => lv >= Number(need || 0)).map(([name]) => name);
  return { lightLv: lv, traits };
}

const hasTrait = (u, name) => !!u.traits?.includes(name);

function playerWeapon(db, p) {
  const w = weaponOf(db, p);
  return { wid: w?.id ?? null, wtype: w?.props.weapon ?? null, wbonus: num(w?.props.bonus), wname: w?.props.name ?? null, disarmed: false, dropped: null };
}

/** 招式是否需要兵器、此刻能否施展（D-057） */
export function canUse(u, m) {
  if (!ARMED.includes(m.weapon)) return true;
  if (u.isPlayer) return !u.disarmed && u.wtype === m.weapon;
  return !u.disarmed; // 敌人：没被缴械就能用
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
    weapon: foe.props.weapon ?? '拳', weaponName: foe.props.weaponName ?? WEAPON_NAME[foe.props.weapon ?? '拳'],
    hp: mhp, maxHp: mhp, mp: mmp, maxMp: mmp,
    speed: attrs.身法 ?? 15, innerLv, innerId, wuxing: attrs.悟性 ?? 10,
    skills, outer: Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功'),
    cunning: num(foe.props.cunning), obscure: num(foe.props.obscure), ai: parseNums(foe.props.ai), pattern: parseList(foe.props.pattern), patIdx: 0,
    potential: num(foe.props.potential),
    level: avgLevel(skills),
    status: {}, intent: null,
  };
}

function avgLevel(skills) {
  const lvs = Object.values(skills);
  return lvs.length ? lvs.reduce((a, c) => a + c, 0) / lvs.length : 1;
}

/** players：单个玩家对象，或组队时的 [{pid, player}]（第一个是房主） */
function playerUnits(db, players) {
  const list = Array.isArray(players) ? players : [{ pid: 'host', player: players }];
  const named = list.length > 1;
  return list.map((m, i) => playerUnit(db, m.player, 'p' + i, m.pid, named));
}

/** 组队时敌人气血按人数加成：× (1 + 0.7 × (人数 - 1))（COMBAT.md §9.4） */
function scaleForParty(units, n) {
  if (n <= 1) return;
  for (const u of units) { u.maxHp = Math.round(u.maxHp * (1 + 0.7 * (n - 1))); u.hp = u.maxHp; }
}

/** 创建战斗。battleBlock 来自内容中的 battle 块 */
export function createBattle(db, battleBlock, players, seed) {
  const foes = parseList(battleBlock.props.enemies).map((id) => db.enemy[id]);
  const units = foes.map((f, i) => enemyUnit(db, f, i));
  const pUnits = playerUnits(db, players);
  // NPC 队友（D-072）：战斗块写 allies，和玩家站在一边，由电脑出招；可以给他疗伤、加持，也能和他合击
  const allyUnits = parseList(battleBlock.props.allies).map((id, i) => ({ ...enemyUnit(db, db.enemy[id], i), key: 'a' + i, side: 'p', isAlly: true }));
  // 战斗块的 hpx：这一场战斗中敌人气血的倍率（用 tools/tune.mjs 调校，D-051）
  const bhpx = num(battleBlock.props.hpx, 1);
  if (bhpx !== 1) for (const u of units) { u.maxHp = Math.max(1, Math.round(u.maxHp * bhpx)); u.hp = u.maxHp; }
  scaleForParty(units, pUnits.length);
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
    units: [...pUnits, ...allyUnits, ...units],
    over: null,
  };
}

// ---- 可选招式 ----

/** 某单位当前可用的全部招式（按装备顺序） */
export function unitMoves(db, u) {
  return u.outer.flatMap((sid) => movesOf(db, sid, u.skills[sid] ?? 0).map((m) => ({ ...moveInfo(db, m.id), lv: u.skills[sid] ?? 0 })));
}

export const playerUnitOf = (b, pid = 'host') => b.units.find((u) => u.isPlayer && u.pid === pid);
export const playersOf = (b) => b.units.filter((u) => u.isPlayer);
/** 玩家一方的全部单位：玩家和 NPC 队友（D-072）。守招目标、合击都按这个算 */
export const teamOf = (b) => b.units.filter((u) => u.side === 'p');
/** 所有还站着的玩家都已出招（或被点穴） */
export const intentsReady = (b) => playersOf(b).filter(alive).every((u) => u.intent || u.status.点穴);
export const enemiesOf = (b) => b.units.filter((u) => u.side === 'e');

// ---- 回合开始：敌人决定意图，透露预兆 ----

function chooseEnemyIntent(db, b, u) {
  const moves = unitMoves(db, u).filter((m) => m.mp <= u.mp && canUse(u, m));
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
  for (const u of enemiesOf(b).filter(alive)) {
    u.intent = u.status.点穴 ? { type: 'stunned' } : chooseEnemyIntent(db, b, u);
    if (u.intent.type === 'stunned') { emit('omen', `${u.name}穴道受制，僵立当场。`); continue; }
    if (u.intent.type === 'rest') { emit('omen', fill(pick(b, OMEN_REST), { N: u.name })); continue; }
    const real = u.intent.stance;
    const sees = (me) => rand(b) * 100 < me.wuxing * 2 + 10 * tal(me, 'huiyan');
    // 藏招：强敌有一定概率不露任何预兆，只有看穿的人知道（D-050）
    if (rand(b) * 100 < u.obscure) {
      emit('omen', fill(pick(b, OMEN_VAGUE), { N: u.name }));
      for (const me of playersOf(b).filter(alive)) {
        // 洞察先机（D-107）：藏招对他无效
        if (tal(me, 'xianji') || sees(me)) emit('hint', `你看穿了${u.name}的意图：这一招是${STANCE_HINT[real]}（${real}）。`, { to: me.pid });
      }
      continue;
    }
    // 虚招：显示另一种势的预兆
    let shown = real;
    const feint = rand(b) * 100 < u.cunning;
    if (feint) shown = pick(b, STANCES.filter((s) => s !== shown));
    emit('omen', fill(omenText(db, b, u, shown), { N: u.name }));
    // 看破虚招：每位玩家各自判定，提示只给看破的人（D-017）
    if (feint) {
      for (const me of playersOf(b).filter(alive)) {
        if (sees(me)) emit('hint', `你察觉${u.name}的气息与架势并不相合……`, { to: me.pid });
      }
    }
  }
  // 料敌（D-107）：看出每个对手这一招打谁
  for (const me of playersOf(b).filter((x) => alive(x) && tal(x, 'liaodi'))) {
    for (const u of enemiesOf(b).filter(alive)) {
      if (u.intent?.type !== 'move' || u.intent.stance === '守') continue;
      const t = b.units.find((x) => x.key === u.intent.target);
      if (t) emit('hint', `（料敌）${u.name}这一招是冲着${t === me ? '你' : t.name}来的。`, { to: me.pid });
    }
  }
  // NPC 队友在敌人之后出招，并公开（D-072）
  for (const u of b.units.filter((x) => x.isAlly && alive(x))) {
    u.intent = u.status.点穴 ? { type: 'stunned' } : chooseAllyIntent(db, b, u);
    announceAlly(db, b, u, emit);
  }
}

/**
 * NPC 队友的出招（D-072）：挑一个敌人，一半的机会读对它的预兆、出克制它的势，否则按自己的路数。
 * 回合开始就决定并公开，玩家据此配合（合击、护法、辅助）。
 */
function chooseAllyIntent(db, b, u) {
  const moves = unitMoves(db, u).filter((m) => m.mp <= u.mp && canUse(u, m) && !m.support);
  const foes = enemiesOf(b).filter(alive);
  if (!moves.length || !foes.length) return { type: 'rest' };
  const foe = pick(b, foes);
  const stances = STANCES.filter((s) => moves.some((m) => m.stance === s));
  let stance;
  const want = foe.intent?.type === 'move' ? COUNTER[foe.intent.stance] : null;
  if (want && stances.includes(want) && rand(b) < 0.5) stance = want;
  else {
    const weights = stances.map((s) => u.ai[s] ?? 1);
    let r = rand(b) * weights.reduce((a, c) => a + c, 0);
    stance = stances.find((s, i) => (r -= weights[i]) < 0) ?? stances[0];
  }
  const move = moves.filter((m) => m.stance === stance).sort((a, c) => c.power - a.power)[0];
  return { type: 'move', move: move.id, stance, target: stance === '守' ? u.key : foe.key };
}

function announceAlly(db, b, u, emit) {
  const it = u.intent;
  if (it.type === 'stunned') return emit('team', `${u.name}穴道受制，这一回合动弹不得。`);
  if (it.type === 'rest') return emit('team', `${u.name}退开一步，调匀内息。`);
  const m = moveInfo(db, it.move);
  const target = b.units.find((x) => x.key === it.target);
  emit('team', `${u.name}准备使出「${m.name}」（${it.stance}）${it.stance === '守' ? '' : `，攻向${target?.name ?? '敌人'}`}。`);
}

/** 预兆文字：该势招式自己写的 omen（可用 | 分隔多种）与通用文案混在一起随机挑 */
function omenText(db, b, u, stance) {
  const weapon = u.weapon ?? '拳';
  // 只用和自己兵器一致的武功的预兆，再混入该兵器的通用预兆（D-052）
  const own = unitMoves(db, u).filter((m) => m.stance === stance && m.omen && m.weapon === weapon)
    .flatMap((m) => m.omen.split('|').map((s) => s.trim()).filter(Boolean));
  const general = weapon === '拳' ? OMENS[stance] : WEAPON_OMEN[weapon]?.[stance] ?? OMENS[stance];
  return pick(b, [...own, ...general]).replaceAll('$W', u.weaponName ?? '');
}

// ---- 玩家出招 ----

/**
 * 解析玩家输入：'3'、'3 2'（第 2 个敌人）、'0' / '调息'。
 * 返回错误信息字符串，或 null 表示已设定意图。
 */
export function setPlayerIntent(db, b, input, pid = 'host') {
  const me = playerUnitOf(b, pid);
  if (!me || !alive(me)) return '你已经倒下了，等队友结束这一战吧。';
  if (me.status.点穴) { me.intent = { type: 'stunned' }; return null; }
  const [a, t] = input.trim().split(/\s+/);
  if (a === '0' || a === '调息') { me.intent = { type: 'rest' }; return null; }
  // 换兵器：花掉这一回合（D-057）
  if (['换', '换兵器', 'wield'].includes(a)) {
    const id = me.bag.find((x) => x === t || db.item[x]?.props.name === t);
    if (!id) return `背包里没有「${t ?? ''}」这件兵器。`;
    if (id === me.dropped) return '那件兵器被打飞了，这一战捡不回来。';
    if (id === me.wid && !me.disarmed) return '你手里拿的就是它。';
    me.intent = { type: 'equip', item: id };
    return null;
  }
  const moves = unitMoves(db, me);
  const m = moves[Number(a) - 1];
  if (!m) return '没有这一招。输入招式编号，0 为调息。';
  if (!canUse(me, m)) return `施展「${m.name}」需要${m.weapon}${me.disarmed ? '（你的兵器被打飞了，可以换一件，或者用拳脚功夫）' : ''}。`;
  if (m.mp > me.mp && !(tal(me, 'qichen') && me.hp > (m.mp - me.mp) * 2)) return `内力不足（需要 ${m.mp}，现有 ${me.mp}）。可以输入 0 调息。`; // 气沉丹田可以拿气血补（D-107）
  const foes = enemiesOf(b).filter(alive);
  let target;
  if (m.stance === '守') {
    // 守招：默认护住自己；"@2" 表示第 2 位队友（1 是自己）。辅助招式作用在目标身上，普通守招则是护法（D-064）
    target = me.key;
    if (t?.startsWith('@')) {
      const allies = teamOf(b).filter(alive);
      const ally = allies[Number(t.slice(1)) - 1];
      if (!ally) return '没有这位队友。';
      target = ally.key;
    }
  } else if (t) {
    target = (foes[Number(t) - 1] ?? foes.find((f) => f.name === t))?.key;
    if (!target) return '没有这个对手。';
  } else target = foes.find((f) => f.key === me.lastTarget)?.key ?? foes[0].key;
  // 只有攻招才记成"上次打的对手"；守招的目标是自己或队友，记进去会让下回合默认目标跳回第一个敌人（D-100）
  if (m.stance !== '守') me.lastTarget = target;
  me.intent = { type: 'move', move: m.id, stance: m.stance, target };
  return null;
}

// ---- 结算 ----

export function resolveRound(db, b, emit) {
  const units = b.units.filter(alive);
  // 本回合谁打了谁、谁护了谁（合击判定用，D-065）
  for (const u of b.units) { u.roundHit = null; u.roundGuard = null; }
  const byKey = Object.fromEntries(b.units.map((u) => [u.key, u]));
  const posture = {};
  const protects = {};
  const sayN = (u) => u.name;

  // ① 被点穴的、调息的
  for (const u of units) {
    if (u.status.点穴) { u.intent = { type: 'stunned' }; if (--u.status.点穴 <= 0) delete u.status.点穴; }
    if (u.intent?.type === 'stunned') {
      if (u.isPlayer) emit('fx', '你穴道受制，动弹不得！');
      posture[u.key] = '无';
    } else if (u.intent?.type === 'equip') {
      const it = db.item[u.intent.item];
      Object.assign(u, { wid: it.id, wtype: it.props.weapon, wbonus: num(it.props.bonus), wname: it.props.name, disarmed: false });
      posture[u.key] = '无';
      emit('fx', `${sayN(u)}从行囊里抽出${it.props.name}，握在手中。`);
    } else if (u.intent?.type === 'rest') {
      // 吸内可能让内力暂时高过上限，这里不能回成负数
      const gain = Math.max(0, Math.min(u.maxMp - u.mp, Math.round(u.maxMp * (REST_RATE + (hasTrait(u, '回旋') ? 0.05 : 0)))));
      u.mp += gain;
      posture[u.key] = '无';
      // 调息疗伤（D-107）：同时恢复气血
      const heal = Math.min(u.maxHp - u.hp, Math.round(u.maxHp * 0.04 * tal(u, 'liaoshang')));
      u.hp += heal;
      emit('fx', `${sayN(u)}盘膝调息，内力略有恢复。（内力 +${gain}${heal > 0 ? `，气血 +${heal}` : ''}）`);
    }
  }

  // ② 守势
  for (const u of units) {
    if (u.intent?.type !== 'move' || u.intent.stance !== '守') continue;
    const m = moveInfo(db, u.intent.move);
    if (u.mp < m.mp && !payWithHp(u, m, emit)) { posture[u.key] = '无'; emit('fx', `${sayN(u)}内力不济，守势未能摆开。`); continue; }
    u.mp -= m.mp;
    if (u.used) u.used[m.skill] = (u.used[m.skill] ?? 0) + 1;
    posture[u.key] = '守';
    const guarded = byKey[u.intent.target];
    u.roundGuard = { target: guarded?.key, skill: m.skill };
    if (m.support) {
      // 辅助招式：疗伤、回气、振奋、护体、解穴（D-064）
      emit('act', fill(m.text || '$N运起「$招」，护住$n。', { N: sayN(u), n: guarded === u ? '自己' : guarded?.name, move: m.name }));
      applySupport(db, u, guarded ?? u, m, emit);
      continue;
    }
    if (guarded && guarded !== u) protects[guarded.key] = u.key;
    emit('act', fill(u.weapon ? actText(b, u, m) : (m.text || '$N使出「$招」，守住门户。'), { N: sayN(u), n: guarded?.name, move: m.name, W: u.weaponName }));
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
    if (u.mp < m.mp && !payWithHp(u, m, emit)) { emit('fx', `${sayN(u)}内力不济，招式使到一半便泄了气。`); continue; }
    u.mp -= m.mp;
    if (u.used) u.used[m.skill] = (u.used[m.skill] ?? 0) + 1;
    let target = byKey[u.intent.target];
    if (!target || !alive(target)) target = b.units.find((x) => x.side !== u.side && alive(x));
    if (!target) continue;
    // 护法：改打护法者
    const guard = byKey[protects[target.key]];
    let guardScale = 1;
    if (guard && alive(guard) && guard !== u) {
      emit('fx', `${guard.name}抢上一步，挡在${target.name}身前。`);
      target = guard;
      guardScale = 1 - 0.2 * tal(guard, 'hufa'); // 护法（D-107）
    }
    if (m.effects.some((e) => e.split(':')[0] === '群攻')) {
      // 群攻：打到所有对手，多人时每人六成伤害（D-081）
      const foes = b.units.filter((x) => x.side !== u.side && alive(x));
      const scale = foes.length > 1 ? AOE_RATE : 1;
      const list = [target, ...foes.filter((x) => x !== target)];
      list.forEach((t, i) => {
        if (i === 1) emit('tag', '这一招波及了所有对手！');
        attack(db, b, u, t, m, posture[t.key] ?? '无', emit, { scale, quiet: i > 0, primary: i === 0 });
      });
    } else attack(db, b, u, target, m, posture[target.key] ?? '无', emit, { scale: guardScale });
    if (enemiesOf(b).every((e) => !alive(e)) || playersOf(b).every((p) => !alive(p))) break;
  }

  // ④½ 合击（D-065）
  if (!b.over && enemiesOf(b).some(alive)) resolveCombos(db, b, emit);

  // ⑤ 回合结束：内伤
  for (const u of b.units) if (u.isPlayer && alive(u)) u.rounds++;
  // 生生不息（D-107）：队里有人点了，全队每回合回一点气血；小周天：自己每回合回一点内力
  for (const side of ['p', 'e']) {
    const team = b.units.filter((x) => x.side === side && alive(x));
    if (!team.some((x) => tal(x, 'shengsheng'))) continue;
    for (const x of team) x.hp = Math.min(x.maxHp, x.hp + Math.round(x.maxHp * 0.02));
    emit('fx', side === 'p' ? '一股暖意流遍周身，伤势缓了一缓。（生生不息）' : '对面的气色缓了过来。');
  }
  for (const u of b.units.filter((x) => alive(x) && tal(x, 'zhoutian'))) u.mp = Math.min(u.maxMp, u.mp + Math.round(u.maxMp * 0.02 * tal(u, 'zhoutian')));
  for (const u of b.units.filter(alive)) {
    if (u.status.护体 > 0 && --u.status.护体 <= 0) delete u.status.护体;
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
  else if (playersOf(b).every((p) => !alive(p))) b.over = 'lose';
  // 金创（D-107）：打赢后全队回 20% 气血
  if (b.over === 'win' && teamOf(b).some((x) => tal(x, 'jinchuang'))) {
    for (const x of teamOf(b).filter(alive)) x.hp = Math.min(x.maxHp, x.hp + Math.round(x.maxHp * 0.2));
    emit('fx', '战罢，你取出金创药，给众人裹好了伤。（金创：气血恢复两成）');
  }
}

/** u 的招克制了 target（D-107）：后发制人让对手露出破绽，吐纳回内力 */
function countered(b, u, target, emit) {
  if (alive(target) && !target.status.破绽 && rand(b) < 0.2 * tal(u, 'houfa')) {
    target.status.破绽 = 1;
    emit('fx', `${u.name}看准了空当，${target.name}露出了破绽。（后发制人）`);
  }
  const t = tal(u, 'tuna');
  if (t && alive(u)) u.mp = Math.min(u.maxMp, u.mp + Math.round(u.maxMp * 0.03 * t));
}

/** 气沉丹田（D-107）：内力不够时，不足的部分用两倍气血代替；气血不够就不行 */
function payWithHp(u, m, emit) {
  const cost = (m.mp - u.mp) * 2;
  if (!tal(u, 'qichen') || u.hp <= cost) return false;
  u.hp -= cost;
  u.mp = m.mp;
  emit('fx', `${u.name}内力已竭，硬提一口真气，以气血催动招式。（气血 -${cost}）`);
  return true;
}

/** 赤手空拳的敌人用了带兵器的武功时，用这些描述代替 */
const FIST = {
  刚: ['$N欺身而上，一拳轰向$n$部位！', '$N大喝一声，双掌齐推，撞向$n$部位！'],
  巧: ['$N身形一晃，一掌斜斜拍向$n$部位！', '$N五指如钩，抓向$n$部位！'],
  守: ['$N双臂护在身前，摆出守势。', '$N沉腰坐马，把门户守得严严实实。'],
};

/**
 * 出招描述（D-052）：敌人有兵器标签时，武功的兵器和敌人的兵器一致才用招式自己的描述，
 * 否则用该兵器的通用描述；赤手空拳的敌人用了兵器类武功，就用拳脚描述。玩家一律用招式描述。
 */
function actText(b, u, m) {
  if (!u.weapon) return m.text || '$N使出一招「$招」，攻向$n$部位。';
  if (m.weapon === u.weapon && m.text) return m.text;
  const pool = u.weapon === '拳' ? FIST : ATTACK[u.weapon];
  return pick(b, pool?.[m.stance] ?? FIST[m.stance]);
}

/** 群攻招式对多个对手时，每人受的伤害比例（D-081） */
const AOE_RATE = 0.6;

/** opts：scale 伤害比例（群攻）、quiet 不再重复出招描述、primary 是否主目标（只有主目标吃附加效果、记合击） */
/** 一招的攻击值：伤害公式里克制、护体、随机之前的部分（自适应也用它估算强度，D-106） */
function attackValue(db, u, m) {
  const innerSk = u.innerId ? db.skill[u.innerId] : null;
  const bonus = 1 + (u.isPlayer && m.weapon === u.wtype && !u.disarmed ? u.wbonus / 100 : 0) // 兵器加成（D-057）
    + (m.stance === '巧' ? (u.lightLv ?? 0) * 0.003 : 0); // 轻功：巧招 +0.3% / 级（D-062）
  return m.power * (1 + (u.skills[m.skill] ?? 0) * 0.02) * innerBonus(u.innerLv, innerSk, m.stance) * bonus;
}

function attack(db, b, u, target, m, tPosture, emit, opts = {}) {
  const ctx = { N: u.name, n: target.name, move: m.name, part: pick(b, PARTS), W: u.weaponName };
  if (!opts.quiet) emit('act', fill(actText(b, u, m), ctx));

  const innerSk = u.innerId ? db.skill[u.innerId] : null;
  const value = attackValue(db, u, m);
  let mult = MULT[m.stance][tPosture] ?? 1;
  // 轻功（D-062）：无势（调息、换兵器）时受伤倍率随轻功等级从 ×1.2 降到 ×1.0；回旋特性、定神天赋（D-107）直接免去
  if (tPosture === '无') mult = hasTrait(target, '回旋') || tal(target, 'dingshen') ? 1.0 : Math.max(1.0, mult - (target.lightLv ?? 0) * 0.004);
  // 凌空（D-107）：被克制时有机会闪开
  if (mult > 1 && tPosture !== '无' && rand(b) < 0.08 * tal(target, 'lingkong')) {
    emit('tag', fill('$n身子一飘，竟从招底下闪了开去！（凌空）', ctx));
    return;
  }
  // 燕回巢：巧招不再被守势克制
  const unblockable = m.stance === '巧' && tPosture === '守' && hasTrait(u, '燕回巢');
  if (unblockable) mult = 1.0;
  const armor = 100 / (100 + target.innerLv);
  const flaw = (target.status.破绽 ? 1.3 : 1) * (target.status.护体 ? 0.7 : 1) * (u.status.振奋 ? 1.3 : 1);
  if (u.status.振奋) delete u.status.振奋;
  if (flaw > 1) delete target.status.破绽;
  // dmgx：敌人伤害倍率（自适应战斗用来拉长战斗，减少运气成分，D-051）
  const roll = 0.9 + rand(b) * 0.2;
  const dmg = Math.max(1, Math.round(value * mult * armor * flaw * (u.dmgx ?? 1) * roll * (opts.scale ?? 1)));
  // 不计克制的伤害：合击按它算，对手的克制对合击不起作用（D-080）
  const raw = Math.max(1, Math.round(value * armor * flaw * (u.dmgx ?? 1) * roll * (opts.scale ?? 1)));

  const outcome = unblockable ? '$N身形如燕子穿帘，绕过了$n的守势！（燕回巢）' : OUTCOME[m.stance + tPosture];
  if (outcome) emit('tag', fill(outcome, ctx));
  else if (tPosture === '无') emit('tag', fill('$n门户大开，结结实实挨了这一下。', ctx));
  target.hp = Math.max(0, target.hp - dmg);
  emit('hit', `${target.name}${woundText(dmg / target.maxHp)}。（气血 -${dmg}）`, { target: target.key });
  // 背水（D-107）：每场一次，致命一击留一口气
  if (target.hp <= 0 && tal(target, 'beishui') && !target.beishui) {
    target.hp = 1;
    target.beishui = true;
    emit('fx', `${target.name}眼前一黑，却硬生生咬牙站住了！（背水）`);
  }
  if (u.side === 'p' && opts.primary !== false) u.roundHit = { target: target.key, dmg, raw, mult, skill: m.skill }; // 玩家和 NPC 队友都记，合击用

  // 克制了对手：后发制人、吐纳（D-107）
  if (mult > 1 && tPosture !== '无' && opts.primary !== false) countered(b, u, target, emit);
  // 截脉（D-107）：没被克制时有机会顺势点穴
  if (mult >= 1 && alive(target) && opts.primary !== false && !target.status.点穴 && !m.effects.some((e) => e.startsWith('点穴')) && rand(b) < 0.06 * tal(u, 'jiemai')) {
    target.status.点穴 = tal(u, 'fengxue') ? 2 : 1;
    emit('fx', `${u.name}顺势一截，点中了${target.name}的穴道！（截脉）`);
  }
  // 招式附加效果：只在没有被克制时生效；群攻只作用在主目标身上
  if (mult >= 1 && alive(target) && opts.primary !== false) {
    for (const e of m.effects) {
      const [kind, k] = e.split(':');
      if (kind === '内伤') { target.status.内伤 = 3 + 2 * tal(u, 'zhongchuang'); target.status.内伤dot = Math.max(3, Math.round(dmg * 0.2)); emit('fx', `${target.name}受了内伤。`); }
      else if (kind === '点穴') { target.status.点穴 = tal(u, 'fengxue') ? 2 : 1; emit('fx', `${target.name}被点中穴道，${tal(u, 'fengxue') ? '接下来两回合' : '下一回合'}动弹不得！`); }
      else if (kind === '破绽') { target.status.破绽 = 1; emit('fx', `${target.name}露出了破绽。`); }
      else if (kind === '缴械') tryDisarm(b, u, target, num(k, 20) + 15 * tal(u, 'xiebing'), emit);
      else if (kind === '吸内' || kind === '化内') {
        const drain = Math.min(target.mp, Math.round(dmg * num(k, 1)));
        target.mp -= drain;
        if (kind === '吸内') u.mp = Math.min(u.maxMp, u.mp + Math.round(drain / 2));
        emit('fx', `${target.name}只觉内力源源外泄！（内力 -${drain}）`);
      }
    }
  }

  // 内功吸内（D-214）：装备的内功写了 absorb 时，攻击得手（没被克制）就把对手的内力吸过来。
  // 吸来的内力可以临时超过自己的上限；内力不进存档（每战开打时重置为上限），所以战后上限和内力都不受影响。
  const absorbRate = num(innerSk?.props.absorb);
  if (absorbRate > 0 && mult >= 1 && alive(target) && target.mp > 0 && opts.primary !== false) {
    const drain = Math.min(target.mp, Math.round(dmg * absorbRate));
    if (drain > 0) {
      target.mp -= drain;
      u.mp += drain; // 故意不夹 maxMp
      emit('fx', `${target.name}只觉丹田一空，内力顺着交手处倒灌而去。（${target.name}内力 -${drain}，${u.name}内力 +${drain}）`);
    }
  }

  // 燕返：巧招得手后，有两成机会再补一击（半成威力）
  if (m.stance === '巧' && mult >= 1 && alive(target) && hasTrait(u, '燕返') && rand(b) < 0.2) {
    const extra = Math.max(1, Math.round(dmg * 0.5));
    target.hp = Math.max(0, target.hp - extra);
    emit('tag', `${u.name}身形一折，如燕子回翔，又补上一击！（气血 -${extra}）`);
  }

  // 守势化解巧招：反震（燕回巢无视守势，不受反震）
  if (m.stance === '巧' && tPosture === '守' && alive(u) && !unblockable) {
    const gm = target.intent?.type === 'move' ? moveInfo(db, target.intent.move) : null;
    if (gm) {
      const tInner = target.innerId ? db.skill[target.innerId] : null;
      const counter = gm.power * (1 + (target.skills[gm.skill] ?? 0) * 0.02) * innerBonus(target.innerLv, tInner, '守');
      const cd = Math.max(1, Math.round(counter * (100 / (100 + u.innerLv))));
      u.hp = Math.max(0, u.hp - cd);
      emit('tag', `反震之力直透${u.name}臂膀！（气血 -${cd}）`);
      // 守化解了巧招，也算克制：后发制人、吐纳；借力吸走对手内力（D-107）
      countered(b, target, u, emit);
      const drain = Math.min(u.mp, Math.round(cd * 0.25 * tal(target, 'jieli')));
      if (drain > 0) { u.mp -= drain; target.mp = Math.min(target.maxMp, target.mp + drain); emit('fx', `${target.name}借着反震之势，吸走了${u.name}的内力。（内力 +${drain}）`); }
      const dis = gm.effects.find((e) => e.startsWith('缴械'));
      if (dis) tryDisarm(b, target, u, num(dis.split(':')[1], 20), emit);
      if (!alive(u)) emit('fx', `${u.name}倒在地上。`);
    }
  }
  if (!alive(target)) emit('fx', `${target.name}倒地不起。`);
}

/** 辅助招式的效果（D-064）。数值与招式威力、武功等级、内功挂钩 */
function applySupport(db, u, target, m, emit) {
  const innerSk = u.innerId ? db.skill[u.innerId] : null;
  // 妙手（D-107）：疗伤、回气效果更好
  const value = m.power * (1 + (u.skills[m.skill] ?? 0) * 0.02) * innerBonus(u.innerLv, innerSk, '守') * (1 + 0.2 * tal(u, 'miaoshou'));
  const who = target === u ? '你' : target.name;
  for (const e of m.effects) {
    const [kind, k] = e.split(':');
    if (kind === '疗伤') {
      const heal = Math.min(target.maxHp - target.hp, Math.round(value * num(k, 1)));
      target.hp += heal;
      emit('fx', heal > 0 ? `${target.name}的伤势好转了。（气血 +${heal}）` : `${target.name}气血充盈，并无伤势。`);
    } else if (kind === '回气') {
      const gain = Math.max(0, Math.min(target.maxMp - target.mp, Math.round(value * num(k, 1))));
      target.mp += gain;
      emit('fx', `${target.name}精神一振。（内力 +${gain}）`);
    } else if (kind === '振奋') {
      target.status.振奋 = 1;
      emit('fx', `${target.name}斗志昂扬，下一招威力大增！`);
    } else if (kind === '护体') {
      target.status.护体 = 2;
      emit('fx', `${target.name}周身如有气墙护住，两回合内所受伤害减轻三成。`);
    } else if (kind === '解穴') {
      const had = target.status.点穴 || target.status.内伤;
      delete target.status.点穴; delete target.status.内伤; delete target.status.内伤dot;
      if (had) emit('fx', `${target.name}被封的穴道、受的内伤都化解了。`);
    }
  }
  void who;
}

// ---- 合击（D-065）----

function comboSides(c) {
  const side = (s) => { const [skill, lv] = (s ?? '').split('@').map((x) => x.trim()); return { skill, lv: Number(lv || 1) }; };
  return [side(c.props.a), side(c.props.b)];
}

/** P、Q 两位玩家本回合的出手能否构成合击 c（P 对应 a 方，Q 对应 b 方）。返回 {target, dmg} 或 null */
function comboMatch(db, c, P, Q) {
  const [A, B] = comboSides(c);
  if ((P.skills[A.skill] ?? 0) < A.lv || (Q.skills[B.skill] ?? 0) < B.lv) return null;
  const bonus = num(c.props.bonus, 1.5) - 1;
  if (db.skill[A.skill]?.props.stance === '守') {
    // 护攻：P 用守招护住 Q，Q 出手
    if (P.roundGuard?.skill !== A.skill || P.roundGuard.target !== Q.key) return null;
    if (Q.roundHit?.skill !== B.skill) return null;
    return { target: Q.roundHit.target, dmg: Math.round(Q.roundHit.raw * bonus) };
  }
  // 合击：两人打同一个对手。对手的克制对合击不起作用：额外伤害按不计克制的伤害算（D-080）
  if (P.roundHit?.skill !== A.skill || Q.roundHit?.skill !== B.skill) return null;
  if (P.roundHit.target !== Q.roundHit.target) return null;
  return { target: P.roundHit.target, dmg: Math.round((P.roundHit.raw + Q.roundHit.raw) * bonus) };
}

function resolveCombos(db, b, emit) {
  const ps = teamOf(b).filter(alive); // 包括 NPC 队友（D-072）
  const byKey = Object.fromEntries(b.units.map((u) => [u.key, u]));
  const combos = Object.values(db.combo ?? {});
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      // 每对队友每回合最多触发一次，取加成最高的
      let best = null;
      for (const c of combos) {
        for (const [P, Q] of [[ps[i], ps[j]], [ps[j], ps[i]]]) {
          const r = comboMatch(db, c, P, Q);
          if (r && (!best || num(c.props.bonus) > num(best.c.props.bonus))) best = { c, P, Q, ...r };
        }
      }
      if (!best) continue;
      const target = byKey[best.target];
      if (!target || !alive(target)) continue;
      const dmg = Math.max(1, best.dmg);
      target.hp = Math.max(0, target.hp - dmg);
      emit('combo', `★ 合击「${best.c.props.name}」！`);
      emit('act', fill(best.c.lines.map((l) => l.text).join('') || '$A与$B一左一右，同时攻向$n！', { N: best.P.name, n: target.name }).replaceAll('$A', best.P.name).replaceAll('$B', best.Q.name));
      emit('hit', `${target.name}${woundText(dmg / target.maxHp)}。（合击 气血 -${dmg}）`, { target: target.key });
      if (alive(target)) {
        for (const e of parseList(best.c.props.effects)) {
          const [kind, k] = e.split(':');
          if (kind === '内伤') { target.status.内伤 = 3; target.status.内伤dot = Math.max(3, Math.round(dmg * 0.2)); emit('fx', `${target.name}受了内伤。`); }
          else if (kind === '点穴') { target.status.点穴 = 1; emit('fx', `${target.name}被点中穴道，下一回合动弹不得！`); }
          else if (kind === '破绽') { target.status.破绽 = 1; emit('fx', `${target.name}露出了破绽。`); }
          else if (kind === '化内') { const d = Math.min(target.mp, Math.round(dmg * num(k, 1))); target.mp -= d; emit('fx', `${target.name}内力大泄！（内力 -${d}）`); }
        }
      }
      if (!alive(target)) emit('fx', `${target.name}倒地不起。`);
    }
  }
}

/**
 * UI 用：我出这一招，能否和队友（含 NPC 队友）已选的招式构成合击？
 * 返回 {name, guard, mate, foe}：guard = 要我用守招护住队友；foe = 合击要打的敌人（和队友打同一个）。
 * 只在真能触发时提示：合击要双方都出攻招；护攻要守方真的护住了攻方（D-072）。
 */
export function comboHint(db, b, me, move) {
  const combos = Object.values(db.combo ?? {});
  for (const t of teamOf(b).filter((x) => x !== me && alive(x) && x.intent?.type === 'move')) {
    const tm = moveInfo(db, t.intent.move);
    const attacking = (st) => st !== '守';
    for (const c of combos) {
      const [A, B] = comboSides(c);
      const guardMode = db.skill[A.skill]?.props.stance === '守';
      const lvOk = (P, X, Q, Y) => (P.skills[X.skill] ?? 0) >= X.lv && (Q.skills[Y.skill] ?? 0) >= Y.lv;
      const hint = (extra) => ({ name: c.props.name, guard: false, mate: t.name, foe: null, ...extra });
      // 我是 a 方，队友是 b 方
      if (A.skill === move.skill && B.skill === tm.skill && lvOk(me, A, t, B)) {
        if (guardMode && move.stance === '守' && attacking(tm.stance)) return hint({ guard: true });
        if (!guardMode && attacking(move.stance) && attacking(tm.stance)) return hint({ foe: t.intent.target });
      }
      // 队友是 a 方，我是 b 方
      if (B.skill === move.skill && A.skill === tm.skill && lvOk(t, A, me, B)) {
        if (guardMode && tm.stance === '守' && t.intent.target === me.key && attacking(move.stance)) return hint();
        if (!guardMode && attacking(move.stance) && attacking(tm.stance)) return hint({ foe: t.intent.target });
      }
    }
  }
  return null;
}

/** 缴械：打飞对手手里的兵器（D-057）。敌人此后只能用拳脚；玩家可以花一回合换一件 */
function tryDisarm(b, by, target, chance, emit) {
  if (!alive(target) || target.disarmed) return;
  const armed = target.isPlayer ? !!target.wtype : target.weapon && target.weapon !== '拳';
  if (!armed || rand(b) * 100 >= chance) return;
  const wname = target.isPlayer ? target.wname : target.weaponName;
  target.disarmed = true;
  if (target.isPlayer) target.dropped = target.wid;
  else { target.weapon = '拳'; target.weaponName = '双拳'; }
  emit('fx', `${by.name}一招夺下，${target.name}手中的${wname}脱手飞出！`);
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
    cunning: 20, obscure: 0, ai: {}, pattern: [], patIdx: 0, potential: 0, weapon: undefined,
    level: avgLevel(Object.fromEntries(me.outer.map((id) => [id, me.skills[id] ?? 1]))),
  };
  return { id: '__exam__', exam, seed: seed | 0, round: 0, foeLv: mirror.level, units: [me, mirror], over: null };
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
  const pUnits = playerUnits(db, meta.players);
  delete meta.players;
  scaleForParty(units, pUnits.length);
  // 随行的 NPC 队友（如镖师，D-104）：和敌人一样按等级缩放，站在玩家一边
  const allyUnits = (meta.allies ?? []).map((id, i) => {
    const a = db.enemy[id];
    const scaled = { ...a, props: { ...a.props, skills: Object.keys(parseNums(a.props.skills)).map((s) => `${s}=${lv}`).join(', '), attrs: `根骨=${14 + Math.floor(lv / 4)}, 身法=${12 + Math.floor(lv / 5)}, 悟性=12` } };
    return { ...enemyUnit(db, scaled, i), key: 'a' + i, side: 'p', isAlly: true };
  });
  delete meta.allies;
  return { id: '__scaled__', ...meta, seed: seed | 0, round: 0, foeLv: lv, units: [...pUnits, ...allyUnits, ...units], over: null };
}

// ---- 难度模拟（D-051）----
// "猜对率"：玩家每回合选中克制敌人那一势的概率。设计目标是猜对 80% 以上能赢、以下会输。

const COUNTER = { 刚: '巧', 巧: '守', 守: '刚' };

/** 模拟一个按猜对率出招的玩家：猜对时用克制的势，猜错时用另外两势之一；没内力就调息 */
function simChoice(db, b, me, accuracy) {
  const foes = enemiesOf(b).filter(alive);
  const foe = foes[0];
  const moves = unitMoves(db, me).map((m, i) => ({ ...m, i }));
  let want = '刚';
  if (foe?.intent?.type === 'move') {
    const right = COUNTER[foe.intent.stance];
    want = rand(b) < accuracy ? right : pick(b, STANCES.filter((s) => s !== right));
  }
  const m = moves.filter((x) => x.stance === want && x.mp <= me.mp && canUse(me, x)).sort((x, y) => y.power - x.power)[0];
  return m ? `${m.i + 1} 1` : '0';
}

/** 模拟打一场（不产生任何输出），返回是否获胜 */
export function simulateBattle(db, b0, accuracy, seed) {
  const b = structuredClone(b0);
  b.seed = seed | 0;
  const emit = () => {};
  while (!b.over && b.round < 60) {
    beginRound(db, b, emit);
    for (const u of playersOf(b).filter(alive)) setPlayerIntent(db, b, simChoice(db, b, u, accuracy), u.pid);
    resolveRound(db, b, emit);
  }
  return b.over === 'win';
}

export function simWinRate(db, b, accuracy, n = 40) {
  let wins = 0;
  for (let i = 0; i < n; i++) if (simulateBattle(db, b, accuracy, (b.seed ^ (i * 2654435761)) | 0)) wins++;
  return wins / n;
}

/**
 * 单位的强度（D-106）：刚、巧、守三势各取最强一招的攻击值。
 * 学了再多武功，一场战斗里真正用的也就是每一势最狠的那一招，所以不看武功等级之和。
 */
export function stanceBest(db, u) {
  return Object.fromEntries(Object.entries(stanceMoves(db, u)).map(([st, m]) => [st, m ? attackValue(db, u, m) : 0]));
}

/** 三势各自最狠的那一招（招式本身，算附加效果用） */
function stanceMoves(db, u) {
  const top = { 刚: null, 巧: null, 守: null };
  for (const m of unitMoves(db, u)) {
    if (m.support || !canUse(u, m) || m.mp > u.maxMp || !(m.stance in top)) continue;
    if (!top[m.stance] || attackValue(db, u, m) > attackValue(db, u, top[m.stance])) top[m.stance] = m;
  }
  return top;
}

/** 招式附加效果折算（D-106）：只在没被克制时生效。内伤三回合掉血约多出六成，破绽让下一下多三成 */
const effectExtra = (m) => (m?.effects ?? []).reduce((s, e) => s + ({ 内伤: 0.6, 破绽: 0.3 }[e.split(':')[0]] ?? 0), 0);
const stuns = (m) => (m?.effects ?? []).some((e) => e.startsWith('点穴'));
const meanOut = (best) => (best.刚 + best.巧 + best.守) / 3;
const armorOf = (u) => 100 / (100 + (u.innerLv ?? 0));

/** 敌人各势出招的概率：和 chooseEnemyIntent 一样，只在它有招的势里按 ai 权重挑（没写的势权重 1） */
function stanceOdds(db, e, best) {
  const w = STANCES.map((st) => (best[st] > 0 ? e.ai?.[st] ?? 1 : 0));
  const sum = w.reduce((a, c) => a + c, 0) || 1;
  return Object.fromEntries(STANCES.map((st, i) => [st, w[i] / sum]));
}

/**
 * 一回合的期望交换（D-106）：敌人按 odds 出招，玩家以 acc 的机会出克制它的势、否则在另外两势里随便出，
 * 各自用这一势最狠的一招。按真实的克制规则：刚克守、巧克刚各 ×1.5，被克 ×0.5；守化解巧招，反震回去的是守招的攻击值。
 * 返回 { toFoe：玩家打敌人，toMe：敌人打玩家（要乘敌人伤害倍率的部分），reflect：反震给玩家的（不乘） }
 */
function exchange(p, e, odds, acc, pArmor, eArmor) {
  let toFoe = 0; let toMe = 0; let reflect = 0; let meStunned = 0; let foeStunned = 0;
  for (const es of STANCES) {
    if (!odds[es]) continue;
    for (const ps of STANCES) {
      const pr = odds[es] * (ps === COUNTER[es] ? acc : (1 - acc) / 2);
      if (!pr) continue;
      if (ps !== '守') {
        const mult = MULT[ps][es] ?? 1;
        toFoe += pr * p.best[ps] * mult * eArmor * (mult >= 1 ? 1 + effectExtra(p.moves[ps]) : 1);
        if (mult >= 1 && stuns(p.moves[ps])) foeStunned += pr;
      } else if (es === '巧') toFoe += pr * p.best.守 * eArmor; // 守化解巧招，反震
      if (es !== '守') {
        const mult = MULT[es][ps] ?? 1;
        toMe += pr * e.best[es] * mult * pArmor * (mult >= 1 ? 1 + effectExtra(e.moves[es]) : 1);
        if (mult >= 1 && stuns(e.moves[es])) meStunned += pr;
      } else if (ps === '巧') reflect += pr * e.best.守 * pArmor;
    }
  }
  // 被点穴的一回合：自己不出手，对方的招打在门户大开的身上（×1.2）
  return { toFoe: toFoe * (1 - meStunned), toMe: toMe * (1 - foeStunned) * (1 + 0.2 * meStunned), reflect };
}

/**
 * 修为（D-107）：刚、巧、守三势各自最狠一招的攻击值之和，加上气血上限的五分之一。
 * 学得再多，一场里用的也就是每势最狠的那招，所以不看武功等级之和。敌人用同一个公式，可以直接比较。
 */
export function unitXiuwei(db, u) {
  const best = stanceBest(db, u);
  return Math.round(best.刚 + best.巧 + best.守 + u.maxHp / 5);
}
export const xiuwei = (db, p) => unitXiuwei(db, playerUnit(db, p));
export const enemyXiuwei = (db, foeId) => unitXiuwei(db, enemyUnit(db, db.enemy[foeId], 0));

/** 自适应的刻度（D-106）：设计时假定玩家猜对几成；按这个猜对率，几回合打完全部敌人；打完时掉了多少比例的气血 */
export const ADAPT_ACC = 0.6;
export const ADAPT_ROUNDS = 6;
export const ADAPT_TAKEN = 0.6;
/** NPC 队友的输出、分担敌人火力，都按玩家的几成算 */
export const ADAPT_ALLY = 0.5;
/** 敌人气血的放大 / 缩小范围（D-102）：太大成了肉盾，太小一碰就倒 */
export const ADAPT_HP_CAP = 3;
export const ADAPT_HP_MIN = 0.25;

/**
 * 必须打赢的剧情战：按玩家的强度调整敌人（D-051、D-106）。
 * 强度不看武功等级之和，看刚、巧、守三势各自最狠的一招和气血；不再模拟几百场战斗，直接算：
 * - 按 ADAPT_ACC 的猜对率算出每回合的期望交换（见 exchange）；虚招（cunning）让猜对率打折扣；
 * - 敌人气血放缩到约 ADAPT_ROUNDS 回合打完（限在 0.25 ~ 3 倍）；
 * - 敌人伤害放缩到打完时玩家约掉 ADAPT_TAKEN 的气血。敌人按排列顺序一个个倒下：
 *   正在打的那个按猜对率算，其余同时出手的按瞎猜（三分之一）算。
 * 返回气血倍率。
 */
export function adaptEnemyHp(db, b) {
  const foes = enemiesOf(b);
  const team = teamOf(b);
  const players = playersOf(b);
  if (!foes.length || !players.length) return 1;
  const me = players[0];
  const pSide = { best: stanceBest(db, me), moves: stanceMoves(db, me) };
  // NPC 队友按一半算：他们常出辅助招，也可能先倒下（倒下不算输，但之后只剩玩家自己打）
  const allies = team.filter((u) => !u.isPlayer);
  const allyOut = allies.reduce((s, u) => s + meanOut(stanceBest(db, u)), 0) * ADAPT_ALLY;
  const share = 1 / (1 + allies.length * ADAPT_ALLY); // 敌人的招落在玩家身上的比例
  const ex = foes.map((e) => {
    const eSide = { best: stanceBest(db, e), moves: stanceMoves(db, e) };
    const odds = stanceOdds(db, e, eSide.best);
    const acc = Math.max(1 / 3, ADAPT_ACC - (e.cunning ?? 0) / 200);
    const aimed = exchange(pSide, eSide, odds, acc, armorOf(me), armorOf(e));
    const stray = exchange(pSide, eSide, odds, 1 / 3, armorOf(me), armorOf(e));
    return { aimed, stray, toFoe: aimed.toFoe * players.length + allyOut * armorOf(e) };
  });
  const base = foes.reduce((s, e, i) => s + e.maxHp / Math.max(1, ex[i].toFoe), 0);
  const m = Math.min(ADAPT_HP_CAP, Math.max(ADAPT_HP_MIN, ADAPT_ROUNDS / base));
  // 每个阶段（正在打第 j 个敌人）的回合数，和这期间玩家挨的打
  let hit = 0; let refl = 0;
  foes.forEach((e, j) => {
    const rounds = e.maxHp * m / Math.max(1, ex[j].toFoe);
    for (let i = j; i < foes.length; i++) {
      const x = i === j ? ex[i].aimed : ex[i].stray;
      hit += rounds * x.toMe * share;
      refl += rounds * x.reflect;
    }
  });
  const hp = players.reduce((s, u) => s + u.maxHp, 0) / players.length;
  const dmgx = Math.min(8, Math.max(0.1, (ADAPT_TAKEN * hp - refl) / Math.max(1, hit)));
  for (const e of foes) { e.maxHp = Math.max(1, Math.round(e.maxHp * m)); e.hp = e.maxHp; e.dmgx = dmgx; }
  return m;
}
