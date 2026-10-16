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
* 随便看看

=== patch: linan.market
npcs: linan.smith

# ---------------- 襄阳铁匠铺（襄阳铁器便宜）----------------

=== npc: xiangyang.smith
name: 张铁匠
brief: 襄阳市集的铁匠，兵器便宜。
talk: xiangyang.smith.talk
---
一个满脸烟灰的老铁匠，他打的刀剑在军中很有名气。

=== dialog: xiangyang.smith.talk
---
张铁匠：襄阳的铁好，我的手艺也不赖。军爷们都在我这儿买刀。
* 买一口钢刀（140 文） ?money:140 !pay:140 !give:w.gangdao
* 买一柄青钢剑（160 文） ?money:160 !pay:160 !give:w.qinggang
* 随便看看

=== patch: xiangyang.market
npcs: xiangyang.smith
