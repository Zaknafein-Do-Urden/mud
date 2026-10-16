# 临安城（共享世界）
# 以 # 开头的行是注释。语法见 docs/DESIGN.md §5、docs/STORY.md §4。
# 共享世界只能写 world.* 标记。

=== meta: game
title: 江湖夜雨
start: linan.gate
# 还没去过任何旅店时，战败后回到这里
inn: linan.inn
---
南宋，宁宗年间。
你背着一个小小的包袱，在黄昏时分走到了[[临安|linan.e.linan]]城下。
师父临终前只留给你一句话：“去临安，找一个会吹竹哨的人。”
你身上只有两下庄稼把式。听说城里的武馆可以花钱学功夫——要在江湖上立足，得先学点真本事。（临安武馆：御街往东进茶楼，从后门到市集，再往北）

=== item: coin
name: 铜钱
---
一枚磨得发亮的铜钱，上面铸着“庆元通宝”四个字。

=== item: bamboo_whistle
name: 竹哨
verb: 吹
usefail: 你把竹哨凑到嘴边吹了一声。哨音尖细，在风里传出很远，却没有任何回应。
---
一支短短的竹哨，哨身刻着一只歪歪扭扭的燕子。

=== city: linan
name: 临安
pos: 520,318
station: linan.station
routes: jiaxing=1, xiangyang=7
goods: silk=0.7, tea=0.65
---
南宋行在，天下最繁华的地方。丝绸、茶叶便宜，北方的皮货、铁器贵。

# ---------------- 百科 ----------------

=== entry: linan.e.linan
name: 临安
---
南宋行在，即杭州。北方半壁江山沦于[[金国|world.e.jin]]之手已近八十年，朝廷偏安于此，西湖歌舞几时休。

=== entry: world.e.jin
name: 金国
---
女真人建立的国家，占据淮河以北的中原大地。宋金之间时战时和，朝中主和、主战两派争执不休。

# ---------------- 房间 ----------------

=== room: linan.gate
name: 临安城·钱塘门
exits: 北=linan.street, 东=linan.lake, 南=linan.road, 西=linan.inn
npcs: linan.beggar
---
城门高耸，青砖上爬满了暮色。守门的兵卒倚着长枪打盹，偶尔有挑担的货郎匆匆进出。
?!flag:world.beggar_friend 墙根下蜷着一个老乞丐，面前摆着一只缺了口的破碗。
?flag:world.beggar_friend 墙根下的老乞丐冲你挤了挤眼睛，像是认得你。

=== room: linan.road
name: 城外官道
exits: 北=linan.gate, 西=linan.station
npcs: world.npc.pipi, world.npc.snake
---
出了城门，官道向东南延伸，两旁是收割过的稻田，田埂上积着薄薄一层残雪。
远处几缕炊烟，是散落在城郊的村落。

=== room: linan.street
name: 临安城·御街
exits: 南=linan.gate, 东=linan.teahouse, 北=linan.yamen, 西=linan.temple
---
御街宽阔，两旁店铺林立，灯笼一盏接一盏地亮起来。
空气里飘着葱包桧儿和定胜糕的香味，叫卖声此起彼伏。
西边巷子深处是一座破旧的城隍庙，进出的多是些叫花子。
?visited:linan.lake 你想起西湖边那座断桥，不知为何心里有些不安。

=== room: linan.teahouse
name: 清风茶楼
exits: 西=linan.street, 北=linan.market
npcs: linan.storyteller
---
茶楼里人声鼎沸，跑堂的提着长嘴铜壶在桌间穿梭。
正中一张高桌上，一个说书先生正拍着醒木，讲得唾沫横飞。
后门通往茶楼背后的市集。

=== room: linan.yamen
name: 临安府衙
exits: 南=linan.street
npcs: linan.officer
---
府衙大门紧闭，门前两座石狮子在暮色里显得格外威严。
墙上贴着一张告示，墨迹尚新：“近日西湖一带屡有命案，入夜后百姓勿近断桥。”

=== room: linan.lake
name: 西湖·断桥
exits: 西=linan.gate
---
湖面笼着一层薄雾，残荷在风里瑟瑟作响。断桥上空无一人。
?!has:bamboo_whistle 桥栏的石缝里似乎塞着什么东西，但天色太暗，看不真切。
?has:bamboo_whistle ?!flag:world.whistle_answered 你握紧了竹哨。远处的雾里，仿佛有人也在等一声哨响。
?flag:world.whistle_answered 湖面上空空荡荡，方才那条小船像是从来没有出现过。

