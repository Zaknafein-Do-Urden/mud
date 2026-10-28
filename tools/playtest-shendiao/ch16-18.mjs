// 神雕第十六、十七、十八章走查：node tools/playtest-shendiao/ch16-18.mjs（在任意目录运行）
// 照 tools/playtest-shediao/ch19-20.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记手动设：射雕全线、神雕第一~十五章完成；别的章节在共享房间里的触发条件（c05_*、c07_* 等）按"已经走过"设好。
// 第十五章、第七章的房间若还没写，脚本里补替身房间（见 stub()），汇报里说明。

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
const stubs = [];
const verbose = !!process.env.PLAYTEST_VERBOSE;
const note = (s) => problems.push(s);

// 第七章（城头、郭府）如果还没写，补替身
const STUB = `
=== room: shendiao.xy.wall
name: 襄阳·城头（替身）
exits: 西南=xiangyang.center
---
替身房间。

=== room: shendiao.xy.guofu
name: 襄阳·郭府（替身）
exits: 东南=xiangyang.center
---
替身房间。

=== patch: xiangyang.center
exits: 东北=shendiao.xy.wall, 西北=shendiao.xy.guofu
`;

let DB = null;
function loadDb() {
  if (DB) return DB;
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  if (!db.room['shendiao.xy.wall'] || !db.room['shendiao.xy.guofu']) {
    addBlocks(db, parse(STUB, 'stub.md'), 'stub.md');
    stubs.push('城头 / 郭府（第七章还没写）');
  }
  DB = db;
  return db;
}

const SHEDIAO_DONE = ['c20_up', 'c20_qiu', 'c20_night', 'c20_ou', 'c19_rear', 'c19_march'];
// 别的章节在共享房间里的触发条件：按"已经走过"设好
const OTHERS = ['c05_meet', 'c05_hong', 'c05_tie', 'c05_cross', 'c05_end', 'c07_raid', 'c07_wall', 'c07_guard', 'c10_back', 'c10_boy', 'c14_ready'];

function newGame({ skills = {}, flags = {}, items = {}, hp = 0 } = {}) {
  const db = loadDb();
  // 每局用一份新的 db 拷贝没有必要：引擎不改 db
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  st.flags['shediao.started'] = true;
  st.flags['shendiao.started'] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (const f of SHEDIAO_DONE) st.flags[`shediao.${f}`] = true;
  for (let i = 1; i <= 15; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  for (const f of OTHERS) st.flags[`shendiao.${f}`] = true;
  Object.assign(st.flags, flags);
  Object.assign(st.player.inventory, items);
  const g = new Game(db, st);
  if (hp) { while (g.hpMax() < hp) st.player.attrs.根骨 += 5; }
  return g;
}

let lastText = '';
function ex(g, cmd, label) {
  const out = g.exec(cmd);
  lastText = out.map((o) => o.text).join('\n');
  for (const o of out) if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`);
  if (verbose) for (const o of out) if (o.cls === 'err' || o.cls === 'sys') console.log(`      [${o.cls}] ${o.text}`);
  return out;
}
function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（人在 ${g.state.player.room}）`); return false; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return false; }
  ex(g, String(i + 1), label);
  return true;
}
const has = (g, substr) => !!g.dialog?.some((c) => c.text.includes(substr));
const saw = (want, label) => { if (!lastText.includes(want)) note(`${label}：应当看到含「${want}」的一句，没有`); };
const notSaw = (w, label) => { if (lastText.includes(w)) note(`${label}：不该看到含「${w}」的一句`); };

function win(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  let all = '';
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) {
      if (u.side === 'e' && u.hp > 0) u.hp = 1;
      if (u.isPlayer) { u.mp = u.maxMp; u.hp = u.maxHp; }
    }
    ex(g, '1', label); all += lastText + '\n';
  }
  lastText = all;
  if (g.state.battle) note(`${label}：六十回合还没打完`);
}
function lose(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  let all = '';
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = 1e9; }
    ex(g, '0', label); all += lastText + '\n';
  }
  lastText = all;
  if (g.state.battle) note(`${label}：六十回合还没输掉`);
}

