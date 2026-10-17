// 当前目标的连贯性检查：node tools/goalcheck.mjs [主线id]
// 按 WRITING.md §9 第 5 条（D-226）：沿着章节顺序把剧情标记一个个设上，
// 每一步都看一眼界面上的"当前目标"——
//   · 不能一条都没有（玩家不知道该干什么）
//   · 选中的那一条不能来自更早的章节（上一章的收尾目标忘了删，会一直挡在前面）
// 引擎取目标用的是 Object.values(db.goal).find(...)，**先写的先中**，所以这种遮挡不会报错。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb } from '../src/content.js';
import { newState } from '../src/save.js';
import { Game } from '../src/game.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];

const db = emptyDb();
const srcOf = {}; // 目标 id → 它写在哪个文件
for (const f of files) {
  const blocks = parse(readFileSync(join(root, f), 'utf8'), f);
  for (const b of blocks) if (b.type === 'goal') srcOf[b.id] = f;
  addBlocks(db, blocks, f);
}

/**
 * 一个文件里按出现顺序设下的剧情标记。
 * 只认"效果"里的 flag:（块的 do: 和选项的 !flag:），不认条件里的 flag:——
 * 条件里的那些（done:、if:、?flag:）是读标记不是设标记，混进来会把章节提前判成已完成。
 */
function flagsIn(file) {
  const text = readFileSync(join(root, file), 'utf8');
  const out = [];
  const add = (f) => { if (!out.includes(f)) out.push(f); };
  for (const line of text.split('\n')) {
    const eff = [];
    const m = line.match(/^do:\s*(.*)$/);
    if (m) eff.push(...m[1].trim().split(/\s+/));
    for (const c of line.matchAll(/!([A-Za-z0-9_.:]+)/g)) eff.push(c[1]);
    for (const e of eff) { const f = e.match(/^flag:([A-Za-z0-9_.]+)$/); if (f) add(f[1]); }
  }
  return out;
}

const only = process.argv[2];
const problems = [];
const warnings = [];

for (const [id, line] of Object.entries(index.storylines)) {
  if (only && id !== only) continue;
  const chapterFiles = [...(line.hook ?? []), ...(line.files ?? [])];
  if (!chapterFiles.length) continue;

  const st = newState(db.meta.game.props.start);
  const g = new Game(db, st);
  st.flags[`${id}.started`] = true;

  const view = () => g.storyView().find((s) => s.id === id);
  const report = [];
  for (let i = 0; i < chapterFiles.length; i++) {
    const file = chapterFiles[i];
    for (const fl of flagsIn(file)) {
      st.flags[fl] = true;
      const all = Object.values(db.goal).filter((x) => x.props.storyline === id && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean)));
      const picked = all[0];
      const where = picked ? chapterFiles.indexOf(srcOf[picked.id]) : -1;
      if (!picked) warnings.push(`${id} ${file}：设下 ${fl} 之后，一条当前目标都没有`);
      else if (where >= 0 && where < i) problems.push(`${id} ${file}：设下 ${fl} 之后，当前目标是「${picked.props.name}」——它写在更早的 ${srcOf[picked.id]}，挡住了本章的目标`);
      report.push(`${file}  ${fl.padEnd(28)} → ${picked ? picked.props.name : '（无）'}`);
    }
  }
  if (process.env.GOALCHECK_VERBOSE) report.forEach((r) => console.log('  ' + r));
  console.log(`${id}：走了 ${report.length} 步，${view().chapters.length} 章`);
}

// "一条目标都没有"只当提醒：本脚本把一个文件里的标记全部累加着设上，
// 互斥分支的标记会同时为真（比如既"上山"又"没上山"），带 !flag: 的目标就可能互相抵消。
if (warnings.length) {
  console.log(`注意 ${warnings.length} 处"当前目标为空"（互斥分支的标记同时为真也会这样，需自行判断）：`);
  warnings.slice(0, 12).forEach((w) => console.log('  · ' + w));
  if (warnings.length > 12) console.log(`  · ……还有 ${warnings.length - 12} 处`);
}
if (problems.length) { problems.forEach((p) => console.log('✗ ' + p)); process.exit(1); }
console.log('✓ 没有哪一步的当前目标被更早章节的目标挡住');
