# 货物与劫匪。规则见 docs/ECONOMY.md。
# 货物的 price 是基准价（文）；各城市的 goods 属性写本地倍率：低于 1 是产地便宜，高于 1 是稀缺贵。
# 城市没写的货物，那里不收也不卖。

=== goods: silk
name: 丝绸
price: 60
---
江南织造的绸缎，光滑柔软。产地嘉兴、临安，北方和西域都抢着要。

=== goods: tea
name: 茶叶
price: 30
---
新焙的茶饼。江南和蜀中产茶，北方卖得贵。

=== goods: porcelain
name: 瓷器
price: 80
---
青瓷白瓷，洛阳一带窑口最多。易碎，但值钱。

=== goods: salt
name: 盐
price: 20
---
官盐私盐都有。嘉兴、长安便宜，蜀中缺盐。

=== goods: herbs
name: 药材
price: 50
---
川芎、黄连、当归之类。成都、襄阳是集散地，最便宜。

=== goods: iron
name: 铁器
price: 40
---
刀枪锄犁。襄阳、洛阳的铁匠铺多，江南贵。

=== goods: fur
name: 皮货
price: 70
---
西域和关外的皮毛。长安最便宜，越往南越贵。

=== goods: shujin
name: 蜀锦
price: 90
---
成都织造的锦缎，色彩艳丽。出了蜀地价钱翻倍。

# ---------------- 劫匪（坐马车时可能遇到）----------------
# robber: true 的敌人是劫匪模板，武功等级会按货物和现钱的总值调整（D-040）。

=== enemy: world.foe.robber
weapon: 刀
weaponName: 钢刀
name: 劫匪
robber: true
attrs: 根骨=12, 身法=12, 悟性=10
skills: base.quan=1, base.zhang=1, base.zhaojia=1, base.tuna=1
ai: 刚=2, 巧=2, 守=1
cunning: 20
potential: 10
---
蒙着脸的汉子，手里提着明晃晃的钢刀。

# 镖师（D-104）：在车马行雇了护送，遇上劫匪时作为 NPC 队友并肩作战。escort: true，武功等级跟劫匪一样按货值缩放
=== enemy: world.ally.biaoshi
weapon: 刀
weaponName: 鬼头刀
name: 镖师
escort: true
attrs: 根骨=16, 身法=13, 悟性=12
skills: base.dao=1, base.quan=1, base.zhaojia=1, base.tuna=1
ai: 刚=3, 守=2
weaponBonus: 80
---
镖局里走惯了长路的汉子，一口鬼头刀，一面镖旗，见了劫匪眼睛都不眨。

# ---------------- 天龙八部（大理）新增 ----------------

=== goods: dianma
name: 滇马
price: 110
---
大理出产的矮脚马，个头不高，驮得重，走山路如履平地。蜀道上的马帮最认这种马，出了大理价钱就翻上去。

# ---------------- 笑傲江湖（福州）新增 ----------------

=== goods: seafood
name: 海货
price: 45
---
鱼干、虾米、紫菜、淡菜之类，沿海晒出来的干货。福州最便宜，越往内地越贵，蜀中更是稀罕物。

=== goods: lizhi
name: 荔枝干
price: 75
---
闽中的荔枝晒干了装篓，能放上一年。鲜荔枝出不了山，干荔枝却能一路卖到北边去。

# ---------------- 天龙八部（苏州）新增 ----------------

=== goods: suxiu
name: 苏绣
price: 100
---
苏州绣娘一针一线绣出来的绢画，近看看得见针脚，远看像泼上去的。越往北越金贵，蜀中、关外都抢。

# ---------------- 笑傲江湖（衡阳）新增 ----------------

=== goods: paper
name: 湘纸
price: 55
---
衡阳沿江的作坊里抄出来的纸，白净匀薄，写字不洇。顺湘江北上，到中原就是好价钱。
