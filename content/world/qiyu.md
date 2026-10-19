# 马车奇遇送的秘籍（D-114）：门派、武馆、主线里都拿不到的六门武学。
# 只在坐马车的奇遇里极小概率得到（选对了之后约 3%）。秘籍是物品，输入「读」研读：
#   没学过就学会（上限 40，威力和越女剑法、武馆的刀剑差不多，见 docs/POWER.md）；
#   学过了再得一本，上限 +20，最高 100。
# 不进百科（百科只列门派和武馆的武学），留给玩家自己撞见。

# ---------------- 胡家刀法 ----------------

=== skill: qiyu.hudao
name: 胡家刀法
kind: 外功
stance: 刚
weapon: 刀
cap: 40
---
关外一户姓胡的人家传下来的刀法。刀路大开大合，却处处留着后手，看着是拼命的打法，其实一步也没有乱。
据说练到深处，刀随身走，身随步转，对手往往看不清刀是从哪一边来的。

=== move: qiyu.hudao.1
skill: qiyu.hudao
name: 顶风闯关
level: 0
power: 23
mp: 9
omen: $N把刀往肩上一扛，脚下一步一步往前逼……|$N压低了身子，刀尖斜指地面……
---
$N迎着来势硬闯进去，「$招」，刀锋从下往上撩向$n$部位！

=== move: qiyu.hudao.2
skill: qiyu.hudao
name: 回身斩
level: 15
power: 26
mp: 11
effects: 破绽
omen: $N忽然收刀转身，把后背亮给了你……
---
$N背身未定，「$招」已经借着转身的势子劈出，刀光绕了个大圈，正落在$n$部位！

=== move: qiyu.hudao.3
skill: qiyu.hudao
name: 雪地追风
level: 30
power: 30
mp: 14
effects: 内伤
omen: $N脚下一滑，像是在雪地上踩空了……
---
$N借着一滑之势贴地抢进，「$招」连斩三刀，一刀比一刀沉，最后一刀压在$n$部位上！

# ---------------- 苗家剑法 ----------------

=== skill: qiyu.miaojian
name: 苗家剑法
kind: 外功
stance: 巧
weapon: 剑
cap: 40
---
和胡家刀法齐名的一路剑法，出自一户姓苗的人家。剑招简净，不多一分花巧，每一剑都刺在对手最不想挨的地方。
两家人斗了几代，刀法和剑法里都藏着破对方的法子。

=== move: qiyu.miaojian.1
skill: qiyu.miaojian
name: 叩关
level: 0
power: 21
mp: 8
omen: $N剑尖轻轻一点，像在敲门……|$N长剑平举，剑尖一动不动地对着你……
---
$N剑尖连点，「$招」，一下一下叩向$n$的$部位！

=== move: qiyu.miaojian.2
skill: qiyu.miaojian
name: 落花随水
level: 15
power: 25
mp: 10
effects: 破绽
omen: $N剑身一软，顺着你的来势往下滑……
---
$N顺势一引，「$招」，剑锋贴着$n的兵刃溜了进去，点向$部位！

=== move: qiyu.miaojian.3
skill: qiyu.miaojian
name: 一剑断桥
level: 30
power: 30
mp: 13
effects: 点穴
omen: $N退了半步，剑尖垂下，像是在等什么……
---
$N等的就是这一下，「$招」，剑光一闪即没，$n只觉$部位一麻！

# ---------------- 金蛇剑法 ----------------

=== skill: qiyu.jinshe
name: 金蛇剑法
kind: 外功
stance: 巧
weapon: 剑
cap: 40
---
一位怪侠留在山洞里的剑法，剑路弯弯曲曲，像蛇在草里游。常人练剑讲究直来直去，这一路偏偏处处拐弯，叫人防不胜防。
留下这剑法的人性子孤僻，招式里也带着三分阴狠。

=== move: qiyu.jinshe.1
skill: qiyu.jinshe
name: 蛇行草间
level: 0
power: 22
mp: 8
omen: $N剑尖贴着地面左右摆动……|$N身子一扭，剑跟着人拐了个弯……
---
$N剑走弧线，「$招」，剑尖绕了个弯，从$n意想不到的方向钻向$部位！

=== move: qiyu.jinshe.2
skill: qiyu.jinshe
name: 金蛇吐信
level: 15
power: 25
mp: 11
effects: 点穴
omen: $N剑尖一伸一缩，忽长忽短……
---
$N剑尖疾吐，「$招」，一缩一伸之间已点中$n$部位的穴道！

=== move: qiyu.jinshe.3
skill: qiyu.jinshe
name: 盘蛇倒卷
level: 30
stance: 守
power: 27
mp: 12
effects: 缴械
omen: $N把剑往回一收，剑身盘在臂上……
---
$N剑身倒卷，「$招」，缠住$n的兵刃往外一绞！

# ---------------- 百花错拳 ----------------

