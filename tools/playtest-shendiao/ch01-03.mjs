// 神雕第一到三章走查：node tools/playtest-shendiao/ch01-03.mjs（在任意目录运行；PLAYTEST_VERBOSE=1 看过程）
// 照 tools/playtest-shediao/ch19-20.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置：射雕全线走完（shediao.ch1~ch20 及 _done）。射雕标记按路线给：c18_rumor、c18_mu_money / c18_mu_go、c12_fake / c12_true / c12_blank、
//       c11_tomb、c17_defend、c18_said_wangye、qiu_token（物品）、u.qiu_token.done。

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
const step = (s) => { if (verbose) console.log('  · ' + s); };
const note = (s) => problems.push(s);

function newGame({ skills = {}, flags = {}, items = {}, hp = 0 } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: Object.keys(skills).find((id) => db.skill[id]?.props.kind === '内功') ?? null,
    light: null,
  };
  st.player.money = 5000;
  st.flags['shediao.started'] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (const f of ['c11_lost', 'c11_zhou', 'c11_maze', 'c11_snake', 'c11_ke', 'c12_board', 'c17_land', 'c17_found', 'c17_won1', 'c18_kang', 'c18_ouyang', 'c18_in', 'c18_temple']) st.flags[`shediao.${f}`] = true;
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
const said = (s) => lastText.includes(s);

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
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = 1e9; }
    ex(g, '0', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没输掉`);
}

const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, label) => { if (!flag(g, f)) note(`${label}：应当设下标记 ${f}，却没有`); };
const expectNoFlag = (g, f, label) => { if (flag(g, f)) note(`${label}：标记 ${f} 不该在`); };
const expectRoom = (g, r, label) => { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); };
function expectCap(g, id, n, label) { if ((g.state.player.skillcap?.[id] ?? 0) < n) note(`${label}：${id} 的上限应当 ≥ ${n}，是 ${g.state.player.skillcap?.[id]}`); }
function goal(g) {
  return Object.values(g.db.goal).filter((x) => x.props.storyline === 'shendiao' && x.props.pre !== 'true' && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
function pre(g) {
  return Object.values(g.db.goal).filter((x) => x.props.storyline === 'shendiao' && x.props.pre === 'true' && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
const party = (g, on) => { g.party = on ? { members: [{ id: 'friend' }] } : null; };
const noDialog = (g, label) => { if (g.dialog) note(`${label}：不该弹出对话（${g.dialog.map((c) => c.text).join(' / ')}）`); };

// ---------------- 开端 ----------------

function hook(g, label, { rumor, decline = false }) {
  step(label + ' 开端');
  if (pre(g)[0] !== 'shendiao.pre.1') note(`${label}：开始前的提示应当是 pre.1，却是 ${pre(g).join(',')}`);
  g.enter('shediao.yy.lake');
  ex(g, '对话 茶摊老汉', label);
  const opt = rumor ? '雨里的道姑' : '陆家庄近来怎么样';
  if (has(g, rumor ? '陆家庄近来怎么样' : '雨里的道姑')) note(`${label}：茶摊出现了不该有的那条问法`);
  pick(g, opt, label);
  if (rumor && !said('十年前也是在这个棚子底下')) note(`${label}：读过传闻的没有"自己想起来"`);
  if (!rumor && !said('从早站到天亮')) note(`${label}：没读过传闻的，老汉没有把十年前的事讲一遍`);
  if (decline) {
    pick(g, '先不去', label);
    expectNoFlag(g, 'shendiao.started', label);
    if (pre(g)[0] !== 'shendiao.pre.2') note(`${label}：听过传闻后的提示应当是 pre.2`);
    ex(g, '对话 茶摊老汉', label);
    pick(g, opt, label);
  }
  pick(g, '去陆家庄看看', label);
  expectFlag(g, 'shendiao.started', label);
  expectGoal(g, 'shendiao.goal.c01.1', label);
  ex(g, '西南', label);
  expectRoom(g, 'jiaxing.center', label);
  ex(g, '西南', label);
  expectRoom(g, 'shendiao.jx.road', label);
  pick(g, '往陆家庄去', label);
  expectFlag(g, 'shendiao.ch1', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.1') note(`${label}：检查点没有设到第一章`);
}

// ---------------- 第一章 ----------------

const GATE1 = { qiao: '老桑树的枝杈', inner: '连门闩带铁链', party: '一个托着一个' };
function ch1gate(g, label, how) {
  if (how === 'party') party(g, true);
  ex(g, '西南', label);
  expectRoom(g, 'shendiao.jx.gate', label);
  for (const [k, v] of Object.entries(GATE1)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还进不去')) note(`${label}：满足门槛时不该出现"现在还进不去"`);
  pick(g, GATE1[how], label);
  party(g, false);
  expectFlag(g, 'shendiao.c01_in', label);
  expectRoom(g, 'shendiao.jx.hall', label + '（过场进正厅）');
  expectGoal(g, 'shendiao.goal.c01.2', label);
}

function ch1hall(g, label, { liWin, loseHong = false }) {
  pick(g, '……', label);
  pick(g, '拦住她们', label);
  if (loseHong) return;
  win(g, label + '/洪凌波');
  expectFlag(g, 'shendiao.c01_hong', label);
  pick(g, '迎上去', label);
  if (liWin) win(g, label + '/李莫愁'); else lose(g, label + '/李莫愁（允许输）');
  if (liWin) expectFlag(g, 'shendiao.c01_li_won', label); else expectNoFlag(g, 'shendiao.c01_li_won', label);
  for (let i = 0; i < 4; i++) pick(g, '……', label);
  expectFlag(g, 'shendiao.c01_lu', label);
  noDialog(g, label);
  expectGoal(g, 'shendiao.goal.c01.3', label);
}

function ch1rest(g, label, { garden, pay, mu, block, c12 }) {
  if (garden) {
    ex(g, '北', label);
    expectRoom(g, 'shendiao.jx.garden', label);
    pick(g, garden === 'stop' ? '按住他的手' : '由他去', label);
    expectFlag(g, 'shendiao.c01_wu', label);
    if (garden === 'let') expectFlag(g, 'shendiao.c01_wu_dug', label);
    pick(g, '离开后园', label);
    ex(g, '南', label);
  }
  ex(g, '东', label);
  ex(g, '东北', label);
  expectRoom(g, 'shendiao.jx.road', label);
  pick(g, pay ? '替他把鸡钱付了' : '不管闲事', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c01_kid_met', label);
  if (pay) expectFlag(g, 'shendiao.c01_paid', label);
  expectGoal(g, 'shendiao.goal.c01.4', label);
  ex(g, '南', label);
  expectRoom(g, 'shendiao.jx.kiln', label);
  pick(g, '问他叫什么名字', label);
  const want = { money: '一包银子', go: '送到岔路口' }[mu];
  if (want && !said(want)) note(`${label}：杨过没有说出娘讲过的那件事（${want}）`);
  if (!mu && (said('一包银子') || said('送到岔路口'))) note(`${label}：没有射雕穆念慈标记，杨过却认出了你`);
  if (g.dialog?.length !== 1) note(`${label}：破窑里"……"应当只剩一条（现有 ${g.dialog?.length}）`);
  pick(g, '……', label);
  if (mu) { expectFlag(g, 'shendiao.c01_mu', label); pick(g, '……', label); } else expectNoFlag(g, 'shendiao.c01_mu', label);
  expectFlag(g, 'shendiao.c01_kid', label);
  pick(g, '……', label);
  const crazy = { fake: '字是倒着的', true: '我烧错了', blank: '一个字都没写的人', none: '华山上，雪里头' };
  if (!said(crazy[c12])) note(`${label}：欧阳锋没有说出含「${crazy[c12]}」的疯话`);
  for (const [k, w] of Object.entries(crazy)) if (k !== c12 && said(w)) note(`${label}：欧阳锋多说了含「${w}」的那句`);
  pick(g, '……', label);
  if (block) { pick(g, '拦在孩子前面', label); pick(g, '……', label); } else pick(g, '由他教', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c01_ouyang', label);
  expectCap(g, 'shediao.cuijian', 110, label);
  expectGoal(g, 'shendiao.goal.c01.6', label);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.jx.road', label);
  pick(g, '……', label); pick(g, '……', label);
  if (mu && !said('他认得我娘')) note(`${label}：有 c01_mu 时杨过没有问你`);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch1_done', label);
  noDialog(g, label);
  expectGoal(g, 'shendiao.goal.c01.7', label);
  // 章节之后还能回陆家庄
  ex(g, '西南', label); expectRoom(g, 'shendiao.jx.gate', label + '（章节后回庄门）'); noDialog(g, label);
  ex(g, '西', label); noDialog(g, label); ex(g, '东', label); ex(g, '东北', label);
  ex(g, '东北', label); expectRoom(g, 'jiaxing.center', label + '（回城）');
}

// ---------------- 第二章 ----------------

const GATE2 = { qiao: '踩着礁石尖', hp: '硬生生从急流', party: '拉一根缆绳' };
function ch2start(g, label, { ferry = false } = {}) {
  step(label + ' 第二章');
  ex(g, '东北', label);
  expectRoom(g, 'shediao.yy.lake', label);
  ex(g, '对话 郭家的船老大', label);
  pick(g, ferry ? '去桃花岛' : '上船，去桃花岛', label);
  expectRoom(g, 'shediao.thd.beach', label);
  expectFlag(g, 'shendiao.ch2', label);
  if (!ferry && g.state.checkpoint?.chapter !== 'shendiao.2') note(`${label}：检查点没有设到第二章`);
}
function ch2(g, label, { plead, grab, how, promise, spar, wu, defend, tomb, loseReef = false }) {
  pick(g, '……', label);
  if (wu && !said('武三通')) note(`${label}：有 c01_wu 时没有想起陆家庄的武三通`);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c02_land', label);
  expectGoal(g, 'shendiao.goal.c02.2', label);
  ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'shediao.thd.pavilion', label);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.thd.house', label);
  pick(g, plead ? '替杨过说一句' : '不插嘴', label);
  if (plead) expectFlag(g, 'shendiao.c02_plead', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c02_study', label);
  expectGoal(g, 'shendiao.goal.c02.3', label);
  ex(g, '南', label); ex(g, '南', label); ex(g, '西', label);
  expectRoom(g, 'shediao.thd.tomb', label);
  if (tomb && !said('那时候坡上还没有这五座坟')) note(`${label}：有 c11_tomb 时没有回想`);
  if (!tomb && said('那时候坡上还没有这五座坟')) note(`${label}：没有 c11_tomb 却回想了`);
  if (defend !== said('只有你替蓉儿说了一句话')) note(`${label}：c17_defend 的台词不对`);
  pick(g, '……', label);
  pick(g, '赶过去', label);
  expectFlag(g, 'shendiao.c02_tomb', label);
  ex(g, '东', label); ex(g, '南', label); ex(g, '西', label);
  expectRoom(g, 'shendiao.thd.cove', label);
  pick(g, '……', label);
  pick(g, grab ? '攥住柯镇恶的铁杖' : '把杨过抱开', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c02_brawl', label);
  if (how === 'party') party(g, true);
  pick(g, '你去找他', label);
  for (const [k, v] of Object.entries(GATE2)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  pick(g, GATE2[how], label);
  party(g, false);
  expectRoom(g, 'shendiao.thd.reef', label);
  pick(g, '……', label); pick(g, '……', label);
  pick(g, '不叫他再说下去', label);
  if (loseReef) return;
  win(g, label + '/彭连虎');
  expectFlag(g, 'shendiao.c02_raid', label);
  pick(g, promise ? '答应他' : '不答应', label);
  if (promise) expectFlag(g, 'shendiao.c02_promise', label); else expectNoFlag(g, 'shendiao.c02_promise', label);
  pick(g, '……', label);
  expectGoal(g, 'shendiao.goal.c02.7', label);
  ex(g, '东', label); ex(g, '东', label); ex(g, '北', label); ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'shendiao.thd.house', label);
  pick(g, '……', label);
  if (spar === 'wine') pick(g, '陪他喝一碗酒', label);
  else { pick(g, '陪郭靖过几招', label); if (spar === 'win') win(g, label + '/郭靖切磋'); else lose(g, label + '/郭靖切磋（允许输）'); }
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch2_done', label);
  expectCap(g, 'shediao.luoying', 110, label);
  expectGoal(g, 'shendiao.goal.c02.8', label);
  // 离岛：郭家的船回南湖
  ex(g, '南', label); ex(g, '南', label); ex(g, '南', label);
  expectRoom(g, 'shediao.thd.beach', label);
  noDialog(g, label);
  ex(g, '对话 哑仆', label);
  pick(g, '坐郭家的船回嘉兴南湖', label);
  expectRoom(g, 'shediao.yy.lake', label + '（郭家的船回南湖）');
}

// ---------------- 第三章 ----------------

const GATE3 = { qiao: '踩着荆棘顶上', inner: '护住周身', party: '一个砍、一个压' };
function ch3start(g, label) {
  step(label + ' 第三章');
  g.enter('changan.station');
  ex(g, '南', label);
  expectRoom(g, 'quanzhen.gate', label);
  pick(g, '上山', label);
  expectFlag(g, 'shendiao.ch3', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.3') note(`${label}：检查点没有设到第三章`);
}
function ch3hall(g, label, { side, result, ch5 = true, token }) {
  ex(g, '南', label);
  expectRoom(g, 'quanzhen.hall', label);
  if (side === 'guo') { pick(g, '和郭靖并肩', label); pick(g, '闯阵', label); }
  else if (side === 'zhen') { pick(g, '站进阵里', label); pick(g, '接他的掌', label); }
  else pick(g, '护着杨过退到一边', label);
  if (side !== 'none') { if (result === 'win') win(g, `${label}/北斗阵（${side}）`); else lose(g, `${label}/北斗阵（${side}，允许输）`); }
  expectFlag(g, `shendiao.c03_side_${side}`, label);
  pick(g, '……', label);
  if (ch5 && !said('替处机往中都报信')) note(`${label}：马钰没有认出中都报信的人`);
  if (token === 'used' && !said('送了你一卷心法')) note(`${label}：用过信物的，马钰没提心法`);
  if (token === 'kept' && !said('贫道的铜牌你还留着')) note(`${label}：留着信物没用的，丘处机没提`);
  if (!token && !said('醉仙楼那碗酒')) note(`${label}：没有信物的，丘处机没提醉仙楼`);
  pick(g, '……', label);
  pick(g, '留在重阳宫住几天', label);
  pick(g, '……', label); pick(g, '……', label); pick(g, '……', label);
  expectFlag(g, 'shendiao.c03_flee', label);
  noDialog(g, label);
  expectGoal(g, 'shendiao.goal.c03.2', label);
}
function ch3rest(g, label, { how, shield, loseZhao = false }) {
  ex(g, '北', label);
  if (how === 'party') party(g, true);
  ex(g, '西', label);
  expectRoom(g, 'shendiao.gm.wood', label);
  for (const [k, v] of Object.entries(GATE3)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  pick(g, GATE3[how], label);
  party(g, false);
  expectRoom(g, 'shendiao.gm.deep', label);
  pick(g, '拦下他们', label);
  if (loseZhao) return;
  win(g, label + '/赵志敬');
  expectFlag(g, 'shendiao.c03_won', label);
  pick(g, '……', label); pick(g, '你是谁', label); pick(g, '跟上去', label);
  expectGoal(g, 'shendiao.goal.c03.4', label);
  ex(g, '西', label);
  expectRoom(g, 'shendiao.gm.gate', label);
  pick(g, '……', label);
  pick(g, shield ? '抢上去挡' : '揪住赵志敬', label);
  pick(g, '……', label); pick(g, '……', label); pick(g, '……', label);
  expectFlag(g, 'shendiao.ch3_done', label);
  expectCap(g, 'quanzhen.jianfa', 110, label);
  expectCap(g, 'quanzhen.xinfa', 110, label);
  // 第三章收尾直接带回墓门，第四章的开场接着弹出来（D-144）
  expectFlag(g, 'shendiao.ch4', label);
  if (!g.dialog) note(`${label}：第三章收尾后第四章开场没有接上`);
  g.endDialog();
  // 往返：后山能回山门、长安
  ex(g, '东', label); ex(g, '东', label); ex(g, '东', label);
  expectRoom(g, 'quanzhen.gate', label + '（章节之后能回山门）');
  noDialog(g, label);
  ex(g, '北', label); expectRoom(g, 'changan.station', label);
}

// ---------------- 路线 1：巧；读过传闻、给过银子、c12_fake、去过冯蘅墓、替黄蓉说过话、抖出过"小王爷"、用过信物 ----------------
{
  const label = '路线1';
  const g = newGame({
    skills: { 'shediao.cuijian': 145, 'shediao.luoying': 100, 'shediao.nanshan': 100, 'quanzhen.jianfa': 100, 'quanzhen.xinfa': 100 },
    flags: { 'shediao.c18_rumor': true, 'shediao.c18_mu_money': true, 'shediao.c12_fake': true, 'shediao.c11_tomb': true, 'shediao.c17_defend': true, 'shediao.c18_said_wangye': true, 'shediao.u.qiu_token.done': true },
    items: { 'shediao.qiu_token': 1 },
  });
  hook(g, label, { rumor: true });
  ch1gate(g, label, 'qiao');
  ch1hall(g, label, { liWin: true });
  ch1rest(g, label, { garden: 'stop', pay: true, mu: 'money', block: true, c12: 'fake' });
  ch2start(g, label);
  ch2(g, label, { plead: true, grab: true, how: 'qiao', promise: true, spar: 'win', wu: true, defend: true, tomb: true });
  if (g.state.player.inventory['shediao.qiu_token'] !== 1) note(`${label}：信物不该被收走`);
  ch3start(g, label);
  ch3hall(g, label, { side: 'guo', result: 'win', token: 'used' });
  ch3rest(g, label, { how: 'qiao', shield: true });
}

// ---------------- 路线 2：内功／气血；没读传闻、送她出城、c12_true、没去过冯蘅墓、信物没用过 ----------------
{
  const label = '路线2';
  const g = newGame({
    skills: { 'quanzhen.xinfa': 110, 'shediao.nanshan': 100 },
    flags: { 'shediao.c18_mu_go': true, 'shediao.c12_true': true },
    items: { 'shediao.qiu_token': 1 },
    hp: 1950,
  });
  hook(g, label, { rumor: false, decline: true });
  ch1gate(g, label, 'inner');
  ch1hall(g, label, { liWin: false });
  ch1rest(g, label, { garden: 'let', pay: false, mu: 'go', block: false, c12: 'true' });
  ch2start(g, label);
  ch2(g, label, { plead: false, grab: false, how: 'hp', promise: false, spar: 'lose', wu: true, defend: false, tomb: false });
  ch3start(g, label);
  ch3hall(g, label, { side: 'zhen', result: 'lose', token: 'kept' });
  ch3rest(g, label, { how: 'inner', shield: false });
}

// ---------------- 路线 3：组队；射雕标记都没有（老存档），c12_blank，不进后园，谁也不帮 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'shediao.c12_blank': true } });
  hook(g, label, { rumor: false });
  ch1gate(g, label, 'party');
  ch1hall(g, label, { liWin: true });
  ch1rest(g, label, { garden: null, pay: true, mu: null, block: false, c12: 'blank' });
  ch2start(g, label);
  ch2(g, label, { plead: true, grab: false, how: 'party', promise: true, spar: 'wine', wu: false, defend: false, tomb: false });
  ch3start(g, label);
  ch3hall(g, label, { side: 'none', token: null });
  ch3rest(g, label, { how: 'party', shield: true });
}

// ---------------- 路线 4：门槛不够时不锁人；三章必胜战各打输一次重来；没有第十二章标记 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { 'shediao.cuijian': 145 }, flags: { 'shediao.c18_mu_money': true } });
  hook(g, label, { rumor: false });
  // 第一章门槛不够
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '西南', label);
  if (!has(g, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"`);
  pick(g, '现在还进不去', label); pick(g, '先退开', label);
  ex(g, '东北', label); expectRoom(g, 'shendiao.jx.road', label + '（门槛不锁人）');
  noDialog(g, label);
  g.state.player.skills['shediao.cuijian'] = 145;
  ch1gate(g, label, 'qiao');
  ch1hall(g, label, { loseHong: true });
  lose(g, label + '/洪凌波（故意打输）');
  expectRoom(g, 'jiaxing.station', label + '（打输回到嘉兴车马行）');
  expectFlag(g, 'shendiao.ch1', label + '（ch1 保留）');
  expectNoFlag(g, 'shendiao.c01_in', label + '（回滚）');
  noDialog(g, label);
  ex(g, '北', label); ex(g, '西南', label); noDialog(g, label + '（岔路口开场不重演）');
  ch1gate(g, label + '（重来）', 'qiao');
  ch1hall(g, label + '（重来）', { liWin: false });
  ch1rest(g, label, { garden: null, pay: false, mu: 'money', block: false, c12: 'none' });
  // 第二章：外礁门槛不够、彭连虎打输
  ch2start(g, label);
  pick(g, '……', label); pick(g, '……', label);
  ex(g, '北', label); ex(g, '北', label); ex(g, '北', label);
  pick(g, '不插嘴', label); pick(g, '……', label); pick(g, '……', label);
  ex(g, '南', label); ex(g, '南', label); ex(g, '西', label);
  pick(g, '……', label); pick(g, '赶过去', label);
  ex(g, '东', label); ex(g, '南', label); ex(g, '西', label);
  pick(g, '……', label); pick(g, '把杨过抱开', label); pick(g, '……', label);
  g.state.player.skills['shediao.cuijian'] = 50;
  pick(g, '你去找他', label);
  if (!has(g, '现在还过不去')) note(`${label}：第二章功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回岸上', label);
  ex(g, '东', label); expectRoom(g, 'shediao.thd.beach', label + '（第二章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 145;
  ex(g, '西', label);
  pick(g, GATE2.qiao, label);
  expectRoom(g, 'shendiao.thd.reef', label);
  pick(g, '……', label); pick(g, '……', label); pick(g, '不叫他再说下去', label);
  lose(g, label + '/彭连虎（故意打输）');
  expectRoom(g, 'jiaxing.station', label + '（第二章打输回到嘉兴车马行）');
  expectFlag(g, 'shendiao.ch2', label); expectNoFlag(g, 'shendiao.c02_land', label);
  ex(g, '北', label);
  ch2start(g, label + '（重来）', { ferry: true });
  ch2(g, label + '（重来）', { plead: false, grab: true, how: 'qiao', promise: false, spar: 'wine', wu: false, defend: false, tomb: false });
  // 第三章：荆棘门槛不够、赵志敬打输
  ch3start(g, label);
  ch3hall(g, label, { side: 'guo', result: 'lose', token: null });
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '北', label); ex(g, '西', label);
  if (!has(g, '现在还过不去')) note(`${label}：第三章功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回来', label);
  ex(g, '东', label); expectRoom(g, 'quanzhen.gate', label + '（第三章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 145;
  ex(g, '南', label); noDialog(g, label + '（门槛之后重阳宫不重演）');
  ch3rest(g, label, { how: 'qiao', loseZhao: true });
  lose(g, label + '/赵志敬（故意打输）');
  expectRoom(g, 'changan.station', label + '（第三章打输回到长安车马行）');
  expectFlag(g, 'shendiao.ch3', label); expectNoFlag(g, 'shendiao.c03_zhen', label);
  ex(g, '南', label); noDialog(g, label + '（山门开场不重演）');
  ch3hall(g, label + '（重来）', { side: 'zhen', result: 'win', token: null });
  ch3rest(g, label + '（重来）', { how: 'qiao', shield: false });
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 神雕第一到三章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来）、开端读不读传闻与推辞、穆念慈三种标记、第十二章四种疯话、北斗阵三种站法、三章必胜战各打输重来');
