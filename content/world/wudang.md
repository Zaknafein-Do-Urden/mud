# 武当（武当山，襄阳以西）。侧重：守、巧。门派规则见 docs/SECT.md。

=== sect: wudang
name: 武当
ranks: 记名弟子=0, 入门弟子=100, 三代弟子=250, 二代弟子=450, 真武护法=700
caps: 40, 70, 100, 140, 180
examiner: 明月
---
道家名门，供奉真武大帝。武当武学讲究以柔克刚、以静制动、后发先至。

=== skill: wudang.chunyang
name: 纯阳无极功
kind: 内功
sect: wudang
rank: 0
hp: 8
mp: 10
affinity: 守
---
武当根本心法，内息绵长，生生不息。

=== skill: wudang.taiji
name: 太极拳
kind: 外功
stance: 守
sect: wudang
rank: 0
---
以柔克刚、四两拨千斤的拳法，圆转如意，专能化解来招。

=== move: wudang.taiji.1
skill: wudang.taiji
name: 揽雀尾
level: 0
power: 18
mp: 5
omen: $N双手虚抱，如抱圆球，周身松沉……
---
$N双手划弧，摆出「$招」的架势，周身如裹在一团棉絮之中。

=== move: wudang.taiji.2
skill: wudang.taiji
name: 云手
level: 25
power: 30
mp: 9
effects: 缴械:25
omen: $N双臂缓缓画圈，如行云流水，不见首尾……
---
$N双手如云般连绵转动，「$招」一出，任何来劲都被带得偏了方向。

=== move: wudang.taiji.3
skill: wudang.taiji
name: 进步搬拦捶
level: 0
power: 16
mp: 8
stance: 刚
omen: $N左掌虚拦，右拳收在腰际，脚下向前斜进了一步……
---
$N进步上前，左手一搬一拦，「$招」右拳顺势直捣$n$部位！

=== skill: wudang.mianzhang
name: 绵掌
kind: 外功
stance: 巧
sect: wudang
rank: 0
---
武当入门掌法，掌力柔和，劲藏于内，中掌者往往过后才觉疼痛。

=== move: wudang.mianzhang.1
skill: wudang.mianzhang
name: 春风拂柳
level: 0
power: 17
mp: 7
omen: $N手掌轻扬，似有若无……
---
$N手掌轻飘飘地一拂，正是「$招」，掌缘贴着$n$部位擦过。

=== move: wudang.mianzhang.2
skill: wudang.mianzhang
name: 绵里藏针
level: 20
power: 22
mp: 10
effects: 点穴
omen: $N掌心向下，指尖微微翘起……
---
$N掌势绵软，「$招」，掌底却暗藏一缕指力，直透$n$部位的穴道！

=== skill: wudang.rouyun
weapon: 剑
name: 柔云剑法
kind: 外功
stance: 巧
sect: wudang
rank: 1
---
武当剑法，剑势如云卷云舒，飘逸灵动。

=== move: wudang.rouyun.1
skill: wudang.rouyun
name: 白云出岫
level: 0
power: 21
mp: 9
omen: $N剑尖斜指地面，身形微侧……
---
$N长剑一挑，「$招」，剑光如一缕白云从山谷中飘出，点向$n$部位！

=== move: wudang.rouyun.2
skill: wudang.rouyun
name: 云横秦岭
level: 30
power: 29
mp: 14
effects: 破绽, 群攻
omen: $N长剑平举，剑身轻颤……
---
$N剑势一横，「$招」剑光铺开如云海，$n的守势顿时被撕开一道口子！

=== skill: wudang.zhenshan
name: 震山掌
kind: 外功
stance: 刚
sect: wudang
rank: 2
---
武当少有的刚猛掌法，以纯阳内力催动，掌力浑厚。

=== move: wudang.zhenshan.1
skill: wudang.zhenshan
name: 震山撼岳
level: 0
power: 30
mp: 16
omen: $N深吸一口长气，双掌缓缓提起……
---
$N双掌齐推，「$招」，掌力如山崩一般涌向$n！

