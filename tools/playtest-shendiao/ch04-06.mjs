// 神雕第四~六章走查：node tools/playtest-shendiao/ch04-06.mjs（在任意目录运行；PLAYTEST_VERBOSE=1 看过程）
// 照 tools/playtest-shediao/ch19-20.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置：射雕全线完结、神雕第一~三章完成（shendiao.ch1~ch3_done）。
// 第三章（别的会话写）建 shendiao.gm.wood / shendiao.gm.gate；还没写完时，用下面的 STUB 补进 db（只补缺的房间）。

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

// 第三章的替身（照第三章的布局）：终南山山门往西是后山树林，再往西是密林，密林再往西是墓门
const STUB = `
=== patch: quanzhen.gate
exits: 西=shendiao.gm.wood

=== room: shendiao.gm.wood
name: 终南山·后山树林（替身）
exits: 东=quanzhen.gate, 西=shendiao.gm.deep
---
替身房间。

=== room: shendiao.gm.deep
name: 终南山·密林（替身）
exits: 东=shendiao.gm.wood, 西=shendiao.gm.gate
---
替身房间。

=== room: shendiao.gm.gate
name: 古墓·墓门（替身）
exits: 东=shendiao.gm.deep
---
替身房间。
`;

const problems = [];
const verbose = !!process.env.PLAYTEST_VERBOSE;
const step = (s) => { if (verbose) console.log('  · ' + s); };
const note = (s) => problems.push(s);
let stubbed = false;

function newGame({ skills = {}, flags = {}, items = {}, hp = 0, sect = null } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  if (!db.room['shendiao.gm.gate'] || !db.room['shendiao.gm.wood'] || !db.room['shendiao.gm.deep']) {
    stubbed = true;
    const blocks = parse(STUB, 'stub.md').filter((b) => b.type !== 'room' || !db.room[b.id]);
    addBlocks(db, blocks, 'stub.md');
  }
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: Object.keys(skills).find((id) => db.skill[id]?.props.kind === '内功') ?? null,
    light: null,
  };
  st.player.money = 5000;
  if (sect) st.player.sect = { id: sect, rank: 0 };
  st.flags['shediao.started'] = true;
  st.flags['shendiao.started'] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (const f of ['c20_up', 'c20_qiu', 'c20_night', 'c20_ou', 'th_zhuang', 'c16_du']) st.flags[`shediao.${f}`] = true;
  for (let i = 1; i <= 3; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  for (const f of ['c03_flee', 'c03_in', 'c03_won']) st.flags[`shendiao.${f}`] = true; // 第三章：荆棘丛、密林打通
  Object.assign(st.flags, flags);
  Object.assign(st.player.inventory, items);
  const g = new Game(db, st);
  if (hp) { while (g.hpMax() < hp) st.player.attrs.根骨 += 5; }
  return g;
}

function ex(g, cmd, label) {
  const out = g.exec(cmd);
  for (const o of out) if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`);
  if (verbose) for (const o of out) if (o.cls === 'err' || o.cls === 'sys') console.log(`      [${o.cls}] ${o.text}`);
  return out;
}
function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（人在 ${g.state.player.room}）`); return []; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return []; }
  return ex(g, String(i + 1), label);
}
const has = (g, substr) => !!g.dialog?.some((c) => c.text.includes(substr));
const text = (out) => out.map((o) => o.text).join('\n');

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
  return Object.values(g.db.goal).filter((x) => /^shendiao\.goal\.c0[4-6]\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs.length !== 1 || gs[0] !== id) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const withParty = (g, on) => { g.party = on ? { members: [{ id: 'friend' }] } : null; };

const TH4 = { qiao: '缩身钻进门顶', hp: '硬把它推开', party: '同时扳下机括' };
const TH5 = { qiao: '踩着冰棱', inner: '把脚掌钉在冰上', party: '拉着手' };
const TH6 = { qiao: '一拧一挑', hp: '往上硬拔', party: '喊着号子' };
function threshold(g, label, table, how, notyet) {
  for (const [k, v] of Object.entries(table)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, notyet)) note(`${label}：满足门槛时不该出现「${notyet}」`);
  pick(g, table[how], label);
}

// ---------------- 第四章 ----------------

