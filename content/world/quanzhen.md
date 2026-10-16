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
