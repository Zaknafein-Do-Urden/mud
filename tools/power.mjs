// 武学威力 / 敌人战斗力报表：node tools/power.mjs
// 规则见 docs/POWER.md（D-068）：要打得过战斗力 X 的敌人，才能从剧情里得到威力不超过 X 的武学。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb } from '../src/content.js';
import { skillPower, enemyPower, battlePower, checkStoryGrants } from '../src/power.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const db = emptyDb();
const byFile = {};
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];
for (const f of files) { const bl = parse(readFileSync(join(root, f), 'utf8'), f); byFile[f] = bl; addBlocks(db, bl, f); }
const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - [...String(s)].reduce((w, c) => w + (c.charCodeAt(0) > 255 ? 2 : 1), 0)));

console.log('【武学威力】各等级下的威力（外功：最强一招的攻击值；内功、轻功：标准招式折算）');
console.log(pad('武学', 24) + [10, 20, 40, 70, 100, 140, 180].map((l) => pad(l + '级', 7)).join('') + '来源');
for (const sk of Object.values(db.skill)) {
  const src = sk.props.sect ? db.sect[sk.props.sect]?.props.name : sk.id.startsWith('base.') ? '武馆' : `剧情（上限 ${sk.props.cap ?? '-'}）`;
  console.log(pad(`${sk.props.name}（${sk.props.kind}${sk.props.stance ? '·' + sk.props.stance : ''}）`, 24) + [10, 20, 40, 70, 100, 140, 180].map((l) => pad(skillPower(db, sk.id, l), 7)).join('') + src);
}

console.log('\n【战斗力】剧情战斗（必须打赢的才计入；最强的敌人）');
for (const [line, s] of Object.entries(index.storylines)) {
  for (const f of [...(s.hook ?? []), ...(s.files ?? [])]) {
    for (const b of byFile[f].filter((x) => x.type === 'battle')) {
      const foes = (b.props.enemies ?? '').split(',').map((x) => x.trim());
      console.log(`  ${pad(f, 18)} ${pad(b.id, 26)} 战斗力 ${pad(battlePower(db, b.id), 5)}${b.props.lose ? '（允许输，不计入）' : ''}  ${foes.map((id) => `${db.enemy[id]?.props.name} ${enemyPower(db, id)}`).join('、')}`);
    }
  }
}

console.log('\n【剧情武学检查】授予时的威力 ≤ 到这一章为止打赢过的最强战斗力');
const storylines = Object.fromEntries(Object.entries(index.storylines).map(([k, s]) => [k, [...(s.hook ?? []), ...(s.files ?? [])]]));
let bad = 0;
for (const r of checkStoryGrants(db, storylines, byFile)) {
  if (!r.ok) bad++;
  console.log(`  ${r.ok ? '✓' : '✗'} ${pad(r.file, 18)} ${pad(db.skill[r.skill].props.name + ' 上限 ' + r.cap, 22)} 威力 ${pad(r.wp, 5)} 已打赢的战斗力 ${r.cp}　（${r.where}）`);
}
console.log(bad ? `\n✗ ${bad} 处超出` : '\n✓ 全部符合');
process.exit(bad ? 1 : 0);