=== move: wudang.zhenshan.2
skill: wudang.zhenshan
name: 排山倒海
level: 25
power: 38
mp: 20
effects: 破绽
omen: $N双掌一前一后，脚下一步一沉，青石板上留下浅浅的脚印……
---
$N双掌连环推出，「$招」，掌力一浪高过一浪，压得$n站不住脚！

=== move: wudang.zhenshan.3
skill: wudang.zhenshan
name: 真武荡魔
level: 50
power: 46
mp: 25
effects: 内伤
omen: $N须发微扬，周身隐隐有纯阳之气蒸腾……
---
$N纯阳内力尽数贯于掌上，「$招」，一掌拍向$n，声如闷雷！

=== skill: wudang.tiyun
name: 梯云纵
kind: 轻功
sect: wudang
rank: 1
---
武当轻功，左脚踏右脚背，借力上纵，如踏云梯。

=== skill: wudang.taijijian
weapon: 剑
name: 太极剑
kind: 外功
stance: 巧
sect: wudang
rank: 4
---
武当镇派剑法，剑招圆转，以意驭剑，以慢打快。

=== move: wudang.taijijian.1
skill: wudang.taijijian
name: 三环套月
level: 0
power: 40
mp: 22
effects: 破绽
omen: $N剑尖画了三个圆圈，一圈套着一圈……
---
$N长剑连画三个圆圈，「$招」，三道剑圈一齐套向$n，叫人避无可避！

=== move: wudang.taijijian.2
skill: wudang.taijijian
name: 大魁星
level: 30
power: 48
mp: 28
effects: 点穴, 破绽
omen: $N单足独立，长剑高举过顶……
---
$N单足独立如魁星点斗，「$招」剑尖一点，已到$n$部位！

# ---------------- 地点 ----------------

=== patch: xiangyang.station
exits: 西=wudang.gate
---
往西的山路通向武当山。

=== room: wudang.gate
name: 武当山·玄岳门
exits: 东=xiangyang.station, 北=wudang.hall, 西=wudang.forest
# 门派大门兼作旅店：休息、修炼、战败后回到这里、组队（D-046）
inn: true
restmsg: 你在玄岳门旁的道观里借宿一夜，山间清气入肺，神清气爽。
---
一座石牌坊立在山脚，上书"治世玄岳"四个大字。山道蜿蜒向上，隐没在云雾里。

=== room: wudang.hall
name: 武当山·紫霄宫
exits: 南=wudang.gate
npcs: wudang.qingxu, wudang.sparring
train: true
---
宫观依山而建，红墙绿瓦。殿前的广场上，一群道童正在练太极拳，动作缓慢如在水中。

=== room: wudang.forest
name: 武当山·密林
exits: 东=wudang.gate
npcs: wudang.npc.bandit, wudang.npc.spy
---
古木参天，林间雾气弥漫，偶尔传来几声猿啼。

# ---------------- 人物与差事 ----------------

=== npc: wudang.qingxu
name: 清虚道长
brief: 武当紫霄宫的道长，负责传授弟子武艺。
teaches: wudang
talk: wudang.qingxu.talk
---
一位清瘦的道长，长须垂胸，目光温和，说话不疾不徐。

=== dialog: wudang.qingxu.talk
---
?sect:none 清虚道长：无量天尊。{男:小友|女:姑娘}上山，所为何事？
?sect:wudang 清虚道长：练功要松，心要静。要学功夫只管开口，要晋阶说“晋阶”，得先和明月过过手。
?!sect:none ?!sect:wudang 清虚道长：道友已有师承，贫道不便收录。
* 弟子想拜入武当 -> wudang.qingxu.join ?sect:none
* 请师父传授武功 -> world.sect.teach ?sect:wudang
* 山上可有差事？ -> wudang.qingxu.task ?sect:wudang
* 告辞

=== dialog: wudang.qingxu.join
---
清虚道长：武当门规不多，只有一条：不可恃技欺人。习武是为了修身，不是为了争强斗狠。
* 弟子记住了 -> wudang.qingxu.joined !join:wudang
* 容我再想想

=== dialog: wudang.qingxu.joined
do: give:w.songwen
---
清虚道长点点头，递给你一件青色道袍，又把一柄松纹古剑放在你手里。
清虚道长：{姓名}，从今往后你便是武当记名弟子。先学太极拳、绵掌和纯阳无极功吧。
* 请师父传授武功 -> world.sect.teach