# ---------------- 人物与对话 ----------------

=== npc: linan.beggar
name: 老乞丐
brief: 钱塘门下的老乞丐，右手缺了两根指头。
talk: linan.beggar.start
---
一个衣衫褴褛的老乞丐，脸上糊满泥灰，一双眼睛却亮得出奇。
他的右手缺了两根指头。

=== dialog: linan.beggar.start
---
?!flag:world.beggar_friend 老乞丐：{男:这位小哥|女:这位姑娘}，行行好，赏口饭吃吧……
?flag:world.beggar_friend 老乞丐：嘿嘿，又是你。东西收好了没有？
* 给他一文钱 -> linan.beggar.give ?money:1 ?!flag:world.beggar_friend !pay:1
* 打听会吹竹哨的人 -> linan.beggar.whistle
* 打听丐帮 -> linan.beggar.gaibang
* 离开

=== dialog: linan.beggar.give
---
老乞丐接过铜钱，在指间转了一圈，忽然压低了声音：
老乞丐：你师父……临走前，是不是让你来找什么人？
* 你怎么知道？ -> linan.beggar.reveal
* 我听不懂你在说什么

=== dialog: linan.beggar.reveal
---
老乞丐没有回答。他从破碗底下摸出一支竹哨，塞进你手里。
老乞丐：天黑以后，去断桥。吹三声。别让任何人跟着你。
* 收下竹哨 !give:bamboo_whistle !flag:world.got_whistle !flag:world.beggar_friend

=== dialog: linan.beggar.whistle
---
?!flag:world.beggar_friend 老乞丐翻了个白眼：竹哨？老叫花子只会敲破碗。
?flag:world.beggar_friend 老乞丐：嘘——小声些。这城里，耳朵多着呢。

=== dialog: linan.beggar.gaibang
---
老乞丐咧嘴一笑：想找丐帮？御街往西，城隍庙里那帮叫花子就是。主事的是鲁长老，脾气大，心肠好。

=== room: linan.inn
name: 望湖客栈
exits: 东=linan.gate
inn: true
---
一间干净的客栈，楼上是客房，楼下几张方桌。掌柜的在柜台后面拨着算盘。
在这里可以 休息 恢复气血，也可以 修炼 武功。

=== npc: linan.storyteller
name: 说书先生
brief: 清风茶楼的说书人，消息灵通。
# 竹哨线第四章揭穿后被抓走，由徒弟小六接替（feiyan/ch04.md）
if: !flag:feiyan.ch4_done
talk: linan.storyteller.start
---
一个干瘦的中年人，青布长衫洗得发白，手里一块醒木被摩挲得油亮。
他说的书里，一半是古人，一半是眼下江湖上的新鲜事。

=== dialog: linan.storyteller.start
---
说书先生：客官想听什么？前朝旧事，还是眼下的新鲜事？
?has:bamboo_whistle ?!flag:feiyan.ch4_done 他的目光在你腰间的竹哨上停了一瞬，又飞快地移开了。
* 离开

# ---------------- 物品的使用 ----------------

=== use: world.u.whistle_bridge
item: bamboo_whistle
room: linan.lake
once: true
dialog: world.whistle.answer

=== dialog: world.whistle.answer
pace: slow
do: flag:world.whistle_answered
---
你把竹哨凑到嘴边，一声，两声，三声。
哨音落进雾里，像石子沉入深水，没有一点回响。
你正要放下竹哨，雾的深处忽然也传来了三声哨响——短，长，短。
桨声欸乃，一条乌篷小船从雾里滑了出来，在离桥三丈远的地方停住。
船头立着一个戴斗笠的人，看不清面目。
戴斗笠的人：三声哨，是燕子回巢的意思。你师父……终究是没能来。
戴斗笠的人：今夜耳目太多，不是说话的时候。你先在临安住下，等时候到了，我自会来找你。
不等你开口，小船已经掉转船头，重新没入了雾中。
（那人说时候到了会来找你。先在临安住下吧——去望湖客栈歇一晚。）

# ---------------- 市集、钱庄、车马行（D-040）----------------

