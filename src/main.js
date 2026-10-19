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
import { VERSION } from './version.js';

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
      document.body.classList.add('pacing'); // 剧情暂停：别的按钮都点不到（D-101）
      break;
    }
  }
  if (!queue.length) {
    document.body.classList.remove('pacing');
    output.append(Object.assign(document.createElement('div'), { className: 'gap' }));
    refreshQuick();
  }
  output.scrollTop = output.scrollHeight;
}

function flush() {
  while (queue.length) pump();
}

/** 剧情暂停时点了别处：让"点击或按空格继续"闪一下，提示该点哪里（D-101） */
function nudge() {
  if (!moreMarker) return;
  moreMarker.classList.remove('nudge');
  void moreMarker.offsetWidth; // 重新触发动画
  moreMarker.classList.add('nudge');
  moreMarker.addEventListener('animationend', (e) => e.target.classList.remove('nudge'), { once: true });
}

let choiceBox = null;

function render({ cls, text, n, cmd, disabled, blocked }) {
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
    if (blocked) b.classList.add('blocked'); // 灰色但能点：点了说明原因（D-099）
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
  // 剧情逐段显示、停在"点击或按空格继续"时，不接受别的命令（D-101）。以前会先把剩下的剧情一口气倒完再执行
  if (queue.length) { nudge(); return []; }
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
    tutorial('combat');
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
  if (r.shop) add('店铺', '@shop'); // 客栈卖吃喝（D-133）
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
  $('status-text').textContent = `${game.state.player.name}　气血 ${st.hp}/${st.maxHp}　内力 ${st.mp}/${st.maxMp}　潜能 ${st.potential}　${st.money} 文`;
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
  $('map-toggle').setAttribute('aria-pressed', String(open));
  // 地图隐藏时量不到尺寸，打开后重画一次，把当前位置滚到中间（D-093）
  if (open && game) refreshMap();
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

/** 游戏标题：报上姓名后是“姓名+英雄传”，之前只是“英雄传” */
function gameTitle() {
  const base = db?.meta.game?.props.title || '英雄传';
  return (game?.state.player.name ?? '') + base;
}
function showTitle() {
  document.title = `${gameTitle()} v${VERSION}`;
  $('title').textContent = gameTitle();
}

function start(state, isNew) {
  game = new Game(db, state);
  showTitle();
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
  // 剧情暂停中：回车只算"继续"，输入框里的字留着，等剧情走完再发（D-101）
  if (queue.length) { pump(); return; }
  if (!cmd) return;
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
  else if (cmd === '@shop') panels.open('shop');
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
$('char-toggle').addEventListener('click', () => { panels.open('char'); tutorial('char'); });
// 系统菜单（D-093）：导出、导入、新游戏收在这里；点了其中一项先关掉菜单
$('system-toggle').addEventListener('click', () => $('system-dialog').showModal());
$('system-close').addEventListener('click', () => $('system-dialog').close());
for (const id of ['btn-export', 'btn-import', 'btn-new']) $(id).addEventListener('click', () => $('system-dialog').close(), { capture: true });
$('journal-toggle').addEventListener('click', () => panels.open('journal'));

// 剧情暂停中：点文字区的任何地方（包括链接）都只算"继续"，不触发链接本身（D-101）
output.addEventListener('click', (e) => {
  if (!queue.length) return;
  e.preventDefault();
  e.stopPropagation();
  pump();
}, true);

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
  a.download = `${gameTitle()}-存档-${stamp}.txt`;
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

// ---- 首次教程（D-096）----

const TUTORIALS = {
  combat: {
    title: '第一次交手：刚、巧、守',
    html: `
<p>每一招都属于三种"势"之一，互相克制：</p>
<p class="tt-rule"><b class="st-刚">刚</b> 克 <b class="st-守">守</b>　·　<b class="st-巧">巧</b> 克 <b class="st-刚">刚</b>　·　<b class="st-守">守</b> 克 <b class="st-巧">巧</b></p>
<ul>
<li>克制对手：伤害 ×1.5；被对手克制：伤害 ×0.5。</li>
<li>守势化解巧招时，还会反震对手。刚招打在守势上叫"破防"。</li>
<li>调息（0）：回一些内力，但这一回合没有架势，挨打会更疼。</li>
</ul>
<p><b>看清预兆</b>：每回合开始，对手会露出一个动作，比如"肩膀微微后撤""剑尖轻颤"。读出他要出哪种势，选克制它的那一招。</p>
<ul>
<li><b>虚招</b>：有的对手会故意摆出假架势。悟性越高，越容易察觉"气息与架势不合"。</li>
<li><b>藏招</b>：强敌有时什么都不露。悟性和天赋"慧眼"能帮你看穿。</li>
</ul>
<p>把鼠标停在招式上，能看到威力、内力和估算伤害。</p>`,
  },
  char: {
    title: '人物：潜能、经验与上限',
    html: `
<p><b>武功经验</b>：战斗中用哪门武功出招，哪门就长经验。经验条满了，自动升一级。对手越强，经验越多。</p>
<p><b>潜能</b>：打赢战斗、完成剧情和差事都会得到。在<b>旅店或本门驻地</b>可以花潜能"修炼"，直接把一门武功升一级。等级越高花得越多，悟性高能省一些。</p>
<p><b>上限</b>：每门武功都有等级上限，写在武功页里（如 10 / 50 级）。</p>
<ul>
<li>门派武功的上限随门派阶位提高；剧情传授的武学随剧情提高；武馆武功最高 50 级。</li>
<li>外功、轻功还不能超过你最高的内功等级 + 20。</li>
<li>到了上限，经验不再增长，也不能修炼。先提高上限（晋阶、推进剧情、练内功）再说。</li>
</ul>
<p><b>修为</b>衡量你的实战强度：刚、巧、守三势各自最狠一招的攻击值之和，加上气血上限的五分之一。主线的"建议修为"按同样的算法量敌人。<b>天赋点</b>来自门派晋阶（每升一阶 1 点）和主线（每条主线走到三成、七成左右和完结时各 1 点）。把鼠标停在武功名、先天属性上（手机上点一下）能看到说明。</p>`,
  },
};

/** 第一次遇到时弹出教程；每个角色只弹一次，记在存档里 */
function tutorial(key) {
  if (!game || !TUTORIALS[key]) return;
  game.state.tutorials ??= {};
  if (game.state.tutorials[key]) return;
  game.state.tutorials[key] = true;
  saveLocal(game.state);
  $('tutorial-title').textContent = TUTORIALS[key].title;
  $('tutorial-body').innerHTML = TUTORIALS[key].html;
  $('tutorial').showModal();
}
$('tutorial-ok').addEventListener('click', () => $('tutorial').close());

// ---- 启动 ----

/** 加载画面（D-094）：进度条 + 文字。加载完成或出错时处理 */
const loading = {
  set(pct, text) {
    $('ld-fill').style.width = `${Math.round(pct)}%`;
    $('loading').setAttribute('aria-valuenow', String(Math.round(pct)));
    if (text) $('ld-text').textContent = text;
  },
  done() { $('loading').classList.add('gone'); setTimeout(() => $('loading').remove(), 300); },
  fail(msg) { $('loading').classList.add('failed'); $('ld-text').textContent = msg; },
};
$('ld-ver').textContent = `v${VERSION}`;
$('version').textContent = `v${VERSION}`;
showTitle();

(async () => {
  loading.set(3, '正在读取存档……');
  const saved = loadLocal();
  try {
    // 内容文件占进度条的 5% ~ 95%
    db = await loadContent(startedStorylines(saved), 'content/', (done, total) => {
      loading.set(5 + (total ? (done / total) * 90 : 90), `正在载入江湖……（${done}/${total}）`);
    });
  } catch (err) {
    loading.fail('内容加载失败：' + err.message + '。如果是直接双击打开的 index.html，请改用本地服务器：python -m http.server 8000');
    return;
  }
  loading.set(97, '正在布置场景……');
  contentHash = hashText(JSON.stringify(db.index));
  const meta = db.meta.game;
  const valid = saved && db.room[saved.player.room];
  const state = valid ? saved : newState(meta.props.start);
  loading.set(100);
  loading.done();
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
