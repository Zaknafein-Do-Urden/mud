# 竹哨（原创主线）· 开端（总是加载）。剧本方案 D，见 docs/WHISTLE-PROPOSALS.md。
# 主线只能写 feiyan.* 标记。

=== storyline: feiyan
name: 竹哨
xiuwei: 110-250
done: flag:feiyan.ch4_done
# 尚未开始时的提示按阶段给（下面的 pre 目标，D-097），这一句只在都不满足时兜底
hint: 师父临终说：去临安，找一个会吹竹哨的人。
---
师父临终前那句话，一支刻着燕子的竹哨，西湖上的雾，和一桩埋了二十年的旧案。

# 飞燕门的独门身法：上限随章节解锁（cap 效果），特性随等级解锁（D-062）
=== skill: feiyan.shenfa
name: 飞燕身法
kind: 轻功
cap: 10
traits: 燕返@1, 回旋@30, 燕回巢@60
---
飞燕门代代相传的身法，身轻如燕，回翔自如。
1 级「燕返」：巧招得手后，有两成机会再补一击。
30 级「回旋」：调息、换兵器时不露破绽，调息多回内力。
60 级「燕回巢」：巧招不再被守势克制。
这门身法的上限，要随着飞燕门的旧事一层层揭开才能提高。

=== trigger: feiyan.t.start
room: linan.inn
if: flag:world.whistle_answered !flag:feiyan.started
dialog: feiyan.start

=== dialog: feiyan.start
pace: slow
lock: true
---
夜深了，客栈里静悄悄的，只有窗外的雨声。
你正要吹灯，门缝底下忽然塞进来一张纸条。拉开门，走廊里空无一人。
纸条上只有几个字，墨迹未干：
“子时，断桥。燕。”
* 去断桥赴约 !start:feiyan

# ---------------- 开始之前的提示（D-097）：一步一步给，不剧透下一步 ----------------

=== goal: feiyan.pre.1
name: 师父的遗言
storyline: feiyan
pre: true
if: !has:bamboo_whistle !flag:world.whistle_answered
---
师父临终只说了一句：去临安，找一个会吹竹哨的人。钱塘门下那个老乞丐，眼神亮得不像个叫化子，也许该跟他聊聊。

=== goal: feiyan.pre.2
name: 老乞丐的竹哨
storyline: feiyan
pre: true
if: has:bamboo_whistle !flag:world.whistle_answered
---
老乞丐塞给你一支竹哨，说：天黑以后，去断桥，吹三声。

=== goal: feiyan.pre.3
name: 断桥上的人
storyline: feiyan
pre: true
if: flag:world.whistle_answered !flag:feiyan.started
---
断桥雾里那个戴斗笠的人说，时候到了会来找你。先在临安住下吧，城里有家望湖客栈。