=== room: linan.market
name: 临安·市集
exits: 南=linan.teahouse, 东=linan.bank
market: true
---
茶楼背后是一片热闹的市集。绸缎庄、茶叶铺、瓷器摊挤得满满当当，北方来的皮货商操着一口生硬的官话。
在这里可以 行情、买、卖。

=== room: linan.bank
name: 临安·通宝钱庄
exits: 西=linan.market
bank: true
---
临安城里最大的钱庄，黑漆柜台足有一人高。在这里存的钱，各地分号都能兑取。
在这里可以 存、取、存款。

=== room: linan.station
name: 临安·城南车马行
exits: 东=linan.road
station: true
npcs: world.npc.linan_bandit
---
官道边一个大院子，停着十几辆马车，骡马嚼着草料。车把式们蹲在墙根下晒太阳，等着拉客。
在这里可以 乘车 去别的城市。

# ---------------- 衙门差事 ----------------

=== npc: linan.officer
name: 张捕头
brief: 临安府的捕头，发放除害、送信之类的差事。
talk: linan.officer.talk
---
一个四十来岁的捕头，留着两撇八字胡，眼神精明。

=== dialog: linan.officer.talk
ifnone: 张捕头：今天的差事都派完了，明天再来吧。
---
张捕头：这位{男:兄弟|女:姑娘}，可是来领差事的？临安城里差事多，赏钱也痛快。
* 有什么除害的差事？ -> linan.job.bandit ?!flag:world.job.bandit_linan ?!today:world.job.bandit_linan
* 听说城里闹飞贼？ -> linan.job.thief ?!flag:world.job.thief_linan ?!today:world.job.thief_linan
* 要不要去客栈查查外乡人？ -> linan.job.patrol ?!flag:world.job.patrol_linan ?!today:world.job.patrol_linan
* 有信要送去嘉兴吗？ -> linan.job.mail_jiaxing ?!flag:world.job.mail_jiaxing ?!today:world.job.mailday_linan_jiaxing
* 有信要送去襄阳吗？ -> linan.job.mail_xiangyang ?!flag:world.job.mail_xiangyang ?!today:world.job.mailday_linan_xiangyang
* 交上嘉兴衙门托付的书信 -> linan.job.deliver_jiaxing ?flag:world.job.mail_linan_from_jiaxing
* 交上襄阳衙门托付的书信 -> linan.job.deliver_xiangyang ?flag:world.job.mail_linan_from_xiangyang
* 离开

=== dialog: linan.job.bandit
do: flag:world.job.bandit_linan
---
张捕头：城南车马行一带有几个拐子，专骗外地来的客商。去把他们拿了，赏钱八十文。
（差事：在临安城南车马行教训拐子）

=== dialog: linan.job.mail_jiaxing
do: flag:world.job.mail_jiaxing flag:world.job.mail_jiaxing_from_linan
---
张捕头递给你一个封了火漆的信封：“送到嘉兴衙门，那边自会付你 45 文脚钱。”
（差事：把书信送到嘉兴衙门。坐马车 1 日可到）

=== dialog: linan.job.mail_xiangyang
do: flag:world.job.mail_xiangyang flag:world.job.mail_xiangyang_from_linan
---
张捕头递给你一个封了火漆的信封：“送到襄阳的安抚使司，那边自会付你 135 文脚钱。”
（差事：把书信送到襄阳衙门。坐马车 7 日可到）

=== dialog: linan.job.deliver_jiaxing
do: unflag:world.job.mail_linan unflag:world.job.mail_linan_from_jiaxing money:45 potential:10 today:world.job.mailday_jiaxing_linan
---
张捕头拆开火漆看了看，点点头，数了 45 文钱给你。

=== dialog: linan.job.deliver_xiangyang
do: unflag:world.job.mail_linan unflag:world.job.mail_linan_from_xiangyang money:135 potential:10 today:world.job.mailday_xiangyang_linan
---
张捕头拆开火漆看了看，点点头，数了 135 文钱给你。

=== enemy: world.foe.linan_bandit
weapon: 拳
name: 拐子
attrs: 根骨=12, 身法=16, 悟性=12
skills: base.quan=6, base.zhang=8, base.zhaojia=4, base.tuna=5
ai: 刚=1, 巧=3, 守=1
cunning: 20
potential: 14
hpx: 0.7
---
两个贼眉鼠眼的汉子，一个装成落难的书生，一个在旁边帮腔。

