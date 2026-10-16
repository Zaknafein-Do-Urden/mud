# 大理（城市）。天龙八部会话新增（D-200）。格式照其他城市手写，没有用 gen_cities.py。
# 和成都通车马，七日路程。本地特产：滇马、茶叶、药材（跑商规则见 docs/ECONOMY.md §3）。

=== city: dali
name: 大理
pos: 62,348
station: dali.station
routes: chengdu=7
goods: dianma=0.6, tea=0.6, herbs=0.7
---
苍山十九峰下，洱海之滨。大理国都，段氏为君，上下崇佛，家家流水，户户养花。滇马、茶叶、药材都便宜，出了蜀道价钱翻几番。

=== room: dali.center
name: 大理·五华楼下
exits: 北=dali.office, 南=dali.station, 东=dali.market, 西=dali.inn
---
五华楼的檐角高高挑起，楼下是整座城最热闹的一条街。
卖乳扇的、卖花的、挑着担子卖酸木瓜的，挤了半条街。几个和尚托着钵慢慢走过，街上的人纷纷让路。
远处苍山上还压着雪，雪线底下是一片青得发黑的松林。

=== room: dali.market
name: 大理·三月街
exits: 西=dali.center, 北=dali.bank
market: true
---
三月街上货色杂得很：滇马、茶饼、三七、山货、蕃人的毡毯，还有从身毒那边辗转过来的珠子。
马贩子牵着矮壮的滇马在街口来回遛，马蹄踩在青石板上嘚嘚地响。
在这里可以 行情、买、卖。

=== room: dali.bank
name: 大理·钱庄
exits: 南=dali.market
bank: true
---
钱庄不大，柜台后头坐着个戴老花镜的老先生，算盘打得不快，一笔一笔却记得清楚。
在这里可以 存、取、存款。

=== room: dali.inn
name: 大理·洱海客栈
exits: 东=dali.center
inn: true
---
客栈临着洱海，推开窗就是一片水。晚上听得见浪拍在石堤上的声音。
掌柜的是个白族妇人，说一口夹生的汉话，待客却极热络，开口就要留你多住几日。
在这里可以 休息、修炼。

=== room: dali.office
name: 大理·提刑司
exits: 南=dali.center
npcs: dali.officer
---
大理国的衙门，门口没有鸣冤鼓，只有一口铜钟。墙上贴着几张榜文，字写得倒是清秀。
守门的差役靠着墙打盹，手里的水火棍快掉到地上了。

=== room: dali.station
name: 大理·车马行
exits: 北=dali.center
npcs: world.npc.dali_bandit
station: true
---
城南的车马行。往北出蜀道的车马都在这里扎堆，车把式一边套马一边高声讲价。
在这里可以 乘车 去别的城市。

=== npc: dali.officer
name: 高提刑

brief: 大理提刑司的官差，发放除害、查访之类的差事。
talk: dali.officer.talk
---
一个面皮黝黑的中年人，腰里挂着一块乌木腰牌，说话慢条斯理，眼睛却很利。

=== dialog: dali.officer.talk
ifnone: 高提刑：今日的差事都派完了，明日再来。
---
高提刑：这位{男:壮士|女:女侠}面生得很，是从北边过来的罢？正好，衙门里有几桩琐事，缺人手。
* 点苍山的马贼要不要管？ -> dali.job.bandit ?!flag:world.job.bandit_dali ?!today:world.job.bandit_dali
* 听说街上丢了东西？ -> dali.job.thief ?!flag:world.job.thief_dali ?!today:world.job.thief_dali
* 要不要去客栈查查外乡人？ -> dali.job.patrol ?!flag:world.job.patrol_dali ?!today:world.job.patrol_dali
* 有信要送去成都吗？ -> dali.job.mail_chengdu ?!flag:world.job.mail_chengdu ?!today:world.job.mailday_dali_chengdu
* 交上成都衙门托付的书信 -> dali.job.deliver_chengdu ?flag:world.job.mail_dali_from_chengdu
* 告辞

=== dialog: dali.job.bandit
do: flag:world.job.bandit_dali
---
高提刑：点苍山下有一伙马贼，专抢往成都去的马队。你去车马行外候着，碰上了替我教训一顿，赏钱一百文。
（差事：在大理车马行教训点苍马贼）

=== dialog: dali.job.thief
do: flag:world.job.thief_dali
---
高提刑：三月街上这几日丢了好几个钱袋，是个手快的小贼。你去街上把他揪出来，赏钱一百二十文。
（差事：在大理三月街缉拿小贼）

=== dialog: dali.job.patrol
do: flag:world.job.patrol_dali
---
高提刑：近来生面孔多，有些还带着兵刃。你去洱海客栈的名簿上看一眼，回来说一声就行，不用动手。赏钱四十文。
（差事：去大理洱海客栈查访）

=== dialog: dali.job.mail_chengdu
do: flag:world.job.mail_chengdu flag:world.job.mail_chengdu_from_dali
---
高提刑取出一封火漆封口的文书：“送到成都衙门，那边付你 150 文脚钱。蜀道难走，路上当心。”
（差事：把书信送到成都衙门。坐马车 7 日可到）

