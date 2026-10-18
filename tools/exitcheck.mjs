// 出口冲突检查：node tools/exitcheck.mjs
// 房间的出口是"原块 + 所有生效的 patch 逐方向合并"（src/game.js 的 merged），
// **同一个方向被后来的 patch 指到别处，原来的去处就没了**。
// 各条主线都往共享房间（车马行、少林）上挂剧情地区，八个方向很快就不够分，
// 于是经常出现"走到第 N 章，前面某个地方再也回不去"——validate 查不出来，玩家会卡死。
// 这个脚本把每个房间每个方向的所有去处列出来，有两个以上就报出来，由人判断。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '../src/content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];

const dirs = {}; // 房间 → 方向 → [{去处, 条件, 文件}]
for (const f of files) {
  for (const b of parse(readFileSync(join(root, f), 'utf8'), f)) {
    if (b.type !== 'room' && b.type !== 'patch') continue;
    if (!b.props.exits) continue;
    for (const part of b.props.exits.split(',')) {
      const [d, to] = part.trim().split('=');
      if (!d || !to) continue;
      ((dirs[b.id] ??= {})[d] ??= []).push({ to, cond: b.props.if ?? '（房间本身）', f });
    }
  }
}

let n = 0;
for (const [room, ds] of Object.entries(dirs)) {
  for (const [d, list] of Object.entries(ds)) {
    if (new Set(list.map((x) => x.to)).size < 2) continue;
    n++;
    console.log(`⚠ ${room} 的「${d}」有 ${new Set(list.map((x) => x.to)).size} 个去处，条件同时成立时只剩最后一个：`);
    for (const x of list) console.log(`    → ${x.to.padEnd(26)} if: ${x.cond}   [${x.f}]`);
  }
}
if (n) { console.log(`\n${n} 处冲突。换一个方向，或者把条件写成互斥的。`); process.exit(1); }
console.log('✓ 没有被顶掉的出口');
