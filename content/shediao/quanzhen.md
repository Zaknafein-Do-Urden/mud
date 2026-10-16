# 射雕英雄传 · 支线：重阳宫信物（主线开始后加载）
# 在终南山重阳宫使用丘处机所赠的信物，马钰传授全真心法。一次性奖励（D-042）。
# 所有文字为原创。

=== use: shediao.u.qiu_token
item: shediao.qiu_token
room: quanzhen.hall
once: true
if: flag:shediao.ch4_done
dialog: shediao.qz.token

# 第四章之前：马钰不收。全真心法按威力规则要第四章之后才能得到（D-068，docs/POWER.md）
=== use: shediao.u.qiu_token_early
item: shediao.qiu_token
room: quanzhen.hall
if: !flag:shediao.ch4_done
dialog: shediao.qz.token_early

=== dialog: shediao.qz.token_early
---
马钰接过铜牌看了看，又双手还给你。
?!flag:shediao.ch3_done 马钰：这是处机师弟的随身信物。他云游在外，贫道不便替他做主。施主先收好，日后见了他再说。
?flag:shediao.ch3_done ?!flag:shediao.ch4 马钰：处机师弟前些日子捎信回山，说嘉兴的事还没完，郭家娘子仍下落不明。施主若肯帮他把这件事办出个眉目，再拿信物来，贫道自有道理。
?flag:shediao.ch4 马钰：淮北凶险，施主先把眼前的事办完。等你回来，再拿信物来找贫道。
（重阳宫信物要在射雕第四章之后才能使用。）

=== dialog: shediao.qz.token
pace: slow
lock: true
---
你取出那枚铸着"全"字的铜牌，双手奉上。
马钰接过铜牌，摩挲片刻，脸上露出温和的笑意。
马钰：这是处机师弟的随身信物。他性子急，向来不轻易许人什么。施主想必是于他有大恩的人。
?flag:shediao.ch3_done 马钰：牛家村、嘉兴法华寺的事，处机已托人捎信回山，说了个大概。他说，那两夜若不是你，他未必能撑到最后。
马钰：本教门规，不收外门弟子，这一条贫道不能破。不过……
他沉吟片刻，从袖中取出一卷薄薄的册子。
马钰：这是本教入门的心法，算不得什么高深武学，却最是平和中正，能养气护体。施主拿去练吧，也算全了处机的一番心意。
* 恭敬地接过册子 -> shediao.qz.token2

=== dialog: shediao.qz.token2
do: learn:quanzhen.xinfa
---
马钰：信物你也收好。日后本教若有需要，还要请施主援手。
翻开册子，第一页写着八个字：清静无为，抱元守一。
（全真心法是门派之外的内功，最高可练到 60 级。在人物面板的武功页里可以装备。）

=== patch: quanzhen.mayu.talk
if: has:shediao.qiu_token
---
?flag:shediao.u.qiu_token.done 马钰：那套心法，练得如何了？内功之道，贵在持之以恒。
