// 射雕第十七、十八章走查：node playtest-ch17-18.mjs
// 照 tools/playtest-xiaoao.mjs 的写法：在 Node 里建 Game，前置标记手动设好，依次 exec；战斗时把敌人气血压到 1。
// 路线 A：巧 100 过桃林、替黄蓉说话、五条线索全查、铁枪庙五条全说、留银子、赢欧阳锋
// 路线 B：内功 85 过桃林、不说话、一条线索不查、气血 1600 进庙、想拦欧阳锋、送穆念慈、输给欧阳锋
// 路线 C：两处都组队过；墓室、礁石湾、烟雨楼三场必胜战各故意打输一次，回检查点重来
// 路线 D：两处门槛都不满足，要有"现在还不行"、不锁人

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const repo = new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const { parse, addBlocks, emptyDb } = await import('file:///' + repo + '/src/content.js');
const { newState } = await import('file:///' + repo + '/src/save.js');
const { Game } = await import('file:///' + repo + '/src/game.js');

const root = join(repo, 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];

const problems = [];
const note = (s) => problems.push(s);
const V = !!process.env.PLAYTEST_VERBOSE;

function newGame({ skills = {}, maxhpBoost = 0 } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: Object.keys(skills).find((id) => db.skill[id]?.props.kind === '内功') ?? null,
    light: null,
  };
  st.player.money = 5000;
  if (maxhpBoost) st.player.attrs.根骨 += maxhpBoost;
  // 前置：射雕走到第十六章完
  const f = st.flags;
  f['shediao.started'] = true;
  for (let i = 1; i <= 16; i++) { f[`shediao.ch${i}`] = true; f[`shediao.ch${i}_done`] = true; }
  // 第十一~十六章自己的剧情标记（关掉那几章的触发；互斥分支的标记也一起设上，只为走查）
  for (let i = 11; i <= 16; i++) {
    const src = readFileSync(join(root, `shediao/ch${i}.md`), 'utf8');
    for (const m of src.matchAll(/flag:(shediao\.c1[1-6]_[\w]+)/g)) f[m[1]] = true;
  }
  Object.assign(f, { 'shediao.raid': true, 'shediao.c11_maze': true, 'shediao.c11_lost': true, 'shediao.lead_jiaxing': true, 'shediao.met_qiu_jx': true, 'shediao.fahua_gate': true });
  const g = new Game(db, st);
  g.enter('shediao.niujia.yard');
  return g;
}

