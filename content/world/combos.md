# 双人合击（D-065）。组队时两位玩家同一回合触发。
# a、b 是两方的武功（@ 后面是最低等级）。
#   - a 是守类武功：a 方用守招护住 b 方（守招目标选 b），b 方的攻击没被克制，就触发“护攻”合击；
#   - 否则：两人用 a、b 两门武功打同一个对手，都没被克制，就触发“合击”。
# bonus：额外伤害 = 两人这一回合造成的伤害 ×（bonus - 1）。effects 作用在对手身上。
# 正文是合击描述：$A 是 a 方，$B 是 b 方，$n 是对手。
# 覆盖：五派两两之间各一个、本门各一个。低级（10~15 级）、高级（20~30 级，用镇派绝学）都有。
# 武馆的基础武功不参与合击（D-098）：合击要么是两个门派的武功配合，要么是同一门派内部的；剧情 NPC 的合击配剧情武学或门派武学。

# ---------------- 本门合击 ----------------

=== combo: combo.gaibang_self
name: 双龙出海
a: gaibang.xianglong@20
b: gaibang.xianglong@20
bonus: 2.2
effects: 内伤
---
$A与$B同时出掌，两股降龙掌力在半空合为一股，如两条怒龙破浪而出，直撞$n！

=== combo: combo.shaolin_self
name: 罗汉合击
a: shaolin.luohan@10
b: shaolin.luohan@10
bonus: 1.5
---
$A与$B一前一后，罗汉拳一拳接一拳，像两尊铜罗汉轮番撞钟，震得$n气血翻腾。

=== combo: combo.wudang_self
name: 真武护法
a: wudang.taiji@10
b: wudang.mianzhang@10
bonus: 1.6
effects: 破绽
---
$A以太极圆劲卸开$n的来招，$B顺势一掌，绵劲透体而入。

=== combo: combo.huashan_self
name: 双剑合璧
a: huashan.jianfa@10
b: huashan.jianfa@10
bonus: 1.6
---
$A与$B两柄剑一左一右，剑光交织成网，把$n罩在当中。

=== combo: combo.tangmen_self
name: 千机万象
a: tangmen.qianji@20
b: tangmen.baoyu@20
bonus: 2.2
effects: 点穴
---
$A十指翻飞，把$n的暗器尽数接下；$B趁机按动机括，漫天银针罩住了$n周身大穴。

# ---------------- 跨门派合击（五派两两之间）----------------

=== combo: combo.gaibang_shaolin
name: 降魔双拳
a: gaibang.lianhua@10
b: shaolin.luohan@10
bonus: 1.6
effects: 内伤
---
$A的莲花掌、$B的罗汉拳一柔一刚，同时印在$n胸口。

=== combo: combo.gaibang_wudang
name: 亢龙太极
a: wudang.taiji@20
b: gaibang.xianglong@20
bonus: 2.0
effects: 破绽
---
$A以太极之劲为$B引开所有来招，$B毫无顾忌地推出一掌亢龙，掌力排山倒海！

=== combo: combo.gaibang_huashan
name: 莲花剑影
a: gaibang.lianhua@10
b: huashan.jianfa@10
bonus: 1.5
effects: 破绽
---
$A的掌影如莲花层层绽开，$B的剑光就藏在花瓣之间，$n看得眼花缭乱。

=== combo: combo.gaibang_tangmen
name: 逍遥飞蝗
a: gaibang.xiaoyao@15
b: tangmen.feihuang@15
bonus: 1.5
effects: 点穴
---
$A飘忽的掌影引开$n的视线，$B的飞蝗石趁隙打中了穴道。

=== combo: combo.shaolin_wudang
name: 刚柔并济
a: shaolin.jingang@20
b: wudang.taijijian@20
bonus: 2.2
effects: 内伤, 破绽
---
$A的大力金刚掌至刚至猛，$B的太极剑至柔至圆，一刚一柔同时到了$n身前，叫人避无可避。

=== combo: combo.shaolin_huashan
name: 罗汉剑阵
a: shaolin.luohan@10
b: huashan.jianfa@10
bonus: 1.5
---
$A的拳风封住$n的退路，$B的剑尖已经刺到了面前。

