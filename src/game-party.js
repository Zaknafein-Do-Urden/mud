// 引擎的联机部分（房主一侧）：队伍成员、客人命令、战后结算。以方法的形式并入 Game。
// 规则见 docs/MULTIPLAYER.md：房主权威，客人跟随、建议、并肩战斗，只拿战斗收益（D-009 ~ D-011）。
//
// 输出条目可以带 to 字段（接收者 pid）：没有 to 的发给所有人，有 to 的只给那个人。
// 'host' 是房主自己；客人的 pid 是网络层给的对端 id。

import { CONFIG } from './config.js';
import { playerUnitOf, playersOf, intentsReady, moveInfo } from './combat.js';
import { expPerUse, gainExp, maxHp, maxMp } from './character.js';

export const MAX_GUESTS = CONFIG.party.maxGuests;

/** 客人在本地自己处理的命令（查看自己、调整武功天赋等），不发给房主 */
export const GUEST_LOCAL = new Set(['状态', 'hp', 'score', '武功', 'skills', '天赋', 'talent', '装备', 'equip', '卸下', 'unequip',
  'i', 'inv', 'inventory', '背包', '物品', 'help', 'h', '帮助', '?', '货物', 'cargo', '吃', '喝', 'eat', 'drink']);

/** 房主执行后不广播给客人的命令（房主自己的私事） */
export const HOST_PRIVATE = new Set([...GUEST_LOCAL, '行情', '市场', 'market', '买', 'buy', '卖', 'sell', '存', '取', '存款', '银票',
  'deposit', 'withdraw', '修炼', '练', 'train', '学', 'learn', '叛出师门', '叛师', '队伍']);