=== dialog: wudang.qingxu.task
ifnone: 清虚道长：今天的差事都办完了，目前没有门派任务。明日再来吧。
---
* 山下可有不太平的事？ -> wudang.task.bandit ?!flag:world.wudang.task_bandit ?!today:world.wudang.task_bandit
* 附近可有人滋事？ -> wudang.task.b2 ?!flag:world.wudang.task_b2 ?!today:world.wudang.task_b2
* 要不要去西边密林巡视？ -> wudang.task.patrol ?!flag:world.wudang.task_patrol ?!today:world.wudang.task_patrol
* 可有书信要送去襄阳？ -> wudang.task.deliver ?!flag:world.wudang.task_deliver ?!today:world.wudang.task_deliver
* 可有更难的差事？ -> wudang.task.spy ?rank:1 ?!flag:world.wudang.task_spy ?!today:world.wudang.task_spy
* 可有最难办的差事？ -> wudang.task.b3 ?rank:2 ?!flag:world.wudang.task_b3 ?!today:world.wudang.task_b3
* 告辞

=== dialog: wudang.task.bandit
do: flag:world.wudang.task_bandit
---
清虚道长：西边密林里来了几个强人，拦截上山进香的香客。去劝他们离开，劝不听就让他们吃点苦头。
（门派任务：赶走密林里的强人）

=== dialog: wudang.task.spy
do: flag:world.wudang.task_spy
---
清虚道长：有人在林中鬼鬼祟祟，窥探本门练功，来历不明。去把他拿下，问个清楚。
（门派任务：拿下密林里的探子）

=== enemy: wudang.foe.bandit
weapon: 刀
weaponName: 朴刀
name: 剪径强人
attrs: 根骨=14, 身法=13, 悟性=8
skills: base.quan=8, base.zhang=5, base.zhaojia=5
ai: 刚=3, 巧=1, 守=1
potential: 20
hpx: 0.65
---
手持朴刀的强人，脸上横着一道疤。

=== npc: wudang.npc.bandit
name: 剪径强人
brief: 在武当山下拦截香客的强人。
if: flag:world.wudang.task_bandit
talk: wudang.bandit.talk
---
两个持刀的汉子堵在山道上，脚下扔着几个香客的包袱。

=== dialog: wudang.bandit.talk
---
强人：此山是我开！想过去，留下买路钱！
* 武当山下，岂容你们放肆 !fight:world.b.wudang_bandit
* 走开

=== battle: world.b.wudang_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.49
enemies: wudang.foe.bandit, wudang.foe.bandit
win: wudang.bandit.win
---
两个强人举刀扑了上来。

=== dialog: wudang.bandit.win
do: unflag:world.wudang.task_bandit rep:wudang:30 today:world.wudang.task_bandit
---
两个强人捂着手腕，灰溜溜地下山去了。（门派任务完成）

=== enemy: wudang.foe.spy
weapon: 拳
name: 黑衣探子
attrs: 根骨=16, 身法=22, 悟性=16
skills: base.zhang=20, base.quan=16, base.zhaojia=14, base.tuna=18
ai: 巧=3, 刚=1, 守=1
cunning: 35
potential: 60
# 藏招：15% 的回合不露预兆，靠悟性、慧眼看穿
obscure: 15
---
一个蒙面的黑衣人，腰间挂着一块铁牌。

=== npc: wudang.npc.spy
name: 黑衣探子
brief: 在武当山窥探的神秘人。
if: flag:world.wudang.task_spy
talk: wudang.spy.talk
---
一个黑衣人伏在树后，正盯着紫霄宫的方向。

=== dialog: wudang.spy.talk
---
黑衣人一惊，转身就是一掌。
* 接招 !fight:world.b.wudang_spy
* 退开

=== battle: world.b.wudang_spy
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 2.08
enemies: wudang.foe.spy
win: wudang.spy.win
---
黑衣人一言不发，掌风已到面前。

=== dialog: wudang.spy.win
do: unflag:world.wudang.task_spy rep:wudang:60 today:world.wudang.task_spy
---
黑衣人负伤逃走，慌乱中掉下了那块铁牌。你捡起来带回山上交给清虚道长。（门派任务完成）