=== combo: combo.shaolin_tangmen
name: 金钟暗雨
a: shaolin.jinzhong@10
b: tangmen.feihuang@10
bonus: 1.6
effects: 点穴
---
$A运起金钟罩挡在$B身前，任凭$n如何攻打也纹丝不动；$B躲在金钟之后，飞蝗石一颗颗打了出去。

=== combo: combo.wudang_huashan
name: 两仪剑法
a: wudang.taijijian@20
b: huashan.dugu@20
bonus: 2.2
effects: 化内:1.0
---
$A的太极剑画圆，$B的独孤剑走直，一圆一直，正反两仪，$n的内力被搅得七零八落。

=== combo: combo.wudang_tangmen
name: 柔云暗雨
a: wudang.rouyun@15
b: tangmen.feihuang@15
bonus: 1.5
effects: 点穴
---
$A的剑光如云卷云舒遮住了$n的眼，云里却藏着$B打出的飞蝗石。

=== combo: combo.huashan_tangmen
name: 九剑梨花
a: huashan.dugu@20
b: tangmen.baoyu@20
bonus: 2.5
effects: 点穴, 破绽
---
$A一剑破尽$n的招式，就在$n门户大开的一瞬，$B的暴雨梨花针已经到了。

# ---------------- 辅助武功参与的合击（护攻）----------------

=== combo: combo.shaolin_hufa
name: 金刚护法
a: shaolin.hufa@10
b: gaibang.lianhua@10
bonus: 1.6
---
$A以护法金刚罩住$B，$B放开手脚，莲花掌一掌重过一掌。

=== combo: combo.huashan_jianzhen
name: 剑阵突击
a: huashan.jianzhen@10
b: wudang.mianzhang@10
bonus: 1.6
effects: 破绽
---
$A的剑阵护住$B的空门，$B的绵掌趁势而入，后劲绵绵不绝。

# ---------------- 剧情 NPC 队友参与的合击（D-072）----------------
# 玩家之间满足条件也能触发。

=== combo: combo.yuenv_quanzhen
name: 剑影双飞
a: shediao.yuenv@10
b: quanzhen.jianfa@10
bonus: 1.5
effects: 破绽
---
$A的越女剑轻灵如燕，$B的全真剑端凝如山，一快一稳，两道剑光交错着罩住了$n。

=== combo: combo.yuenv_yang
name: 枪挑剑引
a: shediao.yuenv@10
b: shediao.yangqiang@5
bonus: 1.5
---
$A剑尖一引，把$n的兵器带偏了半尺；就这半尺的空当，$B的枪已经扎了进去。

# ---------------- 天龙八部（剧情 NPC 队友与剧情武学）----------------
# 木婉清、朱丹臣、段誉做 NPC 队友时（D-072），和玩家这时多半会的武功配出来的合击。

=== combo: combo.tl_zhi_shuang
name: 双指连心
a: tianlong.yiyangzhi@10
b: tianlong.yiyangzhi@10
bonus: 1.8
effects: 点穴
---
$A一指封住$n的上路，$B一指点向下路，两道指力一前一后落在同一条经脉上。

=== combo: combo.tl_duan_zhi
name: 剑气引指
a: tianlong.liumai@15
b: tianlong.yiyangzhi@10
bonus: 2.0
effects: 内伤
---
$A的剑气破空而至，逼得$n侧身让开；$B的指力早已等在他让开的那一边。

=== combo: combo.tl_zhi_yuenv
name: 指影剑光
a: tianlong.yiyangzhi@10
b: shediao.yuenv@20
bonus: 1.8
effects: 点穴
---
$A的指力封住$n周身大穴，$B的剑光在指影里穿来穿去，一剑快过一剑。

# ================= 笑傲江湖 =================
# NPC 队友林平之（第一章起）用辟邪剑法，配玩家这时很可能会的武功（D-072）。

=== combo: combo.xa_lin_fantian
name: 翻天剑雨
a: xiaoao.pixie@10
b: xiaoao.fantian@5
bonus: 1.6
effects: 内伤
---
$B一掌把$n的身子拍得一歪，$A的剑雨劈头盖脸地落下来——这是福威镖局走镖时一掌一剑的老路数。

