# 长安（城市）。由 tools/gen_cities.py 生成，可以手改。

=== city: changan
name: 长安
pos: 190,130
station: changan.station
routes: luoyang=4, chengdu=9
goods: fur=0.75, salt=0.9, herbs=1.1, silk=1.4, tea=1.4, porcelain=1.2, shujin=1.5, iron=1.0
areas: huashan
---
汉唐故都，关中重镇，西域的皮货从这里进来。往东是西岳华山。

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
---
赵捕快：这位{男:兄弟|女:姑娘}，可是来领差事的？赏钱不多，胜在实在。
* 有什么除害的差事？ -> changan.job.bandit ?!flag:world.job.bandit_changan
* 有信要送去成都吗？ -> changan.job.mail_chengdu ?!flag:world.job.mail_chengdu
* 有信要送去洛阳吗？ -> changan.job.mail_luoyang ?!flag:world.job.mail_luoyang
* 交上成都衙门托付的书信 -> changan.job.deliver_chengdu ?flag:world.job.mail_changan_from_chengdu
* 交上洛阳衙门托付的书信 -> changan.job.deliver_luoyang ?flag:world.job.mail_changan_from_luoyang
* 离开

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
do: unflag:world.job.mail_changan unflag:world.job.mail_changan_from_chengdu money:165
---
赵捕快拆开火漆看了看，点点头，数了 165 文钱给你。
赵捕快：一路辛苦。

=== dialog: changan.job.deliver_luoyang
do: unflag:world.job.mail_changan unflag:world.job.mail_changan_from_luoyang money:90
---
赵捕快拆开火漆看了看，点点头，数了 90 文钱给你。
赵捕快：一路辛苦。

=== enemy: world.foe.changan_bandit
name: 关中刀客
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
win: world.changan_bandit.win
---
两个关中刀客抽出兵刃围了上来。

=== dialog: world.changan_bandit.win
do: unflag:world.job.bandit_changan money:80
---
关中刀客丢下兵刃，作鸟兽散。（差事完成，赏钱八十文。还可以再去衙门领差事）

# ---------------- 任务清单 ----------------

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
