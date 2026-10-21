// 面板：人物（状态 / 武功 / 天赋 / 背包）、江湖（主线 / 差事 / 百科）、市集、钱庄（D-045）。
// 原则：命令能做的事，面板上都有按钮；按钮只是替玩家发送命令，执行结果显示在面板底部，也照常进入正文。

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

function button(label, onClick, opts = {}) {
  const b = el('button', opts.cls ?? '', label);
  if (opts.disabled) b.disabled = true;
  if (opts.title) b.title = opts.title;
  b.addEventListener('click', onClick);
  return b;
}

function bar(value, max, cls) {
  const b = el('div', 'bar ' + cls);
  const i = el('i');
  i.style.width = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100)) + '%';
  b.append(i);
  return b;
}

const row = (...children) => { const r = el('div', 'pn-row'); r.append(...children); return r; };
const kv = (k, v) => { const d = el('div', 'pn-kv'); d.append(el('span', 'pn-k', k), el('span', 'pn-v', v)); return d; };

/** 先天属性的作用（D-092）：电脑上悬停显示，手机上点一下展开 */
const ATTR_INFO = {
  根骨: (x) => `气血上限 +${x * 5}、内力上限 +${x * 2}（每点根骨气血 +5、内力 +2）。`,
  身法: (x) => `出手先后：同一阶段（先巧招、后刚招）里身法高的先出手。装备轻功每 4 级再 +1。`,
  悟性: (x) => `修炼武功花的潜能 ×${(20 / x).toFixed(2).replace(/\.?0+$/, '')}（悟性越高越省）；对手出虚招、藏招时，每回合有 ${x * 2}% 的机会看穿（天赋"慧眼"每级再 +10%）。`,
};
function attrRow(attrs) {
  const d = el('div', 'pn-kv');
  const vals = el('span', 'pn-v');
  const info = el('div', 'pn-skill-info');
  info.hidden = true;
  Object.entries(ATTR_INFO).forEach(([k, f], i) => {
    const a = el('span', 'pn-has-info', `${k} ${attrs[k]}`);
    a.title = f(attrs[k]);
    a.addEventListener('click', () => { info.replaceChildren(el('p', '', `${k}：${f(attrs[k])}`)); info.hidden = false; });
    if (i) vals.append('　');
    vals.append(a);
  });
  d.append(el('span', 'pn-k', '先天'), vals);
  const box = el('div');
  box.append(d, info);
  return box;
}

/**
 * @param {{game: () => any, run: (cmd: string) => Promise<any[]>}} api
 *   run 返回本次命令产生的输出条目，用于在面板底部显示反馈
 */
