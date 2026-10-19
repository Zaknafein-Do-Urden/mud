# 成都（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: chengdu
name: 成都
pos: 90,262
station: chengdu.station
routes: xiangyang=8, changan=9
goods: shujin=0.6, herbs=0.6, tea=0.65
areas: tangmen
---
天府之国，锦官城。蜀锦、药材、茶叶都便宜。城外有神秘的唐家堡。

=== room: chengdu.center
name: 成都·十字街
exits: 北=chengdu.office, 南=chengdu.station, 东=chengdu.market, 西=chengdu.inn
---
街边的茶馆里坐满了人，掏耳朵的、算命的、唱川戏的，热闹得很。

=== room: chengdu.market
name: 成都·锦官市
exits: 西=chengdu.center, 北=chengdu.bank
market: true
---
成都古称锦官城，这条街上的锦缎铺子少说也有二三十家。
蜀锦的颜色艳得晃眼，药铺门口晒着成筐的川芎、黄连。
在这里可以 行情、买、卖。

=== room: chengdu.bank
name: 成都·交子钱庄
exits: 南=chengdu.market
bank: true
---
交子最早就出在成都，这家钱庄挂着“交子”的招牌，说是从那时传下来的老字号。
钱庄的掌柜一边喝盖碗茶一边打算盘，不慌不忙。
在这里可以 存、取、存款。

=== room: chengdu.inn
name: 成都·芙蓉客栈
exits: 东=chengdu.center
inn: true
shop: food.mantou, food.niurou, food.jiaohuaji, food.mijiu, food.nverhong, food.houerjiu
---
院墙上爬满了芙蓉花，到了秋天开得满城都是，客栈因此得名。大堂角落里有人摆了龙门阵，一壶茶能吹一下午。
客栈的老板娘泼辣能干，一嗓子能喊到后街。
在这里可以 休息、修炼。

=== room: chengdu.office
name: 成都·衙门
exits: 南=chengdu.center
npcs: chengdu.officer
---
成都府衙。门房在打瞌睡，墙上贴着一张缉拿采花贼的告示。

=== room: chengdu.station
name: 成都·车马行
exits: 北=chengdu.center
npcs: world.npc.chengdu_bandit
station: true
---
城北的车马行。蜀道难，车资不便宜，车把式却个个胆大。
在这里可以 乘车 去别的城市。

=== npc: chengdu.officer
name: 周捕头
brief: 成都衙门的公差，发放除害、送信之类的差事。
talk: chengdu.officer.talk
---
一个矮壮的川中汉子，嘴里叼着一根旱烟杆。

=== dialog: chengdu.officer.talk
ifnone: 周捕头：今天的差事都派完了，明天再来吧。
---
周捕头：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> chengdu.job.bandit ?pick:office.chengdu:bandit ?!flag:world.job.bandit_chengdu ?!today:world.job.bandit_chengdu
* 听说城里闹飞贼？ -> chengdu.job.thief ?pick:office.chengdu:thief ?!flag:world.job.thief_chengdu ?!today:world.job.thief_chengdu
* 要不要去客栈查查外乡人？ -> chengdu.job.patrol ?pick:office.chengdu:patrol ?!flag:world.job.patrol_chengdu ?!today:world.job.patrol_chengdu
* 有信要送去长安吗？ -> chengdu.job.mail_changan ?!flag:world.job.mail_changan ?!today:world.job.mailday_chengdu_changan
* 有信要送去襄阳吗？ -> chengdu.job.mail_xiangyang ?!flag:world.job.mail_xiangyang ?!today:world.job.mailday_chengdu_xiangyang
* 交上长安衙门托付的书信 -> chengdu.job.deliver_changan ?flag:world.job.mail_chengdu_from_changan
* 交上襄阳衙门托付的书信 -> chengdu.job.deliver_xiangyang ?flag:world.job.mail_chengdu_from_xiangyang
* 可有告示要张贴？ -> chengdu.job.notice ?pick:office.chengdu:notice ?!flag:world.job.notice_chengdu ?!today:world.job.notice_chengdu
* 钱庄那边可有事？ -> chengdu.job.ledger ?pick:office.chengdu:ledger ?!flag:world.job.ledger_chengdu ?!today:world.job.ledger_chengdu
* 要不要去市集巡夜？ -> chengdu.job.night ?pick:office.chengdu:night ?!flag:world.job.night_chengdu ?!today:world.job.night_chengdu
* 客栈里可有人闹事？ -> chengdu.job.drunk ?pick:office.chengdu:drunk ?!flag:world.job.drunk_chengdu ?!today:world.job.drunk_chengdu
* 车马行那边可有可疑的人？ -> chengdu.job.kidnap ?pick:office.chengdu:kidnap ?!flag:world.job.kidnap_chengdu ?!today:world.job.kidnap_chengdu
* 离开

