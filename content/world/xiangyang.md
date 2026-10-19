# 襄阳（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: xiangyang
name: 襄阳
pos: 300,240
station: xiangyang.station
routes: linan=7, luoyang=4, chengdu=8
goods: iron=0.6, herbs=0.7
areas: wudang
---
汉水之滨的雄城，南宋北方的门户，城墙高厚，铁器出名。往西是武当山。

=== room: xiangyang.center
name: 襄阳·十字街
exits: 北=xiangyang.office, 南=xiangyang.station, 东=xiangyang.market, 西=xiangyang.inn
---
城墙又高又厚，街上随处可见披甲的军士。汉水的腥风从城外吹来，带着几分肃杀。

=== room: xiangyang.market
name: 襄阳·樊城集
exits: 西=xiangyang.center, 北=xiangyang.bank
market: true
---
集市挨着汉水码头，对岸就是樊城，渡船一趟趟把货运过来。
市集上铁匠铺的叮当声不绝于耳，刀枪锄犁都有，价钱比江南便宜得多。汉水上游采来的药材也在这里集散。
在这里可以 行情、买、卖。

=== room: xiangyang.bank
name: 襄阳·汉江钱庄
exits: 南=xiangyang.market
bank: true
---
“汉江”钱庄在襄阳开了三代，城头上打仗那几年也没关过门。
钱庄门口站着两个护院，柜台上的算盘珠子拨得飞快。
在这里可以 存、取、存款。

=== room: xiangyang.inn
name: 襄阳·安远客栈
exits: 东=xiangyang.center
inn: true
shop: food.mantou, food.niurou, food.jiaohuaji, food.mijiu, food.nverhong, food.houerjiu
---
客栈名叫“安远”，取的是守边安民的意思，掌柜的早年在襄阳守军里吃过粮，见了当兵的格外客气。
一间宽敞的客栈，大堂里坐满了南来北往的商旅和军汉。
在这里可以 休息、修炼。

=== room: xiangyang.office
name: 襄阳·衙门
exits: 南=xiangyang.center
npcs: xiangyang.officer
---
京西南路安抚使司的衙门，门前石狮威严，进出的多是军官。

=== room: xiangyang.station
name: 襄阳·车马行
exits: 北=xiangyang.center
npcs: world.npc.xiangyang_bandit
station: true
---
城南的车马行，往临安、洛阳、成都的车都有。车把式说话都带着湖北腔。
在这里可以 乘车 去别的城市。

=== npc: xiangyang.officer
name: 王捕头
brief: 襄阳衙门的公差，发放除害、送信之类的差事。
talk: xiangyang.officer.talk
---
一个黑脸膛的汉子，据说早年在军中当过伍长。

=== dialog: xiangyang.officer.talk
ifnone: 王捕头：今天的差事都派完了，明天再来吧。
---
王捕头：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> xiangyang.job.bandit ?pick:office.xiangyang:bandit ?!flag:world.job.bandit_xiangyang ?!today:world.job.bandit_xiangyang
* 听说城里闹飞贼？ -> xiangyang.job.thief ?pick:office.xiangyang:thief ?!flag:world.job.thief_xiangyang ?!today:world.job.thief_xiangyang
* 要不要去客栈查查外乡人？ -> xiangyang.job.patrol ?pick:office.xiangyang:patrol ?!flag:world.job.patrol_xiangyang ?!today:world.job.patrol_xiangyang
* 有信要送去成都吗？ -> xiangyang.job.mail_chengdu ?!flag:world.job.mail_chengdu ?!today:world.job.mailday_xiangyang_chengdu
* 有信要送去临安吗？ -> xiangyang.job.mail_linan ?!flag:world.job.mail_linan ?!today:world.job.mailday_xiangyang_linan
* 有信要送去洛阳吗？ -> xiangyang.job.mail_luoyang ?!flag:world.job.mail_luoyang ?!today:world.job.mailday_xiangyang_luoyang
* 有信要送去衡阳吗？ -> xiangyang.job.mail_hengyang ?!flag:world.job.mail_hengyang ?!today:world.job.mailday_xiangyang_hengyang
* 交上成都衙门托付的书信 -> xiangyang.job.deliver_chengdu ?flag:world.job.mail_xiangyang_from_chengdu
* 交上衡阳府托付的书信 -> xiangyang.job.deliver_hengyang ?flag:world.job.mail_xiangyang_from_hengyang
* 交上临安衙门托付的书信 -> xiangyang.job.deliver_linan ?flag:world.job.mail_xiangyang_from_linan
* 交上洛阳衙门托付的书信 -> xiangyang.job.deliver_luoyang ?flag:world.job.mail_xiangyang_from_luoyang
* 可有告示要张贴？ -> xiangyang.job.notice ?pick:office.xiangyang:notice ?!flag:world.job.notice_xiangyang ?!today:world.job.notice_xiangyang
* 钱庄那边可有事？ -> xiangyang.job.ledger ?pick:office.xiangyang:ledger ?!flag:world.job.ledger_xiangyang ?!today:world.job.ledger_xiangyang
* 要不要去市集巡夜？ -> xiangyang.job.night ?pick:office.xiangyang:night ?!flag:world.job.night_xiangyang ?!today:world.job.night_xiangyang
* 客栈里可有人闹事？ -> xiangyang.job.drunk ?pick:office.xiangyang:drunk ?!flag:world.job.drunk_xiangyang ?!today:world.job.drunk_xiangyang
* 车马行那边可有可疑的人？ -> xiangyang.job.kidnap ?pick:office.xiangyang:kidnap ?!flag:world.job.kidnap_xiangyang ?!today:world.job.kidnap_xiangyang
* 离开

