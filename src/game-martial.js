// 引擎的武学部分：战斗、门派、修炼、旅店。以方法的形式并入 Game（见 game.js 末尾）。

import { maxHp, maxMp, skillCap, trainCost, sectRanks, bestInnerLv, MAX_OUTER, movesOf, expNeed, expPerUse, gainExp, isWeaponItem, weaponOf, ARMED } from './character.js';
import { TALENT_TREE, talentPointsSpent, canAddTalent, findTalent, tal } from './talents.js';
import { adaptEnemyHp, isAdaptive, teamOf, xiuwei } from './combat.js';
import { todayStr } from './game.js';
import { createBattle, createExamBattle, beginRound, setPlayerIntent, resolveRound, unitMoves, playerUnitOf, playersOf, enemiesOf, hpText, moveInfo, canUse, comboHint, aimSeenBy } from './combat.js';

const KIND_LABEL = { 外功: '外功', 内功: '内功', 轻功: '轻功' };

export const martial = {
  // ---- 角色状态 ----

  hpMax() { return maxHp(this.db, this.state.player); },

  /** 首次计算或最大值变化后修正当前气血 */
  normalizeHp() {
    const p = this.state.player;
    const m = this.hpMax();
    if (p.hp === null || p.hp === undefined || p.hp > m) p.hp = m;
  },

  showStatus() {
    const p = this.state.player;
    this.normalizeHp();
    const sect = p.sect ? this.db.sect[p.sect.id] : null;
    const rank = sect ? sectRanks(sect)[p.sect.rank]?.name : null;
    this.emit('sys', `【${p.name}】${p.gender ?? ''}`);
    this.emit('sys', `气血 ${p.hp}/${this.hpMax()}　内力 ${maxMp(this.db, p)}（战斗开始时回满）　潜能 ${p.potential}`);
    this.emit('sys', `身上 ${p.money ?? 0} 文　存款 ${p.bank ?? 0} 文　第 ${this.state.day ?? 1} 日`);
    this.emit('sys', `根骨 ${p.attrs.根骨}　身法 ${p.attrs.身法}　悟性 ${p.attrs.悟性}`);
    this.emit('sys', sect ? `门派：[[${sect.props.name}|${sect.id}]]　${rank}　声望 ${p.sect.rep}` : '门派：无（江湖散人）');
  },

  showSkills() {
    const p = this.state.player;
    const { outer, inner, light } = p.loadout;
    this.emit('sys', '【武功】（★ 为已装备；修炼 武功名 可提升等级）');
    for (const [id, lv] of Object.entries(p.skills)) {
      const sk = this.db.skill[id];
      if (!sk) continue;
      const on = outer.includes(id) || inner === id || light === id ? '★' : '　';
      const stance = sk.props.stance ? `·${sk.props.stance}` : '';
      const cap = skillCap(this.db, p, id);
      const prog = p.frozen?.[id] ? '（已冻结）' : lv >= cap ? '（已到上限）' : `　经验 ${p.exp?.[id] ?? 0}/${expNeed(lv)}`;
      this.emit('sys', `${on} [[${sk.props.name}|${id}]]（${KIND_LABEL[sk.props.kind] ?? sk.props.kind}${stance}）${lv} / ${cap} 级${prog}`);
    }
    this.emit('sys', `外功栏 ${outer.length}/${MAX_OUTER}。装备 / 卸下 武功名 可调整。战斗中用哪门武功，哪门就长经验。`);
  },

  findSkill(name, pool) {
    return pool.find((id) => id === name || this.db.skill[id]?.props.name === name);
  },

  equip(name) {
    const p = this.state.player;
    // 兵器（D-057）
    const wid = Object.keys(p.inventory).find((id) => isWeaponItem(this.db, id) && (id === name || this.db.item[id].props.name === name));
    if (wid) {
      p.equip ??= {};
      p.equip.weapon = wid;
      const it = this.db.item[wid];
      this.emit('sys', `你握住了${it.props.name}。（${it.props.weapon}${Number(it.props.bonus) ? `，${it.props.weapon}类招式伤害 +${it.props.bonus}%` : ''}）`);
      return;
    }
    const id = this.findSkill(name, Object.keys(p.skills));
    if (!id) { this.emit('err', `你不会「${name}」。`); return; }
    const kind = this.db.skill[id].props.kind;
    const lo = p.loadout;
    if (kind === '内功') { lo.inner = id; this.normalizeHp(); }
    else if (kind === '轻功') lo.light = id;
    else {
      if (lo.outer.includes(id)) { this.emit('sys', '已经装备了。'); return; }
      if (lo.outer.length >= MAX_OUTER) { this.emit('err', `外功栏已满（${MAX_OUTER} 门），先卸下一门。`); return; }
      lo.outer.push(id);
    }
    this.emit('sys', `你装备了${this.db.skill[id].props.name}。`);
  },

  unequip(name) {
    const p = this.state.player;
    const w = weaponOf(this.db, p);
    if (w && (name === w.id || name === w.props.name || name === '兵器')) {
      p.equip.weapon = null;
      this.emit('sys', `你收起了${w.props.name}，空手应敌。`);
      return;
    }
    const lo = this.state.player.loadout;
    const id = this.findSkill(name, [...lo.outer, lo.inner, lo.light].filter(Boolean));
    if (!id) { this.emit('err', `你没有装备「${name}」。`); return; }
    if (lo.outer.includes(id)) {
      if (lo.outer.length === 1) { this.emit('err', '至少要保留一门外功。'); return; }
      lo.outer = lo.outer.filter((x) => x !== id);
    } else if (lo.inner === id) { lo.inner = null; this.normalizeHp(); }
    else lo.light = null;
    this.emit('sys', `你卸下了${this.db.skill[id].props.name}。`);
  },

  /** 是否在可以修炼 / 休息的地方 */
  canTrain() {
    const r = this.room();
    return r?.props.inn === 'true' || r?.props.train === 'true';
  },

  train(name) {
    const p = this.state.player;
    if (!name) { this.emit('err', '修炼什么？例如：修炼 莲花掌（输入 武功 查看已学武功）'); return; }
    if (!this.canTrain()) { this.emit('err', '这里不是修炼的地方。去旅店或本门驻地吧。'); return; }
    const id = this.findSkill(name, Object.keys(p.skills));
    if (!id) { this.emit('err', `你不会「${name}」。`); return; }
    const lv = p.skills[id];
    const cap = skillCap(this.db, p, id);
    const sk = this.db.skill[id];
    if (p.frozen?.[id]) { this.emit('err', `你已叛出师门，${sk.props.name}再也无法精进了。`); return; }
    if (lv >= cap) {
      const why = sk.props.kind !== '内功' && bestInnerLv(this.db, p) + 20 <= cap ? '先把内功练上去吧' : '需要更高的门派阶位或更完整的典籍';
      this.emit('err', `${sk.props.name}已到 ${cap} 级，眼下无法再进，${why}。`);
      return;
    }
    const cost = trainCost(p, lv);
    if (p.potential < cost) { this.emit('err', `潜能不足：修炼到 ${lv + 1} 级需要 ${cost} 点，你只有 ${p.potential} 点。`); return; }
    p.potential -= cost;
    p.skills[id] = lv + 1;
    if (sk.props.kind === '内功') this.normalizeHp();
    this.emit('sys', `你潜心修炼${sk.props.name}，渐有所得。（${lv} → ${lv + 1} 级，潜能 -${cost}）`);
    const newMoves = movesOf(this.db, id, lv + 1).filter((m) => Number(m.props.level ?? 0) === lv + 1);
    for (const m of newMoves) this.emit('story', `你领悟了新的招式：「${m.props.name}」！`);
  },

  rest() {
    if (this.room()?.props.inn !== 'true') { this.emit('err', '这里没法好好休息。去旅店或本门驻地吧。'); return; }
    const p = this.state.player;
    p.hp = this.hpMax();
    this.state.day = (this.state.day ?? 1) + 1;
    const msg = this.room().props.restmsg ?? '你要了一间客房，美美睡了一觉。醒来时神清气爽。';
    this.emit('sys', `${msg}（气血全满，第 ${this.state.day} 日）`);
  },

  // ---- 天赋（D-044）----

  /**
   * 天赋点（D-107、D-108）：门派每晋升一阶 1 点（叛出师门全部收回）；每条主线 3 点（见 storyTalents）。
   * 返回 { rank, lines, total }，lines 是主线给的点数
   */
  talentPoints() {
    const p = this.state.player;
    const rank = p.sect?.rank ?? 0;
    const lines = this.storyTalents().size;
    return { rank, lines, total: rank + lines };
  },

  /** 天赋点变少了（叛出师门）、已点的超过了总数：全部退回重新点（D-107） */
  fitTalents() {
    const p = this.state.player;
    if (talentPointsSpent(p) <= this.talentPoints().total) return;
    p.talents = {};
    this.normalizeHp();
    this.emit('sys', '你的天赋点少了，已点的天赋全部退回，请重新分配。');
  },

  /** 天赋 / 天赋 加 截脉 / 天赋 重置 */
  talentCmd(arg) {
    const p = this.state.player;
    p.talents ??= {};
    this.fitTalents();
    const [op, name] = arg.split(/\s+/);
    if (op === '加' || op === 'add') {
      const n = findTalent(name ?? '');
      const why = n ? canAddTalent(p, n.id, this.talentPoints().total) : '没有这个天赋。';
      if (why) { this.emit('err', why); return; }
      p.talents[n.id] = tal(p, n.id) + 1;
      this.normalizeHp();
      this.emit('story', `你领悟了天赋「${n.name}」（${p.talents[n.id]}/${n.max}）：${n.desc}`);
      return;
    }
    if (op === '重置' || op === 'reset') {
      p.talents = {};
      this.normalizeHp();
      this.emit('sys', '你静坐冥想，将所悟重新梳理了一遍。（天赋点已全部退回）');
      return;
    }
    const pts = this.talentPoints();
    this.emit('sys', `【天赋】可用天赋点 ${pts.total - talentPointsSpent(p)} / ${pts.total}（门派阶位 ${pts.rank} 点，主线 ${pts.lines} 点）。门派每晋升一阶得 1 点；每条主线走到三成、七成左右和完结时各得 1 点。`);
    for (const br of TALENT_TREE) {
      this.emit('sys', `${br.name}（${br.desc}）：` + br.nodes.map((n) => `${n.name} ${tal(p, n.id)}/${n.max}`).join('　'));
    }
    this.emit('sys', '天赋 加 天赋名 / 天赋 重置（免费）。也可以在"人物 → 天赋"里点选。');
  },

  // ---- 门派 ----

  sectOfMaster() {
    return this.npcsHere().map((n) => n.props.teaches).find(Boolean);
  },

  learn(name) {
    const p = this.state.player;
    const sectId = this.sectOfMaster();
    if (!sectId) { this.emit('err', '这里没有可以传授你武功的人。'); return; }
    const sect = this.db.sect[sectId];
    if (p.sect?.id !== sectId) { this.emit('err', `你不是${sect.props.name}弟子，人家不会传你武功。`); return; }
    const skills = Object.values(this.db.skill).filter((s) => s.props.sect === sectId && s.props.secret !== 'true'); // 绝学不能直接学（D-085）
    const ranks = sectRanks(sect);
    if (!name) {
      this.emit('sys', `【${sect.props.name}武学】（学 武功名）`);
      for (const s of skills) {
        const r = Number(s.props.rank ?? 0);
        const state = p.skills[s.id] !== undefined ? '已学' : r <= p.sect.rank ? '可学' : `需${ranks[r]?.name ?? '更高阶位'}`;
        this.emit('sys', `　[[${s.props.name}|${s.id}]]（${s.props.kind}${s.props.stance ? '·' + s.props.stance : ''}）${state}`);
      }
      return;
    }
    const sk = skills.find((s) => s.props.name === name || s.id === name);
    const secret = Object.values(this.db.skill).find((s) => s.props.sect === sectId && s.props.secret === 'true' && (s.props.name === name || s.id === name));
    if (!sk && secret) { this.emit('err', `${secret.props.name}是本门绝学，师父不会轻易传授。达到第四阶后，向师父请缨做门派绝学任务。`); return; }
    if (!sk) { this.emit('err', `${sect.props.name}没有「${name}」这门功夫。`); return; }
    if (p.skills[sk.id] !== undefined) { this.emit('sys', '你已经学会了。用 修炼 提升它。'); return; }
    const r = Number(sk.props.rank ?? 0);
    if (r > p.sect.rank) { this.emit('err', `${sk.props.name}要${ranks[r]?.name ?? '更高阶位'}才能学。多做些门派任务吧。`); return; }
    // 从 1 级学起：比 10 级的基础武功弱，要靠实战和修炼练上来（D-035）
    p.skills[sk.id] = 1;
    this.emit('story', `你学会了${sk.props.name}！（1 级。战斗中多用它，就能长进。）`);
    this.autoEquip(sk.id);
  },

  /**
   * 晋阶选项（D-099）：只出现在本门师父自己的对话里；已是最高阶时不出现。
   * 声望够了可以点（走"晋阶"命令的规则：每天一次、要过考核）；不够时选项是灰的，点了提示还差多少。
   */
  promoteChoice(dialogId) {
    const p = this.state.player;
    if (!p.sect) return null;
    const master = this.npcsHere().find((n) => n.props.teaches === p.sect.id && n.props.talk === dialogId);
    if (!master) return null;
    const next = sectRanks(this.db.sect[p.sect.id])[p.sect.rank + 1];
    if (!next) return null;
    const text = `申请晋阶（升${next.name}，需声望 ${next.rep}，你有 ${p.sect.rep}）`;
    if (p.sect.rep < next.rep) return { text, target: null, cond: [], effects: [], blocked: `声望不够：晋升${next.name}要 ${next.rep} 点声望，你现在有 ${p.sect.rep}，还差 ${next.rep - p.sect.rep}。多做门派差事吧。` };
    return { text, target: null, cond: [], effects: ['promote'] };
  },

  /** 学艺对话的选项（D-069）：本门已到阶位、还没学的武功；阶位不够的列在文字里 */
  teachChoices(back) {
    const p = this.state.player;
    const sectId = this.sectOfMaster();
    if (!sectId || p.sect?.id !== sectId) return [];
    const ranks = sectRanks(this.db.sect[sectId]);
    // 绝学（secret）只能通过门派绝学任务得到，不在传授列表里（D-085）
    const todo = Object.values(this.db.skill).filter((s) => s.props.sect === sectId && p.skills[s.id] === undefined && s.props.secret !== 'true');
    const label = (s) => `${s.props.name}（${s.props.kind}${s.props.stance ? '·' + s.props.stance : ''}）`;
    const locked = todo.filter((s) => Number(s.props.rank ?? 0) > p.sect.rank);
    if (locked.length) this.emit('say', '要更高的阶位才能学：' + locked.map((s) => `${label(s)}需${ranks[Number(s.props.rank)]?.name ?? '更高阶位'}`).join('、'));
    return todo.filter((s) => Number(s.props.rank ?? 0) <= p.sect.rank)
      .map((s) => ({ text: `学${label(s)}`, target: back, cond: [], effects: [`sectlearn:${s.id}`] }));
  },

  /** 新学的武功：有空栏位就自动装上；内功只在不降级时自动替换 */
  autoEquip(id) {
    const p = this.state.player;
    const sk = this.db.skill[id];
    if (!sk) return;
    const lo = p.loadout;
    // 只在栏位空着时自动装备，不替换已经装备的（D-095：以前新学的门派心法会把武馆的养气诀顶掉）
    if (sk.props.kind === '外功' && lo.outer.length < MAX_OUTER && !lo.outer.includes(id)) lo.outer.push(id);
    else if (sk.props.kind === '内功' && !lo.inner) lo.inner = id;
    else if (sk.props.kind === '轻功' && !lo.light) lo.light = id;
    else {
      const what = sk.props.kind === '外功' ? '外功栏已满' : `${sk.props.kind}栏已经装着${this.db.skill[sk.props.kind === '内功' ? lo.inner : lo.light]?.props.name ?? '别的武功'}`;
      this.emit('sys', `（${what}，没有自动装备。需要时在人物面板的武功页里换上。）`);
      return;
    }
    this.normalizeHp();
    this.emit('sys', '（已自动装备。）');
  },

  promote() {
    const p = this.state.player;
    const sectId = this.sectOfMaster();
    if (!sectId || p.sect?.id !== sectId) { this.emit('err', '晋阶要在本门师父面前申请。'); return; }
    const ranks = sectRanks(this.db.sect[sectId]);
    const next = ranks[p.sect.rank + 1];
    if (!next) { this.emit('sys', '你已是本门最高阶位。'); return; }
    if (p.sect.rep < next.rep) { this.emit('err', `声望不足：晋升${next.name}需要 ${next.rep}，你现有 ${p.sect.rep}。`); return; }
    // 每天最多晋阶一次（D-054）
    if (this.state.daily?.[`promote.${sectId}`] === todayStr()) { this.emit('err', '你今天已经晋阶过了，根基未稳，明天再来吧。'); return; }
    // 晋阶考核：与一位势均力敌的同门过招（D-036）
    const sect = this.db.sect[sectId];
    const examiner = sect.props.examiner ?? '同门师兄';
    this.endDialog();
    this.normalizeHp();
    this.state.battle = createExamBattle(this.db, p, examiner, { sect: sectId, rank: p.sect.rank + 1 }, (Date.now() ^ (Math.random() * 1e9)) | 0);
    this.emit('story', `师父捋须道：“想升${next.name}？先过了${examiner}这一关。”`);
    this.emit('desc', `${examiner}抱拳上前：“得罪了。”他用的正是和你一模一样的功夫。`);
    this.emit('combat', `——晋阶考核：对${examiner}——`);
    beginRound(this.db, this.state.battle, (cls, text, extra) => this.emit(cls, text, extra));
  },

  /** 叛出师门：本门武功等级减半，且再也不能提升（D-037）。需要输入"叛出师门 确定" */
  leaveSect(arg) {
    const p = this.state.player;
    if (!p.sect) { this.emit('err', '你并无师门。'); return; }
    const sect = this.db.sect[p.sect.id];
    const own = Object.keys(p.skills).filter((id) => this.db.skill[id]?.props.sect === p.sect.id);
    if (arg !== '确定') {
      this.emit('err', `叛出${sect.props.name}后，本门武功（${own.map((id) => this.db.skill[id].props.name).join('、') || '无'}）等级减半，且永远不能再提升；也再不能回到${sect.props.name}。`);
      this.emit('err', '若心意已决，输入：叛出师门 确定');
      return;
    }
    for (const id of own) {
      p.skills[id] = Math.max(1, Math.floor(p.skills[id] / 2));
      p.frozen[id] = true;
      delete p.exp[id];
    }
    p.formerSects.push(p.sect.id);
    p.sect = null;
    this.normalizeHp();
    this.emit('story', `你解下背上的布袋，放在地上，头也不回地走了。从此你与${sect.props.name}再无瓜葛。`);
    this.fitTalents(); // 门派阶位给的天赋点全部收回（D-107）
  },

  joinSect(id) {
    const p = this.state.player;
    const sect = this.db.sect[id];
    if (!sect) { this.emit('err', `[内容错误] 门派不存在: ${id}`); return; }
    if (p.sect) { this.emit('err', `你已是${this.db.sect[p.sect.id]?.props.name}弟子，不能再拜入别派。`); return; }
    if (p.formerSects?.includes(id)) { this.emit('err', `你是${sect.props.name}的叛徒，人家不会再收你。`); return; }
    p.sect = { id, rep: 0, rank: 0 };
    this.emit('story', `你拜入了${sect.props.name}，成为${sectRanks(sect)[0]?.name}。（和师父对话选"传授武功"，或输入 学，都可以学本门武功）`);
  },

  addRep(sectId, n) {
    const p = this.state.player;
    if (p.sect?.id !== sectId) return;
    p.sect.rep += n;
    this.emit('sys', `${this.db.sect[sectId].props.name}声望 +${n}（现有 ${p.sect.rep}）`);
    const next = sectRanks(this.db.sect[sectId])[p.sect.rank + 1];
    if (next && p.sect.rep >= next.rep) this.emit('story', `你的声望已够晋升${next.name}，去向师父申请晋阶吧。`);
  },

  // ---- 战斗 ----

  startBattle(id) {
    const block = this.db.battle[id];
    if (!block) { this.emit('err', `[内容错误] 战斗不存在: ${id}`); return; }
    this.endDialog();
    this.normalizeHp();
    // 组队时全队参战（MULTIPLAYER.md）
    const b = createBattle(this.db, block, this.partyPlayers(), (Date.now() ^ (Math.random() * 1e9)) | 0);
    // 敌人按我方当前战斗力浮动（D-051、D-106、D-115）：主线必胜战、门派任务、城市差事都是；
    // 必败剧情战（写了 lose）和陪练（adapt: false）除外。
    // globalThis.MUD_SKIP_ADAPT 是给通关脚本用的开关（D-226）：那里敌人气血本来就要压到 1。浏览器里没人设这个变量。
    if (isAdaptive(block) && !globalThis.MUD_SKIP_ADAPT) adaptEnemyHp(this.db, b);
    this.state.battle = b;
    this.emitLines(block.lines, 'desc');
    this.emit('combat', `——与${enemiesOf(b).map((e) => e.name).join('、')}交手！——`);
    beginRound(this.db, b, (cls, text, extra) => this.emit(cls, text, extra));
  },

  combatInput(line, pid = 'host') {
    const b = this.state.battle;
    const v = line.split(/\s+/)[0].toLowerCase();
    const to = { to: pid };
    if (['逃', '逃跑', 'flee'].includes(v)) {
      if (pid !== 'host') { this.emit('err', '只有队长能下令撤退。', to); return; }
      if (b.noFlee || this.db.battle[b.id]?.props.flee === 'false') { this.emit('err', '此战无路可退！', to); return; }
      this.emit('fx', this.party ? '队长一声招呼，众人虚晃一招，抽身退出了战圈。' : '你虚晃一招，抽身退出了战圈。');
      this.endBattle('flee');
      return;
    }
    if (['h', 'help', '帮助', '?'].includes(v)) {
      this.emit('sys', '【战斗】输入招式编号出招，如 2；多个对手时 2 1 表示对第 1 个对手出第 2 招。0 = 调息。逃跑 = 撤出战斗（组队时只有队长能下令）。', to);
      this.emit('sys', '刚克守、巧克刚、守克巧。看清对手的预兆再出手。', to);
      return;
    }
    const me = playerUnitOf(b, pid);
    if (me?.intent && this.party) { this.emit('err', '你这回合已经出过招了。', to); return; }
    const errMsg = setPlayerIntent(this.db, b, line, pid);
    if (errMsg) { this.emit('err', errMsg, to); return; }
    if (this.party && playersOf(b).length > 1) { this.partyIntent(pid); return; }
    this.finishRound();
  },

  /**
   * 结算这一回合，接着开下一回合。玩家全倒下、NPC 队友还站着时，由队友自己打下去，
   * 直到分出胜负（D-115：我方还有一人站着就没输）。
   */
  finishRound() {
    const b = this.state.battle;
    const emit = (cls, text, extra) => this.emit(cls, text, extra);
    resolveRound(this.db, b, emit);
    if (!b.over && !playersOf(b).some((u) => u.hp > 0)) {
      emit('combat', '——你已倒地，队友还在苦战……——');
      for (let n = 0; !b.over && n < 60; n++) {
        beginRound(this.db, b, emit);
        resolveRound(this.db, b, emit);
      }
      if (!b.over) b.over = 'lose';
    }
    if (b.over) this.endBattle(b.over);
    else beginRound(this.db, b, emit);
  },

  endBattle(result) {
    const b = this.state.battle;
    const block = this.db.battle[b.id];
    const p = this.state.player;
    const me = playerUnitOf(b);
    // 打赢了，战斗中倒下的人也回到 1 点气血，接着走剧情（D-115）
    p.hp = Math.max(result === 'win' ? 1 : 0, me.hp);
    // 战斗中换过兵器就保留新的；被打飞的兵器战后拾回（D-057）
    if (me.wid !== (p.equip?.weapon ?? null)) { p.equip ??= {}; p.equip.weapon = me.wid; }
    if (me.dropped) this.emit('sys', `战后你拾回了被打飞的${this.db.item[me.dropped]?.props.name ?? '兵器'}。`, { to: 'host' });
    delete this.state.battle;
    this.awardExp(b, me);
    // 组队：给客人结算（实战经验胜负都给，潜能只在胜利时给）
    if (this.party && playersOf(b).length > 1) {
      this.settleGuests(b, result, enemiesOf(b).reduce((s, e) => s + e.potential, 0));
    }
    if (b.exam) { this.endExam(b, result); return; }
    if (b.robbery) { this.endRobbery(b, result); return; }
    // 主线战斗默认必须打赢，输了回到章节开始；写了 lose 分支的是"必败剧情战"，输了剧情照常继续（D-042）
    const storyBattle = !!this.db.storyline[b.id.split('.')[0]];
    if (result === 'lose' && storyBattle && !block?.props.lose) {
      this.emit('combat', '——你败下阵来。——');
      this.restoreCheckpoint();
      return;
    }
    if (result === 'win') {
      const pot = enemiesOf(b).reduce((s, e) => s + e.potential, 0);
      p.potential += pot;
      this.emit('combat', `——战斗胜利！获得潜能 ${pot} 点。——`);
      if (block?.props.win) this.showDialog(block.props.win);
    } else if (result === 'lose') {
      this.emit('combat', '——你眼前一黑，什么也不知道了。——');
      if (block?.props.lose) {
        p.hp = Math.max(1, Math.round(this.hpMax() * 0.3));
        this.showDialog(block.props.lose);
      } else {
        // 战败无惩罚：被人救起，回到最近的旅店（D-016）
        p.hp = this.hpMax();
        const meta = this.db.meta.game.props;
        const inn = [p.lastInn, meta.inn, meta.start].find((r) => r && this.db.room[r]);
        this.emit('story', '不知过了多久，你悠悠醒转，原来是被路过的好心人救了回来。');
        this.enter(inn);
      }
    }
  },

  /** 实战经验：本场用过的武功按使用次数长经验；内功、轻功按运功回合数长经验。胜负都给（练了就是练了） */
  awardExp(b, me) {
    const { texts } = this.gainFromBattle(b, me, this.state.player);
    if (texts.length) this.emit('sys', '实战经验：' + texts.join('，'), { to: 'host' });
    this.normalizeHp();
  },

  endExam(b, result) {
    const p = this.state.player;
    const ranks = sectRanks(this.db.sect[b.exam.sect]);
    if (result === 'win' && p.sect?.id === b.exam.sect) {
      p.sect.rank = b.exam.rank;
      this.state.daily ??= {};
      this.state.daily[`promote.${b.exam.sect}`] = todayStr();
      p.hp = Math.max(p.hp, 1);
      this.emit('combat', '——考核通过！——');
      this.emit('story', `师父点了点头：“好，从今日起，你便是本门${ranks[b.exam.rank]?.name}了。”（天赋点 +1）`);
    } else {
      p.hp = Math.max(1, p.hp, Math.round(this.hpMax() * 0.3));
      this.emit('combat', result === 'flee' ? '——你认输了。——' : '——考核未过。——');
      this.emit('story', '师父摆摆手：“火候还差些，回去再练练。准备好了随时再来。”');
    }
  },

  /** UI 用：战斗面板数据 */
  combatView(pid = 'host') {
    const b = this.state.battle;
    if (!b) return null;
    const me = playerUnitOf(b, pid);
    if (!me) return null;
    return {
      // 队友的状态与本回合已选的招式（D-019：队友出招实时可见）
      team: teamOf(b).filter((u) => u !== me).map((u) => ({
        name: u.name, hp: u.hp, maxHp: u.maxHp, npc: !!u.isAlly,
        chosen: !u.intent ? null : u.intent.type === 'rest' ? '调息' : u.intent.type === 'move' ? `${moveInfo(this.db, u.intent.move).name}（${u.intent.stance}）${u.intent.stance === '守' ? '' : ` → ${b.units.find((x) => x.key === u.intent.target)?.name ?? ''}`}` : '……',
      })),
      chosen: !!me.intent,
      isHost: pid === 'host',
      round: b.round,
      me: { hp: me.hp, maxHp: me.maxHp, mp: me.mp, maxMp: me.maxMp, status: Object.keys(me.status).filter((k) => !k.endsWith('dot')) },
      enemies: enemiesOf(b).map((e, i) => ({ n: i + 1, key: e.key, name: e.name, hp: e.hp, maxHp: e.maxHp, hpText: hpText(e), status: Object.keys(e.status).filter((k) => !k.endsWith('dot')), dead: e.hp <= 0, aim: e.hp > 0 ? aimSeenBy(b, e, me) : null })),
      moves: unitMoves(this.db, me).map((m, i) => {
        const armedOk = canUse(me, m);
        const hint = comboHint(this.db, b, me, m);
        // 合击要打的敌人：换成面板上的编号和名字，点卡片时自动打它（D-072）
        if (hint?.foe) { const foes = enemiesOf(b).filter((e) => e.hp > 0); const k = foes.findIndex((e) => e.key === hint.foe); hint.foeN = k + 1; hint.foeName = foes[k]?.name; }
        // 悬停说明（D-096）：和武功页同一份招式说明（威力、内力、估算伤害、效果）
        const tip = this.db.move[m.id] ? this.moveTip(this.db.skill[m.skill], this.db.move[m.id], m.lv).tip : '';
        return { n: i + 1, name: m.name, skillName: m.skillName, stance: m.stance, mp: m.mp, effects: m.effects, usable: (m.mp <= me.mp || (tal(me, 'qichen') && me.hp > (m.mp - me.mp) * 2)) && armedOk, need: armedOk ? '' : `需要${m.weapon}`, support: m.support, combo: hint, tip };
      }),
      // 兵器：手里的、被打飞的、可以换上的（D-057）
      weapon: me.disarmed ? null : me.wname,
      disarmed: !!me.disarmed,
      swaps: (me.bag ?? []).filter((id) => id !== me.dropped && (id !== me.wid || me.disarmed)).map((id) => ({ id, name: this.db.item[id]?.props.name ?? id })),
      target: me.lastTarget,
      // 守招、辅助招式的目标：1 是自己（D-064）
      allies: teamOf(b).filter((u) => u.hp > 0).map((u, i) => ({ n: i + 1, key: u.key, name: u === me ? `${u.name}（自己）` : u.name, hp: u.hp, maxHp: u.maxHp, self: u === me })),
      canFlee: pid === 'host' && (b.exam ? true : !b.noFlee && this.db.battle[b.id]?.props.flee !== 'false'),
    };
  },

  /** UI 用：顶部状态 */
  statusView() {
    const p = this.state.player;
    this.normalizeHp();
    return { hp: p.hp, maxHp: this.hpMax(), mp: maxMp(this.db, p), potential: p.potential, money: p.money ?? 0, day: this.state.day ?? 1 };
  },
};

