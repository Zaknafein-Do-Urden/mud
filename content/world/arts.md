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
---
福威镖局林家祖上传下来的剑法，招数短促，剑尖不离对手的手腕和咽喉。
传到林震南这一代，能使出来的不过七十二式中的二十几式，徒有其形。

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
