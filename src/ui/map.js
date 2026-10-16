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
 */
function layout(game, region) {
  const rooms = Object.keys(game.db.room).filter((id) => regionOf(id) === region);
  const pos = new Map();
  const used = new Set();
  const key = (x, y) => `${x},${y}`;
  const place = (id, x, y) => {
    let [px, py] = [x, y];
    for (let r = 1; used.has(key(px, py)); r++) {
      // 螺旋找空格
      const ring = [];
      for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r) ring.push([x + dx, y + dy]);
      const free = ring.find(([a, b]) => !used.has(key(a, b)));
      if (free) [px, py] = free;
    }
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
  return pos;
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
export function renderMap(root, game, onWalk) {
  const here = game.state.player.room;
  const region = regionOf(here);
  // 每次重新布局：开销很小，而且出口可能随剧情标记变化（patch）
  const pos = layout(game, region);
  const visited = game.state.visited;

  // 要画的房间：去过的 + 与去过的相邻的（同区域）
  const shown = new Set([...pos.keys()].filter((id) => visited[id]));
  const unknown = new Set();
  for (const id of shown) for (const to of Object.values(game.exitsOf(id))) if (pos.has(to) && !shown.has(to)) unknown.add(to);
  const all = [...shown, ...unknown];
  if (!all.length) { root.replaceChildren(); return; }

  const xs = all.map((id) => pos.get(id)[0]);
  const ys = all.map((id) => pos.get(id)[1]);
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
      } else if (game.db.room[to] && regionOf(to) !== region) {
        // 通往其他区域：画一个指向该方向的小箭头和区域名
        const [dx, dy] = VEC[dir] ?? [0, 1];
        const x = cx(id) + dx * (BW / 2 + 14);
        const y = cy(id) + dy * (BH / 2 + 12);
        svg.append(svgEl('line', { x1: cx(id) + dx * BW / 2, y1: cy(id) + dy * BH / 2, x2: x, y2: y, class: 'map-link out' }));
        const t = svgEl('text', { x, y: y + (dy >= 0 ? 12 : -4), class: 'map-out', 'text-anchor': 'middle' });
        t.textContent = visited[to] ? shortName(game.db.room[to].props.name) : '→';
        svg.append(t);
      }
    }
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
}
