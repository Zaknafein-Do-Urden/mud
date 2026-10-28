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

# ---------------- 南山掌法：射雕第六章，南希仁所授（上限随剧情放开，结局 100）----------------

=== skill: shediao.nanshan
name: 南山掌法
kind: 外功
stance: 刚
cap: 30
---
江南七怪中南山樵子南希仁的掌法。南希仁少言寡语，掌法也和他的人一样，不求好看，一掌是一掌，沉稳厚重。

=== move: shediao.nanshan.1
skill: shediao.nanshan
name: 樵子开山
level: 0
power: 24
mp: 9
omen: $N双掌一前一后，像抡斧头似的往上一提……|$N沉腰坐马，肩膀一沉……
---
$N双掌合力劈下，「$招」，掌风沉沉地压向$n$部位！

=== move: shediao.nanshan.2
skill: shediao.nanshan
name: 担柴压顶
level: 20
power: 30
mp: 12
effects: 内伤
omen: $N两臂平举过肩，像扛着一担柴……
---
$N双臂一沉，「$招」，掌力自上而下砸在$n$部位，震得人气血翻涌！

=== move: shediao.nanshan.3
skill: shediao.nanshan
name: 南山不老
level: 50
power: 38
mp: 16
effects: 破绽
omen: $N掌势一收，整个人稳得像一棵老松……
---
$N蓄势良久，「$招」一掌推出，掌力绵绵不绝，$n只觉得像撞上了一座山！

# ---------------- 落英神剑掌：射雕第九章起，黄蓉所授（桃花岛武学，上限随剧情放开，结局 100）----------------

=== skill: shediao.luoying
name: 落英神剑掌
kind: 外功
stance: 巧
cap: 25
---
桃花岛的掌法，掌影翻飞，虚实相生，像满树桃花被风吹落。招式里藏着剑意，所以叫"神剑掌"。

=== move: shediao.luoying.1
skill: shediao.luoying
name: 落英缤纷
level: 0
power: 26
mp: 9
omen: $N双掌翩翩翻动，掌影像花瓣一样飘了过来……|$N身形一转，衣袂飘飘……
---
$N掌影纷飞，「$招」，十几道掌影里只有一道是真的，正拍在$n$部位！

=== move: shediao.luoying.2
skill: shediao.luoying
name: 桃花漫天
level: 25
power: 32
mp: 12
effects: 破绽
omen: $N双掌一错，掌影忽然多了一倍……
---
$N身随掌走，「$招」，掌影铺天盖地罩下来，$n看得眼花缭乱，露出了空门！

=== move: shediao.luoying.3
skill: shediao.luoying
name: 奇门落英
level: 50
power: 40
mp: 16
effects: 点穴
omen: $N脚下踏着古怪的步子，转眼绕到了你身侧……
---
$N步法暗合奇门，「$招」，一掌从意想不到的方位拂出，正点在$n$部位的穴道上！

=== move: shediao.luoying.4
skill: shediao.luoying
name: 神剑落英
level: 80
power: 50
mp: 22
effects: 破绽, 群攻
omen: $N双掌并起如剑，掌风里隐隐有剑啸之声……
---
$N以掌作剑，「$招」，掌风化作漫天剑气，像一场桃花雨落在所有对手身上！

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

=== move: tianlong.liumai.4
skill: tianlong.liumai
name: 中冲剑
level: 60
power: 46
mp: 26
effects: 群攻
omen: $N中指缓缓抬起，指尖对着空处划了半个圈……
---
$N中指一引，「$招」，剑气扇面般扫开，当面的人一个也躲不过！

=== move: tianlong.liumai.6
skill: tianlong.liumai
name: 少冲剑
level: 140
power: 62
mp: 38
effects: 内伤, 破绽
omen: $N的右手小指微微一弹，指尖上没有光——只有一道看不见的风，直着过来……
---
$N小指一弹，「$招」，一线剑气透进$n的$部位，入肉三分而不见血！

=== move: tianlong.liumai.5
skill: tianlong.liumai
name: 关冲剑
level: 80
power: 52
mp: 30
effects: 内伤
omen: $N无名指微微弯着，指节上泛起一层很淡的白……
---
$N无名指一弹，「$招」，一道剑气绵绵不绝地钻进$n$部位，像一根线扎进了心口！

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

# ================= 笑傲江湖 =================
# 剧情传授：翻天掌（第一章，林震南所授），上限随章节用 cap: 提高，见 docs/POWER.md §9。
# 辟邪剑法只给 NPC 林平之用，不传授玩家（定义在这里是因为合击要认得它，D-083）。

# ---------------- 翻天掌：第一章，福威镖局林家的看家掌法 ----------------

=== skill: xiaoao.fantian
name: 翻天掌
kind: 外功
stance: 刚
cap: 10
---
福威镖局林家三代走镖练出来的掌法，没有花巧：一掌拍出去，要让对手连人带兵器一起翻过去。
镖师在车辕上、在船板上、在人堆里出手，站不稳也要打得实，所以这路掌法讲究一个“沉”字——
脚下生根，腰里出力，掌到的时候整个人的分量都压在上面。
林震南说，这掌法本是七十二式，到他手里只剩下十几式还使得全。学得多少，看你以后的造化。

=== move: xiaoao.fantian.1
skill: xiaoao.fantian
name: 开山
level: 0
power: 22
mp: 8
omen: $N沉肩坐腰，右掌缓缓抬到耳边……|$N脚下踏实，掌心向外，像是要推一扇很重的门……
---
$N一掌推出，「$招」，掌风沉得像一堵墙，直撞$n$部位！

