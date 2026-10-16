# 门派绝学任务（D-085）：每派一个，本门第四阶（rank 3）才能接，完成后得到本门的绝世功法或超级武器。
# 绝学写 secret: true：不能用"学"命令学，也不出现在师父的传授列表里，只能从这里得到。
# 流程：师父处接任务 → 去任务地点（接任务后才出现的出口）→ 打败头目（按玩家功力自适应，adapt: true）→ 回禀师父领奖。
# 所有文字原创。

# ================= 通用 =================

=== enemy: world.sq.jin_guard
weapon: 刀
weaponName: 弯刀
name: 金国武士
attrs: 根骨=20, 身法=15, 悟性=12
skills: base.dao=60, base.quan=55, base.zhaojia=50, base.tuna=50
ai: 刚=3, 守=1
cunning: 15
potential: 80
---
金国派来的武士，皮甲外罩着汉人的衣裳，腰里的弯刀却藏不住。

# ================= 丐帮：清理门户，得打狗棒法 =================

=== skill: gaibang.dagou
name: 打狗棒法
kind: 外功
stance: 巧
weapon: 棍
sect: gaibang
rank: 3
secret: true
---
丐帮历代帮主口口相传的棒法，只传给为本帮立下大功的弟子。棒法以巧打拙，绊、劈、缠、戳、挑、引、封、转八字诀变化无穷。
要拿着棍棒才能施展。只能通过丐帮的门派绝学任务得到。

=== move: gaibang.dagou.1
skill: gaibang.dagou
name: 绊字诀
level: 0
power: 50
mp: 22
effects: 破绽
omen: $N手中竹棒贴地一晃，棒梢在你脚边绕来绕去……|$N身子一矮，竹棒压得极低……
---
$N竹棒贴地横扫，「$招」，棒梢像一条青蛇缠向$n的脚踝，跟着一挑，戳在$部位！

=== move: gaibang.dagou.2
skill: gaibang.dagou
name: 封字诀
level: 30
power: 58
mp: 26
effects: 点穴
omen: $N竹棒在身前舞成一团青光，把你的去路全封住了……
---
$N竹棒左封右挡，「$招」，$n无论往哪边闪，棒头都等在那里，正点中$部位的穴道！

=== move: gaibang.dagou.3
skill: gaibang.dagou
name: 天下无狗
level: 60
power: 70
mp: 34
effects: 破绽, 群攻
omen: $N竹棒一抖，化作满天棒影……
---
$N竹棒连环急点，「$招」，四面八方都是棒影，$n避无可避！

=== item: gaibang.zhubang
name: 青竹棒
slot: weapon
weapon: 棍
bonus: 20
---
一根寻常的青竹棒，被握得油光发亮。鲁长老说，打狗棒法使得好不好，不在棒子。

=== enemy: world.sq.gb_traitor
weapon: 拳
name: 魏长风
attrs: 根骨=22, 身法=18, 悟性=16
skills: gaibang.lianhua=90, gaibang.xiaoyao=85, gaibang.chansi=80, gaibang.huntian=60
ai: 刚=3, 巧=2, 守=1
cunning: 35
obscure: 20
potential: 400
---
一个四十来岁的乞丐，背上缝着七只布袋，脸上却没有半点风霜之色。手上的功夫，是正宗的丐帮路数。

=== battle: world.sq.gb_fight
enemies: world.sq.gb_traitor, world.sq.jin_guard
adapt: true
win: world.sq.gb.won
---
魏长风把破碗往地上一摔：“鲁有脚派你来的？也罢，丐帮的规矩，打赢了我再说！”

=== dialog: world.sq.gb.start
pace: slow
lock: true
do: flag:world.sq_gaibang.active flag:world.sq_gaibang.started
---
鲁有脚把左右都打发出去，掩上庙门，声音压得很低：
鲁有脚：帮里出了内鬼。北方分舵的魏长风，背着七只布袋，这些年却一直在给金狗通风报信。上个月咱们三个兄弟在汉水边被人截杀，就是他报的信。
鲁有脚：他如今躲在襄阳城南的汉水废渡口，等金人的船来接。帮规：叛帮通敌，人人得而诛之。
鲁有脚：这件事办成了，有一门功夫，我替帮主做主，传给你。
（门派任务：去襄阳车马行往南的汉水废渡口，清理门户。）

