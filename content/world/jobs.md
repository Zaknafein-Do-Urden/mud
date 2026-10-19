# 门派、衙门的新差事（D-124、D-125）。各门派师父、各城衙门的差事菜单从差事池里每天抽几件（?pick:池:差事）。
# 门派材料差事（D-125）不参加抽选：每天都能交一次，交 5~10 件指定的货（D-134，接差事时掷定件数）。
# 所有文字原创。

# ================= 丐帮 =================

=== dialog: gaibang.task.teahouse
do: flag:world.gaibang.task_teahouse
---
鲁有脚：清风茶楼人多嘴杂，最近有人在那儿打听本帮的事。你去坐一坐，听听是什么来路。
（门派任务：去清风茶楼）

=== trigger: world.t.gaibang_teahouse
room: linan.teahouse
if: flag:world.gaibang.task_teahouse
do: unflag:world.gaibang.task_teahouse today:world.gaibang.task_teahouse rep:gaibang:30 potential:10
---
你在茶楼角落要了一壶粗茶，听了半个时辰。打听丐帮的是两个外地镖师，想找人带路，并无恶意。（门派任务完成）

=== quest: world.q.gaibang_teahouse
name: 丐帮：茶楼里可有消息要打听
flag: world.gaibang.task_teahouse
where: linan.teahouse
---
鲁有脚的差遣：清风茶楼人多嘴杂，最近有人在那儿打听本帮的事。你去坐一坐，听听是什么来路。

=== dialog: gaibang.task.visit
do: flag:world.gaibang.task_visit
---
鲁有脚：嘉兴有几个本帮弟兄在客栈后院落脚。你去传个话：这个月的帮会改在城隍庙后殿。
（门派任务：去嘉兴烟雨客栈）

=== trigger: world.t.gaibang_visit
room: jiaxing.inn
if: flag:world.gaibang.task_visit
do: unflag:world.gaibang.task_visit today:world.gaibang.task_visit rep:gaibang:40 potential:15
---
你在客栈后院找到了那几个弟兄，把话传到。他们请你喝了一碗浑酒，叫你回去替他们问鲁长老好。（门派任务完成）

=== quest: world.q.gaibang_visit
name: 丐帮：嘉兴那边的弟兄可要人传话
flag: world.gaibang.task_visit
where: jiaxing.inn
---
鲁有脚的差遣：嘉兴有几个本帮弟兄在客栈后院落脚。你去传个话：这个月的帮会改在城隍庙后殿。

=== dialog: gaibang.task.buy
do: flag:world.gaibang.task_buy
---
鲁有脚：庙里的铁锅漏了。你去市集找打铁的老周，就说是丐帮要的，他会送一口新的来。
（门派任务：去临安市集）

=== trigger: world.t.gaibang_buy
room: linan.market
if: flag:world.gaibang.task_buy
do: unflag:world.gaibang.task_buy today:world.gaibang.task_buy rep:gaibang:30 potential:10
---
老周听说是丐帮要锅，连钱都不肯收，只说下回有人闹事，记得叫上他。（门派任务完成）

=== quest: world.q.gaibang_buy
name: 丐帮：帮里可缺什么东西
flag: world.gaibang.task_buy
where: linan.market
---
鲁有脚的差遣：庙里的铁锅漏了。你去市集找打铁的老周，就说是丐帮要的，他会送一口新的来。

=== dialog: gaibang.task.escort
do: flag:world.gaibang.task_escort
---
鲁有脚：有个小叫化要搭车回乡。他胆子小，你送他到车马行，看着他上车。
（门派任务：去临安车马行）

=== trigger: world.t.gaibang_escort
room: linan.station
if: flag:world.gaibang.task_escort
do: unflag:world.gaibang.task_escort today:world.gaibang.task_escort rep:gaibang:30 potential:10
---
你把小叫化送上马车，车把式答应路上照应他。小叫化趴在车窗上冲你挥手。（门派任务完成）

=== quest: world.q.gaibang_escort
name: 丐帮：可有小兄弟要人照看
flag: world.gaibang.task_escort
where: linan.station
---
鲁有脚的差遣：有个小叫化要搭车回乡。他胆子小，你送他到车马行，看着他上车。

=== enemy: world.foe.gaibang_rival
weapon: 棍
weaponName: 哨棒
name: 泼皮头
attrs: 根骨=16, 身法=15, 悟性=12
skills: base.quan=24, base.zhang=20, base.zhaojia=20, base.tuna=22
ai: 刚=2, 巧=2, 守=1
cunning: 15
potential: 30
---
一个歪戴帽子的泼皮头，手里拄着一根哨棒，正拦着两个小叫化。

=== dialog: gaibang.task.rival
do: flag:world.gaibang.task_rival
---
鲁有脚：钱塘门口有个泼皮头，专拦本帮弟兄要“过路钱”。去让他长长记性。
（门派任务：去钱塘门，对付泼皮头）

=== npc: world.npc.gaibang_rival
name: 泼皮头
brief: 鲁有脚要你去对付的人。
if: flag:world.gaibang.task_rival
talk: world.gaibang_rival.talk
---
一个歪戴帽子的泼皮头，手里拄着一根哨棒，正拦着两个小叫化。

=== dialog: world.gaibang_rival.talk
---
泼皮头：丐帮的？要饭的还挺横。
* 动手 !fight:world.b.gaibang_rival
* 走开

=== battle: world.b.gaibang_rival
enemies: world.foe.gaibang_rival
adapt: true
win: world.gaibang_rival.win
---
泼皮头把哨棒一抡，几个跟班也围了上来。

=== dialog: world.gaibang_rival.win
do: unflag:world.gaibang.task_rival today:world.gaibang.task_rival rep:gaibang:30
---
泼皮头抱着脑袋跑了，跟班们一哄而散。（门派任务完成）

=== patch: linan.gate
npcs: world.npc.gaibang_rival

=== quest: world.q.gaibang_rival
name: 丐帮：城门口可有人闹事
flag: world.gaibang.task_rival
where: linan.gate
---
鲁有脚的差遣：钱塘门口有个泼皮头，专拦本帮弟兄要“过路钱”。去让他长长记性。

=== enemy: world.foe.gaibang_hunt
weapon: 刀
weaponName: 短刀
name: 人贩子
attrs: 根骨=18, 身法=17, 悟性=13
skills: base.dao=38, base.quan=40, base.zhang=36, base.zhaojia=34, base.tuna=38
ai: 刚=3, 巧=2, 守=1
cunning: 20
potential: 55
---
一个面色蜡黄的汉子赶着一辆骡车，车篷里隐隐有孩子的哭声。

=== dialog: gaibang.task.hunt
do: flag:world.gaibang.task_hunt
---
鲁有脚：城外官道上有个人贩子，拐了两个孩子，想卖到北边去。你去截住他，把孩子带回来。
（门派任务：去城外官道，对付人贩子）

=== npc: world.npc.gaibang_hunt
name: 人贩子
brief: 鲁有脚要你去对付的人。
if: flag:world.gaibang.task_hunt
talk: world.gaibang_hunt.talk
---
一个面色蜡黄的汉子赶着一辆骡车，车篷里隐隐有孩子的哭声。

=== dialog: world.gaibang_hunt.talk
---
人贩子：少管闲事，这是我花钱买来的。
* 动手 !fight:world.b.gaibang_hunt
* 走开

=== battle: world.b.gaibang_hunt
enemies: world.foe.gaibang_hunt, world.foe.gaibang_hunt
adapt: true
win: world.gaibang_hunt.win
---
人贩子从车辕上抽出短刀，车夫也跳了下来。

=== dialog: world.gaibang_hunt.win
do: unflag:world.gaibang.task_hunt today:world.gaibang.task_hunt rep:gaibang:60
---
你打倒了人贩子，掀开车篷，两个孩子哭着扑了出来。（门派任务完成）

=== patch: linan.road
npcs: world.npc.gaibang_hunt

=== quest: world.q.gaibang_hunt
name: 丐帮：可有棘手的人要对付
flag: world.gaibang.task_hunt
where: linan.road
---
鲁有脚的差遣：城外官道上有个人贩子，拐了两个孩子，想卖到北边去。你去截住他，把孩子带回来。

=== dialog: gaibang.task.material_ask
do: flag:world.gaibang.task_material_on roll:world.gaibang.material:5~10
---
鲁有脚：入冬了，城里城外的弟兄们还穿着单衣。你要是跑商路过长安，捎几件皮货回来，帮里记你一功。
（门派材料差事：交纳皮货 {@world.gaibang.material} 件，每天可交一次。货在马车上就行，不用搬来。）

=== dialog: gaibang.task.material
do: unflag:world.gaibang.task_material_on deliver:fur:@world.gaibang.material today:world.gaibang.task_material rep:gaibang:40 potential:15
---
鲁有脚让几个小叫化把皮货一捆捆搬进庙里，拍着你的肩膀笑道：“好！今年冬天，弟兄们不用抱着稻草过夜了。”
（门派材料差事完成）

=== quest: world.q.gaibang_material
name: 丐帮：交纳皮货
flag: world.gaibang.task_material_on
where: linan.temple
---
鲁有脚的差遣：跑商捎 {@world.gaibang.material} 件皮货回来，车上凑够了回去找鲁有脚交上（每天可交一次）。

# ================= 少林 =================

=== dialog: shaolin.task.herb
do: flag:world.shaolin.task_herb
---
慧明禅师：药王院的师兄病了，后山的药圃没人照看。你去拔拔草，看看有没有被野猪拱坏。
（门派任务：去少林后山）

=== trigger: world.t.shaolin_herb
room: shaolin.hill
if: flag:world.shaolin.task_herb
do: unflag:world.shaolin.task_herb today:world.shaolin.task_herb rep:shaolin:30 potential:10
---
你在药圃里忙了半日，补好了被野猪拱塌的篱笆。（门派任务完成）