=== move: xiaoao.fantian.2
skill: xiaoao.fantian
name: 翻江
level: 20
power: 28
mp: 12
effects: 破绽
omen: $N双掌一上一下翻了个个儿，手腕转得极快……
---
$N双掌翻卷，「$招」，上掌虚按下掌实拍，$n$部位被这一翻之力带得身形一歪！

=== move: xiaoao.fantian.3
skill: xiaoao.fantian
name: 倒海
level: 45
power: 36
mp: 17
effects: 内伤
omen: $N退了半步，双掌贴在身前，掌心微微发颤……
---
$N一步踏前，「$招」，两掌叠在一处推出，力道层层叠叠涌进$n$部位，像是整条江水倒灌进来！

# ---------------- 辟邪剑法（NPC 专用：林平之）----------------
# 林家传下来的剑法只剩个架子，林平之使得尤其生嫩。真正的那一路，留给后面的章节。

=== skill: xiaoao.pixie
name: 辟邪剑法
kind: 外功
stance: 巧
weapon: 剑
cap: 20
---
福威镖局林家祖上传下来的剑法，招数短促，剑尖不离对手的手腕和咽喉。
传到林震南这一代，能使出来的不过七十二式中的二十几式，徒有其形。
玩家手上这几页是从林家祖宅的墙里拆出来的残札，只抄到前几式——
真正要命的那一部分不在纸上，而在那句被人传了六十年的话里（D-309：上限随剧情一层层放）。

=== move: xiaoao.pixie.1
skill: xiaoao.pixie
name: 拨云
level: 0
power: 23
mp: 9
omen: $N剑尖斜斜上挑，手腕抖了一抖……
---
$N手腕一翻，「$招」，剑尖自下而上拨开门户，直取$n$部位！

=== move: xiaoao.pixie.2
skill: xiaoao.pixie
name: 回风
level: 20
power: 29
mp: 12
effects: 破绽
omen: $N剑势忽然一收，人却往$n身侧滑了半步……
---
$N剑走偏锋，「$招」，一剑递出又倏地抽回，回手时剑尖已点到$n$部位！

# 后面这两式，残札上没有，是看着别人使出来才补上的（第十二章之后玩家才够得着）

=== move: xiaoao.pixie.3
skill: xiaoao.pixie
name: 截腕
level: 45
power: 36
mp: 15
effects: 缴械:30
omen: $N的剑尖一直对着你握兵器的那只手，始终没有移开……
---
$N手腕一翻，「$招」，剑走最短的一条线，直取$n握兵刃的手腕！

=== move: xiaoao.pixie.4
skill: xiaoao.pixie
name: 锁喉
level: 70
power: 44
mp: 20
effects: 内伤, 破绽
omen: $N整个人忽然静了下来，只有持剑的那只手还在极轻地抖……
---
$N身形不动，剑却到了，「$招」，剑尖贴着$n的下颌掠过——这一剑快得不像人使出来的。

# ---------------- 衡山剑法：第四章，刘正风临终以指画地所授（上限随剧情放开）----------------

=== skill: xiaoao.hengshan
name: 衡山剑法
kind: 外功
stance: 巧
weapon: 剑
cap: 40
---
衡山一派的剑法，取意于雁。雁阵南来北往，看着散，其实每一只都知道下一刻该落在哪里。
这路剑不与人硬碰：剑随步走，步随人转，对方的力道用老了，剑才从他想不到的那一侧回来。
刘正风临终时没有力气拿剑，只用一根手指在土上画了三趟——能看懂多少，全看你自己。

=== move: xiaoao.hengshan.1
skill: xiaoao.hengshan
name: 雁回
level: 0
power: 22
mp: 8
omen: $N的剑尖忽左忽右地晃，脚下跟着剑往旁边挪……|$N侧身而立，剑锋藏在身后，只露出半只手……
---
$N脚下一错，「$招」，长剑绕过$n的兵刃，自侧后回头点向$部位！

=== move: xiaoao.hengshan.2
skill: xiaoao.hengshan
name: 云雾十三
level: 20
power: 28
mp: 12
effects: 破绽
omen: $N手腕连抖，剑影散成一片，看不出哪一道是真的……
---
$N剑影连成一片，「$招」，十三道剑光先后罩下，$n分不清虚实，只觉$部位一凉！

=== move: xiaoao.hengshan.3
skill: xiaoao.hengshan
name: 衡阳一线
level: 45
power: 35
mp: 16
effects: 点穴
omen: $N的剑忽然停住了，所有的虚招一起收了回去，只剩一条直线……
---
$N收尽剑影，「$招」，一剑笔直送出，像雁阵最后收成的那一线，正点在$n$部位的穴道上！

# ---------------- 养心诀：第五章，华山弟子陆大有私下相授（不是门派武学）----------------

=== skill: xiaoao.yangxin
name: 养心诀
kind: 内功
cap: 60
hp: 7
mp: 11
affinity: 巧
---
华山弟子入门头一年练的呼吸法子，后来有了本门心法，这一套就没人提了。
它不讲多深的内息，只讲一个"匀"字：打得越急，呼吸越要慢；心越乱，数息越要数得清。
陆大有说，他师父从不教这个，因为这不算华山的武功——这是他们几个师兄弟自己留着用的。

# ---------------- 七弦指：第七章，梅庄黄钟公以琴理相赠 ----------------

