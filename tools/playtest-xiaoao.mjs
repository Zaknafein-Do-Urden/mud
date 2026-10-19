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
  expectRoom(g, 'xiaoao.fz.jiulou', label + '（陈七领你进城）');
}

// ---------------- 第一章 ----------------

function ch1(g, label, { ask = false, protect = false, spare = true, block = false, baier = true } = {}) {
  step(label + ' 第一章');
  expectRoom(g, 'xiaoao.fz.jiulou', label);   // 开场的过场已经把人带到荔香楼
  if (ask) pick(g, '哪一路', label);
  pick(g, protect ? '拉到身后' : '站到林平之身边', label);
  pick(g, '动手', label);
  win(g, label + '/青城弟子');
  expectFlag(g, 'xiaoao.c1_fight', label);
  pick(g, spare ? '出声劝他' : '留着是祸害', label);
  expectFlag(g, spare ? 'xiaoao.c1_spare' : 'xiaoao.c1_kill', label);
  pick(g, '向阳巷', label);
  // 镖局
  ex(g, '西北', label);        // 荔香楼 → 鼓楼前
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
  expectRoom(g, 'xiaoao.fz.yard', label + '（过场把人带进后院）');
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
  ex(g, '东南', label);
  expectRoom(g, 'xiaoao.hy.louyan', label);
  pick(g, { front: '挡在林平之前面', hide: '支下楼', hu: '令狐冲怎么说' }[meet], label);
  pick(g, '动手', label);
  win(g, label + '/洪人雄');
  expectFlag(g, 'xiaoao.c3_fight', label);
  pick(g, '喝完这一碗', label);
  // 刘府
  ex(g, '西北', label);
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
  ex(g, '东', label);          // 刘府后墙窄巷 → 街口
  ex(g, '西南', label);        // 街口 → 衡山南麓山道（西边是客栈，不能占）
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
  ex(g, '东北', label);
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
  ex(g, '西北', label);        // 断桥 → 孤山梅庄（正西是钱塘门，不能占）
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
  ex(g, '西北', label);       // 断桥 → 梅庄门外
  ex(g, '西', label);         // → 四友堂
  ex(g, '北', label);         // → 后园竹林
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

// ---------------- 第九章 ----------------

function ch9(g, label, { how = 'qiao', expose = true, beatDing = false } = {}) {
  step(label + ' 第九章');
  g.enter('luoyang.station');
  expectFlag(g, 'xiaoao.ch9', label);
  pick(g, '上少室山', label);
  // 山门：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  g.enter('shaolin.gate');
  const opt = { qiao: '崖壁的脚窝', hp: '碎石坡', party: '一上一下接应' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '进寺', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c9_in', label);
  expectRoom(g, 'shaolin.hall', label + '（过场把人带进罗汉堂）');
  // 罗汉堂
  if (expose) {
    if (!has(g, '摊在堂上')) note(`${label}：身上有手令，堂上却没有"摊开"这条路`);
    pick(g, '摊在堂上', label);
    pick(g, '看丁勉怎么收场', label);
  } else {
    pick(g, '站在门口不出声', label);
    pick(g, '看他怎么收场', label);
  }
  pick(g, '接住他们', label);
  win(g, label + '/嵩山执事');
  expectFlag(g, 'xiaoao.c9_block', label);
  expectItem(g, 'xiaoao.item.canye', label);
  pick(g, '收起来', label);
  pick(g, '跟他去塔林', label);
  expectRoom(g, 'xiaoao.sl.pagoda', label + '（过场把人带到塔林）');
  pick(g, '顶住', label);
  if (beatDing) win(g, label + '/丁勉（硬要打赢）'); else lose(g, label + '/丁勉');
  if (beatDing && !flag(g, 'xiaoao.beat_ding')) note(`${label}：逼退丁勉没有记下标记`);
  pick(g, beatDing ? '回寺里去' : '爬起来', label);
  // 西跨院
  g.enter('shaolin.hall');
  ex(g, '东', label);
  expectRoom(g, 'xiaoao.sl.cell', label);
  pick(g, '接下来怎么办', label);
  expectFlag(g, 'xiaoao.ch9_done', label);
  expectSkill(g, 'xiaoao.pixie', label);
  if ((g.state.player.skillcap?.['xiaoao.fantian'] ?? 0) < 85) note(`${label}：翻天掌上限没有提到 85`);
}

// ---------------- 第十章 ----------------

function ch10(g, label, { how = 'qiao', stone = true, beatChief = false } = {}) {
  step(label + ' 第十章');
  g.enter('luoyang.station');
  expectFlag(g, 'xiaoao.ch10', label);
  pick(g, '往北走', label);
  // 廿八铺
  ex(g, '西南', label);       // 洛阳车马行 → 官道（北是进城、西北是天龙的少室山路）
  expectRoom(g, 'xiaoao.hn.pu', label);
  pick(g, stone ? '先捡块石头' : '直接冲进去', label);
  pick(g, '并肩挡住', label);
  win(g, label + '/假魔教');
  expectFlag(g, 'xiaoao.c10_fight', label);
  pick(g, '问她伤得怎么样', label);
  pick(g, '带她们走', label);
  // 乱石渡口：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.hn.ford', label);
  const opt = { qiao: '踩着河心的石头', hp: '蹚水一趟一趟背', party: '一个在河心接应' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '上坡进庙', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c10_cross', label);
  expectRoom(g, 'xiaoao.hn.temple', label + '（过场把人带过河）');
  // 山神庙
  pick(g, '开门出去', label);
  pick(g, '挡在门口', label);
  if (beatChief) win(g, label + '/黑衣首领（硬要打赢）'); else lose(g, label + '/黑衣首领');
  if (beatChief && !flag(g, 'xiaoao.beat_chief')) note(`${label}：逼退黑衣首领没有记下标记`);
  pick(g, '扶定静进去', label);
  expectFlag(g, 'xiaoao.ch10_done', label);
  expectItem(g, 'xiaoao.item.tiepai', label);
  if ((g.state.player.skillcap?.['xiaoao.hengshan'] ?? 0) < 110) note(`${label}：衡山剑法上限没有提到 110`);
  if ((g.state.player.skillcap?.['xiaoao.qixian'] ?? 0) < 70) note(`${label}：七弦指上限没有提到 70`);
}

// ---------------- 第十一章 ----------------

function ch11(g, label, { how = 'qiao', wait = false, beatZuo = false } = {}) {
  step(label + ' 第十一章');
  g.enter('luoyang.station');
  expectFlag(g, 'xiaoao.ch11', label);
  pick(g, '上嵩山', label);
  // 朝天梯：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '东南', label);        // 洛阳车马行 → 少林山门
  ex(g, '西南', label);        // 山门 → 太室山朝天梯
  expectRoom(g, 'xiaoao.ss.ladder', label);
  const opt = { qiao: '崖壁的手扣', hp: '把那位老者背上去', party: '一上一下把人递上去' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '上台', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c11_up', label);
  expectRoom(g, 'xiaoao.ss.tai', label + '（过场把人带上封禅台）');
  // 台上
  if (wait) pick(g, '等一等', label);
  pick(g, '摊出来', label);
  expectFlag(g, 'xiaoao.c11_show', label);
  pick(g, '守住台心', label);
  win(g, label + '/嵩山队正');
  expectFlag(g, 'xiaoao.c11_fight', label);
  pick(g, '退到台边', label);
  pick(g, '盯着看完', label);
  expectFlag(g, 'xiaoao.c11_blind', label);
  pick(g, '看着左冷禅', label);
  pick(g, '挡住', label);
  if (beatZuo) win(g, label + '/左冷禅（硬要挡下）'); else lose(g, label + '/左冷禅');
  if (beatZuo && !flag(g, 'xiaoao.beat_zuo')) note(`${label}：挡下左冷禅没有记下标记`);
  pick(g, '站起来', label);
  expectFlag(g, 'xiaoao.ch11_done', label);
  if ((g.state.player.skillcap?.['xiaoao.pixie'] ?? 0) < 40) note(`${label}：辟邪剑法上限没有提到 40`);
  if ((g.state.player.skillcap?.['xiaoao.fantian'] ?? 0) < 100) note(`${label}：翻天掌上限没有提到 100`);
}

// ---------------- 第十二章 ----------------

function ch12(g, label, { how = 'qiao', talk = true, tell = true, beatMask = false } = {}) {
  step(label + ' 第十二章');
  g.enter('luoyang.station');
  expectFlag(g, 'xiaoao.ch12', label);
  pick(g, '跟她们走', label);
  // 见性峰下
  g.enter('xiaoao.hn.temple');
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.hh.road', label);
  pick(g, talk ? '先把话说死' : '挡在恒山弟子前面', label);
  pick(g, '动手', label);
  win(g, label + '/邓八公');
  expectFlag(g, 'xiaoao.c12_fight', label);
  pick(g, '上栈道', label);
  // 悬空栈道：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '上', label);
  expectRoom(g, 'xiaoao.hh.plank', label);
  const opt = { qiao: '崖壁的凹槽', hp: '烂麻绳', party: '一前一后把绳子架起来' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '上峰', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c12_up', label);
  expectRoom(g, 'xiaoao.hh.an', label + '（过场把人带上峰顶）');
  // 无色庵
  expectFlag(g, 'xiaoao.c12_an', label);
  if (tell) {
    pick(g, '把你看出来的说一半', label);
    pick(g, '外头有脚步声', label);     // 说了那一半之后还有一段，才轮到蒙面人进院
  } else {
    pick(g, '什么也不说', label);
  }
  pick(g, '挡住他', label);
  if (beatMask) win(g, label + '/蒙面人（硬要逼退）'); else lose(g, label + '/蒙面人');
  if (beatMask && !flag(g, 'xiaoao.beat_masked')) note(`${label}：逼退蒙面人没有记下标记`);
  pick(g, beatMask ? '等上来的人' : '爬起来', label);
  pick(g, '把事情告诉他', label);
  expectFlag(g, 'xiaoao.ch12_done', label);
  if ((g.state.player.skillcap?.['xiaoao.pixie'] ?? 0) < 60) note(`${label}：辟邪剑法上限没有提到 60`);
  if ((g.state.player.skillcap?.['xiaoao.qixian'] ?? 0) < 90) note(`${label}：七弦指上限没有提到 90`);
}

// ---------------- 第十三章 ----------------

function ch13(g, label, { how = 'qiao', ask = true, beatDf = false, free = true } = {}) {
  step(label + ' 第十三章');
  g.enter('xiaoao.hh.road');
  expectFlag(g, 'xiaoao.ch13', label);
  pick(g, '跟他走', label);
  // 百丈悬索：门槛三选一
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.hm.road', label);
  ex(g, '上', label);
  expectRoom(g, 'xiaoao.hm.rope', label);
  const opt = { qiao: '攀崖壁的铁环', hp: '一口气吊上去', party: '一个稳索一个上' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '上崖', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'xiaoao.c13_up', label);
  expectRoom(g, 'xiaoao.hm.hall', label + '（过场把人带上崖顶）');
  // 广场
  pick(g, ask ? '哪一位' : '脚挪开', label);
  pick(g, '接住', label);
  win(g, label + '/杨莲亭的人');
  expectFlag(g, 'xiaoao.c13_fight', label);
  pick(g, '上楼', label);
  expectRoom(g, 'xiaoao.hm.lou', label + '（过场把人带进绣楼）');
  // 绣楼
  pick(g, free ? '承认' : '不答话', label);
  pick(g, '挡', label);
  if (beatDf) win(g, label + '/东方不败（硬要接下三针）'); else lose(g, label + '/东方不败');
  if (beatDf && !flag(g, 'xiaoao.beat_dfbb')) note(`${label}：接下三针没有记下标记`);
  pick(g, '下楼', label);
  pick(g, '打开看看', label);
  expectFlag(g, 'xiaoao.ch13_done', label);
  if (free) {
    if ((g.state.player.skillcap?.['xiaoao.xixing'] ?? 0) < 60) note(`${label}：开过锁的那条路，吸星大法上限没有提到 60`);
  } else if ((g.state.player.skillcap?.['xiaoao.yangxin'] ?? 0) < 120) note(`${label}：没开锁的那条路，养心诀上限没有提到 120`);
}

// ---------------- 第十四章 ----------------

function ch14(g, label, { how = 'qiao', stay = false } = {}) {
  step(label + ' 第十四章');
  g.enter('xiaoao.hm.road');
  expectFlag(g, 'xiaoao.ch14', label);
  pick(g, '跟上去', label);
  // 广场：十六把刀
  g.enter('xiaoao.hm.hall');
  pick(g, '迎上去', label);
  win(g, label + '/亲卫');
  expectFlag(g, 'xiaoao.c14_yang', label);
  // 门槛三选一：站哪个位置。选项在进绣楼前那一刻就过滤好，所以队伍要先组好
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  pick(g, '石径那边', label);
  expectRoom(g, 'xiaoao.hm.yard', label + '（过场把人带到绣楼前）');
  const opt = { qiao: '接第一针', hp: '堵死他的退路', party: '分站两侧' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  if (how === 'party') g.party = null;   // 门槛选完就散掉这个假队伍：战斗里引擎会给队员建单位，假人没有 loadout
  pick(g, how === 'qiao' ? '接住' : how === 'hp' ? '顶住' : '一起上', label);
  win(g, label + '/东方不败');
  expectFlag(g, 'xiaoao.c14_win', label);
  pick(g, '过去看看', label);
  pick(g, stay ? '答应留下' : '还有事没了结', label);
  expectFlag(g, stay ? 'xiaoao.c14_join' : 'xiaoao.c14_free', label);
  pick(g, '进绣楼看看', label);
  expectRoom(g, 'xiaoao.hm.lou', label + '（过场把人带进绣楼）');
  expectFlag(g, 'xiaoao.ch14_done', label);
  expectSkill(g, 'xiaoao.kuihua', label);
}

// ---------------- 第十五章 ----------------

function ch15(g, label, { how = 'qiao', read = true, ask = true, beatMask = false } = {}) {
  step(label + ' 第十五章');
  g.enter('fuzhou.station');
  expectFlag(g, 'xiaoao.ch15', label);
  pick(g, '往巷子里走', label);
  // 老宅
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };   // 门槛跟在对话里，队伍先组好
  g.enter('xiaoao.fz.lane');
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.fz.ruin', label);
  expectFlag(g, 'xiaoao.c15_meet', label);
  pick(g, '下地窖', label);
  const opt = { qiao: '踩着朽木', hp: '直接跳下去', party: '一个放绳一个下' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  if (how === 'party') g.party = null;
  pick(g, '看看窖里有什么', label);
  expectFlag(g, 'xiaoao.c15_down', label);
  // 地窖：袈裟
  ex(g, '下', label);
  expectRoom(g, 'xiaoao.fz.cellar', label);
  expectFlag(g, 'xiaoao.c15_jiasha', label);
  if (read) { pick(g, '记下来', label); pick(g, '上去', label); }
  else pick(g, '答他', label);     // 不细看那一行，直接应声上去
  expectRoom(g, 'xiaoao.fz.ruin', label + '（过场把人带回院子）');
  // 余沧海
  pick(g, '和他并肩', label);
  win(g, label + '/余沧海');
  expectFlag(g, 'xiaoao.c15_yu', label);
  if (ask) pick(g, '练这个要先做什么', label);
  pick(g, '把袈裟给他', label);
  pick(g, '挡住他', label);
  if (beatMask) win(g, label + '/蒙面人（硬要夹住他的剑）'); else lose(g, label + '/蒙面人');
  if (beatMask && !flag(g, 'xiaoao.beat_masked2')) note(`${label}：夹住他的剑没有记下标记`);
  pick(g, '爬起来', label);
  expectFlag(g, 'xiaoao.ch15_done', label);
  if ((g.state.player.skillcap?.['xiaoao.pixie'] ?? 0) < 80) note(`${label}：辟邪剑法上限没有提到 80`);
}

// ---------------- 第十六、十七、十八章 ----------------

function ch16(g, label, { how = 'qiao' } = {}) {
  step(label + ' 第十六章');
  g.enter('xiaoao.hs.dian');
  expectFlag(g, 'xiaoao.ch16', label);
  pick(g, '坐下', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  pick(g, '起身', label);
  const opt = { qiao: '翻进去', hp: '一肩撞开门', party: '一个撞门一个绕后' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  if (how === 'party') g.party = null;
  pick(g, '看清屋里的情形', label);
  expectFlag(g, 'xiaoao.c16_in', label);
  pick(g, '听她说', label);
  expectItem(g, 'xiaoao.item.kougong', label);
  pick(g, '挡住他', label);
  win(g, label + '/林平之');
  expectFlag(g, 'xiaoao.c16_fight', label);
  pick(g, '把她的话告诉他', label);
  pick(g, '看一眼林平之', label);
  expectFlag(g, 'xiaoao.ch16_done', label);
  if ((g.state.player.skillcap?.['xiaoao.pixie'] ?? 0) < 100) note(`${label}：辟邪剑法上限没有提到 100`);
}

function ch17(g, label, { how = 'qiao', useWords = true } = {}) {
  step(label + ' 第十七章');
  g.enter('huashan.gate');
  expectFlag(g, 'xiaoao.ch17', label);
  pick(g, '跟上去', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '东北', label);
  expectRoom(g, 'xiaoao.hs.rock', label);
  const opt = { qiao: '踩石窝硬上', hp: '借力一口气窜上去', party: '一个压绳一个上' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  if (how === 'party') g.party = null;
  pick(g, '上玉女峰', label);
  expectFlag(g, 'xiaoao.c17_up', label);
  ex(g, '北', label);
  expectRoom(g, 'xiaoao.hs.yunu', label);
  expectFlag(g, 'xiaoao.c17_talk', label);
  pick(g, useWords ? '岳灵珊的话' : '这一路看见的', label);
  pick(g, '看着他', label);
  pick(g, '一起上', label);
  win(g, label + '/岳不群');
  expectFlag(g, 'xiaoao.c17_win', label);
  pick(g, '回头看宁中则', label);
  pick(g, '退出去', label);
  expectFlag(g, 'xiaoao.ch17_done', label);
  if ((g.state.player.skillcap?.['xiaoao.pixie'] ?? 0) < 120) note(`${label}：辟邪剑法上限没有提到 120`);
}

function ch18(g, label, { how = 'qiao', ask = true, pull = true, ending = 'burn' } = {}) {
  step(label + ' 第十八章（终章）');
  g.enter('huashan.gate');
  expectFlag(g, 'xiaoao.ch18', label);
  pick(g, '上山', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  g.enter('xiaoao.hs.yunu');
  const opt = { qiao: '贴着崖壁走', hp: '从雪深处趟过去', party: '用绳子连在一起' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  if (how === 'party') g.party = null;
  pick(g, '上坪', label);
  expectFlag(g, 'xiaoao.c18_up', label);
  ex(g, '西北', label);
  expectRoom(g, 'xiaoao.hs.ping', label);
  if (ask) { pick(g, '来问一句话', label); pick(g, '动手', label); }
  else pick(g, '来了结这件事', label);
  pick(g, '接住', label);
  win(g, label + '/落雁坪最后一战');
  expectFlag(g, 'xiaoao.c18_fight', label);
  pick(g, pull ? '拉他上来' : '看着他', label);
  pick(g, '下山', label);
  const opt2 = { burn: '把它烧了', keep: '留着它', learn: '把它练下去' }[ending];
  if (!has(g, opt2)) note(`${label}：终章选项「${opt2}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt2, label);
  pick(g, '下山', label);
  expectFlag(g, 'xiaoao.ch18_done', label);
  // 通关奖励（D-309）：三条收场各自放开不同的上限
  const cap = (id) => g.state.player.skillcap?.[id] ?? 0;
  if (cap('xiaoao.fantian') < 140) note(`${label}：通关之后翻天掌上限没有提到 140`);
  if (ending === 'burn' && cap('xiaoao.hengshan') < 140) note(`${label}：烧了那条路，衡山剑法上限没有提到 140`);
  if (ending === 'keep' && cap('xiaoao.pixie') < 140) note(`${label}：留着那条路，辟邪剑法上限没有提到 140`);
  if (ending === 'learn' && cap('xiaoao.kuihua') < 140) note(`${label}：练下去那条路，葵花宝典上限没有提到 140`);
}

// ---------------- 路线 1：问清来路 → 站到身边 → 劝住 → 正面扑上去；第二章走"巧"那条门槛 ----------------
{
  const label = '路线1';
  const g = newGame({ skills: { 'base.zhang': 180 } }); // 小巧掌 180 级：全线十七处巧类门槛都够
  hook(g, label);
  ch1(g, label, { ask: true, spare: true, block: false, baier: true });
  ch2(g, label, { how: 'qiao', ask: true, beatYu: false, side: false });
  ch3(g, label, { how: 'qiao', meet: 'front', qin: 'out', ask: 'plan' });
  ch4(g, label, { how: 'qiao', expose: true, grass: false, beatFei: false });
  ch5(g, label, { how: 'qiao', meet: 'drink', ask: true });
  ch6(g, label, { how: 'qiao', ambush: true, askWall: true, beatFeng: false });
  ch7(g, label, { how: 'qin', askBox: true });   // 绢谱叩门
  ch8(g, label, { how: 'qiao', free: true, askRisk: true, beatRen: false });  // 开锁放人
  ch9(g, label, { how: 'qiao', expose: true, beatDing: false });
  ch10(g, label, { how: 'qiao', stone: true, beatChief: false });
  ch11(g, label, { how: 'qiao', wait: false, beatZuo: false });
  ch12(g, label, { how: 'qiao', talk: true, tell: true, beatMask: false });
  ch13(g, label, { how: 'qiao', ask: true, beatDf: false, free: true });
  ch14(g, label, { how: 'qiao', stay: false });
  ch15(g, label, { how: 'qiao', read: true, ask: true, beatMask: false });
  ch16(g, label, { how: 'qiao' });
  ch17(g, label, { how: 'qiao', useWords: true });
  ch18(g, label, { how: 'qiao', ask: true, pull: true, ending: 'burn' });
}

// ---------------- 路线 2：先护姑娘 → 不劝 → 先抽跳板 → 不走支线；第二章硬闯 + 打赢余沧海 ----------------
{
  const label = '路线2';
  const g = newGame({ maxhpBoost: 2000 }); // 气血上限够：全线硬闯的门槛，直到落雁坪的雪地
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
  ch9(g, label, { how: 'hp', expose: false, beatDing: true });
  ch10(g, label, { how: 'hp', stone: false, beatChief: true });
  ch11(g, label, { how: 'hp', wait: true, beatZuo: true });
  ch12(g, label, { how: 'hp', talk: false, tell: false, beatMask: true });
  ch13(g, label, { how: 'hp', ask: false, beatDf: true, free: false });   // 第八章没开锁那条路
  ch14(g, label, { how: 'hp', stay: true });
  ch15(g, label, { how: 'hp', read: false, ask: false, beatMask: true });
  ch16(g, label, { how: 'hp' });
  ch17(g, label, { how: 'hp', useWords: false });
  ch18(g, label, { how: 'hp', ask: false, pull: false, ending: 'learn' });
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
  ch9(g, label, { how: 'party', expose: true, beatDing: false });
  ch10(g, label, { how: 'party', stone: true, beatChief: false });
  ch11(g, label, { how: 'party', wait: true, beatZuo: false });
  ch12(g, label, { how: 'party', talk: true, tell: true, beatMask: false });
  ch13(g, label, { how: 'party', ask: true, beatDf: false, free: true });
  ch14(g, label, { how: 'party', stay: false });
  ch15(g, label, { how: 'party', read: true, ask: true, beatMask: false });
  ch16(g, label, { how: 'party' });
  ch17(g, label, { how: 'party', useWords: true });
  ch18(g, label, { how: 'party', ask: true, pull: true, ending: 'keep' });
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
  ex(g, '东南', label + '（重来）');
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
console.log('✓ 笑傲江湖十八章全线走通：五条路线、十七处门槛、两条大分支、三种收场、NPC 队友、十一场必败战的输赢、打输重来');
