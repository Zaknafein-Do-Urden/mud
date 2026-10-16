// 面板：人物（状态 / 武功 / 天赋 / 背包）、江湖（主线 / 任务）、市集、钱庄（D-045）。
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
    journal: { title: '江湖', tabs: ['主线', '任务'], render: renderJournal },
    market: { title: '市集', tabs: [], render: renderMarket },
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
        kv('内力上限', `${v.mp}（每场战斗开始时回满）`),
        kv('先天', `根骨 ${v.attrs.根骨}　身法 ${v.attrs.身法}　悟性 ${v.attrs.悟性}`),
        kv('兵器', v.weapon),
        kv('修为', `${v.xiuwei}（所有武功等级之和）`),
        kv('潜能', `${v.potential}（用于修炼武功）`),
        kv('钱财', `身上 ${v.money} 文　钱庄 ${v.bank} 文`),
        kv('日子', `第 ${v.day} 日`),
      );
      if (v.sect) {
        body.append(kv('门派', `${v.sect.name}　${v.sect.rank}　声望 ${v.sect.rep}`));
        if (v.sect.next) body.append(row(el('span', 'pn-k', '晋阶'), bar(v.sect.rep, v.sect.next.rep, 'mp'), el('span', 'pn-v', `${v.sect.next.name} 需声望 ${v.sect.next.rep}`)));
        body.append(row(button('叛出师门', () => {
          if (confirm(`叛出${v.sect.name}后，本门武功等级减半，且永远不能再提升，也不能再回${v.sect.name}。确定吗？`)) act('叛出师门 确定');
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
          head.append(
            el('span', `pn-stance st-${s.stance || '无'}`, s.stance || kind[0]),
            el('span', 'pn-skill-name', s.name),
            el('span', 'pn-v', `${s.lv} / ${s.cap} 级${s.frozen ? '（冻结）' : ''}`),
          );
          const btns = el('span', 'pn-btns');
          btns.append(s.equipped
            ? button('卸下', () => act(`卸下 ${s.id}`), { disabled: kind !== '外功' && false })
            : button('装备', () => act(`装备 ${s.id}`), { disabled: kind === '外功' && v.outerCount >= v.maxOuter, title: kind === '外功' && v.outerCount >= v.maxOuter ? '外功栏已满，先卸下一门' : '' }));
          btns.append(button(`修炼（${s.trainCost} 潜能）`, () => act(`修炼 ${s.id}`), {
            disabled: !s.canTrain || v.potential < s.trainCost,
            title: s.frozen ? '已冻结' : !v.canTrain ? '要在旅店或本门驻地修炼' : s.lv >= s.cap ? '已到上限' : v.potential < s.trainCost ? '潜能不足' : '',
          }));
          head.append(btns);
          r.append(head);
          if (!s.frozen && s.lv < s.cap) r.append(row(el('span', 'pn-k', '经验'), bar(s.exp, s.need, 'mp'), el('span', 'pn-v', `${s.exp}/${s.need}`)));
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
        el('span', 'pn-hint', `修为 ${v.xiuwei}　天赋点 ${v.free} / ${v.total}　（再长 ${v.toNext} 点修为得下一点）`),
        button('重置天赋', () => { if (confirm('退回全部天赋点？（免费）')) act('天赋 重置'); }),
      ));
      const tree = el('div', 'pn-tree');
      for (const br of v.branches) {
        const col = el('div', `pn-branch st-${br.stance}`);
        col.append(el('h4', 'pn-sub', `${br.name}（${br.stance}）`));
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
      for (const c of g.comboView()) {
        const box = el('div', 'pn-item' + (c.mine ? '' : ' faded'));
        const sideText = (x, who) => `${who}：${x.sect ? x.sect + '·' : ''}${x.name} ${x.lv} 级${x.have ? (x.have >= x.lv ? '（你已达到）' : `（你 ${x.have} 级）`) : ''}`;
        box.append(row(el('span', 'pn-skill-name', `${c.name}`), el('span', 'pn-v', `${c.guard ? '护攻' : '合击'}　额外伤害 ×${(c.bonus - 1).toFixed(1)}${c.effects ? '　' + c.effects : ''}`)));
        box.append(el('div', 'pn-moves', `${sideText(c.a, c.guard ? '甲（守招护住乙）' : '甲')}　｜　${sideText(c.b, '乙')}`));
        box.append(el('div', 'pn-moves', c.desc));
        body.append(box);
      }
      return;
    }

    if (tab === '背包') {
      const v = g.inventoryView();
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
          r.append(row(el('span', 'pn-skill-name', `${it.name}×${it.count}`), button(it.verb, () => act(`use ${it.id}`), { disabled: !it.usable, title: it.usable ? '' : '这件东西暂时用不上' })));
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
        if (!s.started) {
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
          for (const c of s.chapters) {
            const li = el('li', `ch-${c.state}`, c.state === 'locked' ? '？？？' : c.name);
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
    if (tab === '任务') {
      const qs = g.questsView();
      if (!qs.length) body.append(el('p', 'pn-hint', '眼下没有在办的差事。可以去各城衙门、本门师父那里领。'));
      for (const q of qs) {
        const box = el('div', 'pn-item');
        box.append(el('div', 'pn-skill-name', q.name), el('div', 'pn-moves', q.desc));
        if (q.where) box.append(kv('地点', q.where));
        body.append(box);
      }
    }
  }

  // ---- 市集 ----

  function renderMarket() {
    const v = api.game().marketView();
    if (!v) { body.append(el('p', 'pn-hint', '这里不是市集。')); return; }
    body.append(el('p', 'pn-hint', `${v.city}市集　第 ${v.day} 日行情　身上 ${v.money} 文　马车 ${v.cargoUnits}/${v.cargoCap} 件`));
    const t = el('table', 'pn-table');
    t.append(Object.assign(el('tr'), { innerHTML: '<th>货物</th><th>买入</th><th>卖出</th><th>车上</th><th></th>' }));
    for (const gd of v.goods) {
      const tr = el('tr');
      const ops = el('td', 'pn-btns');
      // 本地没有的货（D-076）：显示价格，不能买，但能卖
      const noBuy = !gd.local;
      ops.append(
        button('买1', () => act(`买 ${gd.id} 1`), { disabled: noBuy || v.money < gd.buy || v.cargoUnits >= v.cargoCap }),
        button('买10', () => act(`买 ${gd.id} 10`), { disabled: noBuy || v.money < gd.buy * 10 || v.cargoUnits + 10 > v.cargoCap }),
        button('买满', () => act(`买 ${gd.id} 全部`), { disabled: noBuy || v.money < gd.buy || v.cargoUnits >= v.cargoCap }),
        button('卖1', () => act(`卖 ${gd.id} 1`), { disabled: !gd.have }),
        button('全卖', () => act(`卖 ${gd.id} 全部`), { disabled: !gd.have }),
      );
      tr.append(el('td', '', gd.local ? `${gd.name}（特产）` : gd.name), el('td', noBuy ? 'pn-dim' : '', noBuy ? '本地无货' : gd.buy), el('td', '', gd.sell), el('td', '', gd.have || ''), ops);
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