# ---------------- 任务清单（D-045）----------------

=== quest: world.q.wudang_1
name: 武当：赶走强人
flag: world.wudang.task_bandit
where: wudang.forest
---
清虚道长的吩咐：密林里有强人拦截香客。

=== quest: world.q.wudang_2
name: 武当：拿下探子
flag: world.wudang.task_spy
where: wudang.forest
---
清虚道长的吩咐：密林里有人窥探本门练功。

# ---------------- 陪练（随时可以切磋，打输也无妨；D-049）----------------

=== npc: wudang.sparring
name: 小道童
brief: 本门的陪练，可以随时切磋练功。
talk: wudang.sparring.talk
---
一个十来岁的道童，正一板一眼地练着太极拳。

=== dialog: wudang.sparring.talk
---
小道童：师兄师姐，陪我推推手吧？
* 好，切磋几招 !fight:world.b.wudang_spar
* 下次吧

=== enemy: world.foe.wudang_spar
weapon: 拳
name: 小道童
attrs: 根骨=12, 身法=16, 悟性=12
skills: wudang.taiji=6, wudang.mianzhang=6, base.tuna=5
ai: 守=2, 巧=2
cunning: 10
potential: 12
hpx: 0.7
---
一个十来岁的道童，正一板一眼地练着太极拳。

=== battle: world.b.wudang_spar
enemies: world.foe.wudang_spar
# 陪练是固定的标尺，不按玩家强弱浮动（D-115）
adapt: false
---
小道童摆开了架势。

# ================= 新增门派任务（D-054）：每天每个任务各做一次 =================

# ---- 巡视（走到地方就算完成）----
=== dialog: wudang.task.patrol
do: flag:world.wudang.task_patrol
---
清虚道长：去西边密林里巡视一遍，看看有没有人偷伐林木。
（门派任务：巡视西边密林）

=== trigger: world.t.wudang_patrol
room: wudang.forest
if: flag:world.wudang.task_patrol
do: unflag:world.wudang.task_patrol today:world.wudang.task_patrol rep:wudang:30 potential:10
---
林中鸟鸣啾啾，树木都好好的。你在一棵老松下歇了口气，便往回走。（门派任务完成）

# ---- 送信（走到对方衙门就算完成）----
=== dialog: wudang.task.deliver
do: flag:world.wudang.task_deliver
---
清虚道长：这封信是给襄阳衙门王捕头的，山上新收的几个弟子要去城里落户，得托他照应。
（门派任务：把书信送到襄阳衙门，交给王捕头）

=== trigger: world.t.wudang_deliver
room: xiangyang.office
if: flag:world.wudang.task_deliver
do: unflag:world.wudang.task_deliver today:world.wudang.task_deliver rep:wudang:30 potential:10
---
你把书信交给了王捕头。王捕头看了一眼封皮，郑重地收了起来。（门派任务完成）

# ---- 一阶：恶霸樵夫 ----
=== dialog: wudang.task.b2
do: flag:world.wudang.task_b2
---
清虚道长：玄岳门外有个恶霸樵夫，强砍山上的古树，还打伤了劝阻的道童。
（门派任务：教训恶霸樵夫）

=== enemy: world.foe.wudang_b2
weapon: 刀
weaponName: 斧头
name: 恶霸樵夫
attrs: 根骨=12, 身法=13, 悟性=8
skills: base.quan=9, base.zhaojia=7
ai: 刚=3, 守=1
potential: 20
---
一个满脸横肉的樵夫，扛着一把大斧头，说山上的树都是他家的。

=== npc: world.npc.wudang_b2
name: 恶霸樵夫
brief: 在附近滋事的恶霸樵夫。
if: flag:world.wudang.task_b2
talk: world.wudang_b2.talk
---
一个满脸横肉的樵夫，扛着一把大斧头，说山上的树都是他家的。

=== dialog: world.wudang_b2.talk
---
恶霸樵夫：看什么看？
* 动手 !fight:world.b.wudang_b2
* 走开

