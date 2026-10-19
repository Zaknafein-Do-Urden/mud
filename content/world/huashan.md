# 华山（西岳华山，长安以东）。侧重：巧（剑法）。门派规则见 docs/SECT.md。

=== sect: huashan
name: 华山
ranks: 外门弟子=0, 入门弟子=150, 亲传弟子=500, 华山剑客=1200, 华山长老=2500
caps: 40, 70, 100, 140, 180
examiner: 梁师兄
---
五岳剑派之一，以剑法闻名天下。华山奇险，门下弟子剑走轻灵，出手迅捷。

=== skill: huashan.xinfa
name: 华山心法
kind: 内功
sect: huashan
rank: 0
hp: 7
mp: 10
affinity: 巧
---
华山入门内功，内息轻灵，与本门剑法相辅相成。

=== skill: huashan.jianfa
weapon: 剑
name: 华山剑法
kind: 外功
stance: 巧
sect: huashan
rank: 0
---
华山派入门剑法，招式清奇，出剑迅捷。

=== move: huashan.jianfa.1
skill: huashan.jianfa
name: 苍松迎客
level: 0
power: 12
mp: 8
omen: $N长剑斜指，剑身微微晃动，如松枝迎风……
---
$N长剑一摆，「$招」，剑尖带着嗤嗤风声刺向$n$部位！

=== move: huashan.jianfa.2
skill: huashan.jianfa
name: 有凤来仪
level: 20
power: 16
mp: 11
effects: 破绽
omen: $N足尖点地，身子轻轻一旋，剑光闪烁……
---
$N身形一转，「$招」剑势连绵，五点寒星罩向$n周身！

=== move: huashan.jianfa.3
skill: huashan.jianfa
name: 金雁横空
level: 40
power: 21
mp: 15
effects: 点穴, 群攻
omen: $N纵身而起，长剑在空中划出一道弧光……
---
$N凌空一剑，「$招」，剑光如大雁横过长空，剑尖点向$n$部位的大穴！

=== skill: huashan.hunyuan
name: 混元掌
kind: 外功
stance: 守
sect: huashan
rank: 0
---
华山掌法，以浑厚掌力护住周身，攻守兼备。

=== move: huashan.hunyuan.1
skill: huashan.hunyuan
name: 混元一气
level: 0
power: 17
mp: 5
omen: $N双掌一合一分，掌心相对，似抱着一团气……
---
$N双掌一圈，以「$招」封住周身门户。

=== move: huashan.hunyuan.2
skill: huashan.hunyuan
name: 抱元守一
level: 25
power: 27
mp: 9
omen: $N双掌缓缓收于胸前，神色凝重……
---
$N双掌抱元，「$招」掌力浑然一体，滴水不漏。

=== move: huashan.hunyuan.3
skill: huashan.hunyuan
name: 混元劈空
level: 0
power: 16
mp: 8
stance: 刚
omen: $N右掌高高扬起，掌缘绷得笔直……
---
$N一声清啸，「$招」一掌劈落，掌风呼的一声直压$n$部位！

=== skill: huashan.poyu
name: 破玉拳
kind: 外功
stance: 刚
sect: huashan
rank: 2
---
华山的拳法，拳力集中一点，专破对手的护体功夫。

=== move: huashan.poyu.1
skill: huashan.poyu
name: 开山裂石
level: 0
power: 27
mp: 13
omen: $N握拳收肘，指节捏得咯咯作响……
---
$N一拳击出，「$招」，拳风凝成一线，直捣$n$部位！

=== move: huashan.poyu.2
skill: huashan.poyu
name: 玉碎昆冈
level: 30
power: 38
mp: 21
effects: 内伤
omen: $N沉腰坐马，拳头上青筋暴起……
---
$N全身劲力凝于一拳，「$招」，拳到之处，宁为玉碎！

=== move: huashan.poyu.3
skill: huashan.poyu
name: 石破天惊
level: 50
power: 47
mp: 26
effects: 破绽, 内伤
omen: $N双拳收在肋下，一口气越提越足，地上尘土微微扬起……
---
$N双拳并出，「$招」，拳风未到，$n已觉胸口一窒！

=== skill: huashan.lingyun
name: 凌云步
kind: 轻功
sect: huashan
rank: 1
---
华山弟子在险峰绝壁间练就的步法，轻灵迅捷。

