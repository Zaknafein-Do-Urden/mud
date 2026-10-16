# 全真教（终南山重阳宫，长安以南）。暂不收徒（不是可拜入的门派）。
# 持丘处机所赠的重阳宫信物来此，可以触发剧情（见 shediao/quanzhen.md）。

=== patch: changan.station
exits: 南=quanzhen.gate
---
往南的山道通向终南山，山上便是全真教的重阳宫。

=== room: quanzhen.gate
name: 终南山·山门
exits: 北=changan.station, 南=quanzhen.hall
npcs: quanzhen.daotong
---
终南山层峦叠翠，山道两旁古柏森森。一座石牌坊上刻着"全真"二字，笔力雄浑。
几个小道童在山门前洒扫，见了生人便好奇地张望。

=== room: quanzhen.hall
name: 终南山·重阳宫
exits: 北=quanzhen.gate
npcs: quanzhen.mayu
---
重阳宫依山而建，殿宇层叠。正殿供奉着重阳祖师的画像，画中人背负长剑，目光炯炯。
殿前广场上，数十名道士正在演练剑阵，进退之间整齐划一。

=== entry: quanzhen.e.mayu
name: 马钰
---
道号丹阳子，全真七子之首，现任全真教掌教。为人谦和，武功修为深厚。

=== npc: quanzhen.daotong
name: 知客道童
brief: 重阳宫的知客道童。
talk: quanzhen.daotong.talk
---
一个眉清目秀的小道童，手里拿着拂尘，有模有样地行了个礼。

=== dialog: quanzhen.daotong.talk
---
知客道童：福生无量天尊。施主是来进香的吗？掌教真人在宫里，不过……本教近来不收外门弟子。

=== npc: quanzhen.mayu
name: 马钰
brief: 全真教掌教，丹阳子。
talk: quanzhen.mayu.talk
---
一位白发白须的老道，面容清癯，目光温润。他坐在蒲团上，似睡非睡，却又像什么都看在眼里。

=== dialog: quanzhen.mayu.talk
---
马钰：善哉。施主远来辛苦。
?!has:shediao.qiu_token 马钰：只是本教门规，近年不收外门弟子，还请见谅。施主若有暇，不妨在山上随喜。
?has:shediao.qiu_token ?!flag:shediao.u.qiu_token.done 马钰的目光在你腰间停了一停，微微一笑：“施主身上，似乎带着本教的东西？”（可以在这里使用重阳宫信物）
* 告辞

# 全真心法：门派之外的内功，低级、平和（上限 60 级）
=== skill: quanzhen.xinfa
name: 全真心法
kind: 内功
cap: 60
hp: 8
mp: 9
affinity: 守
---
全真教的入门心法，讲究清静无为、养气归元。功力增长平稳，于护体最有裨益。

# 全真剑法：全真教不收外门弟子，这门剑法只在射雕剧情里由丘处机指点（D-071）。
# 上限随剧情提高（cap 效果），按 docs/POWER.md 的威力规则安排。
=== skill: quanzhen.jianfa
name: 全真剑法
kind: 外功
stance: 刚
weapon: 剑
cap: 15
---
全真教的看家剑法，剑势端正大方，一招一式都有来历。不求奇诡，只求稳扎稳打。

=== move: quanzhen.jianfa.1
skill: quanzhen.jianfa
name: 白虹贯日
level: 0
power: 20
mp: 7
omen: $N长剑在身前连画三个圆圈，剑尖始终指着你……|$N脚踏七星，剑身平举……
---
$N长剑一挺，「$招」，剑光如一道白虹，直贯$n$部位！

=== move: quanzhen.jianfa.2
skill: quanzhen.jianfa
name: 白鹤亮翅
level: 15
power: 25
mp: 10
omen: $N双臂一展，长剑斜斜举过头顶……
---
$N身形一长，「$招」，长剑自上而下劈向$n$部位，剑风凛凛！

=== move: quanzhen.jianfa.3
skill: quanzhen.jianfa
name: 定阳针
level: 40
power: 30
mp: 13
effects: 破绽
omen: $N长剑缓缓前指，剑尖凝定不动，像一根钉子……
---
$N手腕一沉，「$招」，剑尖笔直刺出，又快又准，正中$n$部位！

=== move: quanzhen.jianfa.4
skill: quanzhen.jianfa
name: 七星聚会
level: 70
power: 36
mp: 17
effects: 内伤
omen: $N剑尖上下点动，剑光像天上的七颗星……
---
$N剑尖连点七处，「$招」，七道剑光最后合成一道，直贯$n$部位！
