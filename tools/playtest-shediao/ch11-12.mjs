// 射雕第十一、十二章走查：node playtest.mjs（在仓库根目录或任何地方跑都行）
// 照 tools/playtest-xiaoao.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 四条路线：巧／内功／组队三条门槛路线，周伯通过招赢／输／不打，听箫四种帮法，默写三种做法，欧阳锋赢／输，
// 打输重来（蛇阵、欧阳克、船舱各输一次），门槛"现在还不行"、船来回。

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const imp = (p) => import(pathToFileURL(join(REPO, p)).href);
const { parse, addBlocks, emptyDb } = await imp('src/content.js');
const { newState } = await imp('src/save.js');
const { Game } = await imp('src/game.js');

const root = join(REPO, 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];

const problems = [];
const VERBOSE = !!process.env.PLAYTEST_VERBOSE;
const note = (s) => problems.push(s);

function newGame({ skills = {}, maxhpBoost = 0 } = {}) {
  const db = emptyDb();
  const warn = console.warn; console.warn = () => {};
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  console.warn = warn;
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  if (maxhpBoost) st.player.attrs.根骨 += maxhpBoost;
  // 前十章走完
  st.flags['shediao.started'] = true;
  st.flags['shediao.raid'] = true;
  for (let i = 1; i <= 10; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  const g = new Game(db, st);
  g.enter('linan.station');
  return g;
}

function ex(g, cmd, label) {
  const out = g.exec(cmd);
  if (VERBOSE) for (const o of out) console.log(`    [${o.cls}] ${o.text}`);
  for (const o of out) if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`);
  return out;
}

function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（人在 ${g.state.player.room}）`); return false; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return false; }
  if (VERBOSE) console.log(`  > ${g.dialog[i].text}`);
  ex(g, String(i + 1), label);
  return true;
}
const has = (g, substr) => !!g.dialog?.some((c) => c.text.includes(substr));

function win(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) {
      if (u.side === 'e' && u.hp > 0) u.hp = 1;
      if (u.isPlayer) { u.mp = u.maxMp; u.hp = u.maxHp; }
    }
    ex(g, '1', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没打完`);
}
function lose(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = 1e9; } // 敌人不倒：免得 NPC 队友替你打赢
    ex(g, '0', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没输掉`);
}

const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, label) => { if (!flag(g, f)) note(`${label}：应当设下标记 ${f}，却没有`); };
const expectNoFlag = (g, f, label) => { if (flag(g, f)) note(`${label}：不该有标记 ${f}`); };
const expectRoom = (g, r, label) => { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); };
const expectSkill = (g, id, label) => { if (g.state.player.skills[id] === undefined) note(`${label}：应当学会 ${id}，却没有`); };
const expectCap = (g, id, n, label) => { if ((g.state.player.skillcap?.[id] ?? 0) < n) note(`${label}：${id} 上限应当 ≥ ${n}，却是 ${g.state.player.skillcap?.[id]}`); };
const expectGoal = (g, name, label) => {
  const goals = Object.values(g.db.goal).filter((x) => x.props.storyline === 'shediao' && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean)));
  if (!goals.some((x) => x.props.name === name)) note(`${label}：当前目标应当有「${name}」，现有：${goals.map((x) => x.props.name).join('、') || '（空）'}`);
};

// ---------------- 片段 ----------------

function walkToRiver(g, label) {
  ex(g, '东', label);      // 临安车马行 → 城外官道
  ex(g, '东南', label);    // → 牛家村村口
  ex(g, '东', label);      // → 村中小路
  ex(g, '东', label);      // → 郭杨两家
  ex(g, '东', label);      // → 江边
  expectRoom(g, 'shediao.niujia.river', label + '（走到江边）');
}

