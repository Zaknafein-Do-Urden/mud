// 游戏引擎：纯逻辑，不碰 DOM / 网络 / 存储。
// exec(命令) → 输出条目数组 {cls, text, pace?}。联机时只有主机运行它（见 DESIGN.md §2）。
// 文本里可含 [[显示名|id]] 链接标记，由 UI 渲染。

import { parseMap, parseList } from './content.js';
import { martial } from './game-martial.js';
import { trade } from './game-trade.js';
import { views } from './game-views.js';
import { skillCap } from './character.js';

const DIR_ALIAS = {
  n: '北', s: '南', e: '东', w: '西', u: '上', d: '下',
  ne: '东北', nw: '西北', se: '东南', sw: '西南',
  north: '北', south: '南', east: '东', west: '西', up: '上', down: '下',
};
const DIRS = new Set(Object.values(DIR_ALIAS));
// 主线中只给一次的奖励类效果（D-042）
const REWARDS = new Set(['give', 'money', 'potential', 'learn', 'rep']);

const COMMANDS = ['look', 'go', 'talk', 'use', 'inventory', 'help', '状态', '武功', '修炼', '装备', '卸下', '学', '晋阶', '休息', '叛出师门', '行情', '买', '卖', '货物', '乘车', '存', '取', '存款', '天赋'];

export class Game {
  constructor(db, state) {
    this.db = db;
    this.state = state;
    this.dialog = null; // 当前对话中的可选项（已过滤）
    this.locked = false; // 锁定的剧情对话：必须做出选择才能离开
    this.out = [];
    this.pendingLoads = []; // 需要 UI 异步加载的主线 id
  }

  emit(cls, text, extra) { this.out.push({ cls, text: this.fmt(text), ...extra }); }