=== npc: world.npc.linan_bandit
name: 拐子
brief: 在车马行骗外地客商的拐子。
if: flag:world.job.bandit_linan
talk: world.linan_bandit.talk
---
两个贼眉鼠眼的汉子，正围着一个刚下车的乡下客商说个不停。

=== dialog: world.linan_bandit.talk
---
拐子：哟，又来一个管闲事的？
* 动手 !fight:world.b.linan_bandit
* 走开

=== battle: world.b.linan_bandit
# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）
hpx: 1.14
enemies: world.foe.linan_bandit, world.foe.linan_bandit
win: world.linan_bandit.win
---
两个拐子对视一眼，一左一右扑了上来。

=== dialog: world.linan_bandit.win
do: unflag:world.job.bandit_linan today:world.job.bandit_linan money:80
---
两个拐子被你打得抱头鼠窜。乡下客商连连作揖。（差事完成，赏钱八十文）

# ---------------- 任务清单（D-045）----------------

=== quest: world.q.linan_bandit
name: 除害：拐子
flag: world.job.bandit_linan
where: linan.station
---
临安府张捕头的差事：去城南车马行教训骗外地客商的拐子。赏钱 80 文。

=== quest: world.q.mail_linan_jiaxing
name: 送信：临安 → 嘉兴
flag: world.job.mail_jiaxing_from_linan
where: jiaxing.office
---
把临安府的书信送到嘉兴衙门，脚钱 45 文。坐马车 1 日。

=== quest: world.q.mail_linan_xiangyang
name: 送信：临安 → 襄阳
flag: world.job.mail_xiangyang_from_linan
where: xiangyang.office
---
把临安府的书信送到襄阳衙门，脚钱 135 文。坐马车 7 日。

# ---------------- 每日差事：飞贼、查访客栈（D-054）----------------

=== dialog: linan.job.thief
do: flag:world.job.thief_linan
---
张捕头：市集上这几天丢东西的人多，是个手脚利落的飞贼干的。去把他揪出来，赏钱一百二十文。
（差事：在临安市集缉拿飞贼）

=== enemy: world.foe.linan_thief
weapon: 匕首
name: 飞贼
attrs: 根骨=11, 身法=19, 悟性=12
skills: base.zhang=14, base.quan=9, base.zhaojia=9, base.tuna=12
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 18
---
一个精瘦的汉子，眼珠滴溜溜乱转，袖子里鼓鼓囊囊的。

=== npc: world.npc.linan_thief
name: 飞贼
brief: 在临安市集偷东西的飞贼。
if: flag:world.job.thief_linan
talk: world.linan_thief.talk
---
一个精瘦的汉子在人群里钻来钻去，手不太老实。

=== dialog: world.linan_thief.talk
---
飞贼被你盯上，脸色一变，手已摸向腰间。
* 拿下他 !fight:world.b.linan_thief
* 算了

=== battle: world.b.linan_thief
# 难度调校（tools/tune.mjs）
hpx: 1.8
enemies: world.foe.linan_thief
win: world.linan_thief.win
---
飞贼拔出一把匕首，寒光一闪。

=== dialog: world.linan_thief.win
do: unflag:world.job.thief_linan today:world.job.thief_linan money:120
---
飞贼被你按倒在地，偷来的钱袋散了一地。（差事完成，赏钱一百二十文）

=== patch: linan.market
npcs: world.npc.linan_thief

=== dialog: linan.job.patrol
do: flag:world.job.patrol_linan
---
张捕头：近来外乡人多，去望湖客栈查一查住店的有没有可疑之人。看一圈回来就行，赏钱四十文。
（差事：去望湖客栈查访）

=== trigger: world.t.linan_patrol
room: linan.inn
if: flag:world.job.patrol_linan
do: unflag:world.job.patrol_linan today:world.job.patrol_linan money:40 potential:15
---
你跟掌柜要来住店的名簿翻了一遍，又在大堂里转了转，没发现什么可疑之人。（差事完成，赏钱四十文）

=== quest: world.q.linan_thief
name: 缉拿：临安飞贼
flag: world.job.thief_linan
where: linan.market
---
临安府张捕头的差事：去市集缉拿飞贼。赏钱 120 文。

=== quest: world.q.linan_patrol
name: 查访：望湖客栈
flag: world.job.patrol_linan
where: linan.inn
---
临安府张捕头的差事：去望湖客栈查访外乡人。赏钱 40 文。
