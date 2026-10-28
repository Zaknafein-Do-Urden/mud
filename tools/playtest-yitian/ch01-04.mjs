// 倚天第一到四章走查：node tools/playtest-yitian/ch01-04.mjs（在任意目录运行）
// 照 tools/playtest-shendiao/ch16-18.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记手动设：射雕、神雕全线完成。读前两部的标记按路线分别设上或不设。

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

const db = emptyDb();
for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);

function newGame({ skills = {}, flags = {}, items = {}, hp = 0 } = {}) {
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
  for (let i = 1; i <= 18; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  // 神雕在共享房间（襄阳城头、角楼）里的触发条件：按"已经走过"设好
  for (const f of ['c05_meet', 'c05_hong', 'c05_tie', 'c05_cross', 'c05_end', 'c07_raid', 'c07_wall', 'c07_guard', 'c07_ask', 'c07_in', 'c10_back', 'c10_boy', 'c14_ready', 'c16_out', 'c17_khan']) st.flags[`shendiao.${f}`] = true;
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
  return Object.values(g.db.goal).filter((x) => /^yitian\.(goal\.c0[1-4]\.|pre\.)/.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const noDialog = (g, label) => { if (g.dialog) note(`${label}：不该弹出对话（${g.dialog.map((c) => c.text).join(' / ')}）`); };
const checkpoint = (g, ch, label) => { if (g.state.checkpoint?.chapter !== ch) note(`${label}：检查点没有设到 ${ch}`); };

const QIAO = 'shendiao.tanzhi'; // 巧类外功
const INNER = 'quanzhen.xinfa'; // 内功
const withParty = (g) => { g.party = { members: [{ id: 'friend' }] }; };
const noParty = (g) => { g.party = null; };

// 门槛：how = qiao / inner / hp / party；opts 是三条路的选项关键词
function gate(g, label, how, opts, doneFlag, nextRoom) {
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还')) note(`${label}：满足门槛时不该出现"现在还……"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, doneFlag, label);
  expectRoom(g, nextRoom, label + '（过场把人带过去）');
}

// ================= 开端 =================

function hook(g, label, { needle }) {
  expectGoal(g, 'yitian.pre.1', label + '（开始前）');
  g.enter('shaolin.gate');
  ex(g, '看', label);
  saw('淡黄衫子', label + '（山门上的郭襄）');
  ex(g, '对话 郭襄', label);
  if (needle) saw('手帕包', label + '（读 c13_needle_kept）'); else notSaw('手帕包', label);
  pick(g, '先不管', label);
  ex(g, '对话 郭襄', label);
  pick(g, '说说情', label);
  expectFlag(g, 'yitian.hook_gx', label);
  pick(g, '改天再来', label);
  expectGoal(g, 'yitian.pre.2', label);
  ex(g, '对话 郭襄', label);
  if (has(g, '说说情')) note(`${label}：说过情之后不该再出现"说说情"`);
  pick(g, '陪她进寺', label);
  expectFlag(g, 'yitian.started', label);
  expectGoal(g, 'yitian.goal.c01.1', label);
  ex(g, '看', label);
  notSaw('淡黄衫子', label + '（开始后山门上的郭襄不在了）');
}

// ================= 第一章 =================

function c01open(g, label, { self }) {
  ex(g, '北', label); expectRoom(g, 'shaolin.hall', label);
  ex(g, '北', label); expectRoom(g, 'yitian.sl.yard', label);
  expectFlag(g, 'yitian.ch1', label);
  checkpoint(g, 'yitian.1', label);
  const w = { guard: '守城的', witness: '记着的人', road: '还在路上', none: '添了几样东西' }[self];
  saw(w, label + `（读 c18_self：${self}）`);
  pick(g, '送上去', label);
  expectGoal(g, 'yitian.goal.c01.2', label);
}
function c01well(g, label) {
  ex(g, '东', label); expectRoom(g, 'yitian.sl.well', label);
  pick(g, '告诉他', label);
  expectFlag(g, 'yitian.c01_well', label);
  ex(g, '西', label); noDialog(g, label + '（回后院）');
}
function c01cang(g, label, { c07, needle }) {
  ex(g, '北', label); expectRoom(g, 'yitian.sl.cangjing', label);
  const w = { truth: '照实告诉了他', silent: '你一个字也没说', lie: '你说是病死的', none: '又都不是他' }[c07];
  saw(w, label + `（读 c07：${c07}）`);
  saw(needle ? '第三根金针还在' : '攥了一会儿', label + '（读 c13_needle_kept）');
  pick(g, '陪她坐', label);
  expectFlag(g, 'yitian.c01_cang', label);
  expectGoal(g, 'yitian.goal.c01.3', label);
}
function c01he(g, label, { winHe, well, loseJielv = false }) {
  ex(g, '南', label); expectRoom(g, 'yitian.sl.yard', label);
  pick(g, '接他的剑', label);
  if (winHe) win(g, label + '/何足道（允许输，打赢）'); else lose(g, label + '/何足道（允许输，打输）');
  expectRoom(g, 'yitian.sl.yard', label + '（何足道打完人还在后院）');
  pick(g, '……', label);
  if (well) saw('井台边泥地上画的', label + '（读 c01_well）'); else notSaw('井台边泥地上画的', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.c01_he', label);
  pick(g, '挡在矮墙', label);
  if (loseJielv) return;
  win(g, label + '/戒律院');
  expectFlag(g, 'yitian.c01_jielv', label);
  expectGoal(g, 'yitian.goal.c01.5', label);
}
function c01cliff(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '东北', label); expectRoom(g, 'yitian.sl.cliff', label);
  gate(g, label, how, { qiao: '一纵而过', inner: '踩着那根枯松', party: '压住树根' }, 'yitian.c01_cross', 'yitian.sl.pine');
}
function c01pine(g, label, { bury }) {
  pick(g, '坐下来听', label);
  pick(g, '……', label);
  pick(g, '帮他们', label);
  saw(bury ? '在华山上，给两个抱在一起' : '最后一捧土', label + '（读 c05_bury）');
  expectFlag(g, 'yitian.c01_heard', label);
  expectFlag(g, 'yitian.ch1_done', label);
  if (g.state.player.skills['yitian.jiuyang'] === undefined) note(`${label}：没学会九阳神功`);
  expectGoal(g, 'yitian.goal.c02.1', label);
  noDialog(g, label + '（收尾之后）');
}

// ================= 第二章 =================

function c02open(g, label, { needle, well }) {
  ex(g, '东', label); expectRoom(g, 'yitian.sl.road', label);
  expectFlag(g, 'yitian.ch2', label);
  checkpoint(g, 'yitian.2', label);
  pick(g, '……', label);
  if (needle) saw('第三根针', label + '（读 c13_needle_kept）'); else notSaw('第三根针', label);
  saw(well ? '井台边上你画的那两个圈' : '我们走吧', label + '（读 c01_well）');
  expectFlag(g, 'yitian.c02_part', label);
  expectGoal(g, 'yitian.goal.c02.2', label);
  // 回主地图
  ex(g, '西', label); ex(g, '南', label); expectRoom(g, 'yitian.sl.cliff', label + '（往回走）');
  noDialog(g, label + '（往回走不弹对话）');
}
function c02foot(g, label, { climb, well, loseIt = false }) {
  g.enter('xiangyang.station');
  ex(g, '西', label); expectRoom(g, 'wudang.gate', label);
  ex(g, '南', label); expectRoom(g, 'yitian.wd.foot', label);
  pick(g, '迎上去', label);
  if (loseIt) { lose(g, label + '/蒙古游骑（故意打输）'); return; }
  win(g, label + '/蒙古游骑');
  saw(well ? '是你教的那两个圈' : '是怎么挡开的', label + '（读 c01_well）');
  pick(g, '……', label);
  pick(g, climb ? '我陪你上去' : '我在山下看着你', label);
  expectFlag(g, climb ? 'yitian.c02_climb' : 'yitian.c02_watch', label);
  expectFlag(g, 'yitian.c02_foot', label);
  expectGoal(g, 'yitian.goal.c02.3', label);
}
function c02cliff(g, label, how, { climb }) {
  if (how === 'party') withParty(g);
  ex(g, '北', label); ex(g, '北', label); expectRoom(g, 'wudang.hall', label);
  ex(g, '北', label); expectRoom(g, 'yitian.wd.cliff', label);
  saw(climb ? '像一只手掌托着' : '劈好的柴', label + '（读 c02_climb/watch）');
  gate(g, label, how, { qiao: '踩着藤蔓', hp: '硬爬上去', party: '搭个人梯' }, 'yitian.c02_cross', 'yitian.wd.hut');
}
function c02hut(g, label, { spar, bury }) {
  if (spar === 'win') { pick(g, '跟他过几招', label); win(g, label + '/张君宝（允许输，打赢）'); pick(g, '……', label); }
  else if (spar === 'lose') { pick(g, '跟他过几招', label); lose(g, label + '/张君宝（允许输，打输）'); pick(g, '……', label); }
  else pick(g, '不比了', label);
  saw(bury ? '华山的雪地里' : '你没说什么', label + '（读 c05_bury）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch2_done', label);
  expectCap(g, 'shendiao.xuantie', 150, label);
  expectGoal(g, 'yitian.goal.c03.1', label);
  noDialog(g, label + '（收尾之后）');
  ex(g, '南', label); noDialog(g, label + '（章节之后崖路不弹门槛）');
  ex(g, '北', label); expectRoom(g, 'yitian.wd.hut', label + '（章节之后小屋还在）'); noDialog(g, label);
  ex(g, '南', label); ex(g, '南', label); ex(g, '南', label); ex(g, '南', label); expectRoom(g, 'yitian.wd.foot', label); noDialog(g, label + '（章节之后岔路口）');
}

// ================= 第三章 =================

function c03open(g, label, { hero, c07 }) {
  g.enter('xiangyang.center');
  ex(g, '东北', label); expectRoom(g, 'shendiao.xy.wall', label);
  expectFlag(g, 'yitian.ch3', label);
  checkpoint(g, 'yitian.3', label);
  const hw = { live: '活下去的', word: '说话算话的', seek: '你说你还在找', none: '老朋友，就剩下不几个了' }[hero];
  saw(hw, label + `（读 c19_hero：${hero}）`);
  const cw = { truth: '你跟他照实说了', silent: '你一个字也没说，把话留给了我', lie: '你替我圆了一句', none: null }[c07];
  if (cw) saw(cw, label + `（读 c07：${c07}）`); else notSaw('过儿这些年没有消息', label);
  pick(g, '……', label);
}
function c03wall(g, label, { loseIt = false } = {}) {
  pick(g, '守住垛口', label);
  if (loseIt) { lose(g, label + '/先登千夫长（故意打输）'); return; }
  win(g, label + '/先登千夫长');
  expectFlag(g, 'yitian.c03_wall', label);
  expectGoal(g, 'yitian.goal.c03.3', label);
}
function c03xiang(g, label, { climb }) {
  ex(g, '东', label); expectRoom(g, 'shendiao.xy.jiaolou', label);
  saw(climb ? '是你帮他扛的木头' : '你在山下看着他上山', label + '（读 c02_climb/watch）');
  expectFlag(g, 'yitian.c03_xiang', label);
  ex(g, '西', label); noDialog(g, label + '（回城头）');
}
function c03secret(g, label, { wumu, sword, self }) {
  ex(g, '西南', label); ex(g, '西北', label); expectRoom(g, 'shendiao.xy.guofu', label);
  ex(g, '北', label); expectRoom(g, 'shendiao.xy.guofu_in', label);
  saw(sword ? '双手递给她的那块铁' : '托那只雕背到襄阳来', label + '（读 c18_sword）');
  pick(g, '听她说下去', label);
  saw(wumu ? '亲手交到他手上' : '全凭肚子里记着', label + '（读 c19_wumu）');
  pick(g, '问她为什么', label);
  const sw = { guard: '你替我守着', witness: '那你就记着这件事', road: '那就带着它走吧', none: '你只要知道，就够了' }[self];
  saw(sw, label + `（读 c18_self：${self}）`);
  expectFlag(g, 'yitian.c03_secret', label);
  pick(g, '……', label);
  expectRoom(g, 'shendiao.xy.wall', label + '（过场回城头）');
  expectFlag(g, 'yitian.c03_night', label);
  expectGoal(g, 'yitian.goal.c03.5', label);
}
function c03mado(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '西北', label); expectRoom(g, 'yitian.xy.mado', label);
  gate(g, label, how, { qiao: '一掠而过', inner: '从火里硬冲', party: '推开滚木' }, 'yitian.c03_cross', 'yitian.xy.gate');
}
function c03gate(g, label, { tulong, xiang, self, loseIt = false }) {
  pick(g, '和郭破虏一起顶住', label);
  if (loseIt) { lose(g, label + '/先锋万户（故意打输）'); return; }
  win(g, label + '/先锋万户');
  expectFlag(g, 'yitian.c03_gate', label);
  const o = { watch: '守在郭靖', guard: '护着郭破虏', wall: '耶律齐那边' }[tulong];
  pick(g, o, label);
  expectFlag(g, `yitian.c03_tulong_${tulong}`, label);
  pick(g, '……', label);
  expectRoom(g, 'yitian.xy.tan', label + '（过场到江滩）');
  saw(xiang ? '我在角楼上问你' : '是不是早就知道了', label + '（读 c03_xiang）');
  const tw = { watch: '推完一掌，在喘气', guard: '郭破虏的血', wall: '把剑换到左手' }[tulong];
  saw(tw, label + `（读 c03_tulong：${tulong}）`);
  pick(g, '……', label);
  if (self !== 'none') saw('灯下说的话', label + '（江滩读 c18_self）');
  pick(g, '……', label);
  saw('很多年以后', label);
  expectFlag(g, 'yitian.ch3_done', label);
  expectCap(g, 'shediao.cuijian', 150, label);
  expectCap(g, 'shendiao.tanzhi', 150, label);
  expectGoal(g, 'yitian.goal.c04.1', label);
  noDialog(g, label + '（收尾之后）');
  ex(g, '东', label); expectRoom(g, 'yitian.xy.gate', label); noDialog(g, label);
  ex(g, '南', label); ex(g, '东南', label); expectRoom(g, 'shendiao.xy.wall', label + '（章节之后回得去城头）'); noDialog(g, label);
}

// ================= 第四章 =================

function c04open(g, label, { tulong, secret = true, loseIt = false }) {
  g.enter('linan.gate');
  ex(g, '南', label); expectRoom(g, 'linan.road', label);
  ex(g, '东', label); expectRoom(g, 'yitian.qt.bank', label);
  expectFlag(g, 'yitian.ch4', label);
  checkpoint(g, 'yitian.4', label);
  pick(g, '走近去看看', label);
  const tw = { watch: '你在襄阳城头上看着一点黑光', guard: '浑身是血的年轻人', wall: '郭家的刀丢了' }[tulong];
  saw(tw, label + `（读 c03_tulong：${tulong}）`);
  if (secret) saw('世上知道的人，大概只剩你一个了', label + '（读 c03_secret）');
  pick(g, '拦住他们', label);
  if (loseIt) { lose(g, label + '/海沙派（故意打输）'); return; }
  win(g, label + '/海沙派');
  expectFlag(g, 'yitian.c04_salt', label);
  expectGoal(g, 'yitian.goal.c04.3', label);
}
function c04yu(g, label, { climb }) {
  g.enter('wudang.gate');
  ex(g, '南', label); expectRoom(g, 'yitian.wd.foot', label);
  saw(climb ? '木头是你帮他扛上去的' : '一直没有回头', label + '（读 c02_climb/watch）');
  pick(g, '往山路上追', label);
  saw('张翠山', label);
  expectFlag(g, 'yitian.c04_yu', label);
  expectGoal(g, 'yitian.goal.c04.4', label);
}
function c04biaoju(g, label, { search }) {
  g.enter('linan.road');
  ex(g, '东', label); noDialog(g, label + '（江堤不重演开场）');
  ex(g, '北', label); expectRoom(g, 'yitian.qt.biaoju', label);
  pick(g, search ? '找找线索' : '透一口气', label);
  if (search) {
    if (!g.state.player.inventory['yitian.c04_zhen']) note(`${label}：没拿到牛毛银针`);
    pick(g, '……', label);
  }
  expectFlag(g, 'yitian.c04_biaoju', label);
  ex(g, '南', label); expectRoom(g, 'yitian.qt.bank', label);
}
function c04ferry(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '东', label); expectRoom(g, 'yitian.qt.ferry', label);
  gate(g, label, how, { qiao: '踩着浪头', hp: '顶着潮水硬划', party: '一个撑船' }, 'yitian.c04_cross', 'yitian.qt.boat');
}
function c04boat(g, label, { needle, loseIt = false }) {
  if (needle) pick(g, '拿出那枚银针', label);
  else { if (has(g, '银针')) note(`${label}：没有银针时不该出现"拿出银针"`); }
  pick(g, needle ? '……' : '听她说下去', label);
  pick(g, '迎上去', label);
  if (loseIt) { lose(g, label + '/巨鲸帮（故意打输）'); return; }
  win(g, label + '/巨鲸帮');
  pick(g, '……', label);
  saw(needle ? '这一针的账' : '谁截了他', label + '（读 c04_ask）');
  expectFlag(g, 'yitian.ch4_done', label);
  expectCap(g, 'shediao.luoying', 150, label);
  expectGoal(g, 'yitian.goal.c04.7', label);
  noDialog(g, label + '（收尾之后）');
  ex(g, '西', label); ex(g, '西', label); expectRoom(g, 'yitian.qt.bank', label); noDialog(g, label);
  ex(g, '西', label); expectRoom(g, 'linan.road', label + '（回主地图）');
  // 第五章的码头
  g.enter('fuzhou.station');
  ex(g, '东', label); expectRoom(g, 'yitian.hai.dock', label + '（第四章指向的码头）');
  expectFlag(g, 'yitian.ch5', label + '（第五章开端接上了）');
}

const ALLPRE = { 'shendiao.c13_needle_kept': true };

// ---------------- 路线 1：巧；所有前两部标记都有；指点张君宝、何足道打赢、陪他上山、和他过招打赢、去角楼、城头看着、找银针 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { [QIAO]: 199 }, flags: { ...ALLPRE, 'shendiao.c13_needle_tell': true, 'shendiao.c18_self_guard': true, 'shendiao.c07_truth': true, 'shendiao.c05_bury': true, 'shediao.c19_hero_live': true, 'shediao.c19_wumu': true, 'shendiao.c18_sword': true } });
  hook(g, label, { needle: true });
  c01open(g, label, { self: 'guard' }); c01well(g, label); c01cang(g, label, { c07: 'truth', needle: true });
  c01he(g, label, { winHe: true, well: true }); c01cliff(g, label, 'qiao'); c01pine(g, label, { bury: true });
  c02open(g, label, { needle: true, well: true }); c02foot(g, label, { climb: true, well: true }); c02cliff(g, label, 'qiao', { climb: true }); c02hut(g, label, { spar: 'win', bury: true });
  c03open(g, label, { hero: 'live', c07: 'truth' }); c03wall(g, label); c03xiang(g, label, { climb: true }); c03secret(g, label, { wumu: true, sword: true, self: 'guard' });
  c03mado(g, label, 'qiao'); c03gate(g, label, { tulong: 'watch', xiang: true, self: 'guard' });
  c04open(g, label, { tulong: 'watch' }); c04yu(g, label, { climb: true }); c04biaoju(g, label, { search: true }); c04ferry(g, label, 'qiao'); c04boat(g, label, { needle: true });
}

