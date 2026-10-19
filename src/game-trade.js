// 引擎的经济部分：金钱、市场、钱庄、马车。以方法的形式并入 Game（见 game.js 末尾）。

import { CONFIG } from './config.js';
import { escortFee, ESCORT_RATE, goodsPrice, goodsLocal, cargoUnits, cargoValue, robberyChance, robbers, martialLevel, routesOf, cityOfRoom, CARGO_CAP, SELL_RATE } from './economy.js';
import { createScaledBattle, beginRound, enemiesOf, adaptEnemyHp } from './combat.js';

const ALL = ['全部', 'all'];

// 马车奇遇（D-114）：没遇上劫道时碰上小故事的概率；选对了的奖励
const { rate: QIYU_RATE, recent: QIYU_RECENT, money: QIYU_MONEY, potential: QIYU_POT, attr: QIYU_ATTR,
  book: QIYU_BOOK, bookStep: QIYU_BOOK_STEP, bookMax: QIYU_BOOK_MAX } = CONFIG.qiyu; // 数值在 config.js

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
      text: `${this.db.city[id].props.name}　${days} 日路程${this.state.escort ? '（镖师随行）' : ''}`,
      target: null, cond: [], effects: [`travel:${id}`],
    }));
    // 雇镖师（D-104）：车上有货时才有意义；雇了只管下一趟
    const value = cargoValue(this.db, this.state.player.cargo);
    if (value > 0 && !this.state.escort) {
      const fee = escortFee(value);
      const c = { text: `雇镖师护送下一趟（${fee} 文：被劫的机会少一大半，遇上了镖师帮你打）`, target: null, cond: [`money:${fee}`], effects: ['escort'] };
      choices.unshift((this.state.player.money ?? 0) >= fee ? c : { ...c, disabled: true });
    }
    choices.push({ text: '不坐了', target: null, cond: [], effects: [] });
    this.dialog = choices;
    this.dialogId = null;
    delete this.state.dialog;
    this.emitChoices();
  },

  /** 雇镖师护送下一趟（D-104），雇完回到车马行的目的地列表 */
  hireEscort() {
    const fee = escortFee(cargoValue(this.db, this.state.player.cargo));
    if ((this.state.player.money ?? 0) < fee) { this.emit('err', '钱不够。'); return; }
    this.addMoney(-fee);
    this.state.escort = true;
    this.emit('sys', '镖局派了一个精壮的镖师跟车，镖旗插在车辕上。他只管这一趟。');
    this.showStation();
  },

  travel(to) {
    const p = this.state.player;
    const from = this.cityHere();
    const days = routesOf(this.db, from)[to];
    if (!this.atStation() || !days) { this.emit('err', '从这里去不了那里。'); return; }
    this.state.day = (this.state.day ?? 1) + days;
    const dest = this.db.city[to];
    this.emit('story', `你坐上马车，往${dest.props.name}去了。`);

    // 劫道：货越值钱越容易被盯上；劫匪的强弱看货物加身上现钱（D-040）。雇了镖师，机会少一大半（D-104）
    const value = cargoValue(this.db, p.cargo);
    const escort = !!this.state.escort;
    delete this.state.escort; // 镖师只管这一趟
    if (Math.random() < robberyChance(days, value) * (escort ? ESCORT_RATE : 1)) {
      // 劫匪的武功等级跟着主角走，强弱再按我方战斗力自适应；货值只定人数和难度系数（D-115）
      const { count, hard } = robbers(value + (p.money ?? 0));
      const level = martialLevel(p);
      const foe = Object.keys(this.db.enemy).find((id) => this.db.enemy[id].props.robber === 'true');
      if (foe) {
        this.normalizeHp();
        const guard = escort ? Object.keys(this.db.enemy).find((id) => this.db.enemy[id].props.escort === 'true') : null;
        this.state.battle = createScaledBattle(this.db, Array(count).fill(foe), level,
          { players: this.partyPlayers(), robbery: { to }, noFlee: true, allies: guard ? [guard] : [] }, (Date.now() ^ (Math.random() * 1e9)) | 0);
        this.emit('desc', '走到半路，前面林子里一声呼哨，几条汉子拦住了马车。');
        if (guard) this.emit('desc', '镖师把镖旗往车辕上一插，抽出刀来，站到了你身边。');
        this.emit('combat', `——遭遇劫道！${enemiesOf(this.state.battle).map((e) => e.name).join('、')}——`);
        adaptEnemyHp(this.db, this.state.battle, { hard });
        beginRound(this.db, this.state.battle, (cls, text, extra) => this.emit(cls, text, extra));
        return;
      }
    }
    if (this.roadTale(to, days)) return;
    this.arrive(to, days);
  },

  // ---- 马车奇遇（D-114）----

  /**
   * 没遇上劫道时，小概率在路上碰到一段小故事（content/world/qiyu-tales.md 里 qiyu: true 的对话）。
   * 抽签不放回：全部看过一遍才重新洗牌，洗牌后最近看过的几个排到最后。
   * 到站推迟到故事收场（qiyu:good / qiyu:bad 效果）时；中途存档读档，行程记在 state.trip 里。
   * 联机组队时不触发：奖励只能落在主机身上，对队友不公平。
   */
  roadTale(to, days) {
    if (this.party?.members.length) return false;
    if (Math.random() >= QIYU_RATE) return false;
    const ids = Object.values(this.db.dialog).filter((d) => d.props.qiyu === 'true').map((d) => d.id);
    if (!ids.length) return false;
    const q = (this.state.qiyu ??= { seen: [] });
    let pool = ids.filter((id) => !q.seen.includes(id));
    if (!pool.length) {
      q.seen = q.seen.slice(-QIYU_RECENT);
      pool = ids.filter((id) => !q.seen.includes(id));
    }
    const id = pool[Math.floor(Math.random() * pool.length)];
    q.seen.push(id);
    this.state.trip = { to, days };
    this.showDialog(id);
    return true;
  },

  /** 奇遇收场：选对了发奖励，然后接着赶路到站 */
  qiyuEnd(good) {
    const p = this.state.player;
    if (good) {
      const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      this.addMoney(rnd(QIYU_MONEY[0], QIYU_MONEY[1]));
      const pot = rnd(QIYU_POT[0], QIYU_POT[1]);
      p.potential += pot;
      this.emit('sys', `潜能 +${pot}`);
      if (Math.random() < QIYU_ATTR) {
        const attr = ['根骨', '身法', '悟性'][Math.floor(Math.random() * 3)];
        p.attrs[attr] += 1;
        this.emit('story', `这一番经历让你若有所悟，${attr}提高了。（${attr} ${p.attrs[attr]}）`);
        this.normalizeHp();
      }
      if (Math.random() < QIYU_BOOK) this.qiyuBook();
    }
    const trip = this.state.trip;
    delete this.state.trip;
    if (trip) this.arrive(trip.to, trip.days);
  },

  /** 送一本秘籍：先挑还没学会、身上也没有的；都有了就随便给一本（再读可以提高上限） */
  qiyuBook() {
    const p = this.state.player;
    const books = Object.values(this.db.item).filter((it) => it.props.book);
    if (!books.length) return;
    const fresh = books.filter((it) => p.skills[it.props.book] === undefined && !p.inventory[it.id]);
    const pick = (fresh.length ? fresh : books)[Math.floor(Math.random() * (fresh.length || books.length))];
    this.emit('story', '重新上车时，你发现包袱里多了一本旧册子，纸页发黄，是一路上这番机缘留下的。');
    this.applyEffects([`give:${pick.id}`]);
    this.emit('sys', `（输入「读」可以研读秘籍。）`);
  },

  /** 研读奇遇得来的秘籍：没学过就学会；学过了，上限提高一截（D-114） */
  studyBook(skillId) {
    const p = this.state.player;
    const sk = this.db.skill[skillId];
    if (!sk) return;
    if (p.skills[skillId] === undefined) { this.applyEffects([`learn:${skillId}`]); return; }
    p.skillcap ??= {};
    const now = Math.max(Number(sk.props.cap ?? 100), p.skillcap[skillId] ?? 0);
    if (now >= QIYU_BOOK_MAX) { this.emit('sys', `书里的东西你早已烂熟于胸，再读也读不出新意了。`); return; }
    p.skillcap[skillId] = Math.min(QIYU_BOOK_MAX, now + QIYU_BOOK_STEP);
    this.emit('story', `这一本和你从前读过的不是同一个抄本，有几处批注是你没见过的。你对${sk.props.name}的领悟更深了一层（上限提高到 ${p.skillcap[skillId]} 级）。`);
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
      const lost = Math.floor((p.money ?? 0) * CONFIG.outcome.robberyMoneyLoss);
      p.money -= lost;
      p.cargo = {};
      p.hp = Math.max(1, Math.round(this.hpMax() * CONFIG.outcome.loseHpRate));
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
