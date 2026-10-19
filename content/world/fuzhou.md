# 福州（城市）。笑傲江湖会话新增（D-300）。格式照其他城市手写，没有用 gen_cities.py。
# 和临安通车马，八日路程。本地特产：海货、荔枝干、茶叶（跑商规则见 docs/ECONOMY.md §3）。

=== city: fuzhou
name: 福州
pos: 450,408
station: fuzhou.station
routes: linan=8
goods: seafood=0.6, lizhi=0.6, tea=0.7
---
闽江入海的地方，城里城外都是榕树，走到哪里都有树荫。海货、荔枝、武夷的茶都便宜，运进内地就是好价钱。这里镖行多，刀口上讨饭吃的人也多。

=== room: fuzhou.center
name: 福州·鼓楼前
exits: 南=fuzhou.station, 东=fuzhou.market, 西=fuzhou.inn, 北=fuzhou.office
---
鼓楼下是一片青石坪，坪角一株老榕树，气根垂下来有半人高，底下坐着一圈乘凉的闲人。
卖鱼丸的挑着担子穿过人群，热气一路飘过去。街面上时常过一队押镖的伙计，扛着镖旗，走得又快又齐。
南边是车马行，东边是市集，西边有客栈，北边衙门口的照壁上贴满了告示。

=== room: fuzhou.market
name: 福州·南门市
exits: 西=fuzhou.center, 北=fuzhou.bank
market: true
---
市集一直铺到江边码头。鱼干、虾米、紫菜堆成小山，旁边就是一筐筐晒干的荔枝，甜味混着咸腥味。
远处泊着几条大海船，船工赤着膊搬货，号子声隔着半条街都听得见。
在这里可以 行情、买、卖。

=== room: fuzhou.bank
name: 福州·汇通钱庄
exits: 南=fuzhou.market
bank: true
---
钱庄的柜台是整块楠木，擦得发亮。跑海的客商在这里兑银，一张汇票能从福州兑到泉州、广州。
在这里可以 存、取、存款。

=== room: fuzhou.inn
name: 福州·榕荫客栈
exits: 东=fuzhou.center
inn: true
---
客栈院里也是一株大榕树，树下摆着几张竹榻。掌柜的爱跟客人聊海上的事，说得天花乱坠。
夜里听得见远处江上的橹声，一下一下，很催人睡。
在这里可以 休息、修炼。

=== room: fuzhou.office
name: 福州·府衙
exits: 南=fuzhou.center
npcs: fuzhou.officer
---
衙门口两头石狮子被香火熏得发黑。照壁上贴着海捕文书，画着几张面目模糊的人像。
两个差役靠在门边啃荔枝，核儿吐了一地。

=== room: fuzhou.station
name: 福州·城南车马行
exits: 北=fuzhou.center
npcs: world.npc.fuzhou_bandit
station: true
---
城南的车马行，院子大得能同时套十几辆车。往北走内地的货都从这里起运，茶包和鱼干堆到了棚顶。
在这里可以 乘车 去别的城市。

=== npc: fuzhou.officer
name: 吴捕头
brief: 福州府的捕头，发放除害、查访之类的差事。
talk: fuzhou.officer.talk
---
一个晒得黝黑的汉子，腰上挂着铁尺，讲话一口闽音，急起来旁人半句也听不懂。

=== dialog: fuzhou.officer.talk
ifnone: 吴捕头：今日的差事派完了，明日赶早。
---
吴捕头：这位{男:壮士|女:女侠}是外路来的罢？来得正好，衙门里人手紧。
* 江上的水匪要不要管？ -> fuzhou.job.bandit ?!flag:world.job.bandit_fuzhou ?!today:world.job.bandit_fuzhou
* 听说市上丢了东西？ -> fuzhou.job.thief ?!flag:world.job.thief_fuzhou ?!today:world.job.thief_fuzhou
* 要不要去客栈查查外乡人？ -> fuzhou.job.patrol ?!flag:world.job.patrol_fuzhou ?!today:world.job.patrol_fuzhou
* 有信要送去临安吗？ -> fuzhou.job.mail_linan ?!flag:world.job.mail_linan ?!today:world.job.mailday_fuzhou_linan
* 交上临安府托付的书信 -> fuzhou.job.deliver_linan ?flag:world.job.mail_fuzhou_from_linan
* 告辞

=== dialog: fuzhou.job.bandit
do: flag:world.job.bandit_fuzhou
---
吴捕头：闽江上有伙水匪，上了岸就在车马行外转悠，专盯刚卸船的货。你去替我教训一顿，赏钱八十文。
（差事：在福州车马行教训闽江水匪）

=== dialog: fuzhou.job.thief
do: flag:world.job.thief_fuzhou
---
吴捕头：南门市这几日丢了好几包海货，是个溜得快的。你去把他揪出来，赏钱一百文。
（差事：在福州南门市缉拿小贼）

=== dialog: fuzhou.job.patrol
do: flag:world.job.patrol_fuzhou
---
吴捕头：近来外路的生面孔多，有些还背着兵器。你去榕荫客栈看一眼名簿，回来说一声就行。赏钱四十文。
（差事：去福州榕荫客栈查访）

=== dialog: fuzhou.job.mail_linan
do: flag:world.job.mail_linan flag:world.job.mail_linan_from_fuzhou
---
吴捕头取出一封火漆封口的文书：“送到临安府衙，那边付你 170 文脚钱。路远，自己当心。”
（差事：把书信送到临安府衙。坐马车 8 日可到）

