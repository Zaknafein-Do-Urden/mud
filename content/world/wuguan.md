# 各城武馆（D-061）：花钱学基础武功。从市集往东走。
# 新角色只会庄稼把式（刚巧守各一招，但都粗浅，D-070），学了小巧掌、沾衣十八跌，巧招、守招才真正管用。

=== dialog: world.wuguan.talk
---
教头：要学功夫？咱们武馆童叟无欺，交了钱当场就教。
?!learned:base.zhang ?!learned:base.zhaojia 教头：看你只会两下庄稼把式。那几下勾腿、抱架粗浅得很，听我一句：先学小巧掌和沾衣十八跌，巧招、守招才真正顶用。
* 学小巧掌（巧，60 文） ?!learned:base.zhang ?money:60 !pay:60 !learn:base.zhang
* 学沾衣十八跌（守，60 文） ?!learned:base.zhaojia ?money:60 !pay:60 !learn:base.zhaojia
* 学养气诀（内功，80 文） ?!learned:base.tuna ?money:80 !pay:80 !learn:base.tuna
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
