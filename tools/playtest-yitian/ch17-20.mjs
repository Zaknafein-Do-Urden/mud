// 倚天第十七到二十章走查：node tools/playtest-yitian/ch17-20.mjs（在任意目录运行）
// 照 tools/playtest-shendiao/ch16-18.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记手动设：射雕、神雕全线，倚天第一~十六章完成；别的章节在共享房间里的触发条件按"已经走过"设好。
// 第二章的武当崖上小屋（yitian.wd.hut）若还没写，脚本里补替身（见 STUB），汇报里说明。

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

const STUB = `
=== room: yitian.wd.hut
name: 武当山·崖上小屋（替身）
exits: 南=wudang.hall
---
替身房间。

=== patch: wudang.hall
exits: 北=yitian.wd.hut
`;

let DB = null;
function loadDb() {
  if (DB) return DB;
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  if (!db.room['yitian.wd.hut']) {
    addBlocks(db, parse(STUB, 'stub.md'), 'stub.md');
    stubs.push('武当崖上小屋（第二章还没写）');
  }
  DB = db;
  return db;
}

// 别的章节在共享房间里的触发条件：按"已经走过"设好
const OTHERS = ['c02_foot', 'c02_cross', 'c02_hut', 'c06_ask', 'c12_out', 'c12_up', 'c12_asan', 'c12_xm'];

