// 把带 [[显示名|id]] 标记的文本渲染成 DOM 片段。

import { splitLinks } from '../content.js';

/** @param {(id: string) => string|null} kindOf 链接类别，用于配色 */
export function renderText(text, kindOf) {
  const frag = document.createDocumentFragment();
  for (const part of splitLinks(text)) {
    if (!part.id) { frag.append(part.text); continue; }
    const a = document.createElement('a');
    a.className = 'lk lk-' + (kindOf(part.id) ?? 'unknown');
    a.dataset.id = part.id;
    a.textContent = part.text;
    frag.append(a);
  }
  return frag;
}