=== quest: world.q.shaolin_herb
name: 少林：后山的药圃可要人照看
flag: world.shaolin.task_herb
where: shaolin.hill
---
慧明禅师的差遣：药王院的师兄病了，后山的药圃没人照看。你去拔拔草，看看有没有被野猪拱坏。

=== dialog: shaolin.task.visit
do: flag:world.shaolin.task_visit
---
慧明禅师：华山的道长借了本寺一部《金刚经》的注本，抄完了。你替我送还给玉泉院，顺道问个好。
（门派任务：去华山玉泉院）

=== trigger: world.t.shaolin_visit
room: huashan.gate
if: flag:world.shaolin.task_visit
do: unflag:world.shaolin.task_visit today:world.shaolin.task_visit rep:shaolin:40 potential:15
---
玉泉院的道人接过经卷，翻开看了一眼，郑重地包好。（门派任务完成）

=== quest: world.q.shaolin_visit
name: 少林：可有经卷要送往别处
flag: world.shaolin.task_visit
where: huashan.gate
---
慧明禅师的差遣：华山的道长借了本寺一部《金刚经》的注本，抄完了。你替我送还给玉泉院，顺道问个好。

=== dialog: shaolin.task.buy
do: flag:world.shaolin.task_buy
---
慧明禅师：香积厨的灯油快用完了。你进城去市集，找卖油的刘施主，记在寺里的账上。
（门派任务：去洛阳南市）

=== trigger: world.t.shaolin_buy
room: luoyang.market
if: flag:world.shaolin.task_buy
do: unflag:world.shaolin.task_buy today:world.shaolin.task_buy rep:shaolin:30 potential:10
---
刘施主答应明日一早就把灯油送上山。（门派任务完成）

=== quest: world.q.shaolin_buy
name: 少林：寺里可缺什么东西
flag: world.shaolin.task_buy
where: luoyang.market
---
慧明禅师的差遣：香积厨的灯油快用完了。你进城去市集，找卖油的刘施主，记在寺里的账上。

=== dialog: shaolin.task.escort
do: flag:world.shaolin.task_escort
---
慧明禅师：有位老施主上山还愿，下山时腿脚不便。你陪他到洛阳车马行。
（门派任务：去洛阳车马行）

=== trigger: world.t.shaolin_escort
room: luoyang.station
if: flag:world.shaolin.task_escort
do: unflag:world.shaolin.task_escort today:world.shaolin.task_escort rep:shaolin:30 potential:10
---
你扶着老施主上了马车。老施主一定要塞给你一包点心，你推辞不过，只好收下。（门派任务完成）

=== quest: world.q.shaolin_escort
name: 少林：可有香客要人护送
flag: world.shaolin.task_escort
where: luoyang.station
---
慧明禅师的差遣：有位老施主上山还愿，下山时腿脚不便。你陪他到洛阳车马行。

=== enemy: world.foe.shaolin_rival
weapon: 拳
name: 外来武师
attrs: 根骨=16, 身法=15, 悟性=12
skills: base.quan=24, base.zhang=20, base.zhaojia=20, base.tuna=22
ai: 刚=2, 巧=2, 守=1
cunning: 15
potential: 30
---
一个精壮的武师叉腰站在山门前，嗓门大得半山腰都听得见。

=== dialog: shaolin.task.rival
do: flag:world.shaolin.task_rival
---
慧明禅师：山门外来了个武师，指名要和本寺弟子比划，说少林徒有虚名。去会会他，点到为止。
（门派任务：去少林山门，对付外来武师）

=== npc: world.npc.shaolin_rival
name: 外来武师
brief: 慧明禅师要你去对付的人。
if: flag:world.shaolin.task_rival
talk: world.shaolin_rival.talk
---
一个精壮的武师叉腰站在山门前，嗓门大得半山腰都听得见。

=== dialog: world.shaolin_rival.talk
---
外来武师：少林的？来来来，让我看看是不是真有本事。
* 动手 !fight:world.b.shaolin_rival
* 走开

=== battle: world.b.shaolin_rival
enemies: world.foe.shaolin_rival
adapt: true
win: world.shaolin_rival.win
---
外来武师扎了个马步，双拳一错，迎了上来。

=== dialog: world.shaolin_rival.win
do: unflag:world.shaolin.task_rival today:world.shaolin.task_rival rep:shaolin:30
---
外来武师揉着胳膊，抱拳道：“佩服。”（门派任务完成）

=== patch: shaolin.gate
npcs: world.npc.shaolin_rival

=== quest: world.q.shaolin_rival
name: 少林：山门外可有人生事
flag: world.shaolin.task_rival
where: shaolin.gate
---
慧明禅师的差遣：山门外来了个武师，指名要和本寺弟子比划，说少林徒有虚名。去会会他，点到为止。

=== enemy: world.foe.shaolin_hunt
weapon: 刀
weaponName: 柴刀
name: 盗林贼
attrs: 根骨=18, 身法=17, 悟性=13
skills: base.dao=38, base.quan=40, base.zhang=36, base.zhaojia=34, base.tuna=38
ai: 刚=3, 巧=2, 守=1
cunning: 20
potential: 55
---
几个汉子扛着锯子和绳索，正围着一棵老柏树比划。

=== dialog: shaolin.task.hunt
do: flag:world.shaolin.task_hunt
---
慧明禅师：有一伙人趁夜到后山盗伐寺里的古柏，已经倒了三棵。你去把他们赶走。
（门派任务：去少林后山，对付盗林贼）

=== npc: world.npc.shaolin_hunt
name: 盗林贼
brief: 慧明禅师要你去对付的人。
if: flag:world.shaolin.task_hunt
talk: world.shaolin_hunt.talk
---
几个汉子扛着锯子和绳索，正围着一棵老柏树比划。

=== dialog: world.shaolin_hunt.talk
---
盗林贼：和尚管天管地，还管得了砍柴？
* 动手 !fight:world.b.shaolin_hunt
* 走开

=== battle: world.b.shaolin_hunt
enemies: world.foe.shaolin_hunt, world.foe.shaolin_hunt
adapt: true
win: world.shaolin_hunt.win
---
盗林贼扔下锯子，抄起柴刀扑了过来。

=== dialog: world.shaolin_hunt.win
do: unflag:world.shaolin.task_hunt today:world.shaolin.task_hunt rep:shaolin:60
---
盗林贼丢下锯子绳索，连滚带爬下了山。（门派任务完成）

=== patch: shaolin.hill
npcs: world.npc.shaolin_hunt

=== quest: world.q.shaolin_hunt
name: 少林：可有棘手的差事
flag: world.shaolin.task_hunt
where: shaolin.hill
---
慧明禅师的差遣：有一伙人趁夜到后山盗伐寺里的古柏，已经倒了三棵。你去把他们赶走。

=== dialog: shaolin.task.material_ask
do: flag:world.shaolin.task_material_on roll:world.shaolin.material:5~10
---
慧明禅师：寺里禅堂坐香，向来以茶提神。今年山上的茶树遭了霜，你若跑商，带几件茶叶上山，便是一桩功德。
（门派材料差事：交纳茶叶 {@world.shaolin.material} 件，每天可交一次。货在马车上就行，不用搬来。）

=== dialog: shaolin.task.material
do: unflag:world.shaolin.task_material_on deliver:tea:@world.shaolin.material today:world.shaolin.task_material rep:shaolin:40 potential:15
---
慧明禅师命知客僧把茶叶收进库房，合十道：“阿弥陀佛，这一季禅堂的茶不缺了。”
（门派材料差事完成）

=== quest: world.q.shaolin_material
name: 少林：交纳茶叶
flag: world.shaolin.task_material_on
where: shaolin.hall
---
慧明禅师的差遣：跑商捎 {@world.shaolin.material} 件茶叶回来，车上凑够了回去找慧明禅师交上（每天可交一次）。

# ================= 武当 =================

=== dialog: wudang.task.herb
do: flag:world.wudang.task_herb
---
清虚道长：密林深处长着几株七叶一枝花，正是采的时候。你去采几株回来，别连根拔了。
（门派任务：去武当密林）

=== trigger: world.t.wudang_herb
room: wudang.forest
if: flag:world.wudang.task_herb
do: unflag:world.wudang.task_herb today:world.wudang.task_herb rep:wudang:30 potential:10
---
你在密林里找到了那几株七叶一枝花，小心地掐下花叶，留着根。（门派任务完成）

=== quest: world.q.wudang_herb
name: 武当：山里可要采药
flag: world.wudang.task_herb
where: wudang.forest
---
清虚道长的差遣：密林深处长着几株七叶一枝花，正是采的时候。你去采几株回来，别连根拔了。

=== dialog: wudang.task.visit
do: flag:world.wudang.task_visit
---
清虚道长：中秋将近，替我把这张拜帖送到少林山门，问候方丈。
（门派任务：去少林山门）

=== trigger: world.t.wudang_visit
room: shaolin.gate
if: flag:world.wudang.task_visit
do: unflag:world.wudang.task_visit today:world.wudang.task_visit rep:wudang:40 potential:15
---
知客僧接过拜帖，请你喝了一杯清茶，送你出了山门。（门派任务完成）

=== quest: world.q.wudang_visit
name: 武当：可有拜帖要送
flag: world.wudang.task_visit
where: shaolin.gate
---
清虚道长的差遣：中秋将近，替我把这张拜帖送到少林山门，问候方丈。

=== dialog: wudang.task.buy
do: flag:world.wudang.task_buy
---
清虚道长：观里写符的朱砂用完了。你去襄阳樊城集，找药铺的孙掌柜，他知道要哪一种。
（门派任务：去襄阳樊城集）

