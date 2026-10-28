// 倚天第五到八章走查：node tools/playtest-yitian/ch05-08.mjs（在任意目录运行）
// 照 tools/playtest-shendiao/ch16-18.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记手动设：射雕、神雕全线，倚天第一~四章完成。

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
const verbose = !!process.env.PLAYTEST_VERBOSE;
const note = (s) => problems.push(s);

let DB = null;
function loadDb() {
  if (DB) return DB;
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  DB = db;
  return db;
}

function newGame({ skills = {}, flags = {}, items = {}, hp = 0 } = {}) {
  const db = loadDb();
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  for (const s of ['shediao', 'shendiao', 'yitian']) st.flags[`${s}.started`] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (let i = 1; i <= 18; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  st.flags['shendiao.c18_thief'] = true;
  for (let i = 1; i <= 4; i++) { st.flags[`yitian.ch${i}`] = true; st.flags[`yitian.ch${i}_done`] = true; }
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

function fight(g, label, wantWin) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  let all = '';
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) {
      if (wantWin) { if (u.side === 'e' && u.hp > 0) u.hp = 1; if (u.isPlayer) { u.mp = u.maxMp; u.maxHp = Math.max(u.maxHp, 1e6); u.hp = u.maxHp; } }
      else { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = 1e9; }
    }
    ex(g, wantWin ? '1' : '0', label); all += lastText + '\n';
  }
  lastText = all;
  if (g.state.battle) note(`${label}：六十回合还没打完`);
}
const win = (g, l) => fight(g, l, true);
const lose = (g, l) => fight(g, l, false);

const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, label) => { if (!flag(g, f)) note(`${label}：应当设下标记 ${f}，却没有`); };
const expectNoFlag = (g, f, label) => { if (flag(g, f)) note(`${label}：标记 ${f} 不该在`); };
const expectRoom = (g, r, label) => { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); };
function expectCap(g, id, n, label) { if ((g.state.player.skillcap?.[id] ?? 0) < n) note(`${label}：${id} 的上限应当 ≥ ${n}，是 ${g.state.player.skillcap?.[id]}`); }
function goal(g) {
  return Object.values(g.db.goal).filter((x) => /^yitian\.goal\.c0[5-8]\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const noDialog = (g, label) => { if (g.dialog) note(`${label}：不该弹出对话（${g.dialog.map((c) => c.text).join(' / ')}）`); };
const checkpoint = (g, ch, label) => { if (g.state.checkpoint?.chapter !== ch) note(`${label}：检查点没有设到 ${ch}`); };

const QIAO = 'shendiao.tanzhi'; // 巧类外功
const INNER = 'quanzhen.xinfa'; // 内功
const withParty = (g) => { g.party = { members: [{ id: 'friend' }] }; };
const noParty = (g) => { g.party = null; };

// 门槛：opts 是 { qiao, inner/hp, party } 的选项文字
function gate(g, label, how, opts, notyet) {
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, notyet)) note(`${label}：满足门槛时不该出现"${notyet}"`);
  pick(g, opts[how], label);
  noParty(g);
}

// ================= 第五章 =================