=== skill: huashan.dugu
weapon: 剑
name: 独孤九剑
kind: 外功
stance: 巧
sect: huashan
rank: 4
---
传说中的无上剑法，无招胜有招。只破不守，见招破招。

=== move: huashan.dugu.1
skill: huashan.dugu
name: 破剑式
level: 0
power: 48
mp: 24
effects: 破绽, 缴械:40
omen: $N长剑随意垂着，整个人却像一张拉满的弓……
---
$N看准$n招式中的破绽，「$招」一剑刺出，正是对方不得不救之处！

=== move: huashan.dugu.2
skill: huashan.dugu
name: 破气式
level: 30
power: 54
mp: 28
effects: 化内:1.0
omen: $N闭目凝神，剑尖遥遥指着对方丹田……
---
$N一剑如电，「$招」，剑气直透$n丹田，$n只觉内力如泄堤之水！

# ---------------- 地点 ----------------

=== patch: changan.station
exits: 东=huashan.gate
---
往东的官道通向西岳华山。

=== room: huashan.gate
name: 华山·玉泉院
exits: 西=changan.station, 北=huashan.hall, 东=huashan.cliff
# 门派大门兼作旅店：休息、修炼、战败后回到这里、组队（D-046）
inn: true
restmsg: 你在玉泉院的厢房里睡了一觉，泉声叮咚，醒来神清气爽。
---
华山脚下的道观，泉水叮咚。抬头望去，千仞绝壁直插云霄。

=== room: huashan.hall
name: 华山·正气堂
exits: 南=huashan.gate
npcs: huashan.mu, huashan.sparring
train: true
---
正气堂建在山腰的平台上，堂前一块空地，十几个弟子正在对练剑法，剑光闪闪。

=== room: huashan.cliff
name: 华山·苍龙岭
exits: 西=huashan.gate
npcs: huashan.npc.bandit, huashan.npc.spy
---
一道窄窄的山脊，两侧都是万丈深渊。山风呼啸，叫人站立不稳。

# ---------------- 人物与差事 ----------------

=== npc: huashan.mu
name: 穆清风
brief: 华山派的长老，负责传授弟子剑法。
teaches: huashan
talk: huashan.mu.talk
---
一个五十来岁的剑客，身材瘦削，背上一柄古剑，眼神锐利如鹰。

=== dialog: huashan.mu.talk
---
?sect:none 穆清风：上华山的人，不是来看风景的，就是来学剑的。你是哪一种？
?sect:huashan 穆清风：剑要快，心要正。要学剑只管开口，要晋阶说“晋阶”，先胜过你梁师兄再说。
?!sect:none ?!sect:huashan 穆清风：你已有师门，华山不收二心之人。
* 弟子想学华山剑法 -> huashan.mu.join ?sect:none
* 请师父传授武功 -> world.sect.teach ?sect:huashan
* 师父可有差遣？ -> huashan.mu.task ?sect:huashan
* 告辞

=== dialog: huashan.mu.join
---
穆清风：华山门规：尊师重道，不得滥杀，不得勾结奸邪。犯了门规，我亲手清理门户。
* 弟子谨记 -> huashan.mu.joined !join:huashan
* 让我再想想

=== dialog: huashan.mu.joined
do: give:w.mujian
---
穆清风点点头，扔给你一柄木剑。
穆清风：{姓名}，先从华山剑法、混元掌和华山心法练起。剑法不在多，在于精。
* 请师父传授武功 -> world.sect.teach

