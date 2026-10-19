# 苏州（城市）。天龙八部会话新增（D-216）。格式照其他城市手写，没有用 gen_cities.py。
# 和嘉兴通车马，一日路程。本地特产：苏绣、丝绸、茶叶（跑商规则见 docs/ECONOMY.md §3）。

=== city: suzhou
name: 苏州
pos: 615,166
station: suzhou.station
routes: jiaxing=1
goods: suxiu=0.6, silk=0.65, tea=0.7
---
水比路多的一座城。出城往西就是太湖，湖上烟水迷离，岛屿一个连着一个。苏绣、丝绸、茶叶都便宜，运到北边价钱翻几番。

=== room: suzhou.center
name: 苏州·阊门大街
exits: 北=suzhou.office, 南=suzhou.station, 东=suzhou.market, 西=suzhou.inn
---
一条街，半条是水。石桥一座接一座，桥底下的船擦着船过去，船娘站在船头随口对骂两句，又笑着分开。
卖花的小姑娘挎着篮子沿河走，篮子里是半开的白兰花，走一路香一路。

=== room: suzhou.market
name: 苏州·绣市
exits: 西=suzhou.center, 北=suzhou.bank
market: true
---
整条巷子都是绣庄，绷子支在门口，针线在绢上一来一回，看久了眼睛发花。
茶行的伙计把新茶摊在竹匾里，隔着老远就闻得到那股清苦气。
在这里可以 行情、买、卖。

=== room: suzhou.bank
name: 苏州·钱庄
exits: 南=suzhou.market
bank: true
---
钱庄的柜台比别处高，掌柜隔着铁栅栏说话，一口软糯的吴语，算起账来却一文不让。
在这里可以 存、取、存款。

=== room: suzhou.inn
name: 苏州·枕河客栈
exits: 东=suzhou.center
inn: true
---
客栈临着河，后窗一推开就是水，夜里有船从窗下过，橹声咿咿呀呀，听着听着人就睡着了。
在这里可以 休息、修炼。

=== room: suzhou.office
name: 苏州·府衙
exits: 南=suzhou.center
npcs: suzhou.officer
---
府衙门前一对石狮子被摸得油亮。门房支着一张小桌吃面，吃得吸溜作响，见人来了也不抬头。

=== room: suzhou.station
name: 苏州·车马行
exits: 北=suzhou.center
npcs: world.npc.suzhou_bandit
station: true
---
城南的车马行。往南一日就到嘉兴，再往南便是临安。车把式多半兼着跑船，谈起太湖上的风浪头头是道。
在这里可以 乘车 去别的城市。

=== npc: suzhou.officer
name: 沈推官
brief: 苏州府衙的推官，发放除害、查访、送信之类的差事。
talk: suzhou.officer.talk
---
一个白净瘦削的中年人，指甲修得干干净净，说话慢，听人说话却极专注。

=== dialog: suzhou.officer.talk
ifnone: 沈推官：今日的差事都派出去了，明日请早。
---
沈推官：这位{男:壮士|女:女侠}是外乡来的罢？苏州城里太平，城外的水上可就未必了。
* 太湖上的水匪要不要管？ -> suzhou.job.bandit ?!flag:world.job.bandit_suzhou ?!today:world.job.bandit_suzhou
* 听说绣市上丢了东西？ -> suzhou.job.thief ?!flag:world.job.thief_suzhou ?!today:world.job.thief_suzhou
* 要不要去客栈查查外乡人？ -> suzhou.job.patrol ?!flag:world.job.patrol_suzhou ?!today:world.job.patrol_suzhou
* 有信要送去嘉兴吗？ -> suzhou.job.mail_jiaxing ?!flag:world.job.mail_jiaxing ?!today:world.job.mailday_suzhou_jiaxing
* 交上嘉兴衙门托付的书信 -> suzhou.job.deliver_jiaxing ?flag:world.job.mail_suzhou_from_jiaxing
* 告辞

=== dialog: suzhou.job.bandit
do: flag:world.job.bandit_suzhou
---
沈推官：太湖上有一伙水匪，专在货船过浅滩时动手。他们近来胆子大了，连城南车马行外的脚货也敢抢。你去撞上了，替官府教训一顿，赏钱一百二十文。
（差事：在苏州车马行外教训太湖水匪）

=== dialog: suzhou.job.thief
do: flag:world.job.thief_suzhou
---
沈推官：绣市上丢了好几幅成品绣。那贼不偷钱，专偷绣，想来是识货的。你去巷子里走一趟，赏钱一百三十文。
（差事：在苏州绣市缉拿窃绣的贼）

=== dialog: suzhou.job.patrol
do: flag:world.job.patrol_suzhou
---
沈推官：近来住店的生面孔多，有几个口音是北边的。你去枕河客栈看一眼名簿，回来说一声，不用动手。赏钱四十文。
（差事：去苏州枕河客栈查访）

=== dialog: suzhou.job.mail_jiaxing
do: flag:world.job.mail_jiaxing flag:world.job.mail_jiaxing_from_suzhou
---
沈推官封好一封信：“送到嘉兴衙门，一日的路，那边付你 45 文脚钱。”
（差事：把书信送到嘉兴衙门。坐马车 1 日可到）