=== trigger: world.t.wudang_buy
room: xiangyang.market
if: flag:world.wudang.task_buy
do: unflag:world.wudang.task_buy today:world.wudang.task_buy rep:wudang:30 potential:10
---
孙掌柜包了两包上好的辰砂，说下个月再给观里留着。（门派任务完成）

=== quest: world.q.wudang_buy
name: 武当：观里可缺什么东西
flag: world.wudang.task_buy
where: xiangyang.market
---
清虚道长的差遣：观里写符的朱砂用完了。你去襄阳樊城集，找药铺的孙掌柜，他知道要哪一种。

=== dialog: wudang.task.escort
do: flag:world.wudang.task_escort
---
清虚道长：你明月师弟要回乡探母，他第一次下山，你送他到襄阳车马行。
（门派任务：去襄阳车马行）

=== trigger: world.t.wudang_escort
room: xiangyang.station
if: flag:world.wudang.task_escort
do: unflag:world.wudang.task_escort today:world.wudang.task_escort rep:wudang:30 potential:10
---
明月师弟上了车，又探出头来叮嘱你替他照看后院那几盆兰花。（门派任务完成）

=== quest: world.q.wudang_escort
name: 武当：可有师弟要下山
flag: world.wudang.task_escort
where: xiangyang.station
---
清虚道长的差遣：你明月师弟要回乡探母，他第一次下山，你送他到襄阳车马行。

=== enemy: world.foe.wudang_rival
weapon: 剑
weaponName: 铁剑
name: 醉道人
attrs: 根骨=16, 身法=15, 悟性=12
skills: base.jian=22, base.quan=24, base.zhang=20, base.zhaojia=20, base.tuna=22
ai: 刚=2, 巧=2, 守=1
cunning: 15
potential: 30
---
一个邋遢道人斜靠在牌坊下，酒葫芦挂在剑柄上，正拉着香客说个不停。

=== dialog: wudang.task.rival
do: flag:world.wudang.task_rival
---
清虚道长：玄岳门外有个野道人喝醉了酒，冒充本派弟子向香客化缘。去把他请走。
（门派任务：去玄岳门，对付醉道人）

=== npc: world.npc.wudang_rival
name: 醉道人
brief: 清虚道长要你去对付的人。
if: flag:world.wudang.task_rival
talk: world.wudang_rival.talk
---
一个邋遢道人斜靠在牌坊下，酒葫芦挂在剑柄上，正拉着香客说个不停。

=== dialog: world.wudang_rival.talk
---
醉道人：嘿嘿，我也是武当的，不信？吃我一剑！
* 动手 !fight:world.b.wudang_rival
* 走开

=== battle: world.b.wudang_rival
enemies: world.foe.wudang_rival
adapt: true
win: world.wudang_rival.win
---
醉道人歪歪斜斜地拔出铁剑，剑尖却稳得出奇。

=== dialog: world.wudang_rival.win
do: unflag:world.wudang.task_rival today:world.wudang.task_rival rep:wudang:30
---
醉道人酒醒了大半，红着脸走了。（门派任务完成）

=== patch: wudang.gate
npcs: world.npc.wudang_rival

=== quest: world.q.wudang_rival
name: 武当：山门前可有人闹事
flag: world.wudang.task_rival
where: wudang.gate
---
清虚道长的差遣：玄岳门外有个野道人喝醉了酒，冒充本派弟子向香客化缘。去把他请走。

=== enemy: world.foe.wudang_hunt
weapon: 匕首
weaponName: 匕首
name: 偷丹贼
attrs: 根骨=18, 身法=17, 悟性=13
skills: base.quan=40, base.zhang=36, base.zhaojia=34, base.tuna=38
ai: 刚=3, 巧=2, 守=1
cunning: 20
potential: 55
---
一个黑衣人蹲在树后，正就着月光数一只锦囊里的丹丸。

=== dialog: wudang.task.hunt
do: flag:world.wudang.task_hunt
---
清虚道长：丹房丢了一炉九转丹，脚印往密林里去了。你追过去，把丹药追回来。
（门派任务：去武当密林，对付偷丹贼）

=== npc: world.npc.wudang_hunt
name: 偷丹贼
brief: 清虚道长要你去对付的人。
if: flag:world.wudang.task_hunt
talk: world.wudang_hunt.talk
---
一个黑衣人蹲在树后，正就着月光数一只锦囊里的丹丸。

=== dialog: world.wudang_hunt.talk
---
偷丹贼：武当的丹药，吃了能长功力？给我也尝尝。
* 动手 !fight:world.b.wudang_hunt
* 走开

=== battle: world.b.wudang_hunt
enemies: world.foe.wudang_hunt, world.foe.wudang_hunt
adapt: true
win: world.wudang_hunt.win
---
偷丹贼把锦囊往怀里一塞，匕首寒光一闪。

=== dialog: world.wudang_hunt.win
do: unflag:world.wudang.task_hunt today:world.wudang.task_hunt rep:wudang:60
---
你从偷丹贼怀里搜出锦囊，丹丸一颗不少。（门派任务完成）

=== patch: wudang.forest
npcs: world.npc.wudang_hunt

=== quest: world.q.wudang_hunt
name: 武当：可有棘手的差事
flag: world.wudang.task_hunt
where: wudang.forest
---
清虚道长的差遣：丹房丢了一炉九转丹，脚印往密林里去了。你追过去，把丹药追回来。

=== dialog: wudang.task.material_ask
do: flag:world.wudang.task_material_on roll:world.wudang.material:5~10
---
清虚道长：丹房里盛药的瓷瓶，碎的碎、裂的裂。洛阳的瓷器最好，你若跑商，捎几件上山。
（门派材料差事：交纳瓷器 {@world.wudang.material} 件，每天可交一次。货在马车上就行，不用搬来。）

=== dialog: wudang.task.material
do: unflag:world.wudang.task_material_on deliver:porcelain:@world.wudang.material today:world.wudang.task_material rep:wudang:40 potential:15
---
清虚道长拿起一只瓷瓶对着光看了看，点头道：“釉色匀净，好。”命道童一一收进丹房。
（门派材料差事完成）

=== quest: world.q.wudang_material
name: 武当：交纳瓷器
flag: world.wudang.task_material_on
where: wudang.hall
---
清虚道长的差遣：跑商捎 {@world.wudang.material} 件瓷器回来，车上凑够了回去找清虚道长交上（每天可交一次）。

# ================= 华山 =================

=== dialog: huashan.task.herb
do: flag:world.huashan.task_herb
---
穆清风：苍龙岭的石缝里长着华山参，配伤药用得着。小心脚下，那条岭不是闹着玩的。
（门派任务：去苍龙岭）

=== trigger: world.t.huashan_herb
room: huashan.cliff
if: flag:world.huashan.task_herb
do: unflag:world.huashan.task_herb today:world.huashan.task_herb rep:huashan:30 potential:10
---
你贴着岩壁挪过去，从石缝里挖出两根华山参，后背全是冷汗。（门派任务完成）

=== quest: world.q.huashan_herb
name: 华山：山上可要采药
flag: world.huashan.task_herb
where: huashan.cliff
---
穆清风的差遣：苍龙岭的石缝里长着华山参，配伤药用得着。小心脚下，那条岭不是闹着玩的。

=== dialog: huashan.task.visit
do: flag:world.huashan.task_visit
---
穆清风：一位远房师叔从江南来，在洛阳牡丹客栈落脚。你去接一接，告诉他山上的路。
（门派任务：去洛阳牡丹客栈）

=== trigger: world.t.huashan_visit
room: luoyang.inn
if: flag:world.huashan.task_visit
do: unflag:world.huashan.task_visit today:world.huashan.task_visit rep:huashan:40 potential:15
---
师叔是个和气的老人，听你说了山上的近况，捋着胡子说过几日就上山。（门派任务完成）

=== quest: world.q.huashan_visit
name: 华山：可有人要接
flag: world.huashan.task_visit
where: luoyang.inn
---
穆清风的差遣：一位远房师叔从江南来，在洛阳牡丹客栈落脚。你去接一接，告诉他山上的路。

=== dialog: huashan.task.buy
do: flag:world.huashan.task_buy
---
穆清风：练功房的木人桩散了架。你去长安西市找木匠，订三副新的。
（门派任务：去长安西市）

=== trigger: world.t.huashan_buy
room: changan.market
if: flag:world.huashan.task_buy
do: unflag:world.huashan.task_buy today:world.huashan.task_buy rep:huashan:30 potential:10
---
木匠量了尺寸，说十天之内送上山。（门派任务完成）

=== quest: world.q.huashan_buy
name: 华山：派里可缺什么东西
flag: world.huashan.task_buy
where: changan.market
---
穆清风的差遣：练功房的木人桩散了架。你去长安西市找木匠，订三副新的。

=== dialog: huashan.task.escort
do: flag:world.huashan.task_escort
---
穆清风：你小师妹要去江南看望家人。她剑法还没练成，你送她到长安车马行。
（门派任务：去长安车马行）

=== trigger: world.t.huashan_escort
room: changan.station
if: flag:world.huashan.task_escort
do: unflag:world.huashan.task_escort today:world.huashan.task_escort rep:huashan:30 potential:10
---
小师妹上车前塞给你一包她自己炒的瓜子，叫你别告诉师父。（门派任务完成）

=== quest: world.q.huashan_escort
name: 华山：可有师妹要下山
flag: world.huashan.task_escort
where: changan.station
---
穆清风的差遣：你小师妹要去江南看望家人。她剑法还没练成，你送她到长安车马行。