=== dialog: dali.job.deliver_chengdu
do: unflag:world.job.mail_dali unflag:world.job.mail_dali_from_chengdu money:150 potential:10 today:world.job.mailday_chengdu_dali
---
高提刑拆开火漆看了一遍，点点头，数了 150 文给你。
高提刑：难为你走这一趟。

# ---------------- 差事里的敌人 ----------------

=== enemy: world.foe.dali_bandit
name: 点苍马贼
weapon: 刀
weaponName: 弯刀
attrs: 根骨=17, 身法=17, 悟性=11
skills: base.quan=20, base.dao=18, base.zhaojia=16, base.tuna=20
ai: 刚=3, 巧=2, 守=1
cunning: 15
potential: 42
---
在点苍山下劫马队的贼人，皮帽上插着一根山鸡翎，骑马比走路还稳。

=== npc: world.npc.dali_bandit
name: 点苍马贼
brief: 在大理一带劫马队的马贼。
if: flag:world.job.bandit_dali
talk: world.dali_bandit.talk
---
两个汉子牵着马在车马行外转悠，眼睛一直往货堆上瞟。

=== dialog: world.dali_bandit.talk
---
点苍马贼把弯刀往马鞍上一拍：“外乡人，识相的把货留下。”
* 动手 !fight:world.b.dali_bandit
* 走开

=== battle: world.b.dali_bandit
enemies: world.foe.dali_bandit, world.foe.dali_bandit
adapt: true
win: world.dali_bandit.win
---
两个马贼翻身下马，弯刀出鞘，一左一右围了上来。

=== dialog: world.dali_bandit.win
do: unflag:world.job.bandit_dali today:world.job.bandit_dali money:100
---
两个马贼抢过马背就跑，弯刀都来不及捡。（差事完成，赏钱一百文）

=== enemy: world.foe.dali_thief
weapon: 匕首
attrs: 根骨=14, 身法=23, 悟性=13
skills: base.zhang=36, base.quan=30, base.zhaojia=30, base.tuna=34
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 46
---
一个瘦小的汉子，赤着脚，在人堆里钻来钻去，手比眼睛还快。

=== npc: world.npc.dali_thief
name: 小贼
brief: 在大理三月街上偷钱袋的小贼。
if: flag:world.job.thief_dali
talk: world.dali_thief.talk
---
一个瘦小的汉子贴着货摊走，袖子底下的手不太老实。

=== dialog: world.dali_thief.talk
---
小贼被你盯住，脸色一变，反手就摸出了匕首。
* 拿下他 !fight:world.b.dali_thief
* 算了

=== battle: world.b.dali_thief
enemies: world.foe.dali_thief
adapt: true
win: world.dali_thief.win
---
小贼矮身一窜，匕首贴着地面挑了过来。

=== dialog: world.dali_thief.win
do: unflag:world.job.thief_dali today:world.job.thief_dali money:120
---
小贼被你按在货摊上，袖子里抖落出七八个钱袋。（差事完成，赏钱一百二十文）

=== patch: dali.market
npcs: world.npc.dali_thief

=== trigger: world.t.dali_patrol
room: dali.inn
if: flag:world.job.patrol_dali
do: unflag:world.job.patrol_dali today:world.job.patrol_dali money:40 potential:15
---
你跟掌柜要来名簿翻了一遍，又在堂上坐了半个时辰。住店的多半是马帮和香客，没什么可疑之人。（差事完成，赏钱四十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.dali_bandit
name: 除害：点苍马贼
flag: world.job.bandit_dali
where: dali.station
---
大理提刑司的差事：去车马行外教训点苍山下的马贼。赏钱 100 文。

=== quest: world.q.dali_thief
name: 缉拿：三月街小贼
flag: world.job.thief_dali
where: dali.market
---
大理提刑司的差事：去三月街缉拿偷钱袋的小贼。赏钱 120 文。

=== quest: world.q.dali_patrol
name: 查访：洱海客栈
flag: world.job.patrol_dali
where: dali.inn
---
大理提刑司的差事：去洱海客栈查访外乡人。赏钱 40 文。

=== quest: world.q.mail_dali_chengdu
name: 送信：大理 → 成都
flag: world.job.mail_chengdu_from_dali
where: chengdu.office
---
把大理提刑司的书信送到成都衙门，脚钱 150 文。坐马车 7 日。

# ---------------- 百科 ----------------

=== entry: world.e.dali
name: 大理
---
西南边陲的一个国家，都城也叫大理，在苍山洱海之间。段氏为君已历数代，国中崇佛，连皇帝也常有出家的。
民风平和，兵甲不盛，却出产最好的马。大宋与之互市，滇马一入蜀中，价钱便翻了几倍。

=== entry: world.e.cangshan
name: 点苍山
---
大理城西的大山，十九座山峰终年积雪，雪水化成十八条溪流注入洱海。山里产药，也藏着不少不愿见人的人。
