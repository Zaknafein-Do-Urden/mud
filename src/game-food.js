// 引擎的吃喝部分（D-133）：客栈里的店铺、吃喝回气血、内力。以方法的形式并入 Game（见 game.js 末尾）。
// 吃喝的东西是普通物品，带 hp（回气血）或 mp（回内力）和 price（店里的价钱）；数值写在 content/world/food.md。
// 气血、内力都在战斗之间保留，战斗中不能吃喝，要在开打前吃饱喝足。

import { isFoodItem } from './character.js';

const ALL = ['全部', 'all'];

export const food = {
  /** 当前房间的店铺卖的东西 [{id, name, price, hp, mp, have}]；房间写 shop: 物品, 物品…… */
  shopList() {
    const ids = (this.room()?.props.shop ?? '').split(',').map((x) => x.trim()).filter((id) => this.db.item[id]);
    const inv = this.state.player.inventory;
    return ids.map((id) => {
      const it = this.db.item[id].props;
      return { id, name: it.name, price: Number(it.price ?? 0), hp: Number(it.hp ?? 0), mp: Number(it.mp ?? 0), have: inv[id] ?? 0 };
    });
  },

  showShop() {
    const list = this.shopList();
    if (!list.length) { this.emit('err', '这里没有店铺。城里的客栈卖吃的喝的。'); return; }
    this.emit('sys', '【店铺】（买 名字 数量）食物回气血，酒回内力。打斗中腾不出手吃喝，要在开打前补足。越贵的东西，一文钱回得越多。');
    for (const f of list) {
      this.emit('sys', `　[[${f.name}|${f.id}]]　${f.price} 文　${f.hp ? `气血 +${f.hp}` : `内力 +${f.mp}`}${f.have ? `　身上 ${f.have} 件` : ''}`);
    }
    this.emit('sys', `身上 ${this.state.player.money ?? 0} 文`);
  },

  /** 在店铺里买东西。名字对不上店里的货就返回 false，交给市集的"买" */
  buyFood(arg) {
    const [name, qtyStr] = arg.split(/\s+/);
    const f = this.shopList().find((x) => x.id === name || x.name === name);
    if (!f) return false;
    const p = this.state.player;
    const qty = ALL.includes(qtyStr) ? Math.floor((p.money ?? 0) / f.price) : Number(qtyStr ?? 1);
    if (!Number.isInteger(qty) || qty <= 0) { this.emit('err', qty === 0 ? '你的钱不够。' : '数量要写正整数。'); return true; }
    if (qty * f.price > (p.money ?? 0)) { this.emit('err', `钱不够：${qty} 件${f.name}要 ${qty * f.price} 文，你只有 ${p.money ?? 0} 文。`); return true; }
    p.money -= qty * f.price;
    p.inventory[f.id] = (p.inventory[f.id] ?? 0) + qty;
    this.emit('sys', `你买了 ${qty} 件${this.itemLink(f.id)}，花去 ${qty * f.price} 文。（余 ${p.money} 文）`);
    return true;
  },

  /**
   * 吃喝：吃 [名字] [数量|全部]、喝 [名字] [数量|全部]。食物回气血，酒回内力。
   * 没写名字就挑回得最少的那样（省着好的）；"全部"是吃到满为止。战斗中不能吃喝，要在开打前补足。
   */
  eat(arg, verb) {
    const p = this.state.player;
    let [name, qtyStr] = arg.split(/\s+/).filter(Boolean);
    if (name && (ALL.includes(name) || /^\d+$/.test(name))) [name, qtyStr] = [undefined, name]; // 吃 全部、喝 3
    const foods = Object.keys(p.inventory).filter((id) => isFoodItem(this.db, id));
    const drink = verb === '喝' || verb === 'drink';
    const stat = (x) => Number(this.db.item[x].props[drink ? 'mp' : 'hp'] ?? 0);
    let id;
    if (name) id = foods.find((x) => x === name || this.itemName(x) === name);
    else id = foods.filter(stat).sort((a, b) => stat(a) - stat(b))[0];
    if (!id) { this.emit('err', name ? `你身上没有「${name}」。` : drink ? '你身上没有酒。城里的客栈有卖。' : '你身上没有吃的。城里的客栈有卖。'); return; }
    const it = this.db.item[id].props;
    const key = it.hp ? 'hp' : 'mp'; // 按物品本身回什么来（"吃 女儿红"也照样是喝酒）
    const label = key === 'hp' ? '气血' : '内力';
    this.normalizeHp();
    const max = key === 'hp' ? this.hpMax() : this.mpMax();
    if (p[key] >= max) { this.emit('sys', key === 'hp' ? '你气血充盈，并不饿。' : '你内力充沛，用不着喝酒提神。'); return; }
    const want = ALL.includes(qtyStr) ? Infinity : Number(qtyStr ?? 1);
    if (!(want > 0)) { this.emit('err', '数量要写正整数。'); return; }
    let n = 0;
    let gain = 0;
    while (n < want && p.inventory[id] > 0 && p[key] < max) {
      const g = Math.min(max - p[key], Number(it[key]));
      p[key] += g;
      gain += g;
      n++;
      if (--p.inventory[id] <= 0) delete p.inventory[id];
    }
    this.emit('sys', `你${key === 'hp' ? '吃' : '喝'}了 ${n} 件${it.name}，${label} +${gain}。（${p[key]}/${max}）`);
  },
};
