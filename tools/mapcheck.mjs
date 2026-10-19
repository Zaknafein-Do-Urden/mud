// 地图布局检查：node tools/mapcheck.mjs [-v]
// 用 src/ui/map.js 的 layout 给每个区域排一遍（出口取房间本身 + 所有 patch 的并集，即各主线都走到最后），报出：
// 1. 出口按钮（通往别的区域）原定的格子被房间占了，只好挪开——以前不挪，按钮直接压在房间上（D-131）
// 2. 区域内的房间没排在出口方向上（格子被占，螺旋挪到了别处），地图上的方位和文字说的不一致
// 3. 连线从别的房间框（或出口按钮）中间穿过去，看着像连到了那个房间
// 第 1 类引擎已经处理，列出来供参考；2、3 类要改内容（换方向）才能消，-v 列出明细。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, parseMap } from '../src/content.js';
import { layout, regionOf } from '../src/ui/map.js';

const verbose = process.argv.includes('-v');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];

const room = {};
const patches = {};
for (const f of files) {
  for (const b of parse(readFileSync(join(root, f), 'utf8'), f)) {
    if (b.type === 'room') room[b.id] = b;
    if (b.type === 'patch') (patches[b.id] ??= []).push(b);
  }
}
const game = {
  db: { room },
  exitsOf: (id) => Object.assign(parseMap(room[id]?.props.exits), ...(patches[id] ?? []).map((p) => parseMap(p.props.exits))),
};

const VEC = { 北: [0, -1], 南: [0, 1], 东: [1, 0], 西: [-1, 0], 东北: [1, -1], 西北: [-1, -1], 东南: [1, 1], 西南: [-1, 1] };
const name = (id) => room[id]?.props.name ?? id;
// 线段 (a→b) 是否穿过以 c 为中心的房间框（格子单位：框宽 76/92、框高 26/50）
const hw = 76 / 92 / 2, hh = 26 / 50 / 2;
function crosses([x1, y1], [x2, y2], [cx, cy]) {
  for (let i = 1; i < 40; i++) {
    const t = i / 40, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
    if (Math.abs(x - cx) < hw && Math.abs(y - cy) < hh) return true;
  }
  return false;
}

const regions = [...new Set(Object.keys(room).map(regionOf))].sort();
const found = { out: [], dir: [], cross: [] };
for (const region of regions) {
  const { pos, outs } = layout(game, region);
  for (const o of outs.values()) if (o.moved) found.out.push(`${name(o.from)} —${o.dir}→ ${name(o.to)}`);
  const seen = new Set();
  for (const [a, pa] of pos) {
    for (const [dir, b] of Object.entries(game.exitsOf(a))) {
      if (!pos.has(b)) continue;
      const pb = pos.get(b);
      const v = VEC[dir];
      if (v && (pb[0] !== pa[0] + v[0] || pb[1] !== pa[1] + v[1])) found.dir.push(`${name(a)} —${dir}→ ${name(b)}`);
      const k = [a, b].sort().join('|');
      if (seen.has(k)) continue;
      seen.add(k);
      for (const [c, pc] of pos) if (c !== a && c !== b && crosses(pa, pb, pc)) found.cross.push(`${name(a)} — ${name(b)} 的连线穿过 ${name(c)}`);
    }
    for (const o of outs.values()) {
      if (o.from !== a) continue;
      for (const [c, pc] of pos) if (c !== a && crosses(pa, [o.x, o.y], pc)) found.cross.push(`${name(a)} —${o.dir}→ ${name(o.to)}（按钮）的连线穿过 ${name(c)}`);
      for (const q of outs.values()) if (q !== o && crosses(pa, [o.x, o.y], [q.x, q.y])) found.cross.push(`${name(a)} —${o.dir}→ ${name(o.to)}（按钮）的连线穿过 ${name(q.to)}（按钮）`);
    }
  }
}

const show = (title, list, always) => {
  console.log(`${list.length ? '⚠' : '✓'} ${title}：${list.length} 处`);
  if (always || verbose) for (const s of list) console.log('    ' + s);
};
show('出口按钮原位被房间占用，已挪开', found.out, true);
show('房间不在出口方向上', found.dir);
show('连线穿过别的房间', found.cross);
