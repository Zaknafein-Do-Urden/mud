# 兵器与铁匠铺（D-057）。兵器是物品：slot: weapon，weapon 是类型，bonus 是该类招式的伤害加成（%）。
# 剑法要拿剑、刀法要拿刀才能施展；没有兵器或被缴械时只能用拳脚功夫。

=== item: w.mujian
name: 木剑
slot: weapon
weapon: 剑
bonus: 0
---
一柄练功用的木剑，分量和真剑差不多，只是没有锋刃。

=== item: w.qinggang
name: 青钢剑
slot: weapon
weapon: 剑
bonus: 12
---
精钢打造的长剑，剑身泛着青光，寻常江湖人用的就是这种。

=== item: w.baila
name: 白蜡枪
slot: weapon
weapon: 枪
bonus: 12
---
白蜡木的枪杆又韧又直，枪头是襄阳的好铁。边军里用的就是这种枪。

# 上等兵器（D-104）：给后期的钱一个去处。精钢 +20%（两家铁匠都打），百炼 +28%（只有襄阳张铁匠打）。
# 门派绝学任务的真武剑（+40%）、青竹棒（+40%）、孔雀翎（+45%）是顶级兵器，只从任务得到。店里卖的不超过 +28%（D-119，校验会查）。
=== item: w.jinggang_jian
name: 精钢剑
slot: weapon
weapon: 剑
bonus: 20
---
用上好的精钢反复锻打出来的长剑，剑身泛着青光，弹一下嗡嗡作响。

=== item: w.jinggang_dao
name: 精钢刀
slot: weapon
weapon: 刀
bonus: 20
---
精钢打的厚背刀，刃口磨得雪亮，劈开一叠铜钱不卷刃。

=== item: w.jinggang_qiang
name: 精钢枪
slot: weapon
weapon: 枪
bonus: 20
---
白蜡杆配精钢枪头，枪头三棱开槽，扎进去就带血。

=== item: w.bailian_jian
name: 百炼剑
slot: weapon
weapon: 剑
bonus: 28
---
张铁匠用百炼法一锤一锤打出来的剑，打了整整一个月。剑身上的纹路像流水。

=== item: w.bailian_dao
name: 百炼刀
slot: weapon
weapon: 刀
bonus: 28
---
百炼钢打的长刀，刀背厚、刀刃薄，军中的将官出大价钱都买不到。

=== item: w.bailian_qiang
name: 百炼枪
slot: weapon
weapon: 枪
bonus: 28
---
百炼钢的枪头，配三年阴干的白蜡杆，舞起来枪缨像一团火。

=== item: w.gangdao
name: 钢刀
slot: weapon
weapon: 刀
bonus: 12
---
一口厚背钢刀，分量十足，劈砍起来虎虎生风。

=== item: w.songwen
name: 松纹古剑
slot: weapon
weapon: 剑
bonus: 18
---
武当山上流传的古剑，剑身有松树般的纹理，轻巧而坚韧。

# 暗器（D-119）：唐门的暗器功夫原先只有绝学任务的孔雀翎能加成，补上铺子里能买的两档。
=== item: w.jinggang_biao
name: 精钢飞镖
slot: weapon
weapon: 暗器
bonus: 20
---
一囊精钢打的柳叶飞镖，镖身薄而沉，出手不飘。

=== item: w.bailian_biao
name: 百炼梅花镖
slot: weapon
weapon: 暗器
bonus: 28
---
张铁匠用百炼钢打的梅花镖，五瓣镖刃，打中了就嵌在肉里。

# ---------------- 临安铁匠铺 ----------------

=== npc: linan.smith
name: 王铁匠
brief: 临安市集的铁匠，卖刀剑。
talk: linan.smith.talk
---
一个赤着胳膊的壮汉，抡着大锤叮叮当当地打铁，火星四溅。

=== dialog: linan.smith.talk
---
王铁匠：客官要点什么？刀剑都是我亲手打的，童叟无欺！
* 买一口钢刀（180 文） ?money:180 !pay:180 !give:w.gangdao
* 买一柄青钢剑（200 文） ?money:200 !pay:200 !give:w.qinggang
* 买一柄木剑（30 文） ?money:30 !pay:30 !give:w.mujian
* 买一柄精钢剑（剑法伤害 +20%，600 文） ?money:600 !pay:600 !give:w.jinggang_jian
* 买一口精钢刀（刀法伤害 +20%，600 文） ?money:600 !pay:600 !give:w.jinggang_dao
* 买一杆精钢枪（枪法伤害 +20%，600 文） ?money:600 !pay:600 !give:w.jinggang_qiang
* 买一囊精钢飞镖（暗器伤害 +20%，600 文） ?money:600 !pay:600 !give:w.jinggang_biao
* 随便看看

=== patch: linan.market
npcs: linan.smith

# ---------------- 襄阳铁匠铺（襄阳铁器便宜）----------------

=== npc: xiangyang.smith
name: 张铁匠
brief: 襄阳樊城集的铁匠，兵器便宜。
talk: xiangyang.smith.talk
---
一个满脸烟灰的老铁匠，他打的刀剑在军中很有名气。

=== dialog: xiangyang.smith.talk
---
张铁匠：襄阳的铁好，我的手艺也不赖。军爷们都在我这儿买刀。
* 买一口钢刀（140 文） ?money:140 !pay:140 !give:w.gangdao
* 买一柄青钢剑（160 文） ?money:160 !pay:160 !give:w.qinggang
* 买一杆白蜡枪（150 文） ?money:150 !pay:150 !give:w.baila
* 买一柄精钢剑（剑法伤害 +20%，560 文） ?money:560 !pay:560 !give:w.jinggang_jian
* 买一口精钢刀（刀法伤害 +20%，560 文） ?money:560 !pay:560 !give:w.jinggang_dao
* 买一杆精钢枪（枪法伤害 +20%，560 文） ?money:560 !pay:560 !give:w.jinggang_qiang
* 买一囊精钢飞镖（暗器伤害 +20%，560 文） ?money:560 !pay:560 !give:w.jinggang_biao
* 打一柄百炼剑（剑法伤害 +28%，2400 文） ?money:2400 !pay:2400 !give:w.bailian_jian
* 打一口百炼刀（刀法伤害 +28%，2400 文） ?money:2400 !pay:2400 !give:w.bailian_dao
* 打一杆百炼枪（枪法伤害 +28%，2400 文） ?money:2400 !pay:2400 !give:w.bailian_qiang
* 打一囊百炼梅花镖（暗器伤害 +28%，2400 文） ?money:2400 !pay:2400 !give:w.bailian_biao
* 随便看看

=== patch: xiangyang.market
npcs: xiangyang.smith