=== skill: xiaoao.qixian
name: 七弦指
kind: 外功
stance: 巧
cap: 50
---
黄钟公弹了四十年琴，手指上的功夫比剑上的多。他把按弦、勾挑、揉吟的几种手法化进了指法里：
"弹琴讲的是时候。弦什么时候该按死，什么时候该放它自己响，错半分，一曲就毁了。打人也是一样。"
这路指法不伤人于远，只在近身时点你一下——偏偏点的那一下，总在你刚要换气的时候。

=== move: xiaoao.qixian.1
skill: xiaoao.qixian
name: 勾弦
level: 0
power: 22
mp: 9
omen: $N的手指在身前虚虚一勾，像是在摸一根看不见的弦……|$N五指微曲，指尖朝下，整个人松得像没在戒备……
---
$N食中二指一勾，「$招」，指尖贴着$n的腕脉一带，$部位一酸！

=== move: xiaoao.qixian.2
skill: xiaoao.qixian
name: 按徽
level: 20
power: 27
mp: 12
effects: 点穴
omen: $N的手指忽然停住不动了，停在半空，像是在等一个音落下来……
---
$N等$n旧力用尽的那一瞬出指，「$招」，一指按在$n$部位的穴上，像按死了一根正在响的弦！

=== move: xiaoao.qixian.3
skill: xiaoao.qixian
name: 散音
level: 45
power: 33
mp: 15
effects: 破绽, 内伤
omen: $N双手十指一齐抖了一下，分不清哪一根手指要动……
---
$N十指齐出，「$招」，指风一前一后错着落下，$n挡了前面的，后面的已经透进$部位！

# ---------------- 天山折梅手：第十八章，天山童姥所传（虚竹转教）----------------
# 逍遥派的看家功夫：不挑路数，顺着对手的来劲一折，招式断在半路。上限 100（第十九章提到 140）。

=== skill: tianlong.zhemei
name: 天山折梅手
kind: 外功
stance: 巧
cap: 100
---
逍遥一脉的擒拿手法，不挑兵器，也不挑路数：对手使刀就折他的刀，使指就折他的指。
诀窍只有一个字——折。不硬接，不躲开，顺着来劲的方向一拧，对方的招式就断在半路上。
童姥念一句，虚竹学一句；虚竹学一句，就结结巴巴地转教你一句。他教得越笨，你记得越牢。

=== move: tianlong.zhemei.1
skill: tianlong.zhemei
name: 攀枝
level: 0
power: 42
mp: 20
effects: 破绽
omen: $N两手虚虚地张在身前，手腕软得像没有骨头……
---
$N手腕一翻，「$招」，顺着来势一带，$n$部位的劲道全偏到了一边！

=== move: tianlong.zhemei.2
skill: tianlong.zhemei
name: 折梅
level: 40
power: 46
mp: 24
effects: 缴械:35
omen: $N的手指一根一根地舒开，像是要去接什么东西……
---
$N五指扣住来招，「$招」，向外一折——$n只听见自己手上"咔"的一声！

=== move: tianlong.zhemei.3
skill: tianlong.zhemei
name: 踏雪
level: 80
power: 52
mp: 28
effects: 点穴, 破绽
omen: $N脚下轻轻一错，人已经不在原处了，两只手却还停在原地……
---
$N身随步转，「$招」，手从$n意想不到的那一侧折进来，正按在$部位的穴道上！

# ---------------- 吸星大法：第八章，梅庄地牢里那个人所授（上限分章放开，D-309）----------------

=== skill: xiaoao.xixing
name: 吸星大法
kind: 内功
cap: 30
hp: 5
mp: 16
affinity: 巧
# 吸内：出手得手（没被克制）时，把对手 五成伤害值 的内力吸过来
absorb: 0.5
---
地牢里那个人隔着铁栏讲的道理，只有一句：内力是水，人是器皿。器皿有大小，水没有。
**吸内**：装备这门内功时，每一次没被克制的攻击，都会顺着交手处把对手的内力吸过来（五成伤害值）。
吸来的内力**可以暂时超过你的内力上限**——一战之内取之不尽，打完了却带不走。
他教你的时候反复说了三遍："你现在学的是怎么取。怎么化，我没有教你。取而不化，取得越多，死得越快。"
这门功夫要一层一层地放：取的法子你已经会了，化的法子要等你自己走到那一步。

# ---------------- 天长掌法（NPC 专用：仪琳）----------------
# 恒山派的护持功夫，招式软，专给同伴挡刀、疗伤。定义在这里是因为合击要认得它（D-083）。

=== skill: xiaoao.tianchang
name: 天长掌法
kind: 外功
stance: 守
---
恒山派的掌法，起手像合十，收手像还礼。招式软，力道也软——它本来就不是用来伤人的。
仪琳使这路掌法的时候嘴里一直在念经。她自己说：念着经，手就不会抖。

=== move: xiaoao.tianchang.1
skill: xiaoao.tianchang
name: 云遮
level: 0
power: 15
mp: 6
omen: $N合掌当胸，手腕朝外翻了翻……
---
$N双掌向外一推，「$招」，掌风不重，却把$n的来势推偏了半尺。

=== move: xiaoao.tianchang.2
skill: xiaoao.tianchang
name: 慈航
level: 10
power: 18
mp: 10
support: true
effects: 疗伤
omen: $N退开半步，两只手虚虚地托着，嘴里念念有词……
---
$N掌心贴上$n的背心，一股温吞吞的内息渡过去，$n身上的伤口不那么疼了。

