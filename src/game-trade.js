// 引擎的经济部分：金钱、市场、钱庄、马车。以方法的形式并入 Game（见 game.js 末尾）。

import { goodsPrice, goodsLocal, cargoUnits, cargoValue, robberyChance, robbers, routesOf, cityOfRoom, CARGO_CAP, SELL_RATE } from './economy.js';
import { createScaledBattle, beginRound, enemiesOf } from './combat.js';

const ALL = ['全部', 'all'];

export const trade = {
  addMoney(n) {
    const p = this.state.player;
    p.money = Math.max(0, (p.money ?? 0) + n);
    if (n) this.emit('sys', n > 0 ? `你得到了 ${n} 文钱。（现有 ${p.money} 文）` : `你付出了 ${-n} 文钱。（现有 ${p.money} 文）`);
  },

  cityHere() { return cityOfRoom(this.db, this.state.player.room); },

  // ---- 市场 ----

  /**
   * 当前城市的全部货物 [{id, name, buy, sell, local}]（D-076）：
   * 每种货都有价、都能卖；local 为 false 的是本地没有的货，不能买。
   */
  marketList() {
    const city = this.cityHere();
    return Object.values(this.db.goods)
      .map((g) => {
        const price = goodsPrice(this.db, city, g.id, this.state.day ?? 1);
        return price === null ? null : { id: g.id, name: g.props.name, buy: price, sell: Math.round(price * SELL_RATE), local: goodsLocal(this.db, city, g.id) };
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.local) - Number(a.local)); // 本地有的货排前面
  },

  inMarket() {
    if (this.room()?.props.market === 'true') return true;
    this.emit('err', '这里不是市集。去城里的市集买卖货物。');
    return false;
  },

  showMarket() {
    if (!this.inMarket()) return;
    const p = this.state.player;
    const city = this.db.city[this.cityHere()];
    this.emit('sys', `【${city?.props.name ?? ''}市集　第 ${this.state.day ?? 1} 日行情】（买 货名 数量 / 卖 货名 数量；数量可写"全部"）`);
    for (const g of this.marketList()) {
      const have = p.cargo?.[g.id] ?? 0;
      this.emit('sys', `　[[${g.name}|${g.id}]]${g.local ? '（特产）' : ''}　${g.local ? `买入 ${g.buy}` : '本地无货'}　卖出 ${g.sell}${have ? `　车上 ${have} 件` : ''}`);
    }
    this.emit('sys', '　特产便宜，运到不产它的地方卖；离产地越远卖得越贵，路上也越容易遇到劫匪。');
    this.emit('sys', `马车载货 ${cargoUnits(p.cargo)}/${CARGO_CAP} 件　身上 ${p.money ?? 0} 文`);
  },

  findGoods(name) {
    return Object.keys(this.db.goods).find((id) => id === name || this.db.goods[id].props.name === name);
  },

  buy(arg) {
    if (!this.inMarket()) return;
    const [name, qtyStr] = arg.split(/\s+/);
    const p = this.state.player;
    const g = this.marketList().find((x) => x.id === this.findGoods(name));
    if (!g) { this.emit('err', name ? `没有「${name}」这种货。输入 行情 看看。` : '买什么？例如：买 丝绸 5'); return; }
    if (!g.local) { this.emit('err', `${g.name}不是本地特产，这里买不到；带来的${g.name}倒是可以在这里卖个好价钱。`); return; }
    const room = CARGO_CAP - cargoUnits(p.cargo);
    const afford = Math.floor((p.money ?? 0) / g.buy);
    const qty = ALL.includes(qtyStr) ? Math.min(room, afford) : Number(qtyStr ?? 1);
    if (!Number.isInteger(qty) || qty <= 0) { this.emit('err', room <= 0 ? '马车已经装满了。' : afford <= 0 ? '你的钱不够。' : '数量要写正整数。'); return; }
    if (qty > room) { this.emit('err', `马车只剩 ${room} 件的空位。`); return; }
    if (qty * g.buy > (p.money ?? 0)) { this.emit('err', `钱不够：${qty} 件${g.name}要 ${qty * g.buy} 文，你只有 ${p.money ?? 0} 文。`); return; }
    p.money -= qty * g.buy;
    p.cargo[g.id] = (p.cargo[g.id] ?? 0) + qty;
    this.emit('sys', `你买了 ${qty} 件${g.name}，花去 ${qty * g.buy} 文，装上了马车。（余 ${p.money} 文）`);
  },

  sell(arg) {
    if (!this.inMarket()) return;
    const [name, qtyStr] = arg.split(/\s+/);
    const p = this.state.player;
    const id = this.findGoods(name);
    const have = p.cargo?.[id] ?? 0;
    if (!have) { this.emit('err', name ? `车上没有「${name}」。` : '卖什么？例如：卖 丝绸 全部'); return; }
    const g = this.marketList().find((x) => x.id === id); // 任何货都能卖（D-076）
    const qty = ALL.includes(qtyStr) || qtyStr === undefined ? have : Number(qtyStr);
    if (!Number.isInteger(qty) || qty <= 0 || qty > have) { this.emit('err', `数量不对，车上有 ${have} 件。`); return; }
    p.cargo[id] -= qty;
    if (!p.cargo[id]) delete p.cargo[id];
    p.money += qty * g.sell;
    this.emit('sys', `你卖出 ${qty} 件${g.name}，得 ${qty * g.sell} 文。（现有 ${p.money} 文）`);
  },

  showCargo() {
    const p = this.state.player;
    const items = Object.entries(p.cargo ?? {});
    this.emit('sys', items.length
      ? `马车上：${items.map(([id, n]) => `[[${this.db.goods[id]?.props.name}|${id}]]×${n}`).join('、')}（${cargoUnits(p.cargo)}/${CARGO_CAP} 件）`
      : `马车上空空的。（可载 ${CARGO_CAP} 件）`);
  },

  // ---- 钱庄（无利息，D-040）----

  inBank() {
    if (this.room()?.props.bank === 'true') return true;
    this.emit('err', '这里没有钱庄。');
    return false;
  },

  deposit(arg) {
    if (!this.inBank()) return;
    const p = this.state.player;
    const n = ALL.includes(arg) ? p.money : Number(arg);
    if (!Number.isInteger(n) || n <= 0 || n > p.money) { this.emit('err', `存多少？你身上有 ${p.money} 文。例如：存 100 或 存 全部`); return; }
    p.money -= n;
    p.bank = (p.bank ?? 0) + n;
    this.emit('sys', `你存入 ${n} 文，掌柜开了一张银票给你。（存款 ${p.bank} 文，身上 ${p.money} 文）`);
  },

  withdraw(arg) {
    if (!this.inBank()) return;
    const p = this.state.player;
    const n = ALL.includes(arg) ? p.bank ?? 0 : Number(arg);
    if (!Number.isInteger(n) || n <= 0 || n > (p.bank ?? 0)) { this.emit('err', `取多少？你的存款有 ${p.bank ?? 0} 文。`); return; }
    p.bank -= n;
    p.money += n;
    this.emit('sys', `你取出 ${n} 文。（存款 ${p.bank} 文，身上 ${p.money} 文）`);
  },

  showBank() {
    if (!this.inBank()) return;
    const p = this.state.player;
    this.emit('sys', `存款 ${p.bank ?? 0} 文，身上 ${p.money ?? 0} 文。各地钱庄通兑；存款没有利息，但不会被劫走。`);
  },

  // ---- 马车 ----

  atStation() { return this.room()?.props.station === 'true'; },

  /** 车马行：列出可去的城市，作为一组选项（复用对话的选择机制） */
  showStation(target) {
    if (!this.atStation()) { this.emit('err', '要坐马车，得去城里的车马行。'); return; }
    const from = this.cityHere();
    const routes = routesOf(this.db, from);
    const units = cargoUnits(this.state.player.cargo);
    if (target) {
      const to = Object.keys(routes).find((id) => id === target || this.db.city[id]?.props.name === target);
      if (!to) { this.emit('err', `从这里没有直达「${target}」的马车。`); return; }
      this.travel(to);
      return;
    }
    this.emit('sys', `车把式：客官要去哪里？（身上 ${this.state.player.money ?? 0} 文，车上货物 ${units} 件）`);
    const choices = Object.entries(routes).map(([id, days]) => ({
      text: `${this.db.city[id].props.name}　${days} 日路程`,
      target: null, cond: [], effects: [`travel:${id}`],
    }));
    choices.push({ text: '不坐了', target: null, cond: [], effects: [] });
    this.dialog = choices;
    this.dialogId = null;
    delete this.state.dialog;
    this.emitChoices();
  },

  travel(to) {
    const p = this.state.player;
    const from = this.cityHere();
    const days = routesOf(this.db, from)[to];
    if (!this.atStation() || !days) { this.emit('err', '从这里去不了那里。'); return; }
    this.state.day = (this.state.day ?? 1) + days;
    const dest = this.db.city[to];
    this.emit('story', `你坐上马车，往${dest.props.name}去了。`);

    // 劫道：货越值钱越容易被盯上；劫匪的强弱看货物加身上现钱（D-040）
    const value = cargoValue(this.db, p.cargo);
    if (Math.random() < robberyChance(days, value)) {
      const { level, count } = robbers(value + (p.money ?? 0));
      const foe = Object.keys(this.db.enemy).find((id) => this.db.enemy[id].props.robber === 'true');
      if (foe) {
        this.normalizeHp();
        this.state.battle = createScaledBattle(this.db, Array(count).fill(foe), level,
          { players: this.partyPlayers(), robbery: { to }, noFlee: true }, (Date.now() ^ (Math.random() * 1e9)) | 0);
        this.emit('desc', '走到半路，前面林子里一声呼哨，几条汉子拦住了马车。');
        this.emit('combat', `——遭遇劫道！${enemiesOf(this.state.battle).map((e) => e.name).join('、')}——`);
        beginRound(this.db, this.state.battle, (cls, text, extra) => this.emit(cls, text, extra));
        return;
      }
    }
    this.arrive(to, days);
  },

  arrive(to, days) {
    const dest = this.db.city[to];
    if (days) this.emit('sys', `一路颠簸了 ${days} 天，马车到了${dest.props.name}。（第 ${this.state.day} 日）`);
    this.enter(dest.props.station);
  },

  /** 劫道战斗结束：赢了照常到达；输了货物全失、现钱减半 */
  endRobbery(b, result) {
    const p = this.state.player;
    if (result === 'win') {
      const pot = enemiesOf(b).reduce((s, e) => s + e.potential, 0);
      p.potential += pot;
      this.emit('combat', `——你打退了劫匪！获得潜能 ${pot} 点。——`);
    } else {
      const lost = Math.floor((p.money ?? 0) / 2);
      p.money -= lost;
      p.cargo = {};
      p.hp = Math.max(1, Math.round(this.hpMax() * 0.3));
      this.emit('combat', '——你寡不敌众，被打倒在地。——');
      this.emit('story', `劫匪抢走了车上所有的货物，还从你身上搜走了 ${lost} 文钱。车把式哆哆嗦嗦地把你扶上车，继续赶路。`);
    }
    this.arrive(b.robbery.to, 0);
  },

  /** UI 用：大地图数据 */
  worldView() {
    const here = this.cityHere();
    const visitedCity = new Set(Object.keys(this.state.visited).map((r) => cityOfRoom(this.db, r)).filter(Boolean));
    const cities = Object.values(this.db.city).map((c) => {
      const [x, y] = (c.props.pos ?? '0,0').split(',').map(Number);
      return { id: c.id, name: c.props.name, x, y, here: c.id === here, visited: visitedCity.has(c.id), brief: c.lines.map((l) => l.text).join('') };
    });
    const seen = new Set();
    const routes = [];
    for (const c of cities) {
      for (const [to, days] of Object.entries(routesOf(this.db, c.id))) {
        const k = [c.id, to].sort().join('|');
        if (seen.has(k) || !this.db.city[to]) continue;
        seen.add(k);
        routes.push({ a: c.id, b: to, days });
      }
    }
    const reach = this.atStation() ? routesOf(this.db, here) : {};
    return { cities, routes, here, atStation: this.atStation(), reach, units: cargoUnits(this.state.player.cargo) };
  },
};
