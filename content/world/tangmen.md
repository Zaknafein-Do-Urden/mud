# 唐门（唐家堡，成都以西）。侧重：巧（暗器）。门派规则见 docs/SECT.md。

=== sect: tangmen
name: 唐门
ranks: 外姓门人=0, 唐门子弟=100, 暗器高手=300, 唐门执事=700, 唐门长老=1500
caps: 40, 70, 100, 140, 180
examiner: 唐七
---
蜀中唐家堡，以暗器和机关闻名江湖。唐门行事诡秘，江湖中人谈之色变。
外姓人入唐门不易，一旦入门，便终身是唐家的人。

=== skill: tangmen.xinfa
name: 唐门心法
kind: 内功
sect: tangmen
rank: 0
hp: 7
mp: 10
affinity: 巧
---
唐门内功，讲究气聚指尖，发暗器时劲力内敛、出手无声。

=== skill: tangmen.feihuang
name: 飞蝗石
kind: 外功
stance: 巧
sect: tangmen
rank: 0
---
唐门入门暗器，以石子代镖，练的是准头和手劲。

=== move: tangmen.feihuang.1
skill: tangmen.feihuang
name: 飞蝗扑面
level: 0
power: 19
mp: 8
omen: $N右手垂在袖中，袖口微微鼓动……
---
$N袖口一扬，「$招」，几颗石子如飞蝗般直扑$n$部位！

=== move: tangmen.feihuang.2
skill: tangmen.feihuang
name: 连珠三石
level: 20
power: 23
mp: 11
effects: 破绽
omen: $N指间夹着三颗石子，眼睛死死盯着对方……
---
$N手腕连抖，「$招」，三颗石子一颗接一颗，打得$n手忙脚乱！

=== skill: tangmen.qianji
name: 千机手
kind: 外功
stance: 守
sect: tangmen
rank: 0
---
唐门接暗器的手法，练到深处，可以把敌人的暗器原样奉还。

=== move: tangmen.qianji.1
skill: tangmen.qianji
name: 千机锁
level: 0
power: 17
mp: 5
omen: $N双手十指张开，在身前不停翻动……
---
$N十指翻飞，以「$招」护住周身，来招都被一一锁住。

=== move: tangmen.qianji.2
skill: tangmen.qianji
name: 拈针回手
level: 25
power: 28
mp: 9
omen: $N双手拢在袖中，身子一动不动……
---
$N双手拢袖，摆出「$招」的架势，专等对手出手。

=== skill: tangmen.kaibei
name: 开碑手
kind: 外功
stance: 刚
sect: tangmen
rank: 1
---
唐门少见的硬功夫，掌力凝聚，可开碑裂石。

=== move: tangmen.kaibei.1
skill: tangmen.kaibei
name: 开碑裂石
level: 0
power: 27
mp: 13
omen: $N右掌缓缓抬起，掌心发黑……
---
$N一掌劈下，「$招」，掌风沉重如铁锤，砸向$n$部位！

=== move: tangmen.kaibei.2
skill: tangmen.kaibei
name: 碎骨掌
level: 30
power: 37
mp: 20
effects: 内伤
omen: $N五指箕张，指节发出咯咯的响声……
---
$N一掌按向$n，「$招」，掌力透体而入，直震脏腑！

=== skill: tangmen.yanzi
name: 燕子三抄水
kind: 轻功
sect: tangmen
rank: 1
---
唐门轻功，身法如燕子掠水，三起三落，倏忽来去。

=== skill: tangmen.baoyu
name: 暴雨梨花针
kind: 外功
stance: 巧
sect: tangmen
rank: 4
---
唐门第一暗器，针如暴雨，见者无救。江湖上见过它的人，大多已不在人世。

=== move: tangmen.baoyu.1
skill: tangmen.baoyu
name: 暴雨梨花
level: 0
power: 46
mp: 26
effects: 点穴, 破绽
omen: $N手里多了一只小小的铁匣，匣口对着前方……
---
$N按动机括，「$招」，铁匣中射出漫天银针，如暴雨般罩住$n周身！

# ---------------- 地点 ----------------

=== patch: chengdu.station
exits: 西=tangmen.gate
---
往西的小路通向唐家堡，路边的竹林里不时有人影一闪。

=== room: tangmen.gate
name: 唐家堡·堡门
exits: 东=chengdu.station, 北=tangmen.hall, 西=tangmen.bamboo
---
高墙深院，堡门紧闭，墙头隐约可见机关弩的箭孔。门口两个家丁面无表情地打量着来人。

=== room: tangmen.hall
name: 唐家堡·暗器房
exits: 南=tangmen.gate
npcs: tangmen.laolao
train: true
---
屋里摆满了木人桩和箭靶，靶心密密麻麻插满了飞镖和铁蒺藜。空气里有一股淡淡的药味。

=== room: tangmen.bamboo
name: 唐家堡·竹林
exits: 东=tangmen.gate
npcs: tangmen.npc.spy, tangmen.npc.traitor
---
一大片竹林，竹叶沙沙作响。林中小路曲折，据说暗藏着唐门的机关。

# ---------------- 人物与差事 ----------------