function c05open(g, label, tulong) {
  g.enter('fuzhou.station');
  ex(g, '东', label);
  expectRoom(g, 'yitian.hai.dock', label);
  expectFlag(g, 'yitian.ch5', label);
  checkpoint(g, 'yitian.5', label);
  const w = { watch: '你在城头上，看着', guard: '你护着他往城南杀', wall: '你在城头的另一边', none: '总得去看一眼' }[tulong];
  saw(w, label + `（读 c03_tulong：${tulong}）`);
  pick(g, '上船', label);
  expectRoom(g, 'yitian.hai.wp_beach', label + '（过场到南滩）');
}
function c05beach(g, label, { loseIt = false } = {}) {
  pick(g, '动手', label);
  if (loseIt) { lose(g, label + '/元广波（故意打输）'); return; }
  win(g, label + '/元广波');
  expectFlag(g, 'yitian.c05_beach', label);
  expectGoal(g, 'yitian.goal.c05.2', label);
}
function c05tai(g, label, { secret, xieWin }) {
  ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'yitian.hai.wp_tai', label);
  saw(secret ? '你认得它' : '那种黑', label + '（读 c03_secret）');
  pick(g, '再看下去', label);
  pick(g, '……', label);
  pick(g, '运气护住心脉', label);
  if (xieWin) win(g, label + '/谢逊（允许输，打赢）'); else lose(g, label + '/谢逊（允许输，打输）');
  expectRoom(g, 'yitian.hai.wp_tai', label + '（谢逊打完人还在扬刀坪）');
  saw(xieWin ? '能站着的人' : '还醒着', label + '（谢逊输赢的文字）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.c05_xie', label);
  expectGoal(g, 'yitian.goal.c05.3', label);
}
function c05cliff(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '北', label);
  expectRoom(g, 'yitian.hai.wp_cliff', label);
  gate(g, label, how, { qiao: '抓住崖上的老藤', inner: '运气封住耳窍', party: '互相捂住耳朵' }, '现在还下不去');
  expectFlag(g, 'yitian.c05_cross', label);
  expectRoom(g, 'yitian.hai.wp_cove', label + '（过场下到北湾）');
}
function c05cove(g, label, { loseIt = false, boat }) {
  pick(g, '迎上去', label);
  if (loseIt) { lose(g, label + '/麦鲸（故意打输）'); return; }
  win(g, label + '/麦鲸');
  expectFlag(g, 'yitian.c05_cove', label);
  pick(g, boat ? '解开缆绳' : '不追了', label);
  expectFlag(g, boat ? 'yitian.c05_boat' : 'yitian.c05_island', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch5_done', label);
  expectCap(g, 'shediao.kongming', 150, label);
  expectGoal(g, 'yitian.goal.c05.5', label);
  noDialog(g, label + '（收尾之后）');
  // 回码头，章节之后还回得去
  ex(g, '上', label); ex(g, '南', label); ex(g, '南', label); ex(g, '南', label); noDialog(g, label + '（回南滩）');
  ex(g, '西南', label); expectRoom(g, 'yitian.hai.dock', label + '（坐船回码头）');
  ex(g, '东北', label); expectRoom(g, 'yitian.hai.wp_beach', label + '（章节之后还能去岛上）'); noDialog(g, label);
  ex(g, '西南', label); ex(g, '西', label); expectRoom(g, 'fuzhou.station', label);
}

// ================= 第六章 =================

function c06open(g, label, { boat, self, answer }) {
  g.enter('xiangyang.station');
  ex(g, '西', label);
  expectRoom(g, 'wudang.gate', label);
  expectFlag(g, 'yitian.ch6', label);
  checkpoint(g, 'yitian.6', label);
  saw(boat ? '船尾那个黄头发' : '北湾的碎石滩', label + '（读 c05_boat/island）');
  pick(g, '上紫霄宫', label);
  expectRoom(g, 'wudang.hall', label + '（过场上紫霄宫）');
  c06ask(g, label, { self, answer });
}
function c06ask(g, label, { self, answer }) {
  const sw = { guard: '他是守城的', witness: '他是看着的人', road: '他还在路上', none: '他说了什么我没听清' }[self];
  saw(sw, label + `（读 shendiao.c18_self：${self}）`);
  pick(g, { me: '是我', heir: '先人', none: '不答' }[answer], label);
  expectFlag(g, `yitian.c06_${answer}`, label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.c06_ask', label);
  expectGoal(g, 'yitian.goal.c06.2', label);
}
function c06back(g, label, craneWin) {
  ex(g, '南', label); ex(g, '西', label); ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'yitian.wd.back', label);
  pick(g, '把孩子放下', label);
  if (craneWin) win(g, label + '/鹤笔翁（允许输，打赢）'); else lose(g, label + '/鹤笔翁（允许输，打输）');
  expectRoom(g, 'yitian.wd.back', label + '（鹤笔翁打完人还在松崖）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.c06_crane', label);
  expectGoal(g, 'yitian.goal.c06.3', label);
}
function c06guest(g, label, { loseIt = false, answer, heard }) {
  ex(g, '南', label); ex(g, '南', label); ex(g, '东', label); ex(g, '北', label); ex(g, '东', label);
  expectRoom(g, 'yitian.wd.guest', label);
  pick(g, '和张翠山一起', label);
  if (loseIt) { lose(g, label + '/西华子（故意打输）'); return; }
  win(g, label + '/西华子');
  expectFlag(g, 'yitian.c06_guest', label);
  pick(g, '听他问下去', label);
  pick(g, '……', label);
  if (answer === 'me') saw('这只手伸出去拦一个人', label + '（读 c06_me）'); else notSaw('这只手伸出去拦一个人', label);
  pick(g, '……', label);
  expectGoal(g, 'yitian.goal.c06.4', label);
  ex(g, '北', label);
  expectRoom(g, 'yitian.wd.side', label);
  saw(heard ? '你们听的是同一部经' : '一夜一夜念给他听', label + '（读 c01_heard）');
  pick(g, '守一夜', label);
  expectFlag(g, 'yitian.ch6_done', label);
  expectCap(g, 'quanzhen.jianfa', 150, label);
  expectCap(g, 'quanzhen.xinfa', 150, label);
  expectGoal(g, 'yitian.goal.c06.5', label);
  noDialog(g, label + '（收尾之后）');
}

// ================= 第七章 =================

function c07open(g, label, answer) {
  ex(g, '南', label); ex(g, '西', label); ex(g, '南', label);
  expectRoom(g, 'wudang.gate', label);
  expectFlag(g, 'yitian.ch7', label);
  checkpoint(g, 'yitian.7', label);
  const w = { me: '八十年前你护着我师父', heir: '你家先人当年护着', none: '没有再说别的' }[answer];
  saw(w, label + `（读 c06_${answer}）`);
  pick(g, '下山', label);
  expectGoal(g, 'yitian.goal.c07.1', label);
  ex(g, '东', label);
  ex(g, '西南', label);
  expectRoom(g, 'yitian.hd.road', label);
}
function c07road(g, label, { loseIt = false } = {}) {
  pick(g, '迎上去', label);
  if (loseIt) { lose(g, label + '/元军百夫长（故意打输）'); return; }
  win(g, label + '/元军百夫长');
  expectFlag(g, 'yitian.c07_road', label);
}
function c07valley(g, label, { truth }) {
  ex(g, '东', label);
  expectFlag(g, 'yitian.c07_mouth', label);
  ex(g, '东', label);
  expectRoom(g, 'yitian.hd.hut', label);
  pick(g, truth ? '照实说' : '只说是个可怜孩子', label);
  saw(truth ? '殷天正的外孙' : '你救常大哥就好了', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.c07_hu', label);
  expectGoal(g, 'yitian.goal.c07.3', label);
}
function c07garden(g, label, { loseIt = false, mieWin, secret, sword, answer }) {
  ex(g, '北', label);
  expectRoom(g, 'yitian.hd.garden', label);
  pick(g, '站到两个孩子前面', label);
  if (loseIt) { lose(g, label + '/丁敏君（故意打输）'); return; }
  win(g, label + '/丁敏君');
  expectFlag(g, 'yitian.c07_ding', label);
  ex(g, '东', label);
  expectRoom(g, 'yitian.hd.grove', label);
  pick(g, '拦住她', label);
  saw(secret ? '你守了一辈子' : sword ? '亲手交到黄蓉怀里' : '四个家丁抬得满头大汗', label + '（读 c03_secret / c18_sword）');
  pick(g, '护住不悔', label);
  if (mieWin) win(g, label + '/灭绝（允许输，打赢）'); else lose(g, label + '/灭绝（允许输，打输）');
  expectRoom(g, 'yitian.hd.grove', label + '（灭绝打完人还在竹林）');
  expectFlag(g, mieWin ? 'yitian.c07_mie_won' : 'yitian.c07_mie_lost', label);
  pick(g, '……', label);
  const w = { me: '她说那人有一天会再来', heir: '大概是你家的什么人', none: '其中一个……罢了' }[answer];
  saw(w, label + `（灭绝读 c06_${answer}）`);
  pick(g, '去扶纪晓芙', label);
  pick(g, '答应她', label);
  expectFlag(g, 'yitian.ch7_done', label);
  expectCap(g, 'shendiao.tianluo', 150, label);
  expectCap(g, 'yitian.jiuyang', 60, label);
  expectGoal(g, 'yitian.goal.c07.5', label);
  noDialog(g, label + '（收尾之后）');
  ex(g, '西', label); ex(g, '南', label); ex(g, '西', label); ex(g, '西', label); ex(g, '东北', label);
  expectRoom(g, 'xiangyang.station', label + '（出谷回襄阳）');
  noDialog(g, label);
}

// ================= 第八章 =================

function c08open(g, label, { loseIt = false } = {}) {
  g.enter('chengdu.station');
  ex(g, '西北', label);
  expectRoom(g, 'yitian.kl.road', label);
  expectFlag(g, 'yitian.ch8', label);
  checkpoint(g, 'yitian.8', label);
  pick(g, '动手', label);
  if (loseIt) { lose(g, label + '/昆仑弟子（故意打输）'); return; }
  win(g, label + '/昆仑弟子');
  expectFlag(g, 'yitian.c08_kunlun', label);
}
function c08yang(g, label, mieWin) {
  ex(g, '北', label);
  expectRoom(g, 'yitian.kl.zuowang', label);
  saw(mieWin ? '空手夹住剑脊' : '倚天剑留下的', label + '（读 c07_mie）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.c08_yang', label);
  ex(g, '南', label); ex(g, '西', label);
  expectRoom(g, 'yitian.kl.zhu', label);
}
function c08zhu(g, label, warn) {
  pick(g, warn ? '告诉无忌' : '不说破', label);
  expectFlag(g, warn ? 'yitian.c08_warn' : 'yitian.c08_quiet', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.c08_zhu', label);
}
function c08cliff(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '北', label);
  expectRoom(g, 'yitian.kl.cliff', label);
  gate(g, label, how, { qiao: '踩着冰棱', hp: '顺着冰坡硬滑', party: '用绳子拴住' }, '现在还下不去');
  expectFlag(g, 'yitian.c08_cross', label);
  expectRoom(g, 'yitian.kl.gu.valley', label + '（过场下到谷底）');
}
function c08valley(g, label, { loseIt = false, heard, jiuyin }) {
  saw('华山舍身崖上', label + '（读神雕白猿）');
  pick(g, '帮他按住白猿', label);
  saw(heard ? '你听进去的那几句里' : '苍龙岭上', label + '（读 c01_heard）');
  if (jiuyin) saw('你读过九阴真经', label + '（读 learned:shediao.jiuyin）'); else notSaw('你读过九阴真经', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.c08_ape', label);
  pick(g, '去看看', label);
  pick(g, '迎上去', label);
  if (loseIt) { lose(g, label + '/朱长龄（故意打输）'); return; }
  win(g, label + '/朱长龄');
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch8_done', label);
  expectCap(g, 'yitian.jiuyang', 100, label);
  expectGoal(g, 'yitian.goal.c08.6', label);
  noDialog(g, label + '（收尾之后）');
  ex(g, '上', label); expectRoom(g, 'yitian.kl.cliff', label); noDialog(g, label);
  ex(g, '下', label); expectRoom(g, 'yitian.kl.gu.valley', label + '（章节之后谷底还在）'); noDialog(g, label);
  ex(g, '上', label); ex(g, '南', label); ex(g, '东', label); ex(g, '东南', label);
  expectRoom(g, 'chengdu.station', label + '（下山回成都）');
}

// ---------------- 路线 1：巧；c03_secret、tulong_watch；谢逊打赢、追船；守城的 → 是我；鹤笔翁打赢；c01_heard；照实说；灭绝打赢；点破；有玄铁标记；学过九阴 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { [QIAO]: 213, 'shediao.jiuyin': 50 }, flags: { 'yitian.c03_secret': true, 'yitian.c03_tulong_watch': true, 'shendiao.c18_self_guard': true, 'shendiao.c18_sword': true, 'yitian.c01_heard': true } });
  c05open(g, label, 'watch'); c05beach(g, label); c05tai(g, label, { secret: true, xieWin: true }); c05cliff(g, label, 'qiao'); c05cove(g, label, { boat: true });
  c06open(g, label, { boat: true, self: 'guard', answer: 'me' }); c06back(g, label, true); c06guest(g, label, { answer: 'me', heard: true });
  c07open(g, label, 'me'); c07road(g, label); c07valley(g, label, { truth: true }); c07garden(g, label, { mieWin: true, secret: true, answer: 'me' });
  c08open(g, label); c08yang(g, label, true); c08zhu(g, label, true); c08cliff(g, label, 'qiao'); c08valley(g, label, { heard: true, jiuyin: true });
}

// ---------------- 路线 2：内功／气血；tulong_guard；谢逊打输、留岛；记着的人 → 先人；鹤笔翁打输；可怜孩子；灭绝打输；不说破；交过玄铁 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { [INNER]: 150 }, hp: 2650, flags: { 'yitian.c03_tulong_guard': true, 'shendiao.c18_self_witness': true, 'shendiao.c18_sword': true } });
  c05open(g, label, 'guard'); c05beach(g, label); c05tai(g, label, { secret: false, xieWin: false }); c05cliff(g, label, 'inner'); c05cove(g, label, { boat: false });
  c06open(g, label, { boat: false, self: 'witness', answer: 'heir' }); c06back(g, label, false); c06guest(g, label, { answer: 'heir', heard: false });
  c07open(g, label, 'heir'); c07road(g, label); c07valley(g, label, { truth: false }); c07garden(g, label, { mieWin: false, secret: false, sword: true, answer: 'heir' });
  c08open(g, label); c08yang(g, label, false); c08zhu(g, label, false); c08cliff(g, label, 'hp'); c08valley(g, label, { heard: false, jiuyin: false });
}

// ---------------- 路线 3：组队；tulong_wall；还在路上 → 不答；没有前两部的可选标记 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'yitian.c03_tulong_wall': true, 'shendiao.c18_self_road': true } });
  c05open(g, label, 'wall'); c05beach(g, label); c05tai(g, label, { secret: false, xieWin: true }); c05cliff(g, label, 'party'); c05cove(g, label, { boat: true });
  c06open(g, label, { boat: true, self: 'road', answer: 'none' }); c06back(g, label, true); c06guest(g, label, { answer: 'none', heard: false });
  c07open(g, label, 'none'); c07road(g, label); c07valley(g, label, { truth: true }); c07garden(g, label, { mieWin: true, secret: false, sword: false, answer: 'none' });
  c08open(g, label); c08yang(g, label, true); c08zhu(g, label, true); c08cliff(g, label, 'party'); c08valley(g, label, { heard: false, jiuyin: false });
}

