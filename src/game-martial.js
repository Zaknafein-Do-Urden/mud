// 引擎的武学部分：战斗、门派、修炼、旅店。以方法的形式并入 Game（见 game.js 末尾）。

import { maxHp, maxMp, skillCap, trainCost, sectRanks, bestInnerLv, MAX_OUTER, movesOf, expNeed, expPerUse, gainExp } from './character.js';
import { createBattle, createExamBattle, beginRound, setPlayerIntent, resolveRound, unitMoves, playerUnitOf, enemiesOf, hpText } from './combat.js';

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
    this.emit('sys', `【${p.name}】`);
    this.emit('sys', `气血 ${p.hp}/${this.hpMax()}　内力 ${maxMp(this.db, p)}（战斗开始时回满）　潜能 ${p.potential}`);
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
    if (this.room()?.props.inn !== 'true') { this.emit('err', '这里没法好好休息。去旅店吧。'); return; }
    const p = this.state.player;
    p.hp = this.hpMax();
    this.emit('sys', '你要了一间客房，美美睡了一觉。醒来时神清气爽。（气血全满）');
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
    const skills = Object.values(this.db.skill).filter((s) => s.props.sect === sectId);
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
    if (!sk) { this.emit('err', `${sect.props.name}没有「${name}」这门功夫。`); return; }
    if (p.skills[sk.id] !== undefined) { this.emit('sys', '你已经学会了。用 修炼 提升它。'); return; }
    const r = Number(sk.props.rank ?? 0);
    if (r > p.sect.rank) { this.emit('err', `${sk.props.name}要${ranks[r]?.name ?? '更高阶位'}才能学。多做些门派任务吧。`); return; }
    // 从 1 级学起：比 10 级的基础武功弱，要靠实战和修炼练上来（D-035）
    p.skills[sk.id] = 1;
    this.emit('story', `你学会了${sk.props.name}！（1 级。战斗中多用它，就能长进。）`);
    // 有空栏位就自动装上；内功只在不降级时自动替换
    const lo = p.loadout;
    const curInner = lo.inner ? p.skills[lo.inner] ?? 0 : -1;
    if (sk.props.kind === '外功' && lo.outer.length < MAX_OUTER) lo.outer.push(sk.id);
    else if (sk.props.kind === '内功' && p.skills[sk.id] >= curInner) lo.inner = sk.id;
    else if (sk.props.kind === '轻功' && !lo.light) lo.light = sk.id;
    else { this.emit('sys', '（栏位已满，需要时用 装备 换上。）'); return; }
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
  },

  joinSect(id) {
    const p = this.state.player;
    const sect = this.db.sect[id];
    if (!sect) { this.emit('err', `[内容错误] 门派不存在: ${id}`); return; }
    if (p.sect) { this.emit('err', `你已是${this.db.sect[p.sect.id]?.props.name}弟子，不能再拜入别派。`); return; }
    if (p.formerSects?.includes(id)) { this.emit('err', `你是${sect.props.name}的叛徒，人家不会再收你。`); return; }
    p.sect = { id, rep: 0, rank: 0 };
    this.emit('story', `你拜入了${sect.props.name}，成为${sectRanks(sect)[0]?.name}。（输入 学 查看本门武学）`);
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
    const b = createBattle(this.db, block, this.state.player, (Date.now() ^ (Math.random() * 1e9)) | 0);
    this.state.battle = b;
    this.emitLines(block.lines, 'desc');
    this.emit('combat', `——与${enemiesOf(b).map((e) => e.name).join('、')}交手！——`);
    beginRound(this.db, b, (cls, text, extra) => this.emit(cls, text, extra));
  },

  combatInput(line) {
    const b = this.state.battle;
    const v = line.split(/\s+/)[0].toLowerCase();
    const emit = (cls, text, extra) => this.emit(cls, text, extra);
    if (['逃', '逃跑', 'flee'].includes(v)) {
      if (this.db.battle[b.id]?.props.flee === 'false') { this.emit('err', '此战无路可退！'); return; }
      this.emit('fx', '你虚晃一招，抽身退出了战圈。');
      this.endBattle('flee');
      return;
    }
    if (['h', 'help', '帮助', '?'].includes(v)) {
      this.emit('sys', '【战斗】输入招式编号出招，如 2；多个对手时 2 1 表示对第 1 个对手出第 2 招。0 = 调息。逃跑 = 撤出战斗。');
      this.emit('sys', '刚克守、巧克刚、守克巧。看清对手的预兆再出手。');
      return;
    }
    const errMsg = setPlayerIntent(this.db, b, line);
    if (errMsg) { this.emit('err', errMsg); return; }
    resolveRound(this.db, b, emit);
    if (b.over) this.endBattle(b.over);
    else beginRound(this.db, b, emit);
  },

  endBattle(result) {
    const b = this.state.battle;
    const block = this.db.battle[b.id];
    const p = this.state.player;
    const me = playerUnitOf(b);
    p.hp = Math.max(0, me.hp);
    delete this.state.battle;
    this.awardExp(b, me);
    if (b.exam) { this.endExam(b, result); return; }
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
    const p = this.state.player;
    const gains = [];
    const add = (id, times) => {
      if (!id || !times || p.skills[id] === undefined) return;
      let total = 0;
      let ups = 0;
      for (let i = 0; i < times; i++) {
        const g = expPerUse(b.foeLv, p.skills[id]);
        total += g;
        ups += gainExp(this.db, p, id, g);
      }
      if (total) gains.push(`${this.db.skill[id].props.name} +${total}${ups ? `（升到 ${p.skills[id]} 级！）` : ''}`);
    };
    for (const [id, n] of Object.entries(me.used ?? {})) add(id, n);
    add(p.loadout.inner, me.rounds);
    add(p.loadout.light, me.rounds);
    if (gains.length) this.emit('sys', '实战经验：' + gains.join('，'));
    this.normalizeHp();
  },

  endExam(b, result) {
    const p = this.state.player;
    const ranks = sectRanks(this.db.sect[b.exam.sect]);
    if (result === 'win' && p.sect?.id === b.exam.sect) {
      p.sect.rank = b.exam.rank;
      p.hp = Math.max(p.hp, 1);
      this.emit('combat', '——考核通过！——');
      this.emit('story', `师父点了点头：“好，从今日起，你便是本门${ranks[b.exam.rank]?.name}了。”`);
    } else {
      p.hp = Math.max(1, p.hp, Math.round(this.hpMax() * 0.3));
      this.emit('combat', result === 'flee' ? '——你认输了。——' : '——考核未过。——');
      this.emit('story', '师父摆摆手：“火候还差些，回去再练练。准备好了随时再来。”');
    }
  },

  /** UI 用：战斗面板数据 */
  combatView() {
    const b = this.state.battle;
    if (!b) return null;
    const me = playerUnitOf(b);
    return {
      round: b.round,
      me: { hp: me.hp, maxHp: me.maxHp, mp: me.mp, maxMp: me.maxMp, status: Object.keys(me.status).filter((k) => !k.endsWith('dot')) },
      enemies: enemiesOf(b).map((e, i) => ({ n: i + 1, key: e.key, name: e.name, hp: e.hp, maxHp: e.maxHp, hpText: hpText(e), status: Object.keys(e.status).filter((k) => !k.endsWith('dot')), dead: e.hp <= 0 })),
      moves: unitMoves(this.db, me).map((m, i) => ({ n: i + 1, name: m.name, skillName: m.skillName, stance: m.stance, mp: m.mp, effects: m.effects, usable: m.mp <= me.mp })),
      target: b.lastTarget,
      canFlee: b.exam ? true : this.db.battle[b.id]?.props.flee !== 'false',
    };
  },

  /** UI 用：顶部状态 */
  statusView() {
    const p = this.state.player;
    this.normalizeHp();
    return { hp: p.hp, maxHp: this.hpMax(), mp: maxMp(this.db, p), potential: p.potential };
  },
};

