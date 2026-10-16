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

# ================= 天龙八部 =================
# 剧情传授的三门（凌波微步、北冥神功、一阳指）上限随章节用 cap: 提高，见 docs/POWER.md §5。
# 六脉神剑、修罗刀只给 NPC 队友用，不传授玩家（定义在这里是因为合击要认得它们，D-083）。

# ---------------- 凌波微步：第一章，无量山石洞玉璧下临摹的步法图 ----------------

=== skill: tianlong.lingbo
name: 凌波微步
kind: 轻功
cap: 10
traits: 回旋@40
---
石壁上刻的那套步法，按着八八六十四卦的方位走，踏过一遍，人已到了丈外。
练的人不与对手硬碰，只在方位上占先：对方一招未老，你的身子早不在原处了。
40 级「回旋」：调息、换兵器时不露破绽，调息多回内力。
这套步法的图谱残缺不全，要随着无量山、万劫谷、天龙寺的旧事一点点看懂，上限才能提高。

# ---------------- 北冥神功：第二章，段誉抄给你的总纲 ----------------

=== skill: tianlong.beiming
name: 北冥神功
kind: 内功
cap: 20
hp: 6
mp: 14
affinity: 巧
# 吸内（D-214）：出手得手（没被克制）时，把对手 四成伤害值 的内力吸过来
absorb: 0.4
---
逍遥一脉的内功，取北冥之意：江河灌海而海不盈。练这门功夫的人内力格外深厚，像是有个填不满的湖。
吸内：装备这门内功时，每一次没被克制的攻击，都会顺着交手处把对手的内力吸过来（四成伤害值）。
吸来的内力可以暂时超过你的内力上限——一战之内取之不尽，打完了却带不走：下一场交手，内力仍旧从你自己的上限算起。
段誉说，这门功夫的后半篇他看一眼就心里发毛，自己是决不练的；至于抄给你之后你练不练，他说那是你的事。

# ---------------- 一阳指：第三章，天龙寺本因大师所授（入门三品）----------------

=== skill: tianlong.yiyangzhi
name: 一阳指
kind: 外功
stance: 巧
cap: 25
---
大理段氏的家传指法，以一指之力点人穴道。段氏传了数代，分九品，本因大师授你的是最浅的三品。
指力要靠内功撑着，出手讲究一个准字：差之毫厘，点在穴道外头，就是白费一指。

=== move: tianlong.yiyangzhi.1
skill: tianlong.yiyangzhi
name: 点星
level: 0
power: 20
mp: 8
effects: 破绽
omen: $N食指微微曲起，指尖对准了你肩头……|$N垂手而立，只有一根手指轻轻点着空气……
---
$N食指疾伸，「$招」，指尖像一粒火星点在$n$部位上！

=== move: tianlong.yiyangzhi.2
skill: tianlong.yiyangzhi
name: 拂穴
level: 20
power: 26
mp: 11
effects: 点穴
omen: $N手掌一翻，五指张开又收拢，只剩食中二指并着……
---
$N两指并拢，「$招」，自下而上一挑，正点在$n$部位的穴道上！

=== move: tianlong.yiyangzhi.3
skill: tianlong.yiyangzhi
name: 一指凌空
level: 40
power: 32
mp: 16
effects: 点穴, 破绽
omen: $N站着不动，指尖却渐渐泛起一层淡淡的血色……
---
$N隔着三尺一指点出，「$招」，指风无声无息，$n$部位一麻，半边身子都不听使唤了！

# ---------------- 六脉神剑：第四章，本因大师以商阳一路相授（D-215）----------------
# 上限先压到 10 级：一路剑气，只有「商阳剑」一招。通的脉越多，上限越高，后面的章节用 cap: 放开。
# 段誉也用这门武功做 NPC 队友，他使得时灵时不灵，等级压得低。

=== skill: tianlong.liumai
name: 六脉神剑
kind: 外功
stance: 巧
cap: 10
---
天龙寺镇寺之宝，以内力化作剑气，自六条经脉的指端射出。无形无质，伤人于丈外。
一个人能通几条经脉，就使得出几路剑气。天龙寺六位高僧各守一路，合起来才是完整的六脉；
本因大师传你的是他自己那一路「商阳剑」——练得再熟，也只有这一指。日后通的脉多了，这门武学的上限才会跟着抬高。
段誉是误打误撞学全的，却时常使不出来——他自己说，像是家里有口深井，打水的绳子却时有时无。

=== move: tianlong.liumai.1
skill: tianlong.liumai
name: 商阳剑
level: 0
power: 30
mp: 14
omen: $N伸出食指虚虚一划，指尖却什么也没有……
---
$N食指一引，「$招」，一道看不见的剑气破空刺向$n$部位！

=== move: tianlong.liumai.2
skill: tianlong.liumai
name: 少泽剑
level: 20
power: 36
mp: 18
effects: 破绽
omen: $N小指翘起，手腕一沉，空气里隐隐有嗡嗡的声响……
---
$N小指轻弹，「$招」，剑气忽左忽右，绕过$n的守势直取$部位！

=== move: tianlong.liumai.3
skill: tianlong.liumai
name: 少商剑
level: 40
power: 44
mp: 24
effects: 内伤
omen: $N拇指一竖，周身衣袂无风自动……
---
$N拇指疾点，「$招」，一股剑气沉雄浑厚，隔空撞在$n$部位上！

# ---------------- 修罗刀（NPC 专用：木婉清）----------------

=== skill: tianlong.xiuluo
name: 修罗刀
kind: 外功
stance: 刚
weapon: 刀
---
幽谷里练出来的刀法，招招狠辣，不留余地。练刀的人蒙着面，出刀时连眼睛都不眨。

=== move: tianlong.xiuluo.1
skill: tianlong.xiuluo
name: 断情
level: 0
power: 24
mp: 10
omen: $N刀锋斜垂，刀背贴着小臂……
---
$N欺身而上，「$招」，一刀自下撩起，直奔$n$部位！

=== move: tianlong.xiuluo.2
skill: tianlong.xiuluo
name: 雪满头
level: 20
power: 30
mp: 14
effects: 内伤
omen: $N双手握刀举过头顶，刀身映着天光……
---
$N一刀劈落，「$招」，刀势沉得像整座山压下来，$n$部位一震！
