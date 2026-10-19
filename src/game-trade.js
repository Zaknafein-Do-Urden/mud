// 引擎的经济部分：金钱、市场、钱庄、马车。以方法的形式并入 Game（见 game.js 末尾）。

import { CONFIG } from './config.js';
import { escortFee, ESCORT_RATE, goodsPrice, goodsLocal, stockCap, stockNow, buyPrice, cargoUnits, cargoValue, robberyChance, robbers, martialLevel, routesOf, cityOfRoom,
  SELL_RATE, cartsOf, cargoCapOf, nextCartPrice, cartsLoaded } from './economy.js';
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

  /** 某城市某种货眼下的存货（D-123）：state.market[城市][货] 记着被买走后剩多少、哪天记的；补满了就删掉记录 */
  stockOf(city, goodsId) {
    const day = this.state.day ?? 1;
    const recs = this.state.market?.[city];
    const n = stockNow(stockCap(this.db, city, goodsId), recs?.[goodsId], day);
    if (recs?.[goodsId] && n >= stockCap(this.db, city, goodsId)) delete recs[goodsId];
    return n;
  },

  /** 买走 qty 件：从眼下的存货里扣，记下今天的日子 */
  takeStock(city, goodsId, qty) {
    this.state.market ??= {};
    const recs = (this.state.market[city] ??= {});
    recs[goodsId] = { n: this.stockOf(city, goodsId) - qty, day: this.state.day ?? 1 };
  },

  /**
   * 当前城市的全部货物 [{id, name, buy, sell, local, stock}]（D-076、D-123）：
   * 每种货都有价、都能卖。特产存货多、价钱便宜；外地货存货少，买价贵得不划算。
   */
  marketList() {
    const city = this.cityHere();
    const day = this.state.day ?? 1;
    return Object.values(this.db.goods)
      .map((g) => {
        const price = goodsPrice(this.db, city, g.id, day);
        if (price === null) return null;
        const stock = Math.max(0, this.stockOf(city, g.id));
        return { id: g.id, name: g.props.name, buy: buyPrice(this.db, city, g.id, day), sell: Math.round(price * SELL_RATE), local: goodsLocal(this.db, city, g.id), stock };
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
    this.emit('sys', `【${city?.props.name ?? ''}市集　今日行情】（买 货名 数量 / 卖 货名 数量；数量可写"全部"）`);
    for (const g of this.marketList()) {
      const have = p.cargo?.[g.id] ?? 0;
      this.emit('sys', `　[[${g.name}|${g.id}]]${g.local ? '（特产）' : ''}　${g.stock ? `买入 ${g.buy}（存货 ${g.stock}）` : '无货'}　卖出 ${g.sell}${have ? `　车上 ${have} 件` : ''}`);
    }
    this.emit('sys', '　特产便宜，运到不产它的地方卖；离产地越远卖得越贵，路上也越容易遇到劫匪。外地货存货少、买价贵，倒卖不划算。货买走了，要过几天才慢慢补回来。');
    this.emit('sys', `马车载货 ${cargoUnits(p.cargo)}/${cargoCapOf(p)} 件（${cartsOf(p)} 辆车）　身上 ${p.money ?? 0} 文`);
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
    if (!g.stock) { this.emit('err', `${g.name}被买空了，过几天才补得回来。`); return; }
    const room = cargoCapOf(p) - cargoUnits(p.cargo);
    const afford = Math.floor((p.money ?? 0) / g.buy);
    const qty = ALL.includes(qtyStr) ? Math.min(room, afford, g.stock) : Number(qtyStr ?? 1);
    if (!Number.isInteger(qty) || qty <= 0) { this.emit('err', room <= 0 ? '马车已经装满了。' : afford <= 0 ? '你的钱不够。' : '数量要写正整数。'); return; }
    if (qty > room) { this.emit('err', `马车只剩 ${room} 件的空位。`); return; }
    if (qty > g.stock) { this.emit('err', `${g.name}今天只剩 ${g.stock} 件了。`); return; }
    if (qty * g.buy > (p.money ?? 0)) { this.emit('err', `钱不够：${qty} 件${g.name}要 ${qty * g.buy} 文，你只有 ${p.money ?? 0} 文。`); return; }
    p.money -= qty * g.buy;
    p.cargo[g.id] = (p.cargo[g.id] ?? 0) + qty;
    this.takeStock(this.cityHere(), g.id, qty);
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
      ? `马车上：${items.map(([id, n]) => `[[${this.db.goods[id]?.props.name}|${id}]]×${n}`).join('、')}（${cargoUnits(p.cargo)}/${cargoCapOf(p)} 件，${cartsOf(p)} 辆车）`
      : `马车上空空的。（${cartsOf(p)} 辆车，可载 ${cargoCapOf(p)} 件）`);
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
      text: `${this.db.city[id].props.name}　${days} 日路程${this.state.escort ? `（${this.state.escort} 个镖师随行）` : ''}`,
      target: null, cond: [], effects: [`travel:${id}`],
    }));
    // 雇镖师（D-104、D-122）：车上有货时才有意义；雇了只管下一趟。几辆车来几个劫匪，镖师最多也雇几个
    const p = this.state.player;
    const value = cargoValue(this.db, p.cargo);
    const loaded = cartsLoaded(p.cargo);
    const hired = this.state.escort ?? 0;
    if (value > 0 && hired < loaded) {
      const fee = escortFee(value, loaded);
      const extra = [];
      for (let k = 1; k <= loaded - hired; k++) {
        const c = { text: `${hired ? '再' : ''}雇 ${k} 个镖师护送下一趟（${fee * k} 文）`, target: null, cond: [`money:${fee * k}`], effects: [`escort:${k}`] };
        extra.push((p.money ?? 0) >= fee * k ? c : { ...c, disabled: true });
      }
      choices.unshift(...extra);
      if (!hired) this.emit('sys', `（车上是 ${loaded} 辆车的货，遇上劫道就是 ${loaded} 个劫匪，个个和你差不多强。镖师一人顶一个劫匪；雇了镖师，被劫的机会也少一大半。）`);
    }
    const next = nextCartPrice(p);
    if (next !== null) {
      const c = { text: `添一辆马车（${next} 文：多装 ${cargoCapOf(p) / cartsOf(p)} 件货，现有 ${cartsOf(p)} 辆）`, target: null, cond: [`money:${next}`], effects: ['buycart'] };
      choices.push((p.money ?? 0) >= next ? c : { ...c, disabled: true });
    }
    choices.push({ text: '不坐了', target: null, cond: [], effects: [] });
    this.dialog = choices;
    this.dialogId = null;
    delete this.state.dialog;
    this.emitChoices();
  },

  /** 雇 k 个镖师护送下一趟（D-104、D-122），雇完回到车马行的目的地列表 */
  hireEscort(k = 1) {
    const p = this.state.player;
    const loaded = cartsLoaded(p.cargo);
    const n = Math.max(1, Math.min(k, loaded - (this.state.escort ?? 0)));
    const fee = escortFee(cargoValue(this.db, p.cargo), loaded) * n;
    if ((p.money ?? 0) < fee) { this.emit('err', '钱不够。'); return; }
    this.addMoney(-fee);
    this.state.escort = (this.state.escort ?? 0) + n;
    this.emit('sys', n > 1 ? `镖局派了 ${n} 个精壮的镖师跟车，镖旗插在车辕上。他们只管这一趟。` : '镖局派了一个精壮的镖师跟车，镖旗插在车辕上。他只管这一趟。');
    this.showStation();
  },

  /** 车马行添一辆马车（D-122）：每辆多装 100 件，价钱一辆比一辆贵 */
  buyCart() {
    const p = this.state.player;
    const price = nextCartPrice(p);
    if (!this.atStation()) { this.emit('err', '要添马车，得去城里的车马行。'); return; }
    if (price === null) { this.emit('err', '你的车队已经够大了，车马行再没有更多的车可卖。'); return; }
    if ((p.money ?? 0) < price) { this.emit('err', `钱不够：添一辆马车要 ${price} 文。`); return; }
    this.addMoney(-price);
    p.carts = cartsOf(p) + 1;
    this.emit('story', `车马行掌柜收了钱，从后院牵出一辆新车，套上两匹骡子。你的车队现在有 ${p.carts} 辆车，能装 ${cargoCapOf(p)} 件货。`);
    this.emit('sys', '（车多了装得多，可上路的车多了，劫匪也来得多：几辆车的货就有几个劫匪。）');
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

    // 劫道：货越值钱越容易被盯上（D-040）。雇了镖师，机会少一大半（D-104）
    const value = cargoValue(this.db, p.cargo);
    const escort = this.state.escort === true ? 1 : this.state.escort ?? 0; // 老存档里是 true
    delete this.state.escort; // 镖师只管这一趟
    if (Math.random() < robberyChance(days, value) * (escort ? ESCORT_RATE : 1)) {
      // 几辆车几个劫匪；劫匪的武功等级跟着主角走，每个单独按主角战力 × 难度系数放缩，队友、镖师不拉高劫匪（D-122）
      const { count, hard, each } = robbers(value + (p.money ?? 0), cartsLoaded(p.cargo));
      const level = martialLevel(p);
      const foe = Object.keys(this.db.enemy).find((id) => this.db.enemy[id].props.robber === 'true');
      if (foe) {
        this.normalizeHp();
        const guard = escort ? Object.keys(this.db.enemy).find((id) => this.db.enemy[id].props.escort === 'true') : null;
        this.state.battle = createScaledBattle(this.db, Array(count).fill(foe), level,
          { players: this.partyPlayers(), robbery: { to }, noFlee: true, allies: guard ? Array(escort).fill(guard) : [] }, (Date.now() ^ (Math.random() * 1e9)) | 0);
        this.emit('desc', count > 2 ? '走到半路，前面林子里一声呼哨，一大帮汉子拦住了车队。' : '走到半路，前面林子里一声呼哨，几条汉子拦住了马车。');
        if (guard) this.emit('desc', escort > 1 ? '镖师们把镖旗往车辕上一插，抽出刀来，站到了你身边。' : '镖师把镖旗往车辕上一插，抽出刀来，站到了你身边。');
        this.emit('combat', `——遭遇劫道！${enemiesOf(this.state.battle).map((e) => e.name).join('、')}——`);
        adaptEnemyHp(this.db, this.state.battle, { hard, solo: true, each });
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
   * 联机组队时照样触发（D-126）：队长选，选对了每个人各得一份钱、潜能，也各有机会长属性（秘籍只给队长）。
   */
  roadTale(to, days) {
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
      this.qiyuGuests();
    }
    const trip = this.state.trip;
    delete this.state.trip;
    if (trip) this.arrive(trip.to, trip.days);
  },

  /** 组队时奇遇的奖励（D-126）：客人各得一份钱、潜能，各有机会长一项属性。经房主的快照和 settle 包写进客人存档 */
  qiyuGuests() {
    if (!this.party?.members.length) return;
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    for (const m of this.party.members) {
      const money = rnd(QIYU_MONEY[0], QIYU_MONEY[1]);
      const pot = rnd(QIYU_POT[0], QIYU_POT[1]);
      const attr = Math.random() < QIYU_ATTR ? ['根骨', '身法', '悟性'][Math.floor(Math.random() * 3)] : null;
      m.snap.money = (m.snap.money ?? 0) + money;
      m.snap.potential = (m.snap.potential ?? 0) + pot;
      if (attr) m.snap.attrs[attr] += 1;
      this.emit('sys', `你也分到 ${money} 文钱，潜能 +${pot}${attr ? `，${attr}提高了` : ''}。`, { to: m.pid });
      this.outbox.push({ to: m.pid, msg: { t: 'settle', seq: ++this.settleSeq, exp: {}, potential: pot, money, attr } });
    }
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
    if (days) this.emit('sys', `一路颠簸了 ${days} 天，马车到了${dest.props.name}。`);
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
