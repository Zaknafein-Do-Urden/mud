# 长安（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: changan
name: 长安
pos: 190,130
station: changan.station
routes: luoyang=4, chengdu=9
goods: fur=0.6, salt=0.7
areas: huashan, quanzhen
---
汉唐故都，关中重镇，西域的皮货从这里进来。往东是西岳华山，往南是终南山全真教。

=== room: changan.center
name: 长安·十字街
exits: 北=changan.office, 南=changan.station, 东=changan.market, 西=changan.inn
---
城郭依旧宏大，坊墙却已倒了大半。驼队从西门进来，驼铃声在街上回荡。

=== room: changan.market
name: 长安·市集
exits: 西=changan.center, 北=changan.bank
market: true
---
皮货、青盐堆成了小山，胡商操着生硬的汉话讨价还价。
在这里可以 行情、买、卖。

=== room: changan.bank
name: 长安·钱庄
exits: 南=changan.market
bank: true
---
钱庄门面不大，后院却有一间铁皮包着的库房。
在这里可以 存、取、存款。

=== room: changan.inn
name: 长安·客栈
exits: 东=changan.center
inn: true
shop: food.mantou, food.niurou, food.jiaohuaji, food.mijiu, food.nverhong, food.houerjiu
---
客栈的伙计会说三四种话，回回、党项、女真的客人都招呼得来。
在这里可以 休息、修炼。

=== room: changan.office
name: 长安·衙门
exits: 南=changan.center
npcs: changan.officer
---
京兆府衙。衙门口的大鼓蒙着一层灰，看样子很久没人敢敲了。

=== room: changan.station
name: 长安·车马行
exits: 北=changan.center
npcs: world.npc.changan_bandit
station: true
---
城东的车马行，往洛阳的路好走，往成都的蜀道就难了。
在这里可以 乘车 去别的城市。

=== npc: changan.officer
name: 赵捕快
brief: 长安衙门的公差，发放除害、送信之类的差事。
talk: changan.officer.talk
---
一个瘦高个的捕快，脸被风沙吹得黝黑。

=== dialog: changan.officer.talk
ifnone: 赵捕快：今天的差事都派完了，明天再来吧。
---
赵捕快：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> changan.job.bandit ?pick:office.changan:bandit ?!flag:world.job.bandit_changan ?!today:world.job.bandit_changan
* 听说城里闹飞贼？ -> changan.job.thief ?pick:office.changan:thief ?!flag:world.job.thief_changan ?!today:world.job.thief_changan
* 要不要去客栈查查外乡人？ -> changan.job.patrol ?pick:office.changan:patrol ?!flag:world.job.patrol_changan ?!today:world.job.patrol_changan
* 有信要送去成都吗？ -> changan.job.mail_chengdu ?!flag:world.job.mail_chengdu ?!today:world.job.mailday_changan_chengdu
* 有信要送去洛阳吗？ -> changan.job.mail_luoyang ?!flag:world.job.mail_luoyang ?!today:world.job.mailday_changan_luoyang
* 交上成都衙门托付的书信 -> changan.job.deliver_chengdu ?flag:world.job.mail_changan_from_chengdu
* 交上洛阳衙门托付的书信 -> changan.job.deliver_luoyang ?flag:world.job.mail_changan_from_luoyang
* 可有告示要张贴？ -> changan.job.notice ?pick:office.changan:notice ?!flag:world.job.notice_changan ?!today:world.job.notice_changan
* 钱庄那边可有事？ -> changan.job.ledger ?pick:office.changan:ledger ?!flag:world.job.ledger_changan ?!today:world.job.ledger_changan
* 要不要去市集巡夜？ -> changan.job.night ?pick:office.changan:night ?!flag:world.job.night_changan ?!today:world.job.night_changan
* 客栈里可有人闹事？ -> changan.job.drunk ?pick:office.changan:drunk ?!flag:world.job.drunk_changan ?!today:world.job.drunk_changan
* 车马行那边可有可疑的人？ -> changan.job.kidnap ?pick:office.changan:kidnap ?!flag:world.job.kidnap_changan ?!today:world.job.kidnap_changan
* 离开

=== dialog: changan.job.thief
do: flag:world.job.thief_changan
---
赵捕快：这几天市集上丢东西的人多，是个手脚利落的飞贼干的。去市集把他揪出来，赏钱一百二十文。
（差事：在长安市集缉拿飞贼）

=== enemy: world.foe.changan_thief
weapon: 匕首
name: 飞贼
attrs: 根骨=15, 身法=23, 悟性=12
skills: base.zhang=40, base.quan=34, base.zhaojia=34, base.tuna=38
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 50
---
一个精瘦的汉子，眼珠滴溜溜乱转，袖子里鼓鼓囊囊的。

=== npc: world.npc.changan_thief
name: 飞贼
brief: 在长安市集偷东西的飞贼。
if: flag:world.job.thief_changan
talk: world.changan_thief.talk
---
一个精瘦的汉子在人群里钻来钻去，手不太老实。

=== dialog: world.changan_thief.talk
---
飞贼被你盯上，脸色一变，手已摸向腰间。
* 拿下他 !fight:world.b.changan_thief
* 算了