=== move: xiaoao.tianchang.3
skill: xiaoao.tianchang
name: 不嗔
level: 30
power: 22
mp: 12
support: true
effects: 护体
omen: $N把身子挡在前头，双掌平举，像是在给人撑一把伞……
---
$N挡在$n身前，「$招」，一层软软的掌力罩下来——她自己不躲，只管替人挡。

# ---------------- 葵花宝典（残卷）：第十四章，黑木崖绣楼里搜出来的前半部（D-309）----------------

=== skill: xiaoao.kuihua
name: 葵花宝典
kind: 内功
cap: 50
hp: 6
mp: 20
affinity: 巧
---
一卷用极细的笔抄在绢上的东西，字小得要凑到灯底下看。
前半部讲的是呼吸：吸气要细、要长、要像一根线那样不断；行气不走大路，专走最细的那几条经脉。
照着练上一个月，你会发现自己的手比从前快——不是力气大了，是手上的那点迟疑没有了。
后半部从第一页起就缺了。缺的地方不是撕的，是抄的人根本没有往下抄；
卷末只有一行小字，和福州林家墙里拆出来的那半句，是同一个意思。

# ================= 射雕英雄传（第十一章起）=================
# 玩家可学：空明拳（周伯通，桃花岛）、九阴真经（内功，周伯通口授）、摧坚神爪（九阴真经下卷的正路爪功，一灯译出总纲之后才看得懂）。
# 上限随章节用 cap: 提高，第二十章华山论剑放到 100（POWER.md §6）。
# 蛤蟆功、灵蛇杖法、神驼雪山掌、铁掌、泥鳅功只给敌人用；伏魔杖法只给 NPC 队友柯镇恶用（定义在这里是因为合击要认得它，D-083）。

# ---------------- 空明拳：第十一章，桃花岛岩洞里周伯通所授 ----------------

=== skill: shediao.kongming
name: 空明拳
kind: 外功
stance: 守
cap: 25
---
周伯通在岩洞里关了十五年，没人陪他打架，就自己琢磨出来的一路拳。
拳理只有一个字：空。碗要空才盛得下饭，屋子要空才住得了人；拳头要空，才接得住别人的力气。
他教的时候一边教一边笑，说这路拳是专门用来气人的——打的人越使劲，越像打进了一缸水里。

=== move: shediao.kongming.1
skill: shediao.kongming
name: 空碗盛水
level: 0
power: 24
mp: 8
omen: $N双拳虚握，拳心朝上，像捧着一只空碗……|$N肩膀一松，整个人软得像没长骨头……
---
$N双拳虚虚一合，「$招」，把$n的来势兜进拳圈里，顺手一送，反打在$n$部位。

=== move: shediao.kongming.2
skill: shediao.kongming
name: 空屋待客
level: 25
power: 30
mp: 11
effects: 破绽
omen: $N往后一缩，胸前门户大开，好像故意请你进来……
---
$N胸腹一收，「$招」，$n一拳落空，身子前倾收不住，$N的拳头早已等在那里。

=== move: shediao.kongming.3
skill: shediao.kongming
name: 以虚御实
level: 50
power: 38
mp: 15
effects: 化内
omen: $N拳势忽然慢了下来，一拳一拳都像在棉花里打……
---
$N拳头软软地贴上$n的手臂，「$招」，$n的劲力像泥牛入海，一身内力被化去了一截。

=== move: shediao.kongming.4
skill: shediao.kongming
name: 空明若水
level: 80
power: 46
mp: 20
effects: 点穴
omen: $N眼神一空，拳路也跟着空了，看不出从哪里来……
---
$N拳意空明，「$招」，一拳像水一样漫过$n的守势，指节正落在$n$部位的穴道上。

# ---------------- 九阴真经（内功）：第十一章，周伯通把经文当作"他自己的功夫"口授 ----------------

=== skill: shediao.jiuyin
name: 九阴真经
kind: 内功
cap: 20
hp: 9
mp: 12
affinity: 巧
---
道家的一部奇书。写书的人把天下武学都看过一遍，从里面挑出最要紧的道理，写成上下两卷。
上卷讲内功根基，周伯通背得滚瓜烂熟，却守着师兄的遗命一招不练；他在岩洞里把经文一句一句念给你们听，只说是"老顽童自己的功夫"。
下卷的总纲是一大段古怪的音译，像咒语，谁也读不懂。读不懂的地方，这门内功就只能练到一半。

# ---------------- 摧坚神爪：第十六章，一灯大师译出总纲之后，九阴真经下卷才看得懂 ----------------

=== skill: shediao.cuijian
name: 摧坚神爪
kind: 外功
stance: 巧
cap: 30
---
九阴真经下卷里的爪功，正路的练法：五指运劲，攻敌要害，以力摧坚。
梅超风夫妇当年只偷到半部下卷，又读不懂总纲，把"摧敌首脑"当成了往人头顶上插手指，练成了九阴白骨爪。
同一段经文，读对了是摧坚神爪，读岔了是白骨爪。差的不是那几页纸，是读的人心里想的是什么。

=== move: shediao.cuijian.1
skill: shediao.cuijian
name: 摧坚
level: 0
power: 30
mp: 10
effects: 破绽
omen: $N五指微屈，指节一节一节绷紧……|$N手掌翻起，掌心朝下，像要扣住什么……
---
$N五指一扣，「$招」，指力透过$n的守势，结结实实抓在$n$部位上！

=== move: shediao.cuijian.2
skill: shediao.cuijian
name: 裂石
level: 30
power: 40
mp: 14
effects: 内伤
omen: $N沉肩坠肘，五指慢慢收拢成钩，指尖上隐隐泛着青气……
---
$N一爪抓落，「$招」，指劲像凿子一样钻进$n$部位，连骨头都震得发麻！