// ---------------- 路线 4：门槛不够不锁人；每场必胜战打输重来；没有 tulong 标记、没有 c18_self ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { [QIAO]: 213 } });
  // 第五章：元广波打输
  c05open(g, label, 'none'); c05beach(g, label, { loseIt: true });
  expectRoom(g, 'fuzhou.station', label + '（打输回福州车马行）');
  expectFlag(g, 'yitian.ch5', label + '（ch5 保留）');
  noDialog(g, label);
  ex(g, '东', label); noDialog(g, label + '（码头不重演开场）');
  ex(g, '东北', label); expectRoom(g, 'yitian.hai.wp_beach', label + '（自己坐船回岛）');
  c05beach(g, label + '（重来）');
  c05tai(g, label, { secret: false, xieWin: false });
  g.state.player.skills[QIAO] = 50;
  ex(g, '北', label);
  if (!has(g, '现在还下不去')) note(`${label}：功力不够时没有"现在还下不去"`);
  pick(g, '现在还下不去', label); pick(g, '先退回扬刀坪', label);
  ex(g, '南', label); expectRoom(g, 'yitian.hai.wp_tai', label + '（第五章门槛不锁人）');
  g.state.player.skills[QIAO] = 213;
  ex(g, '南', label); ex(g, '北', label); // 出去再进来不该重演
  noDialog(g, label + '（扬刀坪不重演）');
  c05cliff(g, label, 'qiao');
  c05cove(g, label, { loseIt: true });
  expectRoom(g, 'fuzhou.station', label + '（麦鲸打输回车马行）');
  expectNoFlag(g, 'yitian.c05_xie', label + '（回滚）');
  ex(g, '东', label); ex(g, '东北', label);
  c05beach(g, label + '（再来）'); c05tai(g, label + '（再来）', { secret: false, xieWin: true }); c05cliff(g, label + '（再来）', 'qiao');
  c05cove(g, label + '（再来）', { boat: false });
  // 第六章：西华子打输
  c06open(g, label, { boat: false, self: 'none', answer: 'me' }); c06back(g, label, true);
  c06guest(g, label, { loseIt: true });
  expectRoom(g, 'wudang.gate', label + '（第六章打输回玄岳门）');
  expectNoFlag(g, 'yitian.c06_me', label + '（回滚）');
  ex(g, '北', label);
  expectRoom(g, 'wudang.hall', label);
  c06ask(g, label + '（重来）', { self: 'none', answer: 'none' });
  c06back(g, label + '（重来）', false);
  c06guest(g, label + '（重来）', { answer: 'none', heard: false });
  // 第七章：百夫长、丁敏君各打输一次
  c07open(g, label, 'none'); c07road(g, label, { loseIt: true });
  expectRoom(g, 'xiangyang.station', label + '（第七章打输回襄阳车马行）');
  ex(g, '西南', label); expectRoom(g, 'yitian.hd.road', label);
  c07road(g, label + '（重来）'); c07valley(g, label, { truth: false });
  c07garden(g, label, { loseIt: true });
  expectRoom(g, 'xiangyang.station', label + '（丁敏君打输回车马行）');
  expectNoFlag(g, 'yitian.c07_hu', label + '（回滚）');
  ex(g, '西南', label); c07road(g, label + '（再来）'); c07valley(g, label + '（再来）', { truth: true });
  c07garden(g, label + '（再来）', { mieWin: false, secret: false, sword: false, answer: 'none' });
  // 第八章：昆仑弟子、朱长龄各打输一次；门槛不够
  c08open(g, label, { loseIt: true });
  expectRoom(g, 'chengdu.station', label + '（第八章打输回成都车马行）');
  ex(g, '西北', label); expectRoom(g, 'yitian.kl.road', label);
  pick(g, '动手', label); win(g, label + '/昆仑弟子（重来）');
  c08yang(g, label, false); c08zhu(g, label, false);
  g.state.player.skills[QIAO] = 50;
  ex(g, '北', label);
  if (!has(g, '现在还下不去')) note(`${label}：第八章功力不够时没有"现在还下不去"`);
  pick(g, '现在还下不去', label); pick(g, '先回山庄', label);
  ex(g, '南', label); expectRoom(g, 'yitian.kl.zhu', label + '（第八章门槛不锁人）');
  g.state.player.skills[QIAO] = 213;
  c08cliff(g, label, 'qiao');
  c08valley(g, label, { loseIt: true, heard: false, jiuyin: false });
  expectRoom(g, 'chengdu.station', label + '（朱长龄打输回成都）');
  expectNoFlag(g, 'yitian.c08_ape', label + '（回滚）');
  ex(g, '西北', label); pick(g, '动手', label); win(g, label + '/昆仑弟子（三来）');
  c08yang(g, label, false); c08zhu(g, label, true); c08cliff(g, label + '（再来）', 'qiao');
  c08valley(g, label + '（再来）', { heard: false, jiuyin: false });
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 倚天第五到八章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来），两处门槛三条路，七场必胜战打输重来，谢逊、鹤笔翁、灭绝三场允许输的赢输，c03_tulong 三种与无、c03_secret、c18_sword、c18_self 三种与无、c06 三种答法、c01_heard、学过九阴的有无，c05 追船／留岛、c07 照实／不说、c08 点破／不说');