  /**
   * 文本中的玩家称呼（D-041）：{姓名} {姓} {名}，以及按性别选择的 {男:公子|女:姑娘}。
   */
  fmt(text) {
    if (!text || !text.includes('{')) return text;
    const p = this.state.player;
    const female = p.gender === '女';
    return text
      .replaceAll('{姓名}', p.name)
      .replaceAll('{姓}', p.surname ?? '')
      .replaceAll('{名}', p.given ?? '')
      .replace(/\{男:([^|}]*)\|女:([^}]*)\}/g, (_, m, f) => (female ? f : m));
  }

  /** 执行一条玩家命令，返回本次产生的输出。 */
  exec(input) {
    this.out = [];
    const line = input.trim();
    if (!line) return this.out;

    const [verb, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    const v = verb.toLowerCase();

    if (this.state.battle) {
      if (['hp', 'score', '状态'].includes(v)) this.showStatus();
      else if (['l', 'look', '看'].includes(v)) this.emit('sys', '（你正在交手，无暇他顾。出招、调息或逃跑。）');
      else this.combatInput(line);
      return this.out;
    }

    if (this.dialog) {
      if (/^\d+$/.test(line)) { this.choose(Number(line)); return this.out; }
      if (this.locked) {
        // 剧情进行中：只允许查看类命令，之后重新列出选项
        if (['l', 'look', '看', '观察', 'i', 'inv', 'inventory', '背包', '物品', 'h', 'help', '帮助', '?'].includes(v)) {
          const choices = this.dialog;
          this.dialog = null;
          this.exec(line); // 递归执行查看命令，输出留在 this.out 中
          this.dialog = choices;
        } else {
          this.emit('sys', '（眼下顾不上别的，先做个决定吧。）');
        }
        this.emitChoices();
        return this.out;
      }
      this.endDialog(); // 输入其他命令视为离开对话
      this.emit('sys', '（你结束了对话。）');
    }

    if (DIR_ALIAS[v] || DIRS.has(verb) || this.exits()[verb]) return this.go(DIR_ALIAS[v] ?? verb), this.out;

    switch (v) {
      case 'l': case 'look': case '看': case '观察':
        arg ? this.lookAt(arg) : this.look(); break;
      case 'go': case '走': case '去':
        this.go(DIR_ALIAS[arg.toLowerCase()] ?? arg); break;
      case 'talk': case '对话': case '交谈': case '问':
        this.talk(arg); break;
      case 'i': case 'inv': case 'inventory': case '背包': case '物品':
        this.inventory(); break;
      case 'u': case 'use': case '使用': case '用':
        this.use(arg); break;
      case 'h': case 'help': case '帮助': case '?':
        this.help(); break;
      case 'hp': case 'score': case '状态':
        this.showStatus(); break;
      case 'skills': case '武功':
        this.showSkills(); break;
      case 'train': case '修炼': case '练':
        this.train(arg); break;
      case 'equip': case '装备':
        this.equip(arg); break;
      case 'unequip': case '卸下':
        this.unequip(arg); break;
      case 'learn': case '学':
        this.learn(arg); break;
      case '晋阶': case '晋升':
        this.promote(); break;
      case '叛出师门': case '叛师':
        this.leaveSect(arg); break;
      case '天赋': case 'talent':
        this.talentCmd(arg); break;
      case 'rest': case '休息': case 'sleep':
        this.rest(); break;
      case '行情': case '市场': case 'market':
        this.showMarket(); break;
      case '买': case 'buy':
        this.buy(arg); break;
      case '卖': case 'sell':
        this.sell(arg); break;
      case '货物': case 'cargo':
        this.showCargo(); break;
      case '乘车': case '坐车': case '马车':
        this.showStation(arg); break;
      case '存': case 'deposit':
        this.deposit(arg); break;
      case '取': case 'withdraw':
        this.withdraw(arg); break;
      case '存款': case '银票':
        this.showBank(); break;
      default:
        if (this.itemsWithVerb(verb).length) { this.use(arg, verb); break; }
        this.emit('err', `「${verb}」？你想做什么？输入 help 查看命令。`);
    }
    return this.out;
  }

  // ---- 条件与效果 ----

  check(conds) {
    const { flags, player, visited } = this.state;
    return conds.every((c) => {
      const neg = c.startsWith('!');
      const [kind, key] = splitOnce(neg ? c.slice(1) : c);
      let ok;
      if (kind === 'flag') ok = !!flags[key];
      else if (kind === 'has') ok = (player.inventory[key] ?? 0) > 0;
      else if (kind === 'visited') ok = !!visited[key];
      else if (kind === 'sect') ok = key === 'none' ? !player.sect : player.sect?.id === key;
      else if (kind === 'rank') ok = (player.sect?.rank ?? -1) >= Number(key);
      else if (kind === 'gender') ok = player.gender === key;
      else if (kind === 'money') ok = (player.money ?? 0) >= Number(key);
      else { console.warn('未知条件', c); ok = false; }
      return neg ? !ok : ok;
    });
  }

  apply(effects) {
    const { flags, player } = this.state;
    for (const e of effects) {
      const [kind, key] = splitOnce(e);
      const inv = player.inventory;
      // 主线对话里的奖励只给一次：章节重来时不会重复获得（D-042）
      if (REWARDS.has(kind) && this.isStoryCtx()) {
        const claimKey = `${this.ctx}|${e}`;
        this.state.claimed ??= {};
        if (this.state.claimed[claimKey]) continue;
        this.state.claimed[claimKey] = true;
      }
      if (kind === 'flag') flags[key] = true;
      else if (kind === 'unflag') delete flags[key];
      else if (kind === 'give') {
        inv[key] = (inv[key] ?? 0) + 1;
        this.emit('sys', `你得到了${this.itemLink(key)}。`);
      } else if (kind === 'take') {
        inv[key] = (inv[key] ?? 0) - 1;
        if (inv[key] <= 0) delete inv[key];
        this.emit('sys', `你失去了${this.itemLink(key)}。`);
      } else if (kind === 'goto') this.enter(key);
      else if (kind === 'start') this.startStoryline(key);
      else if (kind === 'chapter') this.showChapter(key);
      else if (kind === 'fight') this.startBattle(key);
      else if (kind === 'join') this.joinSect(key);
      else if (kind === 'rep') { const [sect, n] = splitOnce(key); this.addRep(sect, Number(n)); }
      else if (kind === 'potential') { player.potential += Number(key); this.emit('sys', `潜能 +${key}`); }
      else if (kind === 'heal') { player.hp = this.hpMax(); this.emit('sys', '你的气血恢复了。'); }
      else if (kind === 'money') this.addMoney(Number(key));
      else if (kind === 'pay') this.addMoney(-Number(key));
      else if (kind === 'travel') this.travel(key);
      else if (kind === 'learn') {
        if (player.skills[key] === undefined) { player.skills[key] = 1; this.emit('story', `你学会了${this.db.skill[key]?.props.name ?? key}！`); }
      }
      else console.warn('未知效果', e);
    }
  }

  /** 按行首条件过滤后输出正文。 */
  emitLines(lines, cls, extra) {
    for (const l of lines) if (this.check(l.cond)) this.emit(cls, l.text, extra);
  }

  // ---- patch：主线往共享内容里追加的部分（STORY.md §5.1）----

  patches(id) {
    return (this.db.patch[id] ?? []).filter((p) => this.check(words(p.props.if)));
  }

  /** 原块 + 适用的 patch 合并后的视图 */
  merged(block) {
    const ps = this.patches(block.id);
    // patch 的选项插在"离开"类选项（无目标、无效果）之前，让离开总在最后
    const isLeave = (c) => !c.target && !c.effects.length;
    const base = block.choices;
    return {
      lines: [...block.lines, ...ps.flatMap((p) => p.lines)],
      choices: [...base.filter((c) => !isLeave(c)), ...ps.flatMap((p) => p.choices), ...base.filter(isLeave)],
      exits: Object.assign(parseMap(block.props.exits), ...ps.map((p) => parseMap(p.props.exits))),
      npcs: [...parseList(block.props.npcs), ...ps.flatMap((p) => parseList(p.props.npcs))],
    };
  }

  // ---- 主线 ----

  startStoryline(id) {
    const line = this.db.storyline[id];
    if (!line) { this.emit('err', `[内容错误] 主线不存在: ${id}`); return; }
    if (this.state.flags[`${id}.started`]) return;
    this.state.flags[`${id}.started`] = true;
    this.pendingLoads.push(id);
    this.emit('story', `【江湖传闻】你卷入了「${line.props.name}」的故事。`);
  }

  showChapter(id) {
    const ch = this.db.chapter[id];
    if (!ch) { this.emit('err', `[内容错误] 章节不存在: ${id}`); return; }
    const line = this.db.storyline[ch.props.storyline];
    this.emit('chapter', `${line?.props.name ?? ''}　${ch.props.name}`, { pace: true });
    this.emitLines(ch.lines, 'intro', { pace: true });
    // 章节检查点：记下此刻本主线的全部标记。章节战斗打输时回到这里（D-042）。
    // 所以 chapter: 效果要写在同一组效果的最前面，检查点里才不含本章开头设下的标记。
    const prefix = ch.props.storyline + '.';
    this.state.checkpoint = {
      chapter: id,
      storyline: ch.props.storyline,
      room: ch.props.start ?? this.state.player.room,
      flags: Object.fromEntries(Object.entries(this.state.flags).filter(([k]) => k.startsWith(prefix))),
    };
  }

  /** 回到章节开始的状态：只回滚本主线的标记；经验、潜能、物品、金钱都保留，一次性奖励不再重复 */
  restoreCheckpoint() {
    const cp = this.state.checkpoint;
    if (!cp) return false;
    const prefix = cp.storyline + '.';
    for (const k of Object.keys(this.state.flags)) if (k.startsWith(prefix)) delete this.state.flags[k];
    Object.assign(this.state.flags, cp.flags);
    this.endDialog();
    const p = this.state.player;
    p.hp = this.hpMax();
    if (this.db.room[cp.room]) p.room = cp.room; // 直接放回，不触发进入房间的剧情
    const ch = this.db.chapter[cp.chapter];
    this.emit('story', ch?.props.retry ?? '胜败乃兵家常事。你回到了本章开始的时候——已经获得的经验和潜能都还在，练好了再来。');
    this.look();
    return true;
  }

  /** 当前效果是否来自主线内容（id 以某条主线名开头） */
  isStoryCtx() {
    if (!this.ctx) return false;
    const line = this.ctx.split('.')[0];
    return !!this.db.storyline[line];
  }

  // ---- 房间 ----

  room() { return this.db.room[this.state.player.room]; }
  /** 任意房间当前有效的出口（含 patch），供地图使用 */
  exitsOf(id) { const r = this.db.room[id]; return r ? this.merged(r).exits : {}; }
  exits() { const r = this.room(); return r ? this.merged(r).exits : {}; }

  enter(roomId) {
    const r = this.db.room[roomId];
    if (!r) { this.emit('err', `[内容错误] 房间不存在: ${roomId}`); return; }
    this.state.player.room = roomId;
    if (r.props.inn === 'true') this.state.player.lastInn = roomId; // 战败后回到最近的旅店
    this.state.visited[roomId] = true;
    this.look();
    this.fireTriggers(roomId);
  }

  /** trigger 块：进入指定房间且条件满足时执行效果 / 进入对话。once: true 只触发一次。 */
  fireTriggers(roomId) {
    for (const t of Object.values(this.db.trigger ?? {})) {
      if (t.props.room !== roomId) continue;
      const doneKey = `${t.id}.done`;
      if (t.props.once === 'true' && this.state.flags[doneKey]) continue;
      if (!this.check(words(t.props.if))) continue;
      if (t.props.once === 'true') this.state.flags[doneKey] = true;
      this.ctx = t.id;
      this.emitLines(t.lines, 'desc');
      if (t.props.do) this.apply(words(t.props.do));
      if (t.props.dialog) this.showDialog(t.props.dialog);
    }
  }

  look() {
    const r = this.room();
    const m = this.merged(r);
    const npcs = this.npcsHere();
    this.emit('room-name', r.props.name ?? r.id);
    const linked = new Set();
    for (const l of m.lines) {
      if (!this.check(l.cond)) continue;
      let text = l.text;
      // 在场人物在描述中首次出现时自动加链接
      for (const n of npcs) {
        const name = n.props.name;
        if (linked.has(n.id) || text.includes(`[[${name}`) || !text.includes(name)) continue;
        text = text.replace(name, `[[${name}|${n.id}]]`);
        linked.add(n.id);
      }
      this.emit('desc', text);
    }
    if (npcs.length) this.emit('npc', '这里有：' + npcs.map((n) => `[[${n.props.name}|${n.id}]]`).join('、'));
    const dirs = Object.keys(m.exits);
    this.emit('exits', dirs.length ? '出口：' + dirs.map((d) => `[[${d}|go:${d}]]`).join('　') : '这里没有明显的出口。');
  }

  go(dir) {
    const target = this.exits()[dir];
    if (!target) { this.emit('err', '那个方向没有路。'); return; }
    if (!this.db.room[target]) { this.emit('sys', '那边的路还在修……（内容尚未加载或尚未编写）'); return; }
    this.enter(target);
  }

  // ---- NPC / 物品 ----

  npcsHere() {
    const r = this.room();
    if (!r) return [];
    return this.merged(r).npcs
      .map((id) => this.db.npc[id])
      .filter((n) => n && this.check(words(n.props.if)));
  }

  findNpc(name) {
    return this.npcsHere().find((n) => n.props.name === name || n.id === name || n.id.endsWith('.' + name));
  }

  itemName(id) { return this.db.item[id]?.props.name ?? id; }
  itemLink(id) { return `[[${this.itemName(id)}|${id}]]`; }

  findItem(name) {
    return Object.keys(this.state.player.inventory).find((id) => id === name || this.itemName(id) === name);
  }

  lookAt(name) {
    const npc = this.findNpc(name);
    if (npc) { this.emitLines(npc.lines, 'desc'); return; }
    const itemId = this.findItem(name);
    if (itemId) { this.emitLines(this.db.item[itemId]?.lines ?? [], 'desc'); return; }
    this.emit('err', `这里没有「${name}」。`);
  }

  inventory() {
    const inv = Object.entries(this.state.player.inventory);
    if (!inv.length) { this.emit('sys', '你身上空空如也。'); return; }
    this.emit('sys', '你身上带着：' + inv.map(([id, n]) => `${this.itemLink(id)}×${n}`).join('、'));
  }

  // ---- 使用物品 ----

  /** 背包里带有某个动词（如"吹"）的物品 */
  itemsWithVerb(verb) {
    return Object.keys(this.state.player.inventory).filter((id) => this.db.item[id]?.props.verb === verb);
  }

  /**
   * 使用物品。use 块定义"在哪里、什么条件下用什么物品会发生什么"；
   * 指定了 room 的 use 块优先于不限地点的。都不匹配时显示物品的 usefail 文字。
   */
  use(name, verb) {
    let id;
    if (name) id = this.findItem(name);
    else if (verb) {
      const hits = this.itemsWithVerb(verb);
      if (hits.length === 1) id = hits[0];
      else { this.emit('err', `${verb}什么？`); return; }
    } else { this.emit('err', '使用什么？例如：use 竹哨'); return; }
    if (!id) { this.emit('err', `你身上没有「${name}」。`); return; }
    const item = this.db.item[id];
    if (verb && item?.props.verb !== verb) { this.emit('err', `${this.itemName(id)}没法${verb}。`); return; }

    const room = this.state.player.room;
    const uses = Object.values(this.db.use ?? {})
      .filter((u) => u.props.item === id && (!u.props.room || u.props.room === room))
      .sort((a, b) => (b.props.room ? 1 : 0) - (a.props.room ? 1 : 0));
    for (const u of uses) {
      const doneKey = `${u.id}.done`;
      if (u.props.once === 'true' && this.state.flags[doneKey]) continue;
      if (!this.check(words(u.props.if))) continue;
      if (u.props.once === 'true') this.state.flags[doneKey] = true;
      this.ctx = u.id;
      this.emitLines(u.lines, 'desc');
      if (u.props.do) this.apply(words(u.props.do));
      if (u.props.dialog) this.showDialog(u.props.dialog);
      return;
    }
    this.emit('desc', item?.props.usefail ?? `你摆弄了一会儿${this.itemName(id)}，什么也没有发生。`);
  }

  // ---- 对话 ----

  talk(name) {
    if (!name) {
      const npcs = this.npcsHere().filter((n) => n.props.talk);
      if (npcs.length !== 1) { this.emit('err', '和谁说话？例如：talk 老乞丐'); return; }
      name = npcs[0].id;
    }
    const npc = this.findNpc(name);
    if (!npc) { this.emit('err', `这里没有「${name}」。`); return; }
    if (!npc.props.talk) { this.emit('sys', `${npc.props.name}似乎不想理你。`); return; }
    this.showDialog(npc.props.talk);
  }

  /**
   * 显示对话节点。lock: true 的对话开始后，整条对话链都锁定，直到对话结束。
   * 当前对话记入 state.dialog，刷新页面或读档后可以接着选（resume）。
   */
  showDialog(id, resume = false) {
    const d = this.db.dialog[id];
    if (!d) { this.emit('err', `[内容错误] 对话不存在: ${id}`); this.endDialog(); return; }
    if (d.props.lock === 'true') this.locked = true;
    this.dialogId = id;
    this.ctx = id;
    const m = this.merged(d);
    const pace = d.props.pace === 'slow' && !resume ? { pace: true } : undefined;
    this.emitLines(m.lines, 'say', pace);
    if (d.props.do && !resume) this.apply(words(d.props.do)); // 进入该对话即生效的效果（恢复时不重复）
    const choices = m.choices.filter((c) => this.check(c.cond));
    if (!choices.length) { this.endDialog(); return; }
    this.dialog = choices;
    this.state.dialog = { id, locked: this.locked };
    this.emitChoices();
  }

  emitChoices() {
    this.dialog.forEach((c, i) => this.emit('choice', c.text, { n: i + 1 }));
  }

  endDialog() {
    this.dialog = null;
    this.locked = false;
    delete this.state.dialog;
  }

  /** 读档后恢复未完成的对话 */
  resume() {
    this.out = [];
    if (this.state.battle) {
      this.emit('combat', `——战斗仍在继续（第 ${this.state.battle.round} 回合）——`);
      return this.out;
    }
    const saved = this.state.dialog;
    if (saved && this.db.dialog[saved.id]) {
      this.locked = !!saved.locked;
      this.emit('sys', '（你回过神来——）');
      this.showDialog(saved.id, true);
    } else {
      delete this.state.dialog;
    }
    return this.out;
  }

  choose(n) {
    const c = this.dialog[n - 1];
    if (!c) { this.emit('err', '没有这个选项。'); this.emitChoices(); return; }
    this.emit('echo', `> ${c.text}`);
    const locked = this.locked;
    this.dialog = null;
    this.ctx = this.dialogId;
    this.apply(c.effects);
    if (c.target) {
      this.locked = locked;
      this.showDialog(c.target);
    } else {
      this.endDialog();
    }
  }

  help() {
    [
      '【命令】',
      '  look / l / 看          查看四周；look 老乞丐 查看人物或物品',
      '  北 南 东 西 / n s e w   向该方向走（也可以 go 北）',
      '  talk 老乞丐 / 对话      与人交谈；人名可用拼音首字母，如 talk lqg',
      '  i / 背包               查看随身物品',
      '  状态 / 武功            查看自身状态、已学武功',
      '  装备 / 卸下 武功名      调整出战武功（外功最多 4 门，内功、轻功各 1 门）',
      '  修炼 武功名            在旅店或本门驻地消耗潜能提升武功',
      '  学 / 晋阶              在本门师父面前学艺、申请晋阶（晋阶要通过考核）',
      '  叛出师门               离开门派：本门武功等级减半且不能再提升',
      '  天赋 / 天赋 加 蛮力     查看、点选天赋（修为每 25 点得 1 个天赋点；天赋 重置 免费）',
      '  休息                   在旅店休息，恢复气血（过去一天）',
      '  乘车 / 乘车 襄阳        在车马行坐马车去别的城市（路上可能遇到劫道）',
      '  行情 / 买 / 卖 / 货物   在市集看行情、买卖货物；货物装在马车上',
      '  存 / 取 / 存款          在钱庄存取钱（各地通兑，没有利息，不会被劫）',
      '  use 竹哨 / 使用 竹哨    使用物品；有的物品有专门的动词，如 吹 竹哨',
      '  help / 帮助            显示本帮助',
      '【操作】',
      '  彩色文字可以点击；鼠标悬停查看详情，右键固定详情卡。',
      '  Tab 补全命令和人名；对话中按数字键选择。',
      '存档会自动保存在本浏览器；换浏览器请用右上角「导出」「导入」。',
    ].forEach((t) => this.emit('sys', t));
  }

  // ---- 供 UI 查询（不改变状态）----

  /** 链接 id 的类别：go / npc / item / room / entry / storyline */
  kindOf(id) {
    if (id.startsWith('go:')) return 'go';
    for (const k of ['npc', 'item', 'room', 'entry', 'storyline', 'skill', 'sect']) if (this.db[k]?.[id]) return k;
    return null;
  }

  /** 信息卡内容：{title, lines, actions:[{label, cmd}]}，未知 id 返回 null */
  describe(id) {
    const kind = this.kindOf(id);
    const lines = (b) => b.lines.filter((l) => this.check(l.cond)).map((l) => this.fmt(l.text));
    if (kind === 'go') {
      const dir = id.slice(3);
      const target = this.db.room[this.exits()[dir]];
      const known = target && this.state.visited[target.id];
      return {
        title: `往${dir}`,
        lines: [known ? `通往${target.props.name}。` : '你还没有去过那里。'],
        actions: [{ label: '前往', cmd: dir }],
      };
    }
    if (kind === 'npc') {
      const n = this.db.npc[id];
      const here = this.npcsHere().includes(n);
      const actions = here ? [{ label: '查看', cmd: `look ${id}` }] : [];
      if (here && n.props.talk) actions.push({ label: '交谈', cmd: `talk ${id}` });
      return { title: n.props.name, lines: [...(n.props.brief ? [n.props.brief] : []), ...lines(n)], actions };
    }
    if (kind === 'item') {
      const it = this.db.item[id];
      const count = this.state.player.inventory[id];
      const actions = count ? [{ label: it.props.verb ?? '使用', cmd: `use ${id}` }] : [];
      return { title: it.props.name, lines: [...lines(it), ...(count ? [`（你有 ${count} 个）`] : [])], actions };
    }
    if (kind === 'room') {
      const r = this.db.room[id];
      return { title: r.props.name, lines: this.state.visited[id] ? lines(r).slice(0, 1) : ['你还没有去过那里。'], actions: [] };
    }
    if (kind === 'skill') {
      const sk = this.db.skill[id];
      const lv = this.state.player.skills[id];
      const head = `${sk.props.kind}${sk.props.stance ? '·' + sk.props.stance : ''}${sk.props.sect ? '　' + (this.db.sect[sk.props.sect]?.props.name ?? '') : ''}`;
      const mine = lv !== undefined ? [`你的等级：${lv} / ${skillCap(this.db, this.state.player, id)}`] : [];
      return { title: sk.props.name, lines: [head, ...lines(sk), ...mine], actions: [] };
    }
    if (kind === 'entry' || kind === 'storyline' || kind === 'sect') {
      const b = this.db[kind][id];
      return { title: b.props.name, lines: lines(b), actions: [] };
    }
    return null;
  }

  /** 情境按钮与补全用：当前出口、在场人物、背包 */
  context() {
    return {
      exits: Object.keys(this.exits()),
      npcs: this.npcsHere().map((n) => ({ id: n.id, name: n.props.name, talk: !!n.props.talk })),
      items: Object.keys(this.state.player.inventory).map((id) => ({ id, name: this.itemName(id) })),
      inDialog: !!this.dialog,
      inCombat: !!this.state.battle,
    };
  }

  completions() {
    const c = this.context();
    const verbs = c.items.map((i) => this.db.item[i.id]?.props.verb).filter(Boolean);
    return [...COMMANDS, ...verbs, ...c.exits, ...c.npcs.map((n) => n.name), ...c.items.map((i) => i.name)];
  }
}

/** 属性里的条件 / 效果列表：空格或逗号分隔 */
function words(s = '') {
  return s.split(/[\s,]+/).filter(Boolean);
}

function splitOnce(s) {
  const i = s.indexOf(':');
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)];
}

Object.assign(Game.prototype, martial, trade, views);
