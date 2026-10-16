// 经济：货物价格、车资、劫道概率。纯函数。见 docs/ECONOMY.md。

import { parseNums } from './character.js';

export const CARGO_CAP = 20; // 马车最多装 20 件货
export const SELL_RATE = 0.9; // 卖价是行情价的九成（买卖差价）

/** 稳定的伪随机 0~1：同一城市、货物、日子总是同一个数（价格每天波动，刷新页面不变） */
function hash01(...parts) {
  let h = 2166136261;
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** 某城市当天某货物的行情价；城市不收这种货时返回 null */
export function goodsPrice(db, cityId, goodsId, day) {
  const city = db.city[cityId];
  const mult = parseNums(city?.props.goods)[goodsId];
  const g = db.goods[goodsId];
  if (!mult || !g) return null;
  const wave = 0.85 + 0.3 * hash01(cityId, goodsId, day);
  return Math.max(1, Math.round(Number(g.props.price) * mult * wave));
}

export function cargoUnits(cargo) {
  return Object.values(cargo ?? {}).reduce((a, n) => a + n, 0);
}

/** 货物按基准价计算的价值（劫匪眼里的油水） */
export function cargoValue(db, cargo) {
  return Object.entries(cargo ?? {}).reduce((a, [id, n]) => a + n * Number(db.goods[id]?.props.price ?? 0), 0);
}

/** 车资：马车免费（D-047，用户决定）。保留函数，便于以后调整 */
export function fare() {
  return 0;
}

/** 被劫的概率：路途越远、货越值钱，越容易被盯上 */
export function robberyChance(days, value) {
  return Math.min(0.65, 0.03 * days + 0.5 * (value / (value + 2000)));
}

/** 劫匪的水平与人数：取决于货物价值加身上现钱 */
export function robbers(total) {
  const level = Math.min(90, Math.round(4 + 3 * Math.sqrt(total / 100)));
  const count = 1 + (total >= 3000 ? 1 : 0) + (total >= 15000 ? 1 : 0);
  return { level, count };
}

/** 城市间直达路线 {cityId: 天数} */
export function routesOf(db, cityId) {
  const out = { ...parseNums(db.city[cityId]?.props.routes) };
  // 路线是双向的：别的城市写了到这里的路线也算
  for (const c of Object.values(db.city)) {
    const r = parseNums(c.props.routes);
    if (r[cityId] && !out[c.id]) out[c.id] = r[cityId];
  }
  return out;
}

/** 房间所在的城市：房间 id 的第一段是城市 id，或者属于城市的 areas（如少林寺属于洛阳） */
export function cityOfRoom(db, roomId) {
  const head = roomId.split('.')[0];
  if (db.city[head]) return head;
  return Object.values(db.city).find((c) => (c.props.areas ?? '').split(',').map((s) => s.trim()).includes(head))?.id ?? null;
}
