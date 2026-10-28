// 神雕第十、十一、十二章走查：node tools/playtest-shendiao/ch10-12.mjs（在任意目录运行；PLAYTEST_VERBOSE=1 看过程）
// 照 tools/playtest-shediao/ch19-20.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记：射雕全线完成；神雕第一~九章完成（第九章由别的会话写，c09_dan_* 的后缀按本章读的写法手动设）。

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

// 别的会话建的房间（第七章郭府、第八章绝情谷口与断肠崖）若还没写，用替身补上
const STUB_ROOMS = {
  'shendiao.xy.guofu': { name: '襄阳·郭府', exits: { 东南: 'xiangyang.center' } },
  'shendiao.jq.gate': { name: '绝情谷·谷口', exits: { 西北: 'xiangyang.station' } },
  'shendiao.jq.cliff': { name: '绝情谷·断肠崖', exits: { 东: 'shendiao.jq.gate' } },
};
const stubbed = [];

function newGame({ skills = {}, flags = {}, hp = 0 } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  for (const [id, r] of Object.entries(STUB_ROOMS)) {
    if (db.room[id]) continue;
    db.room[id] = { id, type: 'room', props: { name: r.name }, exits: { ...r.exits }, lines: [], choices: [] };
    if (!stubbed.includes(id)) stubbed.push(id);
  }
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
  st.flags['shendiao.started'] = true;
  for (let i = 1; i <= 9; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  Object.assign(st.flags, flags);
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
const said = (want, label) => { if (!lastText.includes(want)) note(`${label}：应当出现含「${want}」的文字`); };
const notSaid = (bad, label) => { if (lastText.includes(bad)) note(`${label}：不该出现含「${bad}」的文字`); };

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
  return Object.values(g.db.goal).filter((x) => /^shendiao\.goal\.c1[0-2]\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当只有 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const withParty = (g, fn) => { g.party = { members: [{ id: 'friend' }] }; fn(); g.party = null; };

// ---------------- 第十章 ----------------

function ch10open(g, label, guardWant) {
  step(label + ' 第十章开端');
  g.enter('shendiao.xy.guofu');
  pick(g, '你去，这里有我', label);
  expectFlag(g, 'shendiao.ch10', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.10') note(`${label}：检查点没有设到第十章`);
  said(guardWant, label + '（射雕守门回想）');
  pick(g, '守着', label);
  pick(g, '追', label);
  pick(g, '先追出去', label);
  expectRoom(g, 'shendiao.jz.gate', label);
}
function ch10gate(g, label, how) {
  pick(g, '挡住门洞', label);
  win(g, label + '/蒙古游骑');
  pick(g, how === 'away' ? '回郭府' : '往坡上追', label);
  expectFlag(g, 'shendiao.c10_gate', label);
}
function ch10slope(g, label, how, c07want) {
  if (how === 'away') {
    expectRoom(g, 'shendiao.xy.guofu', label + '（回郭府）');
    expectGoal(g, 'shendiao.goal.c10.3', label);
    pick(g, '出城去找他们', label);
    expectRoom(g, 'shendiao.jz.slope', label);
    if (c07want) said(c07want, label + '（郭芙转述杨过的话）');
    if (g.dialog) note(`${label}：不在场的收尾不该有选项`);
  } else {
    expectRoom(g, 'shendiao.jz.slope', label);
    pick(g, '……', label);
    pick(g, { block: '抓她的手腕', shout: '住手', still: '站住了没动' }[how], label);
    pick(g, '……', label);
    if (c07want) said(c07want, label + '（杨过看你的眼神）');
    pick(g, '……', label);
  }
  expectFlag(g, 'shendiao.c10_arm', label);
  expectFlag(g, `shendiao.c10_arm_${how}`, label);
  for (const o of ['block', 'shout', 'still', 'away']) if (o !== how) expectNoFlag(g, `shendiao.c10_arm_${o}`, label);
  expectGoal(g, 'shendiao.goal.c10.5', label);
}
function ch10valley(g, label, path) {
  ex(g, '西', label);
  expectRoom(g, 'shendiao.jz.valley', label);
  const opts = { qiao: '踩着它跳过的', inner: '提一口真气', party: '一个托一个' };
  const go = () => {
    for (const [k, v] of Object.entries(opts)) if (k !== path && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
    if (has(g, '现在还上不去')) note(`${label}：满足门槛时不该出现"现在还上不去"`);
    pick(g, opts[path], label);
  };
  if (path === 'party') { g.party = { members: [{ id: 'friend' }] }; ex(g, '东', label); ex(g, '西', label); go(); g.party = null; }
  else go();
  expectRoom(g, 'shendiao.jz.cave', label);
}
function ch10rest(g, label, diao) {
  pick(g, '看看那座石坟', label);
  pick(g, '跟它上崖顶', label);
  expectFlag(g, 'shendiao.c10_cave', label);
  ex(g, '上', label);
  expectRoom(g, 'shendiao.jz.tomb', label);
  pick(g, '拿起那柄黑剑', label);
  pick(g, '……', label);
  if (g.state.player.skills['shendiao.xuantie'] === undefined) note(`${label}：没学会玄铁剑法`);
  pick(g, '那只雕', label);
  if (diao === 'win') { pick(g, '接它几招', label); win(g, label + '/神雕'); pick(g, '……', label); }
  else if (diao === 'lose') { pick(g, '接它几招', label); lose(g, label + '/神雕（允许输）'); pick(g, '……', label); }
  else pick(g, '拱拱手', label);
  expectFlag(g, 'shendiao.ch10_done', label);
  expectCap(g, 'shendiao.tianluo', 80, label);
  expectGoal(g, 'shendiao.goal.c10.8', label);
  // 章节之后能回主地图，回去不弹对话
  ex(g, '下', label); ex(g, '下', label);
  expectRoom(g, 'shendiao.jz.valley', label);
  if (g.dialog) note(`${label}：章节之后回荒谷还弹出对话`);
  ex(g, '东', label); ex(g, '东北', label); ex(g, '东北', label);
  expectRoom(g, 'xiangyang.center', label + '（章节之后走回十字街）');
}

// ---------------- 第十一章 ----------------

function ch11open(g, label, danWant) {
  step(label + ' 第十一章开端');
  ex(g, '南', label);
  expectRoom(g, 'xiangyang.station', label);
  ex(g, '东南', label);
  expectRoom(g, 'shendiao.jq.gate', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch11', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.11') note(`${label}：检查点没有设到第十一章`);
  said(danWant, label + '（半颗绝情丹）');
  pick(g, '情花林里还有个孩子', label);
  if (g.dialog) note(`${label}：谷口开端收尾后还有选项`);
  expectGoal(g, 'shendiao.goal.c11.1', label);
}
function ch11thorn(g, label, path) {
  const opts = { qiao: '侧着身子', hp: '硬趟进去', party: '一个拨开花枝' };
  const go = () => {
    ex(g, '西南', label);
    expectRoom(g, 'shendiao.jq.thorn', label);
    for (const [k, v] of Object.entries(opts)) if (k !== path && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
    pick(g, opts[path], label);
  };
  if (path === 'party') withParty(g, go); else go();
  expectRoom(g, 'shendiao.jq.huaao', label);
  expectGoal(g, 'shendiao.goal.c11.2', label);
}
function ch11fight(g, label, { loseFan = false, loseMo = false } = {}) {
  pick(g, '先打发了他们', label);
  if (loseFan) { lose(g, label + '/樊一翁（故意打输）'); return; }
  win(g, label + '/樊一翁');
  pick(g, '走上前去', label);
  pick(g, '迎战', label);
  if (loseMo) { lose(g, label + '/李莫愁（故意打输）'); return; }
  win(g, label + '/李莫愁');
}
function ch11rest(g, label, { mo, night, jump, nanhai, rumorWant }) {
  pick(g, '回头看李莫愁', label);
  pick(g, mo === 'reach' ? '伸手去拉她' : '看着她', label);
  expectFlag(g, `shendiao.c11_mo_${mo}`, label);
  pick(g, '……', label);
  said(rumorWant, label + '（茶摊老汉的传闻）');
  pick(g, '……', label);
  expectRoom(g, 'shendiao.jq.cliff', label + '（过场带到断肠崖）');
  expectGoal(g, 'shendiao.goal.c11.3', label);
  if (night === 'go') {
    pick(g, '连夜抱着孩子下山', label);
    expectFlag(g, 'shendiao.c11_away', label);
    expectNoFlag(g, 'shendiao.c11_cliff', label);
  } else {
    pick(g, '今晚我守在崖边', label);
    expectFlag(g, 'shendiao.c11_cliff', label);
    pick(g, jump === 'nod' ? '点点头' : '大喊杨过', label);
    expectFlag(g, jump === 'nod' ? 'shendiao.c11_promise' : 'shendiao.c11_shout', label);
    pick(g, '……', label);
  }
  pick(g, '走过去', label);
  pick(g, nanhai === 'back' ? '那位神尼' : '什么也不说', label);
  expectFlag(g, `shendiao.c11_nanhai_${nanhai}`, label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch11_done', label);
  expectCap(g, 'shendiao.xuantie', 60, label);
  expectCap(g, 'quanzhen.jinyan', 120, label);
  expectGoal(g, 'shendiao.goal.c11.4', label);
  // 章节之后：情花林还走得通，回到谷口不弹对话
  g.enter('shendiao.jq.huaao');
  if (g.dialog) note(`${label}：章节之后回花坳还弹出对话`);
  ex(g, '东北', label); ex(g, '东北', label);
  expectRoom(g, 'shendiao.jq.gate', label);
  if (g.dialog) note(`${label}：章节之后回谷口还弹出对话`);
}

// ---------------- 第十二章 ----------------

function ch12open(g, label) {
  step(label + ' 第十二章开端');
  g.enter('changan.station');
  ex(g, '西南', label);
  expectRoom(g, 'shendiao.fl.road', label);
  said('十六年', label + '（时间过渡）');
  pick(g, '往风陵渡去', label);
  expectFlag(g, 'shendiao.ch12', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.12') note(`${label}：检查点没有设到第十二章`);
  expectGoal(g, 'shendiao.goal.c12.1', label);
}
function ch12inn(g, label, { arm, hero, how }) {
  ex(g, '北', label);
  expectRoom(g, 'shendiao.fl.inn', label);
  pick(g, '坐下听', label);
  said(arm, label + '（断臂的回想）');
  pick(g, '……', label);
  said(hero, label + '（什么样的人算英雄）');
  if (how === 'tell') { pick(g, '告诉郭芙', label); pick(g, '追出去', label); expectFlag(g, 'shendiao.c12_tell', label); }
  else { pick(g, '不说破', label); pick(g, '跟上去', label); expectFlag(g, 'shendiao.c12_follow', label); }
  expectFlag(g, 'shendiao.c12_night', label);
  expectGoal(g, 'shendiao.goal.c12.2', label);
}
function ch12ferry(g, label, { loseTan = false } = {}) {
  ex(g, '东', label);
  expectRoom(g, 'shendiao.fl.ferry', label);
  pick(g, '拦住他们', label);
  if (loseTan) { lose(g, label + '/蒙古探马（故意打输）'); return; }
  win(g, label + '/蒙古探马');
  expectFlag(g, 'shendiao.c12_tan', label);
  expectGoal(g, 'shendiao.goal.c12.3', label);
}
function ch12ice(g, label, path) {
  const opts = { qiao: '踩着白冰', inner: '运起内力', party: '拴着' };
  const go = () => {
    ex(g, '北', label);
    expectRoom(g, 'shendiao.fl.ice', label);
    for (const [k, v] of Object.entries(opts)) if (k !== path && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
    pick(g, opts[path], label);
  };
  if (path === 'party') withParty(g, go); else go();
  expectRoom(g, 'shendiao.fl.bank', label);
}
function ch12bank(g, label, { fanWant, loseGui = false }) {
  said(fanWant, label + '（樊一翁记得绝情谷）');
  pick(g, '把郭襄交给我', label);
  pick(g, '那就试试', label);
  if (loseGui) { lose(g, label + '/西山一窟鬼（故意打输）'); return; }
  win(g, label + '/西山一窟鬼');
  pick(g, '明天我陪你去', label);
  expectFlag(g, 'shendiao.ch12_done', label);
  expectRoom(g, 'shendiao.fl.inn', label + '（收尾回到客店，第十三章从这里出发）');
  expectCap(g, 'shendiao.tanzhi', 80, label);
  expectCap(g, 'shediao.yangqiang', 120, label);
  expectGoal(g, 'shendiao.goal.c12.5', label);
  if (!g.exits()['西北']) note(`${label}：客店没有往西北的出口（第十三章的入口）`);
  ex(g, '南', label); ex(g, '东北', label);
  expectRoom(g, 'changan.station', label + '（章节之后回长安）');
}

// ---------------- 路线 1：巧；追出去扑上去拦；c07_truth、c09_dan_long、守门硬挡；拉李莫愁、守夜点头、帮着圆；告诉郭芙；神雕打赢 ----------------
{
  const label = '路线1';
  const g = newGame({
    skills: { 'shediao.cuijian': 180 },
    flags: { 'shendiao.c07_truth': true, 'shendiao.c09_dan_long': true, 'shediao.c13_guard_block': true, 'shediao.c18_rumor': true, 'shediao.c19_hero_live': true },
  });
  ch10open(g, label, '像一根桩子');
  ch10gate(g, label, 'block');
  ch10slope(g, label, 'block', '你说了实话');
  ch10valley(g, label, 'qiao');
  ch10rest(g, label, 'win');
  ch11open(g, label, '是她吃下去的');
  ch11thorn(g, label, 'qiao');
  ch11fight(g, label);
  ch11rest(g, label, { mo: 'reach', night: 'stay', jump: 'nod', nanhai: 'back', rumorWant: '茶摊老汉' });
  ch12open(g, label);
  ch12inn(g, label, { arm: '一只已经砍完了的手腕', hero: '能叫身边的人活下去', how: 'tell' });
  ch12ferry(g, label);
  ch12ice(g, label, 'qiao');
  ch12bank(g, label, { fanWant: '伸手去拉那个女魔头' });
}

// ---------------- 路线 2：内功／气血；回郭府守门（不在场）；c07_lie、c09_dan_yang、守门躲开；看着李莫愁、连夜送孩子、不作声；悄悄跟去；神雕打输 ----------------
{
  const label = '路线2';
  const g = newGame({
    skills: { 'shediao.jiuyin': 130 }, hp: 2150,
    flags: { 'shendiao.c07_lie': true, 'shendiao.c09_dan_yang': true, 'shediao.c13_guard_hide': true, 'shediao.c19_hero_word': true },
  });
  ch10open(g, label, '缩在灶后');
  ch10gate(g, label, 'away');
  ch10slope(g, label, 'away', '当年替你们家说的好话');
  ch10valley(g, label, 'inner');
  ch10rest(g, label, 'lose');
  ch11open(g, label, '是杨过收着的');
  ch11thorn(g, label, 'hp');
  ch11fight(g, label);
  ch11rest(g, label, { mo: 'watch', night: 'go', nanhai: 'quiet', rumorWant: '后来就成了赤练仙子' });
  ch12open(g, label);
  ch12inn(g, label, { arm: '你在城里守着一扇门', hero: '说话算话的', how: 'follow' });
  ch12ferry(g, label);
  ch12ice(g, label, 'inner');
  ch12bank(g, label, { fanWant: '你站在那里看着她烧' });
}

// ---------------- 路线 3：组队；喝止；c07_silent、无第九章标记、无射雕标记；守夜大喊；神雕不打 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'shendiao.c07_silent': true } });
  ch10open(g, label, '这一回也要守住');
  ch10gate(g, label, 'shout');
  ch10slope(g, label, 'shout', '你也什么都不说');
  ch10valley(g, label, 'party');
  ch10rest(g, label, 'skip');
  ch11open(g, label, '治得了一样毒，治不了两样');
  ch11thorn(g, label, 'party');
  ch11fight(g, label);
  ch11rest(g, label, { mo: 'reach', night: 'stay', jump: 'shout', nanhai: 'back', rumorWant: '后来就成了赤练仙子' });
  ch12open(g, label);
  ch12inn(g, label, { arm: '自己的那一声“住手”', hero: '你不认得他', how: 'follow' });
  ch12ferry(g, label);
  ch12ice(g, label, 'party');
  ch12bank(g, label, { fanWant: '伸手去拉那个女魔头' });
}

// ---------------- 路线 4：门槛不够时不锁人；五场必胜战各打输一次重来；站着没动；无第七章标记 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { 'shediao.cuijian': 180 } });
  // 第十章：角门打输
  ch10open(g, label, '这一回也要守住');
  pick(g, '挡住门洞', label);
  lose(g, label + '/蒙古游骑（故意打输）');
  expectRoom(g, 'xiangyang.station', label + '（打输回到襄阳车马行）');
  expectFlag(g, 'shendiao.ch10', label);
  expectNoFlag(g, 'shendiao.c10_snatch', label + '（回滚）');
  if (g.dialog) note(`${label}：回到检查点却弹出了对话`);
  expectGoal(g, 'shendiao.goal.c10.2', label);
  ex(g, '北', label);
  ex(g, '西北', label);
  if (g.dialog) note(`${label}：重进郭府时开场重演了`);
  ex(g, '东南', label);
  ex(g, '西南', label);
  expectRoom(g, 'shendiao.jz.gate', label + '（重来）');
  ch10gate(g, label + '（重来）', 'still');
  ch10slope(g, label, 'still', '像一口井');
  // 门槛不够
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '西', label);
  if (!has(g, '现在还上不去')) note(`${label}：第十章功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label);
  pick(g, '先回去练练', label);
  ex(g, '东', label);
  expectRoom(g, 'shendiao.jz.slope', label + '（门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 180;
  ch10valley(g, label, 'qiao');
  ch10rest(g, label, 'skip');
  // 第十一章：门槛不够；樊一翁、李莫愁各打输一次
  ch11open(g, label, '治得了一样毒');
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '西南', label);
  if (!has(g, '现在还过不去')) note(`${label}：第十一章功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label);
  pick(g, '先回去', label);
  ex(g, '东北', label);
  expectRoom(g, 'shendiao.jq.gate', label + '（第十一章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 180;
  ch11thorn(g, label, 'qiao');
  ch11fight(g, label, { loseFan: true });
  expectRoom(g, 'xiangyang.station', label + '（樊一翁打输回到车马行）');
  expectNoFlag(g, 'shendiao.c11_in', label);
  ex(g, '东南', label);
  if (g.dialog) note(`${label}：重来后谷口开场重演了`);
  ch11thorn(g, label + '（重来）', 'qiao');
  ch11fight(g, label + '（重来）', { loseMo: true });
  expectRoom(g, 'xiangyang.station', label + '（李莫愁打输回到车马行）');
  expectNoFlag(g, 'shendiao.c11_fan', label);
  ex(g, '东南', label);
  ch11thorn(g, label + '（再来）', 'qiao');
  ch11fight(g, label + '（再来）');
  ch11rest(g, label, { mo: 'watch', night: 'stay', jump: 'nod', nanhai: 'quiet', rumorWant: '赤练仙子' });
  // 第十二章：门槛不够；探马、一窟鬼各打输一次
  ch12open(g, label);
  ch12inn(g, label, { arm: '你又想起了那三步', hero: '你不认得他', how: 'tell' });
  ch12ferry(g, label, { loseTan: true });
  expectRoom(g, 'changan.station', label + '（探马打输回到长安车马行）');
  expectNoFlag(g, 'shendiao.c12_night', label);
  ex(g, '西南', label);
  if (g.dialog) note(`${label}：重来后官道开场重演了`);
  ch12inn(g, label + '（重来）', { arm: '三步', hero: '你不认得他', how: 'follow' });
  ch12ferry(g, label + '（重来）');
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '北', label);
  if (!has(g, '现在还过不去')) note(`${label}：第十二章功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label);
  pick(g, '先回岸上', label);
  ex(g, '南', label);
  expectRoom(g, 'shendiao.fl.ferry', label + '（第十二章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 180;
  ch12ice(g, label, 'qiao');
  ch12bank(g, label, { fanWant: '你站在那里看着她烧', loseGui: true });
  expectRoom(g, 'changan.station', label + '（一窟鬼打输回到长安车马行）');
  ex(g, '西南', label);
  ch12inn(g, label + '（再来）', { arm: '三步', hero: '你不认得他', how: 'tell' });
  ch12ferry(g, label + '（再来）');
  ch12ice(g, label + '（再来）', 'qiao');
  ch12bank(g, label + '（再来）', { fanWant: '你站在那里看着她烧' });
}

// ---------------- 客店里的两个讲故事的人 ----------------
{
  const label = '客店NPC';
  const g = newGame({ flags: { 'shendiao.ch10_done': true, 'shendiao.ch11_done': true, 'shendiao.ch12': true, 'shendiao.c12_night': true, 'shendiao.c10_learn': true } });
  g.enter('shendiao.fl.inn');
  ex(g, '对话 山西客商', label);
  said('手指刻的字', label);
  ex(g, '1', label);
  ex(g, '对话 唱曲的姑娘', label);
  said('南边好', label);
  ex(g, '1', label);
}

if (stubbed.length) console.log(`（替身房间：${stubbed.join('、')}）`);
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 神雕第十、十一、十二章走通：四条路线（巧／内功与气血／组队／门槛不够与五场打输重来）、断臂四种在场方式、第七章三种标记与无标记、第九章两种丹与无标记、射雕守门／茶摊／英雄标记有无、李莫愁拉与看、断肠崖在场与不在场、南海神尼圆与不圆、神雕赢输与不打');
