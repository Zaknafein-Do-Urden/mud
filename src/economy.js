// 经济：货物价格、车资、劫道概率。纯函数。见 docs/ECONOMY.md。

import { CONFIG } from './config.js';
import { parseNums } from './character.js';

export const CARGO_CAP = CONFIG.economy.cargoCap; // 马车最多装 100 件货（D-077）
export const SELL_RATE = CONFIG.economy.sellRate; // 卖价是行情价的九成（买卖差价）

/** 稳定的伪随机 0~1：同一城市、货物、日子总是同一个数（价格每天波动，刷新页面不变） */
function hash01(...parts) {
  let h = 2166136261;
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// 价格的大方针（D-077）：本地特产便宜（城市 goods 里列的，倍率 0.6~0.7），本地没有的货贵。
// 跑商就是把特产运到不产它的地方卖，再收当地的特产运回来。离产地越远越贵，赚得越多，但路上被劫的机会也越大。
// 每天的波动只有 ±10%，保证"特产 → 最近的外地"最坏也有三成左右的赚头。
export const WAVE = CONFIG.economy.wave;
export const FOREIGN_BASE = CONFIG.economy.foreignBase; // 外地货：基础倍率
export const FOREIGN_PER_DAY = CONFIG.economy.foreignPerDay; // 离最近产地每多一天路程 +0.06
export const FOREIGN_CAP = CONFIG.economy.foreignCap;

/** 这座城市是否出产这种货（本地特产才能买） */
export function goodsLocal(db, cityId, goodsId) {
  return parseNums(db.city[cityId]?.props.goods)[goodsId] !== undefined;
}

/** 从某城市出发，到各城市的最短路程（天） */
export function travelDays(db, from) {
  const dist = { [from]: 0 };
  const todo = new Set([from]);
  while (todo.size) {
    const cur = [...todo].reduce((a, b) => (dist[a] <= dist[b] ? a : b));
    todo.delete(cur);
    for (const [next, d] of Object.entries(routesOf(db, cur))) {
      if (dist[next] === undefined || dist[cur] + d < dist[next]) { dist[next] = dist[cur] + d; todo.add(next); }
    }
  }
  return dist;
}

/** 某城市的价格倍率：特产按城市写的倍率；外地货按离最近产地的路程（D-077） */
export function goodsMult(db, cityId, goodsId) {
  const own = parseNums(db.city[cityId]?.props.goods)[goodsId];
  if (own !== undefined) return own;
  const dist = travelDays(db, cityId);
  const producers = Object.values(db.city).filter((c) => goodsLocal(db, c.id, goodsId) && dist[c.id] !== undefined);
  const days = producers.length ? Math.min(...producers.map((c) => dist[c.id])) : 10;
  return Math.min(FOREIGN_CAP, FOREIGN_BASE + FOREIGN_PER_DAY * days);
}

/** 某城市当天某货物的行情价（买入价；卖出价再打九折） */
export function goodsPrice(db, cityId, goodsId, day) {
  const g = db.goods[goodsId];
  if (!db.city[cityId] || !g) return null;
  const wave = 1 - WAVE + 2 * WAVE * hash01(cityId, goodsId, day);
  return Math.max(1, Math.round(Number(g.props.price) * goodsMult(db, cityId, goodsId) * wave));
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

/** 被劫的概率：路途越远、货越值钱，越容易被盯上。马车扩到 100 件后货值尺度从 2000 调到 5000（D-077） */
export function robberyChance(days, value) {
  const R = CONFIG.robbery;
  return Math.min(R.maxChance, R.perDay * days + R.valueWeight * (value / (value + R.valueScale)));
}

/** 雇镖师护送的价钱（D-104）：50 文起，加货值的 8% */
export function escortFee(value) {
  return Math.round(CONFIG.robbery.escortBaseFee + value * CONFIG.robbery.escortFeeRate);
}
/** 有镖师护送时，被劫的概率乘这个系数 */
export const ESCORT_RATE = CONFIG.robbery.escortRate;

/**
 * 劫匪的人数与难度系数：取决于货物价值加身上现钱（D-040）。
 * 强弱本身按我方战斗力自适应（D-115），货越值钱，盯上你的人越多、越狠（hard 1.0 ~ 1.2）。
 */
export function robbers(total) {
  const R = CONFIG.robbery;
  const count = 1 + R.countAt.filter((x) => total >= x).length;
  const hard = 1 + R.hardExtra * Math.min(1, Math.sqrt(total / R.hardScale));
  return { count, hard };
}

/** 主角的武功水平：出招武功的平均等级（劫匪等按这个生成武功等级，D-115） */
export function martialLevel(p) {
  const lvs = (p.loadout?.outer ?? []).map((id) => p.skills?.[id] ?? 0).filter((x) => x > 0);
  return Math.max(1, Math.round(lvs.length ? lvs.reduce((a, c) => a + c, 0) / lvs.length : 1));
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
