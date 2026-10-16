// 引擎给界面面板用的只读数据（D-045）。面板上的按钮一律通过发送命令来操作，
// 这样界面和命令行永远等价，联机时客人也只需要发命令。

import { maxMp, skillCap, trainCost, sectRanks, expNeed, MAX_OUTER, movesOf } from './character.js';
import { TALENT_TREE, talentPointsTotal, talentPointsSpent, canAddTalent, xiuwei, xiuweiToNext, tal } from './talents.js';
import { cargoUnits, CARGO_CAP } from './economy.js';

const words = (s = '') => s.split(/[\s,]+/).filter(Boolean);

export const views = {
  charView() {
    const p = this.state.player;
    this.normalizeHp();
    const sect = p.sect ? this.db.sect[p.sect.id] : null;
    const ranks = sect ? sectRanks(sect) : [];
    return {
      name: p.name, gender: p.gender, attrs: p.attrs,
      hp: p.hp, maxHp: this.hpMax(), mp: maxMp(this.db, p),
      potential: p.potential, money: p.money ?? 0, bank: p.bank ?? 0, day: this.state.day ?? 1,
      xiuwei: xiuwei(p),
      sect: sect ? {
        id: sect.id, name: sect.props.name, rank: ranks[p.sect.rank]?.name, rep: p.sect.rep,
        next: ranks[p.sect.rank + 1] ?? null,
      } : null,
      formerSects: (p.formerSects ?? []).map((id) => this.db.sect[id]?.props.name ?? id),
    };
  },

  skillsView() {
    const p = this.state.player;
    const lo = p.loadout;
    const canTrain = this.canTrain();
    const skills = Object.entries(p.skills).map(([id, lv]) => {
      const sk = this.db.skill[id];
      if (!sk) return null;
      const cap = skillCap(this.db, p, id);
      return {
        id, name: sk.props.name, kind: sk.props.kind, stance: sk.props.stance ?? '', lv, cap,
        exp: p.exp?.[id] ?? 0, need: expNeed(lv), frozen: !!p.frozen?.[id],
        equipped: lo.outer.includes(id) || lo.inner === id || lo.light === id,
        trainCost: trainCost(p, lv), canTrain: canTrain && lv < cap && !p.frozen?.[id],
        moves: movesOf(this.db, id, 999).map((m) => ({ name: m.props.name, level: Number(m.props.level ?? 0), unlocked: Number(m.props.level ?? 0) <= lv })),
        sectName: sk.props.sect ? this.db.sect[sk.props.sect]?.props.name : '',
      };
    }).filter(Boolean);
    // 师父在场：可学的本门武学、晋阶
    const masterSect = this.sectOfMaster();
    let master = null;
    if (masterSect && p.sect?.id === masterSect) {
      const sect = this.db.sect[masterSect];
      const ranks = sectRanks(sect);
      master = {
        sect: sect.props.name,
        learnable: Object.values(this.db.skill).filter((s) => s.props.sect === masterSect).map((s) => {
          const r = Number(s.props.rank ?? 0);
          return {
            id: s.id, name: s.props.name, kind: s.props.kind, stance: s.props.stance ?? '',
            learned: p.skills[s.id] !== undefined, rankOk: r <= p.sect.rank, rankName: ranks[r]?.name ?? '',
          };
        }),
        next: ranks[p.sect.rank + 1] ?? null,
        rep: p.sect.rep,
      };
    }
    return {
      skills, potential: p.potential, canTrain, master,
      outerCount: lo.outer.length, maxOuter: MAX_OUTER,
      inSect: !!p.sect,
    };
  },

  talentView() {
    const p = this.state.player;
    const total = talentPointsTotal(p);
    const spent = talentPointsSpent(p);
    return {
      xiuwei: xiuwei(p), total, free: total - spent, toNext: xiuweiToNext(p),
      branches: TALENT_TREE.map((b) => ({
        id: b.id, name: b.name, stance: b.stance,
        nodes: b.nodes.map((n) => ({ id: n.id, name: n.name, desc: n.desc, max: n.max, lv: tal(p, n.id), why: canAddTalent(p, n.id) })),
      })),
    };
  },

  inventoryView() {
    const p = this.state.player;
    return {
      items: Object.entries(p.inventory).map(([id, n]) => {
        const it = this.db.item[id];
        const hasUse = Object.values(this.db.use ?? {}).some((u) => u.props.item === id) || !!it?.props.verb || !!it?.props.usefail;
        return { id, name: it?.props.name ?? id, count: n, desc: it?.lines.map((l) => this.fmt(l.text)).join('') ?? '', verb: it?.props.verb ?? '使用', usable: hasUse };
      }),
      cargo: Object.entries(p.cargo ?? {}).map(([id, n]) => ({ id, name: this.db.goods[id]?.props.name ?? id, count: n })),
      cargoUnits: cargoUnits(p.cargo), cargoCap: CARGO_CAP,
    };
  },

  /** 任务清单：flag 正设着的 quest 块 */
  questsView() {
    return Object.values(this.db.quest ?? {})
      .filter((q) => this.state.flags[q.props.flag])
      .map((q) => ({
        id: q.id, name: this.fmt(q.props.name), desc: q.lines.map((l) => this.fmt(l.text)).join(''),
        where: this.db.room[q.props.where]?.props.name ?? q.props.where ?? '',
      }));
  },

  /** 主线进度：每条主线的章节状态与当前目标 */
  storyView() {
    return Object.values(this.db.storyline).map((line) => {
      const started = !!this.state.flags[`${line.id}.started`];
      const chapters = Object.values(this.db.chapter).filter((c) => c.props.storyline === line.id);
      let current = false;
      const chs = chapters.map((c) => {
        const done = !!c.props.done && this.check(words(c.props.done));
        let state = done ? 'done' : 'locked';
        if (!done && started && !current) { state = 'current'; current = true; }
        return { name: c.props.name, state };
      });
      const goal = Object.values(this.db.goal ?? {}).find((g) => g.props.storyline === line.id && this.check(words(g.props.if)));
      return {
        id: line.id, name: line.props.name, started, level: line.props.level ?? '',
        brief: line.lines.map((l) => this.fmt(l.text)).join(''),
        hint: line.props.hint ?? '', chapters: chs,
        goal: goal ? goal.lines.map((l) => this.fmt(l.text)).join('') : '',
        loaded: chapters.length > 0,
      };
    });
  },

  /** 市集面板 */
  marketView() {
    if (this.room()?.props.market !== 'true') return null;
    const p = this.state.player;
    return {
      city: this.db.city[this.cityHere()]?.props.name ?? '', day: this.state.day ?? 1,
      goods: this.marketList().map((g) => ({ ...g, have: p.cargo?.[g.id] ?? 0 })),
      money: p.money ?? 0, cargoUnits: cargoUnits(p.cargo), cargoCap: CARGO_CAP,
    };
  },

  bankView() {
    if (this.room()?.props.bank !== 'true') return null;
    const p = this.state.player;
    return { money: p.money ?? 0, bank: p.bank ?? 0 };
  },
};

