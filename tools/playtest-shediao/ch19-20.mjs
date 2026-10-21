// 射雕第十九、二十章走查：node playtest.mjs（在任意目录运行）
// 照 tools/playtest-xiaoao.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记（第十一~十八章由别的会话写）手动设：ch1~ch18 全部完成，物品 shediao.wumu / shediao.yinggu_pa、标记 c12_* 按路线给。

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
  // 第十五、十六章可能还没写完：物品没定义时补一个，免得 take/give 的文字出错
  for (const id of ['shediao.wumu', 'shediao.yinggu_pa']) {
    if (!db.item[id]) db.item[id] = { id, type: 'item', props: { name: id }, lines: [], choices: [] };
  }
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  st.flags['shediao.started'] = true;
  for (let i = 1; i <= 18; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (const f of ['mo_met', 'mo_ambush', 'mo_nanshan', 'mo_top', 'mo_mayu']) st.flags[`shediao.${f}`] = true;
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
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（人在 ${g.state.player.room}）`); return false; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return false; }
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
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = Math.max(u.hp, u.maxHp); } // 敌人不倒：免得 NPC 队友替你打赢
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
  const gs = Object.values(g.db.goal).filter((x) => /^shediao\.goal\.c(19|20)\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean)));
  return gs.map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }

const CAPS19 = { 'quanzhen.jinyan': 80, 'shediao.luoying': 80, 'shediao.kongming': 80, 'shediao.jiuyin': 80, 'shediao.nanshan': 90, 'shediao.yuenv': 90, 'shediao.cuijian': 85 };
const TEN = ['shediao.yangqiang', 'shediao.yuenv', 'quanzhen.jianfa', 'quanzhen.xinfa', 'shediao.nanshan', 'quanzhen.jinyan', 'shediao.luoying', 'shediao.kongming', 'shediao.jiuyin', 'shediao.cuijian'];

// ---------------- 第十九章 ----------------

function ch19open(g, label, { wumu }) {
  step(label + ' 第十九章开端');
  g.enter('quanzhen.gate');
  ex(g, '对话 北上的驼队', label);
  pick(g, '铁木真大营', label);
  expectRoom(g, 'shediao.mo.camp', label);
  if (wumu) {
    if (has(g, '问他兵书')) note(`${label}：有兵书时不该出现"问他兵书"`);
    pick(g, '把武穆遗书交给郭靖', label);
    expectFlag(g, 'shediao.c19_wumu', label);
    if (g.state.player.inventory['shediao.wumu']) note(`${label}：兵书交出去了还在包里`);
  } else {
    if (has(g, '交给郭靖')) note(`${label}：没有兵书时不该出现"交给郭靖"`);
    pick(g, '问他兵书', label);
    expectNoFlag(g, 'shediao.c19_wumu', label);
  }
  expectFlag(g, 'shediao.ch19', label);
  if (g.state.checkpoint?.chapter !== 'shediao.19') note(`${label}：检查点没有设到第十九章`);
  expectGoal(g, 'shediao.goal.c19.1', label);
}

function ch19march(g, label) {
  ex(g, '西', label);
  expectRoom(g, 'shediao.xz.road', label);
  pick(g, '迎上去', label);
  win(g, label + '/游骑');
  expectFlag(g, 'shediao.c19_march', label);
  expectGoal(g, 'shediao.goal.c19.2', label);
  ex(g, '西', label);
  expectRoom(g, 'shediao.xz.camp', label);
  pick(g, '夜里留在他帐外', label);
  pick(g, '看黄蓉怎么处置他', label);
  expectFlag(g, 'shediao.c19_ou', label);
  expectGoal(g, 'shediao.goal.c19.3', label);
}

function ch19cliff(g, label, how) {
  ex(g, '西', label);
  expectRoom(g, 'shediao.xz.wall', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '北', label);
  expectRoom(g, 'shediao.xz.cliff', label);
  const opt = { qiao: '凸出来的石棱', inner: '提一口真气', party: '一个托一个' }[how];
  for (const [k, v] of Object.entries({ qiao: '凸出来的石棱', inner: '提一口真气', party: '一个托一个' })) {
    if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  }
  if (has(g, '现在还上不去')) note(`${label}：满足门槛时不该出现"现在还上不去"`);
  pick(g, opt, label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'shediao.c19_in', label);
  expectRoom(g, 'shediao.xz.city', label + '（过场把人带进城）');
  expectGoal(g, 'shediao.goal.c19.4', label);
}

function ch19gate(g, label) {
  pick(g, '迎战守将', label);
  win(g, label + '/康里守将');
  expectFlag(g, 'shediao.c19_gate', label);
  expectGoal(g, 'shediao.goal.c19.5', label);
}

function ch19rest(g, label, hero, { loseRear = false } = {}) {
  ex(g, '东', label);
  expectRoom(g, 'shediao.xz.wall', label);
  ex(g, '东', label);
  ex(g, '北', label);
  expectRoom(g, 'shediao.xz.tent', label);
  pick(g, '站到郭靖身边', label);
  expectFlag(g, 'shediao.c19_wish', label);
  expectGoal(g, 'shediao.goal.c19.6', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.xz.camp', label);
  pick(g, '陪郭靖去接李萍', label);
  expectFlag(g, 'shediao.c19_flee', label);
  expectRoom(g, 'shediao.xz.tent', label + '（过场把人带回金帐）');
  pick(g, '……', label);
  pick(g, '扶起郭靖', label);
  expectFlag(g, 'shediao.c19_li', label);
  expectGoal(g, 'shediao.goal.c19.8', label);
  ex(g, '南', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.xz.road', label);
  pick(g, '一步也不让', label);
  if (loseRear) return;
  win(g, label + '/怯薛千夫长');
  pick(g, '往东下岭', label);
  expectFlag(g, 'shediao.c19_rear', label);
  expectGoal(g, 'shediao.goal.c19.9', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.mo.camp', label);
  pick(g, '陪郭靖去', label);
  const opt = { live: '能叫身边的人活下去', word: '说过的话', seek: '我还在找' }[hero];
  pick(g, opt, label);
  expectFlag(g, `shediao.c19_hero_${hero}`, label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.ch19_done', label);
  for (const [id, n] of Object.entries(CAPS19)) expectCap(g, id, n, label);
  expectGoal(g, 'shediao.goal.c19.10', label);
  // 往返：章节之后西征路还在，南下驼队还在
  ex(g, '西', label);
  expectRoom(g, 'shediao.xz.road', label + '（章节之后还能去西征路）');
  if (g.dialog) note(`${label}：章节之后回到雪岭还弹出对话`);
  ex(g, '东', label);
  ex(g, '对话 南下的驼队', label);
  pick(g, '跟驼队回终南山', label);
  expectRoom(g, 'quanzhen.gate', label + '（南下驼队）');
}

// ---------------- 第二十章 ----------------

function ch20(g, label, { how, pa, zhou, pull, c12 }) {
  step(label + ' 第二十章');
  ex(g, '北', label);
  expectRoom(g, 'changan.station', label);
  ex(g, '东', label);
  expectRoom(g, 'huashan.gate', label);
  ex(g, '东', label);
  expectRoom(g, 'huashan.cliff', label);
  expectFlag(g, 'shediao.ch20', label);
  if (g.state.checkpoint?.chapter !== 'shediao.20') note(`${label}：检查点没有设到第二十章`);
  if (g.dialog) note(`${label}：开端对话不该有选项（${g.dialog.map((c) => c.text).join('/')}）`);
  expectGoal(g, 'shediao.goal.c20.1', label);
  ch20up(g, label, how);
  ch20rest(g, label, { pa, zhou, pull, c12 });
}

function ch20up(g, label, how) {
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '东', label);
  expectRoom(g, 'shediao.hsj.ridge', label);
  const opts = { qiao: '踩着冰阶', hp: '硬趟上去', party: '用绳子连在一起' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  pick(g, opts[how], label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'shediao.c20_up', label);
  expectRoom(g, 'shediao.hsj.top', label);
}

function ch20rest(g, label, { pa, zhou, pull, c12, loseOu = false }) {
  if (pa) {
    if (has(g, '请朱子柳把话说完')) note(`${label}：有锦帕时出现了另一条路`);
    pick(g, '把瑛姑的锦帕交给朱子柳', label);
    expectFlag(g, 'shediao.c20_pa', label);
  } else {
    if (has(g, '锦帕')) note(`${label}：没有锦帕时出现了锦帕选项`);
    pick(g, '请朱子柳把话说完', label);
    expectFlag(g, 'shediao.c20_word', label);
  }
  pick(g, '……', label);
  pick(g, '接他的铁掌', label);
  win(g, label + '/裘千仞');
  pick(g, pull ? '抢上去拉住他' : '看朱子柳怎么做', label);
  if (pull) expectFlag(g, 'shediao.c20_pull', label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.c20_qiu', label);
  expectGoal(g, 'shediao.goal.c20.3', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.hsj.cave', label);
  if (zhou === 'win') { pick(g, '陪他过几招', label); win(g, label + '/周伯通'); pick(g, '坐下烤火', label); }
  else if (zhou === 'lose') { pick(g, '陪他过几招', label); lose(g, label + '/周伯通（允许输）'); pick(g, '坐下烤火', label); }
  else pick(g, '不陪他', label);
  expectFlag(g, 'shediao.c20_night', label);
  expectGoal(g, 'shediao.goal.c20.4', label);
  ex(g, '西', label);
  expectRoom(g, 'shediao.hsj.top', label);
  pick(g, '回头去看', label);
  // 欧阳锋的疯话：读第十二章的标记
  const out = g.log ?? null;
  pick(g, '和郭靖一起迎上去', label);
  if (loseOu) return;
  win(g, label + '/欧阳锋');
  pick(g, '看着他', label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.c20_ou', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.ch20_done', label);
  for (const id of TEN) expectCap(g, id, 100, label);
  expectGoal(g, 'shediao.goal.c20.5', label);
  // 章节之后还回得去
  ex(g, '南', label);
  ex(g, '西', label);
  expectRoom(g, 'huashan.cliff', label + '（章节之后能下山）');
  ex(g, '西', label);
  expectRoom(g, 'huashan.gate', label);
}

// 欧阳锋那段对话里到底说了哪句疯话：抓 exec 的输出
function ouLines(g) {
  return g.__ouText ?? '';
}

// ---------------- 路线 1：巧，有兵书、有锦帕，c12_fake，答"活下去"，和周伯通打赢，拉住裘千仞 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { 'shediao.cuijian': 130 }, flags: { 'shediao.c12_fake': true }, items: { 'shediao.wumu': 1, 'shediao.yinggu_pa': 1 } });
  ch19open(g, label, { wumu: true });
  ch19march(g, label);
  ch19cliff(g, label, 'qiao');
  ch19gate(g, label);
  ch19rest(g, label, 'live');
  ch20(g, label, { how: 'qiao', pa: true, zhou: 'win', pull: true });
  if (g.state.player.inventory['shediao.yinggu_pa']) note(`${label}：锦帕交出去了还在包里`);
}

// ---------------- 路线 2：内功／气血，没兵书、没锦帕，c12_true，答"说话算话"，输给周伯通 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { 'shediao.jiuyin': 95 }, flags: { 'shediao.c12_true': true }, hp: 1900 });
  ch19open(g, label, { wumu: false });
  ch19march(g, label);
  ch19cliff(g, label, 'inner');
  ch19gate(g, label);
  ch19rest(g, label, 'word');
  ch20(g, label, { how: 'hp', pa: false, zhou: 'lose', pull: false });
}

// ---------------- 路线 3：组队，c12_blank，答"还在找"，不陪周伯通 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'shediao.c12_blank': true }, items: { 'shediao.wumu': 1 } });
  ch19open(g, label, { wumu: true });
  ch19march(g, label);
  ch19cliff(g, label, 'party');
  ch19gate(g, label);
  ch19rest(g, label, 'seek');
  ch20(g, label, { how: 'party', pa: false, zhou: 'skip', pull: false });
}

// ---------------- 路线 4：门槛不够时不锁人；打输重来（城门、断后、欧阳锋），没有第十二章标记 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { 'shediao.cuijian': 130 } });
  ch19open(g, label, { wumu: false });
  ch19march(g, label);
  // 功力不够：临时把巧功降下来
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '西', label);
  ex(g, '北', label);
  if (!has(g, '现在还上不去')) note(`${label}：功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label);
  pick(g, '先回营里歇一歇', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.xz.wall', label + '（门槛不锁人）');
  expectNoFlag(g, 'shediao.c19_in', label);
  g.state.player.skills['shediao.cuijian'] = 130;
  // 再上崖（重新进房间，触发还在）
  ex(g, '北', label);
  pick(g, '凸出来的石棱', label);
  expectRoom(g, 'shediao.xz.city', label);
  // 城门故意打输
  pick(g, '迎战守将', label);
  lose(g, label + '/康里守将（故意打输）');
  expectRoom(g, 'shediao.mo.camp', label + '（打输回到漠北大营）');
  expectFlag(g, 'shediao.ch19', label + '（ch19 保留，不重演开场）');
  expectNoFlag(g, 'shediao.c19_march', label + '（回滚）');
  if (g.dialog) note(`${label}：回到检查点却弹出了对话`);
  ex(g, '东', label); ex(g, '西', label); // 出去再回来：开场不能重演
  if (g.dialog) note(`${label}：重进大营时开场重演了`);
  // 重来：从雪岭一路走到城门，打赢
  ch19march(g, label + '（重来）');
  ch19cliff(g, label + '（重来）', 'qiao');
  ch19gate(g, label + '（重来）');
  // 断后故意打输
  ch19rest(g, label, 'live', { loseRear: true });
  lose(g, label + '/怯薛千夫长（故意打输）');
  expectRoom(g, 'shediao.mo.camp', label + '（断后打输回到大营）');
  expectNoFlag(g, 'shediao.c19_li', label);
  ch19march(g, label + '（再来）');
  ch19cliff(g, label + '（再来）', 'qiao');
  ch19gate(g, label + '（再来）');
  ch19rest(g, label + '（再来）', 'live');
  // 第二十章：上崖前功力不够
  ex(g, '北', label); ex(g, '东', label); ex(g, '东', label);
  expectFlag(g, 'shediao.ch20', label);
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '东', label);
  if (!has(g, '现在还上不去')) note(`${label}：第二十章功力不够时没有"现在还上不去"`);
  pick(g, '现在还上不去', label);
  pick(g, '先下山去', label);
  ex(g, '西', label);
  expectRoom(g, 'huashan.cliff', label + '（第二十章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 130;
  ch20up(g, label, 'qiao');
  // 裘千仞故意打输一次
  pick(g, '请朱子柳把话说完', label);
  pick(g, '……', label);
  pick(g, '接他的铁掌', label);
  lose(g, label + '/裘千仞（故意打输）');
  expectRoom(g, 'huashan.gate', label + '（打输回到玉泉院）');
  expectFlag(g, 'shediao.ch20', label);
  expectNoFlag(g, 'shediao.c20_up', label);
  ex(g, '东', label);
  if (g.dialog) note(`${label}：重来后苍龙岭的开场重演了`);
  ch20up(g, label + '（重来）', 'qiao');
  // 欧阳锋故意打输一次
  ch20rest(g, label + '（重来）', { pa: false, zhou: 'skip', pull: false, loseOu: true });
  lose(g, label + '/欧阳锋（故意打输）');
  expectRoom(g, 'huashan.gate', label + '（终战打输回到玉泉院）');
  expectNoFlag(g, 'shediao.c20_qiu', label);
  ex(g, '东', label);
  ch20up(g, label + '（再来）', 'qiao');
  ch20rest(g, label + '（再来）', { pa: false, zhou: 'skip', pull: true });
}

