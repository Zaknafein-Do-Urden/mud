# 洛阳（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: luoyang
name: 洛阳
pos: 300,140
station: luoyang.station
routes: xiangyang=4, changan=4
goods: porcelain=0.6, iron=0.7
areas: shaolin
---
九朝古都，如今在金国治下。牡丹和瓷器天下闻名。往东南是嵩山少林寺。

=== room: luoyang.center
name: 洛阳·十字街
exits: 北=luoyang.office, 南=luoyang.station, 东=luoyang.market, 西=luoyang.inn
---
宫阙的残垣还在，只是城头换了旗号。街上汉人、女真人混杂，说话都压着嗓子。

=== room: luoyang.market
name: 洛阳·市集
exits: 西=luoyang.center, 北=luoyang.bank
market: true
---
瓷器摊子一字排开，青瓷白瓷在日头下泛着光。卖茶的却少，价钱贵得吓人。
在这里可以 行情、买、卖。

=== room: luoyang.bank
name: 洛阳·钱庄
exits: 南=luoyang.market
bank: true
---
钱庄的掌柜是个精明的山西人，金国的交钞、宋国的铜钱都收。
在这里可以 存、取、存款。

=== room: luoyang.inn
name: 洛阳·客栈
exits: 东=luoyang.center
inn: true
shop: food.mantou, food.niurou, food.jiaohuaji, food.mijiu, food.nverhong, food.houerjiu
---
客栈的院子里种着几株牡丹，可惜不是花开的时节。
在这里可以 休息、修炼。

=== room: luoyang.office
name: 洛阳·衙门
exits: 南=luoyang.center
npcs: luoyang.officer
---
洛阳府衙，门口站着女真兵丁。告示是用汉字和女真字两样写的。

=== room: luoyang.station
name: 洛阳·车马行
exits: 北=luoyang.center
npcs: world.npc.luoyang_bandit
station: true
---
城西的车马行，往襄阳、长安的车每日都有。
在这里可以 乘车 去别的城市。

=== npc: luoyang.officer
name: 李都头
brief: 洛阳衙门的公差，发放除害、送信之类的差事。
talk: luoyang.officer.talk
---
一个汉人都头，夹在金国官府和百姓之间，满脸愁苦。

=== dialog: luoyang.officer.talk
ifnone: 李都头：今天的差事都派完了，明天再来吧。
---
李都头：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> luoyang.job.bandit ?pick:office.luoyang:bandit ?!flag:world.job.bandit_luoyang ?!today:world.job.bandit_luoyang
* 听说城里闹飞贼？ -> luoyang.job.thief ?pick:office.luoyang:thief ?!flag:world.job.thief_luoyang ?!today:world.job.thief_luoyang
* 要不要去客栈查查外乡人？ -> luoyang.job.patrol ?pick:office.luoyang:patrol ?!flag:world.job.patrol_luoyang ?!today:world.job.patrol_luoyang
* 有信要送去长安吗？ -> luoyang.job.mail_changan ?!flag:world.job.mail_changan ?!today:world.job.mailday_luoyang_changan
* 有信要送去襄阳吗？ -> luoyang.job.mail_xiangyang ?!flag:world.job.mail_xiangyang ?!today:world.job.mailday_luoyang_xiangyang
* 交上长安衙门托付的书信 -> luoyang.job.deliver_changan ?flag:world.job.mail_luoyang_from_changan
* 交上襄阳衙门托付的书信 -> luoyang.job.deliver_xiangyang ?flag:world.job.mail_luoyang_from_xiangyang
* 可有告示要张贴？ -> luoyang.job.notice ?pick:office.luoyang:notice ?!flag:world.job.notice_luoyang ?!today:world.job.notice_luoyang
* 钱庄那边可有事？ -> luoyang.job.ledger ?pick:office.luoyang:ledger ?!flag:world.job.ledger_luoyang ?!today:world.job.ledger_luoyang
* 要不要去市集巡夜？ -> luoyang.job.night ?pick:office.luoyang:night ?!flag:world.job.night_luoyang ?!today:world.job.night_luoyang
* 客栈里可有人闹事？ -> luoyang.job.drunk ?pick:office.luoyang:drunk ?!flag:world.job.drunk_luoyang ?!today:world.job.drunk_luoyang
* 车马行那边可有可疑的人？ -> luoyang.job.kidnap ?pick:office.luoyang:kidnap ?!flag:world.job.kidnap_luoyang ?!today:world.job.kidnap_luoyang
* 离开

=== dialog: luoyang.job.thief
do: flag:world.job.thief_luoyang
---
李都头：这几天市集上丢东西的人多，是个手脚利落的飞贼干的。去市集把他揪出来，赏钱一百二十文。
（差事：在洛阳市集缉拿飞贼）

=== enemy: world.foe.luoyang_thief
weapon: 匕首
name: 飞贼
attrs: 根骨=14, 身法=22, 悟性=12
skills: base.zhang=36, base.quan=30, base.zhaojia=30, base.tuna=34
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 42
---
一个精瘦的汉子，眼珠滴溜溜乱转，袖子里鼓鼓囊囊的。

=== npc: world.npc.luoyang_thief
name: 飞贼
brief: 在洛阳市集偷东西的飞贼。
if: flag:world.job.thief_luoyang
talk: world.luoyang_thief.talk
---
一个精瘦的汉子在人群里钻来钻去，手不太老实。

=== dialog: world.luoyang_thief.talk
---
飞贼被你盯上，脸色一变，手已摸向腰间。
* 拿下他 !fight:world.b.luoyang_thief
* 算了