=== battle: world.b.changan_thief
enemies: world.foe.changan_thief
# 难度调校（tools/tune.mjs）
hpx: 2.1
win: world.changan_thief.win
---
飞贼拔出一把匕首，寒光一闪。

=== dialog: world.changan_thief.win
do: unflag:world.job.thief_changan today:world.job.thief_changan money:120
---
飞贼被你按倒在地，偷来的钱袋散了一地。（差事完成，赏钱一百二十文）

=== patch: changan.market
npcs: world.npc.changan_thief

=== dialog: changan.job.patrol
do: flag:world.job.patrol_changan
---
赵捕快：近来外乡人多，去客栈查一查住店的有没有可疑之人。不用动手，看一圈回来就行。赏钱四十文。
（差事：去长安客栈查访）

=== trigger: world.t.changan_patrol
room: changan.inn
if: flag:world.job.patrol_changan
do: unflag:world.job.patrol_changan today:world.job.patrol_changan money:40 potential:15
---
你跟掌柜要来住店的名簿翻了一遍，又在大堂里转了转，没发现什么可疑之人。（差事完成，赏钱四十文）

=== dialog: changan.job.bandit
do: flag:world.job.bandit_changan
---
赵捕快：灞桥边有一伙关中刀客作乱，去把他们打发了，赏钱八十文。
（差事：在长安车马行外教训关中刀客）

=== dialog: changan.job.mail_chengdu
do: flag:world.job.mail_chengdu flag:world.job.mail_chengdu_from_changan
---
赵捕快递给你一个封了火漆的信封：“送到成都衙门，那边自会付你 165 文脚钱。”
（差事：把书信送到成都衙门。坐马车 9 日可到）

=== dialog: changan.job.mail_luoyang
do: flag:world.job.mail_luoyang flag:world.job.mail_luoyang_from_changan
---
赵捕快递给你一个封了火漆的信封：“送到洛阳衙门，那边自会付你 90 文脚钱。”
（差事：把书信送到洛阳衙门。坐马车 4 日可到）

=== dialog: changan.job.deliver_chengdu
do: unflag:world.job.mail_changan unflag:world.job.mail_changan_from_chengdu money:165 potential:10 today:world.job.mailday_chengdu_changan
---
赵捕快拆开火漆看了看，点点头，数了 165 文钱给你。
赵捕快：一路辛苦。

=== dialog: changan.job.deliver_luoyang
do: unflag:world.job.mail_changan unflag:world.job.mail_changan_from_luoyang money:90 potential:10 today:world.job.mailday_luoyang_changan
---
赵捕快拆开火漆看了看，点点头，数了 90 文钱给你。
赵捕快：一路辛苦。

=== enemy: world.foe.changan_bandit
name: 关中刀客
weapon: 刀
weaponName: 长刀
attrs: 根骨=17, 身法=16, 悟性=10
skills: base.quan=22, base.zhang=18, base.zhaojia=18, base.tuna=22
ai: 刚=3, 巧=2, 守=1
cunning: 15
potential: 44
---
几个背着长刀的汉子，在官道上拦路收"买路钱"。

=== npc: world.npc.changan_bandit
name: 关中刀客
brief: 在长安一带作乱的关中刀客。
if: flag:world.job.bandit_changan
talk: world.changan_bandit.talk
---
几个背着长刀的汉子，在官道上拦路收"买路钱"。

=== dialog: world.changan_bandit.talk
---
关中刀客：哟，又来一个送死的？
* 动手 !fight:world.b.changan_bandit
* 走开

=== battle: world.b.changan_bandit
enemies: world.foe.changan_bandit, world.foe.changan_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.08
win: world.changan_bandit.win
---
两个关中刀客抽出兵刃围了上来。

=== dialog: world.changan_bandit.win
do: unflag:world.job.bandit_changan today:world.job.bandit_changan money:80
---
关中刀客丢下兵刃，作鸟兽散。（差事完成，赏钱八十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.changan_thief
name: 缉拿：长安飞贼
flag: world.job.thief_changan
where: changan.market
---
长安衙门的差事：去市集缉拿飞贼。赏钱 120 文。

=== quest: world.q.changan_patrol
name: 查访：长安客栈
flag: world.job.patrol_changan
where: changan.inn
---
长安衙门的差事：去客栈查访外乡人。赏钱 40 文。

=== quest: world.q.changan_bandit
name: 除害：关中刀客
flag: world.job.bandit_changan
where: changan.station
---
长安衙门的差事：去长安车马行教训灞桥边作乱的关中刀客。赏钱 80 文。

=== quest: world.q.mail_changan_chengdu
name: 送信：长安 → 成都
flag: world.job.mail_chengdu_from_changan
where: chengdu.office
---
把长安衙门的书信送到成都衙门，脚钱 165 文。坐马车 9 日。

=== quest: world.q.mail_changan_luoyang
name: 送信：长安 → 洛阳
flag: world.job.mail_luoyang_from_changan
where: luoyang.office
---
把长安衙门的书信送到洛阳衙门，脚钱 90 文。坐马车 4 日。
