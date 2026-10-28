// 射雕第十五、十六章走查：node playtest-c15-16.mjs [仓库根目录]
// 照 tools/playtest-xiaoao.mjs 的写法：Node 里直接建 Game，前置标记手动设，exec 发命令；战斗时把敌人气血压到 1。
// 第十四章还没写完时（没有 shediao.jun.dock），从同目录的 stub-ch14.md 补一个替身渡口。

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = process.argv[2] ?? new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const u = (p) => pathToFileURL(join(repo, p)).href;
const { parse, addBlocks, emptyDb } = await import(u('src/content.js'));
const { newState } = await import(u('src/save.js'));
const { Game } = await import(u('src/game.js'));

const root = join(repo, 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];

const problems = [];
const note = (s) => problems.push(s);
let usedStub = false;

function newGame({ skills = {}, hpBoost = 0, items = [] } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  if (!db.room['shediao.jun.dock']) {
    usedStub = true;
    const stub = join(here, 'stub-ch14.md');
    addBlocks(db, parse(readFileSync(stub, 'utf8'), 'stub-ch14.md'), 'stub-ch14.md');
  }
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, { 'base.zhang': 40, 'base.zhaojia': 40, ...skills });
  st.player.loadout = {
    outer: ['base.zhang', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner: null,
    light: null,
  };
  st.player.money = 5000;
  if (hpBoost) st.player.attrs.根骨 += hpBoost;
  for (const it of items) st.player.inventory[it] = 1;
  // 前置：第一到十四章都走完了
  for (let i = 1; i <= 14; i++) { st.flags[`shediao.ch${i}`] = true; st.flags[`shediao.ch${i}_done`] = true; }
  st.flags['shediao.started'] = true;
  st.player.room = 'hengyang.station';
  const g = new Game(db, st);
  g.log = [];
  g.enter('hengyang.station');
  return g;
}