/** 江边 → 桃花岛 → 桃林迷路 → 岩洞，周伯通教完功夫 */
function toCave(g, label, { zhou = 'win', first = true } = {}) {
  if (first) {
    if (!g.dialog) note(`${label}：到江边没有触发第十一章开场`);
    pick(g, '上船', label);
    expectFlag(g, 'shediao.ch11', label);
    if (g.state.checkpoint?.chapter !== 'shediao.11') note(`${label}：第十一章检查点没有设下`);
  }
  expectRoom(g, 'shediao.thd.beach', label);
  expectGoal(g, '桃林', label);
  ex(g, '北', label);
  pick(g, '等着', label);
  pick(g, '循着笑声', label);
  expectRoom(g, 'shediao.thd.cave', label);
  expectFlag(g, 'shediao.c11_lost', label);
  if (zhou === 'skip') { pick(g, '晚辈不敢', label); pick(g, '……', label); }
  else {
    pick(g, '陪他过两招', label);
    if (zhou === 'win') { win(g, label + '/周伯通'); } else { lose(g, label + '/周伯通（允许输）'); }
    expectRoom(g, 'shediao.thd.cave', label + '（周伯通过招之后人还在洞里）');
    pick(g, '……', label);
  }
  pick(g, '再问问他的来历', label);
  pick(g, '那部九阴真经', label);
  pick(g, '想学', label);
  expectSkill(g, 'shediao.kongming', label);
  pick(g, '天黑了', label);
  expectSkill(g, 'shediao.jiuyin', label);
  expectFlag(g, 'shediao.c11_zhou', label);
  if (g.dialog) note(`${label}：周伯通那段说完了对话还开着`);
}

/** 从岩洞回桃林，过迷阵（how: qiao / inner / party） */
function maze(g, label, how) {
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '西', label);
  expectRoom(g, 'shediao.thd.wood', label);
  const opt = { qiao: '踩着树梢', inner: '调匀气息', party: '和同伴' }[how];
  pick(g, opt, label + `（门槛：${how}）`);
  if (how === 'party') g.party = null;
  expectFlag(g, 'shediao.c11_maze', label);
  if (!g.exits()['北'] || !g.exits()['西']) note(`${label}：过了迷阵，桃林没有往北、往西的路`);
}

function tomb(g, label) {
  ex(g, '西', label);
  expectRoom(g, 'shediao.thd.tomb', label);
  pick(g, '问她', label);
  expectFlag(g, 'shediao.c11_tomb', label);
  ex(g, '东', label);
  if (g.dialog) note(`${label}：从墓回桃林又弹了对话`);
}

/** 桃林 → 积翠亭：蛇阵、欧阳克、三道试题 */
function pavilion(g, label, { xiao, loseSnake = false, loseKe = false } = {}) {
  ex(g, '北', label);
  expectRoom(g, 'shediao.thd.pavilion', label);
  pick(g, '……', label);
  pick(g, '迎上去', label);
  if (loseSnake) { lose(g, label + '/蛇阵（故意打输）'); return 'lost'; }
  win(g, label + '/蛇阵');
  expectFlag(g, 'shediao.c11_snake', label);
  pick(g, '我来领教', label);
  if (loseKe) { lose(g, label + '/欧阳克（故意打输）'); return 'lost'; }
  win(g, label + '/欧阳克');
  expectFlag(g, 'shediao.c11_ke', label);
  pick(g, '……', label);          // ke_won → test1
  pick(g, '……', label);          // test1 → test2
  const opts = { pai: '桃枝', kong: '贴着他的耳朵', count: '数自己的心跳', none: '不出手' };
  if (!flag(g, 'shediao.c11_tomb') && has(g, opts.count)) note(`${label}：没去冯蘅墓，听箫时却有"数心跳"这个选项`);
  if (flag(g, 'shediao.c11_tomb') && !has(g, opts.count)) note(`${label}：去过冯蘅墓，听箫时却没有"数心跳"这个选项`);
  pick(g, opts[xiao], label);
  expectFlag(g, `shediao.c11_xiao_${xiao}`, label);
  pick(g, '……', label);          // → test2_end
  pick(g, '……', label);          // → test3
  pick(g, '……', label);          // → zhou_out
  pick(g, '……', label);          // → end
  pick(g, '准备上船', label);
  expectFlag(g, 'shediao.ch11_done', label);
  expectCap(g, 'shediao.luoying', 50, label);
  expectGoal(g, '花船', label);
  return 'ok';
}

