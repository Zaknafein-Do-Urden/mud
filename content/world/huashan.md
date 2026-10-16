# 华山（西岳华山，长安以东）。侧重：巧（剑法）。门派规则见 docs/SECT.md。

=== sect: huashan
name: 华山
ranks: 外门弟子=0, 入门弟子=100, 亲传弟子=300, 华山剑客=700, 华山长老=1500
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
power: 19
mp: 8
omen: $N长剑斜指，剑身微微晃动，如松枝迎风……
---
$N长剑一摆，「$招」，剑尖带着嗤嗤风声刺向$n$部位！

=== move: huashan.jianfa.2
skill: huashan.jianfa
name: 有凤来仪
level: 20
power: 24
mp: 11
effects: 破绽
omen: $N足尖点地，身子轻轻一旋，剑光闪烁……
---
$N身形一转，「$招」剑势连绵，五点寒星罩向$n周身！

=== move: huashan.jianfa.3
skill: huashan.jianfa
name: 金雁横空
level: 40
power: 32
mp: 15
effects: 点穴
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

=== skill: huashan.poyu
name: 破玉拳
kind: 外功
stance: 刚
sect: huashan
rank: 1
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

=== skill: huashan.lingyun
name: 凌云步
kind: 轻功
sect: huashan
rank: 1
---
华山弟子在险峰绝壁间练就的步法，轻灵迅捷。

=== skill: huashan.dugu
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
power: 44
mp: 24
effects: 破绽
omen: $N长剑随意垂着，整个人却像一张拉满的弓……
---
$N看准$n招式中的破绽，「$招」一剑刺出，正是对方不得不救之处！

=== move: huashan.dugu.2
skill: huashan.dugu
name: 破气式
level: 30
power: 50
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
---
华山脚下的道观，泉水叮咚。抬头望去，千仞绝壁直插云霄。

=== room: huashan.hall
name: 华山·正气堂
exits: 南=huashan.gate
npcs: huashan.mu
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
?sect:huashan 穆清风：剑要快，心要正。要学剑说“学”，要晋阶说“晋阶”，先胜过你梁师兄再说。
?!sect:none ?!sect:huashan 穆清风：你已有师门，华山不收二心之人。
* 弟子想学华山剑法 -> huashan.mu.join ?sect:none
* 师父可有差遣？ -> huashan.mu.task ?sect:huashan
* 告辞

=== dialog: huashan.mu.join
---
穆清风：华山门规：尊师重道，不得滥杀，不得勾结奸邪。犯了门规，我亲手清理门户。
* 弟子谨记 -> huashan.mu.joined !join:huashan
* 让我再想想

=== dialog: huashan.mu.joined
---
穆清风点点头，扔给你一柄木剑。
穆清风：{姓名}，先从华山剑法、混元掌和华山心法练起。剑法不在多，在于精。

=== dialog: huashan.mu.task
---
* 山上可有贼人？ -> huashan.task.bandit ?!flag:world.huashan.task_bandit
* 可有更难的差事？ -> huashan.task.spy ?rank:1 ?!flag:world.huashan.task_spy
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
name: 苍龙岭毛贼
attrs: 根骨=13, 身法=15, 悟性=8
skills: base.quan=9, base.zhang=8, base.zhaojia=5
ai: 刚=2, 巧=2, 守=1
potential: 20
hpx: 0.75
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
enemies: huashan.foe.bandit, huashan.foe.bandit
win: huashan.bandit.win
---
两个毛贼拔出短刀，在窄窄的山脊上向你逼来。

=== dialog: huashan.bandit.win
do: unflag:world.huashan.task_bandit rep:huashan:30
---
两个毛贼连滚带爬地逃下山去。（门派任务完成）

=== enemy: huashan.foe.swordsman
name: 叫阵剑客
attrs: 根骨=16, 身法=20, 悟性=16
skills: base.zhang=20, base.quan=18, base.zhaojia=16, base.tuna=18
ai: 巧=2, 刚=2, 守=1
cunning: 30
potential: 60
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
enemies: huashan.foe.swordsman
win: huashan.spy.win
---
剑客长剑出鞘，剑光如水。

=== dialog: huashan.spy.win
do: unflag:world.huashan.task_spy rep:huashan:80
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
