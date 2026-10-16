// 启动与 UI 绑定。引擎（game.js）不知道 DOM 的存在。

import { loadContent, loadStoryline } from './content.js';
import { Game } from './game.js';
import { newState, saveLocal, loadLocal, clearLocal, exportText, importText, startedStorylines } from './save.js';
import { renderText } from './ui/text.js';
import { initCards } from './ui/cards.js';
import { bindTab, resolvePinyin } from './ui/complete.js';

const $ = (id) => document.getElementById(id);
const output = $('output');
const input = $('input');
const quick = $('quick');

let db;
let game;
const history = [];
let historyPos = 0;

// ---- 输出：逐段出现的重场戏用队列控制（UX.md §3.5）----

let queue = [];
let moreMarker = null;

function print(entries) {
  queue.push(...entries);
  pump();
}

function pump() {
  moreMarker?.remove();
  moreMarker = null;
  while (queue.length) {
    const e = queue.shift();
    render(e);
    if (e.pace && queue.length) {
      moreMarker = document.createElement('p');
      moreMarker.className = 'more';
      moreMarker.textContent = '▼ 点击或按空格继续';
      output.append(moreMarker);
      break;
    }
  }
  if (!queue.length) {
    output.append(Object.assign(document.createElement('div'), { className: 'gap' }));
    refreshQuick();
  }
  output.scrollTop = output.scrollHeight;
}

function flush() {
  while (queue.length) pump();
}

let choiceBox = null;

function render({ cls, text, n }) {
  if (cls === 'choice') {
    if (!choiceBox) {
      choiceBox = document.createElement('div');
      choiceBox.className = 'choices';
      output.append(choiceBox);
    }
    const b = document.createElement('button');
    b.className = 'choice';
    b.dataset.choice = n;
    b.append(`${n}. `, renderText(text, (id) => game.kindOf(id)));
    choiceBox.append(b);
    return;
  }
  choiceBox = null;
  if (cls === 'room-name' || cls === 'exits') {
    // 新的房间描述出现后，旧的出口链接失效
    if (cls === 'room-name') output.querySelectorAll('a.lk-go').forEach((a) => a.classList.add('stale'));
  }
  const p = document.createElement('p');
  p.className = cls;
  const m = cls === 'say' && text.match(/^([^\[：]{1,8})：/);
  if (m) {
    const s = document.createElement('span');
    s.className = 'speaker';
    s.textContent = m[1];
    p.append(s, '：', renderText(text.slice(m[0].length), (id) => game.kindOf(id)));
  } else {
    p.append(renderText(text, (id) => game.kindOf(id)));
  }
  output.append(p);
}

// ---- 执行命令 ----

async function run(cmd) {
  flush();
  // 旧的对话选项失效
  output.querySelectorAll('.choices button').forEach((b) => { b.disabled = true; });
  choiceBox = null;
  const resolved = resolvePinyin(cmd, game.completions());
  // 对话中选数字时，引擎会回显选项文字，不再重复显示 "> 1"
  const isChoice = /^\d+$/.test(cmd) && game.context().inDialog;
  const echo = isChoice ? [] : [{ cls: 'cmd', text: '> ' + cmd.replace(/\[\[/g, '［［') }];
  print([...echo, ...game.exec(resolved)]);
  await loadPending();
  if (!saveLocal(game.state)) print([{ cls: 'err', text: '（无法自动存档：浏览器禁用了本地存储。请记得手动导出。）' }]);
}

/** 引擎请求加载的主线（如对话里触发了 start:shediao） */
async function loadPending() {
  const ids = game.pendingLoads.splice(0);
  for (const id of ids) {
    try {
      await loadStoryline(db, id);
    } catch (err) {
      print([{ cls: 'err', text: `主线内容加载失败：${err.message}` }]);
    }
  }
  if (ids.length) refreshQuick(); // 新内容可能带来新出口
}

// ---- 情境按钮：当前出口、在场人物 ----

function refreshQuick() {
  if (!game) return;
  const c = game.context();
  quick.replaceChildren();
  const add = (label, cmd, cls = '') => {
    const b = document.createElement('button');
    b.textContent = label;
    b.dataset.cmd = cmd;
    if (cls) b.className = cls;
    quick.append(b);
  };
  add('看', 'look');
  for (const d of c.exits) add(d, d, 'q-go');
  for (const n of c.npcs) if (n.talk) add(n.name, `talk ${n.id}`, 'q-npc');
  add('背包', 'i');
  add('帮助', 'help');
}

// ---- 启动一局 ----

function start(state, isNew) {
  game = new Game(db, state);
  output.replaceChildren();
  queue = [];
  const meta = db.meta.game;
  if (isNew && meta) print(meta.lines.map((l) => ({ cls: 'intro', text: l.text })));
  print([{ cls: 'sys', text: isNew ? '彩色文字可以点击或悬停查看，输入 help 查看命令。' : '读取存档成功。' }]);
  print(game.exec('look'));
  game.state.visited[game.state.player.room] = true;
  saveLocal(game.state);
}

// ---- 输入 ----

$('input-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const cmd = input.value.trim();
  if (!cmd) { if (queue.length) pump(); return; }
  history.push(cmd);
  historyPos = history.length;
  input.value = '';
  run(cmd);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && historyPos > 0) input.value = history[--historyPos];
  else if (e.key === 'ArrowDown') input.value = history[++historyPos] ?? (historyPos = history.length, '');
  else if (e.key === ' ' && !input.value && queue.length) pump();
  else if (/^[1-9]$/.test(e.key) && !input.value && game?.context().inDialog && !queue.length) run(e.key);
  else return;
  e.preventDefault();
});

bindTab(input, () => game?.completions() ?? []);

quick.addEventListener('click', (e) => {
  const cmd = e.target.dataset?.cmd;
  if (cmd) { run(cmd); input.focus(); }
});

output.addEventListener('click', (e) => {
  const b = e.target.closest('button.choice');
  if (b && !b.disabled) { run(b.dataset.choice); return; }
  if (queue.length && !e.target.closest('a.lk')) pump();
});

const cards = initCards({
  describe: (id) => game?.describe(id),
  kindOf: (id) => game?.kindOf(id) ?? null,
  run: (cmd) => run(cmd),
  defaultAction: (id) => {
    const kind = game.kindOf(id);
    if (kind === 'go') return id.slice(3);
    if (kind === 'npc') {
      const n = game.context().npcs.find((x) => x.id === id);
      return n ? (n.talk ? `talk ${id}` : `look ${id}`) : null;
    }
    if (kind === 'item' && game.state.player.inventory[id]) return `look ${id}`;
    return null; // 其余（百科、地名）：左键直接固定信息卡
  },
});

// ---- 存档对话框 ----

const dlg = $('save-dialog');
const saveText = $('save-text');
const saveError = $('save-error');

function openSaveDialog(mode) {
  const isExport = mode === 'export';
  $('save-title').textContent = isExport ? '导出存档' : '导入存档';
  $('save-hint').textContent = isExport
    ? '复制下面的文本或下载为文件，在其他浏览器中「导入」即可继续游戏。'
    : '粘贴存档文本，或选择之前下载的 .txt 文件。导入会覆盖当前进度。';
  $('export-actions').hidden = !isExport;
  $('import-actions').hidden = isExport;
  saveText.readOnly = isExport;
  saveText.value = '';
  saveError.textContent = '';
  cards.closeUnpinned();
  dlg.showModal();
}

$('btn-export').addEventListener('click', async () => {
  openSaveDialog('export');
  saveText.value = await exportText(game.state);
  saveText.select();
});

$('btn-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(saveText.value);
    saveError.textContent = '已复制。';
  } catch {
    saveText.select();
    saveError.textContent = '无法自动复制，请手动 Ctrl+C。';
  }
});