=== enemy: world.foe.huashan_rival
weapon: 剑
weaponName: 长剑
name: 挑衅剑客
attrs: 根骨=16, 身法=15, 悟性=12
skills: base.jian=22, base.quan=24, base.zhang=20, base.zhaojia=20, base.tuna=22
ai: 刚=2, 巧=2, 守=1
cunning: 15
potential: 30
---
一个白衣剑客抱剑站在院门外，下巴抬得老高。

=== dialog: huashan.task.rival
do: flag:world.huashan.task_rival
---
穆清风：有个剑客在玉泉院外叫阵，说华山剑法不过如此。去让他见识见识。
（门派任务：去玉泉院，对付挑衅剑客）

=== npc: world.npc.huashan_rival
name: 挑衅剑客
brief: 穆清风要你去对付的人。
if: flag:world.huashan.task_rival
talk: world.huashan_rival.talk
---
一个白衣剑客抱剑站在院门外，下巴抬得老高。

=== dialog: world.huashan_rival.talk
---
挑衅剑客：华山派就派你这样的出来？
* 动手 !fight:world.b.huashan_rival
* 走开

=== battle: world.b.huashan_rival
enemies: world.foe.huashan_rival
adapt: true
win: world.huashan_rival.win
---
挑衅剑客长剑出鞘，剑花一抖，抢先攻了上来。

=== dialog: world.huashan_rival.win
do: unflag:world.huashan.task_rival today:world.huashan.task_rival rep:huashan:30
---
挑衅剑客收剑入鞘，一言不发地走了。（门派任务完成）

=== patch: huashan.gate
npcs: world.npc.huashan_rival

=== quest: world.q.huashan_rival
name: 华山：山下可有人挑衅
flag: world.huashan.task_rival
where: huashan.gate
---
穆清风的差遣：有个剑客在玉泉院外叫阵，说华山剑法不过如此。去让他见识见识。

=== enemy: world.foe.huashan_hunt
weapon: 刀
weaponName: 钢刀
name: 采花贼
attrs: 根骨=18, 身法=17, 悟性=13
skills: base.dao=38, base.quan=40, base.zhang=36, base.zhaojia=34, base.tuna=38
ai: 刚=3, 巧=2, 守=1
cunning: 20
potential: 55
---
一个油头粉面的汉子躲在岩石后面，腰里插着一把钢刀。

=== dialog: huashan.task.hunt
do: flag:world.huashan.task_hunt
---
穆清风：有个采花贼躲进了山里，官府追不上来。你去苍龙岭一带搜一搜。
（门派任务：去苍龙岭，对付采花贼）

=== npc: world.npc.huashan_hunt
name: 采花贼
brief: 穆清风要你去对付的人。
if: flag:world.huashan.task_hunt
talk: world.huashan_hunt.talk
---
一个油头粉面的汉子躲在岩石后面，腰里插着一把钢刀。

=== dialog: world.huashan_hunt.talk
---
采花贼：小子，这条岭上掉下去可就没命了。
* 动手 !fight:world.b.huashan_hunt
* 走开

=== battle: world.b.huashan_hunt
enemies: world.foe.huashan_hunt, world.foe.huashan_hunt
adapt: true
win: world.huashan_hunt.win
---
采花贼抽出钢刀，借着山势扑了下来。

=== dialog: world.huashan_hunt.win
do: unflag:world.huashan.task_hunt today:world.huashan.task_hunt rep:huashan:60
---
你把采花贼捆了个结实，交给山下的官差。（门派任务完成）

=== patch: huashan.cliff
npcs: world.npc.huashan_hunt

=== quest: world.q.huashan_hunt
name: 华山：可有棘手的差事
flag: world.huashan.task_hunt
where: huashan.cliff
---
穆清风的差遣：有个采花贼躲进了山里，官府追不上来。你去苍龙岭一带搜一搜。

=== dialog: huashan.task.material_ask
do: flag:world.huashan.task_material_on roll:world.huashan.material:5~10
---
穆清风：练剑难免受伤，派里的金创药快配不出来了。你若跑商，从襄阳或成都捎几件药材回来。
（门派材料差事：交纳药材 {@world.huashan.material} 件，每天可交一次。货在马车上就行，不用搬来。）

=== dialog: huashan.task.material
do: unflag:world.huashan.task_material_on deliver:herbs:@world.huashan.material today:world.huashan.task_material rep:huashan:40 potential:15
---
穆清风让弟子把药材抬进库房，难得露出笑容：“这一季练剑，弟子们放心了。”
（门派材料差事完成）

=== quest: world.q.huashan_material
name: 华山：交纳药材
flag: world.huashan.task_material_on
where: huashan.hall
---
穆清风的差遣：跑商捎 {@world.huashan.material} 件药材回来，车上凑够了回去找穆清风交上（每天可交一次）。

# ================= 唐门 =================

=== dialog: tangmen.task.herb
do: flag:world.tangmen.task_herb
---
唐姥姥：竹林里那几丛断肠草该收了。戴上手套，别沾了汁水，不然有你受的。
（门派任务：去唐家竹林）

=== trigger: world.t.tangmen_herb
room: tangmen.bamboo
if: flag:world.tangmen.task_herb
do: unflag:world.tangmen.task_herb today:world.tangmen.task_herb rep:tangmen:30 potential:10
---
你戴着鹿皮手套割下断肠草，一片叶子都没碰到皮肉。（门派任务完成）

=== quest: world.q.tangmen_herb
name: 唐门：竹林里可要采药
flag: world.tangmen.task_herb
where: tangmen.bamboo
---
唐姥姥的差遣：竹林里那几丛断肠草该收了。戴上手套，别沾了汁水，不然有你受的。

=== dialog: tangmen.task.visit
do: flag:world.tangmen.task_visit
---
唐姥姥：有个外省的客商在成都芙蓉客栈，要订一批机括。你去问清楚要几件、什么时候要，别多嘴。
（门派任务：去成都芙蓉客栈）

=== trigger: world.t.tangmen_visit
room: chengdu.inn
if: flag:world.tangmen.task_visit
do: unflag:world.tangmen.task_visit today:world.tangmen.task_visit rep:tangmen:40 potential:15
---
客商要的东西不多，出手倒是阔绰。你记下了尺寸和日子，什么也没多问。（门派任务完成）

=== quest: world.q.tangmen_visit
name: 唐门：可有客人要接
flag: world.tangmen.task_visit
where: chengdu.inn
---
唐姥姥的差遣：有个外省的客商在成都芙蓉客栈，要订一批机括。你去问清楚要几件、什么时候要，别多嘴。

=== dialog: tangmen.task.buy
do: flag:world.tangmen.task_buy
---
唐姥姥：暗器房的鹿皮手套磨破了。去成都锦官市买二十副，挑厚的。
（门派任务：去成都锦官市）

=== trigger: world.t.tangmen_buy
room: chengdu.market
if: flag:world.tangmen.task_buy
do: unflag:world.tangmen.task_buy today:world.tangmen.task_buy rep:tangmen:30 potential:10
---
你挑了二十副最厚的鹿皮手套，掌柜还送了一副给你。（门派任务完成）

=== quest: world.q.tangmen_buy
name: 唐门：堡里可缺什么东西
flag: world.tangmen.task_buy
where: chengdu.market
---
唐姥姥的差遣：暗器房的鹿皮手套磨破了。去成都锦官市买二十副，挑厚的。

=== dialog: tangmen.task.escort
do: flag:world.tangmen.task_escort
---
唐姥姥：你七叔要出蜀办事，身上带着要紧东西。你送他到成都车马行。
（门派任务：去成都车马行）

=== trigger: world.t.tangmen_escort
room: chengdu.station
if: flag:world.tangmen.task_escort
do: unflag:world.tangmen.task_escort today:world.tangmen.task_escort rep:tangmen:30 potential:10
---
七叔一路没说话，上车前才回头说了一句：“好。”（门派任务完成）

=== quest: world.q.tangmen_escort
name: 唐门：可有族人要出远门
flag: world.tangmen.task_escort
where: chengdu.station
---
唐姥姥的差遣：你七叔要出蜀办事，身上带着要紧东西。你送他到成都车马行。

=== enemy: world.foe.tangmen_rival
weapon: 匕首
weaponName: 匕首
name: 偷艺人
attrs: 根骨=16, 身法=15, 悟性=12
skills: base.quan=24, base.zhang=20, base.zhaojia=20, base.tuna=22
ai: 刚=2, 巧=2, 守=1
cunning: 15
potential: 30
---
一个货郎打扮的人在堡门外转悠，担子里的货一样没卖出去。

=== dialog: tangmen.task.rival
do: flag:world.tangmen.task_rival
---
唐姥姥：堡门外有人鬼鬼祟祟转了两天，想偷看暗器房。把他赶走，别让他活着回去——算了，赶走就行。
（门派任务：去唐家堡门，对付偷艺人）

=== npc: world.npc.tangmen_rival
name: 偷艺人
brief: 唐姥姥要你去对付的人。
if: flag:world.tangmen.task_rival
talk: world.tangmen_rival.talk
---
一个货郎打扮的人在堡门外转悠，担子里的货一样没卖出去。

=== dialog: world.tangmen_rival.talk
---
偷艺人：我、我是卖针线的……
* 动手 !fight:world.b.tangmen_rival
* 走开

=== battle: world.b.tangmen_rival
enemies: world.foe.tangmen_rival
adapt: true
win: world.tangmen_rival.win
---
偷艺人扔下担子，从扁担里抽出一把匕首。

=== dialog: world.tangmen_rival.win
do: unflag:world.tangmen.task_rival today:world.tangmen.task_rival rep:tangmen:30
---
偷艺人丢下担子跑了，担子底下藏着一卷画了一半的机括图。（门派任务完成）

