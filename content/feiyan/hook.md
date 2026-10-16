# 竹哨（原创主线）· 开端（总是加载）。剧本方案 D，见 docs/WHISTLE-PROPOSALS.md。
# 主线只能写 feiyan.* 标记。

=== storyline: feiyan
name: 竹哨
level: 1-60
hint: 西湖断桥上那个戴斗笠的人说过，时候到了会来找你。先在临安住下——去望湖客栈歇一晚。（要先在断桥吹响竹哨）
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