=== move: shediao.cuijian.3
skill: shediao.cuijian
name: 伏魔
level: 60
power: 52
mp: 19
effects: 点穴
omen: $N脚下一错，身子已欺到近前，五指却一点声息也没有……
---
$N贴身一爪，「$招」，五指分扣$n$部位的几处要穴，$n半边身子顿时酸麻！

=== move: shediao.cuijian.4
skill: shediao.cuijian
name: 九阴归元
level: 90
power: 62
mp: 26
effects: 内伤, 破绽
omen: $N双手一上一下，十指箕张，周身的劲力都往指尖上收……
---
$N十指齐发，「$招」，一爪接一爪，每一爪都落在$n劲力最弱的那一处，像要把$n整个人拆开！

# ---------------- 蛤蟆功（只给敌人用：欧阳锋）----------------

=== skill: shediao.hama
name: 蛤蟆功
kind: 外功
stance: 刚
---
白驼山的看家功夫。蹲在地上咕咕作声，像一只蛤蟆；全身的劲力蓄足了，一推之下，排山倒海。
越是被逼到绝处，蓄的劲越足。

=== move: shediao.hama.1
skill: shediao.hama
name: 蹲身蓄劲
stance: 守
level: 0
power: 28
mp: 8
omen: $N两腿一屈蹲了下去，喉咙里咕咕作响……
---
$N蹲在地上，「$招」，周身鼓胀如球，$n的劲力打上去像打在一面鼓上。

=== move: shediao.hama.2
skill: shediao.hama
name: 蛤蟆吐气
level: 0
power: 40
mp: 14
effects: 内伤
omen: $N腮帮子一鼓一鼓，蹲着的身子慢慢往后坐……|$N咕的一声长鸣，双掌贴着地面……
---
$N双掌齐推，「$招」，一股劲风贴着地面卷过来，撞在$n$部位，五脏六腑都跟着一震！

=== move: shediao.hama.3
skill: shediao.hama
name: 惊雷出蛰
level: 40
power: 52
mp: 20
effects: 内伤, 破绽
omen: $N蹲着一动不动，忽然没了声响，四下静得吓人……
---
$N猛地弹起，「$招」，蓄了半天的劲力一下子全放了出来，像一声闷雷砸在$n身上！

# ---------------- 灵蛇杖法（只给敌人用：欧阳锋）----------------

=== skill: shediao.lingshe
name: 灵蛇杖法
kind: 外功
stance: 巧
weapon: 棍
---
欧阳锋那根蛇杖的使法。杖头盘着两条活蛇，杖到了，蛇也到了，蛇牙上带着白驼山的毒。

=== move: shediao.lingshe.1
skill: shediao.lingshe
name: 灵蛇吐信
level: 0
power: 34
mp: 12
effects: 内伤
omen: $N的蛇杖一颤，杖头的两条蛇昂起头来，咝咝吐信……
---
$N蛇杖一点，「$招」，杖头的毒蛇猛地窜出，一口咬向$n$部位！

=== move: shediao.lingshe.2
skill: shediao.lingshe
name: 盘杖缠身
level: 30
power: 42
mp: 16
effects: 点穴
omen: $N蛇杖贴地一扫，杖身弯弯曲曲，像一条游过来的长蛇……
---
$N杖随身转，「$招」，蛇杖绕着$n转了半圈，杖头从意想不到的地方点中了$n$部位！

# ---------------- 神驼雪山掌（只给敌人用：欧阳克）----------------

=== skill: shediao.shentuo
name: 神驼雪山掌
kind: 外功
stance: 巧
---
白驼山的掌法，掌影飘忽，专拣人看不见的地方下手。欧阳克使这路掌法的时候，手里的折扇也不闲着。

=== move: shediao.shentuo.1
skill: shediao.shentuo
name: 驼铃摇月
level: 0
power: 30
mp: 10
omen: $N折扇轻摇，脚下却已转了半个圈……
---
$N身形一晃，「$招」，一掌从扇影后面拍出，正中$n$部位。

=== move: shediao.shentuo.2
skill: shediao.shentuo
name: 雪岭飞沙
level: 30
power: 38
mp: 14
effects: 破绽
omen: $N折扇一合，掌风忽然变得又冷又碎……
---
$N双掌连拍，「$招」，掌风像雪粒子一样扑在$n脸上，$n眼前一花，露出了空门。

# ---------------- 铁掌（只给敌人用：裘千仞）----------------

=== skill: shediao.tiezhang
name: 铁掌
kind: 外功
stance: 刚
---
湖南铁掌帮的掌法。练的人每天把双掌插进滚烫的铁砂里，一练几十年，一双手掌乌黑发亮，硬过铁板。

=== move: shediao.tiezhang.1
skill: shediao.tiezhang
name: 开碑
level: 0
power: 38
mp: 12
omen: $N双掌一搓，掌心乌沉沉的，像两块生铁……
---
$N一掌劈下，「$招」，掌风沉得像一块铁板压向$n$部位！

=== move: shediao.tiezhang.2
skill: shediao.tiezhang
name: 掌底翻云
level: 30
power: 46
mp: 16
effects: 内伤
omen: $N身子微侧，一只手掌藏在袖子底下……
---
$N袖底翻掌，「$招」，掌力贴着$n的手臂钻进来，正印在$n$部位！