=== patch: tangmen.gate
npcs: world.npc.tangmen_rival

=== quest: world.q.tangmen_rival
name: 唐门：堡外可有人窥探
flag: world.tangmen.task_rival
where: tangmen.gate
---
唐姥姥的差遣：堡门外有人鬼鬼祟祟转了两天，想偷看暗器房。把他赶走，别让他活着回去——算了，赶走就行。

=== enemy: world.foe.tangmen_hunt
weapon: 刀
weaponName: 短刀
name: 叛徒同党
attrs: 根骨=18, 身法=17, 悟性=13
skills: base.dao=38, base.quan=40, base.zhang=36, base.zhaojia=34, base.tuna=38
ai: 刚=3, 巧=2, 守=1
cunning: 20
potential: 55
---
竹林深处有人压低了声音说话，竹叶簌簌地响。

=== dialog: tangmen.task.hunt
do: flag:world.tangmen.task_hunt
---
唐姥姥：前些日子叛出唐门的那个畜生，还有同党在竹林里接应。去把人揪出来。
（门派任务：去唐家竹林，对付叛徒同党）

=== npc: world.npc.tangmen_hunt
name: 叛徒同党
brief: 唐姥姥要你去对付的人。
if: flag:world.tangmen.task_hunt
talk: world.tangmen_hunt.talk
---
竹林深处有人压低了声音说话，竹叶簌簌地响。

=== dialog: world.tangmen_hunt.talk
---
叛徒同党：唐家的狗鼻子倒灵。
* 动手 !fight:world.b.tangmen_hunt
* 走开

=== battle: world.b.tangmen_hunt
enemies: world.foe.tangmen_hunt, world.foe.tangmen_hunt
adapt: true
win: world.tangmen_hunt.win
---
两个汉子从竹丛里钻出来，短刀一左一右。

=== dialog: world.tangmen_hunt.win
do: unflag:world.tangmen.task_hunt today:world.tangmen.task_hunt rep:tangmen:60
---
你制住了两人，从他们身上搜出一封没送出去的密信。（门派任务完成）

=== patch: tangmen.bamboo
npcs: world.npc.tangmen_hunt

=== quest: world.q.tangmen_hunt
name: 唐门：可有棘手的差事
flag: world.tangmen.task_hunt
where: tangmen.bamboo
---
唐姥姥的差遣：前些日子叛出唐门的那个畜生，还有同党在竹林里接应。去把人揪出来。

=== dialog: tangmen.task.material_ask
do: flag:world.tangmen.task_material_on roll:world.tangmen.material:5~10
---
唐姥姥：暗器房缺好铁。蜀中的铁脆，打不出好针好镖。你跑商路过襄阳、洛阳，捎几件铁器回来。
（门派材料差事：交纳铁器 {@world.tangmen.material} 件，每天可交一次。货在马车上就行，不用搬来。）

=== dialog: tangmen.task.material
do: unflag:world.tangmen.task_material_on deliver:iron:@world.tangmen.material today:world.tangmen.task_material rep:tangmen:40 potential:15
---
唐姥姥拿起一块铁掂了掂，用指甲一弹，听了听声音，满意地点点头：“是好铁。”
（门派材料差事完成）

=== quest: world.q.tangmen_material
name: 唐门：交纳铁器
flag: world.tangmen.task_material_on
where: tangmen.hall
---
唐姥姥的差遣：跑商捎 {@world.tangmen.material} 件铁器回来，车上凑够了回去找唐姥姥交上（每天可交一次）。

=== enemy: world.foe.job_drunk
weapon: 拳
name: 醉汉
attrs: 根骨=17, 身法=12, 悟性=8
skills: base.quan=26, base.zhaojia=20, base.tuna=22
ai: 刚=4, 守=1
potential: 30
---
喝得满脸通红的汉子，脚下打晃，拳头却不轻。

=== enemy: world.foe.job_kidnapper
weapon: 刀
weaponName: 短刀
name: 拐子
attrs: 根骨=15, 身法=17, 悟性=13
skills: base.dao=30, base.quan=26, base.zhaojia=24, base.tuna=26
ai: 巧=3, 刚=1, 守=1
cunning: 25
potential: 40
weaponBonus: 60
---
一个笑眯眯的中年人，手里总拿着几块糖，眼睛却从不笑。

# ================= 临安衙门 =================

=== dialog: linan.job.notice
do: flag:world.job.notice_linan
---
张捕头：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.linan_notice
room: linan.street
if: flag:world.job.notice_linan
do: unflag:world.job.notice_linan today:world.job.notice_linan money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.linan_notice
name: 临安衙门：可有告示要张贴
flag: world.job.notice_linan
where: linan.street
---
临安衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: linan.job.ledger
do: flag:world.job.ledger_linan
---
张捕头：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.linan_ledger
room: linan.bank
if: flag:world.job.ledger_linan
do: unflag:world.job.ledger_linan today:world.job.ledger_linan money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.linan_ledger
name: 临安衙门：钱庄那边可有事
flag: world.job.ledger_linan
where: linan.bank
---
临安衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: linan.job.night
do: flag:world.job.night_linan
---
张捕头：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.linan_night
room: linan.market
if: flag:world.job.night_linan
do: unflag:world.job.night_linan today:world.job.night_linan money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.linan_night
name: 临安衙门：要不要去市集巡夜
flag: world.job.night_linan
where: linan.market
---
临安衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: linan.job.drunk
do: flag:world.job.drunk_linan
---
张捕头：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.linan_drunk
name: 醉汉
brief: 临安衙门要你对付的人。
if: flag:world.job.drunk_linan
talk: world.linan_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.linan_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.linan_drunk
* 走开

=== battle: world.b.linan_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.linan_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.linan_drunk.win
do: unflag:world.job.drunk_linan today:world.job.drunk_linan money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: linan.inn
npcs: world.npc.linan_drunk

=== quest: world.q.linan_drunk
name: 临安衙门：客栈里可有人闹事
flag: world.job.drunk_linan
where: linan.inn
---
临安衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: linan.job.kidnap
do: flag:world.job.kidnap_linan
---
张捕头：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.linan_kidnap
name: 拐子
brief: 临安衙门要你对付的人。
if: flag:world.job.kidnap_linan
talk: world.linan_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.linan_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.linan_kidnap
* 走开

=== battle: world.b.linan_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.linan_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.linan_kidnap.win
do: unflag:world.job.kidnap_linan today:world.job.kidnap_linan money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: linan.station
npcs: world.npc.linan_kidnap

=== quest: world.q.linan_kidnap
name: 临安衙门：车马行那边可有可疑的人
flag: world.job.kidnap_linan
where: linan.station
---
临安衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 嘉兴衙门 =================

=== dialog: jiaxing.job.notice
do: flag:world.job.notice_jiaxing
---
孙捕头：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.jiaxing_notice
room: jiaxing.center
if: flag:world.job.notice_jiaxing
do: unflag:world.job.notice_jiaxing today:world.job.notice_jiaxing money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.jiaxing_notice
name: 嘉兴衙门：可有告示要张贴
flag: world.job.notice_jiaxing
where: jiaxing.center
---
嘉兴衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: jiaxing.job.ledger
do: flag:world.job.ledger_jiaxing
---
孙捕头：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.jiaxing_ledger
room: jiaxing.bank
if: flag:world.job.ledger_jiaxing
do: unflag:world.job.ledger_jiaxing today:world.job.ledger_jiaxing money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.jiaxing_ledger
name: 嘉兴衙门：钱庄那边可有事
flag: world.job.ledger_jiaxing
where: jiaxing.bank
---
嘉兴衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: jiaxing.job.night
do: flag:world.job.night_jiaxing
---
孙捕头：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.jiaxing_night
room: jiaxing.market
if: flag:world.job.night_jiaxing
do: unflag:world.job.night_jiaxing today:world.job.night_jiaxing money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.jiaxing_night
name: 嘉兴衙门：要不要去市集巡夜
flag: world.job.night_jiaxing
where: jiaxing.market
---
嘉兴衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: jiaxing.job.drunk
do: flag:world.job.drunk_jiaxing
---
孙捕头：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.jiaxing_drunk
name: 醉汉
brief: 嘉兴衙门要你对付的人。
if: flag:world.job.drunk_jiaxing
talk: world.jiaxing_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.jiaxing_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.jiaxing_drunk
* 走开

=== battle: world.b.jiaxing_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.jiaxing_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.jiaxing_drunk.win
do: unflag:world.job.drunk_jiaxing today:world.job.drunk_jiaxing money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: jiaxing.inn
npcs: world.npc.jiaxing_drunk

=== quest: world.q.jiaxing_drunk
name: 嘉兴衙门：客栈里可有人闹事
flag: world.job.drunk_jiaxing
where: jiaxing.inn
---
嘉兴衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: jiaxing.job.kidnap
do: flag:world.job.kidnap_jiaxing
---
孙捕头：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.jiaxing_kidnap
name: 拐子
brief: 嘉兴衙门要你对付的人。
if: flag:world.job.kidnap_jiaxing
talk: world.jiaxing_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.jiaxing_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.jiaxing_kidnap
* 走开

=== battle: world.b.jiaxing_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.jiaxing_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.jiaxing_kidnap.win
do: unflag:world.job.kidnap_jiaxing today:world.job.kidnap_jiaxing money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: jiaxing.station
npcs: world.npc.jiaxing_kidnap

=== quest: world.q.jiaxing_kidnap
name: 嘉兴衙门：车马行那边可有可疑的人
flag: world.job.kidnap_jiaxing
where: jiaxing.station
---
嘉兴衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 襄阳衙门 =================