=== dialog: xiangyang.job.thief
do: flag:world.job.thief_xiangyang
---
王捕头：这几天市集上丢东西的人多，是个手脚利落的飞贼干的。去樊城集把他揪出来，赏钱一百二十文。
（差事：在襄阳樊城集缉拿飞贼）

=== enemy: world.foe.xiangyang_thief
weapon: 匕首
name: 飞贼
attrs: 根骨=13, 身法=21, 悟性=12
skills: base.zhang=25, base.quan=19, base.zhaojia=19, base.tuna=23
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 36
---
一个精瘦的汉子，眼珠滴溜溜乱转，袖子里鼓鼓囊囊的。

=== npc: world.npc.xiangyang_thief
name: 飞贼
brief: 在襄阳樊城集偷东西的飞贼。
if: flag:world.job.thief_xiangyang
talk: world.xiangyang_thief.talk
---
一个精瘦的汉子在人群里钻来钻去，手不太老实。

=== dialog: world.xiangyang_thief.talk
---
飞贼被你盯上，脸色一变，手已摸向腰间。
* 拿下他 !fight:world.b.xiangyang_thief
* 算了

=== battle: world.b.xiangyang_thief
enemies: world.foe.xiangyang_thief
# 难度调校（tools/tune.mjs）
hpx: 1.3
win: world.xiangyang_thief.win
---
飞贼拔出一把匕首，寒光一闪。

=== dialog: world.xiangyang_thief.win
do: unflag:world.job.thief_xiangyang today:world.job.thief_xiangyang money:120
---
飞贼被你按倒在地，偷来的钱袋散了一地。（差事完成，赏钱一百二十文）

=== patch: xiangyang.market
npcs: world.npc.xiangyang_thief

=== dialog: xiangyang.job.patrol
do: flag:world.job.patrol_xiangyang
---
王捕头：近来外乡人多，去安远客栈查一查住店的有没有可疑之人。不用动手，看一圈回来就行。赏钱四十文。
（差事：去安远客栈查访）

=== trigger: world.t.xiangyang_patrol
room: xiangyang.inn
if: flag:world.job.patrol_xiangyang
do: unflag:world.job.patrol_xiangyang today:world.job.patrol_xiangyang money:40 potential:15
---
你跟掌柜要来住店的名簿翻了一遍，又在大堂里转了转，没发现什么可疑之人。（差事完成，赏钱四十文）

=== dialog: xiangyang.job.bandit
do: flag:world.job.bandit_xiangyang
---
王捕头：汉水边有一伙汉水水匪作乱，去把他们打发了，赏钱八十文。
（差事：在襄阳车马行外教训汉水水匪）

=== dialog: xiangyang.job.mail_chengdu
do: flag:world.job.mail_chengdu flag:world.job.mail_chengdu_from_xiangyang
---
王捕头递给你一个封了火漆的信封：“送到成都衙门，那边自会付你 150 文脚钱。”
（差事：把书信送到成都衙门。坐马车 8 日可到）

=== dialog: xiangyang.job.mail_linan
do: flag:world.job.mail_linan flag:world.job.mail_linan_from_xiangyang
---
王捕头递给你一个封了火漆的信封：“送到临安衙门，那边自会付你 135 文脚钱。”
（差事：把书信送到临安衙门。坐马车 7 日可到）

=== dialog: xiangyang.job.mail_luoyang
do: flag:world.job.mail_luoyang flag:world.job.mail_luoyang_from_xiangyang
---
王捕头递给你一个封了火漆的信封：“送到洛阳衙门，那边自会付你 90 文脚钱。”
（差事：把书信送到洛阳衙门。坐马车 4 日可到）

=== dialog: xiangyang.job.deliver_chengdu
do: unflag:world.job.mail_xiangyang unflag:world.job.mail_xiangyang_from_chengdu money:150 potential:10 today:world.job.mailday_chengdu_xiangyang
---
王捕头拆开火漆看了看，点点头，数了 150 文钱给你。
王捕头：一路辛苦。

