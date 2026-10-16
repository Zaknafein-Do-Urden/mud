// 启动与 UI 绑定。引擎（game.js）不知道 DOM 的存在。

import { loadContent, loadStoryline } from './content.js';
import { Game } from './game.js';
import { newState, saveLocal, loadLocal, clearLocal, exportText, importText, startedStorylines } from './save.js';
import { renderText } from './ui/text.js';
import { initCards } from './ui/cards.js';
import { bindTab, resolvePinyin } from './ui/complete.js';
import { renderCombat } from './ui/combat.js';
import { renderMap, findPath, regionOf } from './ui/map.js';
import { renderWorld } from './ui/worldmap.js';
import { initPanels } from './ui/panels.js';
import { initParty } from './ui/party.js';

const $ = (id) => document.getElementById(id);
const output = $('output');
const input = $('input');
const quick = $('quick');
const combatBox = $('combat');
const statusBox = $('status');
let combatUi = null;

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

function render({ cls, text, n, cmd, disabled }) {
  if (cls === 'choice') {
    if (!choiceBox) {
      choiceBox = document.createElement('div');
      choiceBox.className = 'choices';
      output.append(choiceBox);
    }
    const b = document.createElement('button');
    b.className = 'choice';
    b.dataset.choice = n;
    b.disabled = !!disabled; // 买不起的选项：灰色不能点（D-078）
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
  // 房主收到客人的建议：一键采纳（MULTIPLAYER.md §3.2）
  if (cls === 'suggest' && cmd) {
    const b = document.createElement('button');
    b.className = 'adopt';
    b.textContent = '采纳';
    b.dataset.adopt = cmd;
    p.append(' ', b);
  }
  output.append(p);
}

// ---- 执行命令 ----

/** 联机相关的命令：在引擎之外处理 */
function partyCommand(cmd) {
  const [verb, ...rest] = cmd.trim().split(/\s+/);
  const arg = rest.join(' ');
  if (['开设队伍', '组队'].includes(verb)) { party.host(); return true; }
  if (['加入队伍', '加入'].includes(verb)) { party.join(arg); return true; }
  if (['搜索队伍', '找队伍'].includes(verb)) { party.search(); return true; }
  if (['踢出', '请离'].includes(verb)) { party.kick(arg); return true; }
  if (['离开队伍', '退出队伍', '解散队伍'].includes(verb)) {
    if (!party.role()) print([{ cls: 'err', text: '你不在队伍中。' }]);
    else party.leave();
    return true;
  }
  if (verb === '队伍') {
    const ms = party.members();
    print([{ cls: 'party', text: party.role() ? `队伍成员：${ms.map((m) => m.name + (m.host ? '（队长）' : '')).join('、')}` : '你不在队伍中。在旅店或门派驻地可以 开设队伍 或 搜索队伍。' }]);
    return true;
  }
  return false;
}

async function run(cmd) {
  flush();
  if (partyCommand(cmd)) { print([]); refreshQuick(); return []; }
  // 旧的对话选项失效
  output.querySelectorAll('.choices button').forEach((b) => { b.disabled = true; });
  choiceBox = null;
  const resolved = resolvePinyin(cmd, game.completions());
  // 对话中选数字时，引擎会回显选项文字，不再重复显示 "> 1"
  const ctx = game.context();
  const isChoice = (/^\d+$/.test(cmd) && ctx.inDialog) || (/^\d+( \d+)?$/.test(cmd) && (ctx.inCombat || party.guestCombat()));
  // 点击链接产生的命令里带内部 id（talk shediao.qusan），回显时换成名字
  const shown = cmd.split(/\s+/).map((t) => db.npc[t]?.props.name ?? db.item[t]?.props.name ?? db.city[t]?.props.name ?? db.skill[t]?.props.name ?? t).join(' ');
  const echo = isChoice ? [] : [{ cls: 'cmd', text: '> ' + shown.replace(/\[\[/g, '［［') }];
  // 客人：查看自己的命令在本地执行，其余发给房主（多数变成建议）
  if (party.isGuest()) {
    const out = party.guestRun(resolved);
    print([...echo, ...out]);
    saveLocal(game.state);
    return out;
  }
  const out = game.exec(resolved);
  const verb = resolved.trim().split(/\s+/)[0].toLowerCase();
  // 房主：按接收者分发（自己看自己的那份，客人各看各的）；单人时只显示给自己的条目
  const shownOut = party.isHost() ? party.dispatch(out, verb) : out.filter((e) => !e.to || e.to === 'host');
  print([...echo, ...shownOut]);
  await loadPending();
  if (!saveLocal(game.state)) print([{ cls: 'err', text: '（无法自动存档：浏览器禁用了本地存储。请记得手动导出。）' }]);
  return out; // 面板用它显示执行结果
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
  refreshStatus();
  refreshMap();
  refreshParty();
  const c = game.context();
  // 战斗中用战斗面板代替情境按钮；客人的战斗面板数据来自房主
  const view = party.isGuest() ? party.guestCombat() : c.inCombat ? game.combatView() : null;
  combatBox.hidden = !view;
  quick.hidden = !!view;
  if (view) {
    combatUi = renderCombat(combatBox, view, (cmd) => { run(cmd); input.focus(); }, party.role() ? party.secondsLeft() : 0);
    return;
  }
  combatUi = null;
  quick.replaceChildren();
  const add = (label, cmd, cls = '') => {
    const b = document.createElement('button');
    b.textContent = label;
    b.dataset.cmd = cmd;
    if (cls) b.className = cls;
    quick.append(b);
  };
  add('看', 'look');
  if (party.isGuest()) {
    // 客人：跟随队长，只留查看与队伍操作
    add('说话', '@say');
    add('离开队伍', '离开队伍');
    add('背包', 'i');
    add('帮助', 'help');
    return;
  }
  for (const d of c.exits) add(d, d, 'q-go');
  for (const n of c.npcs) if (n.talk) add(n.name, `talk ${n.id}`, 'q-npc');
  const r = game.room()?.props ?? {};
  if (r.station === 'true') add('乘车', '乘车');
  if (r.market === 'true') add('市集', '@market');
  if (r.bank === 'true') add('钱庄', '@bank');
  if (r.inn === 'true') add('休息', '休息');
  // 旅店、门派驻地可以组队（D-011、D-046）
  if (!party.role() && r.inn === 'true') { add('开设队伍', '开设队伍'); add('搜索队伍', '搜索队伍'); }
  if (party.isHost()) { add('说话', '@say'); add('解散队伍', '解散队伍'); }
  add('背包', 'i');
  add('帮助', 'help');
}

/** 队伍栏：成员；队长可以把人请出队伍（D-055） */
function refreshParty() {
  const box = $('party');
  if (!party.role() || party.role() === 'joining') { box.hidden = true; return; }
  box.hidden = false;
  box.replaceChildren(`队伍（${party.members().length}/4）：`);
  for (const m of party.members()) {
    const span = document.createElement('span');
    span.className = 'pt-member';
    span.textContent = m.name + (m.host ? '（队长）' : '');
    box.append(span);
    if (party.isHost() && !m.host) {
      const b = document.createElement('button');
      b.className = 'pt-kick';
      b.textContent = '踢出';
      b.addEventListener('click', () => { if (confirm(`把${m.name}请出队伍？`)) party.kick(m.pid); });
      box.append(b);
    }
  }
}

/** 大厅：搜到的队伍列表（D-055） */
function showLobby(list) {
  const dlg = $('lobby');
  const box = $('lobby-list');
  box.replaceChildren();
  if (!list.length) box.append(Object.assign(document.createElement('p'), { className: 'pn-hint', textContent: '正在搜索……这里眼下没有人带队。可以稍等片刻，或者自己开设一个。' }));
  for (const p of list) {
    const row = document.createElement('div');
    row.className = 'lb-row';
    const full = p.count >= p.max;
    row.append(Object.assign(document.createElement('span'), { className: 'lb-name', textContent: `${p.host}的队伍` }),
      Object.assign(document.createElement('span'), { className: 'lb-count', textContent: `${p.count}/${p.max} 人${p.ok ? '' : '（游戏版本不同）'}` }));
    const b = document.createElement('button');
    b.textContent = full ? '已满' : '加入';
    b.disabled = full || !p.ok;
    b.addEventListener('click', () => { dlg.close(); party.pick(p.code); });
    row.append(b);
    box.append(row);
  }
  if (!dlg.open) dlg.showModal();
}
$('lobby-close').addEventListener('click', () => $('lobby').close());
$('lobby').addEventListener('close', () => party.closeSearch());

function refreshStatus() {
  const st = game.statusView();
  $('status-text').textContent = `${game.state.player.name}　气血 ${st.hp}/${st.maxHp}　内力 ${st.mp}　潜能 ${st.potential}　${st.money} 文　第 ${st.day} 日`;
  statusBox.classList.toggle('low', st.hp < st.maxHp * 0.3);
}

// ---- 地图（常驻右侧，可收起；D-034）----

let walking = false;

function refreshMap() {
  const room = game.room();
  $('map-title').textContent = room ? regionName(room.id) : '地图';
  const ov = party.mapOverride();
  if (ov) {
    // 客人：地图显示队长所在的位置（客人自己的存档不记录这些地方）
    $('map-title').textContent = db.room[ov.room] ? regionName(ov.room) : '地图';
    renderMap($('map'), game, () => {}, ov);
    return;
  }
  renderMap($('map'), game, walkTo);
}

/** 区域名：取区域第一个房间名中"·"之前的部分，如"临安城""牛家村" */
function regionName(id) {
  const region = regionOf(id);
  const first = Object.values(db.room).find((r) => regionOf(r.id) === region && r.props.name.includes('·'));
  return first ? first.props.name.split('·')[0] : '地图';
}

/** 自动寻路：逐步走过去，遇到对话、战斗或重场戏就停下 */
async function walkTo(roomId) {
  if (walking || queue.length) return;
  const c = game.context();
  if (c.inCombat || (c.inDialog && game.locked)) return;
  const path = findPath(game, game.state.player.room, roomId);
  if (!path) return;
  walking = true;
  for (const dir of path) {
    await run(dir);
    const now = game.context();
    if (now.inCombat || now.inDialog || queue.length) break;
  }
  walking = false;
}

// ---- 大地图（D-040）----

function openWorld() {
  if (!game) return;
  renderWorld($('world-map'), $('world-info'), game.worldView(), (cityId) => {
    $('world-dialog').close();
    run(`乘车 ${cityId}`);
  });
  $('world-dialog').showModal();
}
$('world-toggle').addEventListener('click', openWorld);
$('world-close').addEventListener('click', () => $('world-dialog').close());

function setMapOpen(open) {
  document.body.classList.toggle('map-open', open);
  try { localStorage.setItem('wuxia-mud:ui:map', open ? '1' : '0'); } catch { /* 忽略 */ }
}
$('map-toggle').addEventListener('click', () => setMapOpen(!document.body.classList.contains('map-open')));
$('map-close').addEventListener('click', () => setMapOpen(false));
{
  let saved = null;
  try { saved = localStorage.getItem('wuxia-mud:ui:map'); } catch { /* 忽略 */ }
  // 默认：宽屏打开，窄屏收起
  setMapOpen(saved === null ? window.innerWidth >= 900 : saved === '1');
}

// ---- 创建角色：姓、名、性别（D-041）----

/** 弹出创建角色对话框；返回 Promise<{surname, given, gender}> */
function askIdentity(prefill) {
  const dlg = $('create-dialog');
  $('cr-surname').value = prefill?.surname ?? '';
  $('cr-given').value = prefill?.given ?? '';
  $('cr-error').textContent = '';
  document.querySelectorAll('input[name="cr-gender"]').forEach((r) => { r.checked = r.value === (prefill?.gender ?? '男'); });
  dlg.showModal();
  return new Promise((resolve) => {
    $('create-form').onsubmit = (e) => {
      e.preventDefault();
      const surname = $('cr-surname').value.trim();
      const given = $('cr-given').value.trim();
      const gender = document.querySelector('input[name="cr-gender"]:checked').value;
      const han = /^[\u4e00-\u9fff]+$/;
      if (!han.test(surname) || !han.test(given)) { $('cr-error').textContent = '姓和名请填写汉字。'; return; }
      dlg.close();
      resolve({ surname, given, gender });
    };
  });
}
// 必须填写，不能按 Esc 跳过
$('create-dialog').addEventListener('cancel', (e) => e.preventDefault());

function applyIdentity(state, id) {
  Object.assign(state.player, id, { name: id.surname + id.given });
}

// ---- 启动一局 ----

function start(state, isNew) {
  game = new Game(db, state);
  output.replaceChildren();
  queue = [];
  const meta = db.meta.game;
  if (isNew && meta) print(meta.lines.map((l) => ({ cls: 'intro', text: l.text })));
  print([{ cls: 'sys', text: isNew ? '彩色文字可以点击或悬停查看，输入 help 查看命令。' : '读取存档成功。' }]);
  if (!state.battle) print(game.exec('look'));
  print(game.resume()); // 刷新或读档前正在进行的对话
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
  else if (/^[0-9]$/.test(e.key) && !input.value && (game?.context().inCombat || party.guestCombat()) && !queue.length) run(e.key === '0' ? '0' : e.key + (combatUi?.targetArg() ?? ''));
  else return;
  e.preventDefault();
});

bindTab(input, () => game?.completions() ?? []);

quick.addEventListener('click', (e) => {
  const cmd = e.target.dataset?.cmd;
  if (!cmd) return;
  // @ 开头的是打开面板或输入框，不是命令
  if (cmd === '@market') panels.open('market');
  else if (cmd === '@bank') panels.open('bank');
  else if (cmd === '@say') { const t = prompt('对队友说：'); if (t) run(`说 ${t}`); }
  else { run(cmd); input.focus(); }
});

// ---- 面板：人物、江湖、市集、钱庄（D-045）----
const panels = initPanels({ game: () => game, run });

// ---- 联机（D-048）----
let contentHash = '';
const party = initParty({
  game: () => game,
  db: () => db,
  get contentHash() { return contentHash; },
  print: (entries) => { print(entries); },
  refresh: () => refreshQuick(),
  showLobby: (list) => showLobby(list),
  save: () => saveLocal(game.state),
  // 客人入队后加载所有主线内容，房主那边的剧情文字里的链接才能正常显示
  onJoined: () => Promise.all(Object.keys(db.index.storylines ?? {}).map((id) => loadStoryline(db, id))),
});
$('char-toggle').addEventListener('click', () => panels.open('char'));
$('journal-toggle').addEventListener('click', () => panels.open('journal'));

output.addEventListener('click', (e) => {
  const adopt = e.target.closest('button.adopt');
  if (adopt) { run(adopt.dataset.adopt); adopt.disabled = true; return; }
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

$('btn-new').addEventListener('click', async () => {
  if (!confirm('确定放弃当前进度、重新开始吗？（建议先导出存档）')) return;
  clearLocal();
  const state = newState(db.meta.game.props.start);
  applyIdentity(state, await askIdentity());
  start(state, true);
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
  contentHash = hashText(JSON.stringify(db.index));
  const meta = db.meta.game;
  if (meta?.props.title) { document.title = meta.props.title; $('title').textContent = meta.props.title; }
  const valid = saved && db.room[saved.player.room];
  const state = valid ? saved : newState(meta.props.start);
  // 新游戏，或旧存档还没有姓名：先报上名来
  if (!state.player.surname) applyIdentity(state, await askIdentity());
  start(state, !valid);
})();

/** 内容版本指纹：联机时双方必须一致（MULTIPLAYER.md §7） */
function hashText(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
