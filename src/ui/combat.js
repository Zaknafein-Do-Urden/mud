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

  // 招式
  const targetArg = () => (alive.length > 1 ? ' ' + (alive.indexOf(target) + 1) : '');
  const cards = el('div', 'cb-cards');
  for (const m of view.moves) {
    const c = el('button', `cb-card st-${m.stance}`);
    c.disabled = !m.usable;
    c.append(
      el('span', 'cb-stance', `${m.n} · ${m.stance} · ${m.skillName}`),
      el('span', 'cb-move', m.name),
      el('span', 'cb-cost', `内力 ${m.mp}${m.effects.length ? ' · ' + m.effects.join(' ') : ''}`),
    );
    c.title = m.usable ? '' : '内力不足';
    c.addEventListener('click', () => run(m.n + (m.stance === '守' ? '' : targetArg())));
    cards.append(c);
  }
  const rest = el('button', 'cb-card st-无');
  rest.append(el('span', 'cb-stance', '0 · 无势'), el('span', 'cb-move', '调息'), el('span', 'cb-cost', `内力 +${Math.round(view.me.maxMp * 0.1)}`));
  rest.addEventListener('click', () => run('0'));
  cards.append(rest);

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
      team.append(el('div', 'cb-mate', `${t.name}　${t.hp}/${t.maxHp}　${t.hp <= 0 ? '已倒下' : t.chosen ? `已出招：${t.chosen}` : '思考中……'}`));
    }
  }
  if (secondsLeft) foot.prepend(el('span', 'cb-timer', `⏳ ${secondsLeft} 秒`));
  if (view.chosen) {
    cards.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    team.prepend(el('div', 'cb-wait', '你已出招，等待队友……'));
  }
  root.append(foes, me, team, cards, foot);
  return { targetArg };
}
