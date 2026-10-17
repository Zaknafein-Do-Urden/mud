// 天龙八部主线的脚本通关测试：node tools/playtest-tianlong.mjs
// 按 WRITING.md §9 第 4 条：把每一章从头走到尾，每条门槛路线、每个分支、打输重来都走一遍。
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

function newGame({ skills = {}, inner = null, light = null, maxhpBoost = 0, sect = null } = {}) {
  const db = emptyDb();
  for (const f of files) addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
  const st = newState(db.meta.game.props.start);
  Object.assign(st.player.skills, skills);
  st.player.loadout = {
    outer: ['base.quan', ...Object.keys(skills).filter((id) => db.skill[id]?.props.kind === '外功')].slice(0, 4),
    inner,
    light,
  };
  st.player.money = 5000;
  if (sect) st.player.sect = { id: sect, rep: 0, rank: 1 };
  if (maxhpBoost) st.player.attrs.根骨 += maxhpBoost; // 抬高气血上限，用来走"硬闯"那条门槛
  const g = new Game(db, st);
  g.enter(st.player.room);
  return g;
}

/** 执行一条命令，收集错误输出 */
function ex(g, cmd, label) {
  const out = g.exec(cmd);
  for (const o of out) if (o.cls === 'err') note(`${label}：命令「${cmd}」报错 → ${o.text}`);
  return out;
}

/** 在当前对话里挑一个文字包含 substr 的选项 */
function pick(g, substr, label) {
  if (!g.dialog) { note(`${label}：想选「${substr}」，但眼下没有对话`); return false; }
  const i = g.dialog.findIndex((c) => c.text.includes(substr));
  if (i < 0) { note(`${label}：对话里没有「${substr}」这个选项（现有：${g.dialog.map((c) => c.text).join(' / ')}）`); return false; }
  ex(g, String(i + 1), label);
  return true;
}

/** 当前对话里有没有某个选项 */
const has = (g, substr) => !!g.dialog?.some((c) => c.text.includes(substr));

