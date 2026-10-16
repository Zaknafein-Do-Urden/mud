# 成都（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: chengdu
name: 成都
pos: 90,262
station: chengdu.station
routes: xiangyang=8, changan=9
goods: shujin=0.75, herbs=0.75, tea=0.8, salt=1.3, iron=1.2, fur=1.2, silk=1.3, porcelain=1.25
areas: tangmen
---
天府之国，锦官城。蜀锦、药材、茶叶都便宜。城外有神秘的唐家堡。

=== room: chengdu.center
name: 成都·十字街
exits: 北=chengdu.office, 南=chengdu.station, 东=chengdu.market, 西=chengdu.inn
---
街边的茶馆里坐满了人，掏耳朵的、算命的、唱川戏的，热闹得很。

=== room: chengdu.market
name: 成都·市集
exits: 西=chengdu.center, 北=chengdu.bank
market: true
---
蜀锦的颜色艳得晃眼，药铺门口晒着成筐的川芎、黄连。
在这里可以 行情、买、卖。

=== room: chengdu.bank
name: 成都·钱庄
exits: 南=chengdu.market
bank: true
---
钱庄的掌柜一边喝盖碗茶一边打算盘，不慌不忙。
在这里可以 存、取、存款。

=== room: chengdu.inn
name: 成都·客栈
exits: 东=chengdu.center
inn: true
---
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
---
周捕头：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> chengdu.job.bandit ?!flag:world.job.bandit_chengdu
* 有信要送去长安吗？ -> chengdu.job.mail_changan ?!flag:world.job.mail_changan
* 有信要送去襄阳吗？ -> chengdu.job.mail_xiangyang ?!flag:world.job.mail_xiangyang
* 交上长安衙门托付的书信 -> chengdu.job.deliver_changan ?flag:world.job.mail_chengdu_from_changan
* 交上襄阳衙门托付的书信 -> chengdu.job.deliver_xiangyang ?flag:world.job.mail_chengdu_from_xiangyang
* 离开

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
do: unflag:world.job.mail_chengdu unflag:world.job.mail_chengdu_from_changan money:165
---
周捕头拆开火漆看了看，点点头，数了 165 文钱给你。
周捕头：一路辛苦。

=== dialog: chengdu.job.deliver_xiangyang
do: unflag:world.job.mail_chengdu unflag:world.job.mail_chengdu_from_xiangyang money:150
---
周捕头拆开火漆看了看，点点头，数了 150 文钱给你。
周捕头：一路辛苦。

=== enemy: world.foe.chengdu_bandit
name: 蜀道山贼
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
win: world.chengdu_bandit.win
---
两个蜀道山贼抽出兵刃围了上来。

=== dialog: world.chengdu_bandit.win
do: unflag:world.job.bandit_chengdu money:80
---
蜀道山贼丢下兵刃，作鸟兽散。（差事完成，赏钱八十文。还可以再去衙门领差事）

# ---------------- 任务清单 ----------------

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
