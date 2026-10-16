# 少林（嵩山少林寺，洛阳东南）。侧重：守、刚。门派规则见 docs/SECT.md。

=== sect: shaolin
name: 少林
ranks: 俗家弟子=0, 罗汉堂弟子=100, 般若堂弟子=250, 达摩院弟子=450, 护法金刚=700
caps: 40, 70, 100, 140, 180
examiner: 慧觉
---
天下武功出少林。嵩山少林寺千年古刹，武学渊源深厚，讲究根基扎实、以守为攻。
俗家弟子也可以入寺学艺，只是要守寺规，不得恃强凌弱。

=== skill: shaolin.xinfa
name: 少林心法
kind: 内功
sect: shaolin
rank: 0
hp: 9
mp: 8
affinity: 守
---
少林入门内功，功力进境虽慢，根基却极扎实，最长于护体。

=== skill: shaolin.luohan
name: 罗汉拳
kind: 外功
stance: 刚
sect: shaolin
rank: 0
---
少林入门拳法，大开大合，一招一式都是硬碰硬的功夫。

=== move: shaolin.luohan.1
skill: shaolin.luohan
name: 罗汉撞钟
level: 0
power: 25
mp: 11
omen: $N马步一沉，右拳缓缓收到腰间……
---
$N一声断喝，「$招」一拳直出，拳风如撞钟般轰向$n$部位！

=== move: shaolin.luohan.2
skill: shaolin.luohan
name: 伏虎式
level: 20
power: 33
mp: 17
effects: 破绽
omen: $N弓身前探，双拳一上一下，如猛虎扑食……
---
$N身子前扑，一招「$招」双拳齐出，上打$n面门，下击$n小腹！

=== move: shaolin.luohan.3
skill: shaolin.luohan
name: 金刚捣碓
level: 40
power: 44
mp: 25
effects: 内伤
omen: $N提膝抬拳，周身筋骨格格作响……
---
$N右拳高举，「$招」自上而下砸落，地上的青砖都被震得裂开！

=== skill: shaolin.jinzhong
name: 金钟罩
kind: 外功
stance: 守
sect: shaolin
rank: 0
---
少林护体硬功，运起时周身如罩铜钟，刀剑难伤。

=== move: shaolin.jinzhong.1
skill: shaolin.jinzhong
name: 钟鸣罩体
level: 0
power: 18
mp: 5
omen: $N双目微闭，周身肌肤隐隐泛出铜色……
---
$N低喝一声，运起「$招」，周身如罩了一口铜钟，静待来招。

=== move: shaolin.jinzhong.2
skill: shaolin.jinzhong
name: 金钟罩顶
level: 25
power: 28
mp: 9
omen: $N双掌合十，气沉丹田，纹丝不动……
---
$N双掌合十，「$招」功力运遍全身，任你拳脚加身也如击败革。

=== skill: shaolin.nianhua
name: 拈花指
kind: 外功
stance: 巧
sect: shaolin
rank: 1
---
少林七十二绝技之一，指力含而不露，专点人身大穴。

=== move: shaolin.nianhua.1
skill: shaolin.nianhua
name: 拈花微笑
level: 0
power: 17
mp: 8
effects: 点穴
omen: $N右手拇指与食指轻轻一捏，嘴角似笑非笑……
---
$N面带微笑，右手轻轻一拈，「$招」，一缕指风无声无息点向$n$部位！

=== move: shaolin.nianhua.2
skill: shaolin.nianhua
name: 佛祖拈花
level: 30
power: 26
mp: 13
effects: 点穴, 破绽
omen: $N五指如兰花般舒展开来……
---
$N五指连拂，「$招」指影重重，$n周身大穴都在指风笼罩之下！

=== skill: shaolin.yiwei
name: 一苇渡江
kind: 轻功
sect: shaolin
rank: 1
---
相传达摩祖师折一苇渡江北上，少林轻功由此得名。