=== dialog: huashan.mu.task
ifnone: 穆清风：今天的差事都办完了，目前没有门派任务。明日再来吧。
---
* 山上可有贼人？ -> huashan.task.bandit ?pick:sect.huashan:bandit ?!flag:world.huashan.task_bandit ?!today:world.huashan.task_bandit
* 附近可有人滋事？ -> huashan.task.b2 ?pick:sect.huashan:b2 ?!flag:world.huashan.task_b2 ?!today:world.huashan.task_b2
* 要不要去苍龙岭巡视？ -> huashan.task.patrol ?pick:sect.huashan:patrol ?!flag:world.huashan.task_patrol ?!today:world.huashan.task_patrol
* 可有书信要送去长安？ -> huashan.task.deliver ?pick:sect.huashan:deliver ?!flag:world.huashan.task_deliver ?!today:world.huashan.task_deliver
* 可有更难的差事？ -> huashan.task.spy ?rank:1 ?pick:sect.huashan:spy ?!flag:world.huashan.task_spy ?!today:world.huashan.task_spy
* 可有最难办的差事？ -> huashan.task.b3 ?rank:2 ?pick:sect.huashan:b3 ?!flag:world.huashan.task_b3 ?!today:world.huashan.task_b3
* 山上可要采药？ -> huashan.task.herb ?pick:sect.huashan:herb ?!flag:world.huashan.task_herb ?!today:world.huashan.task_herb
* 可有人要接？ -> huashan.task.visit ?pick:sect.huashan:visit ?!flag:world.huashan.task_visit ?!today:world.huashan.task_visit
* 派里可缺什么东西？ -> huashan.task.buy ?pick:sect.huashan:buy ?!flag:world.huashan.task_buy ?!today:world.huashan.task_buy
* 可有师妹要下山？ -> huashan.task.escort ?pick:sect.huashan:escort ?!flag:world.huashan.task_escort ?!today:world.huashan.task_escort
* 山下可有人挑衅？ -> huashan.task.rival ?pick:sect.huashan:rival ?!flag:world.huashan.task_rival ?!today:world.huashan.task_rival
* 可有棘手的差事？ -> huashan.task.hunt ?pick:sect.huashan:hunt ?rank:1 ?!flag:world.huashan.task_hunt ?!today:world.huashan.task_hunt
* 师门缺什么材料？ -> huashan.task.material_ask ?!cargo:herbs:100 ?!today:world.huashan.task_material
* 交上药材 100 件 -> huashan.task.material ?cargo:herbs:100 ?!today:world.huashan.task_material
* 告辞

=== dialog: huashan.task.bandit
do: flag:world.huashan.task_bandit
---
穆清风：苍龙岭上有几个毛贼，专抢上山的游客。去把他们打下山去。
（门派任务：赶走苍龙岭的毛贼）

=== dialog: huashan.task.spy
do: flag:world.huashan.task_spy
---
穆清风：有个别派的剑客在苍龙岭上叫阵，说华山剑法徒有虚名。去让他见识见识。
（门派任务：击败苍龙岭上叫阵的剑客）

=== enemy: huashan.foe.bandit
weapon: 匕首
weaponName: 短刀
name: 苍龙岭毛贼
attrs: 根骨=13, 身法=15, 悟性=8
skills: base.quan=8, base.zhang=7, base.zhaojia=5
ai: 刚=2, 巧=2, 守=1
potential: 20
hpx: 0.7
---
两个衣衫破烂的毛贼，手里拿着短刀。

=== npc: huashan.npc.bandit
name: 苍龙岭毛贼
brief: 在苍龙岭抢劫游客的毛贼。
if: flag:world.huashan.task_bandit
talk: huashan.bandit.talk
---
两个毛贼守在山脊最窄处，正在搜一个游客的身。

=== dialog: huashan.bandit.talk
---
毛贼：华山派的？少管闲事！
* 动手 !fight:world.b.huashan_bandit
* 走开

=== battle: world.b.huashan_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.39
enemies: huashan.foe.bandit, huashan.foe.bandit
win: huashan.bandit.win
---
两个毛贼拔出短刀，在窄窄的山脊上向你逼来。

=== dialog: huashan.bandit.win
do: unflag:world.huashan.task_bandit rep:huashan:30 today:world.huashan.task_bandit
---
两个毛贼连滚带爬地逃下山去。（门派任务完成）

=== enemy: huashan.foe.swordsman
weapon: 剑
name: 叫阵剑客
attrs: 根骨=16, 身法=20, 悟性=16
skills: base.zhang=20, base.quan=18, base.zhaojia=16, base.tuna=18
ai: 巧=2, 刚=2, 守=1
cunning: 30
potential: 60
# 藏招：15% 的回合不露预兆，靠悟性、慧眼看穿
obscure: 15
---
一个锦衣剑客，神色倨傲，腰间长剑的剑鞘上镶着宝石。

=== npc: huashan.npc.spy
name: 叫阵剑客
brief: 在苍龙岭叫阵的别派剑客。
if: flag:world.huashan.task_spy
talk: huashan.spy.talk
---
一个锦衣剑客负手站在山脊上，冷笑着看着你。

=== dialog: huashan.spy.talk
---
剑客：华山派就派你来？也好，让我看看华山剑法有几斤几两。
* 请赐教 !fight:world.b.huashan_spy
* 走开