=== dialog: xiangyang.job.deliver_linan
do: unflag:world.job.mail_xiangyang unflag:world.job.mail_xiangyang_from_linan money:135 potential:10 today:world.job.mailday_linan_xiangyang
---
王捕头拆开火漆看了看，点点头，数了 135 文钱给你。
王捕头：一路辛苦。

=== dialog: xiangyang.job.deliver_luoyang
do: unflag:world.job.mail_xiangyang unflag:world.job.mail_xiangyang_from_luoyang money:90 potential:10 today:world.job.mailday_luoyang_xiangyang
---
王捕头拆开火漆看了看，点点头，数了 90 文钱给你。
王捕头：一路辛苦。

=== enemy: world.foe.xiangyang_bandit
name: 汉水水匪
weapon: 刀
weaponName: 分水刀
attrs: 根骨=15, 身法=15, 悟性=10
skills: base.quan=15, base.zhang=11, base.zhaojia=11, base.tuna=15
ai: 刚=3, 巧=2, 守=1
cunning: 15
potential: 30
---
一伙驾着快船的水匪，专劫汉水上的货船。

=== npc: world.npc.xiangyang_bandit
name: 汉水水匪
brief: 在襄阳一带作乱的汉水水匪。
if: flag:world.job.bandit_xiangyang
talk: world.xiangyang_bandit.talk
---
一伙驾着快船的水匪，专劫汉水上的货船。

=== dialog: world.xiangyang_bandit.talk
---
汉水水匪：哟，又来一个送死的？
* 动手 !fight:world.b.xiangyang_bandit
* 走开

=== battle: world.b.xiangyang_bandit
enemies: world.foe.xiangyang_bandit, world.foe.xiangyang_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 0.62
win: world.xiangyang_bandit.win
---
两个汉水水匪抽出兵刃围了上来。

=== dialog: world.xiangyang_bandit.win
do: unflag:world.job.bandit_xiangyang today:world.job.bandit_xiangyang money:80
---
汉水水匪丢下兵刃，作鸟兽散。（差事完成，赏钱八十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.xiangyang_thief
name: 缉拿：襄阳飞贼
flag: world.job.thief_xiangyang
where: xiangyang.market
---
襄阳衙门的差事：去樊城集缉拿飞贼。赏钱 120 文。

=== quest: world.q.xiangyang_patrol
name: 查访：安远客栈
flag: world.job.patrol_xiangyang
where: xiangyang.inn
---
襄阳衙门的差事：去安远客栈查访外乡人。赏钱 40 文。

=== quest: world.q.xiangyang_bandit
name: 除害：汉水水匪
flag: world.job.bandit_xiangyang
where: xiangyang.station
---
襄阳衙门的差事：去襄阳车马行教训汉水边作乱的汉水水匪。赏钱 80 文。

# 衡阳（笑傲江湖会话新增，D-310）
=== dialog: xiangyang.job.mail_hengyang
do: flag:world.job.mail_hengyang flag:world.job.mail_hengyang_from_xiangyang
---
公人取出一封火漆封口的文书：“送到衡阳府，六日路程，那边付你 125 文脚钱。”
（差事：把书信送到衡阳府衙。坐马车 6 日可到）

=== dialog: xiangyang.job.deliver_hengyang
do: unflag:world.job.mail_xiangyang unflag:world.job.mail_xiangyang_from_hengyang money:125 potential:10 today:world.job.mailday_hengyang_xiangyang
---
公人拆开火漆看了一遍，数出 125 文：“衡阳那边这几日热闹得很罢？”

=== quest: world.q.mail_xiangyang_hengyang
name: 送信：襄阳 → 衡阳
flag: world.job.mail_hengyang_from_xiangyang
where: hengyang.office
---
把襄阳的书信送到衡阳府衙，脚钱 125 文。坐马车 6 日。

=== quest: world.q.mail_xiangyang_chengdu
name: 送信：襄阳 → 成都
flag: world.job.mail_chengdu_from_xiangyang
where: chengdu.office
---
把襄阳衙门的书信送到成都衙门，脚钱 150 文。坐马车 8 日。

=== quest: world.q.mail_xiangyang_linan
name: 送信：襄阳 → 临安
flag: world.job.mail_linan_from_xiangyang
where: linan.yamen
---
把襄阳衙门的书信送到临安衙门，脚钱 135 文。坐马车 7 日。

=== quest: world.q.mail_xiangyang_luoyang
name: 送信：襄阳 → 洛阳
flag: world.job.mail_luoyang_from_xiangyang
where: luoyang.office
---
把襄阳衙门的书信送到洛阳衙门，脚钱 90 文。坐马车 4 日。
