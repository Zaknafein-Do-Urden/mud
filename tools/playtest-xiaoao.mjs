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

function newGame({ skills = {}, maxhpBoost = 0 } = {}) {
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
  if (maxhpBoost) st.player.attrs.根骨 += maxhpBoost; // 抬高气血上限，用来走"硬闯"那条门槛
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

// ---------------- 第二章 ----------------

function ch2(g, label, { how = 'qiao', ask = true, beatYu = false, side = false } = {}) {
  step(label + ' 第二章');
  g.enter('fuzhou.center');
  expectFlag(g, 'xiaoao.ch2', label);
  pick(g, '这就去向阳巷', label);
  // 门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] }; // 选项在开对话那一刻就过滤好，得先组队
  ex(g, '西北', label);
  expectRoom(g, 'xiaoao.fz.lane', label);
  const opt = { qiao: '染坊的屋脊', hp: '撞开顶死的角门', party: '和同伴分头' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '往后院去', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c2_in', label);
  // 后院
  ex(g, '西', label);          // 向阳巷口 → 前厅
  ex(g, '北', label);          // 前厅 → 后院
  expectRoom(g, 'xiaoao.fz.yard', label);
  pick(g, ask ? '先问他们在找什么' : '直接动手', label);
  pick(g, '动手', label);
  win(g, label + '/后院三人');
  expectFlag(g, 'xiaoao.c2_yard', label);
  pick(g, '往前厅去', label);
  // 前厅：必败战
  ex(g, '南', label);
  pick(g, '冲进去', label);
  pick(g, '顶上去', label);
  if (beatYu) win(g, label + '/余沧海（硬要打赢）'); else lose(g, label + '/余沧海');
  if (beatYu && !flag(g, 'xiaoao.beat_yu')) note(`${label}：打赢余沧海没有记下标记`);
  pick(g, '扶起林平之', label);
  expectFlag(g, 'xiaoao.c2_flee', label);
  expectItem(g, 'xiaoao.item.tie', label);
  pick(g, '北门', label);
  // 出城、芦苇荡、破祠堂
  ex(g, '东', label);          // 前厅 → 向阳巷口
  ex(g, '东南', label);        // → 鼓楼前
  ex(g, '北', label);          // → 府衙
  ex(g, '北', label);          // → 北门渡口
  expectRoom(g, 'xiaoao.fz.ferry', label);
  ex(g, '西', label);
  expectRoom(g, 'xiaoao.fz.reed', label);
  expectFlag(g, 'xiaoao.c2_chase', label);
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.fz.shrine', label);
  pick(g, side ? '绕到侧面' : '自己迎上去', label);
  pick(g, '动手', label);
  win(g, label + '/于人豪');
  pick(g, '打给他看', label);
  expectFlag(g, 'xiaoao.ch2_done', label);
  if ((g.state.player.skillcap?.['xiaoao.fantian'] ?? 0) < 25) note(`${label}：翻天掌的上限没有提到 25`);
}

// ---------------- 第三章 ----------------

function ch3(g, label, { how = 'qiao', meet = 'front', qin = 'out', ask = 'plan' } = {}) {
  step(label + ' 第三章');
  g.enter('hengyang.station');       // 坐车十日，这里直接到站
  expectFlag(g, 'xiaoao.ch3', label);
  pick(g, '先进城看看', label);
  // 回雁楼
  ex(g, '北', label);
  ex(g, '东北', label);
  expectRoom(g, 'xiaoao.hy.louyan', label);
  pick(g, { front: '挡在林平之前面', hide: '支下楼', hu: '令狐冲怎么说' }[meet], label);
  pick(g, '动手', label);
  win(g, label + '/洪人雄');
  expectFlag(g, 'xiaoao.c3_fight', label);
  pick(g, '喝完这一碗', label);
  // 刘府
  ex(g, '西南', label);
  ex(g, '西北', label);
  expectRoom(g, 'xiaoao.hy.liufu', label);
  pick(g, ask === 'plan' ? '明日之后有什么打算' : '为什么要金盆洗手', label);
  pick(g, '听他说下去', label);
  expectFlag(g, 'xiaoao.c3_liu', label);
  if (qin) {                          // 可选支线：后园听琴
    ex(g, '北', label);
    expectRoom(g, 'xiaoao.hy.garden', label);
    pick(g, qin === 'out' ? '悄悄退出去' : '咳嗽一声', label);
    pick(g, '回前厅去', label);
    expectFlag(g, 'xiaoao.c3_qin', label);
    ex(g, '南', label);
  }
  // 盯梢的人：出府回到街口才触发（挂在街口，免得把递帖的选项顶掉）
  ex(g, '东南', label);               // 刘府 → 街口
  expectFlag(g, 'xiaoao.c3_tail', label);
  // 江岸、废纸仓
  ex(g, '北', label);                 // → 府衙
  ex(g, '北', label);                 // → 江岸
  expectRoom(g, 'xiaoao.hy.river', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '西', label);
  expectRoom(g, 'xiaoao.hy.granary', label);
  const opt = { qiao: '踩着纸垛', hp: '撞开正门', party: '和同伴分头' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '看看他们在做什么', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c3_in', label);
  pick(g, '跳下去', label);
  pick(g, '动手', label);
  win(g, label + '/狄修');
  expectFlag(g, 'xiaoao.c3_won', label);
  expectItem(g, 'xiaoao.item.shouling', label);
  pick(g, '回城去', label);
  // 回街口收尾
  ex(g, '东', label);
  ex(g, '南', label);
  ex(g, '南', label);
  expectRoom(g, 'hengyang.center', label);
  expectFlag(g, 'xiaoao.ch3_done', label);
  if ((g.state.player.skillcap?.['xiaoao.fantian'] ?? 0) < 50) note(`${label}：翻天掌的上限没有提到 50`);
}

// ---------------- 第四章 ----------------

function ch4(g, label, { how = 'qiao', expose = true, grass = false, beatFei = false } = {}) {
  step(label + ' 第四章');
  g.enter('hengyang.center');
  ex(g, '西北', label);               // 街口 → 刘府大厅
  expectRoom(g, 'xiaoao.hy.liufu', label);
  expectFlag(g, 'xiaoao.ch4', label);
  if (expose) {
    if (!has(g, '摊开那张调度手令')) note(`${label}：身上有手令，堂上却没有"摊开"这条路`);
    pick(g, '摊开那张调度手令', label);
  } else {
    pick(g, '先不出声', label);
  }
  pick(g, '刘正风怎么答', label);
  pick(g, '冲上去', label);
  pick(g, '接下来', label);
  win(g, label + '/大厅三剑');
  expectFlag(g, 'xiaoao.c4_hall', label);
  // 门槛三选一（同一个房间里接着演，所以选项直接连下去）；选项在开对话那一刻就过滤好，得先组队
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  pick(g, '带他走', label);
  const opt = { qiao: '横梁上走', hp: '撞开侧门', party: '和同伴分头' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, how === 'qiao' ? '翻出去' : how === 'hp' ? '跑出去' : '走', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c4_out', label);
  expectRoom(g, 'xiaoao.hy.alley', label + '（过场把人带到后墙窄巷）');
  // 窄巷：送走阿吉
  expectFlag(g, 'xiaoao.c4_alley', label);
  expectItem(g, 'xiaoao.item.juan', label);
  pick(g, '追出城去', label);
  // 山道
  ex(g, '东', label);
  ex(g, '西', label);
  expectRoom(g, 'xiaoao.hy.mountain', label);
  pick(g, grass ? '退到茅草深处' : '先动手', label);
  pick(g, '动手', label);
  win(g, label + '/钟镇');
  expectFlag(g, 'xiaoao.c4_chase', label);
  pick(g, '往北上坡', label);
  // 古松坡：必败战
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.hy.slope', label);
  pick(g, '挡在他们前面', label);
  pick(g, '顶住', label);
  if (beatFei) win(g, label + '/费彬（硬要打赢）'); else lose(g, label + '/费彬');
  if (beatFei && !flag(g, 'xiaoao.beat_fei')) note(`${label}：撑住费彬没有记下标记`);
  pick(g, '看着他们', label);
  pick(g, '走过去', label);
  expectFlag(g, 'xiaoao.ch4_done', label);
  expectSkill(g, 'xiaoao.hengshan', label);
  // 章节结束后还回得去
  ex(g, '南', label);
  ex(g, '东', label);
  expectRoom(g, 'hengyang.center', label + '（章节之后能回城）');
}

// ---------------- 第五章 ----------------

function ch5(g, label, { how = 'qiao', meet = 'drink', ask = true } = {}) {
  step(label + ' 第五章');
  g.enter('changan.station');        // 衡阳一路坐车到长安
  expectFlag(g, 'xiaoao.ch5', label);
  pick(g, '往东南的野店去', label);
  ex(g, '东南', label);
  expectRoom(g, 'xiaoao.hs.dian', label);
  if (ask) pick(g, '哪一门的', label);
  if (meet === 'drink') {
    pick(g, '陪他喝', label);
    pick(g, '两个人一起上', label);
    win(g, label + '/醉后的田伯光');
  } else {
    pick(g, '直接拦下他', label);
    pick(g, '迎上去', label);
    if (meet === 'beat') win(g, label + '/田伯光（硬要打赢）'); else lose(g, label + '/田伯光');
  }
  if (meet === 'beat' && !flag(g, 'xiaoao.beat_tian')) note(`${label}：逼退田伯光没有记下标记`);
  pick(g, '扶那小师父起来', label);
  expectFlag(g, 'xiaoao.c5_save', label);
  // 千尺幢：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '东', label);
  expectRoom(g, 'huashan.gate', label);
  const opt = { qiao: '踩着石窝', hp: '攀铁索', party: '和同伴一前一后' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '上去', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c5_up', label);
  expectRoom(g, 'xiaoao.hs.rock', label + '（过场把人带上崖顶）');
  // 玉女峰
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.hs.yunu', label);
  expectFlag(g, 'xiaoao.c5_yue', label);
  pick(g, '道明来意', label);
  pick(g, '接招', label);
  win(g, label + '/劳德诺');
  pick(g, '道谢', label);
  expectFlag(g, 'xiaoao.ch5_done', label);
  expectSkill(g, 'xiaoao.yangxin', label);
  // 章节结束后还下得了山
  ex(g, '南', label);
  ex(g, '西南', label);
  expectRoom(g, 'huashan.gate', label + '（章节之后能下山）');
}

// ---------------- 第六章 ----------------

function ch6(g, label, { how = 'qiao', ambush = true, askWall = true, beatFeng = false } = {}) {
  step(label + ' 第六章');
  g.enter('xiaoao.hs.yunu');
  expectFlag(g, 'xiaoao.ch6', label);
  ex(g, '西', label);
  expectRoom(g, 'xiaoao.hs.cliff2', label);
  pick(g, '一起进洞看看', label);
  expectFlag(g, 'xiaoao.c6_meet', label);
  // 后洞入口：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '西', label);
  expectRoom(g, 'xiaoao.hs.cave', label);
  const opt = { qiao: '侧身卸肩', hp: '把那块大石搬出来', party: '一里一外' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '往里走', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c6_hole', label);
  expectRoom(g, 'xiaoao.hs.hole', label + '（过场把人带进后洞）');
  // 石壁
  if (askWall) pick(g, '这些是谁刻的', label);
  pick(g, '衡山那一片', label);
  if ((g.state.player.skillcap?.['xiaoao.hengshan'] ?? 0) < 70) note(`${label}：衡山剑法上限没有提到 70`);
  pick(g, '再看看别处', label);
  if ((g.state.player.skillcap?.['xiaoao.fantian'] ?? 0) < 65) note(`${label}：翻天掌上限没有提到 65`);
  pick(g, '过去看', label);
  pick(g, ambush ? '退到石柱后面' : '直接迎出去', label);
  pick(g, how === 'x' ? '动手' : (ambush ? '从背后堵住缝口' : '动手'), label);
  win(g, label + '/嵩山探子');
  expectFlag(g, 'xiaoao.c6_scout', label);
  // 风清扬
  pick(g, '抬头', label);
  if (askWall) pick(g, '满壁的剑招是谁刻的', label);
  pick(g, '请他指点', label);
  pick(g, '出手', label);
  if (beatFeng) win(g, label + '/风清扬（硬要打赢）'); else lose(g, label + '/风清扬');
  if (beatFeng && !flag(g, 'xiaoao.beat_feng')) note(`${label}：接住风清扬三招没有记下标记`);
  pick(g, '听他说下去', label);
  if ((g.state.player.skillcap?.['xiaoao.yangxin'] ?? 0) < 80) note(`${label}：养心诀上限没有提到 80`);
  pick(g, '为什么', label);
  expectFlag(g, 'xiaoao.ch6_done', label);
  // 章节结束后还出得去
  ex(g, '东南', label);
  ex(g, '东', label);
  expectRoom(g, 'xiaoao.hs.cliff2', label + '（章节之后能回崖上）');
}

// ---------------- 第七章 ----------------

function ch7(g, label, { how = 'qin', askBox = true } = {}) {
  step(label + ' 第七章');
  g.enter('linan.station');          // 华山一路坐车南下
  expectFlag(g, 'xiaoao.ch7', label);
  g.enter('linan.lake');
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '西', label);
  expectRoom(g, 'xiaoao.mz.gate', label);
  const opt = { qin: '拿出那块绢谱', shu: '以剑代笔', jiu: '拼酒', party: '两个人对弈' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '进庄', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c7_in', label);
  expectRoom(g, 'xiaoao.mz.hall', label + '（过场把人带进四友堂）');
  // 四友堂：丹青生
  pick(g, '接下来', label);
  pick(g, '走两趟', label);
  win(g, label + '/丹青生');
  expectFlag(g, 'xiaoao.c7_fight', label);
  // 夜里的竹林
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.mz.bamboo', label);
  expectFlag(g, 'xiaoao.c7_box', label);
  pick(g, askBox ? '问他石板底下' : '什么也不问', label);
  pick(g, '回去', label);
  // 庄外：陆柏
  pick(g, '不交，也不跟他走', label);
  win(g, label + '/陆柏');
  expectFlag(g, 'xiaoao.c7_lubai', label);
  pick(g, '进去', label);
  expectFlag(g, 'xiaoao.ch7_done', label);
  expectSkill(g, 'xiaoao.qixian', label);
  if ((g.state.player.skillcap?.['xiaoao.hengshan'] ?? 0) < 90) note(`${label}：衡山剑法上限没有提到 90`);
}

// ---------------- 第八章 ----------------

function ch8(g, label, { how = 'qiao', free = true, askRisk = true, beatRen = false } = {}) {
  step(label + ' 第八章');
  g.enter('linan.lake');
  expectFlag(g, 'xiaoao.ch8', label);
  pick(g, '跟他回梅庄去', label);
  // 竹林
  ex(g, '西', label);
  ex(g, '西', label);
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.mz.bamboo', label);
  if (askRisk) pick(g, '底下那个人出来了会怎样', label);
  pick(g, '帮他撬开石板', label);
  expectFlag(g, 'xiaoao.c8_open', label);
  // 甬道：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.mz.cellar', label);
  const opt = { qiao: '从槽缝里', hp: '整根拔出来', party: '一左一右' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '推开铁门', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c8_in', label);
  // 地牢
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.mz.jail', label);
  pick(g, '报上名字', label);
  pick(g, '接住他', label);
  win(g, label + '/黑白子');
  expectFlag(g, 'xiaoao.c8_fight', label);
  pick(g, '不怕', label);
  pick(g, '撑住', label);
  if (beatRen) win(g, label + '/任我行（硬要挣脱）'); else lose(g, label + '/任我行');
  if (beatRen && !flag(g, 'xiaoao.beat_ren')) note(`${label}：挣脱任我行没有记下标记`);
  pick(g, '听他说下去', label);
  // 放还是不放
  if (free) {
    pick(g, '开锁', label);
    expectFlag(g, 'xiaoao.c8_free', label);
    pick(g, '追上去看', label);
    expectSkill(g, 'xiaoao.xixing', label);
  } else {
    pick(g, '不开', label);
    expectFlag(g, 'xiaoao.c8_keep', label);
    pick(g, '上去', label);
    if ((g.state.player.skillcap?.['xiaoao.yangxin'] ?? 0) < 100) note(`${label}：不开锁那条路，养心诀上限没有提到 100`);
  }
  expectFlag(g, 'xiaoao.ch8_done', label);
}

// ---------------- 路线 1：问清来路 → 站到身边 → 劝住 → 正面扑上去；第二章走"巧"那条门槛 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { 'base.zhang': 80 } }); // 小巧掌 80 级：二~八章的巧类门槛都够
  hook(g, label);
  ch1(g, label, { ask: true, spare: true, block: false, baier: true });
  ch2(g, label, { how: 'qiao', ask: true, beatYu: false, side: false });
  ch3(g, label, { how: 'qiao', meet: 'front', qin: 'out', ask: 'plan' });
  ch4(g, label, { how: 'qiao', expose: true, grass: false, beatFei: false });
  ch5(g, label, { how: 'qiao', meet: 'drink', ask: true });
  ch6(g, label, { how: 'qiao', ambush: true, askWall: true, beatFeng: false });
  ch7(g, label, { how: 'qin', askBox: true });   // 绢谱叩门
  ch8(g, label, { how: 'qiao', free: true, askRisk: true, beatRen: false });  // 开锁放人
}

// ---------------- 路线 2：先护姑娘 → 不劝 → 先抽跳板 → 不走支线；第二章硬闯 + 打赢余沧海 ----------------
{
  const label = '路线2';
  const g = newGame({ maxhpBoost: 520 }); // 气血上限够：一路硬闯的门槛，直到地牢的铁闩
  hook(g, label);
  ch1(g, label, { protect: true, spare: false, block: true, baier: false });
  if (!flag(g, 'xiaoao.c1_protect')) note(`${label}：护住卖酒姑娘的标记没有设上`);
  if (!flag(g, 'xiaoao.c1_block')) note(`${label}：抽掉跳板的标记没有设上`);
  ch2(g, label, { how: 'hp', ask: false, beatYu: true, side: true });
  ch3(g, label, { how: 'hp', meet: 'hide', qin: 'in', ask: 'why' });
  ch4(g, label, { how: 'hp', expose: false, grass: true, beatFei: true });
  ch5(g, label, { how: 'hp', meet: 'beat', ask: false });
  ch6(g, label, { how: 'hp', ambush: false, askWall: false, beatFeng: true });
  ch7(g, label, { how: 'jiu', askBox: false });  // 拼酒进门
  ch8(g, label, { how: 'hp', free: false, askRisk: false, beatRen: true });   // 不开锁
}

// ---------------- 路线 4：第二章组队门槛 ----------------
{
  const label = '路线4';
  const g = newGame();
  hook(g, label);
  ch1(g, label, { spare: true, baier: false });
  ch2(g, label, { how: 'party' });
  ch3(g, label, { how: 'party', meet: 'hu', qin: null });
  ch4(g, label, { how: 'party', expose: true, grass: true, beatFei: false });
  ch5(g, label, { how: 'party', meet: 'front', ask: false });
  ch6(g, label, { how: 'party', ambush: true, askWall: false, beatFeng: false });
  ch7(g, label, { how: 'party', askBox: true }); // 两人对弈进门
  ch8(g, label, { how: 'party', free: true, askRisk: true, beatRen: false });
}

// ---------------- 路线 5：第二章门槛一条都不满足时，要有退路 ----------------
{
  const label = '路线5';
  const g = newGame();
  hook(g, label);
  ch1(g, label, { spare: true, baier: false });
  g.enter('fuzhou.center');
  pick(g, '这就去向阳巷', label);
  ex(g, '西北', label);
  if (has(g, '染坊的屋脊') || has(g, '撞开顶死的角门')) note(`${label}：功力不够，却出现了门槛选项`);
  if (!has(g, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"这条路`);
  pick(g, '现在还进不去', label);
  pick(g, '先退回去练练', label);
  ex(g, '东南', label); // 门槛对话不锁定，可以离开去练功
  expectRoom(g, 'fuzhou.center', label + '（门槛不锁人）');
  if (flag(g, 'xiaoao.c2_in')) note(`${label}：没过门槛却进了镖局`);
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
console.log('✓ 笑傲江湖第一~八章，五条路线全部走通（七处门槛、放人与不放人两种收场、各处分支、NPC 队友、五场必败战的输赢、打输重来）');
