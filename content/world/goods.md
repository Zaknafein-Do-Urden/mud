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
川芎、黄连、当归之类。成都最便宜。

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
name: 劫匪
robber: true
attrs: 根骨=12, 身法=12, 悟性=10
skills: base.quan=1, base.zhang=1, base.zhaojia=1, base.tuna=1
ai: 刚=2, 巧=2, 守=1
cunning: 20
potential: 10
---
蒙着脸的汉子，手里提着明晃晃的钢刀。