=== skill: shaolin.jingang
name: 大力金刚掌
kind: 外功
stance: 刚
sect: shaolin
rank: 4
---
少林七十二绝技中最刚猛的掌法之一，一掌可碎石碑。

=== move: shaolin.jingang.1
skill: shaolin.jingang
name: 金刚伏魔
level: 0
power: 62
mp: 40
effects: 内伤
omen: $N须发皆张，双掌缓缓推出，掌心隐隐发红……
---
$N宣了一声佛号，「$招」双掌平推而出，掌力如怒涛般卷向$n！

=== move: shaolin.jingang.2
skill: shaolin.jingang
name: 大力金刚
level: 30
power: 74
mp: 48
effects: 破绽
omen: $N怒目圆睁，如寺中金刚塑像一般……
---
$N怒目如金刚，一招「$招」劈空而下，掌风所及，尘土飞扬！

# ---------------- 地点 ----------------

=== patch: luoyang.station
exits: 东南=shaolin.gate
---
往东南的大路通向嵩山少林寺。

=== room: shaolin.gate
name: 少林寺·山门
exits: 西北=luoyang.station, 北=shaolin.hall, 东=shaolin.hill
# 门派大门兼作旅店：休息、修炼、战败后回到这里、组队（D-046）
inn: true
restmsg: 你在山门旁的客舍里歇了一宿，晨钟把你唤醒，神清气爽。
---
嵩山脚下，一座古朴的山门掩映在松柏之间，匾额上写着"少林寺"三个大字。
石阶上有几个小沙弥在扫落叶，远处隐隐传来晨钟。

=== room: shaolin.hall
name: 少林寺·罗汉堂
exits: 南=shaolin.gate
npcs: shaolin.huiming, shaolin.sparring
train: true
---
殿中供着十八尊罗汉，神态各异。地上的青砖被一代代弟子踩出了深深的脚印。
几个武僧在殿前空地上打拳，呼喝声整齐划一。

=== room: shaolin.hill
name: 少林寺·后山
exits: 西=shaolin.gate
npcs: shaolin.npc.bandit, shaolin.npc.thief
---
后山林木茂密，山道崎岖。半山腰有一片药圃，种着寺里自用的草药。

# ---------------- 人物与差事 ----------------

=== npc: shaolin.huiming
name: 慧明禅师
brief: 少林罗汉堂首座，负责传授俗家弟子武艺。
teaches: shaolin
talk: shaolin.huiming.talk
---
一位白眉老僧，面容慈和，一双手掌却宽大厚实，满是老茧。

=== dialog: shaolin.huiming.talk
---
?sect:none 慧明禅师：阿弥陀佛。施主远道而来，是要礼佛，还是学武？
?sect:shaolin 慧明禅师：善哉。习武先习心，切莫急躁。要学功夫说“学”，要晋阶说“晋阶”，须先过慧觉那一关。
?!sect:none ?!sect:shaolin 慧明禅师：施主已有师门，老衲不便多言。
* 弟子愿拜入少林 -> shaolin.huiming.join ?sect:none
* 寺里可有需要帮忙的事？ -> shaolin.huiming.task ?sect:shaolin
* 告辞

=== dialog: shaolin.huiming.join
---
慧明禅师：入我少林，须守五戒：不杀无辜，不欺弱小，不贪财物，{男:不近女色|女:不恋红尘}，不得叛寺。
?gender:女 慧明禅师：女施主虽不能剃度，俗家弟子却是收的。
* 弟子谨遵寺规 -> shaolin.huiming.joined !join:shaolin
* 容弟子再想想

=== dialog: shaolin.huiming.joined
---
慧明禅师微微颔首，命小沙弥取来一件灰布短褂。
慧明禅师：从今日起，你便是少林俗家弟子{姓名}。先学罗汉拳、金钟罩和少林心法吧。