=== dialog: chengdu.job.thief
do: flag:world.job.thief_chengdu
---
周捕头：这几天市集上丢东西的人多，是个手脚利落的飞贼干的。去锦官市把他揪出来，赏钱一百二十文。
（差事：在成都锦官市缉拿飞贼）

=== enemy: world.foe.chengdu_thief
weapon: 匕首
name: 飞贼
attrs: 根骨=15, 身法=23, 悟性=12
skills: base.zhang=38, base.quan=32, base.zhaojia=32, base.tuna=36
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 46
---
一个精瘦的汉子，眼珠滴溜溜乱转，袖子里鼓鼓囊囊的。

=== npc: world.npc.chengdu_thief
name: 飞贼
brief: 在成都锦官市偷东西的飞贼。
if: flag:world.job.thief_chengdu
talk: world.chengdu_thief.talk
---
一个精瘦的汉子在人群里钻来钻去，手不太老实。

=== dialog: world.chengdu_thief.talk
---
飞贼被你盯上，脸色一变，手已摸向腰间。
* 拿下他 !fight:world.b.chengdu_thief
* 算了

=== battle: world.b.chengdu_thief
enemies: world.foe.chengdu_thief
# 难度调校（tools/tune.mjs）
hpx: 2.21
win: world.chengdu_thief.win
---
飞贼拔出一把匕首，寒光一闪。

=== dialog: world.chengdu_thief.win
do: unflag:world.job.thief_chengdu today:world.job.thief_chengdu money:120
---
飞贼被你按倒在地，偷来的钱袋散了一地。（差事完成，赏钱一百二十文）

=== patch: chengdu.market
npcs: world.npc.chengdu_thief

=== dialog: chengdu.job.patrol
do: flag:world.job.patrol_chengdu
---
周捕头：近来外乡人多，去芙蓉客栈查一查住店的有没有可疑之人。不用动手，看一圈回来就行。赏钱四十文。
（差事：去芙蓉客栈查访）

=== trigger: world.t.chengdu_patrol
room: chengdu.inn
if: flag:world.job.patrol_chengdu
do: unflag:world.job.patrol_chengdu today:world.job.patrol_chengdu money:40 potential:15
---
你跟掌柜要来住店的名簿翻了一遍，又在大堂里转了转，没发现什么可疑之人。（差事完成，赏钱四十文）

=== dialog: chengdu.job.bandit
do: flag:world.job.bandit_chengdu
---
周捕头：北门外的栈道有一伙蜀道山贼作乱，去把他们打发了，赏钱八十文。
（差事：在成都车马行外教训蜀道山贼）

=== dialog: chengdu.job.mail_changan
do: flag:world.job.mail_changan flag:world.job.mail_changan_from_chengdu
---
周捕头递给你一个封了火漆的信封：“送到长安衙门，那边自会付你 165 文脚钱。”
（差事：把书信送到长安衙门。坐马车 9 日可到）

=== dialog: chengdu.job.mail_xiangyang
do: flag:world.job.mail_xiangyang flag:world.job.mail_xiangyang_from_chengdu
---
周捕头递给你一个封了火漆的信封：“送到襄阳衙门，那边自会付你 150 文脚钱。”
（差事：把书信送到襄阳衙门。坐马车 8 日可到）

=== dialog: chengdu.job.deliver_changan
do: unflag:world.job.mail_chengdu unflag:world.job.mail_chengdu_from_changan money:165 potential:10 today:world.job.mailday_changan_chengdu
---
周捕头拆开火漆看了看，点点头，数了 165 文钱给你。
周捕头：一路辛苦。

