# 嘉兴（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: jiaxing
name: 嘉兴
pos: 600,225
station: jiaxing.station
routes: linan=1
goods: silk=0.6, salt=0.65
---
江南水乡，南湖烟雨。离临安只有一日路程，丝绸和私盐都便宜。

=== room: jiaxing.center
name: 嘉兴·十字街
exits: 北=jiaxing.office, 南=jiaxing.station, 东=jiaxing.market, 西=jiaxing.inn
---
青石板路被雨水洗得发亮，河道从城中穿过，乌篷船咿咿呀呀地摇过石拱桥。

=== room: jiaxing.market
name: 嘉兴·市集
exits: 西=jiaxing.center, 北=jiaxing.bank
market: true
---
沿河的市集，丝绸铺子一家挨着一家，还有挑着盐担子吆喝的小贩。
在这里可以 行情、买、卖。

=== room: jiaxing.bank
name: 嘉兴·钱庄
exits: 南=jiaxing.market
bank: true
---
一间老字号钱庄，柜台后的账房先生戴着一副铜框眼镜。
在这里可以 存、取、存款。

=== room: jiaxing.inn
name: 嘉兴·客栈
exits: 东=jiaxing.center
inn: true
---
临河的客栈，推开窗就能看见南湖上的烟雨。
在这里可以 休息、修炼。

=== room: jiaxing.office
name: 嘉兴·衙门
exits: 南=jiaxing.center
npcs: jiaxing.officer
---
嘉兴府衙。门口的告示栏上贴着几张悬赏，纸角被风吹得哗啦作响。

=== room: jiaxing.station
name: 嘉兴·车马行
exits: 北=jiaxing.center
npcs: world.npc.jiaxing_bandit
station: true
---
城东的车马行，往来的多是去临安的客商。
在这里可以 乘车 去别的城市。

=== npc: jiaxing.officer
name: 孙捕头
brief: 嘉兴衙门的公差，发放除害、送信之类的差事。
talk: jiaxing.officer.talk
---
一个圆脸的捕头，说话慢条斯理，腰刀却擦得锃亮。

=== dialog: jiaxing.officer.talk
ifnone: 孙捕头：今天的差事都派完了，明天再来吧。
---
孙捕头：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> jiaxing.job.bandit ?!flag:world.job.bandit_jiaxing ?!today:world.job.bandit_jiaxing
* 听说城里闹飞贼？ -> jiaxing.job.thief ?!flag:world.job.thief_jiaxing ?!today:world.job.thief_jiaxing
* 要不要去客栈查查外乡人？ -> jiaxing.job.patrol ?!flag:world.job.patrol_jiaxing ?!today:world.job.patrol_jiaxing
* 有信要送去临安吗？ -> jiaxing.job.mail_linan ?!flag:world.job.mail_linan ?!today:world.job.mailday_jiaxing_linan
* 交上临安衙门托付的书信 -> jiaxing.job.deliver_linan ?flag:world.job.mail_jiaxing_from_linan
* 离开

=== dialog: jiaxing.job.thief
do: flag:world.job.thief_jiaxing
---
孙捕头：这几天市集上丢东西的人多，是个手脚利落的飞贼干的。去市集把他揪出来，赏钱一百二十文。
（差事：在嘉兴市集缉拿飞贼）

=== enemy: world.foe.jiaxing_thief
weapon: 匕首
name: 飞贼
attrs: 根骨=12, 身法=20, 悟性=12
skills: base.zhang=20, base.quan=14, base.zhaojia=14, base.tuna=18
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 26
---
一个精瘦的汉子，眼珠滴溜溜乱转，袖子里鼓鼓囊囊的。

=== npc: world.npc.jiaxing_thief
name: 飞贼
brief: 在嘉兴市集偷东西的飞贼。
if: flag:world.job.thief_jiaxing
talk: world.jiaxing_thief.talk
---
一个精瘦的汉子在人群里钻来钻去，手不太老实。

=== dialog: world.jiaxing_thief.talk
---
飞贼被你盯上，脸色一变，手已摸向腰间。
* 拿下他 !fight:world.b.jiaxing_thief
* 算了

=== battle: world.b.jiaxing_thief
enemies: world.foe.jiaxing_thief
# 难度调校（tools/tune.mjs）
hpx: 1.19
win: world.jiaxing_thief.win
---
飞贼拔出一把匕首，寒光一闪。

=== dialog: world.jiaxing_thief.win
do: unflag:world.job.thief_jiaxing today:world.job.thief_jiaxing money:120
---
飞贼被你按倒在地，偷来的钱袋散了一地。（差事完成，赏钱一百二十文）

=== patch: jiaxing.market
npcs: world.npc.jiaxing_thief

=== dialog: jiaxing.job.patrol
do: flag:world.job.patrol_jiaxing
---
孙捕头：近来外乡人多，去客栈查一查住店的有没有可疑之人。不用动手，看一圈回来就行。赏钱四十文。
（差事：去嘉兴客栈查访）

