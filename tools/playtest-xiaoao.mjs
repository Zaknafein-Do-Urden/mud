// 笑傲江湖主线的脚本通关测试：node tools/playtest-xiaoao.mjs
// 按 WRITING.md §9 第 4 条：把每一章从头走到尾，每个分支、打输重来都走一遍。
// 做法：在 Node 里直接建 Game（不碰 DOM），用 exec 发命令；战斗时把敌人气血压到 1 快速通过。
// 有问题时打印 ✗ 并以退出码 1 结束，可以接进 CI。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb } from '../src/content.js';
import { newState } from '../src/save.js';
import { Game } from '../src/game.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const files = [...index.world, ...Object.values(index.storylines).flatMap((s) => [...(s.hook ?? []), ...(s.files ?? [])])];

const problems = [];
const step = (s) => { if (process.env.PLAYTEST_VERBOSE) console.log('  · ' + s); };
const note = (s) => problems.push(s);

function newGame() {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  const st = newState(db.meta.game.props.start);
  st.player.loadout = { outer: ['base.quan'], inner: null, light: null };
  st.player.money = 5000;
  const g = new Game(db, st);
  g.enter(st.player.room);
  return g;
}

function ex(g, cmd, label) {
  const out = g.exec(cmd);
  for (const o of out) if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`);
  return out;
}

function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话`); return false; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return false; }
  ex(g, String(i + 1), label);
  return true;
}

const has = (g, substr) => !!g.dialog?.some((c) => c.text.includes(substr));