=== dialog: chengdu.job.deliver_xiangyang
do: unflag:world.job.mail_chengdu unflag:world.job.mail_chengdu_from_xiangyang money:150 potential:10 today:world.job.mailday_xiangyang_chengdu
---
周捕头拆开火漆看了看，点点头，数了 150 文钱给你。
周捕头：一路辛苦。

=== enemy: world.foe.chengdu_bandit
name: 蜀道山贼
weapon: 刀
weaponName: 砍刀
attrs: 根骨=17, 身法=16, 悟性=10
skills: base.quan=20, base.zhang=16, base.zhaojia=16, base.tuna=20
ai: 刚=3, 巧=2, 守=1
cunning: 15
potential: 40
---
一伙占山为王的山贼，在栈道上劫掠行人。

=== npc: world.npc.chengdu_bandit
name: 蜀道山贼
brief: 在成都一带作乱的蜀道山贼。
if: flag:world.job.bandit_chengdu
talk: world.chengdu_bandit.talk
---
一伙占山为王的山贼，在栈道上劫掠行人。

=== dialog: world.chengdu_bandit.talk
---
蜀道山贼：哟，又来一个送死的？
* 动手 !fight:world.b.chengdu_bandit
* 走开

=== battle: world.b.chengdu_bandit
enemies: world.foe.chengdu_bandit, world.foe.chengdu_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.21
win: world.chengdu_bandit.win
---
两个蜀道山贼抽出兵刃围了上来。

=== dialog: world.chengdu_bandit.win
do: unflag:world.job.bandit_chengdu today:world.job.bandit_chengdu money:80
---
蜀道山贼丢下兵刃，作鸟兽散。（差事完成，赏钱八十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.chengdu_thief
name: 缉拿：成都飞贼
flag: world.job.thief_chengdu
where: chengdu.market
---
成都衙门的差事：去锦官市缉拿飞贼。赏钱 120 文。

=== quest: world.q.chengdu_patrol
name: 查访：芙蓉客栈
flag: world.job.patrol_chengdu
where: chengdu.inn
---
成都衙门的差事：去芙蓉客栈查访外乡人。赏钱 40 文。

=== quest: world.q.chengdu_bandit
name: 除害：蜀道山贼
flag: world.job.bandit_chengdu
where: chengdu.station
---
成都衙门的差事：去成都车马行教训北门外的栈道作乱的蜀道山贼。赏钱 80 文。

=== quest: world.q.mail_chengdu_changan
name: 送信：成都 → 长安
flag: world.job.mail_changan_from_chengdu
where: changan.office
---
把成都衙门的书信送到长安衙门，脚钱 165 文。坐马车 9 日。

=== quest: world.q.mail_chengdu_xiangyang
name: 送信：成都 → 襄阳
flag: world.job.mail_xiangyang_from_chengdu
where: xiangyang.office
---
把成都衙门的书信送到襄阳衙门，脚钱 150 文。坐马车 8 日。

# ---------------- 天龙八部新增：成都 ←→ 大理 的送信差事 ----------------

=== patch: chengdu.officer.talk
---
* 有信要送去大理吗？ -> chengdu.job.mail_dali ?!flag:world.job.mail_dali ?!today:world.job.mailday_chengdu_dali
* 交上大理提刑司托付的书信 -> chengdu.job.deliver_dali ?flag:world.job.mail_chengdu_from_dali

=== dialog: chengdu.job.mail_dali
do: flag:world.job.mail_dali flag:world.job.mail_dali_from_chengdu
---
周捕头从抽屉里摸出一封信：“这封要送到大理提刑司去，蜀道难走，脚钱给得也厚，那边付你 150 文。”
（差事：把书信送到大理提刑司。坐马车 7 日可到）

=== dialog: chengdu.job.deliver_dali
do: unflag:world.job.mail_chengdu unflag:world.job.mail_chengdu_from_dali money:150 potential:10 today:world.job.mailday_dali_chengdu
---
周捕头认得那块火漆上的印子，点点头，数了 150 文给你。
周捕头：大理的信走得慢，难为你了。

=== quest: world.q.mail_chengdu_dali
name: 送信：成都 → 大理
flag: world.job.mail_dali_from_chengdu
where: dali.office
---
把成都衙门的书信送到大理提刑司，脚钱 150 文。坐马车 7 日。