=== trigger: world.t.jiaxing_patrol
room: jiaxing.inn
if: flag:world.job.patrol_jiaxing
do: unflag:world.job.patrol_jiaxing today:world.job.patrol_jiaxing money:40 potential:15
---
你跟掌柜要来住店的名簿翻了一遍，又在大堂里转了转，没发现什么可疑之人。（差事完成，赏钱四十文）

=== dialog: jiaxing.job.bandit
do: flag:world.job.bandit_jiaxing
---
孙捕头：码头边有一伙南湖水贼作乱，去把他们打发了，赏钱八十文。
（差事：在嘉兴车马行外教训南湖水贼）

=== dialog: jiaxing.job.mail_linan
do: flag:world.job.mail_linan flag:world.job.mail_linan_from_jiaxing
---
孙捕头递给你一个封了火漆的信封：“送到临安衙门，那边自会付你 45 文脚钱。”
（差事：把书信送到临安衙门。坐马车 1 日可到）

=== dialog: jiaxing.job.deliver_linan
do: unflag:world.job.mail_jiaxing unflag:world.job.mail_jiaxing_from_linan money:45 potential:10 today:world.job.mailday_linan_jiaxing
---
孙捕头拆开火漆看了看，点点头，数了 45 文钱给你。
孙捕头：一路辛苦。

=== enemy: world.foe.jiaxing_bandit
name: 南湖水贼
weapon: 刀
weaponName: 鱼叉
attrs: 根骨=14, 身法=14, 悟性=10
skills: base.quan=10, base.zhang=6, base.zhaojia=6, base.tuna=10
ai: 刚=3, 巧=2, 守=1
cunning: 15
potential: 20
---
几个赤着脚的水贼，在码头上敲诈过往船家。

=== npc: world.npc.jiaxing_bandit
name: 南湖水贼
brief: 在嘉兴一带作乱的南湖水贼。
if: flag:world.job.bandit_jiaxing
talk: world.jiaxing_bandit.talk
---
几个赤着脚的水贼，在码头上敲诈过往船家。

=== dialog: world.jiaxing_bandit.talk
---
南湖水贼：哟，又来一个送死的？
* 动手 !fight:world.b.jiaxing_bandit
* 走开

=== battle: world.b.jiaxing_bandit
enemies: world.foe.jiaxing_bandit, world.foe.jiaxing_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 0.49
win: world.jiaxing_bandit.win
---
两个南湖水贼抽出兵刃围了上来。

=== dialog: world.jiaxing_bandit.win
do: unflag:world.job.bandit_jiaxing today:world.job.bandit_jiaxing money:80
---
南湖水贼丢下兵刃，作鸟兽散。（差事完成，赏钱八十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.jiaxing_thief
name: 缉拿：嘉兴飞贼
flag: world.job.thief_jiaxing
where: jiaxing.market
---
嘉兴衙门的差事：去市集缉拿飞贼。赏钱 120 文。

=== quest: world.q.jiaxing_patrol
name: 查访：嘉兴客栈
flag: world.job.patrol_jiaxing
where: jiaxing.inn
---
嘉兴衙门的差事：去客栈查访外乡人。赏钱 40 文。

=== quest: world.q.jiaxing_bandit
name: 除害：南湖水贼
flag: world.job.bandit_jiaxing
where: jiaxing.station
---
嘉兴衙门的差事：去嘉兴车马行教训码头边作乱的南湖水贼。赏钱 80 文。

=== quest: world.q.mail_jiaxing_linan
name: 送信：嘉兴 → 临安
flag: world.job.mail_linan_from_jiaxing
where: linan.yamen
---
把嘉兴衙门的书信送到临安衙门，脚钱 45 文。坐马车 1 日。

# ---------------- 天龙八部新增：嘉兴 ←→ 苏州 的送信差事 ----------------

=== patch: jiaxing.officer.talk
---
* 有信要送去苏州吗？ -> jiaxing.job.mail_suzhou ?!flag:world.job.mail_suzhou ?!today:world.job.mailday_jiaxing_suzhou
* 交上苏州府衙托付的书信 -> jiaxing.job.deliver_suzhou ?flag:world.job.mail_jiaxing_from_suzhou

=== dialog: jiaxing.job.mail_suzhou
do: flag:world.job.mail_suzhou flag:world.job.mail_suzhou_from_jiaxing
---
捕头从案上取过一封信：“往北一日就是苏州，送到府衙去，那边付你 45 文脚钱。”
（差事：把书信送到苏州府衙。坐马车 1 日可到）

=== dialog: jiaxing.job.deliver_suzhou
do: unflag:world.job.mail_jiaxing unflag:world.job.mail_jiaxing_from_suzhou money:45 potential:10 today:world.job.mailday_suzhou_jiaxing
---
捕头认得那个火漆印，数了 45 文给你。

=== quest: world.q.mail_jiaxing_suzhou
name: 送信：嘉兴 → 苏州
flag: world.job.mail_suzhou_from_jiaxing
where: suzhou.office
---
把嘉兴衙门的书信送到苏州府衙，脚钱 45 文。坐马车 1 日。
