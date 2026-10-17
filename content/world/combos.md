# 双人合击（D-065）。组队时两位玩家同一回合触发。
# a、b 是两方的武功（@ 后面是最低等级）。
#   - a 是守类武功：a 方用守招护住 b 方（守招目标选 b），b 方的攻击没被克制，就触发“护攻”合击；
#   - 否则：两人用 a、b 两门武功打同一个对手，都没被克制，就触发“合击”。
# bonus：额外伤害 = 两人这一回合造成的伤害 ×（bonus - 1）。effects 作用在对手身上。
# 正文是合击描述：$A 是 a 方，$B 是 b 方，$n 是对手。
# 覆盖：五派两两之间各一个、本门各一个，再加武馆基础武功的几个。低级（10~15 级）、高级（20~30 级，用镇派绝学）都有。

# ---------------- 武馆基础武功（不拜师也能合击）----------------

=== combo: combo.base_fist
name: 二龙戏珠
a: base.quan@10
b: base.zhang@10
bonus: 1.4
---
$A一拳当胸直捣，$B一掌斜拍侧肋，$n顾得了前顾不了后。

=== combo: combo.base_guard
name: 一夫当关
a: base.zhaojia@10
b: base.quan@10
bonus: 1.5
effects: 破绽
---
$A挡在前面硬接来招，$B从$A身后闪出，一拳正中$n空门。

=== combo: combo.base_blades
name: 刀剑合璧
a: base.dao@10
b: base.jian@10
bonus: 1.6
effects: 破绽
---
$A一刀劈开$n的守势，$B的剑尖已经从刀光的缝隙里递了进去。

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

=== combo: combo.base_twin
name: 同仇敌忾
a: base.quan@10
b: base.quan@10
bonus: 1.3
---
$A和$B一左一右，两记庄稼把式同时砸在$n身上，打的就是一股不要命的狠劲。

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

=== combo: combo.tl_mu_jian
name: 刀剑双绝
a: tianlong.xiuluo@10
b: base.jian@10
bonus: 1.6
effects: 破绽
---
$A一刀斩开$n的门户，刀风未歇，$B的剑尖已经贴着刀背递了进去。

=== combo: combo.tl_mu_zhang
name: 错影分光
a: tianlong.xiuluo@10
b: base.zhang@10
bonus: 1.5
---
$A的刀光从正面压下，$B的手掌却从刀影底下翻出，$n的眼睛被刀光晃着，看不见那只手。

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

=== combo: combo.tl_duan_quan
name: 指东打西
a: tianlong.liumai@15
b: base.quan@10
bonus: 1.5
---
$A胡乱指了几指，剑气东一道西一道，$n忙着躲闪，被$B一拳结结实实打中。

=== combo: combo.tl_zhi_yuenv
name: 指影剑光
a: tianlong.yiyangzhi@10
b: shediao.yuenv@20
bonus: 1.8
effects: 点穴
---
$A的指力封住$n周身大穴，$B的剑光在指影里穿来穿去，一剑快过一剑。

=== combo: combo.tl_zhi_quan
name: 点穴借力
a: tianlong.yiyangzhi@20
b: base.quan@10
bonus: 1.5
effects: 破绽
---
$A一指点在$n肩头，$n半边身子一麻，$B的拳头正好砸在他僵住的那一侧。

# ================= 笑傲江湖 =================
# NPC 队友林平之（第一章起）用辟邪剑法，配玩家这时很可能会的武功（D-072）。

=== combo: combo.xa_lin_jian
name: 双剑分花
a: xiaoao.pixie@5
b: base.jian@10
bonus: 1.5
effects: 破绽
---
$A的剑尖挑开$n的门户，$B的剑跟着从那道缝里送进去，两剑一前一后，像一朵花被从中剖开。

=== combo: combo.xa_lin_quan
name: 剑引拳随
a: xiaoao.pixie@5
b: base.quan@10
bonus: 1.4
---
$A一剑逼得$n仰身躲闪，$B的拳头早就候在他仰身的那个地方。

=== combo: combo.xa_lin_fantian
name: 翻天剑雨
a: xiaoao.pixie@10
b: xiaoao.fantian@5
bonus: 1.6
effects: 内伤
---
$B一掌把$n的身子拍得一歪，$A的剑雨劈头盖脸地落下来——这是福威镖局走镖时一掌一剑的老路数。

=== combo: combo.xa_fantian_zhang
name: 双掌压梁
a: xiaoao.fantian@5
b: base.zhang@10
bonus: 1.4
effects: 破绽
---
$A一掌沉沉压住$n的上盘，$B的掌影从底下翻上来，像两根梁木把人夹在当中。

# ---------------- 天龙八部：乔峰（第七章起的 NPC 队友）----------------

=== combo: combo.tl_qiao_zhi
name: 龙吟指影
a: gaibang.xianglong@20
b: tianlong.yiyangzhi@20
bonus: 2.2
effects: 内伤
---
$A一掌拍出，掌风把$n逼得横移半步；$B的指力早等在他落脚的那一点上。

=== combo: combo.tl_qiao_quan
name: 掌风借力
a: gaibang.xianglong@20
b: base.quan@10
bonus: 1.6
---
$A的掌风把$n推得仰了仰身，$B顺着这股风抢进去，一拳打在他空出来的胸口。
