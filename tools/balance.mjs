// 战斗平衡模拟：node tools/balance.mjs [战斗id] [次数]
// 用两种打法各模拟 N 场：random（随机出招）和 smart（完美读招，用克制势应对）。
// 真实玩家介于两者之间：会读预兆，但会被虚招骗。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb } from '../src/content.js';
import { newPlayer } from '../src/character.js';
import * as C from '../src/combat.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const db = emptyDb();
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];
for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);

const COUNTER = { 刚: '巧', 巧: '守', 守: '刚' };

function sim(battleId, player, strat) {
  const b = C.createBattle(db, db.battle[battleId], player, (Math.random() * 1e9) | 0);
  const emit = () => {};
  while (!b.over && b.round < 60) {
    C.beginRound(db, b, emit);
    const me = C.playerUnitOf(b);
    const foes = C.enemiesOf(b).filter((e) => e.hp > 0);
    const foe = foes[0];
    const moves = C.unitMoves(db, me);
    let i;
    if (strat === 'smart') {
      const want = foe.intent?.type === 'move' ? COUNTER[foe.intent.stance] : '刚';
      i = moves.findIndex((m) => m.stance === want && m.mp <= me.mp);
    } else i = Math.floor(Math.random() * moves.length);
    C.setPlayerIntent(db, b, i < 0 || moves[i].mp > me.mp ? '0' : `${i + 1} 1`);
    C.resolveRound(db, b, emit);
  }
  return { win: b.over === 'win', rounds: b.round, hpLeft: C.playerUnitOf(b).hp / C.playerUnitOf(b).maxHp };
}

// 两种角色：开局（基础武功 10 级）和丐帮二袋（门派武功 25 级上下）
const fresh = () => newPlayer('x');
const trained = () => {
  const p = newPlayer('x');
  Object.assign(p.skills, { 'gaibang.huntian': 20, 'gaibang.lianhua': 25, 'gaibang.chansi': 25, 'gaibang.xiaoyao': 20 });
  p.loadout = { outer: ['gaibang.lianhua', 'gaibang.xiaoyao', 'gaibang.chansi'], inner: 'gaibang.huntian', light: null };
  return p;
};

const ids = process.argv[2] ? [process.argv[2]] : Object.keys(db.battle);
const n = Number(process.argv[3] ?? 300);
console.log('战斗'.padEnd(18), '角色', '打法  ', '胜率', '平均回合', '胜时剩余气血');
for (const id of ids) {
  for (const [label, mk] of [['开局', fresh], ['二袋', trained]]) {
    for (const strat of ['random', 'smart']) {
      const rs = [...Array(n)].map(() => sim(id, mk(), strat));
      const wins = rs.filter((r) => r.win);
      const pct = (x) => `${Math.round(x * 100)}%`;
      console.log(id.padEnd(20), label, strat.padEnd(6), pct(wins.length / n).padStart(4),
        (rs.reduce((a, r) => a + r.rounds, 0) / n).toFixed(1).padStart(6),
        pct(wins.reduce((a, r) => a + r.hpLeft, 0) / Math.max(1, wins.length)).padStart(8));
    }
  }
}