=== room: world.sq.gb_ferry
name: 汉水·废渡口
exits: 北=xiangyang.station
---
汉水在这里拐了一道急弯，渡口早就废了，只剩半截栈桥伸在水里。岸边的芦苇比人还高。
?flag:world.sq_gaibang.won 芦苇丛里还留着打斗的痕迹，一只摔碎的破碗半埋在泥里。

=== patch: xiangyang.station
if: flag:world.sq_gaibang.started
exits: 南=world.sq.gb_ferry
---
?!flag:world.sq_gaibang.done 往南出城不远，就是汉水边那个废弃的渡口。

=== trigger: world.sq.t.gb
room: world.sq.gb_ferry
if: flag:world.sq_gaibang.started !flag:world.sq_gaibang.won
dialog: world.sq.gb.meet

=== dialog: world.sq.gb.meet
pace: slow
---
栈桥尽头蹲着一个乞丐，正往河面上张望。身边站着个汉人打扮的武士，腰间露出一截金国弯刀的刀柄。
乞丐回过头，看见你背上的布袋，脸色一沉。
* 动手 !fight:world.sq.gb_fight
* 先退开

=== dialog: world.sq.gb.won
pace: slow
lock: true
do: flag:world.sq_gaibang.won
---
魏长风倒在栈桥上，那金国武士早已跳进芦苇丛里逃了。
你从魏长风怀里搜出一封蜡封的信，上面是金国的花押。
（回临安城隍庙，回禀鲁有脚。）

=== patch: gaibang.lu.talk
---
* 回禀：叛徒魏长风已经伏诛 -> world.sq.gb.reward ?flag:world.sq_gaibang.won ?!flag:world.sq_gaibang.done
* 弟子愿为本帮分忧（门派绝学任务） -> world.sq.gb.start ?sect:gaibang ?rank:3 ?!flag:world.sq_gaibang.started

=== dialog: world.sq.gb.reward
pace: slow
lock: true
do: learn:gaibang.dagou give:gaibang.zhubang unflag:world.sq_gaibang.active flag:world.sq_gaibang.done
---
鲁有脚看完那封信，把它凑到油灯上烧了。
鲁有脚：好，好。三个兄弟的仇，报了。
他从神案底下抽出一根青竹棒，递到你手里。
鲁有脚：打狗棒法，本是帮主才能传的。帮主早有吩咐：有为本帮立下大功、又守得住规矩的弟子，可以传。今天我就替帮主做这个主。
他把八字诀一字一字说给你听，又拿着竹棒，一招一招比给你看。
（你学会了丐帮绝学打狗棒法，得到青竹棒。打狗棒法是棍法，要拿着棍棒才能施展。）

=== quest: world.q.sq_gaibang
name: 丐帮绝学任务：清理门户
flag: world.sq_gaibang.active
where: world.sq.gb_ferry
---
鲁有脚的嘱托：北方分舵的魏长风通敌，躲在襄阳城南的汉水废渡口。除掉他，回城隍庙回禀。

# ================= 少林：追回经卷，得易筋经 =================

=== skill: shaolin.yijin
name: 易筋经
kind: 内功
sect: shaolin
rank: 3
secret: true
hp: 12
mp: 14
affinity: 守
---
少林寺至高的内功心法，据说是达摩祖师面壁所留。练成之后，筋骨脱胎换骨，气血内力的增长远胜寻常心法。
只能通过少林寺的门派绝学任务得到。

=== enemy: world.sq.sl_monk
weapon: 拳
name: 慧通
attrs: 根骨=24, 身法=16, 悟性=18
skills: shaolin.luohan=90, shaolin.nianhua=85, shaolin.jinzhong=80, shaolin.xinfa=60
ai: 刚=2, 巧=2, 守=2
cunning: 30
obscure: 20
potential: 400
---
一个中年僧人，僧袍破了几处，怀里鼓鼓囊囊地揣着个油布包。眼神里没有半点出家人的平和。

=== battle: world.sq.sl_fight
enemies: world.sq.sl_monk
adapt: true
win: world.sq.sl.won
---
慧通把油布包往怀里一塞：“经书在我身上，有本事就来拿！”