function grab(g) { for (const o of g.out ?? []) g.log.push(o.text); }
function ex(g, cmd, label) {
  const out = g.exec(cmd);
  for (const o of out) { g.log.push(o.text); if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`); }
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
    for (const un of g.state.battle.units) {
      if (un.side === 'e' && un.hp > 0) un.hp = 1;
      if (un.isPlayer) { un.mp = un.maxMp; un.hp = un.maxHp; }
    }
    ex(g, '1', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没打完`);
}
function lose(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const un of g.state.battle.units) { if (un.side === 'p' && un.hp > 0) un.hp = 1; if (un.side === 'e') un.hp = 1e9; } // 敌人不倒：免得 NPC 队友替你打赢
    ex(g, '0', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没输掉`);
}
const flag = (g, f) => !!g.state.flags[f];
const expectFlag = (g, f, label) => { if (!flag(g, f)) note(`${label}：应当设下 ${f}，却没有`); };
const expectNoFlag = (g, f, label) => { if (flag(g, f)) note(`${label}：不应当有 ${f}`); };
const expectRoom = (g, r, label) => { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); };
const expectItem = (g, id, label) => { if (!g.state.player.inventory?.[id]) note(`${label}：应当有物品 ${id}，却没有`); };
const expectText = (g, s, label) => { if (!g.log.some((t) => t.includes(s))) note(`${label}：应当出现文字「${s}」，却没有`); };
const expectNoText = (g, s, label) => { if (g.log.some((t) => t.includes(s))) note(`${label}：不应当出现文字「${s}」`); };
const goalOn = (g, label) => {
  const out = g.exec('目标');
  const txt = out.map((o) => o.text).join('\n');
  if (!/射雕/.test(txt) && !out.some((o) => o.cls !== 'err' && o.text.length > 4)) note(`${label}：当前目标为空`);
};

// ---------------- 第十五章 ----------------

const CLIMB = { tu: '照画上的路走', qiao: '踩着石缝', inner: '提一口真气', party: '结成长索' };

function toRoad(g, label) {
  ex(g, '东', label);
  expectRoom(g, 'shediao.jun.dock', label);
  ex(g, '西', label);
  expectRoom(g, 'shediao.tz.road', label);
}

function ch15(g, label, { how = 'tu', face = true, beatQiu = false, loseShao = false, loseElders = false } = {}) {
  toRoad(g, label);
  expectFlag(g, 'shediao.ch15', label);
  pick(g, face ? '替他圆过去' : '当众揭穿他', label);
  expectFlag(g, face ? 'shediao.c15_qz_face' : 'shediao.c15_qz_shame', label);
  pick(g, '往西走', label);
  ex(g, '西', label);
  expectRoom(g, 'shediao.tz.foot', label);
  pick(g, '动手', label);
  if (loseShao) {
    lose(g, label + '/哨卡（故意打输）');
    expectRoom(g, 'hengyang.station', label + '（打输重来）');
    expectNoFlag(g, 'shediao.ch15', label + '（打输重来，开头要重演）');
    expectNoFlag(g, 'shediao.c15_qz_face', label + '（打输重来）');
    toRoad(g, label + '（重来）');
    expectFlag(g, 'shediao.ch15', label + '（重来）');
    pick(g, face ? '替他圆过去' : '当众揭穿他', label + '（重来）');
    pick(g, '往西走', label);
    ex(g, '西', label);
    pick(g, '动手', label + '（重来）');
  }
  win(g, label + '/哨卡');
  expectFlag(g, 'shediao.c15_foot', label);
  pick(g, '等天黑', label);
  ex(g, '西', label);
  expectRoom(g, 'shediao.tz.hall', label);
  pick(g, '……', label);
  expectText(g, face ? '耗子可真大' : '就是山下那几个小贼', label);
  expectNoText(g, face ? '就是山下那几个小贼' : '耗子可真大', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  pick(g, '往后山跑', label);
  expectFlag(g, 'shediao.c15_hall', label);
  expectRoom(g, 'shediao.tz.cliff', label + '（过场把人带到峰脚）');
  if (!has(g, CLIMB[how])) note(`${label}：攀峰选项「${CLIMB[how]}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  if (has(g, '现在还上不去')) note(`${label}：满足门槛却还有"现在还上不去"`);
  pick(g, CLIMB[how], label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'shediao.c15_up', label);
  expectRoom(g, 'shediao.tz.peak', label);
  pick(g, '进去看看', label);
  expectItem(g, 'shediao.wumu', label);
  pick(g, '……', label);
  pick(g, '迎战', label);
  if (loseElders) {
    lose(g, label + '/长老（故意打输）');
    expectRoom(g, 'hengyang.station', label + '（打输重来）');
    expectItem(g, 'shediao.wumu', label + '（打输重来，武穆遗书留着）');
    toRoad(g, label + '（重来）');
    pick(g, face ? '替他圆过去' : '当众揭穿他', label + '（重来）');
    pick(g, '往西走', label);
    ex(g, '西', label); pick(g, '动手', label); win(g, label + '/哨卡（重来）'); pick(g, '等天黑', label);
    ex(g, '西', label); pick(g, '……', label);
    if (how === 'party') g.party = { members: [{ id: 'friend' }] };
    pick(g, '往后山跑', label);
    pick(g, CLIMB[how], label);
    if (how === 'party') g.party = null;
    pick(g, '进去看看', label); pick(g, '……', label); pick(g, '迎战', label + '（重来）');
    if ((g.state.player.inventory['shediao.wumu'] ?? 0) !== 1) note(`${label}：重来以后武穆遗书多给了一本`);
  }
  win(g, label + '/长老');
  expectFlag(g, 'shediao.c15_peak', label);
  pick(g, '从后坡下山', label);
  expectRoom(g, 'shediao.tz.cliff', label);
  pick(g, '迎战', label);
  if (beatQiu) win(g, label + '/裘千仞（硬要打赢）'); else lose(g, label + '/裘千仞');
  expectText(g, beatQiu ? '逼退了三步' : '烧红的铁棍', label);
  pick(g, '……', label);
  expectText(g, '替你挨了那一掌', label);
  pick(g, '背起黄蓉', label);
  expectFlag(g, 'shediao.c15_qiu', label);
  expectRoom(g, 'shediao.tz.foot', label);
  expectText(g, face ? '往南翻过山坳，有一片黑沼' : '没人追的地方，就是路', label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.ch15_done', label);
  const cap = g.state.player.skillcap ?? {};
  if ((cap['shediao.yangqiang'] ?? 0) < 70) note(`${label}：杨家枪法上限没到 70`);
  if ((cap['shediao.kongming'] ?? 0) < 55) note(`${label}：空明拳上限没到 55`);
  goalOn(g, label + '（第十五章完）');
}

// ---------------- 第十六章 ----------------

const GENG = { qiao: '用巧劲', hp: '硬生生扛住', party: '一边一个' };

function ch16(g, label, { how = 'qiao', yinggu = 'win', self = true, guard = true, loseYuqiao = false } = {}) {
  expectRoom(g, 'shediao.tz.foot', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.yd.edge', label);
  expectFlag(g, 'shediao.ch16', label);
  pick(g, '拦住他们', label);
  win(g, label + '/追兵');
  expectFlag(g, 'shediao.c16_chase', label);
  pick(g, '踩着木桩', label);
  expectRoom(g, 'shediao.yd.hut', label);
  pick(g, '……', label);
  expectItem(g, 'shediao.yinggu_pa', label);
  pick(g, '……', label);
  if (yinggu === 'skip') { pick(g, '不接', label); pick(g, '……', label); }
  else { pick(g, '接她几招', label); if (yinggu === 'win') win(g, label + '/瑛姑'); else lose(g, label + '/瑛姑'); pick(g, '……', label); }
  expectFlag(g, 'shediao.c16_hut', label);
  pick(g, '出门往南', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.yd.falls', label);
  pick(g, '闯过去', label);
  if (loseYuqiao) {
    lose(g, label + '/渔樵（故意打输）');
    expectRoom(g, 'hengyang.station', label + '（打输重来）');
    expectNoFlag(g, 'shediao.ch16', label + '（打输重来）');
    ex(g, '东', label); ex(g, '西', label); ex(g, '西', label);
    expectRoom(g, 'shediao.tz.foot', label + '（重来，走回铁掌峰下）');
    ex(g, '南', label);
    pick(g, '拦住他们', label); win(g, label + '/追兵（重来）'); pick(g, '踩着木桩', label);
    pick(g, '……', label); pick(g, '……', label); pick(g, '不接', label); pick(g, '……', label); pick(g, '出门往南', label);
    if ((g.state.player.inventory['shediao.yinggu_pa'] ?? 0) !== 1) note(`${label}：重来以后锦帕多给了一块`);
    ex(g, '南', label); pick(g, '闯过去', label + '（重来）');
  }
  win(g, label + '/渔樵');
  expectFlag(g, 'shediao.c16_yu', label);
  pick(g, '往山腰上去', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '西', label);
  expectRoom(g, 'shediao.yd.field', label);
  if (!has(g, GENG[how])) note(`${label}：托石选项「${GENG[how]}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, GENG[how], label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'shediao.c16_geng', label);
  pick(g, '往石梁去', label);
  ex(g, '南', label);
  expectRoom(g, 'shediao.yd.bridge', label);
  if (self) { pick(g, '你先试着', label); pick(g, '听黄蓉的', label); } else pick(g, '让黄蓉来对', label);
  expectFlag(g, 'shediao.c16_du', label);
  pick(g, '过石梁', label);
  expectRoom(g, 'shediao.yd.temple', label);
  pick(g, '锦帕', label);
  pick(g, '求大师救她', label);
  expectFlag(g, 'shediao.c16_heal', label);
  pick(g, '……', label); pick(g, '……', label); pick(g, '……', label);
  pick(g, guard ? '挡在一灯大师身前' : '不动', label);
  expectFlag(g, guard ? 'shediao.c16_guard' : 'shediao.c16_still', label);
  pick(g, '……', label);
  pick(g, '……', label);
  expectFlag(g, 'shediao.ch16_done', label);
  if (!g.state.player.skills['shediao.cuijian']) note(`${label}：没学会摧坚神爪`);
  if ((g.state.player.skillcap?.['shediao.jiuyin'] ?? 0) < 60) note(`${label}：九阴真经上限没到 60`);
  if (g.dialog) note(`${label}：章末还挂着对话（${g.dialog.map((c) => c.text).join(' / ')}）`);
  goalOn(g, label + '（第十六章完）');
}

// 路线 1：画、替裘千丈圆场、输给裘千仞；巧托石、自己先对对子、打赢瑛姑、挡在一灯身前；学过一阳指
{
  const label = '路线1';
  const g = newGame({ skills: { 'gaibang.xiaoyao': 100, 'tianlong.yiyangzhi': 30 }, items: ['shediao.zhongzhi_tu'] });
  ch15(g, label, { how: 'tu', face: true, beatQiu: false });
  ch16(g, label, { how: 'qiao', yinggu: 'win', self: true, guard: true });
  expectText(g, '段家的一阳指', label);
  expectText(g, '天龙寺的入门三品', label);
}

// 路线 2：没有画，巧攀峰、揭穿裘千丈、打赢裘千仞、先输一场哨卡；硬扛托石、不接瑛姑、黄蓉对对子、不动
{
  const label = '路线2';
  const g = newGame({ skills: { 'gaibang.xiaoyao': 100 }, hpBoost: 4000 });
  if (g.hpMax() < 1400) note(`${label}：测试设置的气血上限 ${g.hpMax()} 不够 1400`);
  ch15(g, label, { how: 'qiao', face: false, beatQiu: true, loseShao: true });
  ch16(g, label, { how: 'hp', yinggu: 'skip', self: false, guard: false });
  expectNoText(g, '段家的一阳指', label);
}

// 路线 3：内功攀峰、峰顶长老打输重来；组队托石、输给瑛姑、渔樵打输重来
{
  const label = '路线3';
  const g = newGame({ skills: { 'base.tuna': 80 } });
  ch15(g, label, { how: 'inner', face: true, loseElders: true });
  ch16(g, label, { how: 'party', yinggu: 'lose', loseYuqiao: true });
}

// 路线 4：组队攀峰
{
  const label = '路线4';
  const g = newGame({ skills: {} });
  ch15(g, label, { how: 'party', face: false });
}

// 路线 5：门槛一条都不满足，要有退路，不锁人
{
  const label = '路线5';
  const g = newGame({ skills: {} });
  toRoad(g, label);
  pick(g, '当众揭穿他', label); pick(g, '往西走', label);
  ex(g, '西', label); pick(g, '动手', label); win(g, label + '/哨卡'); pick(g, '等天黑', label);
  ex(g, '西', label); pick(g, '……', label); pick(g, '往后山跑', label);
  if (has(g, CLIMB.tu) || has(g, CLIMB.qiao) || has(g, CLIMB.inner) || has(g, CLIMB.party)) note(`${label}：功力不够，却出现了攀峰选项`);
  pick(g, '现在还上不去', label);
  pick(g, '先退下去', label);
  ex(g, '东北', label);
  expectRoom(g, 'shediao.tz.foot', label + '（门槛不锁人）');
  ex(g, '西南', label);
  if (!has(g, '现在还上不去')) note(`${label}：回到峰脚，攀峰的对话没有再出来`);
  // 学会了巧类外功再来
  g.endDialog();
  g.state.player.skills['gaibang.xiaoyao'] = 95;
  ex(g, '东北', label); ex(g, '西南', label);
  pick(g, CLIMB.qiao, label);
  expectFlag(g, 'shediao.c15_up', label);
  // 第十六章托石的退路：直接设前置标记到稻田
  const g2 = newGame({ skills: {} });
  for (const f of ['ch15', 'c15_foot', 'c15_hall', 'c15_up', 'c15_peak', 'c15_qiu', 'ch15_done', 'ch16', 'c16_chase', 'c16_hut', 'c16_yu']) g2.state.flags['shediao.' + f] = true;
  g2.enter('shediao.yd.field');
  if (has(g2, GENG.qiao) || has(g2, GENG.hp) || has(g2, GENG.party)) note(`${label}：功力不够，却出现了托石选项`);
  pick(g2, '现在还托不住', label);
  pick(g2, '先退下去', label);
  ex(g2, '东', label);
  expectRoom(g2, 'shediao.yd.falls', label + '（托石不锁人）');
}

if (usedStub) console.log('（注意：仓库里还没有 shediao.jun.dock，用了替身渡口 stub-ch14.md）');
if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 第十五、十六章走通：五条路线；攀峰四条路＋退路，托石三条路＋退路；裘千丈两种对法；裘千仞、瑛姑的输赢与不打；两次打输重来；一灯前挡与不挡；一阳指台词');