=== dialog: fuzhou.job.deliver_linan
do: unflag:world.job.mail_fuzhou unflag:world.job.mail_fuzhou_from_linan money:170 potential:10 today:world.job.mailday_linan_fuzhou
---
吴捕头拆开火漆看了一遍，数出 170 文：“走这一趟不容易。歇两日再走罢。”

# ---------------- 差事里的敌人 ----------------

=== enemy: world.foe.fuzhou_bandit
name: 闽江水匪
weapon: 刀
weaponName: 鱼叉改的短刀
attrs: 根骨=14, 身法=15, 悟性=10
skills: base.quan=10, base.dao=9, base.zhaojia=7, base.tuna=8
ai: 刚=3, 巧=1, 守=1
cunning: 15
potential: 20
hpx: 0.8
weaponBonus: 72
---
赤脚的汉子，裤腿卷到膝盖，小腿上全是盐碱晒出的白印子。手里的短刀是鱼叉改的，锋口豁了几处。

=== npc: world.npc.fuzhou_bandit
name: 闽江水匪
brief: 在福州车马行一带盯梢货物的水匪。
if: flag:world.job.bandit_fuzhou
talk: world.fuzhou_bandit.talk
---
两个赤脚汉子蹲在货堆旁边剥荔枝，眼睛却一直在数车上的包。

=== dialog: world.fuzhou_bandit.talk
---
水匪把荔枝核一吐，站了起来：“外路人，这院里的货，有一半该归江上。”
* 动手 !fight:world.b.fuzhou_bandit
* 走开

=== battle: world.b.fuzhou_bandit
enemies: world.foe.fuzhou_bandit, world.foe.fuzhou_bandit
adapt: true
win: world.fuzhou_bandit.win
---
两个水匪一前一后围上来，短刀贴着大腿外侧藏着，看着像是空手。

=== dialog: world.fuzhou_bandit.win
do: unflag:world.job.bandit_fuzhou today:world.job.bandit_fuzhou money:80
---
两个水匪翻过墙头就没影了，短刀丢了一把在地上。（差事完成，赏钱八十文）

=== enemy: world.foe.fuzhou_thief
weapon: 匕首
name: 小贼
attrs: 根骨=12, 身法=20, 悟性=13
skills: base.zhang=18, base.quan=12, base.zhaojia=12, base.tuna=15
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 24
---
一个瘦得脱形的后生，光脚踩在鱼篓之间，脚底板比鞋还厚。

=== npc: world.npc.fuzhou_thief
name: 小贼
brief: 在福州南门市偷货的小贼。
if: flag:world.job.thief_fuzhou
talk: world.fuzhou_thief.talk
---
一个瘦后生在鱼干摊之间钻来钻去，手总在别人的筐沿上搭一下。

=== dialog: world.fuzhou_thief.talk
---
小贼被你盯住，脸色一变，反手从腰里抽出一把剖鱼的匕首。
* 拿下他 !fight:world.b.fuzhou_thief
* 算了

=== battle: world.b.fuzhou_thief
enemies: world.foe.fuzhou_thief
adapt: true
win: world.fuzhou_thief.win
---
小贼矮身钻进鱼篓之间，匕首贴着篓沿挑了出来。

=== dialog: world.fuzhou_thief.win
do: unflag:world.job.thief_fuzhou today:world.job.thief_fuzhou money:100
---
小贼被你按在鱼篓上，怀里掉出三包虾米、两串钱。（差事完成，赏钱一百文）

=== patch: fuzhou.market
npcs: world.npc.fuzhou_thief

=== trigger: world.t.fuzhou_patrol
room: fuzhou.inn
if: flag:world.job.patrol_fuzhou
do: unflag:world.job.patrol_fuzhou today:world.job.patrol_fuzhou money:40 potential:15
---
你向掌柜要来名簿翻了一遍，又在榕树下坐了半个时辰。住店的多半是跑海的客商和押镖的伙计，没什么可疑之人。（差事完成，赏钱四十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.fuzhou_bandit
name: 除害：闽江水匪
flag: world.job.bandit_fuzhou
where: fuzhou.station
---
福州府的差事：去城南车马行教训盯梢货物的闽江水匪。赏钱 80 文。

=== quest: world.q.fuzhou_thief
name: 缉拿：南门市小贼
flag: world.job.thief_fuzhou
where: fuzhou.market
---
福州府的差事：去南门市缉拿偷货的小贼。赏钱 100 文。

=== quest: world.q.fuzhou_patrol
name: 查访：榕荫客栈
flag: world.job.patrol_fuzhou
where: fuzhou.inn
---
福州府的差事：去榕荫客栈查访外乡人。赏钱 40 文。

=== quest: world.q.mail_fuzhou_linan
name: 送信：福州 → 临安
flag: world.job.mail_linan_from_fuzhou
where: linan.yamen
---
把福州府的书信送到临安府衙，脚钱 170 文。坐马车 8 日。

# ---------------- 百科 ----------------

=== entry: world.e.fuzhou
name: 福州
---
闽江下游的大城，三面环山，一面向海。城里榕树多得遮天，雨水也多，墙根常年带着青苔。
海船从这里出洋，内地的茶、纸、瓷从这里下海，押镖的行当因此格外兴旺。福威镖局的总号就在城西的向阳巷。

=== entry: world.e.minjiang
name: 闽江
---
穿福州城而过的大江，水急，滩多。江上的船家和江上的匪，常常是同一拨人，看那一天的生意。