=== dialog: world.sq.sl.start
pace: slow
lock: true
do: flag:world.sq_shaolin.active flag:world.sq_shaolin.started
---
慧明禅师把你带到罗汉堂后的禅房，双手合十，长叹一声：
慧明禅师：寺里出了丑事。藏经阁的执事僧慧通，前夜盗走了一部经卷，打伤了两名守阁的师弟。
慧明禅师：那部经卷流落出去，少林百年的清誉要毁于一旦。他还没能下山，躲在后山的塔林里。
慧明禅师：你去把经卷取回来。慧通入寺三十年，功夫不弱，千万小心。
（门派任务：去少林寺后山往北的塔林，追回经卷。）

=== room: world.sq.sl_talin
name: 少林寺·塔林
exits: 南=shaolin.hill
---
历代高僧的舍利塔一座挨着一座，石塔上爬满青苔，塔铃在风里叮当作响。
?flag:world.sq_shaolin.won 塔林里又恢复了往日的清静，只有一座石塔的塔檐缺了一角。

=== patch: shaolin.hill
if: flag:world.sq_shaolin.started
exits: 北=world.sq.sl_talin
---
?!flag:world.sq_shaolin.done 往北的小路通向塔林，林子里静得出奇。

=== trigger: world.sq.t.sl
room: world.sq.sl_talin
if: flag:world.sq_shaolin.started !flag:world.sq_shaolin.won
dialog: world.sq.sl.meet

=== dialog: world.sq.sl.meet
pace: slow
---
一座石塔后面闪出一个人影，正是慧通。他看清了你身上的僧袍，冷笑道：“方丈就派了你来？”
* 交出经卷 !fight:world.sq.sl_fight
* 先退开

=== dialog: world.sq.sl.won
pace: slow
lock: true
do: flag:world.sq_shaolin.won
---
慧通瘫坐在塔基上，油布包滚落在你脚边。
你打开一角看了看，里面是一部字迹古朴的经书，封皮上的字你一个也认不得。
（回少林寺罗汉堂，回禀慧明禅师。）

=== patch: shaolin.huiming.talk
---
* 回禀：经卷已经追回 -> world.sq.sl.reward ?flag:world.sq_shaolin.won ?!flag:world.sq_shaolin.done
* 弟子愿为本寺分忧（门派绝学任务） -> world.sq.sl.start ?sect:shaolin ?rank:3 ?!flag:world.sq_shaolin.started

=== dialog: world.sq.sl.reward
pace: slow
lock: true
do: learn:shaolin.yijin unflag:world.sq_shaolin.active flag:world.sq_shaolin.done
---
慧明禅师捧着经卷，在佛前供了一炷香，才转过身来。
慧明禅师：这便是易筋经。慧通盗它，是想练成之后横行天下；可他不知道，这经书若没有人指点，越练越是走火入魔。
慧明禅师：你护经有功，心性也稳。老衲奉方丈之命，把入门的功法传给你。
他让你盘膝坐下，一句一句地念给你听，又以掌心贴着你的背心，引着你把气息走了一个周天。
（你学会了少林绝学易筋经。它是内功，气血、内力的增长远胜寻常心法。）

=== quest: world.q.sq_shaolin
name: 少林绝学任务：追回经卷
flag: world.sq_shaolin.active
where: world.sq.sl_talin
---
慧明禅师的嘱托：叛僧慧通盗走藏经阁的经卷，躲在后山塔林。追回经卷，回罗汉堂回禀。

# ================= 武当：斩除邪魔，得真武剑 =================

=== item: wudang.zhenwu
name: 真武剑
slot: weapon
weapon: 剑
bonus: 40
---
武当派镇山之宝。剑身古朴，隐隐有一层青光，剑脊上刻着北斗七星。剑法类招式伤害 +40%。

=== enemy: world.sq.wd_demon
weapon: 拳
name: 青面判官
attrs: 根骨=23, 身法=19, 悟性=17
skills: huashan.poyu=90, tangmen.kaibei=85, base.zhaojia=80, base.tuna=60
ai: 刚=3, 巧=1, 守=2
cunning: 35
obscure: 25
potential: 400
---
一张脸涂得青惨惨的，看不出年纪。两只手掌比常人大了一圈，掌心发黑。江湖上说他专掏人心肝炼功。

