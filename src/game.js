// 游戏引擎：纯逻辑，不碰 DOM / 网络 / 存储。
// exec(命令) → 输出条目数组 {cls, text, pace?}。联机时只有主机运行它（见 DESIGN.md §2）。
// 文本里可含 [[显示名|id]] 链接标记，由 UI 渲染。

import { parseMap, parseList } from './content.js';

const DIR_ALIAS = {
  n: '北', s: '南', e: '东', w: '西', u: '上', d: '下',
  ne: '东北', nw: '西北', se: '东南', sw: '西南',
  north: '北', south: '南', east: '东', west: '西', up: '上', down: '下',
};
const DIRS = new Set(Object.values(DIR_ALIAS));

const COMMANDS = ['look', 'go', 'talk', 'inventory', 'help'];

export class Game {
  constructor(db, state) {
    this.db = db;
    this.state = state;
    this.dialog = null; // 当前对话中的可选项（已过滤）
    this.out = [];
    this.pendingLoads = []; // 需要 UI 异步加载的主线 id
  }

  emit(cls, text, extra) { this.out.push({ cls, text, ...extra }); }

  /** 执行一条玩家命令，返回本次产生的输出。 */
  exec(input) {
    this.out = [];
    const line = input.trim();
    if (!line) return this.out;

    if (this.dialog) {
      if (/^\d+$/.test(line)) { this.choose(Number(line)); return this.out; }
      this.dialog = null; // 输入其他命令视为离开对话
      this.emit('sys', '（你结束了对话。）');
    }

    const [verb, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    const v = verb.toLowerCase();

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
      case 'h': case 'help': case '帮助': case '?':
        this.help(); break;
      default:
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
      else { console.warn('未知条件', c); ok = false; }
      return neg ? !ok : ok;
    });
  }

  apply(effects) {
    const { flags, player } = this.state;
    for (const e of effects) {
      const [kind, key] = splitOnce(e);
      const inv = player.inventory;
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
  }

  // ---- 房间 ----

  room() { return this.db.room[this.state.player.room]; }
  exits() { const r = this.room(); return r ? this.merged(r).exits : {}; }

  enter(roomId) {
    const r = this.db.room[roomId];
    if (!r) { this.emit('err', `[内容错误] 房间不存在: ${roomId}`); return; }
    this.state.player.room = roomId;
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

  showDialog(id) {
    const d = this.db.dialog[id];
    if (!d) { this.emit('err', `[内容错误] 对话不存在: ${id}`); this.dialog = null; return; }
    const m = this.merged(d);
    const pace = d.props.pace === 'slow' ? { pace: true } : undefined;
    this.emitLines(m.lines, 'say', pace);
    if (d.props.do) this.apply(words(d.props.do)); // 进入该对话即生效的效果
    const choices = m.choices.filter((c) => this.check(c.cond));
    if (!choices.length) { this.dialog = null; return; }
    this.dialog = choices;
    choices.forEach((c, i) => this.emit('choice', c.text, { n: i + 1 }));
  }

  choose(n) {
    const c = this.dialog[n - 1];
    if (!c) { this.emit('err', '没有这个选项。'); return; }
    this.emit('echo', `> ${c.text}`);
    this.dialog = null;
    this.apply(c.effects);
    if (c.target) this.showDialog(c.target);
  }

  help() {
    [
      '【命令】',
      '  look / l / 看          查看四周；look 老乞丐 查看人物或物品',
      '  北 南 东 西 / n s e w   向该方向走（也可以 go 北）',
      '  talk 老乞丐 / 对话      与人交谈；人名可用拼音首字母，如 talk lqg',
      '  i / 背包               查看随身物品',
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
    for (const k of ['npc', 'item', 'room', 'entry', 'storyline']) if (this.db[k][id]) return k;
    return null;
  }

  /** 信息卡内容：{title, lines, actions:[{label, cmd}]}，未知 id 返回 null */
  describe(id) {
    const kind = this.kindOf(id);
    const lines = (b) => b.lines.filter((l) => this.check(l.cond)).map((l) => l.text);
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
      return { title: it.props.name, lines: [...lines(it), ...(count ? [`（你有 ${count} 个）`] : [])], actions: [] };
    }
    if (kind === 'room') {
      const r = this.db.room[id];
      return { title: r.props.name, lines: this.state.visited[id] ? lines(r).slice(0, 1) : ['你还没有去过那里。'], actions: [] };
    }
    if (kind === 'entry' || kind === 'storyline') {
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
    };
  }

  completions() {
    const c = this.context();
    return [...COMMANDS, ...c.exits, ...c.npcs.map((n) => n.name), ...c.items.map((i) => i.name)];
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
