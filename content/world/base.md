# 基础武功，上限 50 级。开局只会庄稼把式；其余在各城武馆花钱学（D-061，world/wuguan.md）。
# 招式正文是出招描述：$N 出招者，$n 对手，$招 招式名，$部位 随机部位。
# omen 是预兆：回合开始时对手看到的样子（COMBAT.md §9.1）。可以用 | 分隔多种写法，每次随机挑一种。

=== skill: base.quan
name: 庄稼把式
kind: 外功
stance: 刚
---
乡下人打架的路数，师父教你的第一样功夫。没什么花样，一拳一脚都是实打实的力气。
刚、巧、守各有一招，虽然粗浅，也够读着预兆见招拆招了。

=== move: base.quan.1
skill: base.quan
name: 冲拳
level: 0
power: 22
mp: 8
omen: $N攥紧拳头，肩膀微微后撤……|$N拳头在腰间一收，脚下踏实……|$N右拳缓缓后拉，眼睛死死盯住你的胸口……
---
$N大喝一声，一记「$招」直捣$n$部位！

=== move: base.quan.2
skill: base.quan
name: 双风贯耳
level: 20
power: 30
mp: 13
omen: $N双臂张开，如大鹏展翅，拳风隐隐……|$N两拳分开，一左一右，像是要合击过来……
---
$N双拳一左一右，使出「$招」，夹击$n两侧太阳穴！

# 庄稼把式的巧招、守招（D-070）：让新角色一开始就能刚巧守俱全；威力比武馆的小巧掌、沾衣十八跌低
=== move: base.quan.3
skill: base.quan
name: 偷步勾腿
stance: 巧
level: 0
power: 12
mp: 5
omen: $N脚下悄悄挪了半步，眼睛却看着别处……|$N身子一矮，一条腿虚虚地探了出来……
---
$N趁$n不备，「$招」，一脚勾向$n脚踝，跟着一拳捣在$部位！

=== move: base.quan.4
skill: base.quan
name: 抱架
stance: 守
level: 0
power: 10
mp: 3
omen: $N两手抱拳护在脸前，弓着背缩成一团……|$N缩肩含胸，两条胳膊夹得紧紧的……
---
$N两臂一抱，「$招」，把头脸胸口护得严严实实。

=== skill: base.zhang
name: 小巧掌
kind: 外功
stance: 巧
---
武馆里教的入门掌法，讲究出手快、变招灵，以巧破力。

=== move: base.zhang.1
skill: base.zhang
name: 拂面掌
level: 0
power: 14
mp: 5
omen: $N手腕轻抖，掌影虚晃……|$N手掌在身前翻来覆去，叫人看不清虚实……|$N掌心朝外，轻飘飘地递了出来……
---
$N手掌一翻，一招「$招」轻飘飘拂向$n$部位。

=== move: base.zhang.2
skill: base.zhang
name: 穿云手
level: 25
power: 19
mp: 8
effects: 破绽, 缴械:15
omen: $N身形微侧，五指并拢如刀……|$N侧身绕步，手指绷得笔直……
---
$N五指并拢，一招「$招」从$n意想不到的角度穿入！

=== skill: base.zhaojia
name: 沾衣十八跌
kind: 外功
stance: 守
---
武馆里教的招架功夫，护住要害，借力卸力，对手的拳脚一沾身就被引开。

=== move: base.zhaojia.1
skill: base.zhaojia
name: 封挡
level: 0
power: 12
mp: 3
omen: $N双臂一竖，护在胸前……|$N两臂交叉，缩身含胸……|$N收紧肩背，把要害都藏在了臂弯后面……
---
$N双臂交叉，摆出「$招」的架势，严守门户。

=== skill: base.tuna
name: 养气诀
kind: 内功
hp: 6
mp: 8
---
武馆里教的呼吸吐纳之法，粗浅平和，却是练内功的第一步。

# ---------------- 兵器类基础武功（D-057）：要拿着相应的兵器才能施展 ----------------

=== skill: base.dao
name: 五虎断门刀
kind: 外功
stance: 刚
weapon: 刀
---
镖师、护院人人会两手的刀法，劈、砍、撩、扫，刀刀都要用上全身的力气。要手里有刀才能施展。

=== move: base.dao.1
skill: base.dao
name: 力劈
level: 0
power: 26
mp: 10
omen: $N双手握刀，刀身缓缓举过头顶……|$N拖刀而立，脚下踏实……
---
$N双手握刀，一招「$招」当头劈下，刀风直扑$n$部位！

=== move: base.dao.2
skill: base.dao
name: 横扫千军
level: 20
power: 34
mp: 15
effects: 破绽
omen: $N把刀横在身侧，腰身微拧……
---
$N拧腰发力，「$招」一刀横扫，刀光贴着地面卷向$n$部位！

=== skill: base.jian
name: 三才剑
kind: 外功
stance: 巧
weapon: 剑
---
天、地、人三才为纲的入门剑法，刺、挑、点、抹，讲究剑尖的准头。要手里有剑才能施展。

=== move: base.jian.1
skill: base.jian
name: 直刺
level: 0
power: 17
mp: 6
omen: $N剑尖微颤，对准了你的胸口……|$N手腕一沉，剑身平平端在身前……
---
$N踏步进身，「$招」一剑笔直刺向$n$部位！

=== move: base.jian.2
skill: base.jian
name: 挑腕
level: 25
power: 22
mp: 9
effects: 缴械:20
omen: $N剑尖下垂，盯着你握兵器的手……
---
$N剑尖自下而上一挑，「$招」，专取$n的手腕！

# ================= 门派学艺（D-069）=================
# 五派师父共用。teach: true 让引擎把本门可学的武功列成选项（不要钱，从 1 级学起）。

=== dialog: world.sect.teach
teach: true
ifnone: 眼下没有你能学的了。多做门派任务、提升阶位，自有新的功夫可学。
---
你想学哪一门？
* 不学了