=== dialog: xiangyang.job.notice
do: flag:world.job.notice_xiangyang
---
王捕头：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.xiangyang_notice
room: xiangyang.center
if: flag:world.job.notice_xiangyang
do: unflag:world.job.notice_xiangyang today:world.job.notice_xiangyang money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.xiangyang_notice
name: 襄阳衙门：可有告示要张贴
flag: world.job.notice_xiangyang
where: xiangyang.center
---
襄阳衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: xiangyang.job.ledger
do: flag:world.job.ledger_xiangyang
---
王捕头：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.xiangyang_ledger
room: xiangyang.bank
if: flag:world.job.ledger_xiangyang
do: unflag:world.job.ledger_xiangyang today:world.job.ledger_xiangyang money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.xiangyang_ledger
name: 襄阳衙门：钱庄那边可有事
flag: world.job.ledger_xiangyang
where: xiangyang.bank
---
襄阳衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: xiangyang.job.night
do: flag:world.job.night_xiangyang
---
王捕头：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.xiangyang_night
room: xiangyang.market
if: flag:world.job.night_xiangyang
do: unflag:world.job.night_xiangyang today:world.job.night_xiangyang money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.xiangyang_night
name: 襄阳衙门：要不要去市集巡夜
flag: world.job.night_xiangyang
where: xiangyang.market
---
襄阳衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: xiangyang.job.drunk
do: flag:world.job.drunk_xiangyang
---
王捕头：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.xiangyang_drunk
name: 醉汉
brief: 襄阳衙门要你对付的人。
if: flag:world.job.drunk_xiangyang
talk: world.xiangyang_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.xiangyang_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.xiangyang_drunk
* 走开

=== battle: world.b.xiangyang_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.xiangyang_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.xiangyang_drunk.win
do: unflag:world.job.drunk_xiangyang today:world.job.drunk_xiangyang money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: xiangyang.inn
npcs: world.npc.xiangyang_drunk

=== quest: world.q.xiangyang_drunk
name: 襄阳衙门：客栈里可有人闹事
flag: world.job.drunk_xiangyang
where: xiangyang.inn
---
襄阳衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: xiangyang.job.kidnap
do: flag:world.job.kidnap_xiangyang
---
王捕头：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.xiangyang_kidnap
name: 拐子
brief: 襄阳衙门要你对付的人。
if: flag:world.job.kidnap_xiangyang
talk: world.xiangyang_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.xiangyang_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.xiangyang_kidnap
* 走开

=== battle: world.b.xiangyang_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.xiangyang_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.xiangyang_kidnap.win
do: unflag:world.job.kidnap_xiangyang today:world.job.kidnap_xiangyang money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: xiangyang.station
npcs: world.npc.xiangyang_kidnap

=== quest: world.q.xiangyang_kidnap
name: 襄阳衙门：车马行那边可有可疑的人
flag: world.job.kidnap_xiangyang
where: xiangyang.station
---
襄阳衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 洛阳衙门 =================

=== dialog: luoyang.job.notice
do: flag:world.job.notice_luoyang
---
李都头：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.luoyang_notice
room: luoyang.center
if: flag:world.job.notice_luoyang
do: unflag:world.job.notice_luoyang today:world.job.notice_luoyang money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.luoyang_notice
name: 洛阳衙门：可有告示要张贴
flag: world.job.notice_luoyang
where: luoyang.center
---
洛阳衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: luoyang.job.ledger
do: flag:world.job.ledger_luoyang
---
李都头：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.luoyang_ledger
room: luoyang.bank
if: flag:world.job.ledger_luoyang
do: unflag:world.job.ledger_luoyang today:world.job.ledger_luoyang money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.luoyang_ledger
name: 洛阳衙门：钱庄那边可有事
flag: world.job.ledger_luoyang
where: luoyang.bank
---
洛阳衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: luoyang.job.night
do: flag:world.job.night_luoyang
---
李都头：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.luoyang_night
room: luoyang.market
if: flag:world.job.night_luoyang
do: unflag:world.job.night_luoyang today:world.job.night_luoyang money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.luoyang_night
name: 洛阳衙门：要不要去市集巡夜
flag: world.job.night_luoyang
where: luoyang.market
---
洛阳衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: luoyang.job.drunk
do: flag:world.job.drunk_luoyang
---
李都头：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.luoyang_drunk
name: 醉汉
brief: 洛阳衙门要你对付的人。
if: flag:world.job.drunk_luoyang
talk: world.luoyang_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.luoyang_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.luoyang_drunk
* 走开

=== battle: world.b.luoyang_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.luoyang_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.luoyang_drunk.win
do: unflag:world.job.drunk_luoyang today:world.job.drunk_luoyang money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: luoyang.inn
npcs: world.npc.luoyang_drunk

=== quest: world.q.luoyang_drunk
name: 洛阳衙门：客栈里可有人闹事
flag: world.job.drunk_luoyang
where: luoyang.inn
---
洛阳衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: luoyang.job.kidnap
do: flag:world.job.kidnap_luoyang
---
李都头：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.luoyang_kidnap
name: 拐子
brief: 洛阳衙门要你对付的人。
if: flag:world.job.kidnap_luoyang
talk: world.luoyang_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.luoyang_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.luoyang_kidnap
* 走开

=== battle: world.b.luoyang_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.luoyang_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.luoyang_kidnap.win
do: unflag:world.job.kidnap_luoyang today:world.job.kidnap_luoyang money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: luoyang.station
npcs: world.npc.luoyang_kidnap

=== quest: world.q.luoyang_kidnap
name: 洛阳衙门：车马行那边可有可疑的人
flag: world.job.kidnap_luoyang
where: luoyang.station
---
洛阳衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 长安衙门 =================

=== dialog: changan.job.notice
do: flag:world.job.notice_changan
---
赵捕快：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.changan_notice
room: changan.center
if: flag:world.job.notice_changan
do: unflag:world.job.notice_changan today:world.job.notice_changan money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.changan_notice
name: 长安衙门：可有告示要张贴
flag: world.job.notice_changan
where: changan.center
---
长安衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: changan.job.ledger
do: flag:world.job.ledger_changan
---
赵捕快：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.changan_ledger
room: changan.bank
if: flag:world.job.ledger_changan
do: unflag:world.job.ledger_changan today:world.job.ledger_changan money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.changan_ledger
name: 长安衙门：钱庄那边可有事
flag: world.job.ledger_changan
where: changan.bank
---
长安衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: changan.job.night
do: flag:world.job.night_changan
---
赵捕快：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.changan_night
room: changan.market
if: flag:world.job.night_changan
do: unflag:world.job.night_changan today:world.job.night_changan money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.changan_night
name: 长安衙门：要不要去市集巡夜
flag: world.job.night_changan
where: changan.market
---
长安衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: changan.job.drunk
do: flag:world.job.drunk_changan
---
赵捕快：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.changan_drunk
name: 醉汉
brief: 长安衙门要你对付的人。
if: flag:world.job.drunk_changan
talk: world.changan_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.changan_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.changan_drunk
* 走开

=== battle: world.b.changan_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.changan_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.changan_drunk.win
do: unflag:world.job.drunk_changan today:world.job.drunk_changan money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: changan.inn
npcs: world.npc.changan_drunk

=== quest: world.q.changan_drunk
name: 长安衙门：客栈里可有人闹事
flag: world.job.drunk_changan
where: changan.inn
---
长安衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: changan.job.kidnap
do: flag:world.job.kidnap_changan
---
赵捕快：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.changan_kidnap
name: 拐子
brief: 长安衙门要你对付的人。
if: flag:world.job.kidnap_changan
talk: world.changan_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.changan_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.changan_kidnap
* 走开

=== battle: world.b.changan_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.changan_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.changan_kidnap.win
do: unflag:world.job.kidnap_changan today:world.job.kidnap_changan money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: changan.station
npcs: world.npc.changan_kidnap

=== quest: world.q.changan_kidnap
name: 长安衙门：车马行那边可有可疑的人
flag: world.job.kidnap_changan
where: changan.station
---
长安衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 成都衙门 =================

=== dialog: chengdu.job.notice
do: flag:world.job.notice_chengdu
---
周捕头：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.chengdu_notice
room: chengdu.center
if: flag:world.job.notice_chengdu
do: unflag:world.job.notice_chengdu today:world.job.notice_chengdu money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.chengdu_notice
name: 成都衙门：可有告示要张贴
flag: world.job.notice_chengdu
where: chengdu.center
---
成都衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: chengdu.job.ledger
do: flag:world.job.ledger_chengdu
---
周捕头：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.chengdu_ledger
room: chengdu.bank
if: flag:world.job.ledger_chengdu
do: unflag:world.job.ledger_chengdu today:world.job.ledger_chengdu money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.chengdu_ledger
name: 成都衙门：钱庄那边可有事
flag: world.job.ledger_chengdu
where: chengdu.bank
---
成都衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: chengdu.job.night
do: flag:world.job.night_chengdu
---
周捕头：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.chengdu_night
room: chengdu.market
if: flag:world.job.night_chengdu
do: unflag:world.job.night_chengdu today:world.job.night_chengdu money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.chengdu_night
name: 成都衙门：要不要去市集巡夜
flag: world.job.night_chengdu
where: chengdu.market
---
成都衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: chengdu.job.drunk
do: flag:world.job.drunk_chengdu
---
周捕头：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.chengdu_drunk
name: 醉汉
brief: 成都衙门要你对付的人。
if: flag:world.job.drunk_chengdu
talk: world.chengdu_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.chengdu_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.chengdu_drunk
* 走开

=== battle: world.b.chengdu_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.chengdu_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.chengdu_drunk.win
do: unflag:world.job.drunk_chengdu today:world.job.drunk_chengdu money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: chengdu.inn
npcs: world.npc.chengdu_drunk