=== move: shediao.tiezhang.3
skill: shediao.tiezhang
name: 铁掌横江
level: 60
power: 56
mp: 22
effects: 内伤, 破绽
omen: $N双掌缓缓推出，掌未到，风已到，吹得人睁不开眼……
---
$N双掌横推，「$招」，掌力像一道铁闸横过江面，把$n连人带招一齐压住！

=== move: shediao.tiezhang.4
skill: shediao.tiezhang
name: 铁掌护身
stance: 守
level: 0
power: 30
mp: 8
omen: $N双掌交叉护在胸前，掌背黑得发亮……
---
$N双掌一封，「$招」，把$n的来招硬生生磕了回去。

# ---------------- 泥鳅功（只给敌人用：瑛姑）----------------

=== skill: shediao.niqiu
name: 泥鳅功
kind: 外功
stance: 巧
---
瑛姑在黑沼里住了十几年，看泥鳅在烂泥里钻来钻去，自己琢磨出来的身法。滑不留手，抓不住，打不实。

=== move: shediao.niqiu.1
skill: shediao.niqiu
name: 钻泥
level: 0
power: 30
mp: 10
effects: 破绽
omen: $N身子一扭，滑得像抹了一层油……
---
$N身子一扭，「$招」，从$n的掌底下钻了过去，反手一掌拍在$n$部位。

=== move: shediao.niqiu.2
skill: shediao.niqiu
name: 摆尾
level: 30
power: 38
mp: 14
effects: 点穴
omen: $N腰身一摆，手指已经伸到了你看不见的地方……
---
$N腰身一摆，「$招」，指尖从$n的肋下滑过，点中了$n$部位的穴道。

=== move: shediao.niqiu.3
skill: shediao.niqiu
name: 滑脱
stance: 守
level: 0
power: 24
mp: 6
omen: $N缩成一团，周身滑溜溜的……
---
$N身子一缩，「$招」，$n的劲力一沾她的衣服就滑开了。

# ---------------- 伏魔杖法（NPC 专用：柯镇恶）----------------

=== skill: shediao.fumo
name: 伏魔杖法
kind: 外功
stance: 刚
weapon: 棍
---
柯镇恶那根铁杖的使法。他眼睛瞎了，全凭耳朵听风辨位；铁杖一顿，就是一记，招招砸向声音来的地方。

=== move: shediao.fumo.1
skill: shediao.fumo
name: 听风
level: 0
power: 32
mp: 10
omen: $N侧着头，铁杖在地上轻轻一点……
---
$N循声一杖，「$招」，铁杖带着风声砸向$n$部位！

=== move: shediao.fumo.2
skill: shediao.fumo
name: 降魔
level: 30
power: 40
mp: 14
effects: 破绽
omen: $N铁杖横在身前，两只白眼翻着，嘴唇抿得紧紧的……
---
$N铁杖一抡，「$招」，杖风把$n的守势砸开一个缺口！

# ================= 神雕侠侣 =================
# 玩家可学：天罗地网势（古墓，第四章）、弹指神通（黄药师，第七章）、玄铁剑法（剑冢，第十章）。上限随章节抬，第十八章通关 140（docs/SHENDIAO.md §2.6）。
# NPC 专用：玉女剑法（杨过、小龙女）、黯然销魂掌（杨过）；敌人专用：赤练神掌（李莫愁）、龙象般若功（金轮法王）、阴阳倒乱刃（公孙止）。
# 定义在这里是因为合击要认得它们（D-083）。

# ---------------- 天罗地网势：第四章，古墓里小龙女教杨过捉麻雀的手法，杨过转教你 ----------------

=== skill: shendiao.tianluo
name: 天罗地网势
kind: 外功
stance: 守
cap: 40
---
古墓派入门的掌法。小龙女把八十一只麻雀放在一间石室里，叫杨过只用一双手掌拦着，一只也不许飞出去。
麻雀往哪边飞，掌就先到哪边。练熟了，对手的拳脚在你眼里也就是一只只麻雀。
杨过学会之后得意得很，非要教你；他说这是他在古墓里头一回觉得自己学会了点什么。

=== move: shendiao.tianluo.1
skill: shendiao.tianluo
name: 拦雀
level: 0
power: 26
mp: 8
omen: $N双掌在身前虚虚一圈，掌缘轻轻颤着……|$N眼睛盯着你的手，脚下一动不动……
---
$N双掌一拦，「$招」，$n的来势像撞进一张网里，被兜着送了回去，正拍在$n$部位。

=== move: shendiao.tianluo.2
skill: shendiao.tianluo
name: 八方罗网
level: 30
power: 32
mp: 12
effects: 破绽
omen: $N双掌忽上忽下，掌影像织网的梭子……
---
$N掌影四面一合，「$招」，$n往哪边走，哪边就有一只手掌等着，脚下一乱，露出了空门。

=== move: shendiao.tianluo.3
skill: shendiao.tianluo
name: 收网
level: 60
power: 38
mp: 15
effects: 点穴
omen: $N掌势一收，像是把网口慢慢扎紧……
---
$N双掌一收，「$招」，掌缘贴着$n的手臂一路滑上去，指尖点中了$n$部位的穴道。

=== move: shendiao.tianluo.4
skill: shendiao.tianluo
name: 天罗地网
level: 100
power: 46
mp: 20
effects: 点穴, 破绽
omen: $N身形绕着你转起来，转得你眼前全是手掌……
---
$N绕身疾走，「$招」，一双手掌化作千百只，上下左右全是掌影，$n像一只撞进网里的雀儿，再也挣不出去！