function ch4open(g, label) {
  step(label + ' 第四章开端');
  g.enter('shendiao.gm.gate');
  pick(g, '进去', label);
  expectFlag(g, 'shendiao.ch4', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.4') note(`${label}：检查点没有设到第四章`);
  if (g.dialog) note(`${label}：开端之后不该还有对话`);
  expectGoal(g, 'shendiao.goal.c04.1', label);
}

function ch4meet(g, label, { stay, spar }) {
  ex(g, '南', label);
  expectRoom(g, 'shendiao.gm.hall', label);
  pick(g, stay === 'out' ? '墓门外搭个草棚' : '借我打个地铺', label);
  expectFlag(g, stay === 'out' ? 'shendiao.c04_out' : 'shendiao.c04_in', label);
  pick(g, '……', label);
  pick(g, '好', label);
  expectFlag(g, 'shendiao.c04_meet', label);
  expectGoal(g, 'shendiao.goal.c04.2', label);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.gm.gate', label);
  pick(g, '跟他学', label);
  if (g.state.player.skills['shendiao.tianluo'] === undefined) note(`${label}：没有学会天罗地网势`);
  expectFlag(g, 'shendiao.c04_tianluo', label);
  if (spar === 'skip') pick(g, '快回去', label);
  else {
    pick(g, '过两招', label);
    pick(g, '接他的木剑', label);
    if (spar === 'win') { win(g, label + '/杨过（切磋）'); expectFlag(g, 'shendiao.c04_spar_win', label); }
    else { lose(g, label + '/杨过（切磋，允许输）'); expectNoFlag(g, 'shendiao.c04_spar_win', label); }
    pick(g, '快回去吧', label);
  }
  if (g.dialog) note(`${label}：捉麻雀之后还有对话`);
  expectGoal(g, 'shendiao.goal.c04.3', label);
}

function ch4door(g, label, how) {
  ex(g, '南', label);
  expectRoom(g, 'shendiao.gm.hall', label);
  pick(g, '想法子进去', label);
  expectFlag(g, 'shendiao.c04_li', label);
  expectGoal(g, 'shendiao.goal.c04.4', label);
  if (how === 'party') { pick(g, '现在还进不去', label + '（应当没有）'); return; }
  threshold(g, label, TH4, how, '现在还进不去');
  expectFlag(g, 'shendiao.c04_enter', label);
  expectRoom(g, 'shendiao.gm.dao', label + '（过场把人带进墓道）');
}

function ch4rest(g, label, { li, jiuyin, loseHong = false }) {
  pick(g, '护住杨过', label);
  if (loseHong) return;
  win(g, label + '/洪凌波');
  expectFlag(g, 'shendiao.c04_hong', label);
  pick(g, '往里赶', label);
  expectRoom(g, 'shendiao.gm.bed', label);
  pick(g, '站到她身边', label);
  if (li === 'win') win(g, label + '/李莫愁'); else lose(g, label + '/李莫愁（允许输）');
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c04_seal', label);
  expectGoal(g, 'shendiao.goal.c04.7', label);
  if (g.exits()['北'] !== 'shendiao.gm.dao') note(`${label}：寒玉床室往北应当还是墓道`);
  ex(g, '北', label);
  if (g.exits()['北']) note(`${label}：断龙石落下后墓道往北不该还有路`);
  ex(g, '南', label);
  ex(g, '西', label);
  expectRoom(g, 'shendiao.gm.coffin', label);
  if (jiuyin) {
    if (has(g, '往下看') && g.dialog.length !== 1) note(`${label}：学过九阴的只该有一个"往下看"`);
    pick(g, '往下看', label);
    expectFlag(g, 'shendiao.c04_ceiling', label);
    expectCap(g, 'shediao.jiuyin', 120, label);
  } else {
    pick(g, '往下看', label);
    expectNoFlag(g, 'shendiao.c04_ceiling', label);
  }
  pick(g, '屋顶的角上', label);
  expectFlag(g, 'shendiao.c04_way', label);
  expectGoal(g, 'shendiao.goal.c04.8', label);
  ex(g, '南', label);
  expectRoom(g, 'shendiao.gm.stream', label);
  pick(g, '……', label);
  expectRoom(g, 'shendiao.gm.gate', label + '（暗河出墓）');
  pick(g, '下山', label);
  expectFlag(g, 'shendiao.ch4_done', label);
  expectGoal(g, 'shendiao.goal.c04.10', label);
  // 章节之后：外间还进得去，墓道进不去；暗河那头也能上到墓门
  ex(g, '南', label);
  expectRoom(g, 'shendiao.gm.hall', label + '（章节之后的外间）');
  if (g.dialog) note(`${label}：章节之后进外间还弹出对话`);
  if (g.exits()['南']) note(`${label}：章节之后外间往南不该有路`);
  ex(g, '北', label);
  if (g.dialog) note(`${label}：章节之后回墓门还弹出对话`);
}

// ---------------- 第五章 ----------------

function ch5open(g, label) {
  step(label + ' 第五章开端');
  ex(g, '东', label);
  expectRoom(g, 'shendiao.gm.deep', label);
  ex(g, '东', label);
  expectRoom(g, 'shendiao.gm.wood', label);
  if (g.dialog) note(`${label}：后山树林里不该有对话`);
  ex(g, '东', label);
  expectRoom(g, 'quanzhen.gate', label);
  pick(g, '我陪你去', label);
  expectFlag(g, 'shendiao.ch5', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.5') note(`${label}：检查点没有设到第五章`);
  expectGoal(g, 'shendiao.goal.c05.1', label);
  ex(g, '北', label);
  expectRoom(g, 'changan.station', label);
  ex(g, '东', label);
  expectRoom(g, 'huashan.gate', label);
}

function ch5cliff(g, label, { ou, c12 }) {
  ex(g, '东', label);
  expectRoom(g, 'huashan.cliff', label);
  // 欧阳锋的疯话：读射雕第十二章
  const said = text(g.out ?? []);
  void said;
  if (ou === 'skip') pick(g, '叫杨过拦住他', label);
  else {
    pick(g, '接他这一掌', label);
    if (ou === 'win') { win(g, label + '/欧阳锋'); expectFlag(g, 'shendiao.c05_ou_win', label); }
    else lose(g, label + '/欧阳锋（允许输）');
  }
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c05_meet', label);
  expectGoal(g, 'shendiao.goal.c05.2', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.hsj.ridge', label);
  if (g.dialog) note(`${label}：第一次过北峰下不该有对话`);
  ex(g, '北', label);
  expectRoom(g, 'shediao.hsj.top', label);
  if (g.dialog) note(`${label}：第一次上绝顶不该有对话（${g.dialog.map((c) => c.text).join('/')}）`);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.hs.camp', label);
  pick(g, '……', label);
  const out = pick(g, '……', label);
  const t = text(out);
  if (c12 && !t.includes('裘千仞往崖下倒')) note(`${label}：有 c20_pull 时洪七公应当提裘千仞`);
  pick(g, '我去', label);
  expectFlag(g, 'shendiao.c05_hong', label);
  expectGoal(g, 'shendiao.goal.c05.3', label);
}

function ch5tie(g, label, { loseTie = false } = {}) {
  ex(g, '南', label);
  expectRoom(g, 'shediao.hsj.top', label);
  if (g.dialog) note(`${label}：打铁掌帮之前上绝顶不该有对话`);
  ex(g, '南', label);
  expectRoom(g, 'shediao.hsj.ridge', label);
  pick(g, '守住石阶', label);
  if (loseTie) return;
  win(g, label + '/莫千峰');
  expectFlag(g, 'shendiao.c05_tie', label);
  expectGoal(g, 'shendiao.goal.c05.4', label);
}

function ch5ledge(g, label, { how, bury, spear }) {
  if (how === 'party') withParty(g, true);
  ex(g, '北', label);
  expectRoom(g, 'shediao.hsj.top', label);
  threshold(g, label, TH5, how, '现在还过不去');
  withParty(g, false);
  expectFlag(g, 'shendiao.c05_cross', label);
  expectRoom(g, 'shendiao.hsw.ledge', label);
  pick(g, '替洪七公比划', label);
  const t = text(pick(g, '……', label)); // 欧阳锋临终清醒的那一段
  pick(g, '……', label);
  pick(g, bury ? '把两人埋在崖边' : '让雪把他们盖起来', label);
  expectFlag(g, bury ? 'shendiao.c05_bury' : 'shendiao.c05_snow', label);
  expectFlag(g, 'shendiao.c05_end', label);
  pick(g, '……', label);
  if (spear === 'give') { pick(g, '把杨铁心的铁枪交给杨过', label); expectFlag(g, 'shendiao.c05_spear', label); if (g.state.player.inventory['shediao.yang_spear']) note(`${label}：铁枪交出去了还在包里`); }
  else if (spear === 'keep') { pick(g, '枪留在你这里', label); expectNoFlag(g, 'shendiao.c05_spear', label); }
  else { if (has(g, '铁枪交给')) note(`${label}：没有铁枪时出现了交枪的选项`); pick(g, '折一根树枝', label); }
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch5_done', label);
  expectCap(g, 'shediao.nanshan', 110, label);
  expectCap(g, 'shediao.yangqiang', 110, label);
  expectGoal(g, 'shendiao.goal.c05.6', label);
  // 章节之后能下山
  ex(g, '东', label);
  expectRoom(g, 'shediao.hsj.top', label);
  if (g.dialog) note(`${label}：章节之后上绝顶还有对话`);
  ex(g, '南', label); ex(g, '西', label);
  expectRoom(g, 'huashan.cliff', label + '（章节之后能下山）');
  if (g.dialog) note(`${label}：章节之后过苍龙岭还有对话`);
  ex(g, '西', label);
  expectRoom(g, 'huashan.gate', label);
  return t;
}

// ---------------- 第六章 ----------------

function ch6open(g, label) {
  step(label + ' 第六章开端');
  g.enter('xiangyang.station');
  ex(g, '东', label);
  expectRoom(g, 'shendiao.dsg.road', label);
  pick(g, '往庄子里去', label);
  expectFlag(g, 'shendiao.ch6', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.6') note(`${label}：检查点没有设到第六章`);
  expectGoal(g, 'shendiao.goal.c06.1', label);
}

function ch6feast(g, label, { gaibang }) {
  ex(g, '东', label);
  expectRoom(g, 'shendiao.dsg.gate', label);
  pick(g, '进去', label);
  expectFlag(g, 'shendiao.c06_host', label);
  ex(g, '东', label);
  expectRoom(g, 'shendiao.dsg.hall', label);
  if (gaibang) {
    const rep0 = g.state.player.sect?.rep ?? g.state.player.rep?.gaibang ?? 0;
    pick(g, '向新帮主行礼', label);
    void rep0;
    pick(g, '……', label);
  } else {
    if (has(g, '向新帮主行礼')) note(`${label}：不是丐帮弟子却出现了行礼的选项`);
    pick(g, '……', label);
  }
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c06_feast', label);
  expectGoal(g, 'shendiao.goal.c06.3', label);
}

function ch6night(g, label, night) {
  if (night === 'none') return;
  ex(g, '北', label);
  expectRoom(g, 'shendiao.dsg.garden', label);
  if (night === 'quiet') pick(g, '不惊动他', label);
  else {
    pick(g, '拦住他', label);
    if (night === 'win') { win(g, label + '/霍都'); expectFlag(g, 'shendiao.c06_huodu_win', label); }
    else lose(g, label + '/霍都（允许输）');
  }
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c06_night', label);
  ex(g, '南', label);
}

function ch6yard(g, label, { how, yiyang, loseDar = false }) {
  if (how === 'party') withParty(g, true);
  ex(g, '南', label);
  expectRoom(g, 'shendiao.dsg.yard', label);
  threshold(g, label, TH6, how, '现在还拔不动');
  withParty(g, false);
  expectFlag(g, 'shendiao.c06_pull', label);
  const t = text(pick(g, '……', label));
  if (yiyang && !t.includes('大理学的那一阳指')) note(`${label}：学过一阳指却没有朱子柳那一段`);
  if (!yiyang && t.includes('大理学的那一阳指')) note(`${label}：没学一阳指却出现了那一段`);
  pick(g, '下场去', label);
  expectGoal(g, 'shendiao.goal.c06.4', label);
  pick(g, '迎上去', label);
  if (loseDar) return;
  win(g, label + '/达尔巴');
  expectFlag(g, 'shendiao.c06_daerba', label);
}

function ch6end(g, label, jinlun) {
  pick(g, '……', label);
  pick(g, '……', label);
  pick(g, '三人一起迎上去', label);
  if (jinlun === 'win') win(g, label + '/金轮法王'); else lose(g, label + '/金轮法王（允许输）');
  pick(g, '……', label);
  pick(g, '……', label);
  pick(g, '……', label);
  pick(g, '回襄阳', label);
  expectFlag(g, 'shendiao.ch6_done', label);
  expectCap(g, 'shendiao.tianluo', 60, label);
  expectCap(g, 'shediao.yuenv', 110, label);
  expectGoal(g, 'shendiao.goal.c06.6', label);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.dsg.hall', label);
  ex(g, '北', label);
  if (g.dialog) note(`${label}：章节之后去后园还弹出对话`);
  ex(g, '南', label); ex(g, '西', label); ex(g, '西', label); ex(g, '西', label);
  expectRoom(g, 'xiangyang.station', label + '（章节之后回襄阳）');
  if (g.db.dialog['shendiao.c07.start'] && !g.dialog) note(`${label}：回到襄阳车马行，第七章没有接上`);
}

// ---------------- 路线 1：巧；学过九阴、有铁枪、c12_fake、c20_pull、丐帮、一阳指；守墓外、切磋赢、欧阳锋赢、埋、交枪、霍都赢、金轮赢 ----------------
{
  const label = '路线1';
  const g = newGame({
    skills: { 'shediao.cuijian': 160, 'shediao.jiuyin': 100, 'quanzhen.jianfa': 100, 'tianlong.yiyangzhi': 10 },
    flags: { 'shediao.c12_fake': true, 'shediao.c20_pull': true, 'shediao.th_duan': true },
    items: { 'shediao.yang_spear': 1 },
    sect: 'gaibang',
  });
  ch4open(g, label);
  ch4meet(g, label, { stay: 'out', spar: 'win' });
  ch4door(g, label, 'qiao');
  ch4rest(g, label, { li: 'win', jiuyin: true });
  ch5open(g, label);
  ch5cliff(g, label, { ou: 'win', c12: true });
  ch5tie(g, label);
  const t = ch5ledge(g, label, { how: 'qiao', bury: true, spear: 'give' });
  if (!t.includes('是假的')) note(`${label}：c12_fake 时欧阳锋临终那句不对`);
  ch6open(g, label);
  ch6feast(g, label, { gaibang: true });
  ch6night(g, label, 'win');
  ch6yard(g, label, { how: 'qiao', yiyang: true });
  ch6end(g, label, 'win');
}

// ---------------- 路线 2：气血／内功；没学九阴、c12_true、铁枪留着；住外间、切磋输、欧阳锋输、不埋、霍都输、金轮输 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { 'quanzhen.xinfa': 115, 'quanzhen.jianfa': 100 }, flags: { 'shediao.c12_true': true }, items: { 'shediao.yang_spear': 1 }, hp: 2100 });
  ch4open(g, label);
  ch4meet(g, label, { stay: 'in', spar: 'lose' });
  ch4door(g, label, 'hp');
  ch4rest(g, label, { li: 'lose', jiuyin: false });
  ch5open(g, label);
  ch5cliff(g, label, { ou: 'lose' });
  ch5tie(g, label);
  const t = ch5ledge(g, label, { how: 'inner', bury: false, spear: 'keep' });
  if (!t.includes('信错了人')) note(`${label}：c12_true 时欧阳锋临终那句不对`);
  if (!g.state.player.inventory['shediao.yang_spear']) note(`${label}：没交枪，铁枪却不见了`);
  ch6open(g, label);
  ch6feast(g, label, { gaibang: false });
  ch6night(g, label, 'lose');
  ch6yard(g, label, { how: 'hp', yiyang: false });
  ch6end(g, label, 'lose');
}

// ---------------- 路线 3：组队；c12_blank、没铁枪；不切磋、让开欧阳锋、夜里不动手 ----------------
{
  const label = '路线3';
  const g = newGame({ skills: { 'shediao.jiuyin': 100 }, flags: { 'shediao.c12_blank': true } });
  ch4open(g, label);
  ch4meet(g, label, { stay: 'out', spar: 'skip' });
  // 组队：门槛对话在进外间那一刻过滤，要先把队伍准备好（XIAOAO.md §6 第 4 条）
  withParty(g, true);
  ex(g, '南', label);
  pick(g, '想法子进去', label);
  threshold(g, label, TH4, 'party', '现在还进不去');
  withParty(g, false);
  expectRoom(g, 'shendiao.gm.dao', label);
  ch4rest(g, label, { li: 'win', jiuyin: true });
  ch5open(g, label);
  ch5cliff(g, label, { ou: 'skip' });
  ch5tie(g, label);
  const t = ch5ledge(g, label, { how: 'party', bury: true, spear: 'none' });
  if (!t.includes('一个字都没写')) note(`${label}：c12_blank 时欧阳锋临终那句不对`);
  ch6open(g, label);
  ch6feast(g, label, { gaibang: false });
  ch6night(g, label, 'quiet');
  ch6yard(g, label, { how: 'party', yiyang: false });
  ch6end(g, label, 'win');
}

// ---------------- 路线 4：门槛不够时不锁人；三场必胜战各打输一次重来；没有射雕第十二章标记；不去后园 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { 'shediao.cuijian': 160, 'shediao.jiuyin': 100 } });
  ch4open(g, label);
  ch4meet(g, label, { stay: 'in', spar: 'skip' });
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '南', label);
  pick(g, '想法子进去', label);
  if (!has(g, '现在还进不去')) note(`${label}：第四章功力不够时没有"现在还进不去"`);
  pick(g, '现在还进不去', label);
  pick(g, '先退出去', label);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.gm.gate', label + '（第四章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 160;
  ex(g, '南', label);
  threshold(g, label, TH4, 'qiao', '现在还进不去');
  ch4rest(g, label, { loseHong: true });
  lose(g, label + '/洪凌波（故意打输）');
  expectRoom(g, 'quanzhen.gate', label + '（打输回到终南山山门）');
  expectFlag(g, 'shendiao.ch4', label + '（ch4 保留）');
  expectNoFlag(g, 'shendiao.c04_meet', label + '（回滚）');
  if (g.dialog) note(`${label}：回到检查点却弹出了对话`);
  ex(g, '西', label); ex(g, '西', label); ex(g, '西', label);
  expectRoom(g, 'shendiao.gm.gate', label);
  if (g.dialog) note(`${label}：重来时墓门的开端重演了`);
  ch4meet(g, label + '（重来）', { stay: 'in', spar: 'skip' });
  ch4door(g, label + '（重来）', 'qiao');
  ch4rest(g, label + '（重来）', { li: 'lose', jiuyin: true });
  ch5open(g, label);
  ch5cliff(g, label, { ou: 'skip' });
  ch5tie(g, label, { loseTie: true });
  lose(g, label + '/莫千峰（故意打输）');
  expectRoom(g, 'huashan.gate', label + '（打输回到玉泉院）');
  expectFlag(g, 'shendiao.ch5', label);
  expectNoFlag(g, 'shendiao.c05_meet', label);
  ch5cliff(g, label + '（重来）', { ou: 'skip' });
  ch5tie(g, label + '（重来）');
  // 冰崖：功力不够
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '北', label);
  if (!has(g, '现在还过不去')) note(`${label}：第五章功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label);
  pick(g, '先退回去', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.hsj.ridge', label + '（第五章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 160;
  const t = ch5ledge(g, label, { how: 'qiao', bury: false, spear: 'none' });
  if (!t.includes('也没像我一样')) note(`${label}：没有第十二章标记时欧阳锋临终那句不对`);
  ch6open(g, label);
  ch6feast(g, label, { gaibang: false });
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '南', label);
  if (!has(g, '现在还拔不动')) note(`${label}：第六章功力不够时没有"现在还拔不动"`);
  pick(g, '现在还拔不动', label);
  pick(g, '先下场去', label);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.dsg.hall', label + '（第六章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 160;
  ch6yard(g, label, { how: 'qiao', yiyang: false, loseDar: true });
  lose(g, label + '/达尔巴（故意打输）');
  expectRoom(g, 'xiangyang.station', label + '（打输回到襄阳车马行）');
  expectNoFlag(g, 'shendiao.c06_host', label);
  ex(g, '东', label);
  if (g.dialog) note(`${label}：重来时关道的开端重演了`);
  ch6feast(g, label + '（重来）', { gaibang: false });
  ch6yard(g, label + '（重来）', { how: 'qiao', yiyang: false });
  // 比完以后后园的霍都不该再出现
  ch6end(g, label, 'lose');
}

if (stubbed) console.log('（第三章还没有 shendiao.gm.wood / shendiao.gm.gate，走查用了替身房间）');
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 神雕第四~六章走通：四条路线（巧／气血与内功／组队／门槛不够与打输重来）、九阴学没学、铁枪交与不交与没有、射雕第十二章三种标记与无标记、丐帮与一阳指分支、三场允许输的赢输、三处打输重来');