export const party = {
  partyStart(code) {
    this.party = { code, members: [] };
    this.outbox = [];
    this.settleSeq = 0;
  },

  partyEnd() {
    this.party = null;
    this.outbox = [];
  },

  member(pid) { return this.party?.members.find((m) => m.pid === pid); },
  nameOf(pid) { return pid === 'host' ? this.state.player.name : this.member(pid)?.name ?? '某人'; },

  /** 参战的全部玩家：房主在前 */
  partyPlayers() {
    if (!this.party) return this.state.player;
    return [{ pid: 'host', player: this.state.player }, ...this.party.members.map((m) => ({ pid: m.pid, player: m.snap }))];
  },

  addMember(pid, snap) {
    this.out = [];
    if (this.party.members.length >= MAX_GUESTS) return null;
    const snapCopy = structuredClone(snap);
    snapCopy.hp = maxHp(this.db, snapCopy); // 入队时按满血计
    snapCopy.mp = maxMp(this.db, snapCopy);
    this.party.members.push({ pid, name: snap.name, snap: snapCopy });
    this.emit('party', `${snap.name}加入了队伍。`);
    return this.out;
  },

  removeMember(pid) {
    this.out = [];
    const m = this.member(pid);
    if (!m) return this.out;
    this.party.members = this.party.members.filter((x) => x !== m);
    this.emit('party', `${m.name}离开了队伍。`);
    // 战斗中离队：视为倒下；如果其他人都已出招，就结算这一回合
    const b = this.state.battle;
    const u = b && playerUnitOf(b, pid);
    if (u) {
      u.hp = 0;
      if (!b.over && intentsReady(b)) this.resolvePartyRound();
    }
    return this.out;
  },

  updateSnap(pid, snap) {
    const m = this.member(pid);
    if (!m || this.state.battle) return; // 战斗中不换，打完再说
    const { hp, mp } = m.snap;
    m.snap = structuredClone(snap);
    // 客人自己吃喝过（D-133）就按客人报的来，只升不降
    const keep = (old, now) => (old == null ? Infinity : Math.max(old, now ?? 0));
    m.snap.hp = Math.min(keep(hp, snap.hp), maxHp(this.db, m.snap));
    m.snap.mp = Math.min(keep(mp, snap.mp), maxMp(this.db, m.snap));
  },

  /** 客人发来的命令。返回输出条目（带 to 的只给某人） */
  guestCmd(pid, text) {
    this.out = [];
    const line = text.trim();
    const name = this.nameOf(pid);
    const [verb, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    const v = verb.toLowerCase();
    if (this.state.battle) {
      if (['说', 'say'].includes(v)) { this.emit('chat', `【队】${name}：${arg}`); return this.out; }
      this.combatInput(line, pid);
      return this.out;
    }
    if (['说', 'say'].includes(v)) {
      this.emit('chat', `【队】${name}：${arg}`);
    } else if (['建议', 'suggest'].includes(v)) {
      if (!arg) { this.emit('err', '建议什么？例如：建议 北', { to: pid }); return this.out; }
      this.emit('suggest', `${name}建议：${arg}`, { to: 'host', cmd: arg, from: name });
      this.emit('sys', `你向队长建议：${arg}`, { to: pid });
    } else if (['l', 'look', '看', '观察'].includes(v)) {
      const before = this.out.length;
      arg ? this.lookAt(arg) : this.look();
      for (let i = before; i < this.out.length; i++) this.out[i].to = pid;
    } else {
      this.emit('sys', '你在队伍中，跟随队长行动。可以用 建议 向队长提议（点击出口、人物、选项也会自动变成建议）。', { to: pid });
    }
    return this.out;
  },

  /** 组队战斗：记下某人的出招，人到齐了就结算 */
  partyIntent(pid) {
    const b = this.state.battle;
    const u = playerUnitOf(b, pid);
    const it = u.intent;
    const what = it.type === 'rest' ? '调息' : it.type === 'stunned' ? '动弹不得' : `${moveInfo(this.db, it.move).name}（${it.stance}）`;
    // 队友的出招实时可见，方便配合（D-019）
    this.emit('team', `${u.name} 已出招：${what}`);
    if (intentsReady(b)) this.resolvePartyRound();
    else this.emit('sys', '（等待队友出招……）', { to: pid });
  },

  /** 出招时限到了：没出招的人自动调息（UI 负责计时，MULTIPLAYER.md） */
  combatTimeout() {
    this.out = [];
    const b = this.state.battle;
    if (!b || b.over) return this.out;
    for (const u of playersOf(b).filter((x) => x.hp > 0 && !x.intent && !x.status.点穴)) {
      u.intent = { type: 'rest' };
      this.emit('team', `${u.name} 犹豫未决，只好调息。`);
    }
    this.resolvePartyRound();
    return this.out;
  },

  resolvePartyRound() {
    this.finishRound();
  },

  /**
   * 一个玩家对象按本场使用情况长经验，返回 {texts, amounts}。
   * 房主直接作用在自己的存档上；客人作用在房主保存的快照上，并把 amounts 发给客人，
   * 客人用同一套公式作用在自己的存档上（结果一致）。
   */
  gainFromBattle(b, unit, player) {
    const texts = [];
    const amounts = {};
    const add = (id, times) => {
      if (!id || !times || player.skills[id] === undefined) return;
      let total = 0;
      let ups = 0;
      for (let i = 0; i < times; i++) {
        const g = expPerUse(b.foeLv, player.skills[id]);
        total += g;
        ups += gainExp(this.db, player, id, g);
      }
      if (total) {
        amounts[id] = total;
        texts.push(`${this.db.skill[id]?.props.name ?? id} +${total}${ups ? `（升到 ${player.skills[id]} 级！）` : ''}`);
      }
    };
    for (const [id, n] of Object.entries(unit.used ?? {})) add(id, n);
    add(player.loadout.inner, unit.rounds);
    add(player.loadout.light, unit.rounds);
    return { texts, amounts };
  },

  /** 战后给客人结算：实战经验、潜能（胜利时）、气血。D-009：只给战斗收益 */
  settleGuests(b, result, potential) {
    if (!this.party) return;
    for (const m of this.party.members) {
      const u = playerUnitOf(b, m.pid);
      if (!u) continue;
      const { texts, amounts } = this.gainFromBattle(b, u, m.snap);
      const pot = result === 'win' ? potential : 0;
      m.snap.potential = (m.snap.potential ?? 0) + pot;
      const mhp = maxHp(this.db, m.snap);
      m.snap.hp = result === 'win' ? Math.max(CONFIG.outcome.reviveHp, u.hp) : mhp;
      m.snap.mp = result === 'win' ? Math.max(0, Math.min(u.mp, maxMp(this.db, m.snap))) : maxMp(this.db, m.snap);
      if (texts.length) this.emit('sys', '实战经验：' + texts.join('，'), { to: m.pid });
      if (pot) this.emit('sys', `获得潜能 ${pot} 点。`, { to: m.pid });
      this.outbox.push({ to: m.pid, msg: { t: 'settle', seq: ++this.settleSeq, exp: amounts, potential: pot, hp: m.snap.hp, mp: m.snap.mp } });
    }
  },

  /** UI 用：队伍成员 */
  partyView() {
    if (!this.party) return null;
    return {
      code: this.party.code,
      members: [{ pid: 'host', name: this.state.player.name, host: true }, ...this.party.members.map((m) => ({ pid: m.pid, name: m.name }))],
    };
  },
};
