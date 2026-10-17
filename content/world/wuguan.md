# 各城武馆（D-061）：花钱学基础武功。从市集往东走。
# 新角色只会庄稼把式（只有刚招），要读预兆克敌，至少要再学一门巧（小巧掌）和一门守（沾衣十八跌）。D-079：这两门和养气诀半价。

=== dialog: world.wuguan.talk
---
教头：要学功夫？咱们武馆童叟无欺，交了钱当场就教。
?!learned:base.zhang ?!learned:base.zhaojia 教头：看你只会两下庄稼把式。听我一句：先学小巧掌和沾衣十八跌，刚、巧、守凑齐了，才能见招拆招。
* 学小巧掌（巧，30 文） ?!learned:base.zhang ?money:30 !pay:30 !learn:base.zhang
* 学沾衣十八跌（守，30 文） ?!learned:base.zhaojia ?money:30 !pay:30 !learn:base.zhaojia
* 学养气诀（内功，40 文） ?!learned:base.tuna ?money:40 !pay:40 !learn:base.tuna
* 学五虎断门刀（刀法，要有刀，80 文） ?!learned:base.dao ?money:80 !pay:80 !learn:base.dao
* 学三才剑（剑法，要有剑，80 文） ?!learned:base.jian ?money:80 !pay:80 !learn:base.jian
* 告辞

=== patch: linan.market
exits: 北=linan.wuguan

=== room: linan.wuguan
name: 临安·武馆
exits: 南=linan.market
npcs: linan.teacher
train: true
---
一座宽敞的院子，地上铺着青砖，兵器架上插满了刀枪剑戟。几个后生正对着木人桩练拳，呼喝声此起彼伏。
在这里可以花钱学基础武功，也可以修炼。

=== npc: linan.teacher
name: 周教头
brief: 临安武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个四十来岁的汉子，腰板挺得笔直，说话中气十足。

=== patch: jiaxing.market
exits: 东=jiaxing.wuguan

=== room: jiaxing.wuguan
name: 嘉兴·武馆
exits: 西=jiaxing.market
npcs: jiaxing.teacher
train: true
---
一座宽敞的院子，地上铺着青砖，兵器架上插满了刀枪剑戟。几个后生正对着木人桩练拳，呼喝声此起彼伏。
在这里可以花钱学基础武功，也可以修炼。

=== npc: jiaxing.teacher
name: 沈教头
brief: 嘉兴武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个四十来岁的汉子，腰板挺得笔直，说话中气十足。

=== patch: xiangyang.market
exits: 东=xiangyang.wuguan

=== room: xiangyang.wuguan
name: 襄阳·武馆
exits: 西=xiangyang.market
npcs: xiangyang.teacher
train: true
---
一座宽敞的院子，地上铺着青砖，兵器架上插满了刀枪剑戟。几个后生正对着木人桩练拳，呼喝声此起彼伏。
在这里可以花钱学基础武功，也可以修炼。

=== npc: xiangyang.teacher
name: 马教头
brief: 襄阳武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个四十来岁的汉子，腰板挺得笔直，说话中气十足。

=== patch: luoyang.market
exits: 东=luoyang.wuguan

=== room: luoyang.wuguan
name: 洛阳·武馆
exits: 西=luoyang.market
npcs: luoyang.teacher
train: true
---
一座宽敞的院子，地上铺着青砖，兵器架上插满了刀枪剑戟。几个后生正对着木人桩练拳，呼喝声此起彼伏。
在这里可以花钱学基础武功，也可以修炼。

=== npc: luoyang.teacher
name: 韩教头
brief: 洛阳武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个四十来岁的汉子，腰板挺得笔直，说话中气十足。

=== patch: changan.market
exits: 东=changan.wuguan

=== room: changan.wuguan
name: 长安·武馆
exits: 西=changan.market
npcs: changan.teacher
train: true
---
一座宽敞的院子，地上铺着青砖，兵器架上插满了刀枪剑戟。几个后生正对着木人桩练拳，呼喝声此起彼伏。
在这里可以花钱学基础武功，也可以修炼。

=== npc: changan.teacher
name: 杜教头
brief: 长安武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个四十来岁的汉子，腰板挺得笔直，说话中气十足。

=== patch: chengdu.market
exits: 东=chengdu.wuguan

=== room: chengdu.wuguan
name: 成都·武馆
exits: 西=chengdu.market
npcs: chengdu.teacher
train: true
---
一座宽敞的院子，地上铺着青砖，兵器架上插满了刀枪剑戟。几个后生正对着木人桩练拳，呼喝声此起彼伏。
在这里可以花钱学基础武功，也可以修炼。

=== npc: chengdu.teacher
name: 彭教头
brief: 成都武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个四十来岁的汉子，腰板挺得笔直，说话中气十足。

# ---------------- 天龙八部（大理）新增 ----------------

=== patch: dali.market
exits: 东=dali.wuguan

=== room: dali.wuguan
name: 大理·武馆
exits: 西=dali.market
npcs: dali.teacher
train: true
---
院子里晒着几张弓，兵器架上的刀枪都擦得锃亮。几个白族后生光着膀子对练，喝起彩来满院子回声。
在这里可以花钱学基础武功，也可以修炼。

=== npc: dali.teacher
name: 和教头
brief: 大理武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个黑瘦精悍的汉子，手背上一道旧刀疤，说话不多，示范起来却极有耐心。

# ---------------- 笑傲江湖（福州）新增 ----------------

=== patch: fuzhou.market
exits: 东=fuzhou.wuguan

=== room: fuzhou.wuguan
name: 福州·武馆
exits: 西=fuzhou.market
npcs: fuzhou.teacher
train: true
---
院子正中立着一排木桩，桩头都被打得起了毛。墙上挂着十几面镖旗，是各家镖局托武馆代为招人的招牌。
在这里可以花钱学基础武功，也可以修炼。

=== npc: fuzhou.teacher
name: 郑教头
brief: 福州武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个膀大腰圆的汉子，早年在镖行走过南路，左眉毛上一道疤，说话嗓门极大。

# ---------------- 天龙八部（苏州）新增 ----------------

=== patch: suzhou.market
exits: 南=suzhou.wuguan

=== room: suzhou.wuguan
name: 苏州·武馆
exits: 北=suzhou.market
npcs: suzhou.teacher
train: true
---
院子不大，临着河，墙根下摆着一溜石锁。几个少年在河边的空地上打拳，拳风带起的灰尘落进水里。
在这里可以花钱学基础武功，也可以修炼。

=== npc: suzhou.teacher
name: 范教头
brief: 苏州武馆的教头，教基础武功。
talk: world.wuguan.talk
---
一个精瘦的汉子，说话慢条斯理，一动起手来却快得看不清。