# ---------------- 天龙八部：乔峰（第七章起的 NPC 队友）----------------

=== combo: combo.tl_qiao_zhi
name: 龙吟指影
a: gaibang.xianglong@20
b: tianlong.yiyangzhi@20
bonus: 2.2
effects: 内伤
---
$A一掌拍出，掌风把$n逼得横移半步；$B的指力早等在他落脚的那一点上。

# ---------------- 笑傲江湖（第三章：令狐冲）----------------

=== combo: combo.xa_lhc_fantian
name: 剑风掌影
a: huashan.jianfa@20
b: xiaoao.fantian@10
bonus: 1.7
effects: 破绽
---
$A的剑尖在$n眼前画了一个圈，$n的眼睛跟着剑走——$B的掌已经从圈底下穿过去，结结实实压在他胸口。

# ---------------- 笑傲江湖（第四章：衡山剑法）----------------

=== combo: combo.xa_hengshan_huashan
name: 雁阵分飞
a: xiaoao.hengshan@10
b: huashan.jianfa@20
bonus: 1.7
effects: 破绽
---
$A的剑像雁阵一样散开，把$n的注意力扯向两边；$B的剑从雁阵当中的那道空处直插进去。

=== combo: combo.xa_hengshan_fantian
name: 剑引掌到
a: xiaoao.hengshan@10
b: xiaoao.fantian@20
bonus: 1.6
effects: 内伤
---
$A的剑绕到$n侧后，逼得他转身来挡；$B的掌已经等在他转过来的那一面，一掌按实。

# ---------------- 射雕英雄传（第六章起：郭靖）----------------

=== combo: combo.nanshan_pair
name: 樵歌互答
a: shediao.nanshan@10
b: shediao.nanshan@10
bonus: 1.5
effects: 内伤
---
$A一掌劈下，$B一掌跟上，两路南山掌法一前一后，像两个樵夫轮流抡斧，一下一下全砍在$n身上。

=== combo: combo.nanshan_yang
name: 开山断岳
a: shediao.nanshan@10
b: shediao.yangqiang@20
bonus: 1.6
effects: 破绽
---
$A的掌力把$n的门户砸开一道缝，$B的枪尖就从那道缝里扎了进去。

=== combo: combo.yang_pair
name: 双枪会
a: shediao.yangqiang@20
b: shediao.yangqiang@20
bonus: 1.6
effects: 破绽
---
$A和$B两杆枪一上一下，枪花交错，杨家枪的拦、拿、扎同时到了，$n顾得了上顾不了下。

=== combo: combo.luoying_nanshan
name: 桃林樵歌
a: shediao.luoying@10
b: shediao.nanshan@10
bonus: 1.6
effects: 破绽
---
$A的掌影像满树桃花飘落，晃得$n眼花缭乱；$B就在花影里结结实实地劈下一掌。一虚一实，一巧一拙。

=== combo: combo.luoying_yuenv
name: 花影剑声
a: shediao.luoying@10
b: shediao.yuenv@10
bonus: 1.5
effects: 点穴
---
$A的落英掌和$B的越女剑都是一个"巧"字，一个如花落，一个如燕回，$n左支右绌，被点中了穴道。


# ---------------- 笑傲江湖（第十章：仪琳）----------------

=== combo: combo.xa_yilin_hengshan
name: 慈航剑影
a: xiaoao.tianchang@10
b: xiaoao.hengshan@20
bonus: 1.6
effects: 破绽
---
$A的掌把$n的来势推偏半尺，$B的剑从那半尺的空里穿进去——一个不伤人，一个替她伤。

=== combo: combo.xa_yilin_fantian
name: 掌后有掌
a: xiaoao.tianchang@10
b: xiaoao.fantian@20
bonus: 1.5
---
$A软软地挡了一掌，$n的力道刚被卸开，$B沉沉的一掌已经压在他收力的那一瞬上。

# ---------------- 射雕英雄传（第十一章起：周伯通、洪七公、黄蓉、柯镇恶、郭靖）----------------

