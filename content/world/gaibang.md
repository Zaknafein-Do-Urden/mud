# 丐帮（临安分舵）。门派规则见 docs/SECT.md。
# 本门外功刚、巧、守至少各一门（校验脚本检查）。侧重：刚。

=== sect: gaibang
name: 丐帮
ranks: 一袋弟子=0, 二袋弟子=100, 三袋弟子=300, 四袋弟子=700, 五袋弟子=1500
caps: 40, 70, 100, 140, 180
# 晋阶考核时与之过招的同门（照搬玩家当前的功夫，势均力敌）
examiner: 黎生
---
天下第一大帮，帮众遍布大江南北，多是乞丐出身。帮中以背上布袋的多少分辨辈分高低。
丐帮弟子多有抗金之志，在江湖上声望极高。

# ---------------- 武学 ----------------

=== skill: gaibang.huntian
name: 混天气功
kind: 内功
sect: gaibang
rank: 0
hp: 8
mp: 10
affinity: 刚
---
丐帮的入门心法，内息刚猛，与本门掌法相辅相成。

=== skill: gaibang.lianhua
name: 莲花掌
kind: 外功
stance: 刚
sect: gaibang
rank: 0
---
丐帮弟子入门必学的掌法，掌势开合如莲花绽放，后劲绵长。

=== move: gaibang.lianhua.1
skill: gaibang.lianhua
name: 莲花初绽
level: 0
power: 26
mp: 12
omen: $N双掌合十，缓缓向外分开，掌心隐有劲风……
---
$N双掌一分，一招「$招」，掌力层层叠叠，涌向$n$部位！

=== move: gaibang.lianhua.2
skill: gaibang.lianhua
name: 并蒂莲开
level: 20
power: 34
mp: 18
effects: 破绽
omen: $N左掌在前、右掌在后，脚下踏出半步……
---
$N左掌虚引，右掌随后拍出，正是「$招」，两股掌力一先一后撞向$n！

=== move: gaibang.lianhua.3
skill: gaibang.lianhua
name: 铁莲横江
level: 40
power: 46
mp: 26
effects: 内伤
omen: $N沉肩坠肘，周身骨节噼啪作响……
---
$N吐气开声，一招「$招」横扫而出，掌风如铁浆泼地，罩住$n上半身！

=== skill: gaibang.chansi
name: 缠丝擒拿手
kind: 外功
stance: 守
sect: gaibang
rank: 0
---
丐帮的擒拿功夫，专拿对手手腕关节，以柔劲缠住来招。

=== move: gaibang.chansi.1
skill: gaibang.chansi
name: 缠丝手
level: 0
power: 16
mp: 5
omen: $N双手垂在身侧，十指微曲……
---
$N十指如藤蔓般张开，以「$招」守住周身，静候来招。

=== move: gaibang.chansi.2
skill: gaibang.chansi
name: 反扣脉门
level: 25
power: 26
mp: 9
omen: $N双手交错，翻腕成爪……
---
$N翻腕成爪，摆出「$招」的架势，专等对手手腕送上门来。

=== skill: gaibang.xiaoyao
name: 逍遥游
kind: 外功
stance: 巧
sect: gaibang
rank: 1
---
一路轻灵飘逸的掌法，身随掌走，掌随身转，叫人捉摸不定。

=== move: gaibang.xiaoyao.1
skill: gaibang.xiaoyao
name: 飘然出掌
level: 0
power: 18
mp: 8
omen: $N身子一晃，似醉非醉……
---
$N身形飘忽，一招「$招」，掌缘斜斜削向$n$部位。

=== move: gaibang.xiaoyao.2
skill: gaibang.xiaoyao
name: 随风摆柳
level: 20
power: 22
mp: 11
effects: 点穴
omen: $N脚步轻浮，身子像柳枝一样左右摇摆……
---
$N随风摆柳般贴近，「$招」中暗藏一指，点向$n$部位的穴道！

=== move: gaibang.xiaoyao.3
skill: gaibang.xiaoyao
name: 逍遥自在
level: 40
power: 30
mp: 15
effects: 破绽
omen: $N负手而立，神情悠闲，脚下却在缓缓画圈……
---
$N一声长笑，使出「$招」，掌影漫天飞舞，$n眼花缭乱，不知该挡哪一掌！

