# 洛阳（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: luoyang
name: 洛阳
pos: 300,140
station: luoyang.station
routes: xiangyang=4, changan=4
goods: porcelain=0.75, iron=0.9, silk=1.25, tea=1.3, fur=1.0, salt=1.2, shujin=1.4, herbs=1.05
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
---
李都头：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> luoyang.job.bandit ?!flag:world.job.bandit_luoyang
* 有信要送去长安吗？ -> luoyang.job.mail_changan ?!flag:world.job.mail_changan
* 有信要送去襄阳吗？ -> luoyang.job.mail_xiangyang ?!flag:world.job.mail_xiangyang
* 交上长安衙门托付的书信 -> luoyang.job.deliver_changan ?flag:world.job.mail_luoyang_from_changan
* 交上襄阳衙门托付的书信 -> luoyang.job.deliver_xiangyang ?flag:world.job.mail_luoyang_from_xiangyang
* 离开

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
do: unflag:world.job.mail_luoyang unflag:world.job.mail_luoyang_from_changan money:90
---
李都头拆开火漆看了看，点点头，数了 90 文钱给你。
李都头：一路辛苦。

=== dialog: luoyang.job.deliver_xiangyang
do: unflag:world.job.mail_luoyang unflag:world.job.mail_luoyang_from_xiangyang money:90
---
李都头拆开火漆看了看，点点头，数了 90 文钱给你。
李都头：一路辛苦。

=== enemy: world.foe.luoyang_bandit
name: 邙山盗墓贼
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
win: world.luoyang_bandit.win
---
两个邙山盗墓贼抽出兵刃围了上来。

=== dialog: world.luoyang_bandit.win
do: unflag:world.job.bandit_luoyang money:80
---
邙山盗墓贼丢下兵刃，作鸟兽散。（差事完成，赏钱八十文。还可以再去衙门领差事）

# ---------------- 任务清单 ----------------

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
