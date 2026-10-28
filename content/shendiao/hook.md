# 神雕侠侣 · 开端（总是加载，保持精简）
# 主线只能写 shendiao.* 标记。所有文字为原创，不摘抄原著。
# 三部曲的第二部（D-141）：要等射雕英雄传走完（shediao 的 done 成立）才能开始。
# 入口：嘉兴南湖岸边的茶摊老汉（射雕第十八章 shediao.c18_tea）。读过他十年前那段传闻的（shediao.c18_rumor）自己就想起来了。
# 射雕里埋下的伏笔见 docs/SHEDIAO.md §4；神雕的规划见 docs/SHENDIAO.md。

=== storyline: shendiao
name: 神雕侠侣
requires: shediao
xiuwei: 500-780
milestones: flag:shendiao.ch5_done, flag:shendiao.ch13_done
# 全线完结（第十八章），走完给 1 个天赋点；倚天屠龙记的 requires 读它（D-141）
done: flag:shendiao.ch18_done
# 尚未开始时，在"江湖 → 主线"里给出的线索
hint: 嘉兴南湖岸边那个茶摊还在。摆摊的老汉，湖上湖下的事没有他不知道的。
---
华山一别，十年过去。嘉兴城南那座庄子，又要出事了。

# ---------------- 入口：南湖茶摊（射雕第十八章的老汉）----------------

=== patch: shediao.c18.tea
if: flag:shediao.ch20_done !flag:shendiao.started
---
* 那个雨里的道姑，后来来过没有 -> shendiao.hook.tea ?flag:shediao.c18_rumor
* 城南陆家庄近来怎么样 -> shendiao.hook.tea ?!flag:shediao.c18_rumor

=== dialog: shendiao.hook.tea
do: flag:shendiao.hook_tea
---
?flag:shediao.c18_rumor 话一出口，你自己先算了算日子。十年前也是在这个棚子底下，老汉跟你说起陆家庄的喜事：门外站了一夜的杏黄衫道姑，大理口音的老和尚，还有那句“十年之内不来寻仇”。
?flag:shediao.c18_rumor 茶摊老汉的手停在铜壶上：客官记性好。十年了，就是这个月。
?!flag:shediao.c18_rumor 茶摊老汉往四下看了看，把铜壶往炉子边一搁：客官问着了。十年前陆家庄娶媳妇，门外站着一个穿杏黄衫子的道姑，从早站到天亮，盯着新郎官看。
?!flag:shediao.c18_rumor 茶摊老汉：后来一个大理口音的老和尚过去跟她说了几句，她答应十年之内不来寻仇。十年以后呢？和尚没说。今年，就是第十年。
茶摊老汉：新郎官前几年得病死了，新娘子跟着也去了。如今庄上当家的是他兄弟陆二爷，人老实，带着闺女和一个外甥女过日子。
茶摊老汉：前天夜里，陆家庄的白粉墙上叫人按了几个手印，血红血红的，洗都洗不掉。陆二爷一大早关了庄门，佃户都打发回家了。
茶摊老汉：城里有人说，那道姑这些年在江湖上闯出了一个名号，叫什么“赤练仙子”。她要杀谁，先在谁家墙上按手印，一个手印一条命。
他摇了摇头，不再往下说，低头去捅炉子里的炭。
* 去陆家庄看看 !start:shendiao
* 先不去

# ---------------- 开始之前的提示（D-097）----------------

=== goal: shendiao.pre.1
name: 南湖茶摊
storyline: shendiao
pre: true
if: !flag:shendiao.hook_tea !flag:shendiao.started
---
嘉兴南湖岸边那个茶摊还在（嘉兴十字街往东北）。摆摊的老汉，湖上湖下的事没有他不知道的。

=== goal: shendiao.pre.2
name: 墙上的血手印
storyline: shendiao
pre: true
if: flag:shendiao.hook_tea !flag:shendiao.started
---
茶摊老汉说，嘉兴城南陆家庄的墙上叫人按了血手印。想去看看的话，再到南湖茶摊跟老汉打听一声。