=== combo: combo.sd_kongming_luoying
name: 空花落影
a: shediao.kongming@10
b: shediao.luoying@20
bonus: 1.6
effects: 破绽
---
$A软软地接住$n的来招，把那股劲力兜在拳圈里；$B的掌影就从$A让出来的空当里飘进去，一掌落实。

=== combo: combo.sd_kongming_xianglong
name: 刚柔相济
a: shediao.kongming@20
b: gaibang.xianglong@20
bonus: 1.9
effects: 内伤
---
$A的空明拳把$n的劲力化得干干净净，$n一口气还没换过来，$B一掌降龙已经推到，刚柔一转，正撞在他最空的时候。

=== combo: combo.sd_kongming_pair
name: 左右互搏
a: shediao.kongming@20
b: shediao.kongming@20
bonus: 1.7
effects: 化内
---
$A和$B一左一右，两路空明拳像一个人的两只手，一只手接，一只手送，$n的劲力进去了就出不来。

=== combo: combo.sd_dagou_luoying
name: 棒挑落英
a: gaibang.dagou@20
b: shediao.luoying@20
bonus: 1.8
effects: 点穴
---
$A竹棒一绊一挑，把$n的下盘引得一晃；$B的落英掌早已罩住他的上身，掌影一落，正点中穴道。

=== combo: combo.sd_fumo_nanshan
name: 七怪遗风
a: shediao.fumo@30
b: shediao.nanshan@40
bonus: 1.8
effects: 破绽
---
$A铁杖循声砸落，$B一掌南山掌法跟着劈下——一个是大师父，一个是四师父的掌法，十几年前在大漠里，他们也是这样一前一后。

=== combo: combo.sd_cuijian_xianglong
name: 摧坚降龙
a: shediao.cuijian@30
b: gaibang.xianglong@30
bonus: 2.0
effects: 内伤
---
$A五指扣住$n的手腕，$n一挣没挣开，$B的降龙掌已经到了胸前——一个锁住，一个推倒。

# ---------------- 神雕侠侣（杨过、小龙女、郭靖、黄蓉、程英）----------------

=== combo: combo.sd2_yunv_quanzhen
name: 玉女素心
a: shendiao.yunv@20
b: quanzhen.jianfa@60
bonus: 2.0
effects: 点穴
---
$A的玉女剑和$B的全真剑本是对头，此刻一攻一守，一个的破绽正被另一个补上，两道剑光交织成一张网，$n竟找不到一处空当。

=== combo: combo.sd2_kongming_anran
name: 空心护魂
a: shediao.kongming@60
b: shendiao.anran@20
bonus: 2.0
effects: 内伤
---
$A的空明拳把$n的劲力化得干干净净，$B的独臂就从那片空里一掌按落，掌力沉得像十六年的等待。

=== combo: combo.sd2_tianluo_yunv
name: 罗网护剑
a: shendiao.tianluo@20
b: shendiao.yunv@20
bonus: 1.8
effects: 破绽
---
$A的掌影罗网似的护住$B的周身，$B的玉女剑只管往前递——古墓里学的两样功夫，一守一攻，本来就是一家。

=== combo: combo.sd2_xuantie_xianglong
name: 重剑降龙
a: shendiao.xuantie@20
b: gaibang.xianglong@40
bonus: 2.0
effects: 内伤
---
$A一剑沉沉压下，$n举兵器硬接，整个人被压得一矮；$B的降龙掌就在这一矮的工夫推到了胸前。

=== combo: combo.sd2_dagou_tanzhi
name: 棒影弹指
a: gaibang.dagou@40
b: shendiao.tanzhi@20
bonus: 1.9
effects: 点穴
---
$A竹棒一绊，$n脚下一个踉跄；$B屈指一弹，指风正打在他踉跄时露出来的那处穴道上。

=== combo: combo.sd2_tanzhi_luoying
name: 桃花指雨
a: shendiao.tanzhi@20
b: shediao.luoying@60
bonus: 1.8
effects: 点穴
---
$A的指风和$B的落英掌都出自桃花岛，掌影像花瓣，指风像花雨，$n眼前一片粉红，等看清楚时穴道已经被点中了。
