// 区域地图：按出口方向自动布局（D-021、D-034），SVG 绘制。
// 只画去过的房间；与去过的房间相邻、但没去过的画成虚线问号。点击去过的房间自动寻路。

const VEC = {
  北: [0, -1], 南: [0, 1], 东: [1, 0], 西: [-1, 0],
  东北: [1, -1], 西北: [-1, -1], 东南: [1, 1], 西南: [-1, 1],
};
const CW = 92; // 格宽
const CH = 50; // 格高
const BW = 76; // 房间框宽
const BH = 26; // 房间框高

/** 房间所属区域：id 去掉最后一段（linan.gate → linan，shediao.niujia.tavern → shediao.niujia） */
export function regionOf(id) {
  const i = id.lastIndexOf('.');
  return i < 0 ? id : id.slice(0, i);
}

/** 地图上显示的短名：去掉"临安城·"之类的前缀和括号说明 */
function shortName(name) {
  return name.replace(/^.*·/, '').replace(/（.*$/, '');
}

/**
 * 给一个区域的房间分配格子坐标。以区域内第一个房间为原点做广度优先，
 * 按出口方向放置；格子被占用时就近找空格。原点固定，所以走动时地图不会跳。
 * 通往其他区域的出口按钮也占格子（D-131）：主线挂在城里的地方（如醉仙楼 shediao.jiaxing.zuixian）
 * 属于别的区域，画成按钮，以前按钮不占格，会压在同方向的房间上。
 * 返回 { pos: 房间 → [x, y], outs: "来处|去处" → {from, to, dir, x, y, moved} }。
 */
export function layout(game, region) {
  const rooms = Object.keys(game.db.room).filter((id) => regionOf(id) === region);
  const pos = new Map();
  const used = new Set();
  const key = (x, y) => `${x},${y}`;
  const btns = []; // 已放好的出口按钮位置
  // 从 a 到 b 的连线是否穿过别的房间框或出口按钮
  const crosses = ([x1, y1], [x2, y2]) => [...pos.values(), ...btns].some(([cx, cy]) => {
    if ((cx === x1 && cy === y1) || (cx === x2 && cy === y2)) return false;
    for (let t = 0.05; t < 1; t += 0.05) {
      if (Math.abs(x1 + (x2 - x1) * t - cx) * CW < BW / 2 && Math.abs(y1 + (y2 - y1) * t - cy) * CH < BH / 2) return true;
    }
    return false;
  });
  // 螺旋找空格：内圈优先，同一圈里离预定位置最近的优先，其次离 near（出口的来处）近的。
  // 给了 near（出口按钮）时在三圈内挑：先挑大致在出口方向上（夹角小于 90°）、连线不穿过别的房间的，
  // 免得"西北"的按钮画到正南；没有就挑连线不穿房间的；再没有就用最近的空格
  const free = (x, y, near) => {
    if (!used.has(key(x, y))) return [x, y];
    const d = ([a, b], [c, e]) => (a - c) ** 2 + (b - e) ** 2;
    const cand = [];
    for (let r = 1; !near ? !cand.length : r <= 3 || !cand.length; r++) {
      const ring = [];
      for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r) ring.push([x + dx, y + dy]);
      cand.push(...ring.filter(([a, b]) => !used.has(key(a, b)))
        .sort((p, q) => d(p, [x, y]) - d(q, [x, y]) || (near ? d(p, near) - d(q, near) : 0)));
    }
    if (!near) return cand[0];
    const ahead = ([a, b]) => (a - near[0]) * (x - near[0]) + (b - near[1]) * (y - near[1]) > 0;
    return cand.find((p) => ahead(p) && !crosses(near, p)) ?? cand.find((p) => !crosses(near, p)) ?? cand[0];
  };
  const place = (id, x, y) => {
    const [px, py] = free(x, y);
    pos.set(id, [px, py]);
    used.add(key(px, py));
  };
  let offset = 0;
  for (const start of rooms) {
    if (pos.has(start)) continue;
    // 区域内不连通的部分各自布局，横向错开
    place(start, offset, 0);
    const queue = [start];
    while (queue.length) {
      const id = queue.shift();
      const [x, y] = pos.get(id);
      for (const [dir, to] of Object.entries(game.exitsOf(id))) {
        if (pos.has(to) || regionOf(to) !== region || !game.db.room[to]) continue;
        const [dx, dy] = VEC[dir] ?? [1, 1];
        place(to, x + dx, y + dy);
        queue.push(to);
      }
    }
    offset = Math.max(...[...pos.values()].map(([x]) => x)) + 2;
  }
  // 出口按钮：放在出口方向上一格；没挪的往来处收一点（0.95），看着连在一起。
  // 先放原位空着的，再给原位被房间占了的就近找格子——免得挪开的按钮抢了别人的原位，或者连线压着别的按钮
  const outs = new Map();
  const pending = [];
  for (const [from, [x, y]] of pos) {
    for (const [dir, to] of Object.entries(game.exitsOf(from))) {
      if (!game.db.room[to] || regionOf(to) === region) continue;
      const [dx, dy] = VEC[dir] ?? [0, 1];
      const o = { from, to, dir, moved: used.has(key(x + dx, y + dy)) };
      outs.set(`${from}|${to}`, o);
      if (o.moved) { pending.push([o, x, y, dx, dy]); continue; }
      used.add(key(x + dx, y + dy));
      Object.assign(o, { x: x + dx * 0.95, y: y + dy * 0.95 });
      btns.push([o.x, o.y]);
    }
  }
  for (const [o, x, y, dx, dy] of pending) {
    [o.x, o.y] = free(x + dx, y + dy, [x, y]);
    used.add(key(o.x, o.y));
    btns.push([o.x, o.y]);
  }
  return { pos, outs };
}