=== skill: qiyu.baihua
name: 百花错拳
kind: 外功
stance: 守
cap: 40
---
一位老拳师把各家拳脚拆散了重新拼起来的拳法：一招里头，上半截是这家的，下半截是那家的。
对手认得出每一个架子，偏偏认不出整招，越是见多识广的人越容易上当。

=== move: qiyu.baihua.1
skill: qiyu.baihua
name: 错花
level: 0
power: 21
mp: 8
omen: $N摆了个守门户的架子，手却在暗暗变换……|$N两臂一交，护住胸口……
---
$N架子是守的，「$招」打出来却是另一家的拳路，一拳撞向$n$部位！

=== move: qiyu.baihua.2
skill: qiyu.baihua
name: 乱插花枝
level: 15
stance: 巧
power: 25
mp: 10
effects: 破绽
omen: $N双手乱晃，看不出要打哪里……
---
$N十指乱点，「$招」，掌、拳、指换了三换，最后落在$n$部位！

=== move: qiyu.baihua.3
skill: qiyu.baihua
name: 百花齐开
level: 30
stance: 刚
power: 30
mp: 14
effects: 内伤
omen: $N沉腰坐马，像是要使一路最平常的长拳……
---
$N起手是长拳，中途变了劈挂，落下时又成了铁臂，「$招」一气打完，$n$部位连中数拳！

# ---------------- 神照经 ----------------

=== skill: qiyu.shenzhao
name: 神照经
kind: 内功
cap: 40
hp: 8
mp: 9
affinity: 守
---
一部讲内息周流的经，字句平淡，读起来像养生的书。练久了，内力生生不息，受了伤也好得比旁人快。
传说有人凭它从重伤里活了过来，但这本抄本只有前面一小半。

# ---------------- 神行百变 ----------------

=== skill: qiyu.shenxing
name: 神行百变
kind: 轻功
cap: 40
traits: 回旋@30
---
一路走起来没有定法的身法：进退、高低、快慢随时都在变，讲究的是对手看不准你下一步落在哪里。
30 级「回旋」：调息、换兵器时不露破绽，调息多回内力。

# ---------------- 秘籍（物品）----------------

=== item: qiyu.book.hudao
name: 胡家刀谱
verb: 读
book: qiyu.hudao
---
一本手抄的刀谱，封皮磨得起了毛，扉页上画着一个提刀的大汉。

=== item: qiyu.book.miaojian
name: 苗家剑谱
verb: 读
book: qiyu.miaojian
---
薄薄一本剑谱，字迹端正，每一招旁边都细细注着脚步。

=== item: qiyu.book.jinshe
name: 金蛇秘笈
verb: 读
book: qiyu.jinshe
---
一本发黄的册子，扉页上画着一条盘着的小蛇，字里行间夹着许多古怪的批注。

=== item: qiyu.book.baihua
name: 百花错拳谱
verb: 读
book: qiyu.baihua
---
一本杂乱的拳谱，每一页都画着两三家的拳架，又用朱笔勾连在一起。

=== item: qiyu.book.shenzhao
name: 神照经残本
verb: 读
book: qiyu.shenzhao
---
半部经书，后半截被人撕去了，剩下的字句平平淡淡，像在讲怎么喘气。

=== item: qiyu.book.shenxing
name: 神行百变图
verb: 读
book: qiyu.shenxing
---
一卷脚印图，密密麻麻的脚印绕来绕去，看久了头晕。

=== use: qiyu.u.hudao
item: qiyu.book.hudao
do: study:qiyu.hudao take:qiyu.book.hudao
---
你找了个僻静处，把胡家刀谱从头到尾比划了一遍。读到最后，册子已经翻散了架。

=== use: qiyu.u.miaojian
item: qiyu.book.miaojian
do: study:qiyu.miaojian take:qiyu.book.miaojian
---
你照着剑谱上的脚步一遍一遍地走，直到不看谱也走得出来。剑谱被你翻得散了页。

=== use: qiyu.u.jinshe
item: qiyu.book.jinshe
do: study:qiyu.jinshe take:qiyu.book.jinshe
---
那些古怪的批注你琢磨了好几天才看懂：原来要倒着读。读通以后，册子也被你翻烂了。

=== use: qiyu.u.baihua
item: qiyu.book.baihua
do: study:qiyu.baihua take:qiyu.book.baihua
---
你把拳谱上那些拼来拼去的拳架一个个拆开、再一个个拼回去。拼完了，拳谱也散了。

=== use: qiyu.u.shenzhao
item: qiyu.book.shenzhao
do: study:qiyu.shenzhao take:qiyu.book.shenzhao
---
你按着经上说的法子调息，一夜下来，丹田里多了一缕温温的气。残本的纸太脆，读完就碎了。

=== use: qiyu.u.shenxing
item: qiyu.book.shenxing
do: study:qiyu.shenxing take:qiyu.book.shenxing
---
你在空地上照着图一步一步地踩，踩到天黑，才算把那些绕来绕去的脚印踩顺了。图也被你踩得满是泥。
