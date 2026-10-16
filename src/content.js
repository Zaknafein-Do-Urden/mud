// 内容文件解析器。语法见 docs/DESIGN.md §5。

/**
 * @typedef {{cond: string[], text: string}} Line
 * @typedef {{text: string, target: string|null, cond: string[], effects: string[]}} Choice
 * @typedef {{type: string, id: string, props: Record<string,string>, lines: Line[], choices: Choice[]}} Block
 */

/** 解析一个内容文件，返回块列表。 */
export function parse(source, file = '?') {
  /** @type {Block[]} */
  const blocks = [];
  let cur = null;
  let inBody = false;

  source.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith('#')) return; // 注释，块内块外均可
    const head = line.match(/^===\s*(\w+)\s*:\s*(\S+)\s*$/);
    if (head) {
      cur = { type: head[1], id: head[2], props: {}, lines: [], choices: [] };
      blocks.push(cur);
      inBody = false;
      return;
    }
    if (!cur) {
      if (line) console.warn(`${file}:${i + 1} 块外的内容被忽略`);
      return;
    }
    if (!inBody) {
      if (line === '---') { inBody = true; return; }
      if (!line) return;
      const kv = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (kv) cur.props[kv[1]] = kv[2];
      else console.warn(`${file}:${i + 1} 无法识别的属性行: ${line}`);
      return;
    }
    if (line.startsWith('* ')) {
      cur.choices.push(parseChoice(line.slice(2)));
      return;
    }
    // 行首条件：?flag:x ?!has:y 正文
    const cond = [];
    let text = line;
    let m;
    while ((m = text.match(/^\?(!?\w+:\S+)\s*/))) {
      cond.push(m[1]);
      text = text.slice(m[0].length);
    }
    cur.lines.push({ cond, text });
  });

  for (const b of blocks) {
    // 去掉正文末尾空行
    while (b.lines.length && !b.lines[b.lines.length - 1].text) b.lines.pop();
  }
  return blocks;
}

/** `给他一文钱 -> linan.beggar.give ?has:coin !take:coin` */
function parseChoice(s) {
  const tokens = s.split(/\s+/);
  const textParts = [];
  let target = null;
  const cond = [];
  const effects = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '->') target = tokens[++i] ?? null;
    else if (t.startsWith('?')) cond.push(t.slice(1));
    else if (t.startsWith('!')) effects.push(t.slice(1));
    else textParts.push(t);
  }
  return { text: textParts.join(' '), target, cond, effects };
}

/** `北=linan.street, 东=linan.lake` → {北: 'linan.street', 东: 'linan.lake'} */
export function parseMap(s = '') {
  const out = {};
  for (const part of s.split(',')) {
    const [k, v] = part.split('=').map((x) => x.trim());
    if (k && v) out[k] = v;
  }
  return out;
}

export function parseList(s = '') {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

/** 把解析好的块并入 db。patch 块按目标 id 归组，其余按类型、id 索引。 */
export function addBlocks(db, blocks, file = '?') {
  for (const b of blocks) {
    b.file = file;
    if (b.type === 'patch') {
      (db.patch[b.id] ??= []).push(b);
      continue;
    }
    db[b.type] ??= {};
    if (db[b.type][b.id]) console.warn(`重复的 ${b.type} id: ${b.id}（${file}）`);
    db[b.type][b.id] = b;
  }
}

export function emptyDb() {
  return { room: {}, npc: {}, item: {}, dialog: {}, entry: {}, storyline: {}, chapter: {}, trigger: {}, meta: {}, patch: {}, loaded: new Set() };
}

async function loadFiles(db, base, files) {
  const todo = files.filter((f) => !db.loaded.has(f));
  const texts = await Promise.all(todo.map((f) => fetch(base + f).then((r) => {
    if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
    return r.text();
  })));
  texts.forEach((src, i) => {
    addBlocks(db, parse(src, todo[i]), todo[i]);
    db.loaded.add(todo[i]);
  });
}

/**
 * 加载内容。index.json 结构：
 *   { "world": [...], "storylines": { "<id>": { "hook": [...], "files": [...] } } }
 * world 与各主线的 hook（开端）总是加载；主线正文只在已开始时加载（见 STORY.md §4.3）。
 */
export async function loadContent(startedLines = [], base = 'content/') {
  const index = await (await fetch(base + 'index.json')).json();
  const db = emptyDb();
  db.index = index;
  db.base = base;
  const hooks = Object.values(index.storylines ?? {}).flatMap((s) => s.hook ?? []);
  await loadFiles(db, base, [...index.world, ...hooks]);
  await Promise.all(startedLines.map((id) => loadStoryline(db, id)));
  return db;
}

export async function loadStoryline(db, id) {
  const line = db.index.storylines?.[id];
  if (!line) { console.warn('未知主线', id); return; }
  await loadFiles(db, db.base, line.files ?? []);
}

/** 把 `[[显示名|id]]` 标记拆成片段：[{text}, {text, id}, ...] */
export function splitLinks(text) {
  const out = [];
  const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[1], id: m[2] ?? m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
