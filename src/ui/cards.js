// 链接信息卡：悬停弹出，右键固定，固定后可继续悬停卡内链接逐层查看（UX.md §3.1，D-022）。

import { renderText } from './text.js';

const OPEN_DELAY = 280;  // 悬停多久后弹出
const CLOSE_DELAY = 260; // 移开多久后关闭（留时间把鼠标移进卡片）
const MAX_PINNED = 3;

/**
 * @param {{describe: (id:string)=>any, kindOf: (id:string)=>string|null, run: (cmd:string)=>void, defaultAction: (id:string)=>string|null}} api
 */
export function initCards(api) {
  /** @type {{el: HTMLElement, anchor: HTMLElement, id: string, parent: any, pinned: boolean}[]} */
  let cards = [];
  let lastTarget = null;
  let openTimer = 0;
  let sweepTimer = 0;
  let touch = false;

  const inside = (node, el) => !!node && !!el && el.contains(node);

  function keep(card) {
    if (card.pinned) return true;
    if (inside(lastTarget, card.el) || inside(lastTarget, card.anchor)) return true;
    return cards.some((c) => c.parent === card && keep(c));
  }

  function remove(card) {
    card.el.remove();
    cards = cards.filter((c) => c !== card);
    // 子卡随父卡关闭（固定的子卡保留）
    for (const c of cards.filter((c) => c.parent === card && !c.pinned)) remove(c);
  }

  function sweep() {
    for (const c of [...cards].reverse()) if (cards.includes(c) && !keep(c)) remove(c);
  }

  function position(el, anchor) {
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = Math.min(r.left, window.innerWidth - w - 8);
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    el.style.left = Math.max(8, left) + 'px';
    el.style.top = top + 'px';
  }

  function open(anchor) {
    const id = anchor.dataset.id;
    const existing = cards.find((c) => c.anchor === anchor);
    if (existing) return existing;
    const info = api.describe(id);
    if (!info) return null;

    const el = document.createElement('div');
    el.className = 'card';
    const head = document.createElement('div');
    head.className = 'card-head lk-' + (api.kindOf(id) ?? 'unknown');
    head.textContent = info.title;
    const close = document.createElement('button');
    close.className = 'card-close';
    close.textContent = '×';
    close.title = '关闭';
    head.append(close);
    el.append(head);
    for (const line of info.lines) {
      const p = document.createElement('p');
      p.append(renderText(line, api.kindOf));
      el.append(p);
    }
    if (info.actions.length) {
      const row = document.createElement('div');
      row.className = 'card-actions';
      for (const a of info.actions) {
        const b = document.createElement('button');
        b.textContent = a.label;
        b.dataset.cmd = a.cmd;
        row.append(b);
      }
      el.append(row);
    }
    document.body.append(el);
    position(el, anchor);

    const parent = cards.find((c) => c.el.contains(anchor)) ?? null;
    const card = { el, anchor, id, parent, pinned: false };
    cards.push(card);

    close.addEventListener('click', () => remove(card));
    el.addEventListener('click', (e) => {
      const cmd = e.target.dataset?.cmd;
      if (!cmd) return;
      closeUnpinned();
      api.run(cmd);
    });
    makeDraggable(card, head);
    return card;
  }

  function pin(card) {
    if (!card || card.pinned) return;
    card.pinned = true;
    card.el.classList.add('pinned');
    const pinned = cards.filter((c) => c.pinned);
    if (pinned.length > MAX_PINNED) remove(pinned[0]);
  }

  function makeDraggable(card, handle) {
    handle.addEventListener('pointerdown', (e) => {
      if (!card.pinned || e.target.closest('button')) return;
      const r = card.el.getBoundingClientRect();
      const dx = e.clientX - r.left;
      const dy = e.clientY - r.top;
      const move = (ev) => {
        card.el.style.left = ev.clientX - dx + 'px';
        card.el.style.top = ev.clientY - dy + 'px';
      };
      const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
    });
  }

  function closeUnpinned() {
    for (const c of [...cards]) if (cards.includes(c) && !c.pinned) remove(c);
  }

  // ---- 事件 ----

  document.addEventListener('pointerdown', (e) => {
    touch = e.pointerType === 'touch';
    // 触屏：点到卡片和链接之外，关闭未固定的卡
    if (touch && !e.target.closest('.card, a.lk')) closeUnpinned();
  });

  document.addEventListener('mouseover', (e) => {
    lastTarget = e.target;
    clearTimeout(sweepTimer);
    sweepTimer = setTimeout(sweep, CLOSE_DELAY);
    const link = e.target.closest?.('a.lk:not(.stale)');
    clearTimeout(openTimer);
    if (link && !touch) {
      openTimer = setTimeout(() => { if (inside(lastTarget, link)) open(link); }, OPEN_DELAY);
    }
  });

  document.addEventListener('contextmenu', (e) => {
    const link = e.target.closest('a.lk:not(.stale)');
    if (!link) return; // 只在链接上拦截右键（手机长按也会触发 contextmenu）
    e.preventDefault();
    pin(open(link));
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a.lk');
    if (!link || link.classList.contains('stale')) return;
    e.preventDefault();
    if (touch) { open(link); return; } // 触屏：轻点相当于悬停
    const cmd = api.defaultAction(link.dataset.id);
    if (cmd) { closeUnpinned(); api.run(cmd); } else pin(open(link));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') for (const c of [...cards]) remove(c);
  });

  return { closeUnpinned };
}