// ---------------- 路线 2：内功与气血；c18_self_witness、c07_silent、c19_hero_word，没有武穆遗书和交剑；不去井台、输给何足道、山下看着、输给张君宝、不去角楼、护着郭破虏、不找银针 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { [INNER]: 146 }, hp: 2450, flags: { ...ALLPRE, 'shendiao.c13_needle_quiet': true, 'shendiao.c18_self_witness': true, 'shendiao.c07_silent': true, 'shediao.c19_hero_word': true } });
  hook(g, label, { needle: true });
  c01open(g, label, { self: 'witness' }); c01cang(g, label, { c07: 'silent', needle: true });
  c01he(g, label, { winHe: false, well: false }); c01cliff(g, label, 'inner'); c01pine(g, label, { bury: false });
  c02open(g, label, { needle: true, well: false }); c02foot(g, label, { climb: false, well: false }); c02cliff(g, label, 'hp', { climb: false }); c02hut(g, label, { spar: 'lose', bury: false });
  c03open(g, label, { hero: 'word', c07: 'silent' }); c03wall(g, label); c03secret(g, label, { wumu: false, sword: false, self: 'witness' });
  c03mado(g, label, 'inner'); c03gate(g, label, { tulong: 'guard', xiang: false, self: 'witness' });
  c04open(g, label, { tulong: 'guard' }); c04yu(g, label, { climb: false }); c04biaoju(g, label, { search: false }); c04ferry(g, label, 'hp'); c04boat(g, label, { needle: false });
}