export function initPanels(api) {
  const dlg = document.getElementById('panel');
  const title = document.getElementById('panel-title');
  const tabsBox = document.getElementById('panel-tabs');
  const body = document.getElementById('panel-body');
  const feedback = document.getElementById('panel-feedback');
  let current = null; // {kind, tab}
  let wikiSel = null; // 百科页选中的条目（D-111）

  document.getElementById('panel-close').addEventListener('click', () => dlg.close());

  /** 执行命令并在面板底部显示结果；开战等情况会关闭面板 */
  async function act(cmd) {
    const out = await api.run(cmd);
    const msgs = (out ?? []).filter((e) => ['err', 'sys', 'story'].includes(e.cls)).map((e) => e.text.replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1'));
    feedback.textContent = msgs.slice(-3).join('　');
    feedback.className = (out ?? []).some((e) => e.cls === 'err') ? 'err' : '';
    const ctx = api.game().context();
    if (ctx.inCombat || ctx.inDialog) { dlg.close(); return; }
    render();
  }

  const PANELS = {
    char: { title: '人物', tabs: ['状态', '武功', '天赋', '合击', '背包'], render: renderChar },
    journal: { title: '江湖', tabs: ['主线', '差事', '百科'], render: renderJournal },
    market: { title: '市集', tabs: [], render: renderMarket },
    shop: { title: '店铺', tabs: [], render: renderShop },
    bank: { title: '钱庄', tabs: [], render: renderBank },
  };

  function open(kind, tab) {
    const p = PANELS[kind];
    current = { kind, tab: tab ?? p.tabs[0] };
    feedback.textContent = '';
    render();
    if (!dlg.open) dlg.showModal();
  }

  function render() {
    if (!current) return;
    const p = PANELS[current.kind];
    title.textContent = p.title;
    tabsBox.replaceChildren(...p.tabs.map((t) => button(t, () => { current.tab = t; render(); }, { cls: 'pn-tab' + (t === current.tab ? ' on' : '') })));
    body.replaceChildren();
    p.render(current.tab);
  }

  // ---- 人物 ----

  function renderChar(tab) {
    const g = api.game();
    if (tab === '状态') {
      const v = g.charView();
      body.append(
        el('h3', 'pn-name', `${v.name}　${v.gender}`),
        row(el('span', 'pn-k', '气血'), bar(v.hp, v.maxHp, 'hp'), el('span', 'pn-v', `${v.hp}/${v.maxHp}`)),
        row(el('span', 'pn-k', '内力'), bar(v.mp, v.maxMp, 'mp'), el('span', 'pn-v', `${v.mp}/${v.maxMp}`)),
        attrRow(v.attrs),
        kv('兵器', v.weapon),
        kv('修为', `${v.xiuwei}（刚、巧、守三势最狠一招的攻击值之和，加气血上限的五分之一）`),
        kv('潜能', `${v.potential}（用于修炼武功）`),
        kv('钱财', `身上 ${v.money} 文　钱庄 ${v.bank} 文`),
      );
      if (v.sect) {
        body.append(kv('门派', `${v.sect.name}　${v.sect.rank}　声望 ${v.sect.rep}`));
        if (v.sect.next) body.append(row(el('span', 'pn-k', '晋阶'), bar(v.sect.rep, v.sect.next.rep, 'mp'), el('span', 'pn-v', `${v.sect.next.name} 需声望 ${v.sect.next.rep}`)));
        body.append(row(button('叛出师门', () => {
          if (confirm(`叛出${v.sect.name}后，已学的本门武功保留（最多练到现在阶位的上限），但再也学不到本门新功夫，也不能再回${v.sect.name}。确定吗？`)) act('叛出师门 确定');
        }, { cls: 'pn-danger' })));
      } else {
        body.append(kv('门派', '无（江湖散人）。去各地门派拜师学艺。'));
      }
      if (v.formerSects.length) body.append(kv('曾叛出', v.formerSects.join('、')));
      return;
    }

    if (tab === '武功') {
      const v = g.skillsView();
      body.append(el('p', 'pn-hint', `潜能 ${v.potential}　外功栏 ${v.outerCount}/${v.maxOuter}　` +
        (v.canTrain ? '这里可以修炼。' : '修炼要去旅店或本门驻地。') + '　战斗中用哪门武功，哪门就长经验。'));
      for (const kind of ['外功', '内功', '轻功']) {
        const list = v.skills.filter((s) => s.kind === kind);
        if (!list.length) continue;
        body.append(el('h4', 'pn-sub', kind));
        for (const s of list) {
          const r = el('div', 'pn-skill' + (s.equipped ? ' on' : ''));
          const head = el('div', 'pn-skill-head');
          // 武功说明（D-092）：电脑上悬停武功名就显示；手机没有悬停，点一下展开、再点收起
          const nameEl = el('span', 'pn-skill-name pn-has-info', s.name);
          nameEl.title = s.info.tip;
          const info = el('div', 'pn-skill-info');
          info.hidden = true;
          for (const line of s.info.effect) info.append(el('p', '', line));
          if (s.info.desc) info.append(el('p', 'pn-skill-desc', s.info.desc));
          nameEl.addEventListener('click', () => { info.hidden = !info.hidden; });
          head.append(
            el('span', `pn-stance st-${s.stance || '无'}`, s.stance || kind[0]),
            nameEl,
            el('span', 'pn-v', `${s.lv} / ${s.cap} 级`),
          );
          const btns = el('span', 'pn-btns');
          btns.append(s.equipped
            ? button('卸下', () => act(`卸下 ${s.id}`), { disabled: kind !== '外功' && false })
            : button('装备', () => act(`装备 ${s.id}`), { disabled: kind === '外功' && v.outerCount >= v.maxOuter, title: kind === '外功' && v.outerCount >= v.maxOuter ? '外功栏已满，先卸下一门' : '' }));
          btns.append(button(`修炼（${s.trainCost} 潜能）`, () => act(`修炼 ${s.id}`), {
            disabled: !s.canTrain || v.potential < s.trainCost,
            title: !v.canTrain ? '要在旅店或本门驻地修炼' : s.lv >= s.cap ? '已到上限' : v.potential < s.trainCost ? '潜能不足' : '',
          }));
          head.append(btns);
          r.append(head, info);
          if (s.lv < s.cap) r.append(row(el('span', 'pn-k', '经验'), bar(s.exp, s.need, 'mp'), el('span', 'pn-v', `${s.exp}/${s.need}`)));
          if (s.moves.length) {
            // 每个招式悬停显示威力、内力、估算伤害、效果（D-053）
            const mv = el('div', 'pn-moves');
            s.moves.forEach((m, i) => {
              const span = el('span', 'pn-move' + (m.unlocked ? '' : ' locked'), m.unlocked ? `${m.name}（约${m.est}）` : `${m.name}（${m.level}级）`);
              span.title = m.tip;
              if (i) mv.append('　');
              mv.append(span);
            });
            r.append(mv);
          }
          body.append(r);
        }
      }
      if (v.master) {
        body.append(el('h4', 'pn-sub', `${v.master.sect}师父传授`));
        for (const l of v.master.learnable) {
          const state = l.learned ? '已学' : l.rankOk ? '' : `需${l.rankName}`;
          body.append(row(
            el('span', `pn-stance st-${l.stance || '无'}`, l.stance || l.kind[0]),
            el('span', 'pn-skill-name', l.name),
            el('span', 'pn-v', state),
            button('学', () => act(`学 ${l.id}`), { disabled: l.learned || !l.rankOk }),
          ));
        }
        if (v.master.next) {
          body.append(row(
            el('span', 'pn-k', '晋阶'), bar(v.master.rep, v.master.next.rep, 'mp'),
            el('span', 'pn-v', `${v.master.next.name}：声望 ${v.master.rep}/${v.master.next.rep}`),
            button('申请晋阶（考核）', () => act('晋阶'), { disabled: v.master.rep < v.master.next.rep }),
          ));
        }
      }
      return;
    }

    if (tab === '天赋') {
      const v = g.talentView();
      body.append(row(
        el('span', 'pn-hint', `天赋点 ${v.free} / ${v.total}（门派阶位 ${v.rank} 点，主线 ${v.lines} 点）　门派每晋升一阶得 1 点；每条主线走到三成、七成左右和完结时各得 1 点`),
        button('重置天赋', () => { if (confirm('退回全部天赋点？（免费）')) act('天赋 重置'); }),
      ));
      const tree = el('div', 'pn-tree');
      for (const br of v.branches) {
        const col = el('div', `pn-branch br-${br.id}`);
        col.append(el('h4', 'pn-sub', br.name), el('p', 'pn-hint', br.desc));
        for (const n of br.nodes) {
          const b = button('', () => act(`天赋 加 ${n.id}`), { cls: 'pn-node' + (n.lv ? ' on' : ''), disabled: !!n.why, title: n.why ?? '点击加一级' });
          b.append(el('span', 'pn-node-name', `${n.name}　${n.lv}/${n.max}`), el('span', 'pn-node-desc', n.desc));
          col.append(b);
        }
        tree.append(col);
      }
      body.append(tree);
      return;
    }

    if (tab === '合击') {
      // 双人合击（D-065）：组队时两人同一回合各出一招触发
      body.append(el('p', 'pn-hint', '组队时，两人同一回合用下面这些武功出招就会触发合击。"合击"要打同一个对手；"护攻"是甲用守招护住乙（守招目标选乙），乙出手。对手的克制对合击不起作用。'));
      // 效果标签的图例（手机上没有悬停，直接写出来）
      body.append(el('p', 'pn-hint', '效果：破绽＝对手下一次受伤 +30%；点穴＝对手下一回合动弹不得；内伤＝之后 3 回合每回合掉血；化内＝化去对手内力。'));
      for (const c of g.comboView()) {
        const box = el('div', 'pn-item' + (c.mine ? '' : ' faded'));
        const sideText = (x, who) => `${who}：${x.sect ? x.sect + '·' : ''}${x.name} ${x.lv} 级${x.have ? (x.have >= x.lv ? '（你已达到）' : `（你 ${x.have} 级）`) : ''}`;
        // 效果标签悬停显示说明（D-098）
        const info = el('span', 'pn-v', `${c.guard ? '护攻' : '合击'}　额外伤害 ×${(c.bonus - 1).toFixed(1)}`);
        for (const t of c.effectTips) { const tag = el('span', 'pn-tag pn-has-info', t.tag); tag.title = t.tip; info.append('　', tag); }
        box.append(row(el('span', 'pn-skill-name', `${c.name}`), info));
        box.append(el('div', 'pn-moves', `${sideText(c.a, c.guard ? '甲（守招护住乙）' : '甲')}　｜　${sideText(c.b, '乙')}`));
        box.append(el('div', 'pn-moves', c.desc));
        body.append(box);
      }
      return;
    }

    if (tab === '背包') {
      const v = g.inventoryView();
      body.append(kv('钱', `身上 ${v.money} 文${v.bank ? `　钱庄 ${v.bank} 文` : ''}`));
      body.append(el('h4', 'pn-sub', '随身物品'));
      if (!v.items.length) body.append(el('p', 'pn-hint', '身上空空如也。'));
      for (const it of v.items) {
        const r = el('div', 'pn-item' + (it.equipped ? ' on' : ''));
        if (it.weapon) {
          // 兵器：装备 / 卸下（D-057）
          r.append(row(
            el('span', 'pn-skill-name', `${it.name}${it.equipped ? '（手中）' : ''}`),
            el('span', 'pn-v', `${it.wtype}${it.bonus ? `　${it.wtype}类招式伤害 +${it.bonus}%` : ''}`),
            it.equipped ? button('卸下', () => act(`卸下 ${it.id}`)) : button('装备', () => act(`装备 ${it.id}`)),
          ));
        } else {
          r.append(row(el('span', 'pn-skill-name', `${it.name}×${it.count}`), button(it.verb, () => act(`${['吃', '喝'].includes(it.verb) ? it.verb : 'use'} ${it.id}`), { disabled: !it.usable, title: it.usable ? '' : '这件东西暂时用不上' })));
        }
        r.append(el('div', 'pn-moves', it.desc));
        body.append(r);
      }
      body.append(el('h4', 'pn-sub', `马车货物（${v.cargoUnits}/${v.cargoCap} 件）`));
      body.append(el('p', 'pn-hint', v.cargo.length ? v.cargo.map((c) => `${c.name}×${c.count}`).join('　') : '马车上空空的。去市集买货，运到别的城市卖。'));
    }
  }

  // ---- 江湖 ----

  function renderJournal(tab) {
    const g = api.game();
    if (tab === '主线') {
      for (const s of g.storyView()) {
        const box = el('div', 'pn-story');
        box.append(el('h3', 'pn-name', `${s.name}${s.xiuwei ? `（建议修为 ${s.xiuwei}）` : ''}`));
        if (!s.started && s.lock) {
          // 三部曲：前一部没走完（D-141）
          box.append(el('p', 'pn-hint', `尚未开启：须先走完《${s.lock}》`));
        } else if (!s.started) {
          // 尚未开始：只显示四个字，怎么开始放在提示里（D-082）
          const head = el('p', 'pn-hint', '尚未开始');
          box.append(head);
          if (s.hint) {
            const tip = el('p', 'pn-hint pn-goal-hint', s.hint);
            tip.hidden = true;
            const btn = button('提示', () => { tip.hidden = !tip.hidden; btn.textContent = tip.hidden ? '提示' : '收起提示'; }, { cls: 'pn-tip' });
            head.append(btn);
            box.append(tip);
          }
        } else {
          box.append(el('p', 'pn-moves', s.brief));
          const list = el('ol', 'pn-chapters');
          // 只列已完成和进行中的章节，后面没解锁的不显示（D-136）
          for (const c of s.chapters.filter((x) => x.state !== 'locked')) {
            const li = el('li', `ch-${c.state}`, c.name);
            if (c.state === 'done') li.append(el('span', 'pn-v', '　已完成'));
            if (c.state === 'current') li.append(el('span', 'pn-v', '　进行中'));
            list.append(li);
          }
          box.append(list);
          if (s.goal) {
            // 目标只显示做什么；点"提示"才显示具体怎么做（D-074）
            const goal = el('span', 'pn-goal', s.goal);
            box.append(row(el('span', 'pn-k', '当前目标'), goal));
            if (s.goalHint) {
              const tip = el('p', 'pn-hint pn-goal-hint', s.goalHint);
              tip.hidden = true;
              const btn = button('提示', () => { tip.hidden = !tip.hidden; btn.textContent = tip.hidden ? '提示' : '收起提示'; }, { cls: 'pn-tip' });
              goal.append(btn);
              box.append(tip);
            }
          }
        }
        body.append(box);
      }
      return;
    }
    if (tab === '差事') {
      const qs = g.questsView();
      if (!qs.length) body.append(el('p', 'pn-hint', '眼下没有在办的差事。可以去各城衙门、本门师父那里领。'));
      for (const q of qs) {
        const box = el('div', 'pn-item');
        box.append(el('div', 'pn-skill-name', q.name), el('div', 'pn-moves', q.desc));
        if (q.where) box.append(kv('地点', q.where));
        body.append(box);
      }
      return;
    }
    if (tab === '百科') renderWiki(g);
  }

  /** 百科「战斗规则」页（D-112、D-113）：每种效果一段说明，悬停"举例"看哪些门派招式带它 */
  function renderEffects(g) {
    for (const grp of g.effectsView()) {
      body.append(el('h4', 'pn-sub', grp.group), el('p', 'pn-hint', grp.note));
      for (const it of grp.items) {
        const box = el('div', 'pn-item');
        const h = el('div', 'pn-skill-head');
        h.append(el('span', 'pn-skill-name', it.name));
        if (it.examples.length) {
          const ex = el('span', 'pn-v pn-has-info', `门派招式里有 ${it.examples.length} 招带这个效果`);
          ex.title = it.examples.join('、');
          const list = el('div', 'pn-moves', it.examples.join('、'));
          list.hidden = true;
          ex.addEventListener('click', () => { list.hidden = !list.hidden; });
          h.append(ex);
          box.append(h, el('p', 'pn-wiki-p', it.text), list);
        } else {
          box.append(h, el('p', 'pn-wiki-p', it.text));
        }
        body.append(box);
      }
    }
  }

  /** 江湖百科（D-111）：门派介绍 + 能学到的全部武学；悬停武功名、招式名看详细数据，手机上点武功名展开 */
  function renderWiki(g) {
    const all = g.wikiView();
    if (!all.length) return;
    const w = wikiSel === 'effects' ? null : all.find((x) => x.id === wikiSel) ?? all.find((x) => x.mine) ?? all[0];
    wikiSel = w?.id ?? 'effects';
    body.append(row(
      ...all.map((x) => button(x.name, () => { wikiSel = x.id; render(); }, { cls: 'pn-tab pn-wiki-tab' + (x.id === wikiSel ? ' on' : '') })),
      button('战斗规则', () => { wikiSel = 'effects'; render(); }, { cls: 'pn-tab pn-wiki-tab' + (wikiSel === 'effects' ? ' on' : '') }),
    ));
    if (!w) { renderEffects(g); return; }

    const head = el('div', 'pn-story');
    head.append(el('h3', 'pn-name', `${w.name}${w.mine ? '　（本门）' : ''}`));
    if (w.seat) head.append(kv('驻地', w.seat));
    if (w.master) head.append(kv('师父', w.master));
    if (w.style) head.append(kv('侧重', w.style));
    if (w.quest) head.append(kv('绝学任务', w.quest));
    for (const sec of w.sections) {
      if (sec.title) head.append(el('h4', 'pn-sub', sec.title));
      for (const p of sec.paras) head.append(el('p', 'pn-wiki-p', p));
    }
    body.append(head);

    if (w.ranks.length) {
      body.append(el('h4', 'pn-sub', '阶位'));
      const t = el('table', 'pn-table');
      t.append(Object.assign(el('tr'), { innerHTML: '<th>阶位</th><th>所需声望</th><th>本门武功上限</th>' }));
      w.ranks.forEach((r, i) => {
        const tr = el('tr', i === w.myRank ? 'pn-wiki-me' : '');
        tr.append(el('td', '', r.name + (i === w.myRank ? '（你）' : '')), el('td', '', r.rep), el('td', '', `${r.cap} 级`));
        t.append(tr);
      });
      body.append(t);
    }

    body.append(el('h4', 'pn-sub', '武学'), el('p', 'pn-hint', '鼠标悬停武功名、招式名查看详细数据；手机上点武功名展开说明。'));
    // 按来源分组：各阶位，绝学任务单独一组
    const groups = new Map();
    for (const sk of w.skills) {
      const key = sk.secret ? `门派绝学（${sk.rankName}起请缨）` : sk.rankName ? `${sk.rankName}可学` : '武馆';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(sk);
    }
    for (const [key, list] of groups) {
      body.append(el('h4', 'pn-sub pn-wiki-group', key));
      for (const sk of list) {
        const r = el('div', 'pn-skill' + (sk.learned ? ' on' : ''));
        const h = el('div', 'pn-skill-head');
        const nameEl = el('span', 'pn-skill-name pn-has-info', sk.name);
        nameEl.title = sk.tip;
        const info = el('div', 'pn-skill-info');
        info.hidden = true;
        for (const line of sk.lines) info.append(el('p', '', line));
        if (sk.desc) info.append(el('p', 'pn-skill-desc', sk.desc));
        nameEl.addEventListener('click', () => { info.hidden = !info.hidden; });
        h.append(
          el('span', `pn-stance st-${sk.stance ? sk.stance[0] : '无'}`, sk.stance || sk.kind[0]),
          nameEl,
          el('span', 'pn-v', `${sk.kind}${sk.weapon ? '·要有' + sk.weapon : ''}${sk.learned ? '　已学' : ''}`),
        );
        r.append(h, info);
        if (sk.moves.length) {
          const mv = el('div', 'pn-moves');
          sk.moves.forEach((m, i) => {
            const span = el('span', `pn-move pn-has-info st-${m.stance}`, `${m.name}（${m.stance}·${m.level}级）`);
            span.title = m.tip;
            if (i) mv.append('　');
            mv.append(span);
          });
          r.append(mv);
        } else if (sk.desc) {
          r.append(el('div', 'pn-moves', sk.desc));
        }
        body.append(r);
      }
    }
  }

  // ---- 市集 ----

  function renderMarket() {
    const v = api.game().marketView();
    if (!v) { body.append(el('p', 'pn-hint', '这里不是市集。')); return; }
    body.append(el('p', 'pn-hint', `${v.city}市集　今日行情　身上 ${v.money} 文　马车 ${v.cargoUnits}/${v.cargoCap} 件`));
    const t = el('table', 'pn-table');
    t.append(Object.assign(el('tr'), { innerHTML: '<th>货物</th><th>买入</th><th>存货</th><th>卖出</th><th>车上</th><th></th>' }));
    for (const gd of v.goods) {
      const tr = el('tr');
      const ops = el('td', 'pn-btns');
      // 存货（D-123）：特产多、外地货零星几件，卖光了今天就买不到；任何货都能卖（D-076）
      const noBuy = !gd.stock;
      ops.append(
        button('买1', () => act(`买 ${gd.id} 1`), { disabled: noBuy || v.money < gd.buy || v.cargoUnits >= v.cargoCap }),
        button('买10', () => act(`买 ${gd.id} 10`), { disabled: noBuy || gd.stock < 10 || v.money < gd.buy * 10 || v.cargoUnits + 10 > v.cargoCap }),
        button('买满', () => act(`买 ${gd.id} 全部`), { disabled: noBuy || v.money < gd.buy || v.cargoUnits >= v.cargoCap }),
        button('卖1', () => act(`卖 ${gd.id} 1`), { disabled: !gd.have }),
        button('全卖', () => act(`卖 ${gd.id} 全部`), { disabled: !gd.have }),
      );
      tr.append(el('td', '', gd.local ? `${gd.name}（特产）` : gd.name), el('td', noBuy ? 'pn-dim' : '', noBuy ? '无货' : gd.buy), el('td', noBuy ? 'pn-dim' : '', gd.stock || ''), el('td', '', gd.sell), el('td', '', gd.have || ''), ops);
      t.append(tr);
    }
    body.append(t);
  }

  // ---- 店铺：客栈卖吃喝（D-133）----

  function renderShop() {
    const g = api.game();
    const list = g.shopList();
    if (!list.length) { body.append(el('p', 'pn-hint', '这里没有店铺。')); return; }
    const money = g.state.player.money ?? 0;
    body.append(el('p', 'pn-hint', `身上 ${money} 文　食物回气血，酒回内力。气血、内力打完不会自己回满，打斗中也腾不出手吃喝，开打前要补足。越贵的，一文钱回得越多。`));
    const t = el('table', 'pn-table');
    t.append(Object.assign(el('tr'), { innerHTML: '<th>名字</th><th>价钱</th><th>效果</th><th>身上</th><th></th>' }));
    for (const f of list) {
      const tr = el('tr');
      const ops = el('td', 'pn-btns');
      ops.append(
        button('买1', () => act(`买 ${f.id} 1`), { disabled: money < f.price }),
        button('买5', () => act(`买 ${f.id} 5`), { disabled: money < f.price * 5 }),
        button('买10', () => act(`买 ${f.id} 10`), { disabled: money < f.price * 10 }),
      );
      tr.append(el('td', '', f.name), el('td', '', `${f.price} 文`), el('td', '', f.hp ? `气血 +${f.hp}` : `内力 +${f.mp}`), el('td', '', f.have || ''), ops);
      t.append(tr);
    }
    body.append(t);
  }

  // ---- 钱庄 ----

  function renderBank() {
    const v = api.game().bankView();
    if (!v) { body.append(el('p', 'pn-hint', '这里没有钱庄。')); return; }
    body.append(kv('身上', `${v.money} 文`), kv('存款', `${v.bank} 文（各地通兑，没有利息，不会被劫）`));
    const input = el('input', 'pn-input');
    input.type = 'number';
    input.min = '1';
    input.placeholder = '数额';
    const amount = () => Math.floor(Number(input.value));
    body.append(row(
      input,
      button('存入', () => amount() > 0 && act(`存 ${amount()}`)),
      button('取出', () => amount() > 0 && act(`取 ${amount()}`)),
      button('全部存入', () => act('存 全部'), { disabled: !v.money }),
      button('全部取出', () => act('取 全部'), { disabled: !v.bank }),
    ));
  }

  return {
    open,
    // close 事件是异步的，不在里面清空 current（否则关掉一个面板马上打开另一个会出错）；只在打开时刷新
    refresh: () => { if (dlg.open) render(); },
    isOpen: () => dlg.open,
  };
}