# ---------------- 弹指神通：第七章，黄药师所授 ----------------

=== skill: shendiao.tanzhi
name: 弹指神通
kind: 外功
stance: 巧
cap: 40
---
桃花岛的指上功夫。中指扣在拇指下，一弹出去，或是一缕指风，或是一枚石子，远远地打人穴道。
黄药师教你的时候没说几句话，只在桌上弹落了一排茶杯盖，一个一个，听着像在敲琴。
他说："当年在牛家村那间酒馆，你守了七天门。这一手，算我谢你的。"

=== move: shendiao.tanzhi.1
skill: shendiao.tanzhi
name: 弹石
level: 0
power: 30
mp: 10
effects: 破绽
omen: $N中指扣在拇指下，指甲盖上隐隐发亮……|$N袖子一抖，指间夹着一枚小石子……
---
$N中指一弹，「$招」，一缕指风嗤的一声破空而至，打在$n$部位！

=== move: shendiao.tanzhi.2
skill: shendiao.tanzhi
name: 碧海潮生
level: 30
power: 38
mp: 14
effects: 点穴
omen: $N手指在身侧轻轻敲着拍子，一下快一下慢……
---
$N屈指连弹，「$招」，指风一阵紧一阵松，像潮水一样涌过来，有一缕正点中$n$部位的穴道。

=== move: shendiao.tanzhi.3
skill: shendiao.tanzhi
name: 落英弹指
level: 60
power: 48
mp: 18
effects: 点穴, 破绽
omen: $N身形一转，掌影里夹着指风，分不清哪是掌哪是指……
---
$N掌中藏指，「$招」，掌影一落，真正的那一指早从花影里弹出，透过$n的守势直取$部位！

=== move: shendiao.tanzhi.4
skill: shendiao.tanzhi
name: 一弹惊雷
level: 90
power: 58
mp: 24
effects: 点穴, 内伤
omen: $N指尖慢慢扣紧，满身的劲力都往一根手指上收……
---
$N一指弹出，「$招」，指风炸开，像一声闷雷打在$n$部位，穴道连着经脉一齐震伤！

# ---------------- 玄铁剑法：第十章，剑冢石壁上独孤求败的字 ----------------

=== skill: shendiao.xuantie
name: 玄铁剑法
kind: 外功
stance: 刚
weapon: 剑
cap: 40
---
独孤求败晚年的剑意。剑冢石壁上只留了几行字，说的是他这一生用过的几把剑：少年时锋利，中年时柔韧，后来剑越来越重，锋口越来越钝，到最后连剑也不用了。
这门剑法没有花巧，只有一个"重"字：出手越慢，对手看得越清楚，却越躲不开、挡不住。
拿什么剑都能使，拿的剑越沉越像样。

=== move: shendiao.xuantie.1
skill: shendiao.xuantie
name: 沉剑
level: 0
power: 36
mp: 12
omen: $N剑尖垂地，慢慢地把剑举了起来，像举着一座山……|$N双手握剑，脚下踩进土里半寸……
---
$N一剑平平推出，「$招」，没有半点花样，$n明明看得清清楚楚，却怎么也让不开，被剑身结结实实撞在$部位！

=== move: shendiao.xuantie.2
skill: shendiao.xuantie
name: 钝锋
level: 30
power: 46
mp: 16
effects: 破绽
omen: $N剑势一沉，剑身带起的风压得人喘不过气……
---
$N剑走中宫，「$招」，剑未到，风先到，$n的兵器被剑风压得往下一沉，门户大开！

=== move: shendiao.xuantie.3
skill: shendiao.xuantie
name: 拙剑
level: 60
power: 58
mp: 21
effects: 内伤
omen: $N剑尖微微抬起，整个人却像钉在了地上……
---
$N一剑劈落，「$招」，那一剑笨得出奇，也重得出奇，劲力透过$n的守势直撞进五脏六腑！

=== move: shendiao.xuantie.4
skill: shendiao.xuantie
name: 万物皆剑
level: 100
power: 70
mp: 28
effects: 内伤, 破绽
omen: $N把剑收在身后，像是忘了手里还有一把剑……
---
$N剑意一发，「$招」，手里的是剑，是枝，是什么都一样，剑气排山倒海地压向$n，像一整座山塌了下来！

# ---------------- 玉女剑法（NPC 专用：杨过、小龙女）----------------

=== skill: shendiao.yunv
name: 玉女剑法
kind: 外功
stance: 巧
weapon: 剑
---
古墓派的剑法，当年林朝英专为克制全真剑法而创，招招都是全真剑法的对头。
可是一个人使玉女剑法、一个人使全真剑法，两套剑一攻一守，破绽互相补上，反倒成了最难破的剑阵。

=== move: shendiao.yunv.1
skill: shendiao.yunv
name: 远行
level: 0
power: 34
mp: 12
omen: $N长剑斜指，衣袂飘飘，像是要出门远行……
---
$N身随剑走，「$招」，剑光轻轻一挥，削向$n$部位。

=== move: shendiao.yunv.2
skill: shendiao.yunv
name: 月下拈花
level: 30
power: 42
mp: 15
effects: 点穴
omen: $N剑尖低垂，一副漫不经心的样子……
---
$N剑尖忽然一挑，「$招」，从意想不到的地方点中$n$部位的穴道。

=== move: shendiao.yunv.3
skill: shendiao.yunv
name: 冷月护身
stance: 守
level: 0
power: 30
mp: 10
omen: $N收剑当胸，剑身映着一片冷光……
---
$N剑身一横，「$招」，剑光绕身一圈，把$n的来招都隔在外面。