/** 在已访问房间之间找最短路径，返回方向序列 */
export function findPath(game, from, to) {
  const prev = new Map([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const id = queue.shift();
    if (id === to) break;
    for (const [dir, next] of Object.entries(game.exitsOf(id))) {
      if (prev.has(next) || !game.state.visited[next]) continue;
      prev.set(next, [id, dir]);
      queue.push(next);
    }
  }
  if (!prev.has(to)) return null;
  const dirs = [];
  for (let cur = to; prev.get(cur); cur = prev.get(cur)[0]) dirs.unshift(prev.get(cur)[1]);
  return dirs;
}

const SVG = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

/**
 * @param {HTMLElement} root
 * @param {import('../game.js').Game} game
 * @param {(roomId: string) => void} onWalk 点击去过的房间
 */
export function renderMap(root, game, onWalk, override) {
  const here = override?.room ?? game.state.player.room;
  const region = regionOf(here);
  // 每次重新布局：开销很小，而且出口可能随剧情标记变化（patch）
  const { pos, outs: allOuts } = layout(game, region);
  const visited = override ? Object.fromEntries([...(override.visited ?? []), here].map((r) => [r, true])) : game.state.visited;

  // 要画的房间：去过的 + 与去过的相邻的（同区域）
  const shown = new Set([...pos.keys()].filter((id) => visited[id]));
  const unknown = new Set();
  for (const id of shown) for (const to of Object.values(game.exitsOf(id))) if (pos.has(to) && !shown.has(to)) unknown.add(to);
  const all = [...shown, ...unknown];
  if (!all.length) { root.replaceChildren(); return; }

  // 通往其他区域的出口：画成按钮（D-084），位置在 layout 里定好；算进画布范围，不会被裁掉
  const outs = new Map(); // 目标房间 → {from, dir, x, y}
  for (const o of allOuts.values()) if (shown.has(o.from) && !outs.has(o.to)) outs.set(o.to, o);

  const xs = [...all.map((id) => pos.get(id)[0]), ...[...outs.values()].map((o) => o.x)];
  const ys = [...all.map((id) => pos.get(id)[1]), ...[...outs.values()].map((o) => o.y)];
  const minX = Math.min(...xs) - 0.7;
  const minY = Math.min(...ys) - 0.7;
  const w = (Math.max(...xs) - minX + 0.7) * CW;
  const h = (Math.max(...ys) - minY + 0.7) * CH;
  const cx = (id) => (pos.get(id)[0] - minX) * CW;
  const cy = (id) => (pos.get(id)[1] - minY) * CH;

  const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, class: 'map-svg', role: 'img', 'aria-label': '区域地图' });

  // 连线（只画至少一端去过的）
  const drawn = new Set();
  for (const id of shown) {
    for (const [dir, to] of Object.entries(game.exitsOf(id))) {
      if (pos.has(to) && all.includes(to)) {
        const k = [id, to].sort().join('|');
        if (drawn.has(k)) continue;
        drawn.add(k);
        svg.append(svgEl('line', { x1: cx(id), y1: cy(id), x2: cx(to), y2: cy(to), class: 'map-link' + (shown.has(to) ? '' : ' unknown') }));
      }
    }
  }

  // 其他区域的出口按钮：去过的写地名，点击自动走过去；没去过的写"？"
  const ox = (o) => (o.x - minX) * CW;
  const oy = (o) => (o.y - minY) * CH;
  for (const [to, o] of outs) {
    const known = !!visited[to];
    svg.append(svgEl('line', { x1: cx(o.from), y1: cy(o.from), x2: ox(o), y2: oy(o), class: 'map-link out' }));
    const g = svgEl('g', { class: 'map-room map-exit' + (known ? '' : ' unknown'), 'data-room': to });
    g.append(svgEl('rect', { x: ox(o) - BW / 2, y: oy(o) - BH / 2, width: BW, height: BH, rx: 10 }));
    const t = svgEl('text', { x: ox(o), y: oy(o) + 4, 'text-anchor': 'middle' });
    // 跨区域的按钮写区域名（"牛家村·村口"写"牛家村"），没有区域前缀的写全名；
    // 同一座城里主线挂的地方（"嘉兴·醉仙楼"挂在"嘉兴·十字街"上）写地名，不然按钮上写着"嘉兴"让人以为要出城
    const nm = game.db.room[to].props.name;
    const city = (n) => (n.includes('·') ? n.split('·')[0] : null);
    const sameCity = city(nm) && city(nm) === city(game.db.room[o.from].props.name);
    t.textContent = known ? `${city(nm) && !sameCity ? city(nm) : shortName(nm)} ›` : `${o.dir} ›`;
    g.append(t);
    const title = svgEl('title', {});
    title.textContent = known ? `${game.db.room[to].props.name}（点击前往）` : '还没去过';
    g.append(title);
    if (known) g.addEventListener('click', () => onWalk(to));
    svg.append(g);
  }

  // 房间
  for (const id of all) {
    const known = shown.has(id);
    const g = svgEl('g', { class: 'map-room' + (id === here ? ' here' : '') + (known ? '' : ' unknown'), 'data-room': id });
    g.append(svgEl('rect', { x: cx(id) - BW / 2, y: cy(id) - BH / 2, width: BW, height: BH, rx: 4 }));
    const t = svgEl('text', { x: cx(id), y: cy(id) + 4, 'text-anchor': 'middle' });
    t.textContent = known ? shortName(game.db.room[id].props.name) : '？';
    g.append(t);
    if (known) {
      const title = svgEl('title', {});
      title.textContent = game.db.room[id].props.name + (id === here ? '（你在这里）' : '（点击前往）');
      g.append(title);
      if (id !== here) g.addEventListener('click', () => onWalk(id));
    }
    svg.append(g);
  }

  root.replaceChildren(svg);
  // 按格子的实际大小画，不随容器缩小（D-093）：手机上 --map-scale 放大，点得准；区域太大就在容器里滚动
  svg.style.width = `max(100%, calc(var(--map-scale, 1) * ${Math.round(w)}px))`;
  // 当前位置滚到可见处
  requestAnimationFrame(() => {
    const me = svg.querySelector('.map-room.here');
    if (!me) return;
    const r = me.getBoundingClientRect();
    const c = root.getBoundingClientRect();
    root.scrollLeft += r.left + r.width / 2 - (c.left + c.width / 2);
    root.scrollTop += r.top + r.height / 2 - (c.top + c.height / 2);
  });
}