=== battle: world.sq.wd_fight
enemies: world.sq.wd_demon
adapt: true
win: world.sq.wd.won
---
青面判官咧嘴一笑，露出一口黄牙：“武当的小道士？来得正好，拿你的心肝下酒！”

=== dialog: world.sq.wd.start
pace: slow
lock: true
do: flag:world.sq_wudang.active flag:world.sq_wudang.started
---
清虚道长把一张纸递给你，上面列着七八个名字，都是山下村子里失踪的人。
清虚道长：后山密林往西有个黑风洞，近来住进了一个魔头，江湖上叫他青面判官。这些人，都是他掳去的。
清虚道长：武当弟子下山行道，本分在此。你去吧。他的掌力阴毒，切莫硬接。
（门派任务：去武当山密林往西的黑风洞，除掉青面判官。）

=== room: world.sq.wd_cave
name: 武当山·黑风洞
exits: 东=wudang.forest
---
洞口阴风阵阵，洞里散发着一股说不出的腥气。石壁上用炭画着些古怪的符号。
?flag:world.sq_wudang.won 洞里已经清理干净，洞口新立了一块石碑，刻着那些失踪者的名字。

=== patch: wudang.forest
if: flag:world.sq_wudang.started
exits: 西=world.sq.wd_cave
---
?!flag:world.sq_wudang.done 密林西边隐约有个洞口，一股阴风从里面吹出来。

=== trigger: world.sq.t.wd
room: world.sq.wd_cave
if: flag:world.sq_wudang.started !flag:world.sq_wudang.won
dialog: world.sq.wd.meet

=== dialog: world.sq.wd.meet
pace: slow
---
洞里点着一盏油灯，一个青面人正对着一口小铁锅搅着什么。他慢慢转过头来。
* 替天行道 !fight:world.sq.wd_fight
* 先退开

=== dialog: world.sq.wd.won
pace: slow
lock: true
do: flag:world.sq_wudang.won
---
青面判官倒在铁锅边，再也没能爬起来。
洞的深处，你找到了几个被铁链锁着的村民，还活着。你砍断铁链，把他们一个个扶出洞去。
（回武当山紫霄宫，回禀清虚道长。）

=== patch: wudang.qingxu.talk
---
* 回禀：青面判官已经伏诛 -> world.sq.wd.reward ?flag:world.sq_wudang.won ?!flag:world.sq_wudang.done
* 弟子愿下山行道（门派绝学任务） -> world.sq.wd.start ?sect:wudang ?rank:3 ?!flag:world.sq_wudang.started

=== dialog: world.sq.wd.reward
pace: slow
lock: true
do: give:wudang.zhenwu unflag:world.sq_wudang.active flag:world.sq_wudang.done
---
清虚道长听你说完，沉默良久，起身从殿后取出一个长条形的木匣。
清虚道长：这是真武剑。本派历代都把它交给最能担当的弟子，替武当行走江湖。
清虚道长：剑是利器，用它的人心里要有一杆秤。你救那几个村民的时候，没有先想着自己的功劳。贫道就是看中了这一点。
（你得到了武当镇山之宝真武剑：剑，剑法类招式伤害 +40%。）

=== quest: world.q.sq_wudang
name: 武当绝学任务：斩除邪魔
flag: world.sq_wudang.active
where: world.sq.wd_cave
---
清虚道长的嘱托：后山密林往西的黑风洞里住着魔头青面判官，掳走了山下的村民。除掉他，回紫霄宫回禀。

# ================= 华山：了断旧怨，得紫霞神功 =================

=== skill: huashan.zixia
name: 紫霞神功
kind: 内功
sect: huashan
rank: 3
secret: true
hp: 9
mp: 14
affinity: 巧
---
华山派的镇派内功，练到深处，脸上隐隐有紫气流转。内力绵长，与华山剑法最是相得。
只能通过华山派的门派绝学任务得到。

=== enemy: world.sq.hs_swordsman
weapon: 剑
weaponName: 长剑
name: 孟寒山
attrs: 根骨=20, 身法=22, 悟性=20
skills: huashan.jianfa=95, huashan.hunyuan=80, huashan.poyu=75, huashan.xinfa=60
ai: 巧=3, 刚=1, 守=2
cunning: 40
obscure: 25
potential: 400
---
一个五十来岁的剑客，两鬓斑白，背负长剑，站在峰顶的风里一动不动。剑法是华山的路数，却比华山的更快、更狠。