# ---------------- 黯然销魂掌（NPC 专用：杨过）----------------

=== skill: shendiao.anran
name: 黯然销魂掌
kind: 外功
stance: 刚
---
杨过断臂之后，等一个人等了十六年，自己琢磨出来的一路掌法。
出手全凭心境：心里越是难过，掌力越是沉。他自己说，这掌法别人学不去——学的人得先把心伤透。

=== move: shendiao.anran.1
skill: shendiao.anran
name: 空袖
level: 0
power: 44
mp: 16
effects: 内伤
omen: $N的独臂垂在身侧，空着的那只袖子被风吹得乱飘……
---
$N一掌拍出，「$招」，掌力里有说不出的凄凉，$n的心口一沉，像被什么重重撞了一下。

=== move: shendiao.anran.2
skill: shendiao.anran
name: 失神
level: 30
power: 54
mp: 20
effects: 内伤, 破绽
omen: $N站在那里发怔，好像压根没看见你……
---
$N似乎在出神，「$招」，那一掌却已经到了，$n根本没看清是怎么来的，$部位已经结结实实挨了一记！

# ---------------- 赤练神掌（只给敌人用：李莫愁）----------------

=== skill: shendiao.chilian
name: 赤练神掌
kind: 外功
stance: 巧
---
李莫愁的掌法。掌心带毒，打中的地方先是一片殷红，过一会儿就发黑。她另一只手里的拂尘也不闲着，冰魄银针藏在拂尘丝里。

=== move: shendiao.chilian.1
skill: shendiao.chilian
name: 赤练掌
level: 0
power: 36
mp: 12
effects: 内伤
omen: $N掌心翻起，红得像抹了一层胭脂……|$N拂尘一甩，嘴角带着笑……
---
$N一掌拍来，「$招」，掌心那一片殷红印在$n$部位，毒气顺着皮肉往里钻！

=== move: shendiao.chilian.2
skill: shendiao.chilian
name: 冰魄银针
level: 30
power: 44
mp: 16
effects: 点穴, 内伤
omen: $N拂尘丝一抖，里面闪过几点寒光……
---
$N拂尘一扬，「$招」，几枚银针无声无息地钉向$n$部位，针上的寒毒直透经脉！

=== move: shendiao.chilian.3
skill: shendiao.chilian
name: 拂尘卷
stance: 守
level: 0
power: 30
mp: 8
omen: $N拂尘在身前一绕，丝丝缕缕散成一片……
---
$N拂尘一卷，「$招」，把$n的来招缠得拖泥带水。

# ---------------- 龙象般若功（只给敌人用：金轮法王）----------------

=== skill: shendiao.longxiang
name: 龙象般若功
kind: 外功
stance: 刚
---
密宗的护法神功，分十三层，练到一层就多一龙一象之力。金轮法王练到了第十层，几百年里少有人练到这一层。
他出手时身边五只轮子轮流飞旋，金、银、铜、铁、铅，一轮比一轮重。

=== move: shendiao.longxiang.1
skill: shendiao.longxiang
name: 金轮飞旋
level: 0
power: 40
mp: 14
effects: 破绽
omen: $N袖中一只金轮呜呜作响，绕着他飞了一圈……
---
$N手一扬，「$招」，金轮呼啸着旋了过来，砸向$n$部位！

=== move: shendiao.longxiang.2
skill: shendiao.longxiang
name: 龙象之力
level: 40
power: 52
mp: 20
effects: 内伤
omen: $N双掌缓缓合拢，周身的僧袍鼓了起来，像有一头大象要从里面冲出来……
---
$N双掌一推，「$招」，十龙十象的力道排山倒海地撞向$n，$n像被一堵墙迎面拍中！

=== move: shendiao.longxiang.3
skill: shendiao.longxiang
name: 五轮齐转
level: 80
power: 62
mp: 26
effects: 内伤, 破绽
omen: $N五只轮子同时出手，在半空里转成一片金光……
---
$N五轮齐发，「$招」，金银铜铁铅五只轮子从五个方向一齐砸到，$n挡得住一只，挡不住五只！

=== move: shendiao.longxiang.4
skill: shendiao.longxiang
name: 金刚坐
stance: 守
level: 0
power: 34
mp: 10
omen: $N盘膝一坐，宝相庄严……
---
$N双掌合十，「$招」，周身如罩金刚，$n的劲力打上去像打在一口铜钟上。

# ---------------- 阴阳倒乱刃（只给敌人用：公孙止）----------------

=== skill: shendiao.yinyang
name: 阴阳倒乱刃
kind: 外功
stance: 巧
weapon: 刀
---
公孙止的家传刀剑功夫：左手黑剑，右手金刀，刀走剑路，剑走刀路，倒过来使，看得人眼花缭乱。

=== move: shendiao.yinyang.1
skill: shendiao.yinyang
name: 刀剑互易
level: 0
power: 36
mp: 12
effects: 破绽
omen: $N左手剑、右手刀，忽然两手一交换……
---
$N刀剑一换，「$招」，本该是刀砍的地方来了一剑，本该是剑刺的地方来了一刀，$n顿时手忙脚乱！

=== move: shendiao.yinyang.2
skill: shendiao.yinyang
name: 阴阳倒乱
level: 40
power: 48
mp: 18
effects: 点穴
omen: $N刀剑一黑一金，在身前绞成一团……
---
$N刀剑齐出，「$招」，黑剑引开$n的兵器，金刀已经贴着刀背削到$n$部位！
