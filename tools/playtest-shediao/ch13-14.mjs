// 射雕第十三、十四章走查：node playtest.mjs（PLAYTEST_VERBOSE=1 打印每一步）
// 照 tools/playtest-xiaoao.mjs 的写法：Node 里直接建 Game，exec 发命令；战斗时把敌人气血压到 1。
// 前置标记手动设到第十二章完成。

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
const step = (s) => { if (process.env.PLAYTEST_VERBOSE) console.log('  · ' + s); };
const note = (s) => problems.push(s);

function newGame({ skills = {}, maxhpBoost = 0, flanked = false, blade = false, gaibang = false } = {}) {
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
  if (maxhpBoost) st.player.attrs.根骨 += maxhpBoost;
  // 前置：射雕第一到十二章都走完了
  st.flags['shediao.started'] = true;
  for (let i = 1; i <= 12; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  st.flags['shediao.invited'] = true;
  st.flags['shediao.raid'] = true;
  if (flanked) st.flags['shediao.flanked'] = true;
  if (blade) st.player.inventory['shediao.duan_blade'] = 1;
  if (gaibang) st.player.sect = { id: 'gaibang', rank: 1 };
  const g = new Game(db, st);
  return g;
}

function ex(g, cmd, label) {
  const out = g.exec(cmd);
  for (const o of out) if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`);
  step(`${label}：${cmd} → 房间 ${g.state.player.room}`);
  return out;
}
function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（房间 ${g.state.player.room}）`); return false; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return false; }
  ex(g, String(i + 1), `${label}［${substr}］`);
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
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = 1e9; } // 敌人不倒：免得 NPC 队友替你打赢
    ex(g, '0', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没输掉`);
}
const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, label) => { if (!flag(g, f)) note(`${label}：应当设下 ${f}，却没有`); };
const expectNoFlag = (g, f, label) => { if (flag(g, f)) note(`${label}：不该有 ${f}`); };
const expectRoom = (g, r, label) => { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); };
const expectItem = (g, id, label) => { if (!g.state.player.inventory?.[id]) note(`${label}：应当有物品 ${id}`); };
const expectNoItem = (g, id, label) => { if (g.state.player.inventory?.[id]) note(`${label}：不该还有物品 ${id}`); };
const expectCap = (g, id, n, label) => { if ((g.state.player.skillcap?.[id] ?? 0) < n) note(`${label}：${id} 上限应当到 ${n}，现在是 ${g.state.player.skillcap?.[id]}`); };
// 只看本两章的目标（前置标记是手工设的，更早章节的目标可能也亮着）
const goalText = (g) => Object.values(g.db.goal).filter((b) => /^shediao\.goal\.c1[34]\./.test(b.id) && g.check((b.props.if ?? '').split(/\s+/).filter(Boolean))).map((b) => b.props.name).join(' | ');
function expectGoal(g, sub, label) { const t = goalText(g); if (!t.includes(sub)) note(`${label}：当前目标应含「${sub}」，现在是「${t}」`); }

const partyOn = (g) => { g.party = { members: [{ id: 'friend' }] }; };
const partyOff = (g) => { g.party = null; };
const THRESH13 = { qiao: '借槐树一荡', inner: '提一口真气', party: '搭个肩' };
const THRESH14 = { qiao: '踩着船头', hp: '推着小船', party: '一人一桨' };

// ---------------- 第十三章 ----------------

function ch13a(g, label, { how, fromStreet = true }) {
  // 开端到宫墙（fromStreet：第一次从御街起；重来时开场不再出现）
  if (fromStreet) {
    g.enter('linan.street');
    expectFlag(g, 'shediao.ch12_done', label);
    pick(g, '今晚就去', label);
    expectFlag(g, 'shediao.ch13', label);
    expectGoal(g, '翻进皇宫', label);
  }
  if (how === 'party') partyOn(g);
  ex(g, '东北', label);
  expectRoom(g, 'shediao.gong.wall', label);
  pick(g, THRESH13[how], label);
  if (how === 'party') partyOff(g);
  expectRoom(g, 'shediao.gong.kitchen', label);
  pick(g, '去东边看看', label);
  expectFlag(g, 'shediao.c13_kitchen', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.gong.cuihan', label);
  pick(g, '跟着冲进去', label);
  pick(g, '迎战', label);
}

function ch13b(g, label, { guard, flanked }) {
  // 翠寒堂打赢之后 → 牛家村 → 第一、二日
  pick(g, '扶住郭靖', label);
  pick(g, '去牛家村', label);
  expectRoom(g, 'shediao.niujia.tavern', label);
  expectFlag(g, 'shediao.c13_cuihan', label);
  pick(g, '跟进去', label);
  expectItem(g, 'shediao.zhongzhi_tu', label);
  pick(g, '……', label);
  pick(g, '七天七夜', label);
  expectFlag(g, 'shediao.c13_mishi', label);
  pick(g, '第一日', label);
  pick(g, '第二日', label);
  const opt = { block: '往碗柜前一站', trick: '编个由头', hide: '缩进灶后' }[guard];
  pick(g, opt, label);
  expectFlag(g, `shediao.c13_guard_${guard}`, label);
  pick(g, '入夜', label);
  pick(g, '天亮', label);
  expectFlag(g, 'shediao.c13_day2', label);
  if (g.dialog) note(`${label}：第二日结束应当留出空当（没有选项），却还有对话`);
  expectGoal(g, '第三日', label);
  const looked = g.describe?.('shediao.c13_shagu');
  void looked; void flanked;
}

function ch13c(g, label, { grave, viaShagu, tell, beatOuyang }) {
  // grave：'put' / 'keep' / null
  if (grave) {
    ex(g, '南', label); ex(g, '东', label);
    expectRoom(g, 'shediao.niujia.yard', label);
    pick(g, grave === 'put' ? '把刀插在坟前' : '刀还是自己留着', label);
    expectFlag(g, 'shediao.c13_grave', label);
    if (grave === 'put') { expectNoItem(g, 'shediao.duan_blade', label); expectFlag(g, 'shediao.c13_blade', label); }
    else expectItem(g, 'shediao.duan_blade', label);
    ex(g, '西', label);
    if (g.dialog) note(`${label}：坟前的对话不该再触发`);
    if (viaShagu) { ex(g, '北', label); /* 进门就会触发第三日 */ }
    else ex(g, '北', label);
  } else if (viaShagu) {
    ex(g, '对话 傻姑', label);
    pick(g, '守第三日', label);
  } else {
    ex(g, '南', label); ex(g, '北', label);
  }
  expectRoom(g, 'shediao.niujia.tavern', label);
  expectFlag(g, 'shediao.c13_day3', label);
  pick(g, tell ? '告诉他' : '只说', label);
  if (tell) expectFlag(g, 'shediao.c13_told', label);
  pick(g, '……', label);
  pick(g, '第四日', label);
  pick(g, '出去看看', label);
  pick(g, '并肩迎战', label);
}

function ch13d(g, label, { beatOuyang }) {
  pick(g, '第五日', label);
  pick(g, '第六日', label);
  pick(g, '……', label);
  pick(g, '挡在门口', label);
  if (beatOuyang) win(g, label + '/欧阳锋（硬要打赢）'); else lose(g, label + '/欧阳锋（允许输）');
  expectRoom(g, 'shediao.niujia.tavern', label);
  pick(g, '……', label);
  pick(g, '第七日', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.ch13_done', label);
  expectCap(g, 'quanzhen.xinfa', 90, label);
  expectCap(g, 'quanzhen.jianfa', 70, label);
  expectCap(g, 'shediao.jiuyin', 50, label);
  expectGoal(g, '君山', label);
  // 章节结束后：密室能进、傻姑不在了
  ex(g, '北', label);
  expectRoom(g, 'shediao.niujia.mishi', label + '（章后进密室）');
  ex(g, '南', label);
  if (g.npcsHere().some((n) => n.id === 'shediao.c13_shagu')) note(`${label}：章后傻姑应当跟黄药师走了`);
  // 章后皇宫还能回去
  g.enter('linan.street');
  ex(g, '东北', label); ex(g, '北', label); ex(g, '东', label);
  expectRoom(g, 'shediao.gong.cuihan', label + '（章后回皇宫）');
  if (g.dialog) note(`${label}：章后回翠寒堂不该再有剧情`);
}

function ch13full(g, label, o) {
  ch13a(g, label, o);
  win(g, label + '/翠寒堂');
  ch13b(g, label, o);
  ch13c(g, label, o);
  win(g, label + '/酒馆门口');
  expectFlag(g, 'shediao.c13_day3', label);
  ch13d(g, label, o);
}

// ---------------- 第十四章 ----------------

function ch14a(g, label, { how, fromStart = true }) {
  g.enter('hengyang.station');
  ex(g, '东', label);
  expectRoom(g, 'shediao.jun.dock', label);
  if (fromStart) {
    pick(g, '怎么上山', label);
    expectFlag(g, 'shediao.ch14', label);
    expectGoal(g, '夜渡洞庭', label);
    if (how === 'party') partyOn(g); // 门槛对话在过场的 goto 里打开，进过场之前就要组好队
    pick(g, '等天黑', label);
  } else if (how === 'party') {
    // 重来：从车马行再进渡口时，门槛对话已经开了；重新进一次
    partyOn(g); ex(g, '西北', label); ex(g, '东', label);
  }
  pick(g, THRESH14[how], label);
  if (how === 'party') partyOff(g);
  expectRoom(g, 'shediao.jun.shore', label);
  pick(g, '进竹林', label);
  expectFlag(g, 'shediao.c14_land', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.jun.bamboo', label);
}

function ch14b(g, label, { took, witness }) {
  pick(g, took ? '把那封信摸过来' : '不动', label);
  if (took) expectItem(g, 'shediao.c14_letter', label);
  expectFlag(g, 'shediao.c14_overhear', label);
  ex(g, '东', label);
  expectRoom(g, 'shediao.jun.field', label);
  pick(g, '……', label);
  if (witness && !has(g, '丐帮弟子的身份')) note(`${label}：丐帮弟子应当能当众作证`);
  if (!witness && has(g, '丐帮弟子的身份')) note(`${label}：不是丐帮弟子，却出现作证选项`);
  if (took !== has(g, '那封信当众抖开')) note(`${label}：信的选项和有没有信对不上`);
  if (witness) { pick(g, '丐帮弟子的身份', label); expectFlag(g, 'shediao.c14_witness', label); pick(g, '……', label); }
  else if (took) { pick(g, '那封信当众抖开', label); expectFlag(g, 'shediao.c14_expose', label); pick(g, '……', label); }
  else pick(g, '看黄蓉怎么做', label);
  pick(g, '……', label);
  pick(g, '迎战', label);
}

function ch14c(g, label) {
  pick(g, '迎战杨康', label);
}

function ch14d(g, label) {
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.ch14_done', label);
  expectCap(g, 'quanzhen.jinyan', 60, label);
  expectCap(g, 'shediao.luoying', 60, label);
  pick(g, '上岸', label);
  expectRoom(g, 'shediao.jun.dock', label);
  if (g.dialog) note(`${label}：回到渡口不该再有剧情`);
  expectGoal(g, '往西进山', label);
  // 来回：渡口回衡阳、再坐船上君山
  ex(g, '西北', label); expectRoom(g, 'hengyang.station', label + '（回衡阳）');
  ex(g, '东', label); ex(g, '东', label); expectRoom(g, 'shediao.jun.shore', label + '（章后上君山）');
  ex(g, '东', label); ex(g, '东', label); expectRoom(g, 'shediao.jun.field', label + '（章后大会坪）');
  if (g.dialog) note(`${label}：章后大会坪不该再有剧情`);
}

function ch14full(g, label, o) {
  ch14a(g, label, o);
  ch14b(g, label, o);
  win(g, label + '/彭长老');
  expectFlag(g, 'shediao.c14_peng', label);
  ch14c(g, label);
  win(g, label + '/杨康');
  ch14d(g, label);
}

// ---------------- 路线 1：巧、看见过斗篷人、刀放坟前、硬挡、告诉黄药师、打赢欧阳锋；丐帮作证 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { 'shediao.luoying': 80, 'quanzhen.jinyan': 40 }, flanked: true, blade: true, gaibang: true });
  ch13full(g, label, { how: 'qiao', guard: 'block', flanked: true, grave: 'put', viaShagu: true, tell: true, beatOuyang: true });
  expectFlag(g, 'shediao.c13_blade', label);
  ch14full(g, label, { how: 'qiao', took: true, witness: true });
}

// ---------------- 路线 2：内功 / 气血、骗走、不说、输给欧阳锋；摸走信并当众抖开 ----------------
{
  const label = '路线2';
  const g = newGame({ skills: { 'quanzhen.xinfa': 70 }, maxhpBoost: 400 });
  g.state.player.loadout.inner = 'quanzhen.xinfa';
  if (g.hpMax() < 1200) note(`${label}：测试设置的气血上限不够 1200（${g.hpMax()}）`);
  ch13full(g, label, { how: 'inner', guard: 'trick', grave: null, viaShagu: false, tell: false, beatOuyang: false });
  ch14full(g, label, { how: 'hp', took: true, witness: false });
}

// ---------------- 路线 3：组队、躲开、留刀、靠傻姑过第三日；不拿信 ----------------
{
  const label = '路线3';
  const g = newGame({ blade: true });
  ch13full(g, label, { how: 'party', guard: 'hide', grave: 'keep', viaShagu: false, tell: true, beatOuyang: false });
  expectNoFlag(g, 'shediao.c13_blade', label);
  ch14full(g, label, { how: 'party', took: false, witness: false });
}

// ---------------- 路线 4：每场必胜战都故意打输一次，回检查点重来 ----------------
{
  const label = '路线4';
  const g = newGame({ skills: { 'shediao.luoying': 90 } });
  // 翠寒堂打输
  ch13a(g, label, { how: 'qiao' });
  lose(g, label + '/翠寒堂（故意打输）');
  expectRoom(g, 'linan.station', label + '（翠寒堂打输重来）');
  expectFlag(g, 'shediao.ch13', label + '（重来保留开场）');
  expectNoFlag(g, 'shediao.c13_in', label + '（重来回滚）');
  // 自己走回御街
  ex(g, '东', label); ex(g, '北', label); ex(g, '北', label);
  expectRoom(g, 'linan.street', label + '（走回御街）');
  if (g.dialog) note(`${label}：重来走回御街不该再看一遍开场`);
  ch13a(g, label, { how: 'qiao', fromStreet: false });
  win(g, label + '/翠寒堂（重来）');
  ch13b(g, label, { guard: 'hide' });
  ch13c(g, label, { grave: null, viaShagu: true, tell: false });
  lose(g, label + '/酒馆门口（故意打输）');
  expectRoom(g, 'linan.station', label + '（门口打输重来）');
  expectNoFlag(g, 'shediao.c13_mishi', label + '（门口打输回滚）');
  expectItem(g, 'shediao.zhongzhi_tu', label + '（物品保留）');
  // 从宫墙重走一遍到门口，这回打赢
  ex(g, '东', label); ex(g, '北', label); ex(g, '北', label);
  ch13a(g, label, { how: 'qiao', fromStreet: false });
  win(g, label + '/翠寒堂（第三遍）');
  // 走路去牛家村验证过场确实把人送到了；这里由过场 goto 完成
  ch13b(g, label, { guard: 'trick' });
  ch13c(g, label, { grave: null, viaShagu: true, tell: true });
  win(g, label + '/酒馆门口（重来）');
  ch13d(g, label, { beatOuyang: false });
  // 第十四章：彭长老打输、杨康打输
  ch14a(g, label, { how: 'qiao' });
  ch14b(g, label, { took: false, witness: false });
  lose(g, label + '/彭长老（故意打输）');
  expectRoom(g, 'hengyang.station', label + '（彭长老打输重来）');
  expectFlag(g, 'shediao.ch14', label + '（重来保留开场）');
  expectNoFlag(g, 'shediao.c14_cross', label + '（重来回滚）');
  ch14a(g, label, { how: 'qiao', fromStart: false });
  ch14b(g, label, { took: false, witness: false });
  win(g, label + '/彭长老（重来）');
  ch14c(g, label);
  lose(g, label + '/杨康（故意打输）');
  expectRoom(g, 'hengyang.station', label + '（杨康打输重来）');
  ch14a(g, label, { how: 'qiao', fromStart: false });
  ch14b(g, label, { took: true, witness: false });
  win(g, label + '/彭长老（第三遍）');
  ch14c(g, label);
  win(g, label + '/杨康（重来）');
  ch14d(g, label);
}

// ---------------- 路线 5：门槛一条都不满足时，要有退路；门槛不锁人 ----------------
{
  const label = '路线5';
  const g = newGame();
  g.enter('linan.street');
  pick(g, '今晚就去', label);
  ex(g, '东北', label);
  if (has(g, THRESH13.qiao) || has(g, THRESH13.inner) || has(g, THRESH13.party)) note(`${label}：功力不够，却出现了宫墙门槛选项`);
  pick(g, '现在还翻不过去', label);
  pick(g, '先回去', label);
  ex(g, '西南', label);
  expectRoom(g, 'linan.street', label + '（宫墙门槛不锁人）');
  expectGoal(g, '翻进皇宫', label);
  // 第十四章的门槛：直接把第十三章标成完成
  g.state.flags['shediao.ch13_done'] = true;
  g.enter('hengyang.station');
  ex(g, '东', label);
  pick(g, '怎么上山', label);
  pick(g, '等天黑', label);
  if (has(g, THRESH14.qiao) || has(g, THRESH14.hp) || has(g, THRESH14.party)) note(`${label}：功力不够，却出现了夜渡门槛选项`);
  pick(g, '现在还过不去', label);
  pick(g, '先回去', label);
  ex(g, '西北', label);
  expectRoom(g, 'hengyang.station', label + '（夜渡门槛不锁人）');
  expectGoal(g, '夜渡洞庭', label);
  ex(g, '东', label);
  if (!has(g, '现在还过不去')) note(`${label}：回到渡口，门槛对话应当再开一次`);
}

// ---------------- 路线 6：从临安御街走路去牛家村（不靠过场），确认章中能自己走回酒馆 ----------------
{
  const label = '路线6';
  const g = newGame({ skills: { 'shediao.luoying': 80 } });
  ch13a(g, label, { how: 'qiao' });
  win(g, label + '/翠寒堂');
  ch13b(g, label, { guard: 'block' });
  // 第二日之后出村回临安再走回来
  ex(g, '南', label); ex(g, '西', label); ex(g, '西北', label);
  expectRoom(g, 'linan.road', label + '（出村）');
  ex(g, '东南', label); ex(g, '东', label); ex(g, '北', label);
  expectRoom(g, 'shediao.niujia.tavern', label + '（走回酒馆）');
  expectFlag(g, 'shediao.c13_day3', label + '（进门就是第三日）');
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 射雕第十三、十四章走通：六条路线；三种门槛 ×2、门槛不锁人、守门三种方式、坟前放刀/留刀、黄药师说/不说、欧阳锋输赢、丐帮作证、裘千仞的信、四场必胜战打输重来');