function ex(g, cmd, label) {
  const out = g.exec(cmd);
  for (const o of out) {
    if (V) console.log(`    [${o.cls}] ${o.text}`);
    if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`);
  }
  return out;
}
function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话（在 ${g.state.player.room}）`); return false; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return false; }
  ex(g, String(i + 1), label);
  return true;
}
const has = (g, s) => !!g.dialog?.some((c) => c.text.includes(s));
function win(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) { if (u.side === 'e' && u.hp > 0) u.hp = 1; if (u.isPlayer) { u.mp = u.maxMp; u.hp = u.maxHp; } }
    ex(g, '1', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没打完`);
}
function lose(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 80 && g.state.battle; i++) {
    for (const u of g.state.battle.units) { if (u.side === 'p' && u.hp > 0) u.hp = 1; if (u.side === 'e') u.hp = Math.max(u.hp, u.maxHp); } // 敌人不倒：免得 NPC 队友替你打赢
    ex(g, '0', label);
  }
  if (g.state.battle) note(`${label}：八十回合还没输掉`);
}
const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, l) => { if (!flag(g, f)) note(`${l}：应当设下 ${f}，却没有`); };
const expectNo = (g, f, l) => { if (flag(g, f)) note(`${l}：不该有 ${f}`); };
const expectRoom = (g, r, l) => { if (g.state.player.room !== r) note(`${l}：应在 ${r}，却在 ${g.state.player.room}`); };
const go = (g, dirs, l) => { for (const d of dirs) ex(g, d, l); };
const party = (g, on) => { g.party = on ? { members: [{ id: 'friend' }] } : null; };

// ---------------- 第十七章 ----------------

function ch17(g, L, { how, defend, clues, ask, loseCrypt = false, loseReef = false }) {
  ex(g, '东', L); // 院子 → 江边，触发开端
  expectRoom(g, 'shediao.niujia.river', L);
  pick(g, '上船', L);
  expectRoom(g, 'shediao.thd.beach', L);
  expectFlag(g, 'shediao.c17_land', L);
  pick(g, '……', L);
  if (!g.state.player.inventory) note(L + '：背包丢了');
  go(g, ['北', '西', '下', '北'], L);
  expectRoom(g, 'shediao.thd2.crypt', L);
  pick(g, '……', L); pick(g, '……', L);
  expectFlag(g, 'shediao.c17_found', L);
  if (g.state.checkpoint?.chapter !== 'shediao.17') note(L + '：发现尸首之后应当设下第十七章的检查点');
  pick(g, '迎战', L);
  if (loseCrypt) {
    lose(g, L + '/墓室（故意输）');
    expectRoom(g, 'shediao.thd.tomb', L + '（重来回墓前）');
    expectFlag(g, 'shediao.c17_found', L + '（重来不必再看发现尸首）');
    expectNo(g, 'shediao.c17_won1', L + '（重来）');
    go(g, ['下', '北'], L);
    if (!has(g, '迎战')) note(L + '：墓室重来时没有再开战的对话');
    pick(g, '迎战', L);
  }
  win(g, L + '/墓室');
  expectFlag(g, 'shediao.c17_won1', L);
  pick(g, '……', L);
  pick(g, defend ? '替黄蓉说一句话' : '什么也不说', L);
  expectFlag(g, defend ? 'shediao.c17_defend' : 'shediao.c17_silent', L);
  pick(g, '……', L);
  pick(g, '……', L);
  expectFlag(g, 'shediao.c17_split', L);
  if (g.dialog) note(L + '：决裂之后对话应当结束');
  go(g, ['南', '上', '东', '东南'], L);
  expectRoom(g, 'shediao.thd2.maze', L);
  if (how === 'party') { ex(g, '西北', L); party(g, true); ex(g, '东南', L); }
  const opt = { qiao: '踩着桃枝', inner: '提一口真气', party: '分头包抄' }[how];
  if (has(g, '现在还追不上')) note(L + '：功夫够了还显示"现在还追不上"');
  pick(g, opt, L);
  party(g, false);
  expectRoom(g, 'shediao.thd2.reef', L);
  pick(g, '迎战', L);
  if (loseReef) {
    lose(g, L + '/礁石湾（故意输）');
    expectRoom(g, 'shediao.thd.tomb', L + '（礁石湾输了回墓前）');
    expectNo(g, 'shediao.c17_split', L + '（重来，决裂回滚）');
    go(g, ['下', '北'], L);
    pick(g, '迎战', L);
    win(g, L + '/墓室（重来）');
    pick(g, '……', L); pick(g, defend ? '替黄蓉说一句话' : '什么也不说', L); pick(g, '……', L); pick(g, '……', L);
    go(g, ['南', '上', '东', '东南'], L);
    if (how === 'party') { ex(g, '西北', L); party(g, true); ex(g, '东南', L); }
    pick(g, opt, L); party(g, false);
    pick(g, '迎战', L);
  }
  win(g, L + '/礁石湾');
  pick(g, ask ? '逼问他' : '由他跳海', L);
  if (ask) expectFlag(g, 'shediao.c17_clue_wangye', L); else expectNo(g, 'shediao.c17_clue_wangye', L);
  pick(g, '……', L);
  expectRoom(g, 'shediao.thd2.crypt', L);
  expectFlag(g, 'shediao.c17_reef', L);
  pick(g, '……', L);
  const look = { shoe: '朱聪攥着', claw: '全金发头顶', snake: '回墓道里', stroke: '两笔' };
  for (const c of clues) {
    pick(g, look[c], L);
    expectFlag(g, `shediao.c17_clue_${c}`, L);
    if (c === 'shoe' && !g.state.player.inventory['shediao.cuixie']) note(L + '：没拿到翡翠小鞋');
    pick(g, c === 'shoe' ? '收好它' : '……', L);
    if (has(g, look[c])) note(`${L}：查过的线索 ${c} 选项没有消失`);
  }
  pick(g, '安葬', L);
  pick(g, '离开桃花岛', L);
  expectFlag(g, 'shediao.ch17_done', L);
  expectRoom(g, 'shediao.niujia.river', L);
  const cap = g.state.player.skillcap ?? {};
  if (cap['shediao.yuenv'] !== 80 || cap['shediao.nanshan'] !== 70 || cap['shediao.cuijian'] !== 50) note(`${L}：第十七章上限不对 ${JSON.stringify(cap)}`);
  // 岛还回得去：江边船家 → 海滩，海滩哑仆 → 江边
  ex(g, '对话 船家', L);
  pick(g, '去桃花岛', L);
  expectRoom(g, 'shediao.thd.beach', L + '（章后再上岛）');
  if (g.dialog) note(L + '：章后上岛又触发了剧情');
  ex(g, '对话 哑仆', L);
  pick(g, '坐船回牛家村', L);
  expectRoom(g, 'shediao.niujia.river', L + '（章后离岛）');
}

// ---------------- 第十八章 ----------------

function ch18(g, L, { how, said, beatOuyang, stop, money, loseKang = false }) {
  g.enter('jiaxing.station'); // 临安坐车一日，这里直接到站
  expectFlag(g, 'shediao.ch18', L);
  pick(g, '去南湖', L);
  go(g, ['北', '东北'], L);
  expectRoom(g, 'shediao.yy.lake', L);
  ex(g, '对话 茶摊老汉', L);
  pick(g, '新鲜事', L);
  expectFlag(g, 'shediao.c18_rumor', L);
  pick(g, '喝完茶', L);
  ex(g, '北', L);
  expectRoom(g, 'shediao.yy.tower', L);
  pick(g, '……', L); pick(g, '……', L);
  pick(g, '迎战', L);
  if (loseKang) {
    lose(g, L + '/杨康（故意输）');
    expectRoom(g, 'jiaxing.station', L + '（重来回车马行）');
    expectFlag(g, 'shediao.ch18', L + '（重来不重演开端）');
    if (g.dialog) note(L + '：重来时车马行又弹了开端');
    go(g, ['北', '东北', '北'], L);
    pick(g, '……', L); pick(g, '……', L);
    pick(g, '迎战', L);
  }
  win(g, L + '/杨康');
  expectFlag(g, 'shediao.c18_kang', L);
  pick(g, '……', L);
  pick(g, '站进阵里', L);
  if (beatOuyang) win(g, L + '/欧阳锋'); else lose(g, L + '/欧阳锋（允许输）');
  expectRoom(g, 'shediao.yy.tower', L + '（欧阳锋之后）');
  pick(g, '……', L);
  pick(g, '……', L);
  expectFlag(g, 'shediao.c18_ouyang', L);
  go(g, ['南', '东', '东'], L);
  expectRoom(g, 'shediao.yy.temple', L);
  if (how === 'party') { ex(g, '西', L); party(g, true); ex(g, '东', L); }
  const opt = { qiao: '翻上屋顶', hp: '水塘', party: '弄出响动' }[how];
  pick(g, opt, L);
  party(g, false);
  expectRoom(g, 'shediao.yy.temple_in', L);
  pick(g, '……', L); pick(g, '……', L);
  const say = { shoe: '翡翠小鞋', claw: '五个指洞', snake: '蛇鳞', stroke: '一撇', wangye: '小王爷' };
  for (const c of Object.keys(say)) {
    const should = flag(g, `shediao.c17_clue_${c}`);
    if (has(g, say[c]) !== should) note(`${L}：线索 ${c}（第十七章${should ? '查到了' : '没查'}）选项${should ? '没有出现' : '却出现了'}`);
  }
  for (const c of said) {
    pick(g, say[c], L);
    expectFlag(g, `shediao.c18_said_${c}`, L);
    pick(g, '……', L);
    if (has(g, say[c])) note(`${L}：说过的 ${c} 还在菜单里`);
  }
  pick(g, said.length ? '该说的都说了' : '不出声', L);
  if (said.length) expectFlag(g, 'shediao.c18_backed', L); else expectNo(g, 'shediao.c18_backed', L);
  pick(g, '……', L); pick(g, '……', L); pick(g, '……', L);
  if (stop) { pick(g, '想拦住', L); }
  pick(g, '扶着柯镇恶出庙', L);
  pick(g, '你打算去哪里', L);
  const m0 = g.state.player.money;
  pick(g, money ? '银子' : '送她出城', L);
  if (money && g.state.player.money !== m0 - 300) note(L + '：留银子没扣钱');
  expectFlag(g, money ? 'shediao.c18_mu_money' : 'shediao.c18_mu_go', L);
  pick(g, '……', L);
  expectFlag(g, 'shediao.c18_temple', L);
  pick(g, '醉仙楼', L);
  go(g, ['南', '西', '西', '西南', '西北'], L);
  expectRoom(g, 'shediao.jiaxing.zuixian', L);
  pick(g, '……', L); pick(g, '……', L);
  expectFlag(g, 'shediao.ch18_done', L);
  const cap = g.state.player.skillcap ?? {};
  if (cap['shediao.yangqiang'] !== 80 || cap['shediao.cuijian'] !== 70 || cap['quanzhen.jianfa'] !== 85) note(`${L}：第十八章上限不对 ${JSON.stringify(cap)}`);
  // 章后：南湖、铁枪庙还能去，庙里不再触发
  go(g, ['东南', '东北', '东', '东', '北'], L);
  expectRoom(g, 'shediao.yy.temple_in', L + '（章后进庙）');
  if (g.dialog) note(L + '：章后进庙又触发了剧情');
}

const SK = { 'shediao.nanshan': 70, 'shediao.cuijian': 30, 'shediao.kongming': 50 };

{ // 路线 A
  const L = '路线A';
  const g = newGame({ skills: { ...SK, 'gaibang.xiaoyao': 115, 'gaibang.huntian': 40 } });
  ch17(g, L, { how: 'qiao', defend: true, clues: ['shoe', 'claw', 'snake', 'stroke'], ask: true });
  ch18(g, L, { how: 'qiao', said: ['shoe', 'claw', 'snake', 'stroke', 'wangye'], beatOuyang: true, stop: false, money: true });
}
{ // 路线 B
  const L = '路线B';
  const g = newGame({ skills: { ...SK, 'gaibang.huntian': 90 }, maxhpBoost: 400 });
  ch17(g, L, { how: 'inner', defend: false, clues: [], ask: false });
  if (g.hpMax() < 1600) note(`${L}：测试角色气血只有 ${g.hpMax()}，走不了气血那条门槛`);
  ch18(g, L, { how: 'hp', said: [], beatOuyang: false, stop: true, money: false });
}
{ // 路线 C：组队 + 三场打输重来；只查两条线索，铁枪庙说一条
  const L = '路线C';
  const g = newGame({ skills: SK });
  ch17(g, L, { how: 'party', defend: true, clues: ['stroke', 'snake'], ask: false, loseCrypt: true, loseReef: true });
  ch18(g, L, { how: 'party', said: ['stroke'], beatOuyang: false, stop: false, money: false, loseKang: true });
}
{ // 路线 D：门槛不满足
  const L = '路线D';
  const g = newGame({ skills: SK });
  ex(g, '东', L); pick(g, '上船', L); pick(g, '……', L);
  go(g, ['北', '西', '下', '北'], L); pick(g, '……', L); pick(g, '……', L); pick(g, '迎战', L); win(g, L);
  pick(g, '……', L); pick(g, '什么也不说', L); pick(g, '……', L); pick(g, '……', L);
  go(g, ['南', '上', '东', '东南'], L);
  if (has(g, '踩着桃枝') || has(g, '提一口真气') || has(g, '分头包抄')) note(L + '：功力不够却出现了门槛选项');
  pick(g, '现在还追不上', L); pick(g, '先回去', L);
  ex(g, '西北', L); expectRoom(g, 'shediao.thd.wood', L + '（门槛不锁人）');
  ex(g, '东南', L);
  if (!has(g, '现在还追不上')) note(L + '：再进桃林深处，门槛对话没有再出现');
  // 第十八章的庙门：手动设到烟雨楼之后
  Object.assign(g.state.flags, { 'shediao.ch17_done': true, 'shediao.ch18': true, 'shediao.c18_kang': true, 'shediao.c18_ouyang': true });
  g.endDialog();
  g.enter('shediao.yy.temple');
  if (has(g, '翻上屋顶') || has(g, '水塘') || has(g, '弄出响动')) note(L + '：功力不够却出现了进庙选项');
  pick(g, '现在还进不去', L); pick(g, '先退开', L);
  ex(g, '西', L); expectRoom(g, 'shediao.yy.road', L + '（庙前不锁人）');
}

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 第十七、十八章走通：四条路线，两处门槛三条路和"还不行"，三场必胜战的打输重来，允许输的欧阳锋两种结果，线索有无、决裂与穆念慈的分支，章后往返');
