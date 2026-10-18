// 笑傲江湖全线必胜战的胜率表：node tools/balance-xiaoao.mjs [每场模拟次数] [只跑含某串的战斗]
//
// 为什么不用 tools/balance.mjs：那边的四档角色（开局／入门／二袋／后期）练的是基础武功和丐帮武功，
// 和"按笑傲的剧情一路走下来"的玩家对不上——笑傲的玩家手上是翻天掌、衡山剑法、七弦指、养心诀，
// 气血也靠养心诀撑起来。用错档位，读数会荒腔走板（开局 100%、入门 0% 之类）。
//
// 这里按本线进度分五档，每一档大致是玩家走到那几章时的功力（上限见 docs/POWER.md §9，
// 按"练到上限的八成左右"估）。每一场战斗只看它该看的那一档。
// 判定线仍是 D-051：猜对 80% 时胜率 60%~80%。
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb } from '../src/content.js';
import { newPlayer } from '../src/character.js';
import { maxHp } from '../src/character.js';
import { createBattle, simWinRate, adaptEnemyHp } from '../src/combat.js';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const db = emptyDb();
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];
for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);

function mk(skills, loadout, gu = 0, shen = 0) {
  return () => {
    const p = newPlayer('x');
    Object.assign(p.skills, skills);
    p.loadout = loadout;
    p.attrs.根骨 += gu; p.attrs.身法 += shen;
    return p;
  };
}
const profiles = {
  // 第一~二章：刚出道，武馆三门
  初: mk({ 'base.zhang': 12, 'base.zhaojia': 12, 'base.tuna': 12, 'xiaoao.fantian': 10 },
        { outer: ['xiaoao.fantian', 'base.zhang', 'base.zhaojia'], inner: 'base.tuna', light: null }),
  // 第三~四章
  早: mk({ 'base.zhang': 25, 'base.zhaojia': 20, 'base.tuna': 25, 'xiaoao.fantian': 45, 'xiaoao.hengshan': 35 },
        { outer: ['xiaoao.fantian', 'xiaoao.hengshan', 'base.zhaojia'], inner: 'base.tuna', light: null }, 15),
  // 第五~八章
  中: mk({ 'base.zhang': 45, 'base.zhaojia': 30, 'xiaoao.fantian': 60, 'xiaoao.hengshan': 80, 'xiaoao.qixian': 45, 'xiaoao.yangxin': 70 },
        { outer: ['xiaoao.fantian', 'xiaoao.hengshan', 'xiaoao.qixian', 'base.zhaojia'], inner: 'xiaoao.yangxin', light: null }, 45, 20),
  // 第九~十二章
  晚: mk({ 'base.zhang': 70, 'base.zhaojia': 40, 'xiaoao.fantian': 85, 'xiaoao.hengshan': 105, 'xiaoao.qixian': 70, 'xiaoao.yangxin': 95, 'xiaoao.pixie': 35 },
        { outer: ['xiaoao.fantian', 'xiaoao.hengshan', 'xiaoao.qixian', 'xiaoao.pixie'], inner: 'xiaoao.yangxin', light: null }, 90, 45),
  // 第十三~十八章
  末: mk({ 'base.zhang': 100, 'base.zhaojia': 60, 'xiaoao.fantian': 115, 'xiaoao.hengshan': 125, 'xiaoao.qixian': 100, 'xiaoao.yangxin': 115, 'xiaoao.pixie': 75 },
        { outer: ['xiaoao.fantian', 'xiaoao.hengshan', 'xiaoao.qixian', 'xiaoao.pixie'], inner: 'xiaoao.yangxin', light: null }, 150, 70),
};
const want = (ch) => (ch <= 2 ? ['初'] : ch <= 4 ? ['早'] : ch <= 8 ? ['中'] : ch <= 12 ? ['晚'] : ['末']);
const n = Number(process.argv[2] ?? 200);
const only = process.argv[3];
console.log('各档气血上限：', Object.entries(profiles).map(([k, f]) => `${k} ${maxHp(db, f())}`).join('  '));
console.log('战斗'.padEnd(26), Object.keys(profiles).map((k) => k.padStart(5)).join('  '), '  该看  判定  自适应');
const ids = Object.keys(db.battle).filter((id) => id.startsWith('xiaoao.') && !db.battle[id].props.lose && (!only || id.includes(only)));
for (const id of ids) {
  const block = db.battle[id];
  const ch = Number((block.file.match(/ch(\d+)/) ?? [])[1] ?? 0);
  const keys = want(ch);
  const out = {}; let note = '';
  for (const [label, f] of Object.entries(profiles)) {
    const b = createBattle(db, block, f(), 12345);
    if (keys.includes(label)) note = `×${adaptEnemyHp(db, b).toFixed(2)} / ×${(b.units.find((u) => u.side === 'e')?.dmgx ?? 1).toFixed(2)}`;
    else adaptEnemyHp(db, b);
    out[label] = simWinRate(db, b, 0.8, n);
  }
  const ok = keys.every((k) => out[k] >= 0.6 && out[k] <= 0.8);
  const pct = (x) => `${Math.round(x * 100)}%`.padStart(5);
  console.log(id.padEnd(26), Object.values(out).map(pct).join('  '), ' ', keys.join('').padEnd(3), ok ? '✓' : '✗', ' ', note);
}