// ---------------- 欧阳锋的四种疯话 ----------------
for (const [c12, want] of [['shediao.c12_fake', '手朝天'], ['shediao.c12_true', '哪一部是真的'], ['shediao.c12_blank', '一个字都没写'], [null, '下卷的总纲']]) {
  const label = `疯话（${c12 ?? '无标记'}）`;
  const flags = { 'shediao.ch19_done': true, 'shediao.ch19': true };
  if (c12) flags[c12] = true;
  const g = newGame({ skills: { 'shediao.cuijian': 130 }, flags });
  g.enter('huashan.cliff');
  ch20up(g, label, 'qiao');
  pick(g, '请朱子柳把话说完', label); pick(g, '……', label); pick(g, '接他的铁掌', label); win(g, label);
  pick(g, '看朱子柳', label); pick(g, '……', label);
  ex(g, '东', label); pick(g, '不陪他', label); ex(g, '西', label);
  const out = g.exec(String(g.dialog.findIndex((c) => c.text.includes('回头去看')) + 1));
  const text = out.map((o) => o.text).join('\n');
  if (!text.includes(want)) note(`${label}：欧阳锋没有说出含「${want}」的那句`);
  const others = ['手朝天', '哪一部是真的', '一个字都没写', '下卷的总纲'].filter((w) => w !== want);
  for (const w of others) if (text.includes(w)) note(`${label}：欧阳锋多说了含「${w}」的那句`);
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 射雕第十九、二十章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来）、兵书与锦帕有无、第十二章三种标记与无标记、周伯通赢输与不打、三处打输重来');