/** 打赢当前这一场：把敌人气血压到 1，自己内力管够 */
function win(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) {
      if (u.side === 'e' && u.hp > 0) u.hp = 1;
      if (u.isPlayer) { u.mp = u.maxMp; u.hp = u.maxHp; }
    }
    ex(g, '1', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没打完，有点不对`);
}

/** 输掉当前这一场：自己气血压到 1，一路调息挨打 */
function lose(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    for (const u of g.state.battle.units) if (u.side === 'p' && u.hp > 0) u.hp = 1;
    ex(g, '0', label);
  }
  if (g.state.battle) note(`${label}：六十回合还没输掉，有点不对`);
}

const flag = (g, f) => !!g.state.flags[f];
function expectFlag(g, f, label) { if (!flag(g, f)) note(`${label}：应当设下标记 ${f}，却没有`); }
function expectRoom(g, r, label) { if (g.state.player.room !== r) note(`${label}：人应当在 ${r}，却在 ${g.state.player.room}`); }
function expectSkill(g, id, label) { if (!g.state.player.skills[id]) note(`${label}：应当学会 ${id}，却没有`); }
function expectItem(g, id, label) { if (!g.state.player.inventory?.[id]) note(`${label}：应当得到物品 ${id}，却没有`); }

// ---------------- 开端：临安车马行 → 福州 ----------------

function hook(g, label) {
  step(label + ' 开端');
  g.enter('linan.station');
  ex(g, '对话 陈七', label);
  pick(g, '福威镖局是什么来头', label);
  ex(g, '对话 陈七', label);
  pick(g, '折了三趟是什么意思', label);
  pick(g, '跟他的车去福州', label);
  expectFlag(g, 'xiaoao.started', label);
  g.enter('fuzhou.station'); // 坐车八日，这里直接到站
  expectFlag(g, 'xiaoao.ch1', label);
  pick(g, '跟他去荔香楼', label);
}

// ---------------- 第一章 ----------------

function ch1(g, label, { ask = false, protect = false, spare = true, block = false, baier = true } = {}) {
  step(label + ' 第一章');
  ex(g, '北', label);          // 车马行 → 鼓楼前
  ex(g, '东北', label);        // 鼓楼前 → 荔香楼
  expectRoom(g, 'xiaoao.fz.jiulou', label);
  if (ask) pick(g, '哪一路', label);
  pick(g, protect ? '拉到身后' : '站到林平之身边', label);
  pick(g, '动手', label);
  win(g, label + '/青城弟子');
  expectFlag(g, 'xiaoao.c1_fight', label);
  pick(g, spare ? '出声劝他' : '留着是祸害', label);
  expectFlag(g, spare ? 'xiaoao.c1_spare' : 'xiaoao.c1_kill', label);
  pick(g, '向阳巷', label);
  // 镖局
  ex(g, '西南', label);        // 荔香楼 → 鼓楼前
  ex(g, '西北', label);        // 鼓楼前 → 向阳巷口
  expectRoom(g, 'xiaoao.fz.lane', label);
  ex(g, '西', label);
  expectRoom(g, 'xiaoao.fz.biaoju', label);
  pick(g, '听他怎么说', label);
  pick(g, '怎么办', label);
  expectFlag(g, 'xiaoao.c1_meet', label);
  if (baier) {               // 可选支线：老镖师白二
    ex(g, '对话 白二', label);
    pick(g, '三趟镖', label);
    expectFlag(g, 'xiaoao.c1_baier', label);
    pick(g, '多谢老丈', label);
    ex(g, '对话 白二', label); // 听过之后换一个话题
    if (!has(g, '这只手')) note(`${label}：白二第二次对话没有换话题`);
    pick(g, '这只手', label);
    pick(g, '记下了', label);
  }
  // 夜里的后院
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.fz.yard', label);
  pick(g, block ? '堵住墙根' : '一起扑上去', label);
  pick(g, '动手', label);
  win(g, label + '/蒙面人');
  expectFlag(g, 'xiaoao.c1_night', label);
  expectItem(g, 'xiaoao.item.duanjian', label);
  pick(g, '给林震南看', label);
  pick(g, '收下了', label);
  expectFlag(g, 'xiaoao.ch1_done', label);
  expectSkill(g, 'xiaoao.fantian', label);
  // 章节结束后还回得去（WRITING.md §2 往返）
  ex(g, '南', label);
  ex(g, '东', label);
  ex(g, '东南', label);
  expectRoom(g, 'fuzhou.center', label + '（章节之后能回城）');
}

// ---------------- 路线 1：问清来路 → 站到身边 → 劝住 → 正面扑上去 ----------------
{
  const label = '路线1';
  const g = newGame();
  hook(g, label);
  ch1(g, label, { ask: true, spare: true, block: false, baier: true });
}

// ---------------- 路线 2：先护姑娘 → 不劝 → 先抽跳板 → 不走支线 ----------------
{
  const label = '路线2';
  const g = newGame();
  hook(g, label);
  ch1(g, label, { protect: true, spare: false, block: true, baier: false });
  if (!flag(g, 'xiaoao.c1_protect')) note(`${label}：护住卖酒姑娘的标记没有设上`);
  if (!flag(g, 'xiaoao.c1_block')) note(`${label}：抽掉跳板的标记没有设上`);
}

// ---------------- 路线 3：第一场故意打输，回检查点重来 ----------------
{
  const label = '路线3';
  const g = newGame();
  hook(g, label);
  ex(g, '北', label);
  ex(g, '东北', label);
  pick(g, '站到林平之身边', label);
  pick(g, '动手', label);
  lose(g, label + '/青城弟子（故意打输）');
  // 按 STORY.md §8：打输回到章节 start（福州车马行），本章剧情标记回滚到检查点；
  // ch1 写在 chapter: 前面，所以它保留，不必回头再看一遍到站的开场（D-213）
  expectRoom(g, 'fuzhou.station', label + '（打输重来）');
  if (flag(g, 'xiaoao.c1_fight')) note(`${label}：打输之后 xiaoao.c1_fight 没有回滚`);
  if (!flag(g, 'xiaoao.ch1')) note(`${label}：打输之后连 xiaoao.ch1 都回滚了，会要玩家回头重看开场`);
  // 走回荔香楼重演一次，这回打赢
  ex(g, '北', label + '（重来）');
  ex(g, '东北', label + '（重来）');
  pick(g, '站到林平之身边', label + '（重来）');
  pick(g, '动手', label + '（重来）');
  win(g, label + '/青城弟子（重来）');
  pick(g, '出声劝他', label + '（重来）');
  pick(g, '向阳巷', label + '（重来）');
  expectFlag(g, 'xiaoao.c1_fight', label + '（重来）');
}

// ---------------- 结果 ----------------

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 笑傲江湖第一章、三条路线全部走通（两处分支、可选支线、NPC 队友、打输重来）');
