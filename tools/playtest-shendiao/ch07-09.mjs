// 神雕第七、八、九章走查：node tools/playtest-shendiao/ch07-09.mjs（在任意目录运行）
// 照 tools/playtest-shediao/ch19-20.mjs 的写法：建 Game、设好前置标记、依次 exec；战斗时把敌人气血压到 1。
// 前置标记手动设：射雕全线完成、神雕第一到六章完成；射雕留下的标记按路线给。

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

function newGame({ skills = {}, flags = {}, items = {}, hp = 0 } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
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
  for (let i = 1; i <= 6; i++) { st.flags[`shendiao.ch${i}`] = true; st.flags[`shendiao.ch${i}_done`] = true; }
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
/** 选一个选项，返回这一步输出的全部文字 */
function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（人在 ${g.state.player.room}）`); return ''; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return ''; }
  return ex(g, String(i + 1), label).map((o) => o.text).join('\n');
}
const go = (g, dir, label) => ex(g, dir, label).map((o) => o.text).join('\n');
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
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = 1e9; }
    ex(g, '0', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没输掉`);
}

const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, label) => { if (!flag(g, f)) note(`${label}：应当设下标记 ${f}，却没有`); };
const expectNoFlag = (g, f, label) => { if (flag(g, f)) note(`${label}：标记 ${f} 不该在`); };
const expectRoom = (g, r, label) => { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); };
const expectText = (t, s, label) => { if (!t.includes(s)) note(`${label}：输出里应当有「${s}」`); };
const expectNoText = (t, s, label) => { if (t.includes(s)) note(`${label}：输出里不该有「${s}」`); };
function expectCap(g, id, n, label) { if ((g.state.player.skillcap?.[id] ?? 0) < n) note(`${label}：${id} 的上限应当 ≥ ${n}，是 ${g.state.player.skillcap?.[id]}`); }
function goal(g) {
  return Object.values(g.db.goal).filter((x) => /^shendiao\.goal\.c0[789]\./.test(x.id) && g.check((x.props.if ?? '').split(/\s+/).filter(Boolean))).map((x) => x.id);
}
function expectGoal(g, id, label) { const gs = goal(g); if (gs[0] !== id || gs.length > 1) note(`${label}：当前目标应当是 ${id}，却是 ${gs.join(', ') || '（空）'}`); }
const party = (g, on) => { g.party = on ? { members: [{ id: 'friend' }] } : null; };

// ---------------- 第七章 ----------------