=== skill: gaibang.qianli
name: 千里行
kind: 轻功
sect: gaibang
rank: 1
---
丐帮弟子走南闯北练就的脚力，日行百里不觉其累。

=== skill: gaibang.xianglong
name: 降龙十八掌
kind: 外功
stance: 刚
sect: gaibang
rank: 4
---
丐帮镇帮绝学，天下至刚至猛的掌法。非帮中功劳卓著者不传。

=== move: gaibang.xianglong.1
skill: gaibang.xianglong
name: 亢龙有悔
level: 0
power: 60
mp: 40
effects: 内伤
omen: $N深吸一口气，双掌缓缓提至胸前，衣袖无风自鼓……
---
$N左腿微屈，右臂内弯划了个圆圈，呼的一掌「$招」向$n推去，掌力如排山倒海！

=== move: gaibang.xianglong.2
skill: gaibang.xianglong
name: 飞龙在天
level: 30
power: 72
mp: 48
effects: 破绽
omen: $N足尖一点，身子拔地而起……
---
$N凌空跃起，居高临下一招「$招」，掌力自上而下压向$n！

# ---------------- 地点 ----------------

=== room: linan.temple
name: 城隍庙（丐帮临安分舵）
exits: 东=linan.street
npcs: gaibang.lu, gaibang.shitou
train: true
---
一座破败的城隍庙，神像的漆早已剥落。殿里横七竖八躺着些乞丐，看似懒散，眼睛却都亮得很。
墙角堆着几根磨得光滑的竹棍，地上用炭画着一些奇怪的记号。

# ---------------- 人物 ----------------

=== npc: gaibang.lu
name: 鲁有脚
brief: 丐帮长老，主持临安分舵。
teaches: gaibang
talk: gaibang.lu.talk
---
一个身材魁梧的老丐，背上负着好几只布袋，手中一根铁杖。
他说话粗声粗气，脸上却总带着几分笑意。

=== dialog: gaibang.lu.talk
---
?sect:none 鲁有脚：嘿，看你的样子不像是来讨饭的。来我们这破庙做什么？
?sect:gaibang 鲁有脚：好徒儿，今日有什么事？想学功夫就说“学”；声望够了就说“晋阶”，过了黎生那一关才算数。
* 久仰丐帮威名，想拜入门下 -> gaibang.lu.join ?sect:none
* 有什么差事给我做？ -> gaibang.lu.task ?sect:gaibang
* 离开

=== dialog: gaibang.lu.join
---
鲁有脚上下打量你一番，用铁杖在地上一顿。
鲁有脚：我们丐帮的规矩：不欺良善，不贪不义之财，见了金狗不许腿软。做得到吗？
* 做得到！ -> gaibang.lu.joined !join:gaibang
* 让我再想想

=== dialog: gaibang.lu.joined
---
鲁有脚哈哈大笑，从怀里掏出一只旧布袋，替你系在背上。
鲁有脚：好！从今往后，你就是我丐帮的人了。先跟我学几手入门功夫——莲花掌、缠丝擒拿手、混天气功，说“学 莲花掌”便是。

=== dialog: gaibang.lu.task
---
?flag:world.gb.task_pipi 鲁有脚：城外官道上那几个泼皮还没收拾？快去快去。
?flag:world.gb.task_snake 鲁有脚：地头蛇的事办得怎样了？他就在城外官道上。
* 城外有人欺压百姓吗？ -> gaibang.lu.task1 ?!flag:world.gb.task_pipi ?!flag:world.gb.task_snake
* 有没有难一些的差事？ -> gaibang.lu.task2 ?rank:1 ?!flag:world.gb.task_pipi ?!flag:world.gb.task_snake
* 离开

=== dialog: gaibang.lu.task1
do: flag:world.gb.task_pipi
---
鲁有脚：城外官道上有两个泼皮，专抢进城卖菜的乡下人。去教训教训他们，叫他们知道临安城不是没人管的地方。
（门派任务：教训官道上的泼皮）

=== dialog: gaibang.lu.task2
do: flag:world.gb.task_snake
---
鲁有脚：城外有个外号“地头蛇”的家伙，手底下养着一帮泼皮，听说还跟衙门里的人有来往。此人有几分功夫，你小心些。
（门派任务：除掉地头蛇）

