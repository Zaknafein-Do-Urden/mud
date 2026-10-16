# 基础武功：所有角色开局就会，上限 50 级（SECT.md §4）。
# 招式正文是出招描述：$N 出招者，$n 对手，$招 招式名，$部位 随机部位。
# omen 是预兆：回合开始时对手看到的样子（COMBAT.md §9.1）。

=== skill: base.quan
name: 基本拳脚
kind: 外功
stance: 刚
---
师父传下的入门拳脚，一拳一脚都是实打实的硬功夫。

=== move: base.quan.1
skill: base.quan
name: 冲拳
level: 0
power: 22
mp: 8
omen: $N攥紧拳头，肩膀微微后撤……
---
$N大喝一声，一记「$招」直捣$n$部位！

=== move: base.quan.2
skill: base.quan
name: 双风贯耳
level: 20
power: 30
mp: 13
omen: $N双臂张开，如大鹏展翅，拳风隐隐……
---
$N双拳一左一右，使出「$招」，夹击$n两侧太阳穴！

=== skill: base.zhang
name: 基本掌法
kind: 外功
stance: 巧
---
入门掌法，讲究出手快、变招灵。

=== move: base.zhang.1
skill: base.zhang
name: 拂面掌
level: 0
power: 14
mp: 5
omen: $N手腕轻抖，掌影虚晃……
---
$N手掌一翻，一招「$招」轻飘飘拂向$n$部位。

=== move: base.zhang.2
skill: base.zhang
name: 穿云手
level: 25
power: 19
mp: 8
effects: 破绽
omen: $N身形微侧，五指并拢如刀……
---
$N五指并拢，一招「$招」从$n意想不到的角度穿入！

=== skill: base.zhaojia
name: 基本招架
kind: 外功
stance: 守
---
入门的招架功夫，护住要害，以静制动。

=== move: base.zhaojia.1
skill: base.zhaojia
name: 封挡
level: 0
power: 12
mp: 3
omen: $N双臂一竖，护在胸前……
---
$N双臂交叉，摆出「$招」的架势，严守门户。

=== skill: base.tuna
name: 吐纳法
kind: 内功
hp: 6
mp: 8
---
最粗浅的呼吸吐纳之法，聊胜于无。