/** 打赢当前这一场：把敌人气血压到 1，自己内力管够 */
function win(g, label) {
  if (!g.state.battle) { note(`${label}：以为在打架，其实没有`); return; }
  for (let i = 0; i < 60 && g.state.battle; i++) {
    const b = g.state.battle;
    for (const u of b.units) {
      if (u.side === 'e' && u.hp > 0) u.hp = 1; // 只压活着的，别把倒下的又救起来
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

// ---------------- 开端：成都车马行 → 大理 ----------------

function hook(g, label) {
  step(label + ' 开端');
  g.enter('chengdu.station');
  ex(g, '对话 马锅头', label);
  pick(g, '那位公子后来怎样了', label);
  pick(g, '跟车去大理', label);
  expectFlag(g, 'tianlong.started', label);
  g.enter('dali.station'); // 坐车七日，这里直接到站
  expectFlag(g, 'tianlong.ch1', label);
  pick(g, '往西上山', label);
}

// ---------------- 第一章 ----------------

function ch1(g, label, { sneak = false, watch = false } = {}) {
  step(label + ' 第一章');
  ex(g, '西', label); // 大理车马行 → 松林山道
  expectRoom(g, 'tianlong.wl.road', label);
  pick(g, sneak ? '绕到背后' : '喝住他们', label);
  pick(g, sneak ? '趁乱动手' : '动手', label);
  win(g, label + '/神农帮');
  pick(g, '一起去剑湖宫', label);
  expectFlag(g, 'tianlong.met_duan', label);
  ex(g, '北', label);
  pick(g, watch ? '先站到一边' : '帮无量剑', label);
  pick(g, watch ? '这下不得不动手' : '接下这一战', label);
  win(g, label + '/左护法');
  pick(g, '问问那片石壁', label);
  expectFlag(g, 'tianlong.c1_duel', label);
  ex(g, '西', label);
  expectRoom(g, 'tianlong.wl.cliff', label);
  pick(g, '……', label); // 坠崖：过场对话把人带到玉洞
  expectRoom(g, 'tianlong.wl.cave', label);
  pick(g, '四下里看看', label);
  if (!sneak) pick(g, '劝他收好', label);
  pick(g, '把石壁上的步法记下来', label);
  expectFlag(g, 'tianlong.ch1_done', label);
  expectSkill(g, 'tianlong.lingbo', label);
}

// ---------------- 第二章 ----------------

function ch2(g, label, { how = 'qiao' } = {}) {
  step(label + ' 第二章');
  g.enter('dali.center');
  expectFlag(g, 'tianlong.ch2', label);
  pick(g, '你跟万劫谷是什么关系', label);
  pick(g, '带我去谷口', label);
  g.enter('dali.station');
  if (how === 'party') g.party = { members: [{ id: 'friend' }] }; // 选项在开对话那一刻就过滤好了，得先组队
  ex(g, '西北', label);
  expectRoom(g, 'tianlong.wj.mouth', label);
  const opt = { qiao: '抓住藤索', hp: '抬起横木', party: '和同伴一起' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '往里走', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'tianlong.wj_in', label);
  ex(g, '西', label);
  pick(g, '背靠石壁', label);
  win(g, label + '/家丁');
  pick(g, '一起往里走', label);
  expectFlag(g, 'tianlong.wj_mu', label);
  ex(g, '西', label);
  pick(g, '迎上去', label);
  win(g, label + '/钟万仇');
  pick(g, '往西去茶花圃', label);
  expectFlag(g, 'tianlong.wj_hall', label);
  ex(g, '西', label);
  pick(g, '迎上去', label);
  return g; // 必败战留给调用方决定输赢
}

function ch2End(g, label, { beat = false } = {}) {
  step(label + ' 第二章结尾');
  if (beat) win(g, label + '/南海鳄神'); else lose(g, label + '/南海鳄神');
  pick(g, '……', label);
  pick(g, '出谷', label);
  pick(g, '接过来看看', label);
  expectFlag(g, 'tianlong.ch2_done', label);
  expectSkill(g, 'tianlong.beiming', label);
}

// ---------------- 第三章 ----------------

function ch3(g, label, { clue = 'market' } = {}) {
  step(label + ' 第三章');
  g.enter('dali.office');
  expectFlag(g, 'tianlong.ch3', label);
  pick(g, '我去打听', label);
  if (clue === 'market') {
    g.enter('dali.market');
    pick(g, '他往哪边去了', label);
  } else {
    g.enter('dali.inn');
    pick(g, '什么味儿', label);
  }
  expectFlag(g, 'tianlong.c3_clue', label);
  g.enter('dali.office');
  pick(g, '走', label);
  expectFlag(g, 'tianlong.c3_night', label);
  g.enter('dali.station');
  ex(g, '西南', label);
  expectRoom(g, 'tianlong.dl.ruin', label);
  pick(g, '动手', label);
  win(g, label + '/恶人爪牙');
  pick(g, '追上屋脊', label);
  expectFlag(g, 'tianlong.c3_roof', label);
  ex(g, '上', label);
  pick(g, '接住他', label);
  win(g, label + '/云中鹤');
  pick(g, '歇一口气', label);
  pick(g, '同去天龙寺', label);
  expectFlag(g, 'tianlong.c3_rescued', label);
  g.enter('dali.center');
  ex(g, '西北', label);
  ex(g, '北', label);
  ex(g, '北', label);
  expectRoom(g, 'tianlong.tl.muni', label);
  pick(g, '我能做什么', label);
  pick(g, '恭敬领受', label);
  expectFlag(g, 'tianlong.ch3_done', label);
  expectSkill(g, 'tianlong.yiyangzhi', label);
}

// ---------------- 第四章 ----------------

function ch4(g, label, { how = 'qiao', hide = true, beat = false } = {}) {
  step(label + ' 第四章');
  g.enter('dali.center');
  ex(g, '西北', label);
  expectRoom(g, 'tianlong.tl.gate', label);
  expectFlag(g, 'tianlong.ch4', label);
  pick(g, '走小径', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '西', label);
  expectRoom(g, 'tianlong.tl.pine', label);
  const opt = { qiao: '踩着松枝', nei: '提一口气', party: '和同伴一起' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  if (how === 'party') g.party = null;
  pick(g, '往寺里走', label);
  expectFlag(g, 'tianlong.c4_up', label);
  expectRoom(g, 'tianlong.tl.yard', label);
  // 翻进前院就撞上武士，先打完，再决定去不去藏经小楼（可选支线）
  pick(g, '并肩打退他们', label);
  win(g, label + '/吐蕃武士');
  pick(g, '牟尼堂那边怎么样了', label);
  expectFlag(g, 'tianlong.c4_in', label);
  ex(g, '西', label);
  expectRoom(g, 'tianlong.tl.sutra', label);
  pick(g, hide ? '把它藏进香灰瓮' : '放回去', label);
  pick(g, '往牟尼堂去', label);
  expectFlag(g, hide ? 'tianlong.c4_hid' : 'tianlong.c4_nohide', label);
  ex(g, '东', label);
  ex(g, '北', label);
  expectRoom(g, 'tianlong.tl.muni', label);
  pick(g, '进牟尼堂', label);
  expectRoom(g, 'tianlong.tl.muni_in', label);
  pick(g, '守在堂口', label);
  pick(g, '三个人一起上', label);
  win(g, label + '/武士头领');
  pick(g, '挡在段誉前面', label);
  if (beat) win(g, label + '/鸠摩智'); else lose(g, label + '/鸠摩智');
  pick(g, '……', label);
  pick(g, '拦住他', label);
  pick(g, '……', label);
  expectFlag(g, 'tianlong.ch4_done', label);
  expectSkill(g, 'tianlong.liumai', label); // 本因传的商阳一路（D-215）
  const cap = g.db.skill['tianlong.yiyangzhi'].props.cap;
  if (!flag(g, 'tianlong.lead_jiangnan')) note(`${label}：江南的伏笔标记没有设下`);
  if (cap !== '25') note(`${label}：一阳指的初始上限被改过了（${cap}），检查 POWER 规划`);
}

// ---------------- 第五章 ----------------

function ch5(g, label, { pay = false, qin = true } = {}) {
  step(label + ' 第五章');
  g.enter('suzhou.station'); // 一路车马到苏州
  expectFlag(g, 'tianlong.ch5', label);
  pick(g, '先去绣市', label);
  g.enter('suzhou.market');
  pick(g, pay ? '掏出一串钱' : '过去搭把手', label);
  pick(g, '他们往哪边去了', label);
  expectFlag(g, 'tianlong.c5_clue', label);
  g.enter('suzhou.station');
  ex(g, '西', label);
  expectRoom(g, 'tianlong.js.wharf', label);
  pick(g, pay ? '我找慕容公子' : '我找一个被吐蕃和尚带走的朋友', label);
  if (pay) pick(g, '接着说下去', label);
  pick(g, '……', label);           // 上船
  pick(g, '站到船头去', label);
  win(g, label + '/太湖水匪');
  expectRoom(g, 'tianlong.js.qinyun', label); // 靠岸的过场把人带过去
  pick(g, '你是什么人', label);
  pick(g, '去听香水榭', label);
  expectFlag(g, 'tianlong.c5_azhu', label);
  if (qin) { // 可选：听阿碧弹一曲
    ex(g, '对话 阿碧', label);
    pick(g, '听她弹一曲', label);
    pick(g, '谢过她', label);
    expectFlag(g, 'tianlong.c5_qin', label);
  }
  ex(g, '北', label);
  expectRoom(g, 'tianlong.js.tingxiang', label);
  pick(g, '到窗口看看', label);
  pick(g, '迎上去', label);
  win(g, label + '/一品堂');
  pick(g, '问问阿朱', label);
  pick(g, '……', label);
  expectFlag(g, 'tianlong.ch5_done', label);
}

// ---------------- 第六章 ----------------

function ch6(g, label, { how = 'qiao', by = 'cha' } = {}) {
  step(label + ' 第六章');
  g.enter('tianlong.js.qinyun');
  expectFlag(g, 'tianlong.ch6', label);
  pick(g, '我陪你去', label);
  if (how === 'party') g.party = { members: [{ id: 'friend' }] };
  ex(g, '西', label);
  expectRoom(g, 'tianlong.js.manto_gate', label);
  const opt = { qiao: '踩着花枝', nei: '一口气提到顶', party: '和同伴合力' }[how];
  if (!has(g, opt)) note(`${label}：门槛选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '往里走', label);
  if (how === 'party') g.party = null;
  expectFlag(g, 'tianlong.c6_in', label);
  ex(g, '西', label);
  pick(g, '动手', label);
  win(g, label + '/庄丁');
  pick(g, '往北到听雨堂', label);
  expectFlag(g, 'tianlong.c6_wu', label);
  ex(g, '北', label);
  pick(g, '挡在段誉前面', label);
  win(g, label + '/总管');
  pick(g, by === 'cha' ? '让段誉去说' : '让她看清楚一阳指', label);
  pick(g, '……', label);
  pick(g, '你见过很多武功秘籍', label);
  pick(g, '你连这个也记得', label);
  pick(g, '把少泽一路记下来', label);
  expectFlag(g, 'tianlong.ch6_done', label);
}

// ---------------- 第七章 ----------------

function ch7(g, label, { jiu = 'nei', go = true } = {}) {
  step(label + ' 第七章');
  g.enter('tianlong.js.qinyun');
  expectFlag(g, 'tianlong.ch7', label);
  pick(g, '北上无锡', label);
  ex(g, '西北', label);
  expectRoom(g, 'tianlong.wx.road', label);
  ex(g, '北', label);
  expectRoom(g, 'tianlong.wx.songhe', label);
  const opt = { nei: '陪他们喝，拿内息把酒逼出来', shi: '老老实实喝', kan: '不喝' }[jiu];
  if (!has(g, opt)) note(`${label}：拼酒选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '……', label);
  expectFlag(g, 'tianlong.c7_jiu', label);
  pick(g, '和乔峰并肩', label);
  win(g, label + '/一品堂（楼上）');
  pick(g, '下楼去', label);
  pick(g, '从中间破开', label);
  win(g, label + '/一品堂统领');
  pick(g, '……', label);
  pick(g, go ? '我们和你一起去' : '这是你们帮里的事', label);
  if (go) pick(g, '我跟你去', label); else pick(g, '……', label);
  expectFlag(g, 'tianlong.ch7_done', label);
  expectFlag(g, 'tianlong.met_qiaofeng', label);
  expectFlag(g, 'tianlong.lead_xingzilin', label);
}

// ---------------- 第八章 ----------------

function ch8(g, label, { side = 'qiao' } = {}) {
  step(label + ' 第八章');
  g.enter('tianlong.wx.road');
  expectFlag(g, 'tianlong.ch8', label);
  pick(g, '往东进林子', label);
  ex(g, '东', label);
  expectRoom(g, 'tianlong.xz.lin', label);
  const opt = { kan: '哪边都不站', qiao: '我们站乔峰那一边', bang: '本帮的事' }[side];
  if (!has(g, opt)) note(`${label}：林口选项「${opt}」没出现（现有：${g.dialog?.map((c) => c.text).join(' / ')}）`);
  pick(g, opt, label);
  pick(g, '往里走', label);
  expectFlag(g, 'tianlong.c8_in', label);
  pick(g, '背靠背', label);
  win(g, label + '/叛乱弟子');
  pick(g, '往火堆那边看', label);
  pick(g, '看着乔峰', label);
  pick(g, '……', label);
  pick(g, '挡在乔峰前面', label);
  win(g, label + '/谭公谭婆赵钱孙');
  pick(g, '……', label);
  pick(g, '我跟你去', label);
  expectFlag(g, 'tianlong.ch8_done', label);
  expectFlag(g, 'tianlong.lead_daitou', label);
}

// ---------------- 第九章 ----------------

function ch9(g, label, { ask = 'qiao' } = {}) {
  step(label + ' 第九章');
  g.enter('luoyang.station');
  expectFlag(g, 'tianlong.ch9', label);
  pick(g, '往北去少室山下', label);
  ex(g, '北', label);
  expectRoom(g, 'tianlong.hn.road', label);
  ex(g, '北', label);
  expectRoom(g, 'tianlong.hn.hut', label);
  pick(g, ask === 'qiao' ? '那就让他自己来见我' : '大师，三十年前那块石头上的孩子', label);
  pick(g, '……', label);
  expectFlag(g, 'tianlong.c9_asked', label);
  pick(g, '看那个小沙弥', label);
  pick(g, '背靠草庵', label);
  win(g, label + '/黑衣人');
  pick(g, '……', label);
  pick(g, '扶她进屋', label);
  pick(g, '接住他', label);
  win(g, label + '/黑衣人头目');
  pick(g, '看看那个油布包', label);
  pick(g, '……', label);
  expectFlag(g, 'tianlong.ch9_done', label);
  if (!g.state.player.inventory['tianlong.mask']) note(`${label}：没拿到阿朱的人皮面具`);
}

// ---------------- 第十章 ----------------

function ch10(g, label, { dang = true } = {}) {
  step(label + ' 第十章');
  g.enter('luoyang.station');
  expectFlag(g, 'tianlong.ch10', label);
  pick(g, '一起进去', label);
  ex(g, '东', label);
  expectRoom(g, 'tianlong.jx.gate', label);
  pick(g, '跟进去', label);
  pick(g, '往东进厅', label);
  expectFlag(g, 'tianlong.c10_in', label);
  ex(g, '东', label);
  expectRoom(g, 'tianlong.jx.hall', label);
  pick(g, dang ? '替他挡一碗' : '看着他喝', label);
  if (dang) pick(g, '看着他接着喝', label);
  expectFlag(g, 'tianlong.c10_jue', label);
  pick(g, '挡住这一片', label);
  win(g, label + '/中原群豪');
  pick(g, '杀到西跨院去', label); // 过场对话把人带进跨院
  expectRoom(g, 'tianlong.jx.west', label);
  pick(g, '兄弟俩交给你', label);
  win(g, label + '/游氏兄弟');
  pick(g, '回头看', label);
  pick(g, '……', label);
  expectFlag(g, 'tianlong.ch10_done', label);
  expectFlag(g, 'tianlong.lead_yanmen', label);
}

// ================= 路线一：正面硬来、巧路门槛、三月街、藏经、输给鸠摩智 =================
{
  const label = '路线一';
  step(label + ' 开始');
  const g = newGame({
    skills: { 'base.zhang': 50, 'base.zhaojia': 20, 'base.tuna': 45 },
    inner: 'base.tuna',
  });
  hook(g, label);
  ch1(g, label, {});
  ch2(g, label, { how: 'qiao' });
  ch2End(g, label, { beat: false });
  ch3(g, label, { clue: 'market' });
  ch4(g, label, { how: 'qiao', hide: true, beat: false });
  ch5(g, label, { pay: false });
  ch6(g, label, { how: 'qiao', by: 'cha' });
  ch7(g, label, { jiu: 'nei', go: true });
  ch8(g, label, { side: 'qiao' });
  ch9(g, label, { ask: 'qiao' });
  ch10(g, label, { dang: true });
}

// ================= 路线二：偷袭、旁观、硬闯门槛、客栈、不藏经、打赢鸠摩智 =================
{
  const label = '路线二';
  step(label + ' 开始');
  const g = newGame({
    skills: { 'base.zhang': 12, 'base.zhaojia': 20, 'base.tuna': 45 },
    inner: 'base.tuna',
    maxhpBoost: 40, // 气血上限够走"抬横木"那条路
  });
  hook(g, label);
  ch1(g, label, { sneak: true, watch: true });
  ch2(g, label, { how: 'hp' });
  ch2End(g, label, { beat: true }); // 打赢必败战的那条分支
  ch3(g, label, { clue: 'inn' });
  ch4(g, label, { how: 'nei', hide: false, beat: true });
  ch5(g, label, { pay: true, qin: false });
  ch6(g, label, { how: 'nei', by: 'zhi' });
  ch7(g, label, { jiu: 'shi', go: false });
  ch8(g, label, { side: 'kan' });
  ch9(g, label, { ask: 'shuo' });
  ch10(g, label, { dang: false });
}

// ================= 路线三：两处门槛都走组队那条路 =================
{
  const label = '路线三';
  step(label + ' 开始');
  const g = newGame({ skills: { 'base.zhaojia': 20, 'base.tuna': 40 }, inner: 'base.tuna', sect: 'gaibang' });
  hook(g, label);
  ch1(g, label, {});
  ch2(g, label, { how: 'party' });
  ch2End(g, label, {});
  ch3(g, label, { clue: 'market' });
  ch4(g, label, { how: 'party', hide: true });
  ch5(g, label, {});
  ch6(g, label, { how: 'party' });
  ch7(g, label, { jiu: 'kan' });
  ch8(g, label, { side: 'bang' }); // 丐帮弟子专属选项
  ch9(g, label, {});
  ch10(g, label, {});
}

// ================= 路线四：功力不够时的"现在还不行"，以及打输重来 =================
{
  const label = '路线四';
  step(label + ' 开始');
  const g = newGame({ skills: { 'base.tuna': 5 }, inner: 'base.tuna' });
  hook(g, label);
  // 第一章：在左护法这一战故意打输，人应当回到章节的 start 房间，剧情标记回滚
  ex(g, '西', label);
  pick(g, '喝住他们', label);
  pick(g, '动手', label);
  win(g, label + '/神农帮');
  pick(g, '一起去剑湖宫', label);
  ex(g, '北', label);
  pick(g, '帮无量剑', label);
  pick(g, '接下这一战', label);
  lose(g, label + '/左护法（故意打输）');
  // 按 STORY.md §8：打输回到章节 start，本章的剧情标记整章回滚到检查点。
  // start 是大理车马行（不是山道）：回检查点不重跑房间触发，人得自己走回去（D-213）
  expectRoom(g, 'dali.station', label + '（打输重来）');
  if (flag(g, 'tianlong.c1_duel')) note(`${label}：打输之后 tianlong.c1_duel 没有回滚`);
  if (flag(g, 'tianlong.met_duan')) note(`${label}：打输之后本章标记应当回滚到章节开始（met_duan 还在）`);
  if (!flag(g, 'tianlong.ch1')) note(`${label}：打输之后连 tianlong.ch1 都回滚了，会要玩家回大理重看一遍开头`);
  // 走回山道，与段誉的相遇重演一次；一次性奖励不会重发（D-042）
  ex(g, '西', label + '（重来）');
  expectRoom(g, 'tianlong.wl.road', label + '（重来）');
  pick(g, '喝住他们', label + '（重来）');
  pick(g, '动手', label + '（重来）');
  win(g, label + '/神农帮（重来）');
  pick(g, '一起去剑湖宫', label + '（重来）');
  ex(g, '北', label);
  pick(g, '帮无量剑', label);
  pick(g, '接下这一战', label);
  win(g, label + '/左护法（重来）');
  pick(g, '问问那片石壁', label);
  ex(g, '西', label);
  pick(g, '……', label);
  pick(g, '四下里看看', label);
  pick(g, '劝他收好', label);
  pick(g, '把石壁上的步法记下来', label);
  expectFlag(g, 'tianlong.ch1_done', label);
  // 第二章谷口：三条路都不满足时，应当只剩"现在还进不去"，而且能离开去练功
  g.enter('dali.center');
  pick(g, '带我去谷口', label);
  g.enter('dali.station');
  ex(g, '西北', label);
  if (has(g, '抓住藤索') || has(g, '抬起横木')) note(`${label}：功力不够，却出现了门槛选项`);
  if (!has(g, '现在还进不去')) note(`${label}：功力不够时没有"现在还进不去"这条路`);
  pick(g, '现在还进不去', label);
  pick(g, '先回去练练', label);
  ex(g, '东南', label); // 门槛对话不锁定，可以离开去练功
  expectRoom(g, 'dali.station', label + '（门槛不锁人）');
  if (flag(g, 'tianlong.wj_in')) note(`${label}：没过门槛却进了谷`);
  // 第四章门槛同理：功力不够时也要有退路（先把前面的章节标记补上）
  Object.assign(g.state.flags, { 'tianlong.ch2_done': true, 'tianlong.ch3_done': true });
  g.enter('dali.center');
  g.enter('tianlong.tl.gate');
  pick(g, '走小径', label);
  ex(g, '西', label);
  if (has(g, '踩着松枝') || has(g, '提一口气')) note(`${label}：功力不够，却出现了第四章的门槛选项`);
  if (!has(g, '现在还上不去')) note(`${label}：第四章门槛没有"现在还上不去"这条路`);
  pick(g, '现在还上不去', label);
  pick(g, '先下山去练练', label);
  ex(g, '东', label);
  expectRoom(g, 'tianlong.tl.gate', label + '（第四章门槛不锁人）');
}

// ---------------- 结果 ----------------

if (problems.length) {
  for (const p of problems) console.log('✗ ' + p);
  console.log(`\n${problems.length} 处问题`);
  process.exit(1);
}
console.log('✓ 天龙八部十章、四条路线全部走通（三处门槛三选一、各处分支、必败战的输赢、打输重来）');