=== battle: world.b.huashan_spy
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.87
enemies: huashan.foe.swordsman
win: huashan.spy.win
---
剑客长剑出鞘，剑光如水。

=== dialog: huashan.spy.win
do: unflag:world.huashan.task_spy rep:huashan:60 today:world.huashan.task_spy
---
剑客的长剑被你震脱了手，他脸色铁青，拾起剑一言不发地下山去了。（门派任务完成）

# ---------------- 任务清单（D-045）----------------

=== quest: world.q.huashan_1
name: 华山：赶走毛贼
flag: world.huashan.task_bandit
where: huashan.cliff
---
穆清风的吩咐：苍龙岭上有毛贼抢劫游客。

=== quest: world.q.huashan_2
name: 华山：击败叫阵剑客
flag: world.huashan.task_spy
where: huashan.cliff
---
穆清风的吩咐：有别派剑客在苍龙岭叫阵。

# ---------------- 陪练（随时可以切磋，打输也无妨；D-049）----------------

=== npc: huashan.sparring
name: 陪练弟子
brief: 本门的陪练，可以随时切磋练功。
talk: huashan.sparring.talk
---
一个刚入门的华山弟子，手里握着木剑，跃跃欲试。

=== dialog: huashan.sparring.talk
---
陪练弟子：来过两招？用木剑，伤不着人。
* 好，切磋几招 !fight:world.b.huashan_spar
* 下次吧

=== enemy: world.foe.huashan_spar
weapon: 剑
weaponName: 木剑
name: 陪练弟子
attrs: 根骨=12, 身法=16, 悟性=12
skills: huashan.jianfa=6, huashan.hunyuan=6, base.tuna=5
ai: 巧=3, 守=1
cunning: 10
potential: 12
hpx: 0.7
weaponBonus: 62
---
一个刚入门的华山弟子，手里握着木剑，跃跃欲试。

=== battle: world.b.huashan_spar
enemies: world.foe.huashan_spar
# 陪练是固定的标尺，不按玩家强弱浮动（D-115）
adapt: false
---
陪练弟子摆开了架势。

# ================= 新增门派任务（D-054）：每天每个任务各做一次 =================

# ---- 巡视（走到地方就算完成）----
=== dialog: huashan.task.patrol
do: flag:world.huashan.task_patrol
---
穆清风：去苍龙岭巡一遍，看看山道上的铁链是否牢靠。
（门派任务：巡视苍龙岭）

=== trigger: world.t.huashan_patrol
room: huashan.cliff
if: flag:world.huashan.task_patrol
do: unflag:world.huashan.task_patrol today:world.huashan.task_patrol rep:huashan:30 potential:10
---
你一手扶着铁链，一步步走过苍龙岭，铁链都还结实。山风吹得你衣袂翻飞。（门派任务完成）

# ---- 送信（走到对方衙门就算完成）----
=== dialog: huashan.task.deliver
do: flag:world.huashan.task_deliver
---
穆清风：这封信交给长安衙门的赵捕快，华山下几个村子遭了狼，请官府派人帮忙。
（门派任务：把书信送到长安衙门，交给赵捕快）

=== trigger: world.t.huashan_deliver
room: changan.office
if: flag:world.huashan.task_deliver
do: unflag:world.huashan.task_deliver today:world.huashan.task_deliver rep:huashan:30 potential:10
---
你把书信交给了赵捕快。赵捕快看了一眼封皮，郑重地收了起来。（门派任务完成）

# ---- 一阶：药贩 ----
=== dialog: huashan.task.b2
do: flag:world.huashan.task_b2
---
穆清风：玉泉院外有人偷挖山上的灵芝，去把东西追回来。
（门派任务：教训药贩）

=== enemy: world.foe.huashan_b2
weapon: 棍
weaponName: 药锄
name: 药贩
attrs: 根骨=12, 身法=13, 悟性=8
skills: base.quan=9, base.zhang=8, base.zhaojia=7
ai: 刚=2, 巧=2, 守=1
potential: 20
---
一个背着药篓的汉子，偷挖了山上的珍稀草药，被发现了还想动手。

=== npc: world.npc.huashan_b2
name: 药贩
brief: 在附近滋事的药贩。
if: flag:world.huashan.task_b2
talk: world.huashan_b2.talk
---
一个背着药篓的汉子，偷挖了山上的珍稀草药，被发现了还想动手。