=== battle: world.b.luoyang_thief
enemies: world.foe.luoyang_thief
# 难度调校（tools/tune.mjs）
hpx: 2.44
win: world.luoyang_thief.win
---
飞贼拔出一把匕首，寒光一闪。

=== dialog: world.luoyang_thief.win
do: unflag:world.job.thief_luoyang today:world.job.thief_luoyang money:120
---
飞贼被你按倒在地，偷来的钱袋散了一地。（差事完成，赏钱一百二十文）

=== patch: luoyang.market
npcs: world.npc.luoyang_thief

=== dialog: luoyang.job.patrol
do: flag:world.job.patrol_luoyang
---
李都头：近来外乡人多，去客栈查一查住店的有没有可疑之人。不用动手，看一圈回来就行。赏钱四十文。
（差事：去洛阳客栈查访）

=== trigger: world.t.luoyang_patrol
room: luoyang.inn
if: flag:world.job.patrol_luoyang
do: unflag:world.job.patrol_luoyang today:world.job.patrol_luoyang money:40 potential:15
---
你跟掌柜要来住店的名簿翻了一遍，又在大堂里转了转，没发现什么可疑之人。（差事完成，赏钱四十文）

=== dialog: luoyang.job.bandit
do: flag:world.job.bandit_luoyang
---
李都头：北邙山下有一伙邙山盗墓贼作乱，去把他们打发了，赏钱八十文。
（差事：在洛阳车马行外教训邙山盗墓贼）

=== dialog: luoyang.job.mail_changan
do: flag:world.job.mail_changan flag:world.job.mail_changan_from_luoyang
---
李都头递给你一个封了火漆的信封：“送到长安衙门，那边自会付你 90 文脚钱。”
（差事：把书信送到长安衙门。坐马车 4 日可到）

=== dialog: luoyang.job.mail_xiangyang
do: flag:world.job.mail_xiangyang flag:world.job.mail_xiangyang_from_luoyang
---
李都头递给你一个封了火漆的信封：“送到襄阳衙门，那边自会付你 90 文脚钱。”
（差事：把书信送到襄阳衙门。坐马车 4 日可到）

=== dialog: luoyang.job.deliver_changan
do: unflag:world.job.mail_luoyang unflag:world.job.mail_luoyang_from_changan money:90 potential:10 today:world.job.mailday_changan_luoyang
---
李都头拆开火漆看了看，点点头，数了 90 文钱给你。
李都头：一路辛苦。

=== dialog: luoyang.job.deliver_xiangyang
do: unflag:world.job.mail_luoyang unflag:world.job.mail_luoyang_from_xiangyang money:90 potential:10 today:world.job.mailday_xiangyang_luoyang
---
李都头拆开火漆看了看，点点头，数了 90 文钱给你。
李都头：一路辛苦。

=== enemy: world.foe.luoyang_bandit
name: 邙山盗墓贼
weapon: 棍
weaponName: 洛阳铲
attrs: 根骨=16, 身法=15, 悟性=10
skills: base.quan=18, base.zhang=14, base.zhaojia=14, base.tuna=18
ai: 刚=3, 巧=2, 守=1
cunning: 15
potential: 36
---
几个鬼鬼祟祟的汉子，身上沾着泥土，腰里别着洛阳铲。

=== npc: world.npc.luoyang_bandit
name: 邙山盗墓贼
brief: 在洛阳一带作乱的邙山盗墓贼。
if: flag:world.job.bandit_luoyang
talk: world.luoyang_bandit.talk
---
几个鬼鬼祟祟的汉子，身上沾着泥土，腰里别着洛阳铲。

=== dialog: world.luoyang_bandit.talk
---
邙山盗墓贼：哟，又来一个送死的？
* 动手 !fight:world.b.luoyang_bandit
* 走开

=== battle: world.b.luoyang_bandit
enemies: world.foe.luoyang_bandit, world.foe.luoyang_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.84
win: world.luoyang_bandit.win
---
两个邙山盗墓贼抽出兵刃围了上来。

=== dialog: world.luoyang_bandit.win
do: unflag:world.job.bandit_luoyang today:world.job.bandit_luoyang money:80
---
邙山盗墓贼丢下兵刃，作鸟兽散。（差事完成，赏钱八十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.luoyang_thief
name: 缉拿：洛阳飞贼
flag: world.job.thief_luoyang
where: luoyang.market
---
洛阳衙门的差事：去市集缉拿飞贼。赏钱 120 文。

=== quest: world.q.luoyang_patrol
name: 查访：洛阳客栈
flag: world.job.patrol_luoyang
where: luoyang.inn
---
洛阳衙门的差事：去客栈查访外乡人。赏钱 40 文。

=== quest: world.q.luoyang_bandit
name: 除害：邙山盗墓贼
flag: world.job.bandit_luoyang
where: luoyang.station
---
洛阳衙门的差事：去洛阳车马行教训北邙山下作乱的邙山盗墓贼。赏钱 80 文。

=== quest: world.q.mail_luoyang_changan
name: 送信：洛阳 → 长安
flag: world.job.mail_changan_from_luoyang
where: changan.office
---
把洛阳衙门的书信送到长安衙门，脚钱 90 文。坐马车 4 日。

=== quest: world.q.mail_luoyang_xiangyang
name: 送信：洛阳 → 襄阳
flag: world.job.mail_xiangyang_from_luoyang
where: xiangyang.office
---
把洛阳衙门的书信送到襄阳衙门，脚钱 90 文。坐马车 4 日。