function ch07open(g, label, room = 'xiangyang.station') {
  g.enter(room);
  pick(g, '去城头', label);
  expectFlag(g, 'shendiao.ch7', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.7') note(`${label}：检查点没有设到第七章`);
  expectGoal(g, 'shendiao.goal.c07.1', label);
  if (room === 'xiangyang.station') go(g, '北', label);
  if (g.dialog) note(`${label}：进十字街又弹出了开场`);
}

function ch07wall(g, label, { hero, lunwang = 'win', loseRaid = false }) {
  go(g, '东北', label);
  expectRoom(g, 'shendiao.xy.wall', label);
  const t = pick(g, '听他说下去', label);
  const want = { live: '活下去', word: '城在人在', seek: '你还在找', none: '答不好' }[hero];
  expectText(t, want, label + '（郭靖说起英雄）');
  pick(g, '……', label);
  pick(g, '守住垛口', label);
  if (loseRaid) { lose(g, label + '/达尔巴（故意打输）'); return; }
  win(g, label + '/达尔巴');
  expectFlag(g, 'shendiao.c07_raid', label);
  pick(g, '……', label);
  pick(g, '迎上金轮', label);
  if (lunwang === 'win') win(g, label + '/金轮法王'); else lose(g, label + '/金轮法王（允许输）');
  expectRoom(g, 'shendiao.xy.wall', label + '（金轮之后还在城头）');
  pick(g, '……', label);
  pick(g, '抬回郭府', label);
  expectFlag(g, 'shendiao.c07_wall', label);
  expectGoal(g, 'shendiao.goal.c07.2', label);
}

function ch07night(g, label, { answer, backed, mu, promise = false }) {
  go(g, '西南', label);
  go(g, '西北', label);
  expectRoom(g, 'shendiao.xy.guofu', label);
  pick(g, '去内院守着', label);
  expectGoal(g, 'shendiao.goal.c07.3', label);
  go(g, '北', label);
  const t = pick(g, '在他身边坐下', label);
  if (backed) expectText(t, '从神像后面走了出来', label); else expectText(t, '一声都没出', label);
  if (mu === 'money') expectText(t, '塞了银子', label);
  else if (mu === 'go') expectText(t, '送她出了城', label);
  else expectNoText(t, '我娘临死前', label);
  if (promise) expectText(t, '彭连虎说我爹', label + '（第二章的承诺）'); else expectNoText(t, '彭连虎', label);
  const opt = { truth: '原原本本', silent: '轮不到你来说', lie: '病死的' }[answer];
  const t2 = pick(g, opt, label);
  if (promise) expectText(t2, '礁石上', label + '（答话里读第二章的承诺）'); else expectNoText(t2, '礁石上', label);
  expectFlag(g, `shendiao.c07_${answer}`, label);
  for (const a of ['truth', 'silent', 'lie']) if (a !== answer) expectNoFlag(g, `shendiao.c07_${a}`, label);
  pick(g, '……', label);
  pick(g, '追上屋顶', label);
  expectGoal(g, 'shendiao.goal.c07.4', label);
}

function ch07tower(g, label, how, { c13, c11 }) {
  go(g, '南', label);
  go(g, '东南', label);
  go(g, '东北', label);
  if (g.dialog) note(`${label}：城头上又弹出了对话`);
  if (how === 'party') party(g, true);
  go(g, '东', label);
  expectRoom(g, 'shendiao.xy.jiaolou', label);
  if (has(g, '现在还上不去')) note(`${label}：满足门槛时不该出现"现在还上不去"`);
  const opt = { qiao: '踩着城垛', inner: '震断门闩', party: '守住绳头' }[how];
  pick(g, opt, label);
  if (how === 'party') party(g, false);
  expectFlag(g, 'shendiao.c07_in', label);
  const t = pick(g, '……', label);
  if (c13) expectText(t, c13, label + '（黄药师说起牛家村）');
  if (c11) expectText(t, c11, label + '（黄药师说起桃花岛）');
  pick(g, '……', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch7_done', label);
  if (g.state.player.skills['shendiao.tanzhi'] === undefined) note(`${label}：没学会弹指神通`);
  expectCap(g, 'shediao.luoying', 120, label);
  expectGoal(g, 'shendiao.goal.c07.6', label);
  // 往返：角楼、城头回得去十字街
  go(g, '西', label); go(g, '西南', label);
  expectRoom(g, 'xiangyang.center', label + '（章节之后回十字街）');
}

// ---------------- 第八章 ----------------

function ch08open(g, label) {
  go(g, '南', label);
  expectRoom(g, 'xiangyang.station', label);
  go(g, '东南', label);
  expectRoom(g, 'shendiao.jq.gate', label);
  pick(g, '跟进谷去', label);
  expectFlag(g, 'shendiao.ch8', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.8') note(`${label}：检查点没有设到第八章`);
  expectGoal(g, 'shendiao.goal.c08.1', label);
}

function ch08net(g, label, { loseNet = false } = {}) {
  go(g, '南', label);
  expectRoom(g, 'shendiao.jq.valley', label);
  pick(g, '挡住渔网', label);
  if (loseNet) { lose(g, label + '/樊一翁（故意打输）'); return; }
  win(g, label + '/樊一翁');
  expectFlag(g, 'shendiao.c08_net', label);
  pick(g, '……', label);
  pick(g, '跟她去山庄', label);
  expectGoal(g, 'shendiao.goal.c08.2', label);
}

function ch08rest(g, label, how, gs) {
  go(g, '南', label);
  expectRoom(g, 'shendiao.jq.hall', label);
  pick(g, '……', label);
  pick(g, '……', label);
  pick(g, '跟他去后院', label);
  expectGoal(g, 'shendiao.goal.c08.3', label);
  if (how === 'party') party(g, true);
  go(g, '东', label);
  expectRoom(g, 'shendiao.jq.yard', label);
  if (has(g, '现在还进不去')) note(`${label}：满足门槛时不该出现"现在还进不去"`);
  const opt = { qiao: '天窗溜下去', hp: '硬钻过去', party: '一个望风' }[how];
  pick(g, opt, label);
  if (how === 'party') party(g, false);
  expectRoom(g, 'shendiao.jq.jianfang', label + '（过场把人带进剑房）');
  pick(g, '陪他玩', label);
  expectCap(g, 'shediao.kongming', 120, label);
  pick(g, '……', label);
  pick(g, '回客房', label);
  expectFlag(g, 'shendiao.c08_sword', label);
  expectGoal(g, 'shendiao.goal.c08.5', label);
  go(g, '北', label);
  if (g.dialog) note(`${label}：后院又弹出了门槛对话`);
  go(g, '西', label);
  expectRoom(g, 'shendiao.jq.hall', label);
  pick(g, '……', label);
  pick(g, '接住公孙止', label);
  if (gs === 'win') win(g, label + '/公孙止'); else lose(g, label + '/公孙止（允许输）');
  expectRoom(g, 'shendiao.jq.hall', label + '（公孙止之后还在大厅）');
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch8_done', label);
  expectGoal(g, 'shendiao.goal.c08.6', label);
  // 婚礼不重演
  go(g, '北', label);
}

// ---------------- 第九章 ----------------

function ch09(g, label, how, { qz, c20, c16, nianhai, guard, cien = 'win', dan, yyz = false, loseGs = false }) {
  expectRoom(g, 'shendiao.jq.valley', label);
  pick(g, '去断肠崖', label);
  expectFlag(g, 'shendiao.ch9', label);
  if (g.state.checkpoint?.chapter !== 'shendiao.9') note(`${label}：检查点没有设到第九章`);
  expectGoal(g, 'shendiao.goal.c09.1', label);
  ch09down(g, label, how);
  ch09cave(g, label, { qz, c20 });
  ch09hall(g, label, { c16, guard, cien, dan, yyz, loseGs });
}

function ch09down(g, label, how) {
  if (how === 'party') party(g, true);
  go(g, '东', label);
  expectRoom(g, 'shendiao.jq.cliff', label);
  if (has(g, '现在还下不去')) note(`${label}：满足门槛时不该出现"现在还下不去"`);
  const opt = { qiao: '顺着松根', inner: '提一口真气', party: '拴在一起' }[how];
  pick(g, opt, label);
  if (how === 'party') party(g, false);
  expectRoom(g, 'shendiao.jq.pond', label + '（过场把人带到潭边）');
}

function ch09cave(g, label, { qz, c20 }, { loseCroc = false } = {}) {
  pick(g, '拼了', label);
  if (loseCroc) { lose(g, label + '/鳄鱼（故意打输）'); return; }
  win(g, label + '/鳄鱼');
  expectFlag(g, 'shendiao.c09_croc', label);
  pick(g, '钻进石缝', label);
  go(g, '北', label);
  expectRoom(g, 'shendiao.jq.bottom', label);
  pick(g, '……', label);
  const t = pick(g, '……', label);
  const qzWant = { face: '你是个厚道人', shame: '活该', none: '那就是他' }[qz];
  expectText(t, qzWant, label + '（裘千丈）');
  for (const [k, v] of Object.entries({ face: '你是个厚道人', shame: '活该', none: '那就是他' })) if (k !== qz) expectNoText(t, v, label);
  if (c20.includes('pull')) expectText(t, '那他还活着', label); else expectText(t, '拿笔把他挑了回来', label);
  if (c20.includes('pa')) expectText(t, '一对鸳鸯', label);
  if (c20.includes('word')) expectText(t, '夜里睡得着吗', label);
  pick(g, '……', label);
  pick(g, '攀着绳子上崖', label);
  expectFlag(g, 'shendiao.c09_qiu', label);
  expectRoom(g, 'shendiao.jq.hall', label + '（过场把人带回大厅）');
}

function ch09hall(g, label, { c16, guard, cien, dan, yyz, loseGs }) {
  pick(g, '……', label);
  const t = pick(g, '……', label);
  const want = { guard: '你挡在他身前', still: '一动不动', none: '还当是自己欠了谁的' }[c16];
  expectText(t, want, label + '（瑛姑）');
  if (guard) {
    const t2 = pick(g, '挡在一灯大师身前', label);
    if (yyz) expectText(t2, '一阳指', label); else expectNoText(t2, '一阳指', label);
    expectFlag(g, 'shendiao.c09_guard', label);
    pick(g, '接他的铁掌', label);
    if (cien === 'win') win(g, label + '/慈恩'); else lose(g, label + '/慈恩（允许输）');
    expectRoom(g, 'shendiao.jq.hall', label);
    pick(g, '……', label);
  } else {
    const t2 = pick(g, '照一灯说的', label);
    if (yyz) expectText(t2, '一阳指', label);
    expectFlag(g, 'shendiao.c09_still', label);
    pick(g, '……', label);
  }
  expectFlag(g, 'shendiao.c09_cien', label);
  pick(g, '接住公孙止', label);
  if (loseGs) { lose(g, label + '/公孙止（故意打输）'); return; }
  win(g, label + '/公孙止');
  pick(g, dan === 'yang' ? '交给杨过' : '交给小龙女', label);
  expectFlag(g, 'shendiao.c09_dan', label);
  expectFlag(g, `shendiao.c09_dan_${dan}`, label);
  expectNoFlag(g, `shendiao.c09_dan_${dan === 'yang' ? 'long' : 'yang'}`, label);
  pick(g, '……', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shendiao.ch9_done', label);
  expectCap(g, 'shendiao.tanzhi', 60, label);
  expectCap(g, 'shediao.cuijian', 120, label);
  expectGoal(g, 'shendiao.goal.c09.5', label);
  if (g.dialog) note(`${label}：章末还留着选项`);
  // 往返：从大厅一路回襄阳；崖下还能再去
  go(g, '北', label);
  if (g.dialog) note(`${label}：章节之后回情花坡弹出了对话`);
  go(g, '东', label);
  if (g.dialog) note(`${label}：章节之后上断肠崖弹出了对话`);
  go(g, '下', label);
  expectRoom(g, 'shendiao.jq.pond', label + '（章节之后还能下崖）');
  go(g, '北', label);
  if (g.dialog) note(`${label}：章节之后进石窟弹出了对话`);
  go(g, '南', label); go(g, '上', label); go(g, '西', label); go(g, '北', label); go(g, '西北', label);
  expectRoom(g, 'xiangyang.station', label + '（回到襄阳车马行）');
}

// ---------------- 路线 1：巧；说实话；射雕标记全有；赢金轮、赢公孙止、挡一灯赢慈恩；丹给杨过 ----------------
{
  const label = '路线1';
  const g = newGame({
    skills: { 'shediao.cuijian': 200, 'quanzhen.jianfa': 100, 'tianlong.yiyangzhi': 50 },
    flags: {
      'shediao.c18_backed': true, 'shediao.c18_said_shoe': true, 'shediao.c18_mu_go': true, 'shendiao.c01_mu': true,
      'shediao.c19_hero_live': true, 'shediao.c13_told': true, 'shediao.c13_guard_block': true, 'shediao.c11_xiao_pai': true,
      'shediao.c15_qz_face': true, 'shediao.c20_pull': true, 'shediao.c20_pa': true, 'shediao.c16_guard': true,
    },
  });
  ch07open(g, label);
  ch07wall(g, label, { hero: 'live' });
  ch07night(g, label, { answer: 'truth', backed: true, mu: 'go' });
  ch07tower(g, label, 'qiao', { c13: '碗柜前头', c11: '桃枝' });
  ch08open(g, label); ch08net(g, label); ch08rest(g, label, 'qiao', 'win');
  ch09(g, label, 'qiao', { qz: 'face', c20: ['pull', 'pa'], c16: 'guard', guard: true, cien: 'win', dan: 'yang', yyz: true });
}

// ---------------- 路线 2：内功／气血；不说；射雕标记全无；输金轮、输公孙止；不挡；丹给小龙女 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { 'quanzhen.xinfa': 130 }, hp: 2150 });
  g.enter('xiangyang.center'); // 从十字街进来也接得上开场
  pick(g, '去城头', label);
  expectFlag(g, 'shendiao.ch7', label);
  ch07wall(g, label, { hero: 'none', lunwang: 'lose' });
  ch07night(g, label, { answer: 'silent', backed: false, mu: null });
  ch07tower(g, label, 'inner', {});
  ch08open(g, label); ch08net(g, label); ch08rest(g, label, 'hp', 'lose');
  ch09(g, label, 'inner', { qz: 'none', c20: [], c16: 'none', guard: false, dan: 'long' });
}

// ---------------- 路线 3：组队；说是病死的；穆念慈银子、揭穿裘千丈、转述；挡一灯输给慈恩 ----------------
{
  const label = '路线3';
  const g = newGame({
    flags: {
      'shediao.c18_mu_money': true, 'shendiao.c01_mu': true, 'shendiao.c02_promise': true, 'shediao.c19_hero_word': true, 'shediao.c11_xiao_count': true,
      'shediao.c15_qz_shame': true, 'shediao.c20_word': true, 'shediao.c16_still': true,
    },
  });
  ch07open(g, label);
  ch07wall(g, label, { hero: 'word' });
  ch07night(g, label, { answer: 'lie', backed: false, mu: 'money', promise: true });
  ch07tower(g, label, 'party', { c11: '数自己的心跳' });
  ch08open(g, label); ch08net(g, label); ch08rest(g, label, 'party', 'win');
  ch09(g, label, 'party', { qz: 'shame', c20: ['word'], c16: 'still', guard: true, cien: 'lose', dan: 'long' });
}

// ---------------- 路线 4：门槛不够时不锁人；每一场必胜战打输重来 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { 'shediao.cuijian': 200 }, flags: { 'shediao.c19_hero_seek': true } });
  ch07open(g, label);
  ch07wall(g, label, { hero: 'seek', loseRaid: true });
  expectRoom(g, 'xiangyang.station', label + '（城头打输回到车马行）');
  expectFlag(g, 'shendiao.ch7', label + '（ch7 保留，不重演开场）');
  expectNoFlag(g, 'shendiao.c07_raid', label);
  if (g.dialog) note(`${label}：回到检查点却弹出了对话`);
  go(g, '北', label);
  if (g.dialog) note(`${label}：重来时十字街弹出了开场`);
  ch07wall(g, label + '（重来）', { hero: 'seek' });
  ch07night(g, label, { answer: 'truth', backed: false, mu: null });
  // 角楼：功力不够
  g.state.player.skills['shediao.cuijian'] = 50;
  go(g, '南', label); go(g, '东南', label); go(g, '东北', label); go(g, '东', label);
  if (!has(g, '现在还上不去')) note(`${label}：功力不够时没有"现在还上不去"`);
  for (const s of ['踩着城垛', '震断门闩', '守住绳头']) if (has(g, s)) note(`${label}：功力不够时出现了「${s}」`);
  pick(g, '现在还上不去', label);
  pick(g, '先退开', label);
  go(g, '西', label);
  expectRoom(g, 'shendiao.xy.wall', label + '（门槛不锁人）');
  expectNoFlag(g, 'shendiao.c07_in', label);
  g.state.player.skills['shediao.cuijian'] = 200;
  go(g, '西南', label); go(g, '西北', label); go(g, '北', label); // 绕一圈回来，确认触发还在
  ch07tower(g, label, 'qiao', {});
  // 第八章：渔网打输
  ch08open(g, label);
  ch08net(g, label, { loseNet: true });
  expectRoom(g, 'xiangyang.station', label + '（渔网打输回到车马行）');
  expectFlag(g, 'shendiao.ch8', label);
  expectNoFlag(g, 'shendiao.c08_net', label);
  go(g, '东南', label);
  if (g.dialog) note(`${label}：重来时谷口开场重演了`);
  ch08net(g, label + '（重来）');
  // 剑房门槛不够
  go(g, '南', label); pick(g, '……', label); pick(g, '……', label); pick(g, '跟他去后院', label);
  g.state.player.skills['shediao.cuijian'] = 50;
  go(g, '东', label);
  if (!has(g, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"`);
  pick(g, '现在还进不去', label); pick(g, '先退开', label);
  go(g, '西', label);
  expectRoom(g, 'shendiao.jq.hall', label + '（剑房门槛不锁人）');
  if (g.dialog) note(`${label}：回大厅时重演了见客`);
  g.state.player.skills['shediao.cuijian'] = 200;
  go(g, '东', label);
  pick(g, '天窗溜下去', label);
  pick(g, '陪他玩', label); pick(g, '……', label); pick(g, '回客房', label);
  go(g, '北', label); go(g, '西', label);
  pick(g, '……', label); pick(g, '接住公孙止', label); win(g, label + '/公孙止'); pick(g, '……', label); pick(g, '……', label);
  expectFlag(g, 'shendiao.ch8_done', label);
  go(g, '北', label);
  // 第九章：下崖功力不够
  pick(g, '去断肠崖', label);
  g.state.player.skills['shediao.cuijian'] = 50;
  go(g, '东', label);
  if (!has(g, '现在还下不去')) note(`${label}：功力不够时没有"现在还下不去"`);
  pick(g, '现在还下不去', label); pick(g, '先退开', label);
  go(g, '西', label);
  expectRoom(g, 'shendiao.jq.valley', label + '（下崖门槛不锁人）');
  g.state.player.skills['shediao.cuijian'] = 200;
  go(g, '北', label); go(g, '南', label); // 走开再回来
  ch09down(g, label, 'qiao');
  // 鳄鱼打输
  ch09cave(g, label, { qz: 'none', c20: [] }, { loseCroc: true });
  expectRoom(g, 'shendiao.jq.gate', label + '（鳄鱼打输回到谷口）');
  expectFlag(g, 'shendiao.ch9', label);
  expectNoFlag(g, 'shendiao.c09_down', label);
  go(g, '南', label);
  if (g.dialog) note(`${label}：重来时情花坡开场重演了`);
  ch09down(g, label + '（重来）', 'qiao');
  ch09cave(g, label + '（重来）', { qz: 'none', c20: [] });
  // 公孙止打输
  ch09hall(g, label, { c16: 'none', guard: false, loseGs: true });
  expectRoom(g, 'shendiao.jq.gate', label + '（公孙止打输回到谷口）');
  expectNoFlag(g, 'shendiao.c09_qiu', label);
  expectNoFlag(g, 'shendiao.c09_cien', label);
  go(g, '南', label);
  ch09down(g, label + '（再来）', 'qiao');
  ch09cave(g, label + '（再来）', { qz: 'none', c20: [] });
  ch09hall(g, label + '（再来）', { c16: 'none', guard: false, dan: 'yang' });
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 神雕第七、八、九章走通：四条路线（巧／内功与气血／组队／门槛不够与打输重来）、三种答法、射雕标记有／无、允许输的三场赢输、慈恩挡／不挡、半颗丹两种给法、四场必胜战打输重来');