/** 海滩 → 花船 → 大船：默写、船舱、甲板、欧阳锋 */
function ship(g, label, { write, feng = 'win', loseCabin = false, loseDeck = false, resail = false } = {}) {
  if (!resail) {
    ex(g, '南', label); ex(g, '南', label);
    expectRoom(g, 'shediao.thd.beach', label);
    pick(g, '上船', label);
    expectFlag(g, 'shediao.ch12', label);
    if (g.state.checkpoint?.chapter !== 'shediao.12') note(`${label}：第十二章检查点没有设下`);
  }
  expectRoom(g, 'shediao.sea.deck', label);
  pick(g, '跟着进船舱', label);
  expectRoom(g, 'shediao.sea.cabin', label);
  const opts = { fake: '颠三倒四', true: '照实写下', blank: '一个字也不写' };
  pick(g, opts[write], label);
  expectFlag(g, `shediao.c12_${write}`, label);
  for (const w of ['fake', 'true', 'blank']) if (w !== write) expectNoFlag(g, `shediao.c12_${w}`, label);
  pick(g, '……', label);
  pick(g, '撞开舱门', label);
  if (loseCabin) { lose(g, label + '/船舱（故意打输）'); return 'lost'; }
  win(g, label + '/船舱');
  pick(g, '冲上甲板', label);
  expectRoom(g, 'shediao.sea.deck', label);
  pick(g, '抢小艇', label);
  if (loseDeck) { lose(g, label + '/甲板（故意打输）'); return 'lost'; }
  win(g, label + '/甲板');
  expectFlag(g, 'shediao.c12_deck', label);
  pick(g, '……', label);
  pick(g, '挡在七公前面', label);
  if (feng === 'win') win(g, label + '/欧阳锋（硬要打赢）'); else lose(g, label + '/欧阳锋（允许输）');
  expectFlag(g, 'shediao.c12_feng', label);
  if (feng === 'win' && g.state.checkpoint?.chapter !== 'shediao.12') note(`${label}：打赢欧阳锋后检查点不对`);
  pick(g, '……', label);
  pick(g, '爬上小船', label);
  expectRoom(g, 'shediao.sea.isle', label);
  pick(g, '回去告诉他们', label);
  expectFlag(g, 'shediao.c12_isle', label);
  expectGoal(g, '岛北', label);
  return 'ok';
}

