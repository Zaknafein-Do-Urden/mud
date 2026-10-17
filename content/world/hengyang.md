# 衡阳（城市）。笑傲江湖会话新增（D-310）。格式照其他城市手写，没有用 gen_cities.py。
# 和襄阳通车马六日、和福州十日。本地特产：湘纸、茶叶（跑商规则见 docs/ECONOMY.md §3）。

=== city: hengyang
name: 衡阳
pos: 292,392
station: hengyang.station
routes: xiangyang=6, fuzhou=10
goods: paper=0.6, tea=0.65
---
衡山南麓、湘江东岸的大城。城北有雁峰，相传北雁南飞到此不再往南。造纸的作坊沿江排开，纸和茶顺水北上，一路能卖到中原去。城里江湖人多，衡山派的字号在这一带比官府还响。

=== room: hengyang.center
name: 衡阳·雁峰街口
exits: 南=hengyang.station, 东=hengyang.market, 西=hengyang.inn, 北=hengyang.office
---
街口一株大樟树，树下常年摆着说书的摊子。往北望得见雁峰，峰不高，形状却像一只收了翅膀的雁。
街面上走的多半是带兵刃的人：背剑的、挎刀的、背后插着双钩的，谁也不多看谁一眼。
卖纸的铺子一家挨一家，门口晒着整叠的新纸，被风吹得哗哗响。

=== room: hengyang.market
name: 衡阳·湘江码头市
exits: 西=hengyang.center, 北=hengyang.bank
market: true
---
码头上泊满了运纸的船。纸捆一摞摞从跳板上过，船工的肩膀被麻绳勒出一道道红印。
市上除了纸和茶，还有衡山脚下采来的药、湘江里捞上来的鱼。江风腥得很。
在这里可以 行情、买、卖。

=== room: hengyang.bank
name: 衡阳·湘隆钱庄
exits: 南=hengyang.market
bank: true
---
钱庄是纸商们凑份子开的，门面不大，后院却堆满了上了锁的箱子。
柜上的先生戴着水晶眼镜，说话客气，手指头拨算盘的声音像下雨。
在这里可以 存、取、存款。

=== room: hengyang.inn
name: 衡阳·雁来客栈
exits: 东=hengyang.center
inn: true
---
客栈两层，院里支着酒缸。这几日住满了人，掌柜的见谁都说"实在没有房了"，转身却又把柴房收拾出来。
夜里楼上楼下都有人在谈同一件事：刘三爷要金盆洗手了。
在这里可以 休息、修炼。

=== room: hengyang.office
name: 衡阳·府衙
exits: 南=hengyang.center
npcs: hengyang.officer
---
衙门的照壁上贴着两张榜文，一张是缉盗的，一张是禁止在城中持械斗殴的——后面那张已经被人撕了一角。
门房里的差役隔着窗户往外看，看见江湖人就把头缩回去。

=== room: hengyang.station
name: 衡阳·城南车马行
exits: 北=hengyang.center
npcs: world.npc.hengyang_bandit
station: true
---
城南的车马行，院里一半停车，一半堆纸。往北走襄阳、往南下福建的车都从这里发。
在这里可以 乘车 去别的城市。

=== npc: hengyang.officer
name: 周班头
brief: 衡阳府的班头，发放除害、查访之类的差事。
talk: hengyang.officer.talk
---
一个矮壮的中年人，腰里的铁尺换成了一根短棍，说是"对着江湖人亮铁尺不如亮棍子，棍子不伤和气"。

=== dialog: hengyang.officer.talk
ifnone: 周班头：今日的差事派完了，明日赶早。
---
周班头：这位{男:壮士|女:女侠}面生。这几日城里人多，衙门忙不过来，有几桩小事要托人。
* 山脚下的强人要不要管？ -> hengyang.job.bandit ?!flag:world.job.bandit_hengyang ?!today:world.job.bandit_hengyang
* 听说码头上丢了东西？ -> hengyang.job.thief ?!flag:world.job.thief_hengyang ?!today:world.job.thief_hengyang
* 要不要去客栈查查外乡人？ -> hengyang.job.patrol ?!flag:world.job.patrol_hengyang ?!today:world.job.patrol_hengyang
* 有信要送去襄阳吗？ -> hengyang.job.mail_xiangyang ?!flag:world.job.mail_xiangyang ?!today:world.job.mailday_hengyang_xiangyang
* 交上襄阳衙门托付的书信 -> hengyang.job.deliver_xiangyang ?flag:world.job.mail_hengyang_from_xiangyang
* 告辞

=== dialog: hengyang.job.bandit
do: flag:world.job.bandit_hengyang
---
周班头：衡山脚下有两个拦路的，专挑赶路的客商下手。他们这几日在车马行外转悠，你去把他们赶走，赏钱一百文。
（差事：在衡阳车马行教训拦路的强人）

=== dialog: hengyang.job.thief
do: flag:world.job.thief_hengyang
---
周班头：码头上这几日少了好几捆纸。一捆纸不值钱，可是坏规矩。你去把那人揪出来，赏钱一百二十文。
（差事：在衡阳码头市缉拿偷纸的贼）

=== dialog: hengyang.job.patrol
do: flag:world.job.patrol_hengyang
---
周班头：这几日城里来的生面孔太多，衙门里实在排不开人。你去雁来客栈看一眼名簿，回来跟我说一声就行。赏钱四十文。
（差事：去衡阳雁来客栈查访）

=== dialog: hengyang.job.mail_xiangyang
do: flag:world.job.mail_xiangyang flag:world.job.mail_xiangyang_from_hengyang
---
周班头取出一封火漆封口的文书：“送到襄阳的安抚使司，六日路程，那边付你 125 文脚钱。”
（差事：把书信送到襄阳衙门。坐马车 6 日可到）