=== quest: world.q.chengdu_drunk
name: 成都衙门：客栈里可有人闹事
flag: world.job.drunk_chengdu
where: chengdu.inn
---
成都衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: chengdu.job.kidnap
do: flag:world.job.kidnap_chengdu
---
周捕头：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.chengdu_kidnap
name: 拐子
brief: 成都衙门要你对付的人。
if: flag:world.job.kidnap_chengdu
talk: world.chengdu_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.chengdu_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.chengdu_kidnap
* 走开

=== battle: world.b.chengdu_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.chengdu_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.chengdu_kidnap.win
do: unflag:world.job.kidnap_chengdu today:world.job.kidnap_chengdu money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: chengdu.station
npcs: world.npc.chengdu_kidnap

=== quest: world.q.chengdu_kidnap
name: 成都衙门：车马行那边可有可疑的人
flag: world.job.kidnap_chengdu
where: chengdu.station
---
成都衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 大理衙门 =================

=== dialog: dali.job.notice
do: flag:world.job.notice_dali
---
高提刑：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.dali_notice
room: dali.center
if: flag:world.job.notice_dali
do: unflag:world.job.notice_dali today:world.job.notice_dali money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.dali_notice
name: 大理衙门：可有告示要张贴
flag: world.job.notice_dali
where: dali.center
---
大理衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: dali.job.ledger
do: flag:world.job.ledger_dali
---
高提刑：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.dali_ledger
room: dali.bank
if: flag:world.job.ledger_dali
do: unflag:world.job.ledger_dali today:world.job.ledger_dali money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.dali_ledger
name: 大理衙门：钱庄那边可有事
flag: world.job.ledger_dali
where: dali.bank
---
大理衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: dali.job.night
do: flag:world.job.night_dali
---
高提刑：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.dali_night
room: dali.market
if: flag:world.job.night_dali
do: unflag:world.job.night_dali today:world.job.night_dali money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.dali_night
name: 大理衙门：要不要去市集巡夜
flag: world.job.night_dali
where: dali.market
---
大理衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: dali.job.drunk
do: flag:world.job.drunk_dali
---
高提刑：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.dali_drunk
name: 醉汉
brief: 大理衙门要你对付的人。
if: flag:world.job.drunk_dali
talk: world.dali_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.dali_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.dali_drunk
* 走开

=== battle: world.b.dali_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.dali_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.dali_drunk.win
do: unflag:world.job.drunk_dali today:world.job.drunk_dali money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: dali.inn
npcs: world.npc.dali_drunk

=== quest: world.q.dali_drunk
name: 大理衙门：客栈里可有人闹事
flag: world.job.drunk_dali
where: dali.inn
---
大理衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: dali.job.kidnap
do: flag:world.job.kidnap_dali
---
高提刑：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.dali_kidnap
name: 拐子
brief: 大理衙门要你对付的人。
if: flag:world.job.kidnap_dali
talk: world.dali_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.dali_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.dali_kidnap
* 走开

=== battle: world.b.dali_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.dali_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.dali_kidnap.win
do: unflag:world.job.kidnap_dali today:world.job.kidnap_dali money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: dali.station
npcs: world.npc.dali_kidnap

=== quest: world.q.dali_kidnap
name: 大理衙门：车马行那边可有可疑的人
flag: world.job.kidnap_dali
where: dali.station
---
大理衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 苏州衙门 =================

=== dialog: suzhou.job.notice
do: flag:world.job.notice_suzhou
---
沈推官：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.suzhou_notice
room: suzhou.center
if: flag:world.job.notice_suzhou
do: unflag:world.job.notice_suzhou today:world.job.notice_suzhou money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.suzhou_notice
name: 苏州衙门：可有告示要张贴
flag: world.job.notice_suzhou
where: suzhou.center
---
苏州衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: suzhou.job.ledger
do: flag:world.job.ledger_suzhou
---
沈推官：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.suzhou_ledger
room: suzhou.bank
if: flag:world.job.ledger_suzhou
do: unflag:world.job.ledger_suzhou today:world.job.ledger_suzhou money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.suzhou_ledger
name: 苏州衙门：钱庄那边可有事
flag: world.job.ledger_suzhou
where: suzhou.bank
---
苏州衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: suzhou.job.night
do: flag:world.job.night_suzhou
---
沈推官：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.suzhou_night
room: suzhou.market
if: flag:world.job.night_suzhou
do: unflag:world.job.night_suzhou today:world.job.night_suzhou money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.suzhou_night
name: 苏州衙门：要不要去市集巡夜
flag: world.job.night_suzhou
where: suzhou.market
---
苏州衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: suzhou.job.drunk
do: flag:world.job.drunk_suzhou
---
沈推官：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.suzhou_drunk
name: 醉汉
brief: 苏州衙门要你对付的人。
if: flag:world.job.drunk_suzhou
talk: world.suzhou_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.suzhou_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.suzhou_drunk
* 走开

=== battle: world.b.suzhou_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.suzhou_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.suzhou_drunk.win
do: unflag:world.job.drunk_suzhou today:world.job.drunk_suzhou money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: suzhou.inn
npcs: world.npc.suzhou_drunk

=== quest: world.q.suzhou_drunk
name: 苏州衙门：客栈里可有人闹事
flag: world.job.drunk_suzhou
where: suzhou.inn
---
苏州衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: suzhou.job.kidnap
do: flag:world.job.kidnap_suzhou
---
沈推官：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.suzhou_kidnap
name: 拐子
brief: 苏州衙门要你对付的人。
if: flag:world.job.kidnap_suzhou
talk: world.suzhou_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.suzhou_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.suzhou_kidnap
* 走开

=== battle: world.b.suzhou_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.suzhou_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.suzhou_kidnap.win
do: unflag:world.job.kidnap_suzhou today:world.job.kidnap_suzhou money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: suzhou.station
npcs: world.npc.suzhou_kidnap

=== quest: world.q.suzhou_kidnap
name: 苏州衙门：车马行那边可有可疑的人
flag: world.job.kidnap_suzhou
where: suzhou.station
---
苏州衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 福州衙门 =================

=== dialog: fuzhou.job.notice
do: flag:world.job.notice_fuzhou
---
吴捕头：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.fuzhou_notice
room: fuzhou.center
if: flag:world.job.notice_fuzhou
do: unflag:world.job.notice_fuzhou today:world.job.notice_fuzhou money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.fuzhou_notice
name: 福州衙门：可有告示要张贴
flag: world.job.notice_fuzhou
where: fuzhou.center
---
福州衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: fuzhou.job.ledger
do: flag:world.job.ledger_fuzhou
---
吴捕头：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.fuzhou_ledger
room: fuzhou.bank
if: flag:world.job.ledger_fuzhou
do: unflag:world.job.ledger_fuzhou today:world.job.ledger_fuzhou money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.fuzhou_ledger
name: 福州衙门：钱庄那边可有事
flag: world.job.ledger_fuzhou
where: fuzhou.bank
---
福州衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: fuzhou.job.night
do: flag:world.job.night_fuzhou
---
吴捕头：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.fuzhou_night
room: fuzhou.market
if: flag:world.job.night_fuzhou
do: unflag:world.job.night_fuzhou today:world.job.night_fuzhou money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.fuzhou_night
name: 福州衙门：要不要去市集巡夜
flag: world.job.night_fuzhou
where: fuzhou.market
---
福州衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: fuzhou.job.drunk
do: flag:world.job.drunk_fuzhou
---
吴捕头：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.fuzhou_drunk
name: 醉汉
brief: 福州衙门要你对付的人。
if: flag:world.job.drunk_fuzhou
talk: world.fuzhou_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.fuzhou_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.fuzhou_drunk
* 走开

=== battle: world.b.fuzhou_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.fuzhou_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.fuzhou_drunk.win
do: unflag:world.job.drunk_fuzhou today:world.job.drunk_fuzhou money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: fuzhou.inn
npcs: world.npc.fuzhou_drunk

=== quest: world.q.fuzhou_drunk
name: 福州衙门：客栈里可有人闹事
flag: world.job.drunk_fuzhou
where: fuzhou.inn
---
福州衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: fuzhou.job.kidnap
do: flag:world.job.kidnap_fuzhou
---
吴捕头：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.fuzhou_kidnap
name: 拐子
brief: 福州衙门要你对付的人。
if: flag:world.job.kidnap_fuzhou
talk: world.fuzhou_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.fuzhou_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.fuzhou_kidnap
* 走开

=== battle: world.b.fuzhou_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.fuzhou_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.fuzhou_kidnap.win
do: unflag:world.job.kidnap_fuzhou today:world.job.kidnap_fuzhou money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: fuzhou.station
npcs: world.npc.fuzhou_kidnap

=== quest: world.q.fuzhou_kidnap
name: 福州衙门：车马行那边可有可疑的人
flag: world.job.kidnap_fuzhou
where: fuzhou.station
---
福州衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 衡阳衙门 =================

=== dialog: hengyang.job.notice
do: flag:world.job.notice_hengyang
---
周班头：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== trigger: world.t.hengyang_notice
room: hengyang.center
if: flag:world.job.notice_hengyang
do: unflag:world.job.notice_hengyang today:world.job.notice_hengyang money:40 potential:15
---
你把海捕文书贴在最显眼的墙上，几个闲人立刻围上来指指点点。（差事完成，赏钱四十文）

=== quest: world.q.hengyang_notice
name: 衡阳衙门：可有告示要张贴
flag: world.job.notice_hengyang
where: hengyang.center
---
衡阳衙门的差事：新到的海捕文书，你拿去城中心贴了，贴牢些，别让风刮跑。赏钱四十文。

