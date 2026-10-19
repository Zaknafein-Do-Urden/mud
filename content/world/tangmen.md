# 唐门（唐家堡，成都以西）。侧重：巧（暗器）。门派规则见 docs/SECT.md。

=== sect: tangmen
name: 唐门
ranks: 外姓门人=0, 唐门子弟=150, 暗器高手=500, 唐门执事=1200, 唐门长老=2500
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
weapon: 暗器
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
power: 17
mp: 8
omen: $N右手垂在袖中，袖口微微鼓动……
---
$N袖口一扬，「$招」，几颗石子如飞蝗般直扑$n$部位！

=== move: tangmen.feihuang.2
skill: tangmen.feihuang
name: 连珠三石
level: 20
power: 21
mp: 11
effects: 破绽, 群攻
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
effects: 缴械:30
omen: $N双手拢在袖中，身子一动不动……
---
$N双手拢袖，摆出「$招」的架势，专等对手出手。

=== move: tangmen.qianji.3
skill: tangmen.qianji
name: 千斤闸
level: 0
power: 16
mp: 8
stance: 刚
omen: $N双臂缓缓举过头顶，肘弯里咔的一响，如机括上弦……
---
$N双臂如闸门般猛然落下，「$招」，一股沉劲直砸$n$部位！

=== skill: tangmen.kaibei
name: 开碑手
kind: 外功
stance: 刚
sect: tangmen
rank: 2
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

=== move: tangmen.kaibei.3
skill: tangmen.kaibei
name: 断碣分碑
level: 50
power: 46
mp: 25
effects: 内伤, 破绽
omen: $N掌心翻转向外，手掌渐渐泛起青灰之色……
---
$N一掌直劈，「$招」，掌力如刀，似要将$n连人带骨劈作两半！

=== skill: tangmen.yanzi
name: 燕子三抄水
kind: 轻功
sect: tangmen
rank: 1
---
唐门轻功，身法如燕子掠水，三起三落，倏忽来去。

=== skill: tangmen.baoyu
weapon: 暗器
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
power: 44
mp: 26
effects: 点穴, 破绽, 群攻
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
# 门派大门兼作旅店：休息、修炼、战败后回到这里、组队（D-046）
inn: true
restmsg: 你在堡门边的耳房里歇了一夜，虽然总觉得有人在暗处盯着，倒也睡得安稳。
---
高墙深院，堡门紧闭，墙头隐约可见机关弩的箭孔。门口两个家丁面无表情地打量着来人。

=== room: tangmen.hall
name: 唐家堡·暗器房
exits: 南=tangmen.gate
npcs: tangmen.laolao, tangmen.sparring
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
?sect:tangmen 唐姥姥：暗器要准，心要狠，嘴要严。想学本事，跟我说一声；要晋阶说“晋阶”，先赢了唐七。
?!sect:none ?!sect:tangmen 唐姥姥：别家的人，少在唐家堡打转。
* 晚辈想投入唐门 -> tangmen.laolao.join ?sect:none
* 请姥姥传授武功 -> world.sect.teach ?sect:tangmen
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
* 请师父传授武功 -> world.sect.teach

