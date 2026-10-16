// 战斗面板：对手状态、自身气血内力、按势配色的招式卡片（UX.md §5）。
// 面板只整理引擎给出的信息，不显示对手本回合的真实意图（D-019）。

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

function bar(value, max, cls) {
  const b = el('div', 'bar ' + cls);
  const i = el('i');
  i.style.width = Math.max(0, Math.min(100, (value / max) * 100)) + '%';
  b.append(i);
  return b;
}

/**
 * @param {HTMLElement} root
 * @param {ReturnType<import('../game.js').Game['combatView']>} view
 * @param {(cmd: string) => void} run
 */
export function renderCombat(root, view, run, secondsLeft = 0) {
  root.replaceChildren();
  const alive = view.enemies.filter((e) => !e.dead);
  let target = alive.find((e) => e.key === view.target) ?? alive[0];
  // 守招 / 辅助招式的目标（D-064）：默认自己
  let ally = (view.allies ?? []).find((a) => a.self) ?? null;

  // 对手
  const foes = el('div', 'cb-foes');
  for (const e of view.enemies) {
    const row = el('button', 'cb-foe' + (e.dead ? ' dead' : '') + (e === target ? ' sel' : ''));
    row.disabled = e.dead;
    row.append(el('span', 'cb-name', e.name), bar(e.hp, e.maxHp, 'hp'), el('span', 'cb-text', `${e.hpText} ${e.hp}/${e.maxHp}`));
    if (e.status.length) row.append(el('span', 'cb-status', e.status.join(' ')));
    row.title = alive.length > 1 ? '点击选为目标' : '';
    row.addEventListener('click', () => {
      target = e;
      foes.querySelectorAll('.cb-foe').forEach((r) => r.classList.remove('sel'));
      row.classList.add('sel');
    });
    foes.append(row);
  }

  // 自己
  const me = el('div', 'cb-me');
  me.append(
    el('span', 'cb-name', '气血'), bar(view.me.hp, view.me.maxHp, 'hp'), el('span', 'cb-text', `${view.me.hp}/${view.me.maxHp}`),
    el('span', 'cb-name', '内力'), bar(view.me.mp, view.me.maxMp, 'mp'), el('span', 'cb-text', `${view.me.mp}/${view.me.maxMp}`),
  );
  if (view.me.status.length) me.append(el('span', 'cb-status', view.me.status.join(' ')));

  // 队友（守招、辅助招式的目标）
  const allies = el('div', 'cb-allies');
  if ((view.allies ?? []).length > 1) {
    allies.append(el('span', 'cb-text', '守招目标：'));
    for (const a of view.allies) {
      const btn = el('button', 'cb-ally' + (a === ally ? ' sel' : ''), `${a.name} ${a.hp}/${a.maxHp}`);
      btn.addEventListener('click', () => {
        ally = a;
        allies.querySelectorAll('.cb-ally').forEach((x) => x.classList.remove('sel'));
        btn.classList.add('sel');
      });
      allies.append(btn);
    }
  }

  // 招式
  const targetArg = () => (alive.length > 1 ? ' ' + (alive.indexOf(target) + 1) : '');
  const allyArg = () => (ally && !ally.self ? ' @' + ally.n : '');
  const cards = el('div', 'cb-cards');
  for (const m of view.moves) {
    const c = el('button', `cb-card st-${m.stance}`);
    c.disabled = !m.usable;
    c.append(
      el('span', 'cb-stance', `${m.n} · ${m.stance} · ${m.skillName}`),
      el('span', 'cb-move', m.name),
      el('span', 'cb-cost', `内力 ${m.mp}${m.effects.length ? ' · ' + m.effects.join(' ') : ''}`),
    );
    c.title = m.usable ? '' : m.need || '内力不足';
    if (m.need) c.append(el('span', 'cb-need', m.need));
    if (m.support) c.append(el('span', 'cb-support', '辅助：作用在目标身上'));
    // 合击提示（D-065）：与队友已选的招式能构成合击
    if (m.combo) {
      c.classList.add('combo');
      const how = m.combo.guard ? `（守招目标选${m.combo.mate}）` : m.combo.foeName ? `（和${m.combo.mate}同打${m.combo.foeName}）` : '';
      c.append(el('span', 'cb-combo', `★ 合击「${m.combo.name}」${how}`));
    }
    // 有合击提示时，点卡片自动打队友正在打的那个敌人
    const comboArg = () => (m.combo?.foeN > 0 && alive.length > 1 ? ' ' + m.combo.foeN : targetArg());
    c.addEventListener('click', () => run(m.n + (m.stance === '守' ? allyArg() : comboArg())));
    cards.append(c);
  }
  const rest = el('button', 'cb-card st-无');
  rest.append(el('span', 'cb-stance', '0 · 无势'), el('span', 'cb-move', '调息'), el('span', 'cb-cost', `内力 +${Math.round(view.me.maxMp * 0.1)}`));
  rest.addEventListener('click', () => run('0'));
  cards.append(rest);

  // 兵器：手中的兵器；可以花一回合换上背包里的另一件（D-057）
  const arms = el('div', 'cb-arms');
  arms.append(el('span', 'cb-text', view.disarmed ? '兵器被打飞了！' : `兵器：${view.weapon ?? '空手'}`));
  for (const w of view.swaps ?? []) {
    const b = el('button', 'cb-swap', `换上${w.name}（花一回合）`);
    b.disabled = !!view.chosen;
    b.addEventListener('click', () => run(`换 ${w.id}`));
    arms.append(b);
  }

  const foot = el('div', 'cb-foot');
  foot.append(el('span', 'cb-hint', '刚克守 · 巧克刚 · 守克巧　看清预兆再出手'));
  if (view.canFlee) {
    const flee = el('button', 'cb-flee', '逃跑');
    flee.addEventListener('click', () => run('逃跑'));
    foot.append(flee);
  }

  // 组队：队友状态和本回合已选的招式（D-019），出招倒计时
  const team = el('div', 'cb-team');
  if (view.team?.length) {
    for (const t of view.team) {
      const doing = t.npc ? (t.chosen ? `准备出：${t.chosen}` : '……') : t.chosen ? `已出招：${t.chosen}` : '思考中……';
      team.append(el('div', 'cb-mate' + (t.npc ? ' npc' : ''), `${t.npc ? '【同伴】' : ''}${t.name}　${t.hp}/${t.maxHp}　${t.hp <= 0 ? '已倒下' : doing}`));
    }
  }
  if (secondsLeft) foot.prepend(el('span', 'cb-timer', `⏳ ${secondsLeft} 秒`));
  if (view.chosen) {
    cards.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    team.prepend(el('div', 'cb-wait', '你已出招，等待队友……'));
  }
  root.append(foes, me, team, allies, cards, arms, foot);
  return { targetArg };
}