=== dialog: hengyang.job.ledger
do: flag:world.job.ledger_hengyang
---
周班头：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== trigger: world.t.hengyang_ledger
room: hengyang.bank
if: flag:world.job.ledger_hengyang
do: unflag:world.job.ledger_hengyang today:world.job.ledger_hengyang money:50 potential:15
---
掌柜把那人的模样、口音说得清清楚楚，你一一记下了。（差事完成，赏钱五十文）

=== quest: world.q.hengyang_ledger
name: 衡阳衙门：钱庄那边可有事
flag: world.job.ledger_hengyang
where: hengyang.bank
---
衡阳衙门的差事：钱庄报官，说收到了几张假银票。你去问问掌柜，是谁拿来兑的，长什么样。赏钱五十文。

=== dialog: hengyang.job.night
do: flag:world.job.night_hengyang
---
周班头：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== trigger: world.t.hengyang_night
room: hengyang.market
if: flag:world.job.night_hengyang
do: unflag:world.job.night_hengyang today:world.job.night_hengyang money:40 potential:15
---
你提着灯笼把货棚挨个照了一遍，只惊起了几只野猫。（差事完成，赏钱四十文）

=== quest: world.q.hengyang_night
name: 衡阳衙门：要不要去市集巡夜
flag: world.job.night_hengyang
where: hengyang.market
---
衡阳衙门的差事：市集晚上收了摊，常有人撬货棚。你去转一圈，看看门锁都还好好的。赏钱四十文。

=== dialog: hengyang.job.drunk
do: flag:world.job.drunk_hengyang
---
周班头：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== npc: world.npc.hengyang_drunk
name: 醉汉
brief: 衡阳衙门要你对付的人。
if: flag:world.job.drunk_hengyang
talk: world.hengyang_drunk.talk
---
两个醉汉拍着桌子嚷嚷，酒碗碎了一地。

=== dialog: world.hengyang_drunk.talk
---
醉汉：哪、哪来的……喝！不喝就打！
* 动手 !fight:world.b.hengyang_drunk
* 走开

=== battle: world.b.hengyang_drunk
enemies: world.foe.job_drunk, world.foe.job_drunk
adapt: true
win: world.hengyang_drunk.win
---
两个醉汉摇摇晃晃地站起来，抡着拳头就上。

=== dialog: world.hengyang_drunk.win
do: unflag:world.job.drunk_hengyang today:world.job.drunk_hengyang money:80
---
两个醉汉趴在地上打起了呼噜。掌柜千恩万谢，把账记在了他们头上。（差事完成，赏钱八十文）

=== patch: hengyang.inn
npcs: world.npc.hengyang_drunk

=== quest: world.q.hengyang_drunk
name: 衡阳衙门：客栈里可有人闹事
flag: world.job.drunk_hengyang
where: hengyang.inn
---
衡阳衙门的差事：客栈掌柜来报，有两个醉汉砸了桌子不给钱。你去把他们弄老实了。赏钱八十文。

=== dialog: hengyang.job.kidnap
do: flag:world.job.kidnap_hengyang
---
周班头：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

=== npc: world.npc.hengyang_kidnap
name: 拐子
brief: 衡阳衙门要你对付的人。
if: flag:world.job.kidnap_hengyang
talk: world.hengyang_kidnap.talk
---
两个生面孔守着一辆蒙得严严实实的骡车，不时朝四下张望。

=== dialog: world.hengyang_kidnap.talk
---
拐子：这位客官，买糖不买？不买就走远些。
* 动手 !fight:world.b.hengyang_kidnap
* 走开

=== battle: world.b.hengyang_kidnap
enemies: world.foe.job_kidnapper, world.foe.job_kidnapper
adapt: true
win: world.hengyang_kidnap.win
---
拐子把糖一扔，短刀从袖子里滑了出来。

=== dialog: world.hengyang_kidnap.win
do: unflag:world.job.kidnap_hengyang today:world.job.kidnap_hengyang money:110
---
你掀开骡车的篷布，两个孩子缩在角落里，嘴被布塞着。（差事完成，赏钱一百一十文）

=== patch: hengyang.station
npcs: world.npc.hengyang_kidnap

=== quest: world.q.hengyang_kidnap
name: 衡阳衙门：车马行那边可有可疑的人
flag: world.job.kidnap_hengyang
where: hengyang.station
---
衡阳衙门的差事：城里丢了两个孩子，有人看见一伙生面孔在车马行转悠。你去盯着，抓住了重重有赏，一百一十文。

# ================= 交吃喝的差事（D-135）：参加每日抽选；去城里客栈买，放在背包里交 =================

=== dialog: gaibang.task.food_ask
do: flag:world.gaibang.task_food roll:world.gaibang.food:2~3
---
鲁有脚咂了咂嘴：叫化鸡本是咱们要饭的发明，如今倒成了馆子里的名菜，咱们自己反倒吃不上。分舵里几个老兄弟伤了，想吃口好的。你去城里客栈买 {@world.gaibang.food} 只叫化鸡回来。
（门派任务：去城里客栈买 {@world.gaibang.food} 件叫化鸡，交给鲁有脚。）

=== dialog: gaibang.task.food
do: unflag:world.gaibang.task_food take:food.jiaohuaji:@world.gaibang.food today:world.gaibang.task_food rep:gaibang:30 potential:10
---
鲁有脚撕下一条鸡腿，先递给了躺在草堆上的老叫化。“好，好！”他抹着嘴笑，“这一口，比什么金创药都灵。”
（门派任务完成）

=== quest: world.q.gaibang_food
name: 丐帮：交 {@world.gaibang.food} 件叫化鸡
flag: world.gaibang.task_food
where: linan.temple
---
鲁有脚的差遣：去城里客栈买 {@world.gaibang.food} 件叫化鸡，回来交上。

=== dialog: shaolin.task.food_ask
do: flag:world.shaolin.task_food roll:world.shaolin.food:10~20
---
慧明禅师：山下饥民又多了，寺里每日施粥，蒸笼却不够用。施主若方便，去城里客栈买 {@world.shaolin.food} 个馒头送上山来。
（门派任务：去城里客栈买 {@world.shaolin.food} 件馒头，交给慧明禅师。）

=== dialog: shaolin.task.food
do: unflag:world.shaolin.task_food take:food.mantou:@world.shaolin.food today:world.shaolin.task_food rep:shaolin:30 potential:10
---
慧明禅师合十道：“阿弥陀佛。这些馒头，今日便能多救几个人。”
（门派任务完成）

=== quest: world.q.shaolin_food
name: 少林：交 {@world.shaolin.food} 件馒头
flag: world.shaolin.task_food
where: shaolin.hall
---
慧明禅师的差遣：去城里客栈买 {@world.shaolin.food} 件馒头，回来交上。

=== dialog: wudang.task.food_ask
do: flag:world.wudang.task_food roll:world.wudang.food:3~5
---
清虚道长：丹房泡药酒，要好酒作底。你去城里客栈买 {@world.wudang.food} 坛女儿红上山。记着，是泡药用的，不是给谁偷喝的。
（门派任务：去城里客栈买 {@world.wudang.food} 件女儿红，交给清虚道长。）

=== dialog: wudang.task.food
do: unflag:world.wudang.task_food take:food.nverhong:@world.wudang.food today:world.wudang.task_food rep:wudang:30 potential:10
---
清虚道长揭开泥封闻了闻，点头道：“是好酒。”转身吩咐道童：“搬去丹房，一坛也不许少。”
（门派任务完成）

=== quest: world.q.wudang_food
name: 武当：交 {@world.wudang.food} 件女儿红
flag: world.wudang.task_food
where: wudang.hall
---
清虚道长的差遣：去城里客栈买 {@world.wudang.food} 件女儿红，回来交上。

=== dialog: huashan.task.food_ask
do: flag:world.huashan.task_food roll:world.huashan.food:3~6
---
穆清风：这几日弟子们练剑练得狠，伙房里的青菜豆腐顶不住。你去城里客栈买 {@world.huashan.food} 包酱牛肉回来，给大家补补力气。
（门派任务：去城里客栈买 {@world.huashan.food} 件酱牛肉，交给穆清风。）

=== dialog: huashan.task.food
do: unflag:world.huashan.task_food take:food.niurou:@world.huashan.food today:world.huashan.task_food rep:huashan:30 potential:10
---
穆清风把酱牛肉分给练剑归来的弟子们，一群人围着吃得满嘴流油。“明天的剑，该练得更狠些了。”
（门派任务完成）

=== quest: world.q.huashan_food
name: 华山：交 {@world.huashan.food} 件酱牛肉
flag: world.huashan.task_food
where: huashan.hall
---
穆清风的差遣：去城里客栈买 {@world.huashan.food} 件酱牛肉，回来交上。

=== dialog: tangmen.task.food_ask
do: flag:world.tangmen.task_food roll:world.tangmen.food:1~2
---
唐姥姥：配毒要用烈酒化药，寻常的酒力道不够。你去城里客栈买 {@world.tangmen.food} 葫芦猴儿酒回来。
（门派任务：去城里客栈买 {@world.tangmen.food} 件猴儿酒，交给唐姥姥。）

=== dialog: tangmen.task.food
do: unflag:world.tangmen.task_food take:food.houerjiu:@world.tangmen.food today:world.tangmen.task_food rep:tangmen:30 potential:10
---
唐姥姥拔开葫芦塞子嗅了嗅，眯起眼睛：“够烈。”她把葫芦收进袖子里，再没多说一句话——在唐门，这便是夸奖了。
（门派任务完成）

=== quest: world.q.tangmen_food
name: 唐门：交 {@world.tangmen.food} 件猴儿酒
flag: world.tangmen.task_food
where: tangmen.hall
---
唐姥姥的差遣：去城里客栈买 {@world.tangmen.food} 件猴儿酒，回来交上。
