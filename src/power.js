// 武学威力（WP）与敌人战斗力（CP）：同一把尺子，用来约束"剧情里什么时候能得到多强的武学"。
// 规则与公式见 docs/POWER.md（D-068）。纯函数，工具和校验脚本共用，游戏里也可以用来显示。

import { CONFIG } from './config.js';

const num = (v, d = 0) => (v === undefined || v === '' ? d : Number(v));
const list = (s) => (s ?? '').split(/[,，]/).map((x) => x.trim()).filter(Boolean);

/** 招式附带效果的折算：控制类 +10%，内力类 +5% */
const EFFECT_BONUS = { 内伤: 0.1, 点穴: 0.1, 破绽: 0.1, 缴械: 0.1, 群攻: 0.1, 吸内: 0.05, 化内: 0.05 };
/** 内功、轻功没有招式，按"标准招式"（威力 25，约等于门派入门招式）在同等级的攻击值折算 */
export const STANDARD_POWER = CONFIG.power.standard;

function effectFactor(effects) {
  return 1 + list(effects).reduce((s, e) => s + (EFFECT_BONUS[e.split(':')[0]] ?? 0), 0);
}

/** 某门武学练到 lv 级时的威力：最强一招（已开放、非辅助）的攻击值，内功加成按 1 计 */
export function skillPower(db, skillId, lv) {
  const sk = db.skill[skillId];
  if (!sk) return 0;
  // 内功、轻功没有招式：按标准招式折算。带吸内的内功（absorb）加 5%，和招式效果「吸内」同一个系数（D-214）
  if (sk.props.kind !== '外功') {
    const absorb = Number(sk.props.absorb) > 0 ? 1 + EFFECT_BONUS.吸内 : 1;
    return Math.round(STANDARD_POWER * absorb * (1 + lv * 0.02));
  }
  let best = 0;
  for (const m of Object.values(db.move)) {
    if (m.props.skill !== skillId || m.props.support === 'true' || num(m.props.level) > lv) continue;
    best = Math.max(best, num(m.props.power) * effectFactor(m.props.effects));
  }
  return Math.round(best * (1 + lv * 0.02));
}

/** 敌人战斗力：它最强一门外功在它的等级下的威力 × 它的内功加成；兵器武功再乘它的 weaponBonus（D-119） */
export function enemyPower(db, enemyId) {
  const foe = db.enemy[enemyId];
  if (!foe) return 0;
  const skills = Object.fromEntries(list(foe.props.skills).map((x) => { const [k, v] = x.split('='); return [k.trim(), Number(v)]; }));
  const innerId = Object.keys(skills).find((id) => db.skill[id]?.props.kind === '内功');
  const inner = 1 + (innerId ? skills[innerId] : 0) * 0.01;
  const wb = 1 + num(foe.props.weaponBonus) / 100;
  const armed = (id) => db.skill[id]?.props.weapon && db.skill[id].props.weapon !== '拳';
  const best = Math.max(0, ...Object.entries(skills).filter(([id]) => db.skill[id]?.props.kind === '外功').map(([id, lv]) => skillPower(db, id, lv) * (armed(id) ? wb : 1)));
  return Math.round(best * inner);
}

/** 一场战斗的战斗力：其中最强的敌人 */
export function battlePower(db, battleId) {
  const b = db.battle[battleId];
  return b ? Math.max(0, ...list(b.props.enemies).map((id) => enemyPower(db, id))) : 0;
}

/**
 * 检查剧情授予的武学：每次 learn / cap 得到的武学威力（按授予后的上限计）
 * 不能超过本主线到这一章为止（含本章）必须打赢的战斗里最强的敌人战斗力。
 * files：本主线按剧情顺序排列的文件（hook 在前），blocks：[{file, type, id, props, choices}]。
 * 返回 [{storyline, file, where, skill, cap, wp, cp, ok}]
 */
export function checkStoryGrants(db, storylines, blocksByFile) {
  const out = [];
  for (const [line, files] of Object.entries(storylines)) {
    let cp = 0;
    for (const f of files) {
      const blocks = blocksByFile[f] ?? [];
      // 本章必须打赢的战斗（写了 lose: 的是允许输的剧情战，不算）
      for (const b of blocks) if (b.type === 'battle' && !b.props.lose) cp = Math.max(cp, battlePower(db, b.id));
      for (const b of blocks) {
        const effects = [...(b.props.do ?? '').split(/\s+/), ...(b.choices ?? []).flatMap((c) => c.effects)].filter(Boolean);
        for (const e of effects) {
          const [kind, rest] = [e.slice(0, e.indexOf(':')), e.slice(e.indexOf(':') + 1)];
          let skill, cap;
          if (kind === 'learn') { skill = rest; cap = num(db.skill[skill]?.props.cap, 0); }
          else if (kind === 'cap') { const i = rest.lastIndexOf(':'); skill = rest.slice(0, i); cap = Number(rest.slice(i + 1)); }
          else continue;
          if (!db.skill[skill] || db.skill[skill].props.sect) continue; // 门派武功走阶位，不归剧情管
          const wp = skillPower(db, skill, cap);
          out.push({ storyline: line, file: f, where: `${b.type}: ${b.id}`, skill, cap, wp, cp, ok: wp <= cp });
        }
      }
    }
  }
  return out;
}

