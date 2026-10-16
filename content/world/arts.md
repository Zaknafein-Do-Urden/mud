# 剧情传授的武学（门派之外）：定义放在共享地图，主线没加载时也认得（合击页、组队时对方的武功，D-083）。
# 怎么得到、上限怎么提高，写在各主线里；按 docs/POWER.md 的威力规则安排。
# id 保留原来的主线前缀，老存档不受影响。

# ---------------- 杨家枪法：射雕第二章，杨铁心的枪谱 ----------------

=== skill: shediao.yangqiang
name: 杨家枪法
kind: 外功
stance: 刚
weapon: 枪
cap: 10
---
杨家将世代相传的枪法，当年在战阵上冲锋陷阵用的。招式朴实，一枪一扎都是杀招。
杨铁心留下的枪谱只有几页，有些地方要靠悟，有些要等见到懂行的人才能看明白。

=== move: shediao.yangqiang.1
skill: shediao.yangqiang
name: 拦拿扎
level: 0
power: 21
mp: 8
omen: $N枪尖一拦一拿，枪身缓缓后撤……|$N沉肩坐马，枪尖对准了你的中路……
---
$N枪杆一拦一拿，「$招」，枪尖笔直扎向$n$部位！

=== move: shediao.yangqiang.2
skill: shediao.yangqiang
name: 梨花摆头
stance: 巧
level: 20
power: 24
mp: 10
effects: 破绽
omen: $N枪尖乱颤，抖出一团枪花……
---
$N枪头左摆右摆，「$招」，枪花像一树梨花在$n眼前炸开，枪尖藏在花里点向$部位！

=== move: shediao.yangqiang.3
skill: shediao.yangqiang
name: 回马枪
level: 45
power: 34
mp: 15
effects: 破绽
omen: $N拖着枪往后退，像是要逃……
---
$N佯败回身，猛地一个转身，「$招」从肋下翻出，直取$n$部位！

# ---------------- 越女剑法：射雕第四章，韩小莹所授 ----------------

=== skill: shediao.yuenv
name: 越女剑法
kind: 外功
stance: 巧
weapon: 剑
cap: 40
---
韩小莹的家传剑法，相传源出春秋时越国的一位牧羊少女。剑招轻灵，以快打慢、以巧破拙，最适合身形灵便的人。

=== move: shediao.yuenv.1
skill: shediao.yuenv
name: 采莲
level: 0
power: 19
mp: 7
omen: $N剑尖轻点，脚下踏着碎步绕到你侧面……|$N手腕一翻，剑光像水面的波纹一样荡开……
---
$N身形一侧，「$招」，剑尖像采莲的手一样轻巧地探向$n$部位！

=== move: shediao.yuenv.2
skill: shediao.yuenv
name: 浣纱
level: 15
power: 24
mp: 10
effects: 破绽
omen: $N长剑贴着身子往下一沉，剑尖几乎垂到地面……
---
$N剑势一圈一抹，「$招」，像在溪水里漂洗白纱，剑光连绵不断地裹向$n！

=== move: shediao.yuenv.3
skill: shediao.yuenv
name: 回眸
level: 30
power: 30
mp: 13
effects: 点穴
omen: $N忽然转身背对着你，像是要走……
---
$N背身一个回旋，「$招」，剑尖从肋下反刺而出，正点在$n$部位的穴道上！