=== dialog: tangmen.laolao.task
ifnone: 唐姥姥：今天的差事都办完了，目前没有门派任务。明日再来吧。
---
* 堡外可有不速之客？ -> tangmen.task.spy ?pick:sect.tangmen:spy ?!flag:world.tangmen.task_spy ?!today:world.tangmen.task_spy
* 附近可有人滋事？ -> tangmen.task.b2 ?pick:sect.tangmen:b2 ?!flag:world.tangmen.task_b2 ?!today:world.tangmen.task_b2
* 要不要去竹林巡视？ -> tangmen.task.patrol ?pick:sect.tangmen:patrol ?!flag:world.tangmen.task_patrol ?!today:world.tangmen.task_patrol
* 可有书信要送去成都？ -> tangmen.task.deliver ?pick:sect.tangmen:deliver ?!flag:world.tangmen.task_deliver ?!today:world.tangmen.task_deliver
* 可有更要紧的事？ -> tangmen.task.traitor ?rank:1 ?pick:sect.tangmen:traitor ?!flag:world.tangmen.task_traitor ?!today:world.tangmen.task_traitor
* 可有最难办的差事？ -> tangmen.task.b3 ?rank:2 ?pick:sect.tangmen:b3 ?!flag:world.tangmen.task_b3 ?!today:world.tangmen.task_b3
* 竹林里可要采药？ -> tangmen.task.herb ?pick:sect.tangmen:herb ?!flag:world.tangmen.task_herb ?!today:world.tangmen.task_herb
* 可有客人要接？ -> tangmen.task.visit ?pick:sect.tangmen:visit ?!flag:world.tangmen.task_visit ?!today:world.tangmen.task_visit
* 堡里可缺什么东西？ -> tangmen.task.buy ?pick:sect.tangmen:buy ?!flag:world.tangmen.task_buy ?!today:world.tangmen.task_buy
* 可有族人要出远门？ -> tangmen.task.escort ?pick:sect.tangmen:escort ?!flag:world.tangmen.task_escort ?!today:world.tangmen.task_escort
* 堡外可有人窥探？ -> tangmen.task.rival ?pick:sect.tangmen:rival ?!flag:world.tangmen.task_rival ?!today:world.tangmen.task_rival
* 可有棘手的差事？ -> tangmen.task.hunt ?pick:sect.tangmen:hunt ?rank:1 ?!flag:world.tangmen.task_hunt ?!today:world.tangmen.task_hunt
* 暗器房可缺什么？ -> tangmen.task.food_ask ?pick:sect.tangmen:food ?!flag:world.tangmen.task_food ?!today:world.tangmen.task_food
* 交上猴儿酒 {@world.tangmen.food} 件 -> tangmen.task.food ?flag:world.tangmen.task_food ?has:food.houerjiu:@world.tangmen.food
* 师门缺什么材料？ -> tangmen.task.material_ask ?!flag:world.tangmen.task_material_on ?!today:world.tangmen.task_material
* 交上铁器 {@world.tangmen.material} 件 -> tangmen.task.material ?flag:world.tangmen.task_material_on ?cargo:iron:@world.tangmen.material ?!today:world.tangmen.task_material
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
weapon: 暗器
weaponName: 飞镖
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
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.48
enemies: tangmen.foe.spy, tangmen.foe.spy
win: tangmen.spy.win
---
两个绿衣人一左一右窜了上来。

=== dialog: tangmen.spy.win
do: unflag:world.tangmen.task_spy rep:tangmen:30 today:world.tangmen.task_spy
---
两个探子负伤逃走，竹林里重归寂静。（门派任务完成）

=== enemy: tangmen.foe.traitor
weapon: 暗器
weaponName: 毒针
name: 唐门叛徒
attrs: 根骨=15, 身法=22, 悟性=16
skills: base.zhang=22, base.quan=14, base.zhaojia=16, base.tuna=16
ai: 巧=3, 刚=1, 守=1
cunning: 40
potential: 60
# 藏招：20% 的回合不露预兆，靠悟性、慧眼看穿
obscure: 20
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
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 2.23
enemies: tangmen.foe.traitor
win: tangmen.traitor.win
---
叛徒双手一扬，几点寒星已向你飞来。

=== dialog: tangmen.traitor.win
do: unflag:world.tangmen.task_traitor rep:tangmen:60 today:world.tangmen.task_traitor
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

# ---------------- 陪练（随时可以切磋，打输也无妨；D-049）----------------

=== npc: tangmen.sparring
name: 唐小妹
brief: 本门的陪练，可以随时切磋练功。
talk: tangmen.sparring.talk
---
一个扎着双髻的小姑娘，把一把石子在手里抛来抛去。