/**
 * 拳掌与兵器（D-119）：同阶同势比较"最狠一招"（威力 × 效果系数，按这一阶的上限能领悟到的招）。
 * 规则：兵器武功 × (1 + 高级兵器加成) ≈ 拳掌基准（偏差不超过 advancedBand）。
 * 即拳掌基础威力高一些、不吃兵器加成；配能买到的高级兵器（百炼，+28%）两边持平，
 * 只有剧情、任务给的顶级兵器（+40% 以上）才让兵器武功胜过拳掌。
 * 阶：武馆一阶；门派按 rank，绝学任务的奖励（secret）算镇派一阶。
 * 拳掌基准：这一阶同势拳掌攻招里最狠的一招；没有巧招拳掌时用刚招基准 × qiaoFromGang；都没有就往下一阶找。
 * 返回 [{skill, name, tier, stance, weapon, wp, base, top, target, ok}]（top：这类兵器最好的加成，只作参考）
 */
export function weaponRule(db) {
  const ranksOf = (sect) => (sect?.props.caps ?? '').split(',').filter(Boolean).length;
  const tierOf = (sk) => {
    if (sk.id.startsWith('base.')) return { key: 0, name: '武馆', cap: CONFIG.character.baseCap };
    const sect = db.sect[sk.props.sect];
    const n = ranksOf(sect);
    const r = sk.props.secret === 'true' ? n - 1 : num(sk.props.rank);
    const caps = (sect?.props.caps ?? '').split(',').map(Number);
    return { key: r + 1, name: `门派第 ${r + 1} 阶`, cap: caps[r] ?? 999 };
  };
  // 每类兵器最好的加成（从物品里取）
  const top = {};
  for (const it of Object.values(db.item)) if (it.props.weapon) top[it.props.weapon] = Math.max(top[it.props.weapon] ?? 0, num(it.props.bonus));
  // 门派和武馆的攻招，按 (阶, 势, 拳/兵器) 取最狠一招
  const best = {}; // `${tier}|${stance}|${weapon}` -> wp
  const rows = [];
  for (const sk of Object.values(db.skill)) {
    if (sk.props.kind !== '外功' || !(sk.props.sect || sk.id.startsWith('base.'))) continue;
    const t = tierOf(sk);
    const weapon = sk.props.weapon && sk.props.weapon !== '拳' ? sk.props.weapon : '';
    const per = {};
    for (const m of Object.values(db.move)) {
      if (m.props.skill !== sk.id || m.props.support === 'true' || num(m.props.level) > t.cap) continue;
      const st = m.props.stance ?? sk.props.stance;
      if (st === '守') continue;
      per[st] = Math.max(per[st] ?? 0, num(m.props.power) * effectFactor(m.props.effects));
    }
    for (const [st, wp] of Object.entries(per)) {
      const k = `${t.key}|${st}|${weapon ? 'w' : 'f'}`;
      best[k] = Math.max(best[k] ?? 0, wp);
      if (weapon && st === (sk.props.stance ?? st)) rows.push({ skill: sk.id, name: sk.props.name, tier: t, stance: st, weapon, wp });
    }
  }
  const baseOf = (key, st) => {
    for (let k = key; k >= 0; k--) {
      if (best[`${k}|${st}|f`]) return best[`${k}|${st}|f`];
      if (st === '巧' && best[`${k}|刚|f`]) return best[`${k}|刚|f`] * CONFIG.power.qiaoFromGang;
      if (k === 1) break; // 门派第 1 阶往下不去找武馆
    }
    return 0;
  };
  for (const r of rows) {
    r.base = baseOf(r.tier.key, r.stance);
    r.top = top[r.weapon] ?? 0;
    r.target = r.base / (1 + CONFIG.power.advancedBonus / 100);
    r.ok = r.base > 0 && Math.abs(r.wp / r.target - 1) <= CONFIG.power.advancedBand;
  }
  return rows;
}

