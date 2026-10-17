# 射雕英雄传 · 开端（总是加载，保持精简）
# 主线只能写 shediao.* 标记。所有文字为原创，不摘抄原著。

=== storyline: shediao
name: 射雕英雄传
xiuwei: 60-450
# 尚未开始时，在"江湖 → 主线"里给出的线索
hint: 临安清风茶楼的说书先生消息灵通，不妨去听听"眼下的新鲜事"。
---
临安城外牛家村，住着两户结义兄弟。一场大雪，一位来历不明的道人，将把两家人卷进二十年的恩怨里。

# 茶楼说书先生处的入口
=== patch: linan.storyteller.start
if: !flag:shediao.started
---
* 眼下的新鲜事 -> shediao.hook.news

=== patch: linan.storyteller.start
if: flag:shediao.started !flag:shediao.ch1_done
---
* 再问牛家村的事 -> shediao.hook.again

=== dialog: shediao.hook.news
---
说书先生把醒木一拍，压低了嗓子：
说书先生：新鲜事倒有一桩。前几日，府里一位姓王的大人，夜里在家中被人割了首级去，到今日还没拿到凶手。
说书先生：有人说是江湖上的侠客干的——那位王大人，私下里跟北边的[[金国|world.e.jin]]人眉来眼去，早就有人看他不顺眼了。
说书先生：还有一桩，城外[[牛家村|shediao.e.niujia]]住着两条好汉，一个姓郭，一个姓杨，都是忠良之后。这两件事扯不扯得上干系，嘿嘿，小老儿可不敢乱说。
* 牛家村在哪里？ -> shediao.hook.where
* 听听就算了

=== dialog: shediao.hook.where
---
说书先生：出钱塘门往南，沿官道走上小半日就到。客官若是要去，天色可不早了，看这天，夜里怕是要落雪。
* 去牛家村看看 !start:shediao
* 改日再说

=== dialog: shediao.hook.again
---
说书先生：牛家村？出钱塘门往南，顺着官道走便是。听说那姓杨的一条枪使得出神入化，客官去了，替小老儿开开眼界。

# 城外官道通往牛家村
=== patch: linan.road
if: flag:shediao.started
exits: 东南=shediao.niujia.entrance
---
?!flag:shediao.ch1_done 东南方向的岔路上立着一块木牌，写着“牛家村”三个字。

=== entry: shediao.e.niujia
name: 牛家村
---
临安城郊的一个小村子，傍着钱塘江，几十户人家，多以种田打猎为生。

# ---------------- 当前目标（D-045）：按顺序取第一个条件满足的 ----------------

=== goal: shediao.goal.1
name: 去牛家村看看
storyline: shediao
if: flag:shediao.started !flag:shediao.invited !flag:shediao.ch1_done
---
出钱塘门往南到城外官道，再往东南，就是牛家村。

=== goal: shediao.goal.2
name: 赴郭啸天的酒约
storyline: shediao
if: flag:shediao.invited !flag:shediao.ch1_done
---
郭啸天邀你喝酒：去牛家村北边的曲三酒馆。
