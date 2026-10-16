// 大地图：城市与马车路线（D-040）。城市坐标在内容的 city 块里手写（城市很少，手写最准）。
// 在车马行时，能直达的城市可以点击，直接乘车前往。

const SVG = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

/**
 * @param {HTMLElement} root
 * @param {HTMLElement} info 下方的说明文字
 * @param {ReturnType<import('../game.js').Game['worldView']>} view
 * @param {(cityId: string) => void} onTravel
 */
export function renderWorld(root, info, view, onTravel) {
  const svg = svgEl('svg', { viewBox: '0 0 640 400', class: 'world-svg', role: 'img', 'aria-label': '大地图' });
  const byId = Object.fromEntries(view.cities.map((c) => [c.id, c]));

  for (const r of view.routes) {
    const a = byId[r.a];
    const b = byId[r.b];
    const reach = view.atStation && ((r.a === view.here && view.reach[r.b]) || (r.b === view.here && view.reach[r.a]));
    svg.append(svgEl('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'w-route' + (reach ? ' reach' : '') }));
    const t = svgEl('text', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 6, class: 'w-days', 'text-anchor': 'middle' });
    t.textContent = `${r.days}日`;
    svg.append(t);
  }

  const defaultInfo = view.atStation
    ? '你在车马行。点击能直达的城市（虚线相连）即可乘车前往。'
    : '要坐马车，得去城里的车马行。';
  info.textContent = defaultInfo;

  for (const c of view.cities) {
    const reach = view.atStation && !!view.reach[c.id];
    const g = svgEl('g', { class: 'w-city' + (c.here ? ' here' : '') + (c.visited ? '' : ' unvisited') + (reach ? ' reach' : '') });
    g.append(svgEl('circle', { cx: c.x, cy: c.y, r: c.here ? 9 : 7 }));
    const t = svgEl('text', { x: c.x, y: c.y - 14, 'text-anchor': 'middle' });
    t.textContent = c.name + (c.here ? '（你在这里）' : '');
    g.append(t);
    g.addEventListener('mouseenter', () => { info.textContent = `${c.name}：${c.brief}`; });
    g.addEventListener('mouseleave', () => { info.textContent = defaultInfo; });
    if (reach) g.addEventListener('click', () => onTravel(c.id));
    svg.append(g);
  }
  root.replaceChildren(svg);
}