const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, label) => { if (!flag(g, f)) note(`${label}：应当设下标记 ${f}，却没有`); };
const expectNoFlag = (g, f, label) => { if (flag(g, f)) note(`${label}：标记 ${f} 不该在`); };
const expectRoom = (g, r, label) => { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); };
function expectCap(g, id, n, label) { if ((g.state.player.skillcap?.[id] ?? 0) < n) note(`${label}：${id} 的上限应当 ≥ ${n}，是 ${g.state.player.skillcap?.[id]}`); }
function goal(g) {
  return Object.values(g.db.goal).filter((x) => /^shendiao\.goal\.c1[678]\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const noDialog = (g, label) => { if (g.dialog) note(`${label}：不该弹出对话（${g.dialog.map((c) => c.text).join(' / ')}）`); };

const QIAO = 'shendiao.tanzhi'; // 巧类外功
const INNER = 'quanzhen.xinfa'; // 内功
const withParty = (g) => { g.party = { members: [{ id: 'friend' }] }; };
const noParty = (g) => { g.party = null; };

// ================= 第十六章 =================

function c16open(g, label) {
  g.enter('xiangyang.center');
  ex(g, '东北', label);
  expectRoom(g, 'shendiao.xy.wall', label);
  expectFlag(g, 'shendiao.ch16', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.16') note(`${label}：检查点没有设到第十六章`);
  pick(g, '听她说', label);
  pick(g, '今夜出城', label);
  expectGoal(g, 'shendiao.goal.c16.1', label);
}
function c16field(g, label, { losePatrol = false } = {}) {
  ex(g, '北', label);
  expectRoom(g, 'shendiao.mg.field', label);
  pick(g, '迎上去', label);
  if (losePatrol) return;
  win(g, label + '/巡哨');
  expectFlag(g, 'shendiao.c16_field', label);
  expectGoal(g, 'shendiao.goal.c16.2', label);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.mg.camp', label);
}
function c16fu(g, label) {
  ex(g, '东', label);
  expectRoom(g, 'shendiao.mg.pen', label);
  ex(g, '对话 樊城老汉', label);
  pick(g, '割断绳子', label);
  expectFlag(g, 'shendiao.c16_fu', label);
  ex(g, '西', label);
}
function c16gate(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.mg.gate', label);
  const opts = { qiao: '横木一掠而过', inner: '车底下混进去', party: '学狼叫' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还进不去')) note(`${label}：满足门槛时不该出现"现在还进不去"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, 'shendiao.c16_in', label);
  expectRoom(g, 'shendiao.mg.inner', label + '（过场把人带进内营）');
}
function c16inner(g, label, { ask, winLun, loseBreak = false }) {
  pick(g, ask ? '叫她跟你走' : '有什么话', label);
  expectFlag(g, ask ? 'shendiao.c16_ask' : 'shendiao.c16_word', label);
  pick(g, '……', label);
  pick(g, '接他的金轮', label);
  if (winLun) win(g, label + '/金轮（允许输，打赢）'); else lose(g, label + '/金轮（允许输，打输）');
  expectRoom(g, 'shendiao.mg.inner', label + '（金轮打完人还在帐前）');
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c16_lun', label);
  expectGoal(g, 'shendiao.goal.c16.4', label);
  ex(g, '南', label);
  expectRoom(g, 'shendiao.mg.gate', label);
  pick(g, '和黄蓉一起杀出去', label);
  if (loseBreak) return;
  win(g, label + '/怯薛千夫长');
  expectFlag(g, 'shendiao.c16_out', label);
  pick(g, '跟黄蓉上城头', label);
  expectRoom(g, 'shendiao.xy.wall', label + '（过场回城头）');
  saw(ask ? '有人会来' : '一辈子都不认他', label + '（城头读 c16_ask/word）');
  pick(g, '看城外', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch16_done', label);
  expectCap(g, 'shendiao.tanzhi', 100, label);
  expectCap(g, 'shediao.kongming', 130, label);
  expectGoal(g, 'shendiao.goal.c16.6', label);
}

// ================= 第十七章 =================

function c17open(g, label) {
  ex(g, '北', label);
  expectRoom(g, 'shendiao.mg.field', label);
  expectFlag(g, 'shendiao.ch17', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.17') note(`${label}：检查点没有设到第十七章`);
  pick(g, '冲向高台', label);
  expectRoom(g, 'shendiao.mg.tai', label + '（过场到高台下）');
}
function c17base(g, label, { loseIt = false } = {}) {
  pick(g, '和郭靖一起闯过去', label);
  if (loseIt) { lose(g, label + '/达尔巴（故意打输）'); return; }
  win(g, label + '/达尔巴');
  expectFlag(g, 'shendiao.c17_base', label);
  pick(g, '往台上爬', label);
}
function c17climb(g, label, how) {
  const opts = { qiao: '烤焦的横梁', hp: '冒着火硬顶', party: '一个托一个' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还上不去')) note(`${label}：满足门槛时不该出现"现在还上不去"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, 'shendiao.c17_up', label);
  expectRoom(g, 'shendiao.mg.taitop', label + '（过场上台顶）');
}
function c17top(g, label, { reach, loseLun = false, loseQ = false, fu, c07, sword = true }) {
  pick(g, '和杨过一起迎上去', label);
  if (loseLun) { lose(g, label + '/金轮（故意打输）'); return; }
  win(g, label + '/金轮');
  pick(g, reach ? '伸手去拉他' : '先抱起郭襄', label);
  expectFlag(g, reach ? 'shendiao.c17_reach' : 'shendiao.c17_carry', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c17_lun', label);
  pick(g, '……', label);
  expectRoom(g, 'shendiao.mg.field', label + '（过场回阵前）');
  pick(g, '和小龙女一起挡住怯薛', label);
  if (loseQ) { lose(g, label + '/怯薛（故意打输）'); return; }
  win(g, label + '/怯薛');
  if (fu) saw('樊城老汉', label + '（读 c16_fu）'); else { saw('小旗', label + '（没有 c16_fu）'); notSaw('樊城老汉', label); }
  expectFlag(g, 'shendiao.c17_khan', label);
  pick(g, '……', label);
  pick(g, '回城', label);
  expectRoom(g, 'shendiao.xy.guofu', label + '（过场回郭府）');
  const want = { truth: '照实说了', silent: '一个字也没说', lie: '病死的', none: '破窑算起' }[c07];
  saw(want, label + `（读 c07：${c07}）`);
  for (const [k, w] of Object.entries({ truth: '照实说了', silent: '一个字也没说', lie: '病死的', none: '破窑算起' })) if (k !== c07) notSaw(w, label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch17_done', label);
  if (!g.state.player.inventory['shendiao.xuantie_jian']) note(`${label}：没拿到玄铁重剑`);
  if (!sword) delete g.state.player.inventory['shendiao.xuantie_jian']; // 模拟玄铁剑不在身上
  expectCap(g, 'shendiao.xuantie', 120, label);
  expectCap(g, 'shendiao.tianluo', 120, label);
  expectCap(g, 'shediao.jiuyin', 130, label);
  expectGoal(g, 'shendiao.goal.c17.6', label);
}

// ================= 第十八章 =================

const ALL140 = ['shendiao.tianluo', 'shendiao.tanzhi', 'shendiao.xuantie', 'shediao.yangqiang', 'shediao.yuenv', 'quanzhen.jianfa', 'quanzhen.xinfa', 'shediao.nanshan', 'quanzhen.jinyan', 'shediao.luoying', 'shediao.kongming', 'shediao.jiuyin', 'shediao.cuijian'];

function c18open(g, label) {
  g.enter('changan.station');
  ex(g, '东', label);
  expectRoom(g, 'huashan.gate', label);
  ex(g, '东', label);
  expectRoom(g, 'huashan.cliff', label);
  expectFlag(g, 'shendiao.ch18', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.18') note(`${label}：检查点没有设到第十八章`);
  pick(g, '跟上那串脚印', label);
  expectGoal(g, 'shendiao.goal.c18.1', label);
}
function c18ridge(g, label, { loseIt = false } = {}) {
  ex(g, '东', label);
  expectRoom(g, 'shediao.hsj.ridge', label);
  pick(g, '动手', label);
  if (loseIt) { lose(g, label + '/潇湘子（故意打输）'); return; }
  win(g, label + '/潇湘子');
  expectFlag(g, 'shendiao.c18_ridge', label);
  ex(g, '北', label);
  expectRoom(g, 'shediao.hsj.top', label);
}
function c18top(g, label, { bury, ceiling }) {
  saw(bury ? '亲手堆的' : '杨过后来回到华山', label + '（读 c05_bury）');
  saw(ceiling ? '你也看过的' : '谁也说不清', label + '（读 c04_ceiling）');
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c18_top', label);
  expectGoal(g, 'shendiao.goal.c18.3', label);
}
function c18path(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '西北', label);
  expectRoom(g, 'shendiao.hs.path', label);
  const opts = { qiao: '脚尖在苔藓上', inner: '贴着石壁', party: '用绳子连在一起' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还过不去')) note(`${label}：满足门槛时不该出现"现在还过不去"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, 'shendiao.c18_cross', label);
  expectRoom(g, 'shendiao.hs.ya', label);
}
function c18rest(g, label, { loseThief = false, self, spar, needle, c17, mu, hero, sword }) {
  pick(g, '迎上去', label);
  if (loseThief) { lose(g, label + '/尹克西（故意打输）'); return; }
  win(g, label + '/尹克西');
  expectFlag(g, 'shendiao.c18_thief', label);
  pick(g, '押回绝顶', label);
  expectGoal(g, 'shendiao.goal.c18.5', label);
  ex(g, '东', label);
  ex(g, '东南', label);
  expectRoom(g, 'shediao.hsj.top', label);
  pick(g, '……', label);
  const s = { guard: '守城的', witness: '看着的人', road: '还在路上' }[self];
  pick(g, s, label);
  expectFlag(g, `shendiao.c18_self_${self}`, label);
  pick(g, '……', label);
  saw(mu ? '我娘病得起不来床' : '破窑算起', label + '（读 c01_mu）');
  if (spar === 'win') { pick(g, '跟他过几招', label); win(g, label + '/杨过（允许输，打赢）'); pick(g, '……', label); }
  else if (spar === 'lose') { pick(g, '跟他过几招', label); lose(g, label + '/杨过（允许输，打输）'); pick(g, '……', label); }
  else pick(g, '不比了', label);
  pick(g, '……', label);
  const nw = { tell: '你说留着吧', quiet: '你没替她拿主意', none: '最后一根' }[needle];
  saw(nw, label + `（读 c13_needle：${needle}）`);
  saw(c17 === 'reach' ? '你去拉那个和尚' : '你先抱起了我', label + '（读 c17_reach/carry）');
  expectFlag(g, 'shendiao.c18_lun', label);
  expectGoal(g, 'shendiao.goal.c18.6', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.hsj.ridge', label);
  noDialog(g, label + '（北峰下）');
  ex(g, '西', label);
  expectRoom(g, 'huashan.cliff', label);
  if (sword) {
    if (has(g, '听她说下去')) note(`${label}：有剑时不该出现"听她说下去"`);
    pick(g, '把玄铁重剑交给黄蓉', label);
    expectFlag(g, 'shendiao.c18_sword', label);
    if (g.state.player.inventory['shendiao.xuantie_jian']) note(`${label}：剑交出去了还在包里`);
  } else {
    if (has(g, '交给黄蓉')) note(`${label}：没剑时不该出现"交给黄蓉"`);
    pick(g, '听她说下去', label);
  }
  pick(g, '……', label);
  for (const w of ['倚天', '屠龙', '九阳']) if (lastText.includes(w)) note(`${label}：黄蓉说破了「${w}」`);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch18_done', label);
  saw('全篇终', label);
  const hw = { live: '活下去的', word: '说话算话的', seek: '你还在找' }[hero];
  if (hw) saw(hw, label + '（读 c19_hero）');
  for (const id of ALL140) expectCap(g, id, 140, label);
  expectGoal(g, 'shendiao.goal.c18.7', label);
  noDialog(g, label + '（收尾之后）');
  // 章节之后还回得去
  ex(g, '西', label);
  expectRoom(g, 'huashan.gate', label + '（下山）');
  ex(g, '东', label); noDialog(g, label + '（再上苍龙岭）');
  ex(g, '东', label); ex(g, '北', label); noDialog(g, label + '（再上绝顶）');
  ex(g, '西北', label); expectRoom(g, 'shendiao.hs.path', label + '（章节之后崖沿还在）'); noDialog(g, label);
  ex(g, '西', label); expectRoom(g, 'shendiao.hs.ya', label); noDialog(g, label);
}

// ---------------- 路线 1：巧；劝郭襄走、金轮打赢；放民夫；拉金轮；c07_truth；守城的；和杨过打赢；c13_needle_tell；有剑；c01_mu、c05_bury、c04_ceiling；c19_hero_live ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { [QIAO]: 185 }, flags: { 'shendiao.c07_truth': true, 'shendiao.c13_needle_tell': true, 'shendiao.c13_needle_kept': true, 'shendiao.c01_mu': true, 'shendiao.c05_bury': true, 'shendiao.c04_ceiling': true, 'shediao.c19_hero_live': true } });
  c16open(g, label); c16field(g, label); c16fu(g, label); c16gate(g, label, 'qiao'); c16inner(g, label, { ask: true, winLun: true });
  // 章节之后：民夫营的老汉不在了
  c17open(g, label); c17base(g, label); c17climb(g, label, 'qiao'); c17top(g, label, { reach: true, fu: true, c07: 'truth' });
  c18open(g, label); c18ridge(g, label); c18top(g, label, { bury: true, ceiling: true }); c18path(g, label, 'qiao');
  c18rest(g, label, { self: 'guard', spar: 'win', needle: 'tell', c17: 'reach', mu: true, hero: 'live', sword: true });
}

// ---------------- 路线 2：内功／气血；带话、金轮打输；不放民夫；抱郭襄；c07_silent；记着的人；输给杨过；c13_needle_quiet；没剑；c19_hero_word ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { [INNER]: 140 }, hp: 2300, flags: { 'shendiao.c07_silent': true, 'shendiao.c13_needle_quiet': true, 'shendiao.c13_needle_kept': true, 'shediao.c19_hero_word': true } });
  c16open(g, label); c16field(g, label); c16gate(g, label, 'inner'); c16inner(g, label, { ask: false, winLun: false });
  c17open(g, label); c17base(g, label); c17climb(g, label, 'hp'); c17top(g, label, { reach: false, fu: false, c07: 'silent', sword: false });
  c18open(g, label); c18ridge(g, label); c18top(g, label, { bury: false, ceiling: false }); c18path(g, label, 'inner');
  c18rest(g, label, { self: 'witness', spar: 'lose', needle: 'quiet', c17: 'carry', mu: false, hero: 'word', sword: false });
}

// ---------------- 路线 3：组队；c07_lie；还在路上；不和杨过打；没有第十三章标记；c19_hero_seek ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'shendiao.c07_lie': true, 'shediao.c19_hero_seek': true } });
  c16open(g, label); c16field(g, label); c16gate(g, label, 'party'); c16inner(g, label, { ask: true, winLun: false });
  c17open(g, label); c17base(g, label); pick(g, '现在还上不去', label); pick(g, '先退下来', label); withParty(g); ex(g, '西', label); ex(g, '东', label); // 先退下来，带上队友再进来
  c17climb(g, label, 'party'); c17top(g, label, { reach: true, fu: false, c07: 'lie' });
  c18open(g, label); c18ridge(g, label); c18top(g, label, { bury: false, ceiling: false }); c18path(g, label, 'party');
  c18rest(g, label, { self: 'road', spar: 'skip', needle: 'none', c17: 'reach', mu: false, hero: 'seek', sword: true });
}

// ---------------- 路线 4：门槛不够不锁人；每场必胜战打输重来；没有第七章标记 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { [QIAO]: 185 }, hp: 0 });
  c16open(g, label);
  // 巡哨打输
  c16field(g, label, { losePatrol: true });
  lose(g, label + '/巡哨（故意打输）');
  expectRoom(g, 'xiangyang.inn', label + '（打输回到客栈）');
  expectFlag(g, 'shendiao.ch16', label + '（ch16 保留，不重演开场）');
  noDialog(g, label + '（回到检查点）');
  ex(g, '东', label); ex(g, '东北', label); noDialog(g, label + '（重上城头不重演开场）');
  c16field(g, label + '（重来）');
  // 门槛不够
  g.state.player.skills[QIAO] = 50;
  ex(g, '北', label);
  if (!has(g, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"`);
  pick(g, '现在还进不去', label); pick(g, '先退回外营', label);
  ex(g, '南', label); expectRoom(g, 'shendiao.mg.camp', label + '（门槛不锁人）');
  g.state.player.skills[QIAO] = 185;
  c16gate(g, label, 'qiao');
  c16inner(g, label, { ask: false, winLun: true, loseBreak: true });
  lose(g, label + '/怯薛千夫长（故意打输）');
  expectRoom(g, 'xiangyang.inn', label);
  expectNoFlag(g, 'shendiao.c16_lun', label + '（回滚）');
  ex(g, '东', label); ex(g, '东北', label);
  c16field(g, label + '（再来）'); c16gate(g, label + '（再来）', 'qiao'); c16inner(g, label + '（再来）', { ask: false, winLun: true });
  // 第十七章：达尔巴打输
  c17open(g, label); c17base(g, label, { loseIt: true });
  expectRoom(g, 'xiangyang.inn', label + '（第十七章打输回客栈）');
  expectFlag(g, 'shendiao.ch17', label);
  ex(g, '东', label); ex(g, '东北', label); ex(g, '北', label); noDialog(g, label + '（重来不重演阵前开场）');
  // 门槛不够（对话打开时就过滤选项，所以先把功力降下来）
  g.state.player.skills[QIAO] = 50;
  ex(g, '东', label); c17base(g, label + '（重来）');
  pick(g, '现在还上不去', label); pick(g, '先退下来', label);
  ex(g, '西', label); expectRoom(g, 'shendiao.mg.field', label + '（第十七章门槛不锁人）');
  g.state.player.skills[QIAO] = 185;
  ex(g, '东', label);
  c17climb(g, label, 'qiao');
  c17top(g, label, { loseLun: true });
  expectRoom(g, 'xiangyang.inn', label + '（金轮打输回客栈）');
  expectNoFlag(g, 'shendiao.c17_base', label + '（回滚）');
  ex(g, '东', label); ex(g, '东北', label); ex(g, '北', label); ex(g, '东', label);
  c17base(g, label + '（再来）'); c17climb(g, label + '（再来）', 'qiao');
  c17top(g, label + '（再来）', { reach: false, loseQ: true });
  expectRoom(g, 'xiangyang.inn', label + '（怯薛打输回客栈）');
  ex(g, '东', label); ex(g, '东北', label); ex(g, '北', label); ex(g, '东', label);
  c17base(g, label + '（三来）'); c17climb(g, label + '（三来）', 'qiao');
  c17top(g, label + '（三来）', { reach: false, fu: false, c07: 'none' });
  // 第十八章：潇湘子打输
  c18open(g, label); c18ridge(g, label, { loseIt: true });
  expectRoom(g, 'huashan.gate', label + '（第十八章打输回玉泉院）');
  ex(g, '东', label); noDialog(g, label + '（重来不重演苍龙岭开场）');
  c18ridge(g, label + '（重来）');
  c18top(g, label, { bury: false, ceiling: false });
  g.state.player.skills[QIAO] = 50;
  ex(g, '西北', label);
  if (!has(g, '现在还过不去')) note(`${label}：功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回绝顶', label);
  ex(g, '东南', label); expectRoom(g, 'shediao.hsj.top', label + '（第十八章门槛不锁人）');
  g.state.player.skills[QIAO] = 185;
  c18path(g, label, 'qiao');
  c18rest(g, label, { loseThief: true });
  expectRoom(g, 'huashan.gate', label + '（尹克西打输回玉泉院）');
  expectNoFlag(g, 'shendiao.c18_ridge', label + '（回滚）');
  ex(g, '东', label);
  c18ridge(g, label + '（再来）'); c18top(g, label + '（再来）', { bury: false, ceiling: false }); c18path(g, label + '（再来）', 'qiao');
  c18rest(g, label + '（再来）', { self: 'guard', spar: 'skip', needle: 'none', c17: 'carry', mu: false, hero: null, sword: true });
}

if (stubs.length) console.log('（用了替身：' + stubs.join('、') + '）');
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 神雕第十六、十七、十八章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来），三处门槛三条路，七场必胜战打输重来，金轮、杨过两场允许输的赢输，c16_fu、c07 三种与无、c13 金针两种与无、c17 拉／抱、c05_bury、c04_ceiling、c01_mu、c19_hero 三种的有无，玄铁剑有／无');
