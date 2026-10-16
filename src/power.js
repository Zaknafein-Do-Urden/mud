// 武学威力（WP）与敌人战斗力（CP）：同一把尺子，用来约束"剧情里什么时候能得到多强的武学"。
// 规则与公式见 docs/POWER.md（D-068）。纯函数，工具和校验脚本共用，游戏里也可以用来显示。

const num = (v, d = 0) => (v === undefined || v === '' ? d : Number(v));
const list = (s) => (s ?? '').split(/[,，]/).map((x) => x.trim()).filter(Boolean);

/** 招式附带效果的折算：控制类 +10%，内力类 +5% */
const EFFECT_BONUS = { 内伤: 0.1, 点穴: 0.1, 破绽: 0.1, 缴械: 0.1, 吸内: 0.05, 化内: 0.05 };
/** 内功、轻功没有招式，按"标准招式"（威力 25，约等于门派入门招式）在同等级的攻击值折算 */
export const STANDARD_POWER = 25;

function effectFactor(effects) {
  return 1 + list(effects).reduce((s, e) => s + (EFFECT_BONUS[e.split(':')[0]] ?? 0), 0);
}

/** 某门武学练到 lv 级时的威力：最强一招（已开放、非辅助）的攻击值，内功加成按 1 计 */
export function skillPower(db, skillId, lv) {
  const sk = db.skill[skillId];
  if (!sk) return 0;
  if (sk.props.kind !== '外功') return Math.round(STANDARD_POWER * (1 + lv * 0.02));
  let best = 0;
  for (const m of Object.values(db.move)) {
    if (m.props.skill !== skillId || m.props.support === 'true' || num(m.props.level) > lv) continue;
    best = Math.max(best, num(m.props.power) * effectFactor(m.props.effects));
  }
  return Math.round(best * (1 + lv * 0.02));
}

/** 敌人战斗力：它最强一门外功在它的等级下的威力 × 它的内功加成 */
export function enemyPower(db, enemyId) {
  const foe = db.enemy[enemyId];
  if (!foe) return 0;
  const skills = Object.fromEntries(list(foe.props.skills).map((x) => { const [k, v] = x.split('='); return [k.trim(), Number(v)]; }));
  const innerId = Object.keys(skills).find((id) => db.skill[id]?.props.kind === '内功');
  const inner = 1 + (innerId ? skills[innerId] : 0) * 0.01;
  const best = Math.max(0, ...Object.entries(skills).filter(([id]) => db.skill[id]?.props.kind === '外功').map(([id, lv]) => skillPower(db, id, lv)));
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