=== battle: world.sq.hs_fight
enemies: world.sq.hs_swordsman
adapt: true
win: world.sq.hs.won
---
孟寒山缓缓拔剑：“三十年了，华山总算派了个像样的人来。出剑吧。”

=== dialog: world.sq.hs.start
pace: slow
lock: true
do: flag:world.sq_huashan.active flag:world.sq_huashan.started
---
穆清风站在正气堂外，望着远处的落雁峰，很久才开口：
穆清风：三十年前，华山有过一场同门相残。我的师叔孟寒山，因为门中的一桩旧怨被逐出华山，临走时立誓要回来。
穆清风：前几天他上山了，就住在苍龙岭往北的落雁峰顶，指名要和华山最好的弟子比剑。他若赢了，要华山交出镇派心法。
穆清风：我老了。你去。不论输赢，华山的剑，不能弱了名头。
（门派任务：去华山苍龙岭往北的落雁峰，与孟寒山比剑。）

=== room: world.sq.hs_peak
name: 华山·落雁峰
exits: 南=huashan.cliff
---
华山最高的一座峰，峰顶只有几丈见方，四面都是云海。风大得几乎站不住人。
?flag:world.sq_huashan.won 峰顶的石头上多了一道深深的剑痕，是那天比剑时留下的。

=== patch: huashan.cliff
if: flag:world.sq_huashan.started
exits: 北=world.sq.hs_peak
---
?!flag:world.sq_huashan.done 岭北的石阶一直通向落雁峰顶，隐约能看见峰顶站着一个人。

=== trigger: world.sq.t.hs
room: world.sq.hs_peak
if: flag:world.sq_huashan.started !flag:world.sq_huashan.won
dialog: world.sq.hs.meet

=== dialog: world.sq.hs.meet
pace: slow
---
峰顶的风里，那个剑客转过身来，打量了你一眼。
孟寒山：穆清风的徒弟？他自己不敢来？
* 比剑 !fight:world.sq.hs_fight
* 先退开

=== dialog: world.sq.hs.won
pace: slow
lock: true
do: flag:world.sq_huashan.won
---
孟寒山的长剑脱手，插在峰顶的石缝里，剑身嗡嗡直颤。
他看着那柄剑，忽然笑了，笑着笑着又咳了起来。
孟寒山：好剑法。比我当年……强。替我告诉穆清风，那桩旧事，是我错了。
他转身走下峰去，背影在云海里越来越淡。
（回华山正气堂，回禀穆清风。）

=== patch: huashan.mu.talk
---
* 回禀：已经胜了孟寒山 -> world.sq.hs.reward ?flag:world.sq_huashan.won ?!flag:world.sq_huashan.done
* 弟子愿为华山出剑（门派绝学任务） -> world.sq.hs.start ?sect:huashan ?rank:3 ?!flag:world.sq_huashan.started

=== dialog: world.sq.hs.reward
pace: slow
lock: true
do: learn:huashan.zixia unflag:world.sq_huashan.active flag:world.sq_huashan.done
---
穆清风听完孟寒山那句话，转过脸去，半晌没有作声。
穆清风：三十年……他总算肯认了。
穆清风：紫霞神功是本派的镇派心法，按门规，只传给能撑起华山门户的人。今日你撑起来了。
他屏退众人，在正气堂里把口诀传给了你。
（你学会了华山绝学紫霞神功。它是内功，内力绵长，与巧招相得。）

=== quest: world.q.sq_huashan
name: 华山绝学任务：了断旧怨
flag: world.sq_huashan.active
where: world.sq.hs_peak
---
穆清风的嘱托：被逐出师门的师叔孟寒山回到华山，在落雁峰顶等人比剑。胜了他，回正气堂回禀。

# ================= 唐门：夺回孔雀翎 =================

=== item: tangmen.kongque
name: 孔雀翎
slot: weapon
weapon: 暗器
bonus: 45
---
唐门的镇门暗器，一只金光灿灿的圆筒，筒身镂着孔雀开屏的花纹。按动机括，千百道光华同时射出。暗器类招式伤害 +45%。