=== dialog: shaolin.huiming.task
ifnone: 慧明禅师：今天的差事都办完了，目前没有门派任务。明日再来吧。
---
* 后山有人作乱吗？ -> shaolin.task.bandit ?!flag:world.shaolin.task_bandit ?!today:world.shaolin.task_bandit
* 附近可有人滋事？ -> shaolin.task.b2 ?!flag:world.shaolin.task_b2 ?!today:world.shaolin.task_b2
* 要不要去后山巡视？ -> shaolin.task.patrol ?!flag:world.shaolin.task_patrol ?!today:world.shaolin.task_patrol
* 可有书信要送去洛阳？ -> shaolin.task.deliver ?!flag:world.shaolin.task_deliver ?!today:world.shaolin.task_deliver
* 可有更难的差事？ -> shaolin.task.thief ?rank:1 ?!flag:world.shaolin.task_thief ?!today:world.shaolin.task_thief
* 可有最难办的差事？ -> shaolin.task.b3 ?rank:2 ?!flag:world.shaolin.task_b3 ?!today:world.shaolin.task_b3
* 告辞

=== dialog: shaolin.task.bandit
do: flag:world.shaolin.task_bandit
---
慧明禅师：后山药圃近来常有山贼出没，偷挖药材，还打伤了看园的小沙弥。去把他们赶走，莫伤人命。
（门派任务：赶走后山的山贼）

=== dialog: shaolin.task.thief
do: flag:world.shaolin.task_thief
---
慧明禅师：藏经阁昨夜失窃，丢了一卷拳谱。那贼人轻功了得，往后山去了。你去追回来。
（门派任务：在后山追回失窃的拳谱）

=== enemy: shaolin.foe.bandit
weapon: 棍
weaponName: 锄头
name: 嵩山山贼
attrs: 根骨=14, 身法=13, 悟性=8
skills: base.quan=8, base.zhaojia=5
ai: 刚=3, 守=1
potential: 20
hpx: 0.7
---
满脸横肉的山贼，扛着一把锄头当兵器。

=== npc: shaolin.npc.bandit
name: 嵩山山贼
brief: 在少林后山偷挖药材的山贼。
if: flag:world.shaolin.task_bandit
talk: shaolin.bandit.talk
---
两个山贼正蹲在药圃里，往麻袋里塞草药。

=== dialog: shaolin.bandit.talk
---
山贼：少林寺的？嘿嘿，老子挖的是山上的草，碍着你什么事？
* 放下药材！ !fight:world.b.shaolin_bandit
* 走开

=== battle: world.b.shaolin_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.61
enemies: shaolin.foe.bandit, shaolin.foe.bandit
win: shaolin.bandit.win
---
两个山贼扔下麻袋，抡起锄头扑了上来。

=== dialog: shaolin.bandit.win
do: unflag:world.shaolin.task_bandit rep:shaolin:30 today:world.shaolin.task_bandit
---
山贼丢下麻袋，连滚带爬地逃下山去。（门派任务完成）

=== enemy: shaolin.foe.thief
weapon: 拳
name: 偷经贼
attrs: 根骨=15, 身法=24, 悟性=16
skills: base.zhang=20, base.quan=14, base.zhaojia=14, base.tuna=16
ai: 巧=3, 刚=1, 守=1
cunning: 35
potential: 60
# 藏招：15% 的回合不露预兆，靠悟性、慧眼看穿
obscure: 15
---
一个瘦小的黑衣人，身法滑溜，怀里鼓鼓囊囊的。

=== npc: shaolin.npc.thief
name: 偷经贼
brief: 从藏经阁偷走拳谱的黑衣人。
if: flag:world.shaolin.task_thief
talk: shaolin.thief.talk
---
一个黑衣人蹲在树杈上，正借着天光翻看一卷册子。

=== dialog: shaolin.thief.talk
---
黑衣人：少林的追兵？来得倒快。
* 交出拳谱 !fight:world.b.shaolin_thief
* 走开

