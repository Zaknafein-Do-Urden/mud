// 命令行补全：Tab 补全 + 拼音首字母 / 全拼匹配（UX.md §3.2）。
// 拼音库按需从 CDN 加载，加载失败时只是少了拼音匹配，不影响游戏。

let pinyin = null;
import('https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/+esm')
  .then((m) => { pinyin = m.pinyin; })
  .catch(() => console.warn('拼音库加载失败，拼音补全不可用'));

const cache = new Map();
function keys(word) {
  if (!pinyin || !/[一-鿿]/.test(word)) return [];
  if (!cache.has(word)) {
    const syl = pinyin(word, { toneType: 'none', type: 'array' });
    cache.set(word, [syl.map((s) => s[0]).join(''), syl.join('')]);
  }
  return cache.get(word);
}

/** token 是否能指代 candidate：前缀，或拼音首字母 / 全拼前缀 */
export function matches(token, candidate) {
  if (!token) return true;
  if (candidate.startsWith(token)) return true;
  if (!/^[a-z]+$/i.test(token)) return false;
  const t = token.toLowerCase();
  return keys(candidate).some((k) => k.startsWith(t));
}

/**
 * 提交前把拼音参数换成中文名：`talk lqg` → `talk 老乞丐`。
 * 只替换第一个词之后、能唯一匹配的拼音词（完整匹配首字母或全拼）。
 */
export function resolvePinyin(line, names) {
  const [verb, ...args] = line.trim().split(/\s+/);
  if (!args.length) return line;
  const resolved = args.map((a) => {
    if (!/^[a-z]+$/i.test(a)) return a;
    const t = a.toLowerCase();
    const hits = names.filter((n) => keys(n).includes(t));
    return hits.length === 1 ? hits[0] : a;
  });
  return [verb, ...resolved].join(' ');
}

/** 绑定 Tab 补全；连续按 Tab 在候选中循环 */
export function bindTab(input, getCandidates) {
  let cycle = null; // {prefix, hits, i}
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') { if (e.key !== 'Shift') cycle = null; return; }
    e.preventDefault();
    if (!cycle) {
      const v = input.value;
      const cut = v.lastIndexOf(' ') + 1;
      const token = v.slice(cut);
      const hits = [...new Set(getCandidates())].filter((c) => matches(token, c));
      if (!hits.length) return;
      cycle = { prefix: v.slice(0, cut), hits, i: -1 };
    }
    cycle.i = (cycle.i + (e.shiftKey ? -1 : 1) + cycle.hits.length) % cycle.hits.length;
    input.value = cycle.prefix + cycle.hits[cycle.i];
  });
}
