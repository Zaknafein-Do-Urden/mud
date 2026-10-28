// 倚天第十三、十四、十五、十六章走查：node tools/playtest-yitian/ch13-16.mjs（在任意目录运行）
// 照 tools/playtest-shendiao/ch16-18.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记：射雕、神雕、倚天第一~十二章里所有 do 设过的标记统统设上（等于"都走过了"，共享房间里的旧触发不会再跳出来），
// 但本脚本要测的分支标记（c03_secret、c05_*、c06_*、c11_zhou）先去掉，由各条路线自己设。
// 出海码头 yitian.hai.dock 是第五章的；第五章没写好时脚本补替身（见 STUB），汇报里说明。

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

// 第五章（福州出海码头、船老大黄阿七）如果还没写，补替身
const STUB = `
=== room: yitian.hai.dock
name: 福州·出海码头（替身）
exits: 西=fuzhou.station
npcs: yitian.c05_boatman
---
替身房间。

=== npc: yitian.c05_boatman
name: 黄阿七
talk: yitian.c05.boatman
---
替身。

=== dialog: yitian.c05.boatman
---
替身。
* 告辞

=== patch: fuzhou.station
exits: 东=yitian.hai.dock
`;

let DB = null;
const PRE = new Set();
function loadDb() {
  if (DB) return DB;
  const db = emptyDb();
  for (const f of files) {
    const blocks = parse(readFileSync(join(root, f), 'utf8'), f);
    addBlocks(db, blocks, f);
    const mine = /^yitian\/ch1[3-6]\.md$/.test(f) || /^yitian\/ch(1[7-9]|20)\.md$/.test(f);
    if (mine || !/^(shediao|shendiao|yitian)\//.test(f)) continue;
    for (const b of blocks) {
      const eff = [...(b.props.do ?? '').split(/\s+/), ...b.choices.flatMap((c) => c.effects)];
      for (const e of eff) if (e.startsWith('flag:')) PRE.add(e.slice(5));
    }
  }
  if (!db.room['yitian.hai.dock'] || !db.dialog['yitian.c05.boatman']) {
    addBlocks(db, parse(STUB, 'stub.md'), 'stub.md');
    stubs.push('福州出海码头 / 黄阿七（第五章还没写）');
  }
  // 要测的分支标记由路线自己设；第十三章以后的一律不预设
  for (const f of [...PRE]) {
    if (/^yitian\.(c03_secret|c05_boat|c05_island|c06_me|c06_heir|c06_none|c11_zhou)$/.test(f)) PRE.delete(f);
    if (/^yitian\.(c1[3-9]|c20|ch1[3-9]|ch20)/.test(f)) PRE.delete(f);
  }
  DB = db;
  return db;
}

function newGame({ skills = {}, flags = {}, items = {}, hp = 0 } = {}) {
  const db = loadDb();
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, { 'shendiao.xuantie': 140 }, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(st.player.skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  for (const s of ['shediao', 'shendiao', 'yitian']) st.flags[`${s}.started`] = true;
  for (const f of PRE) st.flags[f] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (let i = 1; i <= 18; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  for (let i = 1; i <= 12; i++) { st.flags[`yitian.ch${i}`] = true; st.flags[`yitian.ch${i}_done`] = true; }
  st.flags['yitian.c03_secret'] = true; // 第三章总是设
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
const expectItem = (g, id, label) => { if (!g.state.player.inventory[id]) note(`${label}：包里应当有 ${id}`); };
function expectCap(g, id, n, label) { if ((g.state.player.skillcap?.[id] ?? 0) < n) note(`${label}：${id} 的上限应当 ≥ ${n}，是 ${g.state.player.skillcap?.[id]}`); }
function goal(g) {
  return Object.values(g.db.goal).filter((x) => /^yitian\.goal\.c1[3-6]\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const noDialog = (g, label) => { if (g.dialog) note(`${label}：不该弹出对话（${g.dialog.map((c) => c.text).join(' / ')}）`); };
const checkpoint = (g, ch, label) => { if (g.state.checkpoint?.chapter !== ch) note(`${label}：检查点没有设到 ${ch}（是 ${g.state.checkpoint?.chapter}）`); };

const QIAO = 'shendiao.tanzhi'; // 巧类外功
const INNER = 'quanzhen.xinfa'; // 内功
const withParty = (g) => { g.party = { members: [{ id: 'friend' }] }; };
const noParty = (g) => { g.party = null; };
function threshold(g, label, how, opts, notyet) {
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, notyet)) note(`${label}：满足门槛时不该出现"${notyet}"`);
  pick(g, opts[how], label);
  noParty(g);
}

// ================= 第十三章 =================

function c13open(g, label) {
  g.enter('quanzhen.gate');
  ex(g, '对话 北上商队', label);
  pick(g, '跟商队去大都', label);
  expectRoom(g, 'shediao.zd.inn', label);
  ex(g, '北', label);
  expectRoom(g, 'shediao.zd.street', label);
  expectFlag(g, 'yitian.ch13', label);
  checkpoint(g, 'yitian.13', label);
  pick(g, '今夜就去', label);
  expectGoal(g, 'yitian.goal.c13.1', label);
}
function c13gate(g, label, { loseIt = false } = {}) {
  ex(g, '东北', label);
  expectRoom(g, 'yitian.da.lane', label);
  pick(g, '先把他们放倒', label);
  if (loseIt) return;
  win(g, label + '/番僧');
  expectFlag(g, 'yitian.c13_gate', label);
  expectGoal(g, 'yitian.goal.c13.2', label);
  ex(g, '北', label);
  expectRoom(g, 'yitian.da.yard', label);
  saw('往东边指了指', label + '（苦头陀的手势）');
  ex(g, '东', label);
  expectRoom(g, 'yitian.da.chai', label);
  pick(g, '收好解药', label);
  expectFlag(g, 'yitian.c13_fan', label);
  expectItem(g, 'yitian.c13_jieyao', label);
  expectGoal(g, 'yitian.goal.c13.3', label);
  ex(g, '西', label);
  expectRoom(g, 'yitian.da.yard', label);
}
function c13climb(g, label, how) {
  threshold(g, label, how, { qiao: '脚尖点着檐角', inner: '十指扣进砖缝', party: '垂下绳子' }, '现在还上不去');
  expectFlag(g, 'yitian.c13_climb', label);
  expectRoom(g, 'yitian.da.tower', label + '（过场上塔顶）');
}
function c13top(g, label, { told, c06, loseLu = false }) {
  saw('郭府内院', label + '（读 c03_secret）');
  pick(g, '……', label);
  pick(g, told ? '我也知道' : '不作声', label);
  expectFlag(g, told ? 'yitian.c13_told' : 'yitian.c13_kept', label);
  expectNoFlag(g, told ? 'yitian.c13_kept' : 'yitian.c13_told', label);
  pick(g, '……', label);
  const w = { me: '你说是', heir: '好福气', none: '你还是不肯说', nil: '祖师婆婆的画像旁边' };
  saw(w[c06], label + `（读 c06：${c06}）`);
  for (const [k, v] of Object.entries(w)) if (k !== c06) notSaw(v, label);
  pick(g, '……', label);
  pick(g, '拦在门口', label);
  pick(g, '迎上去', label);
  if (loseLu) { lose(g, label + '/鹿杖客（故意打输）'); return; }
  win(g, label + '/鹿杖客');
  expectFlag(g, 'yitian.c13_lu', label);
  pick(g, '……', label);
  saw(told ? '你别拦她' : '照应着她一点', label + '（灭绝读 told/kept）');
  pick(g, '……', label);
  expectRoom(g, 'yitian.da.yard', label + '（过场下塔）');
  saw(told ? '谁也别再提' : '她不知道你在窗外听见了什么', label + '（塔下读 told/kept）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch13_done', label);
  expectCap(g, 'yitian.jiuyang', 130, label);
  expectCap(g, 'quanzhen.jinyan', 150, label);
  expectGoal(g, 'yitian.goal.c13.6', label);
  noDialog(g, label + '（收尾之后）');
  // 章节之后还回得去
  ex(g, '上', label); expectRoom(g, 'yitian.da.tower', label + '（章节后上塔）'); noDialog(g, label);
  ex(g, '下', label); ex(g, '东', label); noDialog(g, label + '（章节后柴房）');
  ex(g, '西', label); ex(g, '南', label); expectRoom(g, 'yitian.da.lane', label); noDialog(g, label);
  ex(g, '西南', label); expectRoom(g, 'shediao.zd.street', label); noDialog(g, label + '（章节后大街）');
}

// ================= 第十四章 =================

function c14open(g, label) {
  g.enter('fuzhou.station');
  ex(g, '东', label);
  expectRoom(g, 'yitian.hai.dock', label);
  expectFlag(g, 'yitian.ch14', label);
  checkpoint(g, 'yitian.14', label);
  pick(g, '上船', label);
  expectRoom(g, 'yitian.hai.ls_beach', label + '（过场到灵蛇岛）');
  expectGoal(g, 'yitian.goal.c14.1', label);
}
function c14xie(g, label, c05) {
  ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'yitian.hai.ls_hut', label);
  pick(g, '……', label);
  const w = { boat: '桨声', island: '扶那些倒下的人', nil: '那人的呼吸' };
  saw(w[c05], label + `（读 c05：${c05}）`);
  for (const [k, v] of Object.entries(w)) if (k !== c05) notSaw(v, label);
  expectFlag(g, 'yitian.c14_xie', label);
  pick(g, '……', label);
  expectGoal(g, 'yitian.goal.c14.2', label);
  ex(g, '南', label); ex(g, '东', label);
  expectRoom(g, 'yitian.hai.ls_cliff', label);
}
function c14shi(g, label, winShi) {
  pick(g, '接他们的圣火令', label);
  if (winShi) win(g, label + '/三使（允许输，打赢）'); else lose(g, label + '/三使（允许输，打输）');
  expectRoom(g, 'yitian.hai.ls_cliff', label + '（三使打完人还在崖上）');
  expectFlag(g, 'yitian.c14_shi', label);
  pick(g, '……', label);
  pick(g, '跳下去', label);
}
function c14board(g, label, how) {
  threshold(g, label, how, { qiao: '凌空掠上船头', hp: '跳进海里', party: '荡过去' }, '现在还过不去');
  expectFlag(g, 'yitian.c14_board', label);
  expectRoom(g, 'yitian.hai.ls_ship', label + '（过场上波斯船）');
}
function c14deck(g, label, { told, loseIt = false }) {
  pick(g, '和张无忌一起闯舱门', label);
  if (loseIt) { lose(g, label + '/宝树王（故意打输）'); return; }
  win(g, label + '/宝树王');
  expectFlag(g, 'yitian.c14_deck', label);
  pick(g, '……', label); pick(g, '……', label);
  pick(g, '扶他回石屋', label);
  expectRoom(g, 'yitian.hai.ls_hut', label + '（过场回石屋）');
  expectItem(g, 'yitian.qishang_pu', label + '（进对话就给拳谱）');
  saw(told ? '说过一句话' : '一口气没吐出来', label + '（谢逊读 told/kept）');
  pick(g, '我会的', label);
  expectFlag(g, 'yitian.ch14_done', label);
  if (g.state.player.skills['yitian.qishang'] === undefined) note(`${label}：没学会七伤拳`);
  expectGoal(g, 'yitian.goal.c14.6', label);
  noDialog(g, label + '（收尾之后）');
}

// ================= 第十五章 =================

function c15open(g, label, { c11 }) {
  ex(g, '南', label); ex(g, '南', label);
  expectRoom(g, 'yitian.hai.ls_beach', label);
  expectFlag(g, 'yitian.ch15', label);
  checkpoint(g, 'yitian.15', label);
  pick(g, '上船', label);
  expectRoom(g, 'yitian.hai.hy_beach', label + '（灵蛇岛海滩开船，过场到荒岛）');
  if (c11) saw('闭着眼睛刺的', label + '（读 c11_zhou）'); else notSaw('闭着眼睛刺的', label);
  pick(g, '……', label); pick(g, '……', label); pick(g, '……', label);
  expectFlag(g, 'yitian.c15_night', label);
  expectGoal(g, 'yitian.goal.c15.2', label);
  ex(g, '东', label);
  expectRoom(g, 'yitian.hai.hy_spit', label);
}
function c15cross(g, label, how) {
  threshold(g, label, how, { qiao: '礁石尖', inner: '顶着急流', party: '绳子拴在腰上' }, '现在还过不去');
  expectFlag(g, 'yitian.c15_reef', label);
  expectRoom(g, 'yitian.hai.hy_reef', label + '（过场上礁石岬）');
}
function c15reef(g, label, { told, winZhou, tell, jiuyin, loseGb = false }) {
  saw('一撮铁屑', label + '（读 c03_secret）');
  saw(told ? '你还当着她的面说过' : '那个人不知道你也知道', label + '（读 told/kept）');
  pick(g, '……', label);
  if (jiuyin) saw('是叫人去摧坚', label + '（读 learned:jiuyin）'); else notSaw('是叫人去摧坚', label);
  pick(g, '接她这一爪', label);
  if (winZhou) win(g, label + '/周芷若（允许输，打赢）'); else lose(g, label + '/周芷若（允许输，打输）');
  expectRoom(g, 'yitian.hai.hy_reef', label + '（周芷若打完人还在岬上）');
  if (winZhou) expectFlag(g, 'yitian.c15_saw', label); else expectNoFlag(g, 'yitian.c15_saw', label);
  pick(g, '……', label);
  pick(g, tell ? '告诉他' : '什么也没看见', label);
  expectFlag(g, tell ? 'yitian.c15_tell' : 'yitian.c15_quiet', label);
  expectFlag(g, 'yitian.c15_found', label);
  expectRoom(g, 'yitian.hai.hy_hill', label + '（过场到山坡）');
  expectGoal(g, 'yitian.goal.c15.4', label);
  ex(g, '南', label);
  expectRoom(g, 'yitian.hai.hy_beach', label);
  pick(g, '和谢逊一起迎上去', label);
  if (loseGb) { lose(g, label + '/丐帮（故意打输）'); return; }
  win(g, label + '/丐帮');
  expectFlag(g, 'yitian.c15_gb', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch15_done', label);
  expectRoom(g, 'yitian.hai.dock', label + '（过场回福州码头）');
  expectCap(g, 'yitian.qishang', 80, label);
  expectCap(g, 'yitian.qiankun', 100, label);
  expectGoal(g, 'yitian.goal.c15.6', label);
  noDialog(g, label + '（收尾之后）');
  // 码头的船老大认得灵蛇岛、荒岛
  ex(g, '对话 黄阿七', label);
  pick(g, '去那座荒岛', label);
  expectRoom(g, 'yitian.hai.hy_beach', label + '（章节后再去荒岛）'); noDialog(g, label);
  ex(g, '东', label); noDialog(g, label + '（章节后沙嘴）');
  ex(g, '西', label); ex(g, '对话 小船', label); pick(g, '划回福州码头', label);
  expectRoom(g, 'yitian.hai.dock', label);
  ex(g, '对话 黄阿七', label); pick(g, '去灵蛇岛', label);
  expectRoom(g, 'yitian.hai.ls_beach', label + '（章节后再去灵蛇岛）'); noDialog(g, label);
  ex(g, '北', label); ex(g, '北', label); noDialog(g, label + '（章节后石屋）');
  ex(g, '南', label); ex(g, '东', label); noDialog(g, label + '（章节后望海崖）');
  if (g.exits()['下']) note(`${label}：波斯船走了，望海崖不该还能往下`);
  ex(g, '西', label); ex(g, '南', label); ex(g, '对话 旧舢板', label); pick(g, '划回福州码头', label);
  expectRoom(g, 'yitian.hai.dock', label);
}

// ================= 第十六章 =================

function c16open(g, label) {
  g.enter('jiaxing.station');
  ex(g, '西南', label);
  expectRoom(g, 'yitian.hz.road', label);
  expectFlag(g, 'yitian.ch16', label);
  checkpoint(g, 'yitian.16', label);
  saw('朱元璋', label);
  pick(g, '……', label);
}
function c16road(g, label, { loseIt = false } = {}) {
  pick(g, '冲上去拦住那个千户', label);
  if (loseIt) { lose(g, label + '/千户（故意打输）'); return; }
  win(g, label + '/千户');
  expectFlag(g, 'yitian.c16_road', label);
  expectGoal(g, 'yitian.goal.c16.2', label);
  ex(g, '西北', label);
  expectRoom(g, 'yitian.hz.gate', label);
}
function c16gate(g, label, how) {
  threshold(g, label, how, { qiao: '踩着粮袋', hp: '用肩膀顶住粮车', party: '喊着号子' }, '现在还进不去');
  expectFlag(g, 'yitian.c16_in', label);
  expectRoom(g, 'yitian.hz.street', label + '（过场进城）');
}
function c16yard(g, label, { tell, saw15, told, loseNight = false }) {
  ex(g, '东', label);
  expectRoom(g, 'yitian.hz.yard', label);
  saw(tell ? '我谢谢他不信' : '咱们两个都当没那回事', label + '（读 c15_tell/quiet）');
  if (saw15) saw('袖口扎得紧紧的', label + '（读 c15_saw）'); else notSaw('袖口扎得紧紧的', label);
  saw(told ? '再也放不下' : '好好谢你', label + '（读 told/kept）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.c16_zhou', label);
  pick(g, '抬头去看', label);
  pick(g, '上房拦住他们', label);
  if (loseNight) { lose(g, label + '/神箭八雄（故意打输）'); return; }
  win(g, label + '/神箭八雄');
  expectFlag(g, 'yitian.c16_yard', label);
  expectGoal(g, 'yitian.goal.c16.5', label);
}
function c16wed(g, label, { stay, told }) {
  ex(g, '西', label); ex(g, '北', label);
  expectRoom(g, 'yitian.hz.hall', label);
  pick(g, '……', label); pick(g, '……', label);
  pick(g, stay ? '留在喜堂' : '追出去', label);
  expectFlag(g, stay ? 'yitian.c16_stay' : 'yitian.c16_follow', label);
  expectNoFlag(g, stay ? 'yitian.c16_follow' : 'yitian.c16_stay', label);
  if (stay) saw(told ? '大概会笑的' : '说了一声谢谢', label + '（喜堂读 told/kept）');
  else saw('少林寺', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch16_done', label);
  saw('屠狮大会', label);
  expectCap(g, 'shendiao.xuantie', 165, label);
  expectCap(g, 'shendiao.tanzhi', 165, label);
  expectGoal(g, 'yitian.goal.c16.7', label);
  noDialog(g, label + '（收尾之后）');
  ex(g, '南', label); ex(g, '东', label); noDialog(g, label + '（章节后后堂）');
  ex(g, '西', label); ex(g, '东南', label); noDialog(g, label + '（章节后城门）');
  ex(g, '东南', label); noDialog(g, label + '（章节后官道）');
  ex(g, '东北', label); expectRoom(g, 'jiaxing.station', label + '（回嘉兴）');
}

// ---------------- 路线 1：巧；c06_me、c05_boat、c11_zhou、学过九阴；说"我也知道"；三使打赢；打赢周芷若；告诉张无忌；留在喜堂 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { [QIAO]: 244, 'shediao.jiuyin': 140 }, flags: { 'yitian.c06_me': true, 'yitian.c05_boat': true, 'yitian.c11_zhou': true } });
  c13open(g, label); c13gate(g, label); c13climb(g, label, 'qiao'); c13top(g, label, { told: true, c06: 'me' });
  c14open(g, label); c14xie(g, label, 'boat'); c14shi(g, label, true); c14board(g, label, 'qiao'); c14deck(g, label, { told: true });
  c15open(g, label, { c11: true }); c15cross(g, label, 'qiao'); c15reef(g, label, { told: true, winZhou: true, tell: true, jiuyin: true });
  c16open(g, label); c16road(g, label); c16gate(g, label, 'qiao'); c16yard(g, label, { tell: true, saw15: true, told: true }); c16wed(g, label, { stay: true, told: true });
}

// ---------------- 路线 2：内功／气血；c06_heir、c05_island；不作声；三使打输；输给周芷若；不说；跟出去 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { [INNER]: 176 }, hp: 3050, flags: { 'yitian.c06_heir': true, 'yitian.c05_island': true } });
  c13open(g, label); c13gate(g, label); c13climb(g, label, 'inner'); c13top(g, label, { told: false, c06: 'heir' });
  c14open(g, label); c14xie(g, label, 'island'); c14shi(g, label, false); c14board(g, label, 'hp'); c14deck(g, label, { told: false });
  c15open(g, label, { c11: false }); c15cross(g, label, 'inner'); c15reef(g, label, { told: false, winZhou: false, tell: false, jiuyin: false });
  c16open(g, label); c16road(g, label); c16gate(g, label, 'hp'); c16yard(g, label, { tell: false, saw15: false, told: false }); c16wed(g, label, { stay: false, told: false });
}

// ---------------- 路线 3：组队；c06_none；没有第五章标记；不作声后留在喜堂 ----------------
{
  const label = '路线3';
  const g = newGame({ hp: 2500, flags: { 'yitian.c06_none': true } });
  c13open(g, label); c13gate(g, label);
  withParty(g); ex(g, '东', label); ex(g, '西', label); // 先在柴房叫上队友再回塔院（门槛在对话打开时过滤）
  c13climb(g, label, 'party'); c13top(g, label, { told: false, c06: 'none' });
  c14open(g, label); c14xie(g, label, 'nil'); c14shi(g, label, true);
  // 三使之后的门槛：对话已经打开了，先退回去带上队友再来
  pick(g, '现在还过不去', label); pick(g, '先退回崖顶', label);
  withParty(g); ex(g, '西', label); ex(g, '东', label);
  c14board(g, label, 'party'); c14deck(g, label, { told: false });
  c15open(g, label, { c11: false });
  pick(g, '现在还过不去', label); pick(g, '先退回沙滩', label); withParty(g); ex(g, '西', label); ex(g, '东', label);
  c15cross(g, label, 'party'); c15reef(g, label, { told: false, winZhou: true, tell: false, jiuyin: false });
  c16open(g, label); c16road(g, label);
  pick(g, '现在还进不去', label); pick(g, '先退回官道', label); withParty(g); ex(g, '东南', label); ex(g, '西北', label);
  c16gate(g, label, 'party'); c16yard(g, label, { tell: false, saw15: true, told: false }); c16wed(g, label, { stay: true, told: false });
}

// ---------------- 路线 4：门槛不够不锁人；每场必胜战打输重来；没有 c06 标记 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { [QIAO]: 244 }, hp: 2500 });
  // 第十三章：番僧打输
  c13open(g, label); c13gate(g, label, { loseIt: true });
  lose(g, label + '/番僧（故意打输）');
  expectRoom(g, 'shediao.zd.inn', label + '（打输回到客店）');
  expectFlag(g, 'yitian.ch13', label + '（ch13 保留）');
  noDialog(g, label);
  ex(g, '北', label); noDialog(g, label + '（重上大街不重演开场）');
  c13gate(g, label + '（重来）');
  g.state.player.skills[QIAO] = 50;
  ex(g, '东', label); ex(g, '西', label);
  if (!has(g, '现在还上不去')) note(`${label}：功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label); pick(g, '先退到暗处', label);
  ex(g, '南', label); expectRoom(g, 'yitian.da.lane', label + '（门槛不锁人）');
  g.state.player.skills[QIAO] = 244;
  ex(g, '北', label);
  c13climb(g, label, 'qiao');
  c13top(g, label, { told: true, c06: 'nil', loseLu: true });
  expectRoom(g, 'shediao.zd.inn', label + '（鹿杖客打输回客店）');
  expectNoFlag(g, 'yitian.c13_gate', label + '（回滚）');
  ex(g, '北', label); c13gate(g, label + '（再来）'); c13climb(g, label + '（再来）', 'qiao');
  c13top(g, label + '（再来）', { told: true, c06: 'nil' });
  // 第十四章：宝树王打输
  c14open(g, label); c14xie(g, label, 'nil');
  g.state.player.skills[QIAO] = 50; // 门槛对话是从三使那场战斗接过来的（锁定），先把功力降下来
  c14shi(g, label, false);
  if (!has(g, '现在还过不去')) note(`${label}：第十四章功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回崖顶', label);
  ex(g, '西', label); expectRoom(g, 'yitian.hai.ls_wood', label + '（第十四章门槛不锁人）');
  g.state.player.skills[QIAO] = 244; ex(g, '东', label);
  c14board(g, label, 'qiao'); c14deck(g, label, { told: true, loseIt: true });
  expectRoom(g, 'yitian.hai.ls_beach', label + '（宝树王打输回海滩）');
  expectNoFlag(g, 'yitian.c14_xie', label + '（回滚）');
  noDialog(g, label);
  ex(g, '对话 旧舢板', label); pick(g, '划回福州码头', label); expectRoom(g, 'yitian.hai.dock', label + '（中途回码头练功）'); noDialog(g, label);
  ex(g, '对话 黄阿七', label); pick(g, '去灵蛇岛', label); expectRoom(g, 'yitian.hai.ls_beach', label);
  c14xie(g, label + '（再来）', 'nil'); c14shi(g, label + '（再来）', true); c14board(g, label + '（再来）', 'qiao'); c14deck(g, label + '（再来）', { told: true });
  // 第十五章：丐帮打输
  c15open(g, label, { c11: false });
  g.state.player.skills[QIAO] = 50; ex(g, '西', label); ex(g, '东', label);
  if (!has(g, '现在还过不去')) note(`${label}：第十五章功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回沙滩', label);
  ex(g, '西', label); expectRoom(g, 'yitian.hai.hy_beach', label + '（第十五章门槛不锁人）'); noDialog(g, label);
  g.state.player.skills[QIAO] = 244; ex(g, '东', label);
  c15cross(g, label, 'qiao'); c15reef(g, label, { told: true, winZhou: true, tell: true, jiuyin: false, loseGb: true });
  expectRoom(g, 'yitian.hai.hy_beach', label + '（丐帮打输回荒岛沙滩）');
  expectNoFlag(g, 'yitian.c15_found', label + '（回滚）');
  noDialog(g, label + '（回到检查点不跑触发）');
  ex(g, '北', label); ex(g, '南', label);
  saw('六个人都活着', label + '（重来从上岸演起）');
  pick(g, '……', label); pick(g, '……', label); pick(g, '……', label);
  ex(g, '东', label); c15cross(g, label + '（再来）', 'qiao'); c15reef(g, label + '（再来）', { told: true, winZhou: false, tell: false, jiuyin: false });
  // 第十六章：千户打输、神箭八雄打输
  c16open(g, label); c16road(g, label, { loseIt: true });
  expectRoom(g, 'jiaxing.station', label + '（千户打输回车马行）');
  ex(g, '西南', label);
  if (!has(g, '冲上去拦住那个千户')) note(`${label}：重来后官道上没有重新开打（重来触发被开端触发顶掉？）`);
  notSaw('久仰', label + '（重来不重演开端）');
  c16road(g, label + '（重来）');
  g.state.player.skills[QIAO] = 50; ex(g, '东南', label); ex(g, '西北', label);
  if (!has(g, '现在还进不去')) note(`${label}：第十六章功力不够时没有"现在还进不去"`);
  pick(g, '现在还进不去', label); pick(g, '先退回官道', label);
  ex(g, '东南', label); expectRoom(g, 'yitian.hz.road', label + '（第十六章门槛不锁人）'); noDialog(g, label);
  g.state.player.skills[QIAO] = 244; ex(g, '西北', label);
  c16gate(g, label, 'qiao'); c16yard(g, label, { tell: false, saw15: false, told: true, loseNight: true });
  expectRoom(g, 'jiaxing.station', label + '（神箭八雄打输回车马行）');
  expectNoFlag(g, 'yitian.c16_road', label + '（回滚）');
  ex(g, '西南', label); c16road(g, label + '（再来）'); c16gate(g, label + '（再来）', 'qiao');
  c16yard(g, label + '（再来）', { tell: false, saw15: false, told: true }); c16wed(g, label + '（再来）', { stay: false, told: true });
}

if (stubs.length) console.log('（用了替身：' + stubs.join('、') + '）');
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 倚天第十三~十六章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来），四处门槛三条路，六场必胜战打输重来，三使、周芷若两场允许输的赢输，c03_secret、c05 两种与无、c06 三种与无、c11_zhou 有无、learned:jiuyin 有无，c13 说／不说，c15 告诉／不说、看见／没看见，c16 留下／跟出去，章节后各处回得去');