function newGame({ skills = {}, flags = {}, items = {}, hp = 0 } = {}) {
  const db = loadDb();
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, { 'yitian.qishang': 120, 'shendiao.xuantie': 165, 'yitian.qiankun': 130 }, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(st.player.skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  for (const s of ['shediao', 'shendiao', 'yitian']) st.flags[`${s}.started`] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (let i = 1; i <= 18; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  for (let i = 1; i <= 16; i++) { st.flags[`yitian.ch${i}`] = true; st.flags[`yitian.ch${i}_done`] = true; }
  for (const f of OTHERS) st.flags[`yitian.${f}`] = true;
  st.flags['shediao.raid'] = true; // 射雕第二章牛家村夜袭：早就走过了
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
      if (u.isPlayer) { u.mp = u.maxMp; u.hp = 1e9; } // 允许输的强敌一下能打掉几百气血，测试角色气血顶高，免得把"打赢"走成"打输"
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
  return Object.values(g.db.goal).filter((x) => /^yitian\.goal\.c(1[789]|20)\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const noDialog = (g, label) => { if (g.dialog) note(`${label}：不该弹出对话（${g.dialog.map((c) => c.text).join(' / ')}）`); };
const checkpoint = (g, ch, label) => { if (g.state.checkpoint?.chapter !== ch) note(`${label}：检查点没有设到 ${ch}`); };

const QIAO = 'shendiao.tanzhi'; // 巧类外功
const INNER = 'quanzhen.xinfa'; // 内功
const withParty = (g) => { g.party = { members: [{ id: 'friend' }] }; };
const noParty = (g) => { g.party = null; };
const FOR_BAN = ['尚未编写', '待续', '敬请期待'];

// ================= 第十七章 =================

function c17open(g, label) {
  g.enter('luoyang.station');
  ex(g, '东南', label);
  expectRoom(g, 'shaolin.gate', label);
  expectFlag(g, 'yitian.ch17', label);
  checkpoint(g, 'yitian.17', label);
  pick(g, '进寺', label);
  expectGoal(g, 'yitian.goal.c17.1', label);
}
function c17square(g, label, { c06, loseIt = false } = {}) {
  ex(g, '北', label); expectRoom(g, 'shaolin.hall', label);
  ex(g, '西北', label); expectRoom(g, 'yitian.sl.square', label);
  pick(g, '……', label);
  const w = { me: '你认了', heir: '你的先人', none: '不答也是一种答法', '': '老糊涂了' }[c06 ?? ''];
  saw(w, label + `（俞莲舟读 c06：${c06 ?? '无'}）`);
  pick(g, '和俞二侠一起下场', label);
  if (loseIt) return;
  win(g, label + '/陈友谅宋青书');
  expectFlag(g, 'yitian.c17_song', label);
  pick(g, '……', label);
  expectGoal(g, 'yitian.goal.c17.2', label);
}
function c17foot(g, label, how) {
  if (how === 'party') withParty(g);
  ex(g, '北', label); expectRoom(g, 'yitian.sl.foot', label);
  const opts = { qiao: '纵身而上', inner: '踩着油柱', party: '托你一把' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还上不去')) note(`${label}：满足门槛时不该出现"现在还上不去"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, 'yitian.c17_up', label);
  expectRoom(g, 'yitian.sl.tai', label + '（过场上擂台）');
}
function c17tai(g, label, { winZhou, zhou, cuijian, ceiling }) {
  saw(zhou ? '你看见我手抖了没有' : '你没看见。也好', label + '（读 c11_zhou）');
  saw(cuijian ? '一灯大师译出了那段总纲' : '最后都没有好下场', label + '（读 learned:cuijian）');
  saw('梅超风', label);
  pick(g, '接她的爪', label);
  if (winZhou) win(g, label + '/周芷若（允许输，打赢）'); else lose(g, label + '/周芷若（允许输，打输）');
  expectRoom(g, 'yitian.sl.tai', label + '（周芷若打完人还在台上）');
  saw(winZhou ? '你为什么不打下来' : '我不想伤你', label);
  pick(g, '……', label);
  pick(g, '……', label);
  saw(ceiling ? '石室的屋顶上刻满了字' : '古墓里那个穿白衣的女子', label + '（读 c04_ceiling）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch17_done', label);
  expectCap(g, 'yitian.qishang', 120, label);
  expectCap(g, 'yitian.qiankun', 130, label);
  expectCap(g, 'shediao.jiuyin', 165, label);
  expectGoal(g, 'yitian.goal.c17.4', label);
  ex(g, '下', label); noDialog(g, label + '（擂台下）');
  ex(g, '南', label); expectRoom(g, 'yitian.sl.square', label); noDialog(g, label + '（会场）');
  ex(g, '东', label); expectRoom(g, 'yitian.sl.peng', label); ex(g, '西', label);
}

// ================= 第十八章 =================

function c18open(g, label) {
  ex(g, '西北', label); expectRoom(g, 'yitian.sl.path', label);
  expectFlag(g, 'yitian.ch18', label);
  checkpoint(g, 'yitian.18', label);
  pick(g, '跟他上山', label);
  expectGoal(g, 'yitian.goal.c18.1', label);
}
function c18pine(g, label, how, { winCircle = true, c06 } = {}) {
  if (how === 'party') withParty(g);
  ex(g, '北', label); expectRoom(g, 'yitian.sl.sansong', label);
  const opts = { qiao: '看准空当', hp: '硬吃一索', party: '背靠背' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还进不去')) note(`${label}：满足门槛时不该出现"现在还进不去"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, 'yitian.c18_in', label);
  pick(g, '和张无忌一起迎上去', label);
  if (winCircle) win(g, label + '/渡厄三僧（允许输，打赢）'); else lose(g, label + '/渡厄三僧（允许输，打输）');
  expectRoom(g, 'yitian.sl.sansong', label + '（伏魔圈打完人还在松下）');
  pick(g, '……', label);
  const w = { me: '答了"是"', heir: '那个外人的后人', none: '不答，是对的', '': '看谁都像从前见过的人' }[c06 ?? ''];
  saw(w, label + `（渡厄读 c06：${c06 ?? '无'}）`);
  expectFlag(g, 'yitian.c18_circle', label);
  expectGoal(g, 'yitian.goal.c18.3', label);
}
function c18pit(g, label, { c05, pu, loseIt = false }) {
  ex(g, '下', label); expectRoom(g, 'yitian.sl.pit', label);
  const w = { boat: '追了我大半夜', island: '一个一个把人扶起来', '': '很久以前就听过' }[c05 ?? ''];
  saw(w, label + `（谢逊读 c05：${c05 ?? '无'}）`);
  saw(pu ? '你练了没有' : '我教过你几句拳诀', label + '（读七伤拳谱）');
  pick(g, '站到谢逊身边', label);
  if (loseIt) { lose(g, label + '/成昆（故意打输）'); return; }
  win(g, label + '/成昆');
  expectFlag(g, 'yitian.c18_kun', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch18_done', label);
  expectCap(g, 'yitian.jiuyang', 170, label);
  expectCap(g, 'shediao.cuijian', 165, label);
  expectGoal(g, 'yitian.goal.c18.5', label);
  ex(g, '上', label); noDialog(g, label + '（回三棵松）');
  ex(g, '南', label); noDialog(g, label + '（回小径）');
}

// ================= 第十九章 =================

function c19open(g, label) {
  g.enter('linan.station');
  ex(g, '西北', label); expectRoom(g, 'yitian.mj.road', label);
  expectFlag(g, 'yitian.ch19', label);
  checkpoint(g, 'yitian.19', label);
  pick(g, '进营去', label);
}
function c19camp(g, label, { loseDead = false, loseRaid = false } = {}) {
  ex(g, '西北', label); expectRoom(g, 'yitian.mj.camp', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.c19_meet', label);
  expectGoal(g, 'yitian.goal.c19.2', label);
  ex(g, '北', label); expectRoom(g, 'yitian.mj.tent', label);
  pick(g, '截住他们', label);
  if (loseDead) { lose(g, label + '/死士（故意打输）'); return; }
  win(g, label + '/死士');
  pick(g, '迎上那个提刀的大汉', label);
  if (loseRaid) { lose(g, label + '/张定边（故意打输）'); return; }
  win(g, label + '/张定边');
  expectFlag(g, 'yitian.c19_raid', label);
  pick(g, '……', label);
  saw('赵敏的笔迹', label);
  expectGoal(g, 'yitian.goal.c19.3', label);
}
function c19zhu(g, label, how, tell) {
  if (how === 'party') withParty(g);
  ex(g, '南', label); ex(g, '东', label); expectRoom(g, 'yitian.mj.zhu', label);
  const opts = { qiao: '换岗那一眨眼', inner: '屏住气息', party: '引开亲兵' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还进不去')) note(`${label}：满足门槛时不该出现"现在还进不去"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, 'yitian.c19_seen', label);
  pick(g, tell ? '把看见的告诉张无忌' : '什么也不说', label);
  expectFlag(g, tell ? 'yitian.c19_tell' : 'yitian.c19_keep', label);
  pick(g, '……', label);
  expectRoom(g, 'yitian.mj.tent', label + '（过场回大帐）');
  saw(tell ? '你告诉我的那些名字' : '你没说出口的那些', label + '（读 c19_tell/keep）');
  pick(g, '答应他', label);
  expectFlag(g, 'yitian.ch19_done', label);
  for (const id of ['yitian.qishang', 'yitian.qiankun', 'shendiao.tianluo', 'shediao.luoying']) expectCap(g, id, 160, label);
  expectGoal(g, 'yitian.goal.c19.5', label);
}

// ================= 第二十章 =================

const ALL180 = ['shediao.yangqiang', 'shediao.yuenv', 'quanzhen.jianfa', 'quanzhen.xinfa', 'shediao.nanshan', 'quanzhen.jinyan', 'shediao.luoying', 'shediao.kongming', 'shediao.jiuyin', 'shediao.cuijian', 'shendiao.tianluo', 'shendiao.tanzhi', 'shendiao.xuantie'];

function c20open(g, label) {
  ex(g, '南', label); expectRoom(g, 'yitian.mj.camp', label);
  expectFlag(g, 'yitian.ch20', label);
  checkpoint(g, 'yitian.20', label);
  pick(g, '跟她去', label);
}
function c20an(g, label, { c13, saw15, zhou, secret, cuijian }) {
  ex(g, '西', label); expectRoom(g, 'yitian.mj.an', label);
  const w = { told: '你在旁边说你也知道', kept: '你一声不吭', '': '不止我一个' }[c13 ?? ''];
  saw(w, label + `（读 c13：${c13 ?? '无'}）`);
  if (saw15) saw('袖子里的黄绢', label); else notSaw('袖子里的黄绢', label);
  if (zhou) saw('我刺他那一剑，你看见了', label); else notSaw('我刺他那一剑，你看见了', label);
  pick(g, '……', label);
  if (!g.state.player.inventory['yitian.wumu']) note(`${label}：没拿到武穆遗书`);
  if (!g.state.player.inventory['yitian.duanren']) note(`${label}：没拿到断刀残剑`);
  saw(secret ? '襄阳城破的前夜' : '华山上黄蓉从你手里接过', label + '（读 c03_secret）');
  saw(cuijian ? '原来是这样读的' : '有人读岔了', label + '（读 learned:cuijian）');
  pick(g, '出庵', label);
  expectFlag(g, 'yitian.c20_book', label);
}
function c20ford(g, label, { loseShao = false } = {}) {
  ex(g, '北', label); expectRoom(g, 'yitian.mj.ford', label);
  pick(g, '不放', label);
  if (loseShao) { lose(g, label + '/百户（故意打输）'); return; }
  win(g, label + '/百户');
  expectFlag(g, 'yitian.c20_shao', label);
  pick(g, '看那座浮桥', label);
  expectRoom(g, 'yitian.mj.ford', label);
}
function c20cross(g, label, how) {
  // 对话打开时就过滤选项：组队要在走进渡口之前准备好，所以这里离开再进来
  if (how === 'party') { if (g.dialog) pick(g, '现在还过不去', label); if (g.dialog) pick(g, '先退回岸上', label); withParty(g); ex(g, '南', label); ex(g, '北', label); }
  const opts = { qiao: '踩着船帮一路掠过去', hp: '顶在头上', party: '一个撑一个护' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还过不去')) note(`${label}：满足门槛时不该出现"现在还过不去"`);
  pick(g, opts[how], label);
  noParty(g);
  expectFlag(g, 'yitian.c20_cross', label);
  expectRoom(g, 'yitian.mj.bank', label + '（过场到对岸）');
}
function c20bank(g, label, { loseIt = false, wumu, iron }) {
  pick(g, '迎上去', label);
  if (loseIt) { lose(g, label + '/王保保（故意打输）'); return; }
  win(g, label + '/王保保');
  expectFlag(g, 'yitian.c20_bao', label);
  pick(g, '……', label);
  saw(wumu ? '交到他手里的' : '石匣盖子背面', label + '（读 shediao.c19_wumu）');
  pick(g, '……', label);
  const o = { xy: '送回襄阳', plow: '熔了打成犁头', wd: '带上武当山' }[iron];
  pick(g, o, label);
  expectFlag(g, `yitian.c20_iron_${iron}`, label);
  if (g.state.player.inventory['yitian.duanren']) note(`${label}：断铁交出去了还在包里`);
  pick(g, '……', label);
  expectGoal(g, 'yitian.goal.c20.5', label);
}
function c20hut(g, label, { c06, self, iron }) {
  g.enter('wudang.gate');
  ex(g, '北', label); ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'yitian.wd.hut', label);
  const iw = { wd: '我替你看着', xy: '那是它该去的地方', plow: '犁天下最硬的地' }[iron];
  saw(iw, label + `（读 c20_iron：${iron}）`);
  pick(g, '……', label);
  const w = { me: '你说是。我信了', heir: '那是你的先人。我信了', none: '你没答。我后来想', '': '我一直想问你' }[c06 ?? ''];
  saw(w, label + `（张三丰读 c06：${c06 ?? '无'}）`);
  const sw = { guard: '你说你是守城的', witness: '你说你是记着的人', road: '你说你还在路上', '': '只记得你看了很久的云' }[self ?? ''];
  saw(sw, label + `（读 c18_self：${self ?? '无'}）`);
  pick(g, '……', label);
  expectFlag(g, 'yitian.ch20_done', label);
  for (const id of ['yitian.jiuyang', 'yitian.qiankun', 'yitian.qishang']) expectCap(g, id, 200, label);
  for (const id of ALL180) expectCap(g, id, 180, label);
  pick(g, '……', label);
  saw('三部书，各归其处', label);
  saw('三部曲至此终', label);
  noDialog(g, label + '（收尾之后）');
  expectGoal(g, 'yitian.goal.c20.6', label);
  const gb = g.db.goal['yitian.goal.c20.6'];
  const gtext = JSON.stringify(gb);
  for (const w2 of FOR_BAN) if (gtext.includes(w2)) note(`${label}：终章目标里有占位词「${w2}」`);
}
function coda(g, label) {
  g.enter('shediao.niujia.street');
  ex(g, '北', label); expectRoom(g, 'shediao.niujia.tavern', label);
  saw('摆两只碗', label + '（牛家村尾声）');
  expectFlag(g, 'yitian.c20_home', label);
  ex(g, '南', label); ex(g, '北', label); noDialog(g, label + '（尾声只演一次）');
}
function after(g, label) {
  // 章节之后各处还回得去，不重演
  g.enter('shaolin.hall');
  ex(g, '西北', label); expectRoom(g, 'yitian.sl.square', label); noDialog(g, label);
  ex(g, '北', label); ex(g, '上', label); expectRoom(g, 'yitian.sl.tai', label + '（章节之后擂台还在）'); noDialog(g, label);
  ex(g, '下', label); ex(g, '南', label); ex(g, '西北', label); ex(g, '北', label); expectRoom(g, 'yitian.sl.sansong', label); noDialog(g, label);
  ex(g, '下', label); expectRoom(g, 'yitian.sl.pit', label); noDialog(g, label);
  g.enter('linan.station');
  ex(g, '西北', label); ex(g, '西北', label); expectRoom(g, 'yitian.mj.camp', label); noDialog(g, label);
  ex(g, '东', label); expectRoom(g, 'yitian.mj.zhu', label); noDialog(g, label); ex(g, '西', label);
  ex(g, '西', label); ex(g, '北', label); ex(g, '北', label); expectRoom(g, 'yitian.mj.bank', label + '（章节之后对岸还在）'); noDialog(g, label);
}

// ---------------- 路线 1：巧；c06_me；c11_zhou；学过摧坚；c04_ceiling；周芷若打赢；伏魔圈打赢；c05_boat；有拳谱；告诉张无忌；c13_told；c15_saw；c03_secret；c19_wumu；守城的；埋襄阳 ----------------
{
  const label = '路线1';
  const g = newGame({
    skills: { [QIAO]: 260, 'shediao.cuijian': 100 },
    flags: { 'yitian.c06_me': true, 'yitian.c11_zhou': true, 'shendiao.c04_ceiling': true, 'yitian.c05_boat': true, 'yitian.c13_told': true, 'yitian.c15_saw': true, 'yitian.c03_secret': true, 'shediao.c19_wumu': true, 'shendiao.c18_self_guard': true },
    items: { 'yitian.qishang_pu': 1 },
  });
  c17open(g, label); c17square(g, label, { c06: 'me' }); c17foot(g, label, 'qiao'); c17tai(g, label, { winZhou: true, zhou: true, cuijian: true, ceiling: true });
  c18open(g, label); c18pine(g, label, 'qiao', { winCircle: true, c06: 'me' }); c18pit(g, label, { c05: 'boat', pu: true });
  c19open(g, label); c19camp(g, label); c19zhu(g, label, 'qiao', true);
  c20open(g, label); c20an(g, label, { c13: 'told', saw15: true, zhou: true, secret: true, cuijian: true });
  c20ford(g, label); c20cross(g, label, 'qiao'); c20bank(g, label, { wumu: true, iron: 'xy' });
  c20hut(g, label, { c06: 'me', self: 'guard', iron: 'xy' });
  coda(g, label); after(g, label);
}

// ---------------- 路线 2：内功／气血；c06_heir；周芷若打输；伏魔圈打输；c05_island；没拳谱；不说；c13_kept；记着的人；打犁头 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { [INNER]: 185 }, hp: 3300, flags: { 'yitian.c06_heir': true, 'yitian.c05_island': true, 'yitian.c13_kept': true, 'shendiao.c18_self_witness': true } });
  c17open(g, label); c17square(g, label, { c06: 'heir' }); c17foot(g, label, 'inner'); c17tai(g, label, { winZhou: false, zhou: false, cuijian: false, ceiling: false });
  c18open(g, label); c18pine(g, label, 'hp', { winCircle: false, c06: 'heir' }); c18pit(g, label, { c05: 'island', pu: false });
  c19open(g, label); c19camp(g, label); c19zhu(g, label, 'inner', false);
  c20open(g, label); c20an(g, label, { c13: 'kept', saw15: false, zhou: false, secret: false, cuijian: false });
  c20ford(g, label); c20cross(g, label, 'hp'); c20bank(g, label, { wumu: false, iron: 'plow' });
  c20hut(g, label, { c06: 'heir', self: 'witness', iron: 'plow' });
}

// ---------------- 路线 3：组队；c06_none；没有前面各章的分支标记；还在路上；交给张三丰 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'yitian.c06_none': true, 'shendiao.c18_self_road': true } });
  c17open(g, label); c17square(g, label, { c06: 'none' }); c17foot(g, label, 'party'); c17tai(g, label, { winZhou: true, zhou: false, cuijian: false, ceiling: false });
  c18open(g, label); c18pine(g, label, 'party', { c06: 'none' }); c18pit(g, label, { pu: false });
  c19open(g, label); c19camp(g, label); c19zhu(g, label, 'party', true);
  c20open(g, label); c20an(g, label, { saw15: false, zhou: false, secret: false, cuijian: false });
  c20ford(g, label); c20cross(g, label, 'party'); c20bank(g, label, { wumu: false, iron: 'wd' });
  c20hut(g, label, { c06: 'none', self: 'road', iron: 'wd' });
}

// ---------------- 路线 4：门槛不够不锁人；每场必胜战打输重来；没有 c06 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { [QIAO]: 260 } });
  // 第十七章：陈友谅打输
  c17open(g, label); c17square(g, label, { loseIt: true });
  lose(g, label + '/陈友谅（故意打输）');
  expectRoom(g, 'luoyang.station', label + '（第十七章打输回洛阳车马行）');
  expectFlag(g, 'yitian.ch17', label + '（ch17 保留）');
  expectNoFlag(g, 'yitian.c17_song', label + '（回滚）');
  noDialog(g, label);
  ex(g, '东南', label); noDialog(g, label + '（重来不重演山门开场）');
  c17square(g, label + '（重来）', {});
  g.state.player.skills[QIAO] = 50;
  ex(g, '北', label);
  if (!has(g, '现在还上不去')) note(`${label}：功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label); pick(g, '先退开', label);
  ex(g, '南', label); expectRoom(g, 'yitian.sl.square', label + '（第十七章门槛不锁人）');
  g.state.player.skills[QIAO] = 260;
  c17foot(g, label, 'qiao'); c17tai(g, label, { winZhou: false, zhou: false, cuijian: false, ceiling: false });
  // 第十八章：门槛不够；成昆打输
  g.state.player.skills[QIAO] = 50;
  c18open(g, label);
  ex(g, '北', label);
  if (!has(g, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"`);
  pick(g, '现在还进不去', label); pick(g, '先退下山梁', label);
  ex(g, '南', label); expectRoom(g, 'yitian.sl.path', label + '（第十八章门槛不锁人）');
  g.state.player.skills[QIAO] = 260;
  c18pine(g, label, 'qiao', {}); c18pit(g, label, { loseIt: true });
  expectRoom(g, 'luoyang.station', label + '（成昆打输回洛阳车马行）');
  expectNoFlag(g, 'yitian.c18_circle', label + '（回滚）');
  ex(g, '东南', label); ex(g, '北', label); ex(g, '西北', label); noDialog(g, label + '（会场不重演）');
  ex(g, '西北', label); noDialog(g, label + '（小径不重演开场）');
  c18pine(g, label + '（重来）', 'qiao', {}); c18pit(g, label + '（重来）', {});
  // 第十九章：死士打输、张定边打输、门槛不够
  c19open(g, label); c19camp(g, label, { loseDead: true });
  expectRoom(g, 'linan.station', label + '（死士打输回临安车马行）');
  ex(g, '西北', label); noDialog(g, label + '（官道不重演开场）');
  c19camp(g, label + '（重来）', { loseRaid: true });
  expectRoom(g, 'linan.station', label + '（张定边打输回临安车马行）');
  expectNoFlag(g, 'yitian.c19_meet', label + '（回滚）');
  ex(g, '西北', label);
  c19camp(g, label + '（再来）');
  g.state.player.skills[QIAO] = 50;
  ex(g, '南', label); ex(g, '东', label);
  if (!has(g, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"（第十九章）`);
  pick(g, '现在还进不去', label); pick(g, '先走开', label);
  ex(g, '西', label); expectRoom(g, 'yitian.mj.camp', label + '（第十九章门槛不锁人）');
  ex(g, '北', label); noDialog(g, label + '（大帐不重演劫营）');
  g.state.player.skills[QIAO] = 260;
  c19zhu(g, label, 'qiao', false);
  // 第二十章：哨骑打输、门槛不够、王保保打输
  c20open(g, label); c20an(g, label, { saw15: false, zhou: false, secret: false, cuijian: false });
  c20ford(g, label, { loseShao: true });
  expectRoom(g, 'linan.station', label + '（哨骑打输回临安车马行）');
  if (!g.state.player.inventory['yitian.wumu']) note(`${label}：打输重来以后武穆遗书不该丢`);
  ex(g, '西北', label); ex(g, '西北', label); noDialog(g, label + '（大营不重演第二十章开场）');
  ex(g, '西', label); c20an2(g, label);
  g.state.player.skills[QIAO] = 50;
  c20ford(g, label + '（重来）');
  if (!has(g, '现在还过不去')) note(`${label}：功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回岸上', label);
  ex(g, '南', label); expectRoom(g, 'yitian.mj.an', label + '（第二十章门槛不锁人）');
  g.state.player.skills[QIAO] = 260;
  ex(g, '北', label);
  c20cross(g, label, 'qiao'); c20bank(g, label, { loseIt: true });
  expectRoom(g, 'linan.station', label + '（王保保打输回临安车马行）');
  expectNoFlag(g, 'yitian.c20_cross', label + '（回滚）');
  ex(g, '西北', label); ex(g, '西北', label); ex(g, '西', label); c20an2(g, label + '（再来）');
  c20ford(g, label + '（再来）'); c20cross(g, label + '（再来）', 'qiao'); c20bank(g, label + '（再来）', { wumu: false, iron: 'xy' });
  c20hut(g, label, { iron: 'xy' });
}
// 重来时尼庵那一段（东西已经给过，不再重复给）
function c20an2(g, label) {
  expectRoom(g, 'yitian.mj.an', label);
  const n = g.state.player.inventory['yitian.wumu'] ?? 0;
  pick(g, '……', label);
  if ((g.state.player.inventory['yitian.wumu'] ?? 0) !== n) note(`${label}：重来时武穆遗书不该再给一次`);
  pick(g, '出庵', label);
  expectFlag(g, 'yitian.c20_book', label);
}

if (stubs.length) console.log('（用了替身：' + stubs.join('、') + '）');
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 倚天第十七到二十章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来），四处门槛三条路，六场必胜战打输重来，周芷若、伏魔圈两场允许输的赢输，c06 三种与无、c11_zhou、c13 两种与无、c15_saw、c05 两种与无、c03_secret、七伤拳谱、c04_ceiling、摧坚神爪、c19_wumu、c18_self 三种的有无，c19 告诉／不说，断铁三种去处，牛家村尾声');
