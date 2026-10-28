// 神雕第十三、十四、十五章走查：node tools/playtest-shendiao/ch13-15.mjs（在任意目录运行）
// 照 tools/playtest-shediao/ch19-20.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置：射雕全线、神雕第一~十二章完成（手动设标记）。第八章的断肠崖、第十二章的风陵渡客店不在时补替身房间。

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
const step = (s) => { if (verbose) console.log('  · ' + s); };
const note = (s) => problems.push(s);

function newGame({ skills = {}, flags = {}, hp = 0 } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  // 别的会话的房间还没写时补替身（第十二章的客店、第八章的断肠崖）
  for (const id of ['shendiao.fl.inn', 'shendiao.jq.cliff', 'shendiao.jq.pond']) {
    if (!db.room[id]) { db.room[id] = { id, type: 'room', props: { name: id, exits: '' }, lines: [], choices: [] }; stubs.push(id); }
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
  st.flags['shendiao.started'] = true;
  for (let i = 1; i <= 20; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  for (let i = 1; i <= 12; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
  // 前面章节的收尾标记：免得它们的触发在这些房间里抢先弹出来
  for (const f of ['c11_fire', 'c11_night', 'c10_arm', 'c12_night', 'c09_down', 'c09_croc']) st.flags[`shendiao.${f}`] = true;
  Object.assign(st.flags, flags);
  const g = new Game(db, st);
  g.__log = [];
  const emit = g.emit.bind(g);
  g.emit = (cls, t, extra) => { emit(cls, t, extra); g.__log.push(g.out[g.out.length - 1].text ?? ''); };
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
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（人在 ${g.state.player.room}）`); return null; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return null; }
  return ex(g, String(i + 1), label);
}
const mark = (g) => g.__log.length;
const since = (g, i) => g.__log.slice(i).join(' ');
const has = (g, substr) => !!g.dialog?.some((c) => c.text.includes(substr));
const text = (out) => (out ?? []).map((o) => o.text).join('\n');

function win(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) {
      if (u.side === 'e' && u.hp > 0) u.hp = 1;
      // 一回合挨的伤可能超过气血上限：把己方气血抬高，免得允许输的仗被打输
      if (u.side === 'p') { u.mp = u.maxMp; u.maxHp = Math.max(u.maxHp, 99999); u.hp = u.maxHp; }
    }
    ex(g, '1', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没打完`);
}
function lose(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    // 敌人不倒；队友直接倒下：免得他一招把满血的敌人打死，替你打赢
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = u.isPlayer ? 1 : 0; if (u.side === 'e') u.hp = 1e9; }
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
  return Object.values(g.db.goal).filter((x) => /^shendiao\.goal\.c1[345]\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const party = (g, on) => { g.party = on ? { members: [{ id: 'friend' }] } : null; };

const QIAO = { 'shediao.cuijian': 180 };   // 巧 180
const INNER = { 'shediao.jiuyin': 140 };   // 内功 140

// ---------------- 第十三章 ----------------

function ch13open(g, label) {
  step(label + ' 第十三章开端');
  g.enter('shendiao.fl.inn');
  if (g.dialog) ex(g, '0', label); // 客店里别人的对话（不该有）
  ex(g, '西北', label);
  expectRoom(g, 'shendiao.fl.wild', label);
  expectFlag(g, 'shendiao.ch13', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.13') note(`${label}：检查点没有设到第十三章`);
  pick(g, '跟着他们往北走', label);
  expectGoal(g, 'shendiao.goal.c13.1', label);
}
function ch13gate(g, label, { loseIt = false } = {}) {
  ex(g, '北', label);
  expectRoom(g, 'shendiao.fl.wsgate', label);
  pick(g, '你上去', label);
  if (loseIt) return;
  win(g, label + '/庄门');
  pick(g, '进庄', label);
  expectFlag(g, 'shendiao.c13_gate', label);
  expectGoal(g, 'shendiao.goal.c13.2', label);
}
function ch13yard(g, label, zhou) {
  ex(g, '北', label);
  expectRoom(g, 'shendiao.fl.wsyard', label);
  pick(g, '周大哥', label);
  pick(g, '抬头看', label);
  pick(g, '杨过', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c13_needle_face', label);
  if (zhou === 'win') { pick(g, '陪他过几招', label); win(g, label + '/周伯通'); }
  else if (zhou === 'lose') { pick(g, '陪他过几招', label); lose(g, label + '/周伯通（允许输）'); }
  else pick(g, '打个赌', label);
  pick(g, '……', label);
  pick(g, '出庄', label);
  expectFlag(g, 'shendiao.c13_yang', label);
  expectGoal(g, 'shendiao.goal.c13.3', label);
}
function ch13reed(g, label, how) {
  ex(g, '南', label); ex(g, '南', label);
  g.__poolMark = mark(g);
  expectRoom(g, 'shendiao.fl.wild', label);
  if (how === 'party') party(g, true);
  ex(g, '西', label);
  expectRoom(g, 'shendiao.fl.reed', label);
  const opts = { qiao: '一根桩一根桩踩过去', hp: '从烂泥里硬趟过去', party: '一前一后', guard: '挡刀的那个人来了' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && k !== 'guard' && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (how !== 'guard' && has(g, opts.guard) !== flag(g, 'shediao.c16_guard')) note(`${label}：第四条路（瑛姑认得你）出现与否不对`);
  if (has(g, '现在还过不去')) note(`${label}：满足门槛时不该出现"现在还过不去"`);
  pick(g, opts[how], label);
  if (how === 'party') party(g, false);
  if (how === 'guard') { expectFlag(g, 'shendiao.c13_yinggu_knew', label); pick(g, '踩着木板过去', label); }
  else pick(g, '继续往前', label);
  expectFlag(g, 'shendiao.c13_reed', label);
  expectRoom(g, 'shendiao.fl.pool', label + '（过场把人带到潭边）');
  expectGoal(g, 'shendiao.goal.c13.4', label);
}
function ch13pool(g, label, { advice = 'tell', loseIt = false } = {}) {
  pick(g, '……', label); pick(g, '……', label);
  const t = [since(g, g.__poolMark ?? 0)];
  pick(g, '……', label);
  if (loseIt) { pick(g, '迎上去', label); return t; }
  pick(g, '迎上去', label);
  win(g, label + '/潭边夜袭');
  expectFlag(g, 'shendiao.c13_night', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.c13_needle_birthday', label);
  pick(g, '……', label);
  pick(g, advice === 'tell' ? '留着吧' : '我不替你拿主意', label);
  expectFlag(g, `shendiao.c13_needle_${advice}`, label);
  expectFlag(g, 'shendiao.c13_needle_kept', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch13_done', label);
  expectCap(g, 'shendiao.xuantie', 80, label);
  expectCap(g, 'shediao.nanshan', 120, label);
  expectGoal(g, 'shendiao.goal.c13.5', label);
  if (g.dialog) note(`${label}：第十三章完了还有对话`);
  // 章节之后还能回到风陵渡
  ex(g, '东', label); ex(g, '东', label);
  expectRoom(g, 'shendiao.fl.wild', label + '（章节之后回荒路）');
  if (g.dialog) note(`${label}：章节之后回荒路弹出了对话`);
  ex(g, '东南', label);
  expectRoom(g, 'shendiao.fl.inn', label + '（章节之后回客店）');
  return t;
}

// ---------------- 第十四章 ----------------

function ch14open(g, label) {
  step(label + ' 第十四章开端');
  g.enter('xiangyang.station');
  expectFlag(g, 'shendiao.ch14', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.14') note(`${label}：检查点没有设到第十四章`);
  pick(g, '回车马行歇一歇', label);
  pick(g, '去南阳', label);
  expectGoal(g, 'shendiao.goal.c14.1', label);
}
function ch14camp(g, label, how, { loseIt = false } = {}) {
  ex(g, '西北', label);
  expectRoom(g, 'shendiao.fl.nyroad', label);
  if (g.dialog) note(`${label}：南阳道上不该弹对话`);
  if (how === 'party') party(g, true);
  ex(g, '北', label);
  expectRoom(g, 'shendiao.fl.nyout', label);
  const opts = { qiao: '踩着寨墙上的冰溜子', inner: '运一口真气', party: '搭个人梯' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  pick(g, opts[how], label);
  if (how === 'party') party(g, false);
  expectFlag(g, 'shendiao.c14_in', label);
  pick(g, '摸到粮囤底下去', label);
  expectRoom(g, 'shendiao.fl.nycamp', label);
  expectGoal(g, 'shendiao.goal.c14.2', label);
  pick(g, '挡在火前', label);
  if (loseIt) return;
  win(g, label + '/粮营');
  expectFlag(g, 'shendiao.c14_fire', label);
  expectFlag(g, 'shendiao.c14_gift_grain', label);
  pick(g, '出营', label);
}
function ch14second(g, label, which) {
  if (which === 'fire') {
    pick(g, '帮一窟鬼备第三份礼', label);
    expectFlag(g, 'shendiao.c14_gift_fire', label);
    pick(g, '回襄阳', label);
    ex(g, '南', label); ex(g, '南', label);
    expectRoom(g, 'shendiao.fl.nyroad', label);
    if (g.dialog) note(`${label}：选了烟花，南阳道上不该再截霍都`);
  } else {
    pick(g, '截霍都', label);
    expectFlag(g, 'shendiao.c14_gift_huodu', label);
    pick(g, '往南回南阳道', label);
    expectGoal(g, 'shendiao.goal.c14.3', label);
    ex(g, '南', label); ex(g, '南', label);
    expectRoom(g, 'shendiao.fl.nyroad', label);
    pick(g, '拦住他', label);
    if (which === 'huodu_win') win(g, label + '/霍都'); else lose(g, label + '/霍都（允许输）');
    expectFlag(g, `shendiao.c14_huodu_${which === 'huodu_win' ? 'won' : 'lost'}`, label);
    pick(g, '……', label);
    pick(g, '回襄阳', label);
    expectFlag(g, 'shendiao.c14_huodu', label);
  }
  expectGoal(g, 'shendiao.goal.c14.4', label);
  ex(g, '东南', label);
  expectRoom(g, 'xiangyang.station', label);
  if (g.dialog) note(`${label}：回到车马行时不该弹对话`);
  ex(g, '北', label);
  expectRoom(g, 'xiangyang.center', label);
  const m = mark(g);
  pick(g, '……', label);
  pick(g, '跟出去', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch14_done', label);
  expectCap(g, 'shendiao.tianluo', 100, label);
  expectCap(g, 'shediao.yuenv', 120, label);
  expectGoal(g, 'shendiao.goal.c14.5', label);
  const t = since(g, m);
  if (which === 'fire' && !t.includes('仵作')) note(`${label}：烟花路线没有听到霍都的死讯`);
  if (which !== 'fire' && !t.includes('物归原主')) note(`${label}：截霍都路线没有物归原主那一句`);
}

// ---------------- 第十五章 ----------------

function ch15open(g, label) {
  step(label + ' 第十五章开端');
  if (g.state.player.room !== 'xiangyang.station') g.enter('xiangyang.station');
  else { ex(g, '北', label); ex(g, '南', label); }
  expectFlag(g, 'shendiao.ch15', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.15') note(`${label}：检查点没有设到第十五章`);
  pick(g, '去绝情谷', label);
  expectGoal(g, 'shendiao.goal.c15.1', label);
  // 第十四章之后南阳道还在
  ex(g, '西北', label);
  expectRoom(g, 'shendiao.fl.nyroad', label + '（第十四章之后还能去南阳道）');
  if (g.dialog) note(`${label}：章节之后去南阳道弹出了对话`);
  ex(g, '东南', label);
}
function ch15cliff(g, label, { entered = false } = {}) {
  if (!entered) g.enter('shendiao.jq.cliff'); // 谷口到断肠崖的路是第八章的
  const m = mark(g);
  pick(g, '在他身边坐下', label);
  pick(g, '……', label);
  pick(g, '杨过——', label);
  const t = since(g, m);
  expectFlag(g, 'shendiao.c15_jump', label);
  pick(g, '抢上去拉她', label);
  pick(g, '下去找他们', label);
  return t;
}
function ch15down(g, label, how) {
  const opts = { qiao: '抓住老藤', hp: '纵身跳下去', party: '把两根藤绞在一起' };
  for (const [k, v] of Object.entries(opts)) if (k !== how && has(g, v)) note(`${label}：门槛「${v}」不该出现`);
  if (has(g, '现在还下不去')) note(`${label}：满足门槛时不该出现"现在还下不去"`);
  pick(g, opts[how], label);
  if (how === 'party') party(g, false);
  expectFlag(g, 'shendiao.c15_down', label);
  pick(g, '……', label);
  expectRoom(g, 'shendiao.jq.bottom2', label + '（过场把人带到寒潭）');
  expectGoal(g, 'shendiao.goal.c15.3', label);
}
function ch15rest(g, label, { spar = 'win', loseIt = false } = {}) {
  pick(g, '迎上去', label);
  if (loseIt) return;
  win(g, label + '/寒潭');
  expectFlag(g, 'shendiao.c15_fight', label);
  pick(g, '跟着神雕潜下水', label);
  expectRoom(g, 'shendiao.jq.bottom3', label);
  expectGoal(g, 'shendiao.goal.c15.4', label);
  ex(g, '东', label);
  expectRoom(g, 'shendiao.jq.bottom4', label);
  const m = mark(g);
  pick(g, '……', label);
  pick(g, '问她这十六年', label);
  expectFlag(g, 'shendiao.c15_meet', label);
  pick(g, '去看那棵蜂树', label);
  const ab = since(g, m);
  pick(g, '……', label);
  if (spar === 'win') { pick(g, '陪她过几招', label); win(g, label + '/小龙女'); }
  else if (spar === 'lose') { pick(g, '陪她过几招', label); lose(g, label + '/小龙女（允许输）'); }
  else if (spar === 'skip') pick(g, '这一回不比了', label);
  else { if (has(g, '陪她过几招')) note(`${label}：没学天罗地网势也出现了过招`); pick(g, '……', label); }
  expectFlag(g, `shendiao.c15_spar_${spar === 'none' ? 'skip' : spar === 'win' ? 'won' : spar === 'lose' ? 'lost' : 'skip'}`, label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch15_done', label);
  expectCap(g, 'shendiao.xuantie', 100, label);
  expectCap(g, 'quanzhen.jianfa', 120, label);
  expectCap(g, 'quanzhen.xinfa', 120, label);
  expectGoal(g, 'shendiao.goal.c15.6', label);
  // 章节之后从谷底回崖上，再下来
  ex(g, '西', label); ex(g, '西', label); ex(g, '西', label);
  expectRoom(g, 'shendiao.jq.pond', label + '（章节之后从寒潭到鳄鱼潭）');
  ex(g, '上', label);
  expectRoom(g, 'shendiao.jq.cliff', label + '（章节之后上崖）');
  if (g.dialog) note(`${label}：章节之后回崖上弹出了对话`);
  ex(g, '下', label); ex(g, '东', label);
  expectRoom(g, 'shendiao.jq.bottom2', label + '（章节之后还能回寒潭）');
  if (g.dialog) note(`${label}：章节之后下崖弹出了对话`);
  return ab;
}

// ---------------- 路线 1：巧；c16_guard 但走巧；周伯通打赢；劝她留着；粮营之后截霍都打赢；c10_arm_block、c11_promise、c11_nanhai_back；和小龙女过招打赢 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { ...QIAO, 'shendiao.tianluo': 100, 'shediao.kongming': 120 }, flags: { 'shediao.c16_guard': true, 'shendiao.c10_arm_block': true, 'shendiao.c11_cliff': true, 'shendiao.c11_promise': true, 'shendiao.c11_nanhai_back': true } });
  ch13open(g, label); ch13gate(g, label); ch13yard(g, label, 'win'); ch13reed(g, label, 'qiao');
  const t = ch13pool(g, label, { advice: 'tell' });
  if (!t[0].includes('一寸')) note(`${label}：c16_guard 时瑛姑没有提那一寸`);
  ch14open(g, label); ch14camp(g, label, 'qiao'); ch14second(g, label, 'huodu_win');
  ch15open(g, label);
  const c = ch15cliff(g, label);
  if (!c.includes('扣住了她的手腕')) note(`${label}：c10_arm_block 时杨过没有提那一扑`);
  ch15down(g, label, 'qiao');
  const r = ch15rest(g, label, { spar: 'win' });
  if (!r.includes('你守住了')) note(`${label}：c11_promise 时小龙女没有说"你守住了"`);
  if (!r.includes('谢谢你')) note(`${label}：c11_nanhai_back 时杨过没有那一句`);
}

// ---------------- 路线 2：气血／内功；c16_still；周伯通打输；不拿主意；烟花；c10_arm_away、c11_away、c11_nanhai_quiet；不和小龙女过招 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { ...INNER, 'shendiao.tianluo': 100 }, flags: { 'shediao.c16_still': true, 'shendiao.c10_arm_away': true, 'shendiao.c11_away': true, 'shendiao.c11_nanhai_quiet': true }, hp: 2250 });
  ch13open(g, label); ch13gate(g, label); ch13yard(g, label, 'lose'); ch13reed(g, label, 'hp');
  const t = ch13pool(g, label, { advice: 'quiet' });
  if (!t[0].includes('刀柄')) note(`${label}：c16_still 时瑛姑没有提刀柄`);
  ch14open(g, label); ch14camp(g, label, 'inner'); ch14second(g, label, 'fire');
  ch15open(g, label);
  const c = ch15cliff(g, label);
  if (!c.includes('你不在')) note(`${label}：c10_arm_away 时杨过没有那一句`);
  ch15down(g, label, 'hp');
  const r = ch15rest(g, label, { spar: 'skip' });
  if (!r.includes('她长这么大了')) note(`${label}：c11_away 时小龙女没有那一句`);
  if (!r.includes('装了十六年')) note(`${label}：c11_nanhai_quiet 时杨过没有那一句`);
}

// ---------------- 路线 3：组队；c16_guard 走第四条路；打赌；截霍都打输；没有第十、十一章的标记；没学天罗地网势 ----------------
{
  const label = '路线3';
  const g = newGame({ flags: { 'shediao.c16_guard': true } });
  ch13open(g, label); ch13gate(g, label); ch13yard(g, label, 'bet'); ch13reed(g, label, 'guard');
  ch13pool(g, label, { advice: 'tell' });
  ch14open(g, label); ch14camp(g, label, 'party'); ch14second(g, label, 'huodu_lose');
  ch15open(g, label);
  party(g, true); // 门槛对话是在打开的那一瞬过滤的：组队要在打开之前（崖上这一段没有战斗）
  const c = ch15cliff(g, label);
  if (!c.includes('不问我胳膊')) note(`${label}：没有第十章标记时杨过没有那一句`);
  ch15down(g, label, 'party');
  const r = ch15rest(g, label, { spar: 'none' });
  if (!r.includes('常来看他')) note(`${label}：没有第十一章标记时小龙女没有那一句`);
}

// ---------------- 路线 4：门槛不够不锁人；三场必胜战各打输一次，回到检查点重来；没有射雕第十六章标记 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { ...QIAO, 'shendiao.tianluo': 100 } });
  ch13open(g, label);
  // 庄门打输
  ch13gate(g, label, { loseIt: true });
  lose(g, label + '/庄门（故意打输）');
  expectRoom(g, 'shendiao.fl.inn', label + '（打输回到客店）');
  expectFlag(g, 'shendiao.ch13', label);
  if (g.dialog) note(`${label}：回到检查点弹出了对话`);
  ex(g, '西北', label);
  if (g.dialog) note(`${label}：重来时开场重演了`);
  ch13gate(g, label + '（重来）');
  ch13yard(g, label, 'bet');
  // 芦荡功力不够
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '南', label); ex(g, '南', label); ex(g, '西', label);
  if (has(g, '挡刀的那个人')) note(`${label}：没有 c16_guard 时出现了第四条路`);
  if (!has(g, '现在还过不去')) note(`${label}：功力不够时没有"现在还过不去"`);
  pick(g, '现在还过不去', label); pick(g, '先退回去', label);
  ex(g, '东', label);
  expectRoom(g, 'shendiao.fl.wild', label + '（门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 180;
  ex(g, '北', label); ex(g, '北', label);
  if (g.dialog) note(`${label}：回兽苑弹出了对话`);
  ex(g, '南', label); ex(g, '南', label);
  g.__poolMark = mark(g);
  ex(g, '西', label);
  pick(g, '一根桩一根桩踩过去', label); pick(g, '继续往前', label);
  const t = ch13pool(g, label, { loseIt: true });
  if (!t[0].includes('背着人上山的')) note(`${label}：没有射雕第十六章标记时瑛姑没有那一句`);
  lose(g, label + '/潭边（故意打输）');
  expectRoom(g, 'shendiao.fl.inn', label + '（潭边打输回到客店）');
  expectNoFlag(g, 'shendiao.c13_gate', label + '（回滚）');
  ex(g, '西北', label);
  ch13gate(g, label + '（再来）'); ch13yard(g, label + '（再来）', 'bet'); ch13reed(g, label + '（再来）', 'qiao');
  ch13pool(g, label + '（再来）', { advice: 'quiet' });
  // 第十四章：粮营功力不够，再打输一次
  ch14open(g, label);
  g.state.player.skills['shediao.cuijian'] = 50;
  ex(g, '西北', label); ex(g, '北', label);
  if (!has(g, '现在还进不去')) note(`${label}：第十四章功力不够时没有"现在还进不去"`);
  pick(g, '现在还进不去', label); pick(g, '先退回去', label);
  ex(g, '南', label);
  expectRoom(g, 'shendiao.fl.nyroad', label + '（第十四章门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 180;
  ex(g, '东南', label);
  ch14camp(g, label, 'qiao', { loseIt: true });
  lose(g, label + '/粮营（故意打输）');
  expectRoom(g, 'xiangyang.station', label + '（粮营打输回到车马行）');
  expectFlag(g, 'shendiao.ch14', label);
  expectNoFlag(g, 'shendiao.c14_in', label);
  if (g.dialog) note(`${label}：粮营打输回来弹出了对话`);
  ch14camp(g, label + '（重来）', 'qiao'); ch14second(g, label + '（重来）', 'fire');
  // 第十五章：下崖功力不够，寒潭打输一次
  ch15open(g, label);
  g.state.player.skills['shediao.cuijian'] = 50;
  ch15cliff(g, label);
  if (!has(g, '现在还下不去')) note(`${label}：第十五章功力不够时没有"现在还下不去"`);
  pick(g, '现在还下不去', label); pick(g, '先退回去', label);
  if (g.dialog) note(`${label}：退回去之后对话还开着`);
  expectNoFlag(g, 'shendiao.c15_down', label);
  g.state.player.skills['shediao.cuijian'] = 180;
  g.enter('shendiao.jq.cliff');
  if (has(g, '在他身边坐下')) note(`${label}：重进断肠崖时等人那一段重演了`);
  ch15down(g, label, 'qiao');
  ch15rest(g, label, { loseIt: true });
  lose(g, label + '/寒潭（故意打输）');
  expectRoom(g, 'xiangyang.station', label + '（寒潭打输回到车马行）');
  expectNoFlag(g, 'shendiao.c15_jump', label);
  g.enter('shendiao.jq.cliff');
  if (!has(g, '在他身边坐下')) note(`${label}：重来时断肠崖那一段没有再开`);
  ch15cliff(g, label + '（重来）', { entered: true });
  ch15down(g, label + '（重来）', 'qiao');
  ch15rest(g, label + '（重来）', { spar: 'lose' });
}

if (stubs.length) console.log(`（替身房间：${stubs.join('、')}——这些房间还没写，走查时临时补的）`);
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 神雕第十三~十五章走通：四条路线（巧／气血与内功／组队与第四条路／门槛不够与打输重来）、射雕第十六章三种标记、第十、十一章标记有无、周伯通赢输打赌、霍都赢输与烟花、小龙女赢输不打与没学天罗地网势、五处打输重来');