=== enemy: world.sq.tm_thief
weapon: 暗器
weaponName: 毒蒺藜
name: 唐恨水
attrs: 根骨=19, 身法=24, 悟性=20
skills: tangmen.feihuang=90, tangmen.qianji=85, tangmen.kaibei=85, tangmen.xinfa=60
ai: 巧=3, 刚=1, 守=2
cunning: 40
obscure: 25
potential: 400
---
一个瘦长的汉子，脸色苍白，十根手指又细又长。唐家的子弟，二十年前因为偷学禁术被逐出唐家堡。

=== battle: world.sq.tm_fight
enemies: world.sq.tm_thief
adapt: true
win: world.sq.tm.won
---
唐恨水的十指间扣满了暗器：“唐家的东西，唐家人拿得，我就拿不得？”

=== dialog: world.sq.tm.start
pace: slow
lock: true
do: flag:world.sq_tangmen.active flag:world.sq_tangmen.started
---
唐姥姥把暗器房的门锁上，脸色铁青：
唐姥姥：孔雀翎丢了。暗器房的机关被人一层层拆开，拆得干净利落，只有唐家人才做得到。
唐姥姥：是唐恨水。二十年前被逐出去的那个畜生。他还没出蜀，就躲在竹林往西的断崖栈道上。
唐姥姥：孔雀翎落在外人手里，唐门在江湖上就抬不起头了。拿回来，死活不论。
（门派任务：去唐家堡竹林往西的断崖栈道，夺回孔雀翎。）

=== room: world.sq.tm_cliff
name: 蜀道·断崖栈道
exits: 东=tangmen.bamboo
---
栈道凿在悬崖上，木板朽了一半，底下是看不见底的深谷，风从谷底呼呼地往上吹。
?flag:world.sq_tangmen.won 栈道上的几块木板换成了新的，是唐门派人来修的。

=== patch: tangmen.bamboo
if: flag:world.sq_tangmen.started
exits: 西=world.sq.tm_cliff
---
?!flag:world.sq_tangmen.done 竹林西边连着一条凿在悬崖上的栈道。

=== trigger: world.sq.t.tm
room: world.sq.tm_cliff
if: flag:world.sq_tangmen.started !flag:world.sq_tangmen.won
dialog: world.sq.tm.meet

=== dialog: world.sq.tm.meet
pace: slow
---
栈道转角处，一个瘦长的汉子背靠崖壁坐着，手里把玩着一只金色的圆筒。
他抬起眼皮看了你一眼：“唐家堡派你来送死？”
* 夺回孔雀翎 !fight:world.sq.tm_fight
* 先退开

=== dialog: world.sq.tm.won
pace: slow
lock: true
do: flag:world.sq_tangmen.won
---
唐恨水靠着崖壁滑坐下去，孔雀翎从他手里滚落，被你一把接住。
他看着你手里的孔雀翎，惨然一笑：“二十年了……到头来，还是没能按一下这机括。”
（回唐家堡暗器房，把孔雀翎交还唐姥姥。）

=== patch: tangmen.laolao.talk
---
* 回禀：孔雀翎已经夺回 -> world.sq.tm.reward ?flag:world.sq_tangmen.won ?!flag:world.sq_tangmen.done
* 晚辈愿为唐门分忧（门派绝学任务） -> world.sq.tm.start ?sect:tangmen ?rank:3 ?!flag:world.sq_tangmen.started

=== dialog: world.sq.tm.reward
pace: slow
lock: true
do: give:tangmen.kongque unflag:world.sq_tangmen.active flag:world.sq_tangmen.done
---
唐姥姥接过孔雀翎，翻来覆去看了好一会儿，又把它放回你手里。
唐姥姥：机括里的东西一样没少。你没有偷偷按它，这就够了。
唐姥姥：孔雀翎锁在暗器房里，二十年才丢了这一回。与其再锁着，不如交给一个靠得住的人带着。拿去吧，别给唐家丢脸。
（你得到了唐门镇门暗器孔雀翎：暗器，暗器类招式伤害 +45%。装备后照样可以施展拳掌功夫。）

=== quest: world.q.sq_tangmen
name: 唐门绝学任务：夺回孔雀翎
flag: world.sq_tangmen.active
where: world.sq.tm_cliff
---
唐姥姥的嘱托：叛徒唐恨水盗走镇门暗器孔雀翎，躲在竹林往西的断崖栈道。夺回来，交还唐姥姥。