$('btn-download').addEventListener('click', () => {
  const blob = new Blob([saveText.value], { type: 'text/plain' });
  const a = document.createElement('a');
  const d = new Date();
  const pad = (x) => String(x).padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  a.href = URL.createObjectURL(blob);
  a.download = `江湖夜雨-存档-${stamp}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
});

$('btn-import').addEventListener('click', () => openSaveDialog('import'));

$('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) saveText.value = await file.text();
  e.target.value = '';
});

$('btn-do-import').addEventListener('click', async () => {
  try {
    const state = await importText(saveText.value);
    await Promise.all(startedStorylines(state).map((id) => loadStoryline(db, id)));
    if (!db.room[state.player.room]) throw new Error('存档中的位置在当前版本中不存在');
    dlg.close();
    start(state, false);
  } catch (err) {
    saveError.textContent = err.message;
  }
});

$('btn-new').addEventListener('click', () => {
  if (!confirm('确定放弃当前进度、重新开始吗？（建议先导出存档）')) return;
  clearLocal();
  start(newState(db.meta.game.props.start), true);
});

// ---- 启动 ----

(async () => {
  const saved = loadLocal();
  try {
    db = await loadContent(startedStorylines(saved));
  } catch (err) {
    print([{ cls: 'err', text: '内容加载失败：' + err.message }, { cls: 'sys', text: '如果是直接双击打开的 index.html，请改用本地服务器：python -m http.server 8000' }]);
    return;
  }
  const meta = db.meta.game;
  if (meta?.props.title) { document.title = meta.props.title; $('title').textContent = meta.props.title; }
  const valid = saved && db.room[saved.player.room];
  start(valid ? saved : newState(meta.props.start), !valid);
})();