=== dialog: tangmen.sparring.talk
---
唐小妹：陪我练飞蝗石嘛，我只用石子，不用针！
* 好，切磋几招 !fight:world.b.tangmen_spar
* 下次吧

=== enemy: world.foe.tangmen_spar
weapon: 暗器
weaponName: 石子
name: 唐小妹
attrs: 根骨=12, 身法=16, 悟性=12
skills: tangmen.feihuang=6, tangmen.qianji=6, base.tuna=5
ai: 巧=3, 守=1
cunning: 10
potential: 12
hpx: 0.7
weaponBonus: 11
---
一个扎着双髻的小姑娘，把一把石子在手里抛来抛去。

=== battle: world.b.tangmen_spar
enemies: world.foe.tangmen_spar
# 陪练是固定的标尺，不按玩家强弱浮动（D-115）
adapt: false
---
唐小妹摆开了架势。

# ================= 新增门派任务（D-054）：每天每个任务各做一次 =================

# ---- 巡视（走到地方就算完成）----
=== dialog: tangmen.task.patrol
do: flag:world.tangmen.task_patrol
---
唐姥姥：去竹林里查看一遍机关，有没有被人动过。
（门派任务：巡视竹林）

=== trigger: world.t.tangmen_patrol
room: tangmen.bamboo
if: flag:world.tangmen.task_patrol
do: unflag:world.tangmen.task_patrol today:world.tangmen.task_patrol rep:tangmen:30 potential:10
---
你小心避开竹林里的机关，一处处查过去，机括都完好无损。（门派任务完成）

# ---- 送信（走到对方衙门就算完成）----
=== dialog: tangmen.task.deliver
do: flag:world.tangmen.task_deliver
---
唐姥姥：把这包东西交给成都衙门的周捕头。别问里面是什么，也别打开。
（门派任务：把书信送到成都衙门，交给周捕头）

=== trigger: world.t.tangmen_deliver
room: chengdu.office
if: flag:world.tangmen.task_deliver
do: unflag:world.tangmen.task_deliver today:world.tangmen.task_deliver rep:tangmen:30 potential:10
---
你把书信交给了周捕头。周捕头看了一眼封皮，郑重地收了起来。（门派任务完成）

# ---- 一阶：闯堡少年 ----
=== dialog: tangmen.task.b2
do: flag:world.tangmen.task_b2
---
唐姥姥：堡门外有个毛头小子要闯堡，让他知难而退。
（门派任务：教训闯堡少年）

=== enemy: world.foe.tangmen_b2
weapon: 剑
weaponName: 长剑
name: 闯堡少年
attrs: 根骨=12, 身法=13, 悟性=8
skills: base.quan=8, base.zhang=10, base.zhaojia=7
ai: 巧=3, 刚=1, 守=1
potential: 20
---
一个十七八岁的少年剑客，听说唐门暗器厉害，非要闯进堡来见识。

=== npc: world.npc.tangmen_b2
name: 闯堡少年
brief: 在附近滋事的闯堡少年。
if: flag:world.tangmen.task_b2
talk: world.tangmen_b2.talk
---
一个十七八岁的少年剑客，听说唐门暗器厉害，非要闯进堡来见识。

=== dialog: world.tangmen_b2.talk
---
闯堡少年：看什么看？
* 动手 !fight:world.b.tangmen_b2
* 走开

=== battle: world.b.tangmen_b2
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.12
enemies: world.foe.tangmen_b2, world.foe.tangmen_b2
win: world.tangmen_b2.win
---
闯堡少年和同伙骂骂咧咧地扑了上来。

=== dialog: world.tangmen_b2.win
do: unflag:world.tangmen.task_b2 today:world.tangmen.task_b2 rep:tangmen:30
---
闯堡少年灰头土脸地走了。（门派任务完成）

