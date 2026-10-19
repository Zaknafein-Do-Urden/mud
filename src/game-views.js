// 引擎给界面面板用的只读数据（D-045）。面板上的按钮一律通过发送命令来操作，
// 这样界面和命令行永远等价，联机时客人也只需要发命令。

import { maxMp, skillCap, trainCost, sectRanks, expNeed, MAX_OUTER, movesOf, innerOf, innerBonus, isWeaponItem, weaponOf } from './character.js';
import { parseList } from './content.js';
import { TALENT_TREE, talentPointsSpent, canAddTalent, tal } from './talents.js';
import { xiuwei } from './combat.js';
import { cargoUnits, CARGO_CAP } from './economy.js';

const words = (s = '') => s.split(/[\s,]+/).filter(Boolean);

// 招式附加效果的说明（COMBAT.md §11）
const EFFECT_TEXT = {
  内伤: '内伤：之后 3 回合每回合扣血',
  点穴: '点穴：对手下一回合动弹不得；打守招不触发，对手内功越深越难点住（战斗中选中敌人后，卡片上显示概率）',
  破绽: '破绽：对手下一次受到的伤害 +30%',
  吸内: '吸内：化去对手内力，自己回复一半',
  化内: '化内：化去对手内力',
  缴械: '缴械：有一定几率打飞对手的兵器（守招在化解巧招时触发）',
  群攻: '群攻：打到所有对手，对手多于一个时每人受六成伤害',
  疗伤: '疗伤：目标回复气血',
  回气: '回气：目标回复内力',
  振奋: '振奋：目标下一次出招伤害 ×1.3',
  护体: '护体：目标两回合内受到的伤害 ×0.7',
  解穴: '解穴：解除目标的点穴和内伤',
};

