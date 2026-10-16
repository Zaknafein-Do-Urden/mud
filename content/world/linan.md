# 临安城（共享世界）
# 以 # 开头的行是注释。语法见 docs/DESIGN.md §5、docs/STORY.md §4。
# 共享世界只能写 world.* 标记。

=== meta: game
title: 江湖夜雨
start: linan.gate
---
南宋，宁宗年间。
你背着一个小小的包袱，在黄昏时分走到了[[临安|linan.e.linan]]城下。
师父临终前只留给你一句话：“去临安，找一个会吹竹哨的人。”

=== item: coin
name: 铜钱
---
一枚磨得发亮的铜钱，上面铸着“庆元通宝”四个字。

=== item: bamboo_whistle
name: 竹哨
---
一支短短的竹哨，哨身刻着一只歪歪扭扭的燕子。

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
exits: 北=linan.street, 东=linan.lake, 南=linan.road
npcs: linan.beggar
---
城门高耸，青砖上爬满了暮色。守门的兵卒倚着长枪打盹，偶尔有挑担的货郎匆匆进出。
?!flag:world.beggar_friend 墙根下蜷着一个老乞丐，面前摆着一只缺了口的破碗。
?flag:world.beggar_friend 墙根下的老乞丐冲你挤了挤眼睛，像是认得你。

=== room: linan.road
name: 城外官道
exits: 北=linan.gate
---
出了城门，官道向东南延伸，两旁是收割过的稻田，田埂上积着薄薄一层残雪。
远处几缕炊烟，是散落在城郊的村落。

=== room: linan.street
name: 临安城·御街
exits: 南=linan.gate, 东=linan.teahouse, 北=linan.yamen
---
御街宽阔，两旁店铺林立，灯笼一盏接一盏地亮起来。
空气里飘着葱包桧儿和定胜糕的香味，叫卖声此起彼伏。
?visited:linan.lake 你想起西湖边那座断桥，不知为何心里有些不安。

=== room: linan.teahouse
name: 清风茶楼
exits: 西=linan.street
npcs: linan.storyteller
---
茶楼里人声鼎沸，跑堂的提着长嘴铜壶在桌间穿梭。
正中一张高桌上，一个说书先生正拍着醒木，讲得唾沫横飞。

=== room: linan.yamen
name: 临安府衙
exits: 南=linan.street
---
府衙大门紧闭，门前两座石狮子在暮色里显得格外威严。
墙上贴着一张告示，墨迹尚新：“近日西湖一带屡有命案，入夜后百姓勿近断桥。”

=== room: linan.lake
name: 西湖·断桥
exits: 西=linan.gate
---
湖面笼着一层薄雾，残荷在风里瑟瑟作响。断桥上空无一人。
?!has:bamboo_whistle 桥栏的石缝里似乎塞着什么东西，但天色太暗，看不真切。
?has:bamboo_whistle 你握紧了竹哨。远处的雾里，仿佛有人也在等一声哨响。

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
?!flag:world.beggar_friend 老乞丐：这位客官，行行好，赏口饭吃吧……
?flag:world.beggar_friend 老乞丐：嘿嘿，又是你。东西收好了没有？
* 给他一文钱 -> linan.beggar.give ?has:coin ?!flag:world.beggar_friend !take:coin !flag:world.beggar_friend
* 打听会吹竹哨的人 -> linan.beggar.whistle
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
* 收下竹哨 !give:bamboo_whistle !flag:world.got_whistle

=== dialog: linan.beggar.whistle
---
?!flag:world.beggar_friend 老乞丐翻了个白眼：竹哨？老叫花子只会敲破碗。
?flag:world.beggar_friend 老乞丐：嘘——小声些。这城里，耳朵多着呢。

=== npc: linan.storyteller
name: 说书先生
brief: 清风茶楼的说书人，消息灵通。
talk: linan.storyteller.start
---
一个干瘦的中年人，青布长衫洗得发白，手里一块醒木被摩挲得油亮。
他说的书里，一半是古人，一半是眼下江湖上的新鲜事。

=== dialog: linan.storyteller.start
---
说书先生：客官想听什么？前朝旧事，还是眼下的新鲜事？
* 离开
