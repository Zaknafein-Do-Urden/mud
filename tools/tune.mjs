// 难度调校：node tools/tune.mjs
// 为每场固定难度的战斗指定"面向的玩家阶段"，二分查找敌人气血倍率，
// 使该阶段的玩家猜对 80% 时胜率约 75%（D-051）。输出建议的 hpx，需要手动（或用脚本）写回内容文件。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb } from '../src/content.js';
import { newPlayer } from '../src/character.js';
import { createBattle, simWinRate, enemiesOf } from '../src/combat.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const db = emptyDb();
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];
for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);

export const PROFILES = {
  开局: () => newPlayer('x'),
  入门: () => {
    const p = newPlayer('x');
    Object.assign(p.skills, { 'gaibang.huntian': 12, 'gaibang.lianhua': 15, 'gaibang.chansi': 15 });
    p.loadout = { outer: ['gaibang.lianhua', 'base.zhang', 'gaibang.chansi'], inner: 'gaibang.huntian', light: null };
    return p;
  },
  二袋: () => {
    const p = newPlayer('x');
    Object.assign(p.skills, { 'gaibang.huntian': 20, 'gaibang.lianhua': 25, 'gaibang.chansi': 25, 'gaibang.xiaoyao': 20 });
    p.loadout = { outer: ['gaibang.lianhua', 'gaibang.xiaoyao', 'gaibang.chansi'], inner: 'gaibang.huntian', light: null };
    return p;
  },
};

// 每场战斗面向的玩家阶段
export const TARGETS = {
  开局: ['world.b.pipi', 'world.b.linan_bandit', 'world.b.jiaxing_bandit', 'world.b.shaolin_bandit', 'world.b.wudang_bandit', 'world.b.huashan_bandit', 'world.b.tangmen_spy',
    'world.b.gaibang_b2', 'world.b.shaolin_b2', 'world.b.wudang_b2', 'world.b.huashan_b2', 'world.b.tangmen_b2', 'world.b.linan_thief', 'world.b.jiaxing_thief'],
  入门: ['world.b.snake', 'world.b.shaolin_thief', 'world.b.wudang_spy', 'world.b.huashan_spy', 'world.b.tangmen_traitor', 'world.b.xiangyang_bandit', 'world.b.xiangyang_thief'],
  二袋: ['world.b.luoyang_bandit', 'world.b.changan_bandit', 'world.b.chengdu_bandit', 'world.b.luoyang_thief', 'world.b.changan_thief', 'world.b.chengdu_thief',
    'world.b.gaibang_b3', 'world.b.shaolin_b3', 'world.b.wudang_b3', 'world.b.huashan_b3', 'world.b.tangmen_b3'],
};
// 只调这些（命令行：node tools/tune.mjs 次数 --only id1,id2）
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');
if (only) for (const k of Object.keys(TARGETS)) TARGETS[k] = TARGETS[k].filter((id) => only.includes(id));

const ACC = 0.8;
const GOAL = 0.75;
const N = Number(process.argv[2] ?? 120);

function rateWith(id, mk, m) {
  const b = createBattle(db, db.battle[id], mk(), 777);
  for (const e of enemiesOf(b)) { e.maxHp = Math.max(1, Math.round(e.maxHp * m)); e.hp = e.maxHp; }
  return simWinRate(db, b, ACC, N);
}

const out = {};
for (const [stage, ids] of Object.entries(TARGETS)) {
  for (const id of ids) {
    let lo = 0.1;
    let hi = 10;
    for (let i = 0; i < 10; i++) {
      const mid = Math.sqrt(lo * hi);
      if (rateWith(id, PROFILES[stage], mid) >= GOAL) lo = mid; else hi = mid;
    }
    out[id] = { stage, factor: Number(lo.toFixed(2)) };
    const check = [0.7, 0.8, 0.9].map((a) => {
      const b = createBattle(db, db.battle[id], PROFILES[stage](), 777);
      for (const e of enemiesOf(b)) { e.maxHp = Math.round(e.maxHp * lo); e.hp = e.maxHp; }
      return `${a * 100}%→${Math.round(simWinRate(db, b, a, N) * 100)}%`;
    }).join(' ');
    console.log(`${id.padEnd(26)} ${stage}  气血倍率 ×${lo.toFixed(2)}　${check}`);
  }
}
if (process.argv.includes('--json')) console.log(JSON.stringify(out));