=== battle: world.b.shaolin_thief
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 2.33
enemies: shaolin.foe.thief
win: shaolin.thief.win
---
黑衣人把册子往怀里一塞，从树上一跃而下。

=== dialog: shaolin.thief.win
do: unflag:world.shaolin.task_thief rep:shaolin:60 today:world.shaolin.task_thief
---
黑衣人扔下拳谱，几个起落便消失在林中。你捡起拳谱，拍去上面的尘土。（门派任务完成）

# ---------------- 任务清单（D-045）----------------

=== quest: world.q.shaolin_1
name: 少林：赶走山贼
flag: world.shaolin.task_bandit
where: shaolin.hill
---
慧明禅师的吩咐：赶走后山药圃偷挖药材的山贼。

=== quest: world.q.shaolin_2
name: 少林：追回拳谱
flag: world.shaolin.task_thief
where: shaolin.hill
---
慧明禅师的吩咐：藏经阁失窃，去后山追回拳谱。

# ---------------- 陪练（随时可以切磋，打输也无妨；D-049）----------------

=== npc: shaolin.sparring
name: 小沙弥
brief: 本门的陪练，可以随时切磋练功。
talk: shaolin.sparring.talk
---
一个圆头圆脑的小沙弥，扫地扫累了，正拿扫帚比划罗汉拳。

=== dialog: shaolin.sparring.talk
---
小沙弥：施主，陪小僧练练拳吧？师父说多打几遍才记得住。
* 好，切磋几招 !fight:world.b.shaolin_spar
* 下次吧

=== enemy: world.foe.shaolin_spar
weapon: 拳
name: 小沙弥
attrs: 根骨=12, 身法=16, 悟性=12
skills: shaolin.luohan=6, shaolin.jinzhong=6, base.tuna=5
ai: 刚=2, 守=2
cunning: 10
potential: 12
hpx: 0.7
---
一个圆头圆脑的小沙弥，扫地扫累了，正拿扫帚比划罗汉拳。

=== battle: world.b.shaolin_spar
enemies: world.foe.shaolin_spar
---
小沙弥摆开了架势。

# ================= 新增门派任务（D-054）：每天每个任务各做一次 =================

# ---- 巡视（走到地方就算完成）----
=== dialog: shaolin.task.patrol
do: flag:world.shaolin.task_patrol
---
慧明禅师：去后山巡视一圈，看看药圃和塔林是否安好。
（门派任务：巡视后山）

=== trigger: world.t.shaolin_patrol
room: shaolin.hill
if: flag:world.shaolin.task_patrol
do: unflag:world.shaolin.task_patrol today:world.shaolin.task_patrol rep:shaolin:30 potential:10
---
你沿着山道巡了一圈，药圃里的草药长势正好，塔林静悄悄的。（门派任务完成）

# ---- 送信（走到对方衙门就算完成）----
=== dialog: shaolin.task.deliver
do: flag:world.shaolin.task_deliver
---
慧明禅师：寺里有一封书信，要交给洛阳衙门的李都头，是关于山下赈粥的事。
（门派任务：把书信送到洛阳衙门，交给李都头）

=== trigger: world.t.shaolin_deliver
room: luoyang.office
if: flag:world.shaolin.task_deliver
do: unflag:world.shaolin.task_deliver today:world.shaolin.task_deliver rep:shaolin:30 potential:10
---
你把书信交给了李都头。李都头看了一眼封皮，郑重地收了起来。（门派任务完成）

# ---- 一阶：醉汉 ----
=== dialog: shaolin.task.b2
do: flag:world.shaolin.task_b2
---
慧明禅师：山门外有个醉汉闹事，请他下山去。莫伤他性命。
（门派任务：教训醉汉）

=== enemy: world.foe.shaolin_b2
weapon: 拳
name: 醉汉
attrs: 根骨=12, 身法=13, 悟性=8
skills: base.quan=9, base.zhaojia=7
ai: 刚=3, 守=1
potential: 20
---
一个喝得满脸通红的汉子，在山门前大吵大闹，非要进寺讨酒喝。

