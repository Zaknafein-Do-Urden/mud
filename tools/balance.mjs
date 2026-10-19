// 战斗平衡模拟：node tools/balance.mjs [战斗id] [次数]
// 按"猜对率"统计胜率：玩家每回合以给定概率选中克制敌人的那一势（D-051）。
// 设计目标：猜对 80% 以上能赢，以下会输。
// 标了 adapt 或必须打赢的主线战斗，会先按角色功力调整敌人气血，再统计。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb } from '../src/content.js';
import { newPlayer } from '../src/character.js';
import { createBattle, simWinRate, adaptEnemyHp, isAdaptive } from '../src/combat.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const db = emptyDb();
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];
for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);

// 四种角色：开局（基础武功 10 级）、入门（门派武功 15 级）、二袋（门派武功 25 级上下）、
// 后期（门派四阶上下、内功 60：主线走到十几章的玩家才有的功力，D-222）
const profiles = {
  // 开局：已在武馆学了小巧掌、沾衣十八跌、养气诀（D-061），各 10 级
  开局: () => {
    const p = newPlayer('x');
    Object.assign(p.skills, { 'base.zhang': 10, 'base.zhaojia': 10, 'base.tuna': 10 });
    p.loadout = { outer: ['base.quan', 'base.zhang', 'base.zhaojia'], inner: 'base.tuna', light: null };
    return p;
  },
  入门: () => {
    const p = newPlayer('x');
    Object.assign(p.skills, { 'base.zhang': 10, 'base.zhaojia': 10, 'base.tuna': 10, 'gaibang.huntian': 12, 'gaibang.lianhua': 15, 'gaibang.chansi': 15 });
    p.loadout = { outer: ['gaibang.lianhua', 'base.zhang', 'gaibang.chansi'], inner: 'gaibang.huntian', light: null };
    return p;
  },
  二袋: () => {
    const p = newPlayer('x');
    Object.assign(p.skills, { 'base.zhang': 10, 'base.zhaojia': 10, 'base.tuna': 10, 'gaibang.huntian': 20, 'gaibang.lianhua': 25, 'gaibang.chansi': 25, 'gaibang.xiaoyao': 20 });
    p.loadout = { outer: ['gaibang.lianhua', 'gaibang.xiaoyao', 'gaibang.chansi'], inner: 'gaibang.huntian', light: null };
    return p;
  },
  // 后期：门派武功练到四阶上下，内功 60。天龙第八章往后的剧情战，要按这一档看才有意义
  后期: () => {
    const p = newPlayer('x');
    Object.assign(p.skills, { 'base.zhang': 20, 'base.zhaojia': 20, 'base.tuna': 20, 'gaibang.huntian': 60, 'gaibang.lianhua': 60, 'gaibang.chansi': 55, 'gaibang.xiaoyao': 55, 'gaibang.qianli': 40 });
    p.loadout = { outer: ['gaibang.lianhua', 'gaibang.xiaoyao', 'gaibang.chansi'], inner: 'gaibang.huntian', light: 'gaibang.qianli' };
    return p;
  },
};

const ACC = [0.6, 0.7, 0.8, 0.9, 1.0];
const ids = process.argv[2] ? [process.argv[2]] : Object.keys(db.battle);
const n = Number(process.argv[3] ?? 200);
const pct = (x) => `${Math.round(x * 100)}%`.padStart(5);
console.log('战斗'.padEnd(22), '角色', ACC.map((a) => `猜对${a * 100}%`).join(' '), ' 备注');
for (const id of ids) {
  const block = db.battle[id];
  const adaptive = isAdaptive(block);
  for (const [label, mk] of Object.entries(profiles)) {
    const b = createBattle(db, block, mk(), 12345);
    let note = '';
    // 自适应 D-106 起不再模拟，按三势最强一招和气血直接算（D-227 的样本数问题随之不存在）
    if (adaptive) note = `自适应气血 ×${adaptEnemyHp(db, b).toFixed(2)}　伤害 ×${(b.units.find((u) => u.side === 'e')?.dmgx ?? 1).toFixed(2)}`;
    const rates = ACC.map((a) => simWinRate(db, b, a, n));
    console.log(id.padEnd(24), label, rates.map(pct).join('    '), ' ', note);
  }
}
