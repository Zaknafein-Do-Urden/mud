# 倚天屠龙记 · 开端（总是加载，保持精简）
# 主线只能写 yitian.* 标记。所有文字为原创，不摘抄原著。
# 三部曲的第三部（D-141）：要等神雕侠侣走完（shendiao 的 done 成立）才能开始。规划见 docs/YITIAN.md。
# 入口：少林寺山门，神雕之后三年，郭襄找杨过找到少室山来，被知客僧拦在门外（读 shendiao.c13_needle_kept）。

=== storyline: yitian
name: 倚天屠龙记
requires: shendiao
xiuwei: 660-1320
milestones: flag:yitian.ch6_done, flag:yitian.ch14_done
# 全线完结（第二十章）
done: flag:yitian.ch20_done
# 尚未开始时，在"江湖 → 主线"里给出的线索
hint: 少林寺山门外，近来常有一个背着短剑的姑娘，跟知客僧说个没完。
---
襄阳城破之前，有人把一部经书、一部兵书，铸进了一刀一剑里。

# ---------------- 入口：少林寺山门的郭襄 ----------------

=== patch: shaolin.gate
if: flag:shendiao.ch18_done !flag:yitian.started
npcs: yitian.npc.gx_gate
---
山门的石阶下站着一个穿淡黄衫子的姑娘，背着一柄短剑，正跟扫地的知客僧说话，说一句，知客僧摇一下头。

=== npc: yitian.npc.gx_gate
name: 郭襄
brief: 郭靖、黄蓉的小女儿，十九岁，一个人在江湖上走了三年。
if: flag:shendiao.ch18_done !flag:yitian.started
talk: yitian.hook.gx
---
三年不见，她高了一点，也瘦了一点，眉眼还是那样，笑起来先笑眼睛。衫子的下摆沾着一路的黄土，靴子换过一双，又磨破了。

=== dialog: yitian.hook.gx
---
郭襄一回头看见你，眼睛先亮了：是你！你怎么也到少林来了？
郭襄：我听说有人在少室山上见过一个独臂的人，骑着一匹瘦马，往山里去了。我从襄阳一路找过来，到了门口，这位大师父说什么也不让我进去。
知客僧双手合十，脸都苦了：女施主，本寺千百年的规矩，女客不进山门。贫僧跟你说了一上午了。
?flag:shendiao.c13_needle_kept 她说话的时候，一只手按在衣襟上。你知道那里面贴身揣着一个小手帕包。
郭襄：大和尚，我不是来烧香的，我是来找人的。找着了我就走，一步都不多待。
* 替她跟知客僧说说情 -> yitian.hook.gx2 ?!flag:yitian.hook_gx
* 陪她进寺 !start:yitian ?flag:yitian.hook_gx
* 先不管这事

=== dialog: yitian.hook.gx2
do: flag:yitian.hook_gx
---
你跟知客僧说，这位姑娘是襄阳郭大侠的女儿。知客僧一愣，往里头跑去问了。过了好一会儿，一个高高瘦瘦的老和尚跟着他出来，是罗汉堂的首座无色禅师。
无色禅师打量了郭襄几眼，又打量你，忽然笑了：郭大侠的千金，贫僧当年在襄阳城下见过一面，那时还抱在怀里。规矩是规矩——这位施主若肯陪着，进去喝一碗茶，看一看就出来，佛祖不会怪罪。
郭襄冲你吐了吐舌头，小声说：你看，还是你的面子大。
* 陪她进寺 !start:yitian
* 改天再来

# ---------------- 开始之前的提示（D-097）----------------

=== goal: yitian.pre.1
name: 少林山门
storyline: yitian
pre: true
if: !flag:yitian.hook_gx !flag:yitian.started
---
少林寺山门外（洛阳车马行往东南），有个背短剑的姑娘跟知客僧争了一上午。去看看是谁。

=== goal: yitian.pre.2
name: 陪郭襄进寺
storyline: yitian
pre: true
if: flag:yitian.hook_gx !flag:yitian.started
---
无色禅师答应让郭襄进寺看一看，要你陪着。再到少林山门跟郭襄说一声。