=== npc: tangmen.laolao
name: 唐姥姥
brief: 唐门的老太君，执掌唐家堡大小事务。
teaches: tangmen
talk: tangmen.laolao.talk
---
一个满头银发的老太太，拄着一根乌木拐杖，眼睛却亮得吓人。

=== dialog: tangmen.laolao.talk
---
?sect:none 唐姥姥：外人进唐家堡，要么是来求药，要么是来寻仇。你是哪样？
?sect:tangmen 唐姥姥：暗器要准，心要狠，嘴要严。要学本事说“学”，要晋阶说“晋阶”，先赢了唐七。
?!sect:none ?!sect:tangmen 唐姥姥：别家的人，少在唐家堡打转。
* 晚辈想投入唐门 -> tangmen.laolao.join ?sect:none
* 姥姥可有差遣？ -> tangmen.laolao.task ?sect:tangmen
* 告辞

=== dialog: tangmen.laolao.join
---
唐姥姥眯起眼睛打量你半晌。
唐姥姥：唐门不轻易收外姓人。入了门，唐门的秘密带进棺材；敢泄露半个字，唐门的暗器会找到你，天涯海角。
* 晚辈明白 -> tangmen.laolao.joined !join:tangmen
* 这……让我再想想

=== dialog: tangmen.laolao.joined
---
唐姥姥从袖中摸出一枚铁蒺藜，放在你掌心。
唐姥姥：{姓名}，从今天起你就是唐门的外姓门人。先学飞蝗石、千机手和唐门心法。

=== dialog: tangmen.laolao.task
---
* 堡外可有不速之客？ -> tangmen.task.spy ?!flag:world.tangmen.task_spy
* 可有更要紧的事？ -> tangmen.task.traitor ?rank:1 ?!flag:world.tangmen.task_traitor
* 告辞

=== dialog: tangmen.task.spy
do: flag:world.tangmen.task_spy
---
唐姥姥：竹林里有两个外人在探机关的路子，不知是哪家派来的。去把他们赶走。
（门派任务：赶走竹林里的探子）

=== dialog: tangmen.task.traitor
do: flag:world.tangmen.task_traitor
---
唐姥姥：堡里出了个叛徒，偷了一瓶解药想卖给仇家，此刻还躲在竹林里。把解药拿回来。
（门派任务：在竹林拿下唐门叛徒）

=== enemy: tangmen.foe.spy
name: 竹林探子
attrs: 根骨=12, 身法=16, 悟性=10
skills: base.zhang=10, base.quan=6, base.zhaojia=6
ai: 巧=3, 刚=1, 守=1
cunning: 15
potential: 20
hpx: 0.75
---
两个身穿绿衣、几乎和竹林融为一体的探子。

=== npc: tangmen.npc.spy
name: 竹林探子
brief: 在唐家堡外打探机关的人。
if: flag:world.tangmen.task_spy
talk: tangmen.spy.talk
---
两个绿衣人蹲在竹林里，正用竹竿试探地上的机关。

=== dialog: tangmen.spy.talk
---
绿衣人：被发现了！先下手为强！
* 动手 !fight:world.b.tangmen_spy
* 退开

=== battle: world.b.tangmen_spy
enemies: tangmen.foe.spy, tangmen.foe.spy
win: tangmen.spy.win
---
两个绿衣人一左一右窜了上来。

=== dialog: tangmen.spy.win
do: unflag:world.tangmen.task_spy rep:tangmen:30
---
两个探子负伤逃走，竹林里重归寂静。（门派任务完成）

=== enemy: tangmen.foe.traitor
name: 唐门叛徒
attrs: 根骨=15, 身法=22, 悟性=16
skills: base.zhang=22, base.quan=14, base.zhaojia=16, base.tuna=16
ai: 巧=3, 刚=1, 守=1
cunning: 40
potential: 60
---
一个面色苍白的年轻人，双手藏在袖中，指缝里闪着寒光。

=== npc: tangmen.npc.traitor
name: 唐门叛徒
brief: 偷了解药出逃的唐门子弟。
if: flag:world.tangmen.task_traitor
talk: tangmen.traitor.talk
---
一个年轻人背靠着一丛竹子，警惕地盯着四周。

=== dialog: tangmen.traitor.talk
---
叛徒：姥姥派你来的？我在唐家堡做牛做马十年，拿一瓶药怎么了！
* 交出解药 !fight:world.b.tangmen_traitor
* 走开

=== battle: world.b.tangmen_traitor
enemies: tangmen.foe.traitor
win: tangmen.traitor.win
---
叛徒双手一扬，几点寒星已向你飞来。

=== dialog: tangmen.traitor.win
do: unflag:world.tangmen.task_traitor rep:tangmen:80
---
叛徒瘫坐在地上，把解药扔给你，惨笑一声：“唐家堡……谁也逃不出去。”（门派任务完成）

# ---------------- 任务清单（D-045）----------------

=== quest: world.q.tangmen_1
name: 唐门：赶走探子
flag: world.tangmen.task_spy
where: tangmen.bamboo
---
唐姥姥的吩咐：竹林里有外人在探机关。

=== quest: world.q.tangmen_2
name: 唐门：拿下叛徒
flag: world.tangmen.task_traitor
where: tangmen.bamboo
---
唐姥姥的吩咐：叛徒偷了解药躲在竹林里。
