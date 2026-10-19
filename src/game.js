// 游戏引擎：纯逻辑，不碰 DOM / 网络 / 存储。
// exec(命令) → 输出条目数组 {cls, text, pace?}。联机时只有主机运行它（见 DESIGN.md §2）。
// 文本里可含 [[显示名|id]] 链接标记，由 UI 渲染。

import { parseMap, parseList } from './content.js';
import { martial } from './game-martial.js';
import { trade } from './game-trade.js';
import { views } from './game-views.js';
import { party } from './game-party.js';
import { skillCap, bestInnerLv, isWeaponItem } from './character.js';
import { tal } from './talents.js';
import { xiuwei } from './combat.js';

const DIR_ALIAS = {
  n: '北', s: '南', e: '东', w: '西', u: '上', d: '下',
  ne: '东北', nw: '西北', se: '东南', sw: '西南',
  north: '北', south: '南', east: '东', west: '西', up: '上', down: '下',
};
const DIRS = new Set(Object.values(DIR_ALIAS));
// 主线中只给一次的奖励类效果（D-042）
const REWARDS = new Set(['give', 'money', 'potential', 'learn', 'rep', 'cap']);

const COMMANDS = ['look', 'go', 'talk', 'use', 'inventory', 'help', '状态', '武功', '修炼', '装备', '卸下', '学', '晋阶', '休息', '叛出师门', '行情', '买', '卖', '货物', '乘车', '存', '取', '存款', '天赋', '百科'];

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
      case 'goal': case 'goals': case '目标':
        this.showGoals(false); break;
      case 'hint': case '提示':
        this.showGoals(true); break;
      case '百科': case 'wiki':
        this.showWiki(arg); break;
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
      case '说': case 'say':
        if (this.party) this.emit('chat', `【队】${this.state.player.name}：${arg}`);
        else this.emit('err', '你不在队伍中。'); break;
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
      else if (kind === 'today') ok = this.state.daily?.[key] === todayStr();
      // 战力门槛（D-060）
      else if (kind === 'maxhp') ok = this.hpMax() >= Number(key);
      else if (kind === 'xiuwei') ok = xiuwei(this.db, player) >= Number(key);
      else if (kind === 'inner') ok = bestInnerLv(this.db, player) >= Number(key);
      else if (kind === 'stance') {
        const [st, lv] = splitOnce(key);
        ok = Object.entries(player.skills).some(([id, l]) => this.db.skill[id]?.props.kind === '外功' && this.db.skill[id].props.stance === st && l >= Number(lv));
      }
      else if (kind === 'talent') { const [id, lv] = splitOnce(key); ok = tal(player, id) >= Number(lv || 1); }
      else if (kind === 'party') ok = 1 + (this.party?.members.length ?? 0) >= Number(key);
      else if (kind === 'learned') ok = player.skills[key] !== undefined;
      else { console.warn('未知条件', c); ok = false; }
      return neg ? !ok : ok;
    });
  }

  /**
   * 执行效果。效果里有设标记的，前后各检查一次各章的完成条件：
   * 从没完成变成完成的章节，给当前门派加声望（D-103）。这样老存档里早已完成的章节不会重复奖励。
   */
  apply(effects) {
    const watch = effects.some((e) => e.startsWith('flag:'));
    const before = watch ? this.doneChapters() : null;
    const talentsBefore = watch ? this.storyTalents() : null;
    this.applyEffects(effects);
    if (!watch) return;
    for (const id of this.doneChapters()) if (!before.has(id)) this.chapterRep(id);
    // 主线的三个天赋点（D-108）：三成左右、七成左右的重要战斗之后各 1 点，完结 1 点
    for (const key of this.storyTalents()) {
      if (talentsBefore.has(key)) continue;
      const [id, which] = key.split('#');
      const name = this.db.storyline[id].props.name;
      this.emit('story', which === 'done' ? `【${name}】全篇终。你对武学的领悟又深了一层。（天赋点 +1）` : `历经此战，你对武学的领悟又深了一层。（${name}：天赋点 +1）`);
    }
  }

  /**
   * 主线给的天赋点（D-108）：每条主线 3 点。storyline 块的 milestones（逗号分隔的两个条件，
   * 一般是三成左右、七成左右那一章重要战斗的胜利标记）各 1 点，done（完结条件）1 点。
   * 返回已经拿到的点的集合，元素是"主线id#0""主线id#1""主线id#done"。
   */
  storyTalents() {
    const got = new Set();
    for (const s of Object.values(this.db.storyline)) {
      parseList(s.props.milestones ?? '').forEach((c, i) => { if (this.check(words(c))) got.add(`${s.id}#${i}`); });
      if (s.props.done && this.check(words(s.props.done))) got.add(`${s.id}#done`);
    }
    return got;
  }

  doneChapters() {
    return new Set(Object.values(this.db.chapter).filter((c) => c.props.done && this.check(words(c.props.done))).map((c) => c.id));
  }

  /** 主线章节完成：门派声望约等于两个每日任务（一阶 60、二阶 70、三阶起 90，D-103） */
  chapterRep(chapterId) {
    const p = this.state.player;
    if (!p.sect) return;
    const rep = [60, 70, 90][Math.min(p.sect.rank, 2)];
    const sect = this.db.sect[p.sect.id]?.props.name ?? '';
    this.emit('sys', `你在江湖上的作为传回了${sect}，同门都与有荣焉。`);
    this.addRep(p.sect.id, rep);
  }

  applyEffects(effects) {
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
        // 空手时得到兵器：自动拿在手里（D-095）
        if (isWeaponItem(this.db, key) && !player.equip?.weapon) {
          player.equip ??= {};
          player.equip.weapon = key;
          this.emit('sys', `（你手里正空着，顺手把${this.db.item[key].props.name}握在了手里。）`);
        }
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
      else if (kind === 'today') { this.state.daily ??= {}; this.state.daily[key] = todayStr(); }
      else if (kind === 'money') this.addMoney(Number(key));
      else if (kind === 'pay') this.addMoney(-Number(key));
      else if (kind === 'travel') this.travel(key);
      else if (kind === 'sectlearn') this.learn(key); // 向本门师父学艺（不要钱，规则同"学"命令）
      else if (kind === 'promote') this.promote(); // 向本门师父申请晋阶（D-099，规则同"晋阶"命令）
      else if (kind === 'escort') this.hireEscort(); // 车马行雇镖师（D-104）
      else if (kind === 'qiyu') this.qiyuEnd(key === 'good'); // 马车奇遇收场：good 发奖励，然后到站（D-114）
      else if (kind === 'study') this.studyBook(key); // 研读奇遇得来的秘籍（D-114）
      else if (kind === 'learn') {
        if (player.skills[key] === undefined) {
          player.skills[key] = 1;
          this.emit('story', `你学会了${this.db.skill[key]?.props.name ?? key}！`);
          this.autoEquip(key);
        }
      }
      else if (kind === 'cap') {
        // 提高某门武功的上限（剧情奖励，如独门武功随章节解锁，D-060）
        const [id, n] = splitOnce(key);
        player.skillcap ??= {};
        if ((player.skillcap[id] ?? 0) < Number(n)) {
          player.skillcap[id] = Number(n);
          this.emit('story', `你对${this.db.skill[id]?.props.name ?? id}的领悟更深了一层（上限提高到 ${n} 级）。`);
        }
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
    const p = this.state.player;
    const inv = Object.entries(p.inventory);
    this.emit('sys', inv.length ? '你身上带着：' + inv.map(([id, n]) => `${this.itemLink(id)}×${n}`).join('、') : '你身上除了钱，别无长物。');
    this.emit('sys', `钱：身上 ${p.money ?? 0} 文${p.bank ? `，钱庄存着 ${p.bank} 文` : ''}。`);
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
    // 门派学艺（D-069）：在本门师父面前，把眼下能学的武功列成选项，学完回到这里接着挑
    if (d.props.teach === 'true') m.choices = [...this.teachChoices(id), ...m.choices];
    // 晋阶（D-099）：本门师父的对话里自动加"申请晋阶"，插在"离开"类选项前面；最高阶时没有
    const promo = this.promoteChoice(id);
    if (promo) {
      const leave = (c) => !c.target && !c.effects.length;
      m.choices = [...m.choices.filter((c) => !leave(c)), promo, ...m.choices.filter(leave)];
    }
    if (d.props.do && !resume) this.apply(words(d.props.do)); // 进入该对话即生效的效果（恢复时不重复）
    // do 里的 goto 可能触发了目标房间的剧情对话：那个对话接管，这里不再收尾（否则会把它关掉）
    if (this.dialogId !== id) return;
    // 只差钱的选项（如铁匠铺、武馆）也列出来，灰色不能点（D-078）；其他条件不满足的照旧不显示
    const choices = m.choices.map((c) => (this.check(c.cond) ? c : this.onlyMoneyShort(c.cond) ? { ...c, disabled: true } : null)).filter(Boolean);
    // ifnone：除"离开"类选项外一个都没有时显示的话（如"目前没有门派任务"，D-054）
    if (d.props.ifnone && !choices.some((c) => c.target || c.effects.length)) this.emit('say', d.props.ifnone);
    if (!choices.length) { this.endDialog(); return; }
    this.dialog = choices;
    this.state.dialog = { id, locked: this.locked };
    this.emitChoices();
  }

  emitChoices() {
    this.dialog.forEach((c, i) => this.emit('choice', c.disabled ? `${c.text}（钱不够）` : c.text, { n: i + 1, disabled: !!c.disabled, blocked: !!c.blocked }));
  }

  /** 条件里不满足的只有"钱够不够"（money:） */
  onlyMoneyShort(conds) {
    const failed = conds.filter((c) => !this.check([c]));
    return failed.length > 0 && failed.every((c) => c.startsWith('money:'));
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
    if (c.disabled) { this.emit('err', '钱不够。'); this.emitChoices(); return; }
    // 灰色但能点的选项（D-099）：点了说明为什么不行，对话不结束
    if (c.blocked) { this.emit('err', c.blocked); this.emitChoices(); return; }
    this.emit('echo', `> ${c.text}`);
    const locked = this.locked;
    this.dialog = null;
    this.ctx = this.dialogId;
    this.apply(c.effects);
    if (c.target) {
      this.locked = locked;
      this.showDialog(c.target);
    } else if (!this.dialog) {
      // 效果里已经打开了新的对话（雇完镖师回到车马行列表、坐车到站触发剧情……）就不收尾，否则会把它关掉（D-104）
      this.endDialog();
    }
  }

  /** 各条主线的当前目标；hints 为 true 时连具体做法一起显示（D-074） */
  showGoals(hints) {
    const lines = this.storyView().filter((s) => s.started && s.goal);
    if (!lines.length) { this.emit('sys', '眼下没有在进行的主线。'); return; }
    for (const s of lines) {
      this.emit('sys', `【${s.name}】${s.goal}`);
      if (hints && s.goalHint) this.emit('sys', `　提示：${s.goalHint}`);
    }
    if (!hints && lines.some((s) => s.goalHint)) this.emit('sys', '（不知道怎么做？输入 提示 查看。）');
  }

  /** 江湖百科（D-111）：不带参数列出条目，带门派名显示介绍和武学 */
  showWiki(arg) {
    const all = this.wikiView();
    const key = (arg ?? '').trim();
    if (key && key.length >= 2 && ['招式效果', '战斗规则'].some((t) => t.includes(key)) || key === 'effects') {
      for (const grp of this.effectsView()) {
        this.emit('sys', `〔${grp.group}〕${grp.note}`);
        for (const it of grp.items) this.emit('sys', `　${it.name}：${it.text}`);
      }
      return;
    }
    const w = key && all.find((x) => x.name === key || x.id === key || x.name.startsWith(key));
    if (!w) {
      if (key) this.emit('err', `百科里没有「${key}」。`);
      this.emit('sys', `【江湖百科】${all.map((x) => x.name).join('、')}、战斗规则。输入 百科 少林、百科 规则 查看。`);
      return;
    }
    this.emit('sys', `【${w.name}】驻地：${w.seat}　师父：${w.master}　侧重：${w.style}`);
    if (w.quest) this.emit('sys', `绝学任务：${w.quest}`);
    for (const sec of w.sections) {
      if (sec.title) this.emit('sys', `〔${sec.title}〕`);
      for (const p of sec.paras) this.emit('sys', `　${p}`);
    }
    if (w.ranks.length) this.emit('sys', `〔阶位〕${w.ranks.map((r) => `${r.name}（声望 ${r.rep}，上限 ${r.cap} 级）`).join('、')}`);
    this.emit('sys', '〔武学〕');
    for (const sk of w.skills) {
      const where = sk.secret ? `绝学任务（${sk.rankName}）` : sk.rankName || '武馆';
      const moves = sk.moves.length ? `：${sk.moves.map((m) => `${m.name}（${m.stance}，${m.level}级）`).join('、')}` : '';
      this.emit('sys', `　${where}　${sk.name}（${sk.kind}${sk.stance ? '·' + sk.stance : ''}${sk.weapon ? '，要有' + sk.weapon : ''}）${sk.learned ? '［已学］' : ''}${moves}`);
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
      '  叛出师门               离开门派：本门武功保留，但不能再学新的、不能再拜回',
      '  天赋 / 天赋 加 截脉     查看、点选天赋（门派每晋升一阶 1 点，每条主线 3 点；天赋 重置 免费）',
      '  目标 / 提示            查看各主线的当前目标；不知道怎么做时用 提示 看具体做法',
      '  百科 / 百科 少林        查看各门派的来历、武功路数和能学到的全部武学；百科 效果 查看点穴、护体等效果',
      '  休息                   在旅店休息，恢复气血（过去一天）',
      '  乘车 / 乘车 襄阳        在车马行坐马车去别的城市（路上可能遇到劫道，也可能碰上奇遇）',
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

/** 现实中的今天（本地日期）。门派任务每天只能做一次（D-049） */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** 属性里的条件 / 效果列表：空格或逗号分隔 */
function words(s = '') {
  return s.split(/[\s,]+/).filter(Boolean);
}

function splitOnce(s) {
  const i = s.indexOf(':');
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)];
}

Object.assign(Game.prototype, martial, trade, views, party);