// ---------------- 路线 3：组队；c18_self_road、c07_lie、c19_hero_seek，没有金针；不和张君宝过招、东城头 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'shendiao.c18_self_road': true, 'shendiao.c07_lie': true, 'shediao.c19_hero_seek': true } });
  hook(g, label, { needle: false });
  c01open(g, label, { self: 'road' }); c01cang(g, label, { c07: 'lie', needle: false });
  c01he(g, label, { winHe: true, well: false }); c01cliff(g, label, 'party'); c01pine(g, label, { bury: false });
  c02open(g, label, { needle: false, well: false }); c02foot(g, label, { climb: true, well: false }); c02cliff(g, label, 'party', { climb: true }); c02hut(g, label, { spar: 'skip', bury: false });
  c03open(g, label, { hero: 'seek', c07: 'lie' }); c03wall(g, label); c03secret(g, label, { wumu: false, sword: false, self: 'road' });
  c03mado(g, label, 'party'); c03gate(g, label, { tulong: 'wall', xiang: false, self: 'road' });
  c04open(g, label, { tulong: 'wall' }); c04yu(g, label, { climb: true }); c04biaoju(g, label, { search: true }); c04ferry(g, label, 'party'); c04boat(g, label, { needle: true });
}

// ---------------- 路线 4：门槛不够不锁人；每场必胜战打输重来；前两部标记一个都没有 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { [QIAO]: 199 } });
  hook(g, label, { needle: false });
  c01open(g, label, { self: 'none' }); c01cang(g, label, { c07: 'none', needle: false });
  c01he(g, label, { winHe: false, well: false, loseJielv: true });
  lose(g, label + '/戒律院（故意打输）');
  expectRoom(g, 'shaolin.gate', label + '（打输回山门）');
  expectFlag(g, 'yitian.ch1', label); expectNoFlag(g, 'yitian.c01_he', label + '（回滚）');
  ex(g, '北', label); ex(g, '北', label); noDialog(g, label + '（重进后院不重演开端）');
  c01cang(g, label + '（重来）', { c07: 'none', needle: false });
  c01he(g, label + '（重来）', { winHe: true, well: false });
  g.state.player.skills[QIAO] = 50;
  ex(g, '东北', label);
  if (!has(g, '现在还过不去')) note(`${label}：功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回后院', label);
  ex(g, '西南', label); expectRoom(g, 'yitian.sl.yard', label + '（断崖门槛不锁人）');
  g.state.player.skills[QIAO] = 199;
  c01cliff(g, label, 'qiao'); c01pine(g, label, { bury: false });

  c02open(g, label, { needle: false, well: false });
  c02foot(g, label, { climb: false, well: false, loseIt: true });
  expectRoom(g, 'wudang.gate', label + '（第二章打输回玄岳门）');
  expectFlag(g, 'yitian.c02_part', label + '（检查点里有 c02_part，岔路口还去得了）');
  ex(g, '南', label); expectRoom(g, 'yitian.wd.foot', label);
  pick(g, '迎上去', label); win(g, label + '/蒙古游骑（重来）'); pick(g, '……', label); pick(g, '我在山下看着你', label);
  g.state.player.skills[QIAO] = 50;
  ex(g, '北', label); ex(g, '北', label); ex(g, '北', label);
  if (!has(g, '现在还上不去')) note(`${label}：功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label); pick(g, '先退回紫霄宫', label);
  ex(g, '南', label); expectRoom(g, 'wudang.hall', label + '（崖路门槛不锁人）');
  g.state.player.skills[QIAO] = 199;
  ex(g, '南', label); ex(g, '南', label);
  c02cliff(g, label, 'qiao', { climb: false }); c02hut(g, label, { spar: 'skip', bury: false });

  c03open(g, label, { hero: 'none', c07: 'none' }); c03wall(g, label, { loseIt: true });
  expectRoom(g, 'xiangyang.inn', label + '（第三章打输回客栈）');
  ex(g, '东', label); ex(g, '东北', label); expectRoom(g, 'shendiao.xy.wall', label);
  if (!has(g, '守住垛口')) note(`${label}：重来后城头没有再开战`);
  c03wall(g, label + '（重来）');
  c03secret(g, label, { wumu: false, sword: false, self: 'none' });
  g.state.player.skills[QIAO] = 50;
  ex(g, '西北', label);
  if (!has(g, '现在还过不去')) note(`${label}：功力不够时没有"现在还过不去"（马道）`);
  pick(g, '现在还过不去', label); pick(g, '先退回城头', label);
  ex(g, '东南', label); expectRoom(g, 'shendiao.xy.wall', label + '（马道门槛不锁人）');
  g.state.player.skills[QIAO] = 199;
  c03mado(g, label, 'qiao'); c03gate(g, label, { loseIt: true });
  expectRoom(g, 'xiangyang.inn', label + '（瓮城打输回客栈）');
  expectNoFlag(g, 'yitian.c03_secret', label + '（回滚）');
  ex(g, '东', label); ex(g, '东北', label);
  c03wall(g, label + '（再来）'); c03secret(g, label + '（再来）', { wumu: false, sword: false, self: 'none' });
  c03mado(g, label + '（再来）', 'qiao'); c03gate(g, label + '（再来）', { tulong: 'guard', xiang: false, self: 'none' });

  c04open(g, label, { tulong: 'guard', loseIt: true });
  expectRoom(g, 'linan.inn', label + '（第四章打输回客栈）');
  ex(g, '东', label); ex(g, '南', label); ex(g, '东', label); expectRoom(g, 'yitian.qt.bank', label);
  pick(g, '拦住他们', label); win(g, label + '/海沙派（重来）');
  c04yu(g, label, { climb: false }); c04biaoju(g, label, { search: false });
  g.state.player.skills[QIAO] = 50;
  ex(g, '东', label);
  if (!has(g, '现在还过不去')) note(`${label}：功力不够时没有"现在还过不去"（渡口）`);
  pick(g, '现在还过不去', label); pick(g, '先退回江堤', label);
  ex(g, '西', label); expectRoom(g, 'yitian.qt.bank', label + '（渡口门槛不锁人）');
  g.state.player.skills[QIAO] = 199;
  c04ferry(g, label, 'qiao'); c04boat(g, label, { needle: false, loseIt: true });
  expectRoom(g, 'linan.inn', label + '（巨鲸帮打输回客栈）');
  expectNoFlag(g, 'yitian.c04_salt', label + '（回滚）');
  ex(g, '东', label); ex(g, '南', label); ex(g, '东', label);
  pick(g, '拦住他们', label); win(g, label + '/海沙派（再来）');
  c04yu(g, label + '（再来）', { climb: false }); c04biaoju(g, label + '（再来）', { search: false });
  c04ferry(g, label + '（再来）', 'qiao'); c04boat(g, label + '（再来）', { needle: false });
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 倚天第一到四章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来），四处门槛三条路，八场必胜战打输重来，何足道、张君宝两场允许输的赢输，c13_needle、c18_self 三种与无、c07 三种与无、c05_bury、c19_hero 三种与无、c19_wumu、c18_sword 的有无，c01_well、c02_climb/watch、c03_xiang、c03_tulong 三种、银针的有无');