=== battle: world.b.wudang_b2
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.27
enemies: world.foe.wudang_b2, world.foe.wudang_b2
win: world.wudang_b2.win
---
恶霸樵夫和同伙骂骂咧咧地扑了上来。

=== dialog: world.wudang_b2.win
do: unflag:world.wudang.task_b2 today:world.wudang.task_b2 rep:wudang:30
---
恶霸樵夫灰头土脸地走了。（门派任务完成）

=== patch: wudang.gate
npcs: world.npc.wudang_b2

# ---- 二阶：西域番僧 ----
=== dialog: wudang.task.b3
do: flag:world.wudang.task_b3
---
清虚道长：有个西域番僧上山挑衅，说要领教武当的太极。他掌上有毒，不可轻敌。
（门派任务：击败西域番僧）

=== enemy: world.foe.wudang_b3
weapon: 拳
name: 西域番僧
attrs: 根骨=18, 身法=18, 悟性=16
skills: base.quan=38, base.zhang=40, base.zhaojia=36, base.tuna=40
ai: 巧=2, 刚=2, 守=1
cunning: 30
# 藏招：25% 的回合不露预兆
obscure: 25
potential: 90
---
一个高鼻深目的番僧，赤着双臂，掌心隐隐发黑。

=== npc: world.npc.wudang_b3
name: 西域番僧
brief: 本门的强敌。
if: flag:world.wudang.task_b3
talk: world.wudang_b3.talk
---
一个高鼻深目的番僧，赤着双臂，掌心隐隐发黑。

=== dialog: world.wudang_b3.talk
---
西域番僧冷冷地看着你：“就凭你？”
* 请赐教 !fight:world.b.wudang_b3
* 退开

=== battle: world.b.wudang_b3
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 2.11
enemies: world.foe.wudang_b3
win: world.wudang_b3.win
---
西域番僧一言不发，出手便是杀招。

=== dialog: world.wudang_b3.win
do: unflag:world.wudang.task_b3 today:world.wudang.task_b3 rep:wudang:90
---
西域番僧败退而去。这一战传回门中，同门都对你刮目相看。（门派任务完成）

=== patch: wudang.forest
npcs: world.npc.wudang_b3

# ---- 任务清单 ----
=== quest: world.q.wudang_patrol
name: 清虚道长的差遣：巡视西边密林
flag: world.wudang.task_patrol
where: wudang.forest
---
去西边密林里巡视一遍，看看有没有人偷伐林木。

=== quest: world.q.wudang_deliver
name: 清虚道长的差遣：送信到襄阳
flag: world.wudang.task_deliver
where: xiangyang.office
---
这封信是给襄阳衙门王捕头的，山上新收的几个弟子要去城里落户，得托他照应。

=== quest: world.q.wudang_b2
name: 清虚道长的差遣：教训恶霸樵夫
flag: world.wudang.task_b2
where: wudang.gate
---
玄岳门外有个恶霸樵夫，强砍山上的古树，还打伤了劝阻的道童。

=== quest: world.q.wudang_b3
name: 清虚道长的差遣：击败西域番僧
flag: world.wudang.task_b3
where: wudang.forest
---
有个西域番僧上山挑衅，说要领教武当的太极。他掌上有毒，不可轻敌。

# ================= 辅助武功（D-064）：给队友疗伤、加持，鼓励组队 =================
# 守类招式。默认作用在自己身上；组队时在战斗面板选一位队友作为目标。

=== skill: wudang.daoyin
name: 太极导引
kind: 外功
stance: 守
sect: wudang
rank: 3
---
武当以太极之理调和气血的导引术，可为同伴疏通经脉、疗伤回气。

=== move: wudang.daoyin.1
skill: wudang.daoyin
name: 导引归元
level: 0
power: 18
mp: 7
support: true
effects: 疗伤:1.4
omen: $N退开半步，气息一沉……
---
$N双手虚按$n的肩井，以太极圆转之劲为其导气归元。

=== move: wudang.daoyin.2
skill: wudang.daoyin
name: 阴阳调和
level: 30
power: 24
mp: 11
support: true
effects: 回气:0.8, 解穴
omen: $N退开半步，气息一沉……
---
$N掌心一阴一阳，在$n周身大穴上轻轻拂过，被封的经脉豁然贯通。