=== npc: world.npc.shaolin_b2
name: 醉汉
brief: 在附近滋事的醉汉。
if: flag:world.shaolin.task_b2
talk: world.shaolin_b2.talk
---
一个喝得满脸通红的汉子，在山门前大吵大闹，非要进寺讨酒喝。

=== dialog: world.shaolin_b2.talk
---
醉汉：看什么看？
* 动手 !fight:world.b.shaolin_b2
* 走开

=== battle: world.b.shaolin_b2
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.31
enemies: world.foe.shaolin_b2, world.foe.shaolin_b2
win: world.shaolin_b2.win
---
醉汉和同伙骂骂咧咧地扑了上来。

=== dialog: world.shaolin_b2.win
do: unflag:world.shaolin.task_b2 today:world.shaolin.task_b2 rep:shaolin:30
---
醉汉灰头土脸地走了。（门派任务完成）

=== patch: shaolin.gate
npcs: world.npc.shaolin_b2

# ---- 二阶：少林叛僧 ----
=== dialog: shaolin.task.b3
do: flag:world.shaolin.task_b3
---
慧明禅师：早年被逐出寺门的叛僧回来了，在后山出没。他武功不弱，你多加小心。
（门派任务：击败少林叛僧）

=== enemy: world.foe.shaolin_b3
weapon: 棍
weaponName: 镔铁棍
name: 少林叛僧
attrs: 根骨=18, 身法=18, 悟性=16
skills: shaolin.luohan=40, shaolin.jinzhong=38, base.zhang=34, shaolin.xinfa=38
ai: 刚=2, 守=2, 巧=1
cunning: 30
# 藏招：20% 的回合不露预兆
obscure: 20
potential: 90
---
一个被逐出寺门的武僧，眼中满是怨毒，手里一根镔铁棍。

=== npc: world.npc.shaolin_b3
name: 少林叛僧
brief: 本门的强敌。
if: flag:world.shaolin.task_b3
talk: world.shaolin_b3.talk
---
一个被逐出寺门的武僧，眼中满是怨毒，手里一根镔铁棍。

=== dialog: world.shaolin_b3.talk
---
少林叛僧冷冷地看着你：“就凭你？”
* 请赐教 !fight:world.b.shaolin_b3
* 退开

=== battle: world.b.shaolin_b3
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.32
enemies: world.foe.shaolin_b3
win: world.shaolin_b3.win
---
少林叛僧一言不发，出手便是杀招。

=== dialog: world.shaolin_b3.win
do: unflag:world.shaolin.task_b3 today:world.shaolin.task_b3 rep:shaolin:90
---
少林叛僧败退而去。这一战传回门中，同门都对你刮目相看。（门派任务完成）

=== patch: shaolin.hill
npcs: world.npc.shaolin_b3

# ---- 任务清单 ----
=== quest: world.q.shaolin_patrol
name: 慧明禅师的差遣：巡视后山
flag: world.shaolin.task_patrol
where: shaolin.hill
---
去后山巡视一圈，看看药圃和塔林是否安好。

=== quest: world.q.shaolin_deliver
name: 慧明禅师的差遣：送信到洛阳
flag: world.shaolin.task_deliver
where: luoyang.office
---
寺里有一封书信，要交给洛阳衙门的李都头，是关于山下赈粥的事。

=== quest: world.q.shaolin_b2
name: 慧明禅师的差遣：教训醉汉
flag: world.shaolin.task_b2
where: shaolin.gate
---
山门外有个醉汉闹事，请他下山去。莫伤他性命。

=== quest: world.q.shaolin_b3
name: 慧明禅师的差遣：击败少林叛僧
flag: world.shaolin.task_b3
where: shaolin.hill
---
早年被逐出寺门的叛僧回来了，在后山出没。他武功不弱，你多加小心。