/** 荒岛：撬石（how: qiao / hp / party）、传棒、木筏、靠岸 */
function isle(g, label, how, { notyet = false } = {}) {
  if (how === 'party' && !notyet) g.party = { members: [{ id: 'friend' }] }; // 选项在开对话那一刻过滤
  ex(g, '北', label);
  expectRoom(g, 'shediao.sea.rock', label);
  pick(g, '走到巨石另一边', label);
  if (notyet) {
    if (!has(g, '现在还抬不动')) note(`${label}：功力不够时没有"现在还抬不动"`);
    pick(g, '现在还抬不动', label);
    pick(g, '先回去', label);
    ex(g, '南', label);
    expectRoom(g, 'shediao.sea.isle', label + '（门槛不锁人）');
    ex(g, '对话 小船', label);
    pick(g, '划回牛家村', label);
    expectRoom(g, 'shediao.niujia.river', label + '（小船回大陆）');
    if (g.dialog) note(`${label}：没撬完石头回到江边却弹了对话`);
    ex(g, '对话 船家', label);
    pick(g, '去那座荒岛', label);
    expectRoom(g, 'shediao.sea.isle', label + '（船家送回荒岛）');
    return;
  }
  const opt = { qiao: '钻进石缝', hp: '肩膀顶住', party: '一人撬一头' }[how];
  pick(g, opt, label + `（门槛：${how}）`);
  if (how === 'party') g.party = null;
  expectFlag(g, 'shediao.c12_rock', label);
  ex(g, '南', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.sea.cave', label);
  pick(g, '……', label);
  pick(g, '去帮他们扎木筏', label);
  expectRoom(g, 'shediao.niujia.river', label + '（木筏靠岸）');
  pick(g, '好', label);
  expectFlag(g, 'shediao.ch12_done', label);
  expectCap(g, 'shediao.kongming', 45, label);
  expectCap(g, 'shediao.jiuyin', 35, label);
  expectGoal(g, '御厨的菜', label);
}

/** 章节完成后：船家、哑仆、小船来回 */
function afterwards(g, label) {
  if (g.dialog) note(`${label}：章末之后还有对话开着`);
  ex(g, '对话 船家', label);
  if (!has(g, '去那座荒岛')) note(`${label}：章末之后船家没有去荒岛的选项`);
  pick(g, '去桃花岛', label);
  expectRoom(g, 'shediao.thd.beach', label + '（第十二章之后还能去桃花岛）');
  if (g.dialog) note(`${label}：第十二章之后到海滩还弹对话`);
  for (const d of ['北', '东', '西', '西', '东', '北', '南', '南']) ex(g, d, label + '（岛上走一圈）');
  expectRoom(g, 'shediao.thd.beach', label);
  if (g.dialog) note(`${label}：第十二章之后在岛上走动还弹对话`);
  ex(g, '对话 哑仆', label);
  if (has(g, '上那条花船')) note(`${label}：花船都沉了，哑仆还让上花船`);
  pick(g, '坐船回牛家村', label);
  expectRoom(g, 'shediao.niujia.river', label);
  ex(g, '对话 船家', label);
  pick(g, '去那座荒岛', label);
  expectRoom(g, 'shediao.sea.isle', label);
  for (const d of ['北', '南', '东', '西']) ex(g, d, label + '（荒岛走一圈）');
  if (g.dialog) note(`${label}：第十二章之后在荒岛上还弹对话`);
  ex(g, '对话 小船', label);
  pick(g, '划回牛家村', label);
  expectRoom(g, 'shediao.niujia.river', label);
}

// ---------------- 路线 A：巧；周伯通打赢；去冯蘅墓，数心跳；跟着改经；欧阳锋打赢；巧撬石 ----------------
{
  const label = '路线A';
  const g = newGame({ skills: { 'shediao.luoying': 70 } });
  walkToRiver(g, label);
  toCave(g, label, { zhou: 'win' });
  maze(g, label, 'qiao');
  tomb(g, label);
  pavilion(g, label, { xiao: 'count' });
  ship(g, label, { write: 'fake', feng: 'win' });
  isle(g, label, 'qiao');
  afterwards(g, label);
}

// ---------------- 路线 B：内功；周伯通打输；门槛不够先回去；蛇阵、欧阳克各输一次；空字诀；照实写；船舱输一次；欧阳锋打输；硬扛巨石 ----------------
{
  const label = '路线B';
  const g = newGame();
  walkToRiver(g, label);
  toCave(g, label, { zhou: 'lose' });
  // 门槛不够
  ex(g, '西', label);
  if (!has(g, '现在还走不出去')) note(`${label}：功力不够时没有"现在还走不出去"`);
  if (has(g, '踩着树梢') || has(g, '调匀气息') || has(g, '和同伴')) note(`${label}：功力不够却列出了过门槛的选项`);
  pick(g, '现在还走不出去', label);
  pick(g, '先回去', label);
  expectNoFlag(g, 'shediao.c11_maze', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.thd.beach', label + '（门槛不锁人）');
  ex(g, '对话 哑仆', label);
  pick(g, '坐船回牛家村', label);
  expectRoom(g, 'shediao.niujia.river', label);
  g.state.player.skills['base.tuna'] = 55; // 回去练了内功
  ex(g, '对话 船家', label);
  pick(g, '去桃花岛', label);
  expectRoom(g, 'shediao.thd.beach', label);
  ex(g, '北', label);
  pick(g, '调匀气息', label + '（门槛：内功）');
  expectFlag(g, 'shediao.c11_maze', label);
  // 蛇阵输一次
  if (pavilion(g, label, { xiao: 'kong', loseSnake: true }) === 'lost') {
    expectRoom(g, 'shediao.niujia.river', label + '（打输回到江边）');
    expectFlag(g, 'shediao.ch11', label + '（打输之后）');
    expectNoFlag(g, 'shediao.c11_lost', label + '（打输之后）');
    expectGoal(g, '桃林', label + '（打输之后）');
    if (g.state.player.skills['shediao.kongming'] === undefined) note(`${label}：打输之后空明拳丢了`);
  }
  ex(g, '对话 船家', label);
  pick(g, '去桃花岛', label);
  toCave(g, label + '（重来）', { zhou: 'win', first: false });
  maze(g, label + '（重来）', 'inner');
  // 欧阳克输一次
  pavilion(g, label + '（重来）', { xiao: 'kong', loseKe: true });
  expectRoom(g, 'shediao.niujia.river', label + '（欧阳克打输回到江边）');
  expectNoFlag(g, 'shediao.c11_snake', label + '（欧阳克打输之后）');
  ex(g, '对话 船家', label);
  pick(g, '去桃花岛', label);
  toCave(g, label + '（再来）', { zhou: 'skip', first: false });
  maze(g, label + '（再来）', 'inner');
  pavilion(g, label + '（再来）', { xiao: 'kong' });
  // 第十二章：船舱输一次
  ship(g, label, { write: 'true', loseCabin: true });
  expectRoom(g, 'shediao.thd.beach', label + '（船舱打输回到海滩）');
  expectFlag(g, 'shediao.ch12', label + '（船舱打输之后）');
  expectNoFlag(g, 'shediao.c12_board', label + '（船舱打输之后）');
  expectNoFlag(g, 'shediao.c12_true', label + '（船舱打输之后，默写的标记回滚）');
  expectGoal(g, '花船', label + '（船舱打输之后）');
  ex(g, '对话 哑仆', label);
  pick(g, '上那条花船', label);
  pick(g, '上船', label);
  ship(g, label + '（重来）', { write: 'true', feng: 'lose', resail: true });
  // 撬石：先不够，再加气血
  isle(g, label, 'hp', { notyet: true });
  g.state.player.attrs.根骨 += 2000;
  if (g.hpMax() < 1000) note(`${label}：测试没把气血上限抬到 1000（${g.hpMax()}）`);
  ex(g, '北', label);
  expectRoom(g, 'shediao.sea.rock', label);
  if (!g.dialog) note(`${label}：回到乱石坡没有直接弹出撬石的对话`);
  pick(g, '肩膀顶住', label + '（门槛：气血）');
  expectFlag(g, 'shediao.c12_rock', label);
  ex(g, '南', label);
  ex(g, '东', label);
  pick(g, '……', label);
  pick(g, '去帮他们扎木筏', label);
  pick(g, '好', label);
  expectFlag(g, 'shediao.ch12_done', label);
  afterwards(g, label);
}

// ---------------- 路线 C：组队；不和周伯通打；敲桃枝；一个字不写；甲板输一次；组队撬石 ----------------
{
  const label = '路线C';
  const g = newGame();
  walkToRiver(g, label);
  // 先不上船
  pick(g, '过几天再来', label);
  expectNoFlag(g, 'shediao.ch11', label);
  ex(g, '对话 船家', label);
  pick(g, '去桃花岛', label);   // 还没开章：走开场
  toCave(g, label, { zhou: 'skip' });
  maze(g, label, 'party');
  pavilion(g, label, { xiao: 'pai' });
  ship(g, label, { write: 'blank', loseDeck: true });
  expectRoom(g, 'shediao.thd.beach', label + '（甲板打输回到海滩）');
  expectNoFlag(g, 'shediao.c12_cabin', label);
  // 重来：海滩触发要走一步才响，这里先往北再回来
  ex(g, '北', label);
  ex(g, '南', label);
  pick(g, '上船', label);
  ship(g, label + '（重来）', { write: 'blank', feng: 'win', resail: true });
  isle(g, label, 'party');
  afterwards(g, label);
}

// ---------------- 路线 D：巧；不去墓；不出手；跟着改经 ----------------
{
  const label = '路线D';
  const g = newGame({ skills: { 'shediao.luoying': 60 } });
  walkToRiver(g, label);
  toCave(g, label, { zhou: 'win' });
  maze(g, label, 'qiao');
  pavilion(g, label, { xiao: 'none' });
  g.state.player.skills['shediao.luoying'] = 70;
  ship(g, label, { write: 'fake', feng: 'lose' });
  isle(g, label, 'qiao');
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 射雕第十一、十二章四条路线走通：三种门槛（各两处）、周伯通打赢／打输／不打、听箫四种帮法、默写三种做法、欧阳锋打赢／打输、四场必胜战打输重来、门槛不够时回大陆再来、章后船来回');