=== dialog: hengyang.job.deliver_xiangyang
do: unflag:world.job.mail_hengyang unflag:world.job.mail_hengyang_from_xiangyang money:125 potential:10 today:world.job.mailday_xiangyang_hengyang
---
周班头拆开火漆看了一遍，数出 125 文：“路上没遇上劫道的罢？算你运气。”

# ---------------- 差事里的敌人 ----------------

=== enemy: world.foe.hengyang_bandit
name: 拦路强人
weapon: 棍
weaponName: 齐眉棍
attrs: 根骨=18, 身法=15, 悟性=10
skills: base.quan=16, base.zhaojia=14, base.tuna=14
ai: 刚=3, 守=2, 巧=1
cunning: 15
potential: 30
---
背着柴捆装成樵夫的汉子，柴捆底下藏着齐眉棍。手上的茧子不在掌心，在虎口。

=== npc: world.npc.hengyang_bandit
name: 拦路强人
brief: 在衡阳车马行一带盯梢客商的强人。
if: flag:world.job.bandit_hengyang
talk: world.hengyang_bandit.talk
---
两个"樵夫"蹲在车马行外，柴捆放在脚边，眼睛却跟着每一辆出城的车。

=== dialog: world.hengyang_bandit.talk
---
那人把柴捆一掀，抽出棍子在手里掂了掂：“这条道上走车，要留下买路的。”
* 动手 !fight:world.b.hengyang_bandit
* 走开

=== battle: world.b.hengyang_bandit
enemies: world.foe.hengyang_bandit, world.foe.hengyang_bandit
adapt: true
win: world.hengyang_bandit.win
---
两根齐眉棍一上一下扫过来，棍风压得地上的碎纸直打转。

=== dialog: world.hengyang_bandit.win
do: unflag:world.job.bandit_hengyang today:world.job.bandit_hengyang money:100
---
两个人丢下棍子往山里跑，柴捆都忘了拿。（差事完成，赏钱一百文）

=== enemy: world.foe.hengyang_thief
weapon: 匕首
name: 偷纸贼
attrs: 根骨=13, 身法=21, 悟性=13
skills: base.zhang=22, base.quan=14, base.zhaojia=14, base.tuna=18
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 28
---
穿着船工的短褂，肩上搭着一条湿麻绳。他搬纸比谁都卖力，搬完总要在角落里蹲一会儿。

=== npc: world.npc.hengyang_thief
name: 偷纸贼
brief: 在衡阳码头市偷纸捆的贼。
if: flag:world.job.thief_hengyang
talk: world.hengyang_thief.talk
---
一个船工模样的人在纸垛后头来回走，每过一趟，垛子就矮一截。

=== dialog: world.hengyang_thief.talk
---
那人见你盯着纸垛看，脸色一沉，麻绳往手上一缠，另一只手已经摸出了匕首。
* 拿下他 !fight:world.b.hengyang_thief
* 算了

=== battle: world.b.hengyang_thief
enemies: world.foe.hengyang_thief
adapt: true
win: world.hengyang_thief.win
---
他把湿麻绳当鞭子甩过来，匕首藏在另一只手的袖口里。

=== dialog: world.hengyang_thief.win
do: unflag:world.job.thief_hengyang today:world.job.thief_hengyang money:120
---
船工被你按在纸垛上，船舱底下翻出七八捆纸。（差事完成，赏钱一百二十文）

=== patch: hengyang.market
npcs: world.npc.hengyang_thief

=== trigger: world.t.hengyang_patrol
room: hengyang.inn
if: flag:world.job.patrol_hengyang
do: unflag:world.job.patrol_hengyang today:world.job.patrol_hengyang money:40 potential:15
---
你跟掌柜要来名簿翻了一遍。名字记了满满三页，十个里有八个带着兵刃，可要说可疑，又都不可疑——他们都是来看刘三爷金盆洗手的。（差事完成，赏钱四十文）

# ---------------- 任务清单 ----------------

=== quest: world.q.hengyang_bandit
name: 除害：拦路强人
flag: world.job.bandit_hengyang
where: hengyang.station
---
衡阳府的差事：去城南车马行教训拦路的强人。赏钱 100 文。

=== quest: world.q.hengyang_thief
name: 缉拿：偷纸贼
flag: world.job.thief_hengyang
where: hengyang.market
---
衡阳府的差事：去码头市缉拿偷纸的贼。赏钱 120 文。

=== quest: world.q.hengyang_patrol
name: 查访：雁来客栈
flag: world.job.patrol_hengyang
where: hengyang.inn
---
衡阳府的差事：去雁来客栈查访外乡人。赏钱 40 文。

=== quest: world.q.mail_hengyang_xiangyang
name: 送信：衡阳 → 襄阳
flag: world.job.mail_xiangyang_from_hengyang
where: xiangyang.office
---
把衡阳府的书信送到襄阳衙门，脚钱 125 文。坐马车 6 日。

# ---------------- 百科 ----------------

=== entry: world.e.hengyang
name: 衡阳
---
衡山脚下、湘江边的大城，以纸和茶闻名。城北的雁峰是南来北往的记号。
这一带是衡山派的地面。衡山派不像别家那样把弟子收在山上，掌门莫大先生常年在市井里走动，拉一手胡琴，听过的人说那琴声很冷。

=== entry: world.e.hengshan
name: 衡山
---
五岳之一，在衡阳城北。峰峦连绵数十里，山上寺观极多，香火不断。
五岳剑派里的衡山派就在这里。五派本是各管一山，近年来嵩山派提了个说法，说五岳该并作一派、同气连枝——提的人嗓门很大，应的人却不多。
