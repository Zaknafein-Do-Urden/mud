// 倚天第九到十二章走查：node tools/playtest-yitian/ch09-12.mjs（在任意目录运行）
// 照 tools/playtest-shendiao/ch16-18.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记手动设：射雕、神雕全线完成，倚天第一~八章完成；别的章节在共享房间里的触发条件按"已经走过"设好。
// 第八章的坐忘峰、第二章的崖上小屋若还没写，脚本里补替身（见 STUB），汇报里说明。

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

const STUB_ZUOWANG = `
=== room: yitian.kl.zuowang
name: 昆仑·坐忘峰下（替身）
exits: 南=chengdu.station
---
替身房间。

=== patch: chengdu.station
exits: 西北=yitian.kl.zuowang
`;
const STUB_HUT = `
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
  const missing = [];
  // 替身要在第九章之前加进去（第九章 patch 坐忘峰）：先检查真房间在不在
  const all = files.map((f) => [f, readFileSync(join(root, f), 'utf8')]);
  const hasRoom = (id) => all.some(([, t]) => t.includes(`=== room: ${id}\n`) || t.includes(`=== room: ${id}\r\n`));
  if (!hasRoom('yitian.kl.zuowang')) { addBlocks(db, parse(STUB_ZUOWANG, 'stub.md'), 'stub.md'); stubs.push('坐忘峰（第八章还没写）'); }
  if (!hasRoom('yitian.wd.hut')) { addBlocks(db, parse(STUB_HUT, 'stub.md'), 'stub.md'); stubs.push('崖上小屋（第二章还没写）'); }
  for (const [f, t] of all) addBlocks(db, parse(t, f), f);
  DB = db;
  return db;
}

// 别的章节在共享房间里的触发条件：按"已经走过"设好
const OTHERS = ['c02_part', 'c02_foot', 'c02_mongol', 'c02_cross', 'c02_hut', 'c04_salt', 'c04_yu', 'c06_ask', 'c06_crane', 'c06_guest', 'c08_kunlun', 'c08_yang', 'c03_secret'];

function newGame({ skills = {}, flags = {}, hp = 0 } = {}) {
  const db = loadDb();
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, { 'shendiao.xuantie': 140, 'shendiao.tanzhi': 140, 'shendiao.tianluo': 140, 'shediao.jiuyin': 140, 'shediao.nanshan': 140, 'shediao.yangqiang': 140, 'shediao.yuenv': 140, 'yitian.jiuyang': 100 }, skills);
  st.player.loadout = {
    outer: Object.keys(st.player.skills).filter((id) => db.skill[id]?.props.kind === '外功').slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  for (const s of ['shediao', 'shendiao', 'yitian']) st.flags[`${s}.started`] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (let i = 1; i <= 18; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  for (let i = 1; i <= 8; i++) { st.flags[`yitian.ch${i}`] = true; st.flags[`yitian.ch${i}_done`] = true; }
  for (const f of OTHERS) st.flags[`yitian.${f}`] = true;
  Object.assign(st.flags, flags);
  for (const [k, v] of Object.entries(flags)) if (v === false) delete st.flags[k];
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
  return Object.values(g.db.goal).filter((x) => /^yitian\.goal\.c(09|1[012])\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const noDialog = (g, label) => { if (g.dialog) note(`${label}：不该弹出对话（${g.dialog.map((c) => c.text).join(' / ')}）`); };
const checkpoint = (g, ch, label) => { if (g.state.checkpoint?.chapter !== ch) note(`${label}：检查点没有设到 ${ch}`); };

const QIAO = 'shendiao.tanzhi'; // 巧类外功
const INNER = 'quanzhen.xinfa'; // 内功
const withParty = (g) => { g.party = { members: [{ id: 'friend' }] }; };
const noParty = (g) => { g.party = null; };
function gate(g, label, how, opts, notyet) {
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, notyet)) note(`${label}：满足门槛时不该出现「${notyet}」`);
  pick(g, opts[how], label);
  noParty(g);
}

// ================= 第九章 =================

function c09open(g, label) {
  g.enter('chengdu.station');
  ex(g, '西北', label); ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'yitian.gm.foot', label);
  expectFlag(g, 'yitian.ch9', label);
  checkpoint(g, 'yitian.9', label);
  pick(g, '陪他往西走', label);
  expectGoal(g, 'yitian.goal.c09.1', label);
}
function c09gobi(g, label, { loseIt = false, sword } = {}) {
  ex(g, '西', label);
  expectRoom(g, 'yitian.gm.gobi', label);
  pick(g, '起身迎上去', label);
  if (loseIt) { lose(g, label + '/韦一笑（故意打输）'); return; }
  win(g, label + '/韦一笑');
  expectFlag(g, 'yitian.c09_gobi', label);
  saw('你认得那块铁', label + '（读 c03_secret）');
  if (sword) saw('华山上', label + '（读 shendiao.c18_sword）'); else notSaw('交到黄蓉手里', label);
  pick(g, '天亮了再走', label);
  expectGoal(g, 'yitian.goal.c09.2', label);
}
function c09dune(g, label, { side, winIt, c06 }) {
  ex(g, '西', label);
  expectRoom(g, 'yitian.gm.dune', label);
  const w = { me: '连脸都没老', heir: '都长一张脸', none: '这人有古怪', no: '想不起在哪里见过' }[c06];
  saw(w, label + `（殷天正读 c06：${c06}）`);
  if (side === 'ming') {
    pick(g, '站到白眉老人身边', label);
    pick(g, '迎上灭绝师太', label);
    if (winIt) win(g, label + '/灭绝（允许输，打赢）'); else lose(g, label + '/灭绝（允许输，打输）');
    expectRoom(g, 'yitian.gm.dune', label + '（灭绝打完人还在沙丘）');
    pick(g, '……', label);
  } else if (side === 'liu') {
    pick(g, '站进六派的阵里', label);
    pick(g, '接他的鹰爪', label);
    if (winIt) win(g, label + '/殷天正（允许输，打赢）'); else lose(g, label + '/殷天正（允许输，打输）');
    pick(g, '……', label);
  } else {
    pick(g, '谁也不帮', label);
    pick(g, '……', label);
  }
  expectFlag(g, { ming: 'yitian.c09_mingjiao', liu: 'yitian.c09_liupai', none: 'yitian.c09_none' }[side], label);
  expectFlag(g, 'yitian.c09_dune', label);
  pick(g, '往北追', label);
  expectGoal(g, 'yitian.goal.c09.3', label);
}
const C09_OPTS = { qiao: '踩着脚窝', inner: '提住一口真气', party: '一个在下面托' };
function c09climb(g, label, how, { side, jiuyin = true }) {
  if (how === 'party') withParty(g);
  ex(g, '北', label);
  expectRoom(g, 'yitian.gm.gate', label);
  gate(g, label, how, C09_OPTS, '现在还上不去');
  expectFlag(g, 'yitian.c09_up', label);
  expectRoom(g, 'yitian.gm.square', label + '（过场上广场）');
  pick(g, '……', label);
  saw({ ming: '第一次正眼看你', liu: '殷老头的命是他留的', none: '站在他那边' }[side], label + '（读 c09 站哪边）');
  if (jiuyin) saw('九阴真经里讲寒气', label); else notSaw('九阴真经里讲寒气', label);
  expectFlag(g, 'yitian.ch9_done', label);
  if (jiuyin) expectCap(g, 'shediao.jiuyin', 150, label);
  expectGoal(g, 'yitian.goal.c09.5', label);
}

// ================= 第十章 =================

function c10open(g, label, { side }) {
  ex(g, '北', label);
  expectRoom(g, 'yitian.gm.top', label);
  expectFlag(g, 'yitian.ch10', label);
  checkpoint(g, 'yitian.10', label);
  saw({ ming: '替殷老头挡了灭绝一剑', liu: '放干了', none: '那个姓张的小子' }[side], label + '（读 c09）');
  pick(g, '……', label);
}
function c10kun(g, label, { winIt, c06me = false }) {
  if (c06me) saw('师父的旧画', label + '（读 c06_me）'); else notSaw('师父的旧画', label);
  pick(g, '不让', label);
  if (winIt) win(g, label + '/成昆（允许输，打赢）'); else lose(g, label + '/成昆（允许输，打输）');
  expectRoom(g, 'yitian.gm.top', label);
  pick(g, '……', label);
  expectFlag(g, 'yitian.c10_kun', label);
  pick(g, '跟韦一笑去后崖', label);
  expectGoal(g, 'yitian.goal.c10.2', label);
}
function c10cliff(g, label, { loseIt = false } = {}) {
  ex(g, '东', label);
  expectRoom(g, 'yitian.gm.cliff', label);
  pick(g, '守住崖口', label);
  if (loseIt) { lose(g, label + '/崖口（故意打输）'); return; }
  win(g, label + '/崖口');
  expectFlag(g, 'yitian.c10_cliff', label);
  pick(g, '回大殿看看', label);
  ex(g, '西', label);
  expectRoom(g, 'yitian.gm.top', label);
  saw('往西院去了', label);
  expectGoal(g, 'yitian.goal.c10.3', label);
}
const C10_OPTS = { qiao: '趁着缝还没合上', hp: '用肩膀扛住', party: '一个撬住石板' };
function c10slab(g, label, how, { kongming = false } = {}) {
  if (how === 'party') withParty(g);
  ex(g, '西', label);
  expectRoom(g, 'yitian.gm.yard', label);
  gate(g, label, how, C10_OPTS, '现在还下不去');
  expectFlag(g, 'yitian.c10_in', label);
  expectRoom(g, 'yitian.gm.tunnel', label + '（过场进秘道）');
  pick(g, '往里走', label);
  expectRoom(g, 'yitian.gm.vault', label + '（过场进石室）');
  pick(g, '打开羊皮', label);
  if (g.state.player.skills['yitian.qiankun'] === undefined) note(`${label}：没学会乾坤大挪移`);
  if (kongming) saw('周伯通教你的空明拳', label); else notSaw('周伯通教你的空明拳', label);
  pick(g, '从石缝里钻出去', label);
  expectRoom(g, 'yitian.gm.cliff', label + '（过场出后崖）');
  expectFlag(g, 'yitian.ch10_done', label);
  expectGoal(g, 'yitian.goal.c10.6', label);
}

// ================= 第十一章 =================

function c11open(g, label, { side }) {
  ex(g, '西', label); ex(g, '南', label);
  expectRoom(g, 'yitian.gm.square', label);
  expectFlag(g, 'yitian.ch11', label);
  checkpoint(g, 'yitian.11', label);
  saw({ ming: '帮着殷老儿的', liu: '一夜就倒戈', none: '今天倒要帮了' }[side], label + '（读 c09）');
  pick(g, '……', label);
}
function c11a(g, label, { loseIt = false, party = false } = {}) {
  pick(g, '和张无忌一起迎上去', label);
  if (loseIt) { lose(g, label + '/华山二老（故意打输）'); return; }
  win(g, label + '/华山二老');
  expectFlag(g, 'yitian.c11_a', label);
  if (party) withParty(g); // ?party 在对话打开的那一瞬过滤
  pick(g, '挤进剑阵里去', label);
}
const C11_OPTS = { qiao: '看准两柄剑之间', inner: '一掌把挡路的剑墙', party: '一个挡住昆仑弟子' };
function c11b(g, label, how, { loseIt = false, zhou = true, c06 } = {}) {
  gate(g, label, how, C11_OPTS, '现在还进不去');
  expectFlag(g, 'yitian.c11_in', label);
  pick(g, '背靠着张无忌', label);
  if (loseIt) { lose(g, label + '/两仪剑阵（故意打输）'); return; }
  win(g, label + '/两仪剑阵');
  expectFlag(g, 'yitian.c11_b', label);
  if (c06 === 'me') saw('你不要动', label + '（读 c06_me）'); else notSaw('你不要动', label);
  pick(g, '……', label);
  pick(g, zhou ? '站在张无忌身后' : '回身去扶殷天正', label);
  expectFlag(g, zhou ? 'yitian.c11_zhou' : 'yitian.c11_zhou_far', label);
  expectNoFlag(g, zhou ? 'yitian.c11_zhou_far' : 'yitian.c11_zhou', label);
  pick(g, '……', label);
  if (c06 === 'heir') saw('配不上他', label + '（读 c06_heir）'); else notSaw('配不上他', label);
  pick(g, '回大殿', label);
  expectRoom(g, 'yitian.gm.altar', label + '（过场到圣火坛）');
  pick(g, '冲他点一点头', label);
  saw(zhou ? '你看见了，是不是' : '那就好', label + '（读 c11_zhou）');
  expectFlag(g, 'yitian.ch11_done', label);
  expectCap(g, 'yitian.qiankun', 70, label);
  expectCap(g, 'shediao.nanshan', 150, label);
  expectGoal(g, 'yitian.goal.c11.4', label);
  // 章节之后光明顶还回得去、没有剧情再跳出来
  ex(g, '东', label); expectRoom(g, 'yitian.gm.square', label); noDialog(g, label + '（章后广场）');
  ex(g, '北', label); noDialog(g, label + '（章后大殿）');
  ex(g, '西', label); noDialog(g, label + '（章后西院）');
  ex(g, '北', label); expectRoom(g, 'yitian.gm.tunnel', label + '（章后秘道还在）'); noDialog(g, label);
  ex(g, '东', label); ex(g, '东南', label); expectRoom(g, 'yitian.gm.cliff', label + '（石室通后崖）'); noDialog(g, label);
  ex(g, '西', label); ex(g, '南', label); ex(g, '南', label); ex(g, '南', label); ex(g, '东', label); ex(g, '东', label); ex(g, '南', label);
  expectRoom(g, 'yitian.kl.zuowang', label + '（下山回坐忘峰）');
  noDialog(g, label + '（坐忘峰）');
}

// ================= 第十二章 =================

function c12open(g, label, { zhou }) {
  g.enter('xiangyang.center');
  ex(g, '南', label);
  expectRoom(g, 'xiangyang.station', label);
  expectFlag(g, 'yitian.ch12', label);
  checkpoint(g, 'yitian.12', label);
  if (zhou) saw('他没有说出口的那个名字', label); else notSaw('他没有说出口的那个名字', label);
  pick(g, '陪他去绿柳山庄', label);
  expectGoal(g, 'yitian.goal.c12.1', label);
}
function c12hall(g, label, { loseIt = false, side } = {}) {
  ex(g, '东北', label); expectRoom(g, 'yitian.ll.road', label);
  ex(g, '北', label); expectRoom(g, 'yitian.ll.gate', label);
  pick(g, '跟她进庄', label);
  expectRoom(g, 'yitian.ll.hall', label + '（过场进正厅）');
  saw('是倚天剑', label + '（读 c03_secret）');
  pick(g, '撑着站起来动手', label);
  if (loseIt) { lose(g, label + '/阿二（故意打输）'); return; }
  win(g, label + '/阿二');
  expectFlag(g, 'yitian.c12_hall', label);
  pick(g, '跟着跳下去', label);
  expectRoom(g, 'yitian.ll.pit', label + '（过场下地牢）');
  if (side === 'none') saw('谁也不帮，我还以为', label); else notSaw('谁也不帮，我还以为', label);
  pick(g, '找出去的路', label);
  pick(g, '爬出去', label);
  expectRoom(g, 'yitian.ll.hall', label + '（爬回正厅）');
  expectFlag(g, 'yitian.c12_out', label);
  noDialog(g, label + '（出地牢）');
  expectGoal(g, 'yitian.goal.c12.3', label);
  ex(g, '西', label); expectRoom(g, 'yitian.ll.pit', label + '（地牢回得去）'); noDialog(g, label);
  ex(g, '东', label); ex(g, '南', label); ex(g, '南', label); ex(g, '西南', label);
  expectRoom(g, 'xiangyang.station', label);
}
const C12_OPTS = { qiao: '从旁边的峭壁', hp: '顶着箭雨硬冲', party: '一个引开弓手' };
function c12wd(g, label, how, { loseAsan = false, winXm, c06, zhou }) {
  if (how === 'party') withParty(g);
  ex(g, '西', label);
  expectRoom(g, 'wudang.gate', label);
  gate(g, label, how, C12_OPTS, '现在还上不去');
  expectFlag(g, 'yitian.c12_up', label);
  expectRoom(g, 'wudang.hall', label + '（过场上紫霄宫）');
  const w = { me: '站在我师父身边', heir: '你家先人当年在华山上护过我', none: '你站在这里，就是答了', no: '想不起来了' };
  saw(w[c06], label + `（张三丰读 c06：${c06}）`);
  for (const [k, v] of Object.entries(w)) if (k !== c06) notSaw(v, label);
  pick(g, '……', label);
  pick(g, '和张三丰一起迎上去', label);
  if (loseAsan) { lose(g, label + '/阿三（故意打输）'); return; }
  win(g, label + '/阿三');
  expectFlag(g, 'yitian.c12_asan', label);
  pick(g, '迎上玄冥二老', label);
  if (winXm) win(g, label + '/玄冥二老（允许输，打赢）'); else lose(g, label + '/玄冥二老（允许输，打输）');
  expectRoom(g, 'wudang.hall', label + '（玄冥二老打完人还在紫霄宫）');
  pick(g, '……', label);
  expectFlag(g, 'yitian.c12_xm', label);
  pick(g, '扶着张三丰', label);
  expectGoal(g, 'yitian.goal.c12.5', label);
  ex(g, '北', label);
  if (g.state.player.room === 'yitian.wd.cliff') ex(g, '北', label);
  expectRoom(g, 'yitian.wd.hut', label);
  const hw = { me: '是你帮我扛的木头', heir: '你家先人来看过我', none: '有个人来看过我', no: '有个人来看过我' };
  saw(hw[c06], label + '（小屋读 c06）');
  pick(g, '……', label);
  if (zhou) saw('峨眉的人也在大都吧', label); else saw('崖上那缕炊烟', label);
  expectFlag(g, 'yitian.ch12_done', label);
  expectCap(g, 'shediao.yangqiang', 150, label);
  expectCap(g, 'shediao.yuenv', 150, label);
  const gs = goal(g);
  if (!flag(g, 'yitian.ch13') && (gs[0] !== 'yitian.goal.c12.6' || gs.length > 1)) note(`${label}：当前目标应当是 yitian.goal.c12.6，却是 ${gs.join(', ') || '（空）'}`);
  noDialog(g, label + '（收尾之后）');
}

// ---------------- 路线 1：巧；明教一边、灭绝打赢；成昆打赢；c06_me；站在身后；学过九阴、空明拳、玄冥打赢 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { [QIAO]: 230, 'shediao.kongming': 140 }, flags: { 'yitian.c06_me': true, 'shendiao.c18_sword': true } });
  c09open(g, label); c09gobi(g, label, { sword: true }); c09dune(g, label, { side: 'ming', winIt: true, c06: 'me' }); c09climb(g, label, 'qiao', { side: 'ming' });
  c10open(g, label, { side: 'ming' }); c10kun(g, label, { winIt: true, c06me: true }); c10cliff(g, label); c10slab(g, label, 'qiao', { kongming: true });
  c11open(g, label, { side: 'ming' }); c11a(g, label); c11b(g, label, 'qiao', { zhou: true, c06: 'me' });
  c12open(g, label, { zhou: true }); c12hall(g, label, { side: 'ming' }); c12wd(g, label, 'qiao', { winXm: true, c06: 'me', zhou: true });
}

// ---------------- 路线 2：内功／气血；六派一边、殷天正打输；成昆打输；c06_heir；扶殷天正；没学九阴 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { [INNER]: 170 }, hp: 2850, flags: { 'yitian.c06_heir': true, 'shediao.jiuyin': false } });
  delete g.state.player.skills['shediao.jiuyin'];
  while (g.hpMax() < 2850) g.state.player.attrs.根骨 += 5; // 去掉九阴之后气血上限也跟着降了
  c09open(g, label); c09gobi(g, label, { sword: false }); c09dune(g, label, { side: 'liu', winIt: false, c06: 'heir' }); c09climb(g, label, 'inner', { side: 'liu', jiuyin: false });
  c10open(g, label, { side: 'liu' }); c10kun(g, label, { winIt: false }); c10cliff(g, label); c10slab(g, label, 'hp');
  c11open(g, label, { side: 'liu' }); c11a(g, label); c11b(g, label, 'inner', { zhou: false, c06: 'heir' });
  c12open(g, label, { zhou: false }); c12hall(g, label, { side: 'liu' }); c12wd(g, label, 'hp', { winXm: false, c06: 'heir', zhou: false });
}

// ---------------- 路线 3：组队；谁也不帮；c06_none；殷天正打赢 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'yitian.c06_none': true } });
  c09open(g, label); c09gobi(g, label, {}); c09dune(g, label, { side: 'none', c06: 'none' }); c09climb(g, label, 'party', { side: 'none' });
  c10open(g, label, { side: 'none' }); c10kun(g, label, { winIt: true }); c10cliff(g, label); c10slab(g, label, 'party');
  c11open(g, label, { side: 'none' }); c11a(g, label, { party: true }); c11b(g, label, 'party', { zhou: true, c06: 'none' });
  c12open(g, label, { zhou: true }); c12hall(g, label, { side: 'none' }); c12wd(g, label, 'party', { winXm: true, c06: 'none', zhou: true });
}

// ---------------- 路线 4：没有第六章标记；门槛不够不锁人；每场必胜战打输重来 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { [QIAO]: 230 }, flags: { 'yitian.c03_secret': false } });
  // 第九章：韦一笑打输
  c09open(g, label);
  c09gobi(g, label, { loseIt: true });
  expectRoom(g, 'chengdu.station', label + '（打输回成都车马行）');
  expectFlag(g, 'yitian.ch9', label + '（ch9 保留）');
  ex(g, '西北', label); ex(g, '北', label); ex(g, '北', label); noDialog(g, label + '（重来不重演开端）');
  g.state.flags['yitian.c03_secret'] = true; // 后面按"有"走
  c09gobi(g, label + '（重来）', {});
  c09dune(g, label, { side: 'liu', winIt: true, c06: 'no' });
  g.state.player.skills[QIAO] = 50;
  ex(g, '北', label);
  if (!has(g, '现在还上不去')) note(`${label}：功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label); pick(g, '先退下来', label);
  ex(g, '南', label); expectRoom(g, 'yitian.gm.dune', label + '（第九章门槛不锁人）');
  g.state.player.skills[QIAO] = 230;
  c09climb(g, label, 'qiao', { side: 'liu' });
  // 第十章：崖口打输
  c10open(g, label, { side: 'liu' }); c10kun(g, label, { winIt: false }); c10cliff(g, label, { loseIt: true });
  expectRoom(g, 'yitian.gm.gate', label + '（第十章打输回光明顶山下）');
  expectNoFlag(g, 'yitian.c10_kun', label + '（回滚）');
  ex(g, '北', label); noDialog(g, label + '（广场不该有剧情）');
  ex(g, '北', label); expectRoom(g, 'yitian.gm.top', label);
  c10kun(g, label + '（重来）', { winIt: true });
  c10cliff(g, label + '（重来）');
  g.state.player.skills[QIAO] = 50;
  ex(g, '西', label);
  if (!has(g, '现在还下不去')) note(`${label}：功力不够时没有"现在还下不去"`);
  pick(g, '现在还下不去', label); pick(g, '先退出来', label);
  ex(g, '东', label); expectRoom(g, 'yitian.gm.top', label + '（第十章门槛不锁人）');
  g.state.player.skills[QIAO] = 230;
  c10slab(g, label, 'qiao');
  // 第十一章：华山二老打输、两仪剑阵打输
  c11open(g, label, { side: 'liu' }); c11a(g, label, { loseIt: true });
  expectRoom(g, 'yitian.gm.gate', label + '（第十一章打输回山下）');
  ex(g, '北', label); expectRoom(g, 'yitian.gm.square', label);
  if (!has(g, '和张无忌一起迎上去')) note(`${label}：重来时广场上没有重开华山二老那一仗`);
  c11a(g, label + '（重来）');
  pick(g, '看准两柄剑之间', label);
  pick(g, '背靠着张无忌', label);
  lose(g, label + '/两仪剑阵（故意打输）');
  expectRoom(g, 'yitian.gm.gate', label);
  expectNoFlag(g, 'yitian.c11_a', label + '（回滚）');
  ex(g, '北', label);
  c11a(g, label + '（三来）');
  pick(g, '看准两柄剑之间', label);
  pick(g, '背靠着张无忌', label);
  win(g, label + '/两仪剑阵');
  // 门槛不够（另开一局，从第十一章开头走）
  {
    const g2 = newGame({ skills: { [QIAO]: 50 }, flags: { 'yitian.ch9': true, 'yitian.ch9_done': true, 'yitian.ch10': true, 'yitian.ch10_done': true, 'yitian.c09_dune': true, 'yitian.c09_up': true, 'yitian.c10_learn': true, 'yitian.c09_liupai': true } });
    g2.enter('yitian.gm.gate'); ex(g2, '北', label + '/门槛');
    pick(g2, '……', label + '/门槛'); pick(g2, '和张无忌一起迎上去', label + '/门槛'); win(g2, label + '/门槛');
    pick(g2, '挤进剑阵里去', label + '/门槛');
    if (!has(g2, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"`);
    pick(g2, '现在还进不去', label + '/门槛'); pick(g2, '先退开', label + '/门槛');
    ex(g2, '南', label + '/门槛'); expectRoom(g2, 'yitian.gm.gate', label + '（第十一章门槛不锁人）');
    g2.state.player.skills[QIAO] = 230;
    ex(g2, '北', label + '/门槛');
    if (!has(g2, '看准两柄剑之间')) note(`${label}：回到广场门槛没有重开`);
  }
  pick(g, '……', label); pick(g, '回身去扶殷天正', label); pick(g, '……', label); pick(g, '回大殿', label); pick(g, '什么也不说', label);
  expectFlag(g, 'yitian.ch11_done', label);
  // 第十二章：阿二打输、阿三打输、武当门槛不够
  c12open(g, label, { zhou: false }); c12hall(g, label, { loseIt: true });
  expectRoom(g, 'xiangyang.station', label + '（第十二章打输回襄阳车马行）');
  noDialog(g, label + '（回到检查点）');
  c12hall(g, label + '（重来）', { side: 'liu' });
  g.state.player.skills[QIAO] = 50;
  ex(g, '西', label);
  if (!has(g, '现在还上不去')) note(`${label}：功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label); pick(g, '先退下来', label);
  ex(g, '东', label); expectRoom(g, 'xiangyang.station', label + '（第十二章门槛不锁人）');
  g.state.player.skills[QIAO] = 230;
  c12wd(g, label, 'qiao', { loseAsan: true, c06: 'no' });
  expectRoom(g, 'xiangyang.station', label + '（阿三打输回襄阳车马行）');
  expectNoFlag(g, 'yitian.c12_hall', label + '（回滚）');
  c12hall(g, label + '（再来）', { side: 'liu' });
  c12wd(g, label + '（再来）', 'qiao', { winXm: false, c06: 'no', zhou: false });
}

if (stubs.length) console.log('（用了替身：' + stubs.join('、') + '）');
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 倚天第九到十二章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来），四处门槛各三条路，七场必胜战打输重来，灭绝、殷天正、成昆、玄冥二老四场允许输的赢输，c09 三种站法、c06 三种与无、c11_zhou 两种、c03_secret、c18_sword、九阴、空明拳的有无');