=== npc: gaibang.shitou
name: 小石头
brief: 分舵里年纪最小的丐帮弟子，整天缠着人切磋。
talk: gaibang.shitou.talk
---
一个十四五岁的小叫花，瘦得像根竹竿，一双眼睛却骨碌碌转个不停。

=== dialog: gaibang.shitou.talk
---
小石头：喂！你会不会打架？咱们比划比划！输了的人请吃葱包桧儿！
* 好，切磋几招 !fight:world.b.spar
* 下次吧

# ---------------- 敌人与战斗 ----------------
# 敌人的 skills 写 武功id=等级；ai 是各势的出招权重；cunning 是诡诈（虚招概率 %）。

=== enemy: world.foe.shitou
name: 小石头
attrs: 根骨=12, 身法=22, 悟性=15
skills: base.zhang=12, base.zhaojia=8, base.tuna=5
ai: 巧=3, 守=2
cunning: 15
potential: 15
hpx: 0.7
---
一个瘦小的叫花，出手虽然没什么力气，脚下却滑溜得很。

=== battle: world.b.spar
enemies: world.foe.shitou
---
小石头把破碗往地上一扔，摆了个歪歪扭扭的架势。

=== enemy: world.foe.pipi
name: 泼皮
attrs: 根骨=10, 身法=12, 悟性=8
skills: base.quan=8, base.zhaojia=5
ai: 刚=4, 守=1
potential: 20
hpx: 0.7
---
满脸横肉的泼皮，只会些乱拳。

=== enemy: world.foe.snake
name: 地头蛇
attrs: 根骨=18, 身法=16, 悟性=14
skills: base.quan=18, base.zhang=14, base.zhaojia=14, base.tuna=15
ai: 刚=2, 巧=2, 守=1
cunning: 30
potential: 70
hpx: 1.2
---
一个精瘦的汉子，脸上一道刀疤从眉角拉到嘴边，眼神阴鸷。

=== npc: world.npc.pipi
name: 泼皮
brief: 在官道上拦路勒索的泼皮。
if: flag:world.gb.task_pipi
talk: world.pipi.talk
---
两个敞着衣襟的泼皮，正围着一个挑菜的老汉推推搡搡。

=== dialog: world.pipi.talk
---
泼皮：看什么看？想替这老东西出头？
* 放开那位老人家！ !fight:world.b.pipi
* 走开

=== battle: world.b.pipi
enemies: world.foe.pipi, world.foe.pipi
win: world.pipi.win
---
两个泼皮把老汉一推，捋起袖子围了上来。

=== dialog: world.pipi.win
do: unflag:world.gb.task_pipi rep:gaibang:30
---
两个泼皮爬起来，连滚带爬地跑了。挑菜的老汉千恩万谢。
（门派任务完成。回分舵还能再领任务。）

=== npc: world.npc.snake
name: 地头蛇
brief: 城外一霸，据说和衙门有来往。
if: flag:world.gb.task_snake
talk: world.snake.talk
---
一个脸上带刀疤的精瘦汉子，靠在路边的大树下，手里把玩着一把匕首。

=== dialog: world.snake.talk
---
地头蛇：丐帮的？嘿嘿，鲁有脚那老叫花子手伸得倒长。
* 少废话，动手吧 !fight:world.b.snake
* 走开

=== battle: world.b.snake
enemies: world.foe.snake, world.foe.pipi
win: world.snake.win
---
地头蛇匕首一收，打了个呼哨，旁边一个泼皮也抄着木棍围了上来。

=== dialog: world.snake.win
do: unflag:world.gb.task_snake rep:gaibang:80
---
地头蛇捂着胸口，恶狠狠地瞪了你一眼，带着手下逃进了田野。
（门派任务完成。）

# ---------------- 任务清单（D-045）----------------

=== quest: world.q.gaibang_1
name: 丐帮：教训泼皮
flag: world.gb.task_pipi
where: linan.road
---
鲁有脚长老的差遣：去城外官道教训欺压百姓的泼皮。

=== quest: world.q.gaibang_2
name: 丐帮：除掉地头蛇
flag: world.gb.task_snake
where: linan.road
---
鲁有脚长老的差遣：城外官道上的地头蛇有几分功夫，小心应付。