=== dialog: suzhou.job.deliver_jiaxing
do: unflag:world.job.mail_suzhou unflag:world.job.mail_suzhou_from_jiaxing money:45 potential:10 today:world.job.mailday_jiaxing_suzhou
---
沈推官拆开看了一眼，点点头，数了 45 文给你。
沈推官：一日的路，辛苦。

# ---------------- 差事里的敌人 ----------------

=== enemy: world.foe.suzhou_bandit
name: 太湖水匪
weapon: 刀
weaponName: 鱼叉改的短刀
attrs: 根骨=18, 身法=18, 悟性=11
skills: base.quan=22, base.dao=18, base.zhaojia=18, base.tuna=20
ai: 刚=3, 巧=2, 守=1
cunning: 15
potential: 48
weaponBonus: 75
---
常年在船上讨生活的人，腿脚在晃动的甲板上比在地上还稳，一身水腥气。

=== npc: world.npc.suzhou_bandit
name: 太湖水匪
brief: 在太湖上劫货船的水匪，近来上了岸。
if: flag:world.job.bandit_suzhou
talk: world.suzhou_bandit.talk
---
两个赤脚汉子蹲在车马行外的货堆边，眼睛一直往麻包上瞟。

=== dialog: world.suzhou_bandit.talk
---
太湖水匪站起身，把短刀在掌心拍了拍：“这堆货，谁的？”
* 动手 !fight:world.b.suzhou_bandit
* 走开

=== battle: world.b.suzhou_bandit
enemies: world.foe.suzhou_bandit, world.foe.suzhou_bandit
adapt: true
win: world.suzhou_bandit.win
---
两个水匪一前一后围上来，脚下踩着货堆的边沿，稳得像踩在船板上。

=== dialog: world.suzhou_bandit.win
do: unflag:world.job.bandit_suzhou today:world.job.bandit_suzhou money:120
---
两个水匪翻过货堆跳进河里，水花一响就没了影。（差事完成，赏钱一百二十文）

=== enemy: world.foe.suzhou_thief
weapon: 匕首
attrs: 根骨=15, 身法=24, 悟性=14
skills: base.zhang=40, base.quan=32, base.zhaojia=32, base.tuna=36
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 50
---
穿着绸衫、手上没有老茧的贼。他偷绣不偷钱，拿起绣品先看针脚。

=== npc: world.npc.suzhou_thief
name: 窃绣的贼
brief: 在苏州绣市上专偷成品绣的贼。
if: flag:world.job.thief_suzhou
talk: world.suzhou_thief.talk
---
一个穿绸衫的人在绣庄门口徘徊，手背在身后，眼睛黏在绷子上。

=== dialog: world.suzhou_thief.talk
---
那人见你盯着他，袖子一抖，掌心里多了一柄薄刃：“看什么看。”
* 拿下他 !fight:world.b.suzhou_thief
* 算了

=== battle: world.b.suzhou_thief
enemies: world.foe.suzhou_thief
adapt: true
win: world.suzhou_thief.win
---
薄刃贴着绣绷划过去，绢面裂了一道口子。

=== dialog: world.suzhou_thief.win
do: unflag:world.job.thief_suzhou today:world.job.thief_suzhou money:130
---
那人被你按在绣绷上，怀里抖出七八幅卷好的绣品，每一幅都用软纸包着。（差事完成，赏钱一百三十文）

=== patch: suzhou.market
npcs: world.npc.suzhou_thief

=== trigger: world.t.suzhou_patrol
room: suzhou.inn
if: flag:world.job.patrol_suzhou
do: unflag:world.job.patrol_suzhou today:world.job.patrol_suzhou money:40 potential:15
---
你把名簿从头翻到尾，又在后窗的河埠头站了一会儿。住店的多是茶商和赶考的书生，没什么可疑之人。（差事完成，赏钱四十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.suzhou_bandit
name: 除害：太湖水匪
flag: world.job.bandit_suzhou
where: suzhou.station
---
苏州府衙的差事：去车马行外教训上了岸的太湖水匪。赏钱 120 文。

=== quest: world.q.suzhou_thief
name: 缉拿：窃绣的贼
flag: world.job.thief_suzhou
where: suzhou.market
---
苏州府衙的差事：去绣市缉拿专偷成品绣的贼。赏钱 130 文。

=== quest: world.q.suzhou_patrol
name: 查访：枕河客栈
flag: world.job.patrol_suzhou
where: suzhou.inn
---
苏州府衙的差事：去枕河客栈查访外乡人。赏钱 40 文。

=== quest: world.q.mail_suzhou_jiaxing
name: 送信：苏州 → 嘉兴
flag: world.job.mail_jiaxing_from_suzhou
where: jiaxing.office
---
把苏州府衙的书信送到嘉兴衙门，脚钱 45 文。坐马车 1 日。

# ---------------- 百科 ----------------

=== entry: world.e.suzhou
name: 苏州
---
江南的一座水城，桥多、船多、绣庄多。城外就是太湖，湖上散着大大小小的岛，岛上住着些不喜欢被人打扰的人家。
本地出产的苏绣名贵，一幅上好的绣品抵得过寻常人家半年嚼用。

=== entry: world.e.taihu
name: 太湖
---
苏州城西的大湖，烟水茫茫，岛屿星罗。渔家说，湖上的雾起来的时候，连在湖上住了一辈子的人也会迷路。
湖上有水匪，也有庄院。有些庄院从岸上根本望不见。