=== patch: tangmen.gate
npcs: world.npc.tangmen_b2

# ---- 二阶：仇家杀手 ----
=== dialog: tangmen.task.b3
do: flag:world.tangmen.task_b3
---
唐姥姥：唐家的仇家雇了杀手，藏在竹林里伺机行刺。除掉他。
（门派任务：击败仇家杀手）

=== enemy: world.foe.tangmen_b3
weapon: 匕首
weaponName: 淬毒匕首
name: 仇家杀手
attrs: 根骨=18, 身法=18, 悟性=16
skills: base.zhang=42, base.quan=34, base.zhaojia=36, base.tuna=38
ai: 巧=3, 刚=1, 守=1
cunning: 30
# 藏招：30% 的回合不露预兆
obscure: 30
potential: 90
---
一个黑巾蒙面的杀手，身法诡异，匕首上泛着蓝光。

=== npc: world.npc.tangmen_b3
name: 仇家杀手
brief: 本门的强敌。
if: flag:world.tangmen.task_b3
talk: world.tangmen_b3.talk
---
一个黑巾蒙面的杀手，身法诡异，匕首上泛着蓝光。

=== dialog: world.tangmen_b3.talk
---
仇家杀手冷冷地看着你：“就凭你？”
* 请赐教 !fight:world.b.tangmen_b3
* 退开

=== battle: world.b.tangmen_b3
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.95
enemies: world.foe.tangmen_b3
win: world.tangmen_b3.win
---
仇家杀手一言不发，出手便是杀招。

=== dialog: world.tangmen_b3.win
do: unflag:world.tangmen.task_b3 today:world.tangmen.task_b3 rep:tangmen:90
---
仇家杀手败退而去。这一战传回门中，同门都对你刮目相看。（门派任务完成）

=== patch: tangmen.bamboo
npcs: world.npc.tangmen_b3

# ---- 任务清单 ----
=== quest: world.q.tangmen_patrol
name: 唐姥姥的差遣：巡视竹林
flag: world.tangmen.task_patrol
where: tangmen.bamboo
---
去竹林里查看一遍机关，有没有被人动过。

=== quest: world.q.tangmen_deliver
name: 唐姥姥的差遣：送信到成都
flag: world.tangmen.task_deliver
where: chengdu.office
---
把这包东西交给成都衙门的周捕头。别问里面是什么，也别打开。

=== quest: world.q.tangmen_b2
name: 唐姥姥的差遣：教训闯堡少年
flag: world.tangmen.task_b2
where: tangmen.gate
---
堡门外有个毛头小子要闯堡，让他知难而退。

=== quest: world.q.tangmen_b3
name: 唐姥姥的差遣：击败仇家杀手
flag: world.tangmen.task_b3
where: tangmen.bamboo
---
唐家的仇家雇了杀手，藏在竹林里伺机行刺。除掉他。

# ================= 辅助武功（D-064）：给队友疗伤、加持，鼓励组队 =================
# 守类招式。默认作用在自己身上；组队时在战斗面板选一位队友作为目标。

=== skill: tangmen.baicao
name: 百草疗毒
kind: 外功
stance: 守
sect: tangmen
rank: 3
---
唐门的医毒之术，用毒者必先识毒。金针渡穴、灵药续命，都是唐家秘传。

=== move: tangmen.baicao.1
skill: tangmen.baicao
name: 金针渡穴
level: 0
power: 14
mp: 6
support: true
effects: 解穴, 疗伤:0.8
omen: $N退开半步，气息一沉……
---
$N指间金针一闪，刺入$n几处穴道，淤塞的气血顿时通畅。

=== move: tangmen.baicao.2
skill: tangmen.baicao
name: 回魂续命
level: 30
power: 26
mp: 13
support: true
effects: 疗伤:1.8
omen: $N退开半步，气息一沉……
---
$N从药囊里取出一粒药丸塞进$n口中，又以金针催动药力。