=== dialog: world.huashan_b2.talk
---
药贩：看什么看？
* 动手 !fight:world.b.huashan_b2
* 走开

=== battle: world.b.huashan_b2
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 0.98
enemies: world.foe.huashan_b2, world.foe.huashan_b2
win: world.huashan_b2.win
---
药贩和同伙骂骂咧咧地扑了上来。

=== dialog: world.huashan_b2.win
do: unflag:world.huashan.task_b2 today:world.huashan.task_b2 rep:huashan:30
---
药贩灰头土脸地走了。（门派任务完成）

=== patch: huashan.gate
npcs: world.npc.huashan_b2

# ---- 二阶：嵩山派高手 ----
=== dialog: huashan.task.b3
do: flag:world.huashan.task_b3
---
穆清风：嵩山派派了个高手来，说要"指点"华山剑法。去让他知道华山剑法的厉害。
（门派任务：击败嵩山派高手）

=== enemy: world.foe.huashan_b3
weapon: 剑
name: 嵩山派高手
attrs: 根骨=18, 身法=18, 悟性=16
skills: huashan.jianfa=40, base.quan=36, base.zhaojia=38, base.tuna=40
ai: 巧=2, 刚=2, 守=1
cunning: 30
# 藏招：20% 的回合不露预兆
obscure: 20
potential: 90
weaponBonus: 53
---
一个中年剑客，剑法沉稳老辣，自称是嵩山派门下。

=== npc: world.npc.huashan_b3
name: 嵩山派高手
brief: 本门的强敌。
if: flag:world.huashan.task_b3
talk: world.huashan_b3.talk
---
一个中年剑客，剑法沉稳老辣，自称是嵩山派门下。

=== dialog: world.huashan_b3.talk
---
嵩山派高手冷冷地看着你：“就凭你？”
* 请赐教 !fight:world.b.huashan_b3
* 退开

=== battle: world.b.huashan_b3
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.32
enemies: world.foe.huashan_b3
win: world.huashan_b3.win
---
嵩山派高手一言不发，出手便是杀招。

=== dialog: world.huashan_b3.win
do: unflag:world.huashan.task_b3 today:world.huashan.task_b3 rep:huashan:90
---
嵩山派高手败退而去。这一战传回门中，同门都对你刮目相看。（门派任务完成）

=== patch: huashan.cliff
npcs: world.npc.huashan_b3

# ---- 任务清单 ----
=== quest: world.q.huashan_patrol
name: 穆清风的差遣：巡视苍龙岭
flag: world.huashan.task_patrol
where: huashan.cliff
---
去苍龙岭巡一遍，看看山道上的铁链是否牢靠。

=== quest: world.q.huashan_deliver
name: 穆清风的差遣：送信到长安
flag: world.huashan.task_deliver
where: changan.office
---
这封信交给长安衙门的赵捕快，华山下几个村子遭了狼，请官府派人帮忙。

=== quest: world.q.huashan_b2
name: 穆清风的差遣：教训药贩
flag: world.huashan.task_b2
where: huashan.gate
---
玉泉院外有人偷挖山上的灵芝，去把东西追回来。

=== quest: world.q.huashan_b3
name: 穆清风的差遣：击败嵩山派高手
flag: world.huashan.task_b3
where: huashan.cliff
---
嵩山派派了个高手来，说要"指点"华山剑法。去让他知道华山剑法的厉害。

# ================= 辅助武功（D-064）：给队友疗伤、加持，鼓励组队 =================
# 守类招式。默认作用在自己身上；组队时在战斗面板选一位队友作为目标。

=== skill: huashan.jianzhen
name: 华山剑阵
kind: 外功
stance: 守
sect: huashan
rank: 3
---
华山弟子结阵御敌的法门，护住同伴的空门，为其创造出手的良机。

=== move: huashan.jianzhen.1
skill: huashan.jianzhen
name: 剑阵·掩护
level: 0
power: 14
mp: 6
support: true
effects: 护体
omen: $N退开半步，气息一沉……
---
$N横身挡在$n侧前，剑势封住了对手所有的进路。

=== move: huashan.jianzhen.2
skill: huashan.jianzhen
name: 剑阵·齐心
level: 30
power: 20
mp: 10
support: true
effects: 振奋, 护体
omen: $N退开半步，气息一沉……
---
$N与$n背靠背站定，剑阵一合，两人的气势连成一片。