// 百科「战斗规则」页的详细说明（D-112、D-113）。数值与 combat.js 一致，改战斗规则时一起改。
const EFFECT_DETAIL = [
  { group: '出招与结算', note: '每回合所有人同时出招，结算顺序固定。', items: [
    ['克制', '刚克守（×1.5，破防），巧克刚（×1.5），守克巧（巧招只剩 ×0.5，出巧招的人还要挨守方反震）。反过来被克是 ×0.5，同势 ×1.0；对调息、换兵器的人（无势）是 ×1.2。'],
    ['结算顺序', '先调息、换兵器，再摆守势，然后所有巧招按身法从快到慢出手，最后才是刚招。出手前就被打倒的人，这回合的招发不出来，所以巧招有机会抢先把出刚招的人打倒。'],
    ['没有反击', '每一次攻击都单独结算：你打敌人、敌人打你，两下都算，伤害各按对方的架势计算。唯一的"回敬"是守化解巧招时的反震。'],
  ] },
  { group: '组队：护法与目标', note: '和同伴、联机队友一起打的时候。', items: [
    ['护法', '守招的目标选一位队友：本回合所有打向他的招都改打在你身上，并按你的守势结算。几个敌人一起打他，就全落到你身上。敌人出巧招会被你化解、反震；出刚招你要吃 1.5 倍伤害，护不护要看预兆。直接打你的招照常按守算。'],
    ['护法的例外', '群攻挡不住：你挡下主目标，被护的队友照样挨六成波及。两人同时护同一个人，只有后出招的那个算数。'],
    ['敌人的目标', '敌人挑谁打不是定死的，而是偏向上回合伤它最重的人（仇恨）；越狡猾的敌人，越爱盯着气血少的人补刀。想替队友扛，就先狠狠打它。'],
    ['看出目标', '预兆后面会写"看样子是冲着某某来的"，战斗面板对手一栏标"→ 某某"。但目标也是预兆的一部分：虚招可能摆出假目标，露出守势就看不出打谁，藏招也看不出。天赋"料敌"能看穿真目标。'],
    ['同伴的目标', '剧情里的同伴回合开始就公开出什么招、打谁。他偏向你上回合打的敌人（方便凑合击），也偏向气血少的敌人。'],
  ] },
  { group: '攻招的附加效果', note: '只在这一招没被克制时生效；群攻时只作用在主目标身上。', items: [
    ['破绽', '对手露出破绽，下一次受到的伤害 +30%。最常见的附加效果，刚招、巧招都有。'],
    ['内伤', '之后 3 回合，对手每回合掉一次血，每次约为这一招伤害的两成（至少 3 点）。天赋"重创"能让内伤多发作两回合。'],
    ['点穴', '对手下一回合动弹不得，出不了招，算作无势，你出什么招都克他。打刚招、巧招、无势（调息、换兵器）的对手能触发，打守招不触发；对手正僵着的那一回合点不上，解开后的下一回合可以再点。能不能点住看内功深浅：50% + (你这门武功的等级 − 对手内功等级) × 0.5%，最低 10%、最高 90%，战斗中选中敌人后，招式卡片上显示对他的概率。天赋"封穴"能多点住一回合。'],
    ['缴械', '按招式写明的几率（如 缴械:30 就是三成）打飞对手的兵器，对手这一战只能改用拳脚。巧招打中时、守招化解巧招时都能触发；对手空手时没用。'],
    ['化内', '化去对手的内力，数量和这一招的伤害相当。内力耗尽的对手只能调息，调息时受伤 ×1.2。'],
    ['吸内', '同化内，另外把化掉的一半补进自己的内力。'],
    ['群攻', '一招打到所有对手；对手不止一个时，每人受六成伤害。'],
  ] },
  { group: '辅助招式的效果', note: '辅助招式是守招，不伤人，作用在你选的队友身上（单人时作用在自己身上），在守的阶段先于所有攻击生效。', items: [
    ['疗伤', '目标回复气血，多少按招式威力、武功等级、内功加成计算。天赋"妙手"每级再 +20%。'],
    ['回气', '目标回复内力，算法同疗伤。'],
    ['振奋', '目标下一次出招伤害 ×1.3。'],
    ['护体', '目标在两回合内受到的伤害 ×0.7。'],
    ['解穴', '解除目标身上的点穴和内伤。'],
  ] },
];


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
      xiuwei: xiuwei(this.db, p),
      sect: sect ? {
        id: sect.id, name: sect.props.name, rank: ranks[p.sect.rank]?.name, rep: p.sect.rep,
        next: ranks[p.sect.rank + 1] ?? null,
      } : null,
      formerSects: (p.formerSects ?? []).map((id) => this.db.sect[id]?.props.name ?? id),
      weapon: (() => { const w = weaponOf(this.db, p); return w ? `${w.props.name}（${w.props.weapon}${Number(w.props.bonus) ? `，${w.props.weapon}类招式伤害 +${w.props.bonus}%` : ''}）` : '空手'; })(),
    };
  },

  /** 武功的势：招式各有其势时合起来写，如庄稼把式"刚巧守"（D-070） */
  stancesOf(sk) {
    const set = new Set(Object.values(this.db.move).filter((m) => m.props.skill === sk.id).map((m) => m.props.stance ?? sk.props.stance).filter(Boolean));
    return ['刚', '巧', '守'].filter((s) => set.has(s)).join('') || (sk.props.stance ?? '');
  },

  /**
   * 武功的效果说明与描述（D-092）：武功页悬停 / 点开武功名时显示。
   * 内功、轻功没有招式，以前在武功页上看不出它们有什么用。
   */
  skillInfo(sk, lv, cap) {
    const p = this.state.player;
    const num = (v, d) => (v === undefined || v === '' ? d : Number(v));
    const lines = [];
    if (sk.props.kind === '内功') {
      const hp = num(sk.props.hp, 6);
      const mp = num(sk.props.mp, 8);
      lines.push(`每升一级：气血上限 +${hp}、内力上限 +${mp}（永久；已学的内功都算，不用装备）。眼下这门共提供气血 +${hp * lv}、内力 +${mp * lv}。`);
      const aff = sk.props.affinity && sk.props.affinity !== '无' ? sk.props.affinity : '';
      lines.push(`装备为内功时：所有招式威力 +${lv}%${aff ? `，${aff}招再 +${(lv * 0.5).toFixed(1).replace(/\.0$/, '')}%` : ''}。`);
      lines.push(`内功越深，受到的伤害越少：眼下化去约 ${Math.round((1 - 100 / (100 + lv)) * 100)}%（按已装备内功的等级算）。`);
      if (Number(sk.props.absorb) > 0) lines.push(`装备时，每次没被克制的攻击都会吸取对手内力（伤害的 ${Math.round(Number(sk.props.absorb) * 100)}%）。`);
    } else if (sk.props.kind === '轻功') {
      lines.push(`装备为轻功时：身法 +${Math.floor(lv / 4)}（同一阶段先出手）；巧招威力 +${(lv * 0.3).toFixed(1).replace(/\.0$/, '')}%；调息、换兵器时受的伤害随等级减轻。`);
      const traits = parseList(sk.props.traits).map((t) => t.split('@'));
      if (traits.length) lines.push('特性：' + traits.map(([n, need]) => `${n}（${need || 1} 级${lv >= Number(need || 1) ? '，已领悟' : ''}）`).join('、'));
    } else {
      const stances = this.stancesOf(sk);
      const w = sk.props.weapon && sk.props.weapon !== '拳' ? sk.props.weapon : '';
      lines.push(`${stances}招${w ? `，要拿着${w}才能施展` : '，空手施展'}。招式的威力、估算伤害见下面每一招的说明。`);
    }
    const sect = sk.props.sect ? this.db.sect[sk.props.sect]?.props.name : '';
    lines.push(`上限 ${cap} 级${sect ? `（${sect}武学，随阶位提高；外功、轻功还不能超过内功最高等级 + 20）` : sk.id.startsWith('base.') ? '（武馆武功）' : '（剧情武学，随剧情提高）'}。`);
    const desc = sk.lines.map((l) => this.fmt(l.text)).join('');
    return { effect: lines, desc, tip: [...lines, '', desc].join('\n').trim() };
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
        id, name: sk.props.name, kind: sk.props.kind, stance: this.stancesOf(sk), lv, cap,
        exp: p.exp?.[id] ?? 0, need: expNeed(lv),
        equipped: lo.outer.includes(id) || lo.inner === id || lo.light === id,
        trainCost: trainCost(p, lv), canTrain: canTrain && lv < cap,
        moves: movesOf(this.db, id, 999).map((m) => this.moveTip(sk, m, lv)),
        info: this.skillInfo(sk, lv, cap),
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
        learnable: Object.values(this.db.skill).filter((s) => s.props.sect === masterSect && s.props.secret !== 'true').map((s) => {
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

  /**
   * 招式说明（D-053）：威力、内力、按当前等级估算的伤害、效果。
   * 估算对象是"没有内功护体、不克不被克"的普通对手，只用于比较招式强弱。
   */
  moveTip(sk, m, lv) {
    const p = this.state.player;
    const inner = innerOf(this.db, p);
    const stance = m.props.stance ?? sk.props.stance;
    const power = Number(m.props.power ?? 0);
    const need = sk.props.weapon && sk.props.weapon !== '拳' && sk.props.weapon !== '暗器' ? sk.props.weapon : '';
    const w = weaponOf(this.db, p);
    const wb = need && w?.props.weapon === need ? Number(w.props.bonus ?? 0) : 0;
    const est = Math.round(power * (1 + lv * 0.02) * innerBonus(inner.lv, inner.skill, stance) * (1 + wb / 100));
    const level = Number(m.props.level ?? 0);
    const effects = parseList(m.props.effects).map((e) => EFFECT_TEXT[e.split(':')[0]] ?? e);
    const lines = [`${m.props.name}（${stance}）　${level <= lv ? '已领悟' : `${level} 级领悟`}`, `威力 ${power}　耗内力 ${m.props.mp ?? 0}${need ? `　需要${need}` : ''}`];
    if (stance === '守') lines.push(`守势：化解巧招（对方伤害减半），并反震约 ${est} 点；被刚招破防时受伤 ×1.5`);
    else lines.push(`按你现在的等级，约造成 ${est} 点伤害；克制对手时约 ${Math.round(est * 1.5)}，被克制时约 ${Math.round(est * 0.5)}`);
    if (effects.length) lines.push('效果：' + effects.join('；'));
    if (need && w?.props.weapon !== need) lines.push(`（你现在没有拿${need}，施展不了这一招）`);
    return { name: m.props.name, level, unlocked: level <= lv, power, mp: Number(m.props.mp ?? 0), est, tip: lines.join('\n') };
  },

  /**
   * 江湖百科（D-111）：门派介绍和该门派可能学到的全部武学。
   * 说明文字不按玩家的等级估算（估算伤害在武功页看），只写武学本身的数据。
   */
  wikiView() {
    const p = this.state.player;
    const num = (v, d = 0) => (v === undefined || v === '' ? d : Number(v));
    return Object.values(this.db.wiki ?? {}).sort((a, b) => num(a.props.order, 99) - num(b.props.order, 99)).map((w) => {
      const sect = w.props.sect ? this.db.sect[w.props.sect] : null;
      const ranks = sect ? sectRanks(sect) : [];
      const caps = (sect?.props.caps ?? '').split(',').map(Number);
      // 正文：单独一行【标题】起一节，空行分段
      const sections = [];
      let para = [];
      const flush = () => { if (para.length) sections.at(-1)?.paras.push(para.join('')); para = []; };
      for (const l of w.lines) {
        const h = l.text.trim().match(/^【(.+)】$/);
        if (h) { flush(); sections.push({ title: h[1], paras: [] }); }
        else if (!l.text.trim()) flush();
        else { if (!sections.length) sections.push({ title: '', paras: [] }); para.push(this.fmt(l.text)); }
      }
      flush();
      const skills = Object.values(this.db.skill)
        .filter((sk) => (sect ? sk.props.sect === sect.id : sk.id.startsWith(w.props.prefix)))
        .map((sk) => this.wikiSkill(sk, ranks, caps, w))
        .sort((a, b) => a.rank - b.rank || ['内功', '外功', '轻功'].indexOf(a.kind) - ['内功', '外功', '轻功'].indexOf(b.kind));
      return {
        id: w.id, name: w.props.name ?? sect?.props.name ?? w.id,
        seat: w.props.seat ?? '', master: w.props.master ?? '', style: w.props.style ?? '',
        // 绝学任务只说怎么接，不说任务内容（不剧透，D-112）
        quest: sect ? `本门${ranks[3]?.name ?? '第四阶'}起可以向师父请缨，做完任务得本门绝学或神兵` : '',
        sections,
        ranks: ranks.map((r, i) => ({ name: r.name, rep: r.rep, cap: caps[i] ?? 0 })),
        mine: !!sect && p.sect?.id === sect.id, myRank: sect && p.sect?.id === sect.id ? p.sect.rank : -1,
        skills,
      };
    });
  },

  /** 百科「战斗规则」页（D-112、D-113）：结算、护法、目标的说明，各种招式效果的说明，以及门派武学里哪些招式带这个效果 */
  effectsView() {
    const users = {};
    for (const m of Object.values(this.db.move)) {
      const sk = this.db.skill[m.props.skill];
      if (!sk?.props.sect && !sk?.id.startsWith('base.')) continue; // 只举门派和武馆的武学，剧情武学不列（免得剧透）
      for (const e of parseList(m.props.effects)) (users[e.split(':')[0]] ??= []).push(`${sk.props.name}·${m.props.name}`);
    }
    return EFFECT_DETAIL.map((g) => ({ ...g, items: g.items.map(([name, text]) => ({ name, text, examples: users[name] ?? [] })) }));
  },

  /** 百科里一门武学的说明：来源、上限、每一招的数据 */
  wikiSkill(sk, ranks, caps, w) {
    const p = this.state.player;
    const num = (v, d) => (v === undefined || v === '' ? d : Number(v));
    const rank = num(sk.props.rank, 0);
    const secret = sk.props.secret === 'true';
    const kind = sk.props.kind;
    const stance = kind === '外功' ? this.stancesOf(sk) : '';
    const weapon = sk.props.weapon && sk.props.weapon !== '拳' ? sk.props.weapon : '';
    const source = secret ? `门派绝学：${ranks[rank]?.name ?? ''}向师父请缨，做完绝学任务才得`
      : ranks.length ? `${ranks[rank]?.name ?? ''}起可学，本门最高阶时上限 ${caps.at(-1) ?? ''} 级`
      : `武馆花钱学，上限 50 级`;
    const lines = [`${sk.props.name}　${kind}${stance ? '·' + stance : ''}${weapon ? `　要有${weapon}` : ''}`, source];
    if (kind === '内功') {
      lines.push(`每升一级：气血上限 +${num(sk.props.hp, 6)}、内力上限 +${num(sk.props.mp, 8)}。`);
      const aff = sk.props.affinity && sk.props.affinity !== '无' ? sk.props.affinity : '';
      lines.push(`装备时所有招式威力 +等级%${aff ? `，${aff}招再 +等级×0.5%` : ''}。`);
      if (num(sk.props.absorb, 0) > 0) lines.push(`装备时，没被克制的攻击会吸取对手内力（伤害的 ${Math.round(num(sk.props.absorb, 0) * 100)}%）。`);
    } else if (kind === '轻功') {
      lines.push('装备时：身法 +等级÷4；巧招威力 +等级×0.3%。');
      const traits = parseList(sk.props.traits).map((t) => t.split('@'));
      if (traits.length) lines.push('特性：' + traits.map(([n, need]) => `${n}（${need || 1} 级）`).join('、'));
    }
    const desc = sk.lines.map((l) => this.fmt(l.text)).join('');
    const moves = movesOf(this.db, sk.id, 999).map((m) => {
      const st = m.props.stance ?? sk.props.stance;
      const effects = parseList(m.props.effects).map((e) => EFFECT_TEXT[e.split(':')[0]] ?? e);
      const ml = [`${m.props.name}（${st}${m.props.support === 'true' ? '·辅助' : ''}）　${num(m.props.level, 0)} 级领悟`, `威力 ${num(m.props.power, 0)}　耗内力 ${num(m.props.mp, 0)}`];
      if (effects.length) ml.push('效果：' + effects.join('；'));
      return { name: m.props.name, stance: st, level: num(m.props.level, 0), tip: ml.join('\n') };
    });
    if (moves.length) lines.push(`招式：${moves.map((m) => `${m.name}（${m.stance}，${m.level} 级）`).join('、')}`);
    return {
      id: sk.id, name: sk.props.name, kind, stance, weapon, rank, rankName: ranks[rank]?.name ?? '', secret,
      learned: p.skills[sk.id] !== undefined, desc, moves,
      lines, tip: [...lines, '', desc].join('\n').trim(),
    };
  },

  /** 合击（D-065）：与自己武功有关的合击，以及双方的条件 */
  comboView() {
    const p = this.state.player;
    const side = (s) => { const [skill, lv] = (s ?? '').split('@').map((x) => x.trim()); return { skill, lv: Number(lv || 1) }; };
    const label = (x) => {
      const sk = this.db.skill[x.skill];
      const sect = sk?.props.sect ? this.db.sect[sk.props.sect]?.props.name : sk?.id.startsWith('base.') ? '武馆' : '';
      return { name: sk?.props.name ?? x.skill, lv: x.lv, sect, have: p.skills[x.skill] ?? 0, stance: sk?.props.stance ?? '' };
    };
    return Object.values(this.db.combo ?? {}).map((c) => {
      const [A, B] = [side(c.props.a), side(c.props.b)];
      const a = label(A);
      const b = label(B);
      const mine = a.have > 0 || b.have > 0;
      return {
        id: c.id, name: c.props.name, bonus: Number(c.props.bonus), effects: c.props.effects ?? '', a, b, mine,
        effectTips: parseList(c.props.effects).map((e) => ({ tag: e.split(':')[0], tip: EFFECT_TEXT[e.split(':')[0]] ?? e })),
        guard: a.stance === '守', desc: c.lines.map((l) => l.text).join('').replaceAll('$A', '甲').replaceAll('$B', '乙').replaceAll('$n', '对手'),
      };
    }).sort((x, y) => Number(y.mine) - Number(x.mine) || x.bonus - y.bonus);
  },

  talentView() {
    const p = this.state.player;
    const { rank, lines, total } = this.talentPoints();
    const spent = talentPointsSpent(p);
    return {
      total, free: total - spent, rank, lines,
      branches: TALENT_TREE.map((b) => ({
        id: b.id, name: b.name, desc: b.desc,
        nodes: b.nodes.map((n) => ({ id: n.id, name: n.name, desc: n.desc, max: n.max, lv: tal(p, n.id), why: canAddTalent(p, n.id, total) })),
      })),
    };
  },

  inventoryView() {
    const p = this.state.player;
    return {
      items: Object.entries(p.inventory).map(([id, n]) => {
        const it = this.db.item[id];
        const hasUse = Object.values(this.db.use ?? {}).some((u) => u.props.item === id) || !!it?.props.verb || !!it?.props.usefail;
        const weapon = isWeaponItem(this.db, id);
        return {
          id, name: it?.props.name ?? id, count: n, desc: it?.lines.map((l) => this.fmt(l.text)).join('') ?? '', verb: it?.props.verb ?? '使用', usable: hasUse,
          weapon, wtype: it?.props.weapon ?? '', bonus: Number(it?.props.bonus ?? 0), equipped: weapon && p.equip?.weapon === id,
        };
      }),
      cargo: Object.entries(p.cargo ?? {}).map(([id, n]) => ({ id, name: this.db.goods[id]?.props.name ?? id, count: n })),
      cargoUnits: cargoUnits(p.cargo), cargoCap: CARGO_CAP,
      money: p.money ?? 0, bank: p.bank ?? 0,
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
      // 当前目标：主线开始后的 goal；开始前的提示用 pre: true 的 goal，按阶段挑一条（D-097），没有就用 storyline 的 hint
      const goals = Object.values(this.db.goal ?? {}).filter((g) => g.props.storyline === line.id && this.check(words(g.props.if)));
      const goal = goals.find((g) => g.props.pre !== 'true');
      const pre = goals.find((g) => g.props.pre === 'true');
      return {
        id: line.id, name: line.props.name, started, xiuwei: (line.props.xiuwei ?? '').replace('-', '~'),
        brief: line.lines.map((l) => this.fmt(l.text)).join(''),
        hint: pre ? pre.lines.map((l) => this.fmt(l.text)).join('') : line.props.hint ?? '', chapters: chs,
        // 目标只显示做什么（name），具体怎么做放在提示里，玩家点"提示"才看（D-074）
        goal: goal ? goal.props.name ?? goal.lines.map((l) => this.fmt(l.text)).join('') : '',
        goalHint: goal?.props.name ? goal.lines.map((l) => this.fmt(l.text)).join('') : '',
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

