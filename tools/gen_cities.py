# 生成城市内容文件（一次性脚手架）：python tools/gen_cities.py
# 各城市的结构相同：十字街、车马行、市集、钱庄、客栈、衙门（差事）。描述、货物、路线、本地匪患各不相同。
# 生成后的 content/world/<城市>.md 是普通内容文件，可以直接手改；再次运行会覆盖，请注意。

import os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'content', 'world')

CITIES = {
    'jiaxing': dict(
        name='嘉兴', pos='600,225', routes='linan=1', areas='',
        goods='silk=0.75, tea=0.9, salt=0.85, porcelain=1.1, herbs=1.15, iron=1.2',
        brief='江南水乡，南湖烟雨。离临安只有一日路程，丝绸和私盐都便宜。',
        center='青石板路被雨水洗得发亮，河道从城中穿过，乌篷船咿咿呀呀地摇过石拱桥。',
        market='沿河的市集，丝绸铺子一家挨着一家，还有挑着盐担子吆喝的小贩。',
        bank='一间老字号钱庄，柜台后的账房先生戴着一副铜框眼镜。',
        inn='临河的客栈，推开窗就能看见南湖上的烟雨。',
        office='嘉兴府衙。门口的告示栏上贴着几张悬赏，纸角被风吹得哗啦作响。',
        station='城东的车马行，往来的多是去临安的客商。',
        officer='孙捕头', officer_desc='一个圆脸的捕头，说话慢条斯理，腰刀却擦得锃亮。',
        bandit='南湖水贼', bandit_desc='几个赤着脚的水贼，在码头上敲诈过往船家。', bandit_where='码头边',
        bandit_lv=10,
        battle_hpx=0.49,
        thief_hpx=1.19,
        weapon='刀', weapon_name='鱼叉',
    ),
    'xiangyang': dict(
        name='襄阳', pos='300,240', routes='linan=7, luoyang=4, chengdu=8', areas='wudang',
        goods='iron=0.85, salt=1.0, herbs=1.0, silk=1.2, tea=1.15, fur=1.1, porcelain=1.05',
        brief='汉水之滨的雄城，南宋北方的门户，城墙高厚，铁器出名。往西是武当山。',
        center='城墙又高又厚，街上随处可见披甲的军士。汉水的腥风从城外吹来，带着几分肃杀。',
        market='市集上铁匠铺的叮当声不绝于耳，刀枪锄犁都有，价钱比江南便宜得多。',
        bank='钱庄门口站着两个护院，柜台上的算盘珠子拨得飞快。',
        inn='一间宽敞的客栈，大堂里坐满了南来北往的商旅和军汉。',
        office='京西南路安抚使司的衙门，门前石狮威严，进出的多是军官。',
        station='城南的车马行，往临安、洛阳、成都的车都有。车把式说话都带着湖北腔。',
        officer='王捕头', officer_desc='一个黑脸膛的汉子，据说早年在军中当过伍长。',
        bandit='汉水水匪', bandit_desc='一伙驾着快船的水匪，专劫汉水上的货船。', bandit_where='汉水边',
        bandit_lv=15,
        battle_hpx=0.62,
        thief_hpx=1.3,
        weapon='刀', weapon_name='分水刀',
    ),
    'luoyang': dict(
        name='洛阳', pos='300,140', routes='xiangyang=4, changan=4', areas='shaolin',
        goods='porcelain=0.75, iron=0.9, silk=1.25, tea=1.3, fur=1.0, salt=1.2, shujin=1.4, herbs=1.05',
        brief='九朝古都，如今在金国治下。牡丹和瓷器天下闻名。往东南是嵩山少林寺。',
        center='宫阙的残垣还在，只是城头换了旗号。街上汉人、女真人混杂，说话都压着嗓子。',
        market='瓷器摊子一字排开，青瓷白瓷在日头下泛着光。卖茶的却少，价钱贵得吓人。',
        bank='钱庄的掌柜是个精明的山西人，金国的交钞、宋国的铜钱都收。',
        inn='客栈的院子里种着几株牡丹，可惜不是花开的时节。',
        office='洛阳府衙，门口站着女真兵丁。告示是用汉字和女真字两样写的。',
        station='城西的车马行，往襄阳、长安的车每日都有。',
        officer='李都头', officer_desc='一个汉人都头，夹在金国官府和百姓之间，满脸愁苦。',
        bandit='邙山盗墓贼', bandit_desc='几个鬼鬼祟祟的汉子，身上沾着泥土，腰里别着洛阳铲。', bandit_where='北邙山下',
        bandit_lv=18,
        battle_hpx=1.84,
        thief_hpx=2.44,
        thief_bonus=8,
        weapon='棍', weapon_name='洛阳铲',
    ),
    'changan': dict(
        name='长安', pos='190,130', routes='luoyang=4, chengdu=9', areas='huashan, quanzhen',
        goods='fur=0.75, salt=0.9, herbs=1.1, silk=1.4, tea=1.4, porcelain=1.2, shujin=1.5, iron=1.0',
        brief='汉唐故都，关中重镇，西域的皮货从这里进来。往东是西岳华山，往南是终南山全真教。',
        center='城郭依旧宏大，坊墙却已倒了大半。驼队从西门进来，驼铃声在街上回荡。',
        market='皮货、青盐堆成了小山，胡商操着生硬的汉话讨价还价。',
        bank='钱庄门面不大，后院却有一间铁皮包着的库房。',
        inn='客栈的伙计会说三四种话，回回、党项、女真的客人都招呼得来。',
        office='京兆府衙。衙门口的大鼓蒙着一层灰，看样子很久没人敢敲了。',
        station='城东的车马行，往洛阳的路好走，往成都的蜀道就难了。',
        officer='赵捕快', officer_desc='一个瘦高个的捕快，脸被风沙吹得黝黑。',
        bandit='关中刀客', bandit_desc='几个背着长刀的汉子，在官道上拦路收"买路钱"。', bandit_where='灞桥边',
        bandit_lv=22,
        battle_hpx=1.08,
        thief_hpx=2.1,
        thief_bonus=8,
        weapon='刀', weapon_name='长刀',
    ),
    'chengdu': dict(
        name='成都', pos='90,262', routes='xiangyang=8, changan=9', areas='tangmen',
        goods='shujin=0.75, herbs=0.75, tea=0.8, salt=1.3, iron=1.2, fur=1.2, silk=1.3, porcelain=1.25',
        brief='天府之国，锦官城。蜀锦、药材、茶叶都便宜。城外有神秘的唐家堡。',
        center='街边的茶馆里坐满了人，掏耳朵的、算命的、唱川戏的，热闹得很。',
        market='蜀锦的颜色艳得晃眼，药铺门口晒着成筐的川芎、黄连。',
        bank='钱庄的掌柜一边喝盖碗茶一边打算盘，不慌不忙。',
        inn='客栈的老板娘泼辣能干，一嗓子能喊到后街。',
        office='成都府衙。门房在打瞌睡，墙上贴着一张缉拿采花贼的告示。',
        station='城北的车马行。蜀道难，车资不便宜，车把式却个个胆大。',
        officer='周捕头', officer_desc='一个矮壮的川中汉子，嘴里叼着一根旱烟杆。',
        bandit='蜀道山贼', bandit_desc='一伙占山为王的山贼，在栈道上劫掠行人。', bandit_where='北门外的栈道',
        bandit_lv=20,
        battle_hpx=1.21,
        thief_hpx=2.21,
        thief_bonus=8,
        weapon='刀', weapon_name='砍刀',
    ),
}

# 送信差事：相邻城市之间（含临安）
DAYS = {}
for cid, c in CITIES.items():
    for part in c['routes'].split(','):
        to, d = part.split('=')
        DAYS[(cid, to.strip())] = int(d)
        DAYS[(to.strip(), cid)] = int(d)
NAMES = {cid: c['name'] for cid, c in CITIES.items()}
NAMES['linan'] = '临安'
# 临安是手写的，衙门的 id 不同
OFFICE = {'linan': 'linan.yamen'}


def neighbors(cid):
    return sorted({b for (a, b) in DAYS if a == cid})


def mail_reward(a, b):
    return 30 + DAYS[(a, b)] * 15


def gen(cid, c):
    n = c['name']
    lines = [f'# {n}（城市）。由 tools/gen_cities.py 生成，可以手改。', '']
    lines += [f'=== city: {cid}', f'name: {n}', f'pos: {c["pos"]}', f'station: {cid}.station',
              f'routes: {c["routes"]}', f'goods: {c["goods"]}']
    if c['areas']:
        lines.append(f'areas: {c["areas"]}')
    lines += ['---', c['brief'], '']
    rooms = [
        ('center', f'{n}·十字街', f'北={cid}.office, 南={cid}.station, 东={cid}.market, 西={cid}.inn', c['center'], ''),
        ('market', f'{n}·市集', f'西={cid}.center, 北={cid}.bank', c['market'] + '\n在这里可以 行情、买、卖。', 'market: true'),
        ('bank', f'{n}·钱庄', f'南={cid}.market', c['bank'] + '\n在这里可以 存、取、存款。', 'bank: true'),
        ('inn', f'{n}·客栈', f'东={cid}.center', c['inn'] + '\n在这里可以 休息、修炼。', 'inn: true'),
        ('office', f'{n}·衙门', f'南={cid}.center', c['office'], ''),
        ('station', f'{n}·车马行', f'北={cid}.center', c['station'] + '\n在这里可以 乘车 去别的城市。', 'station: true'),
    ]
    npcs = {'office': f'{cid}.officer', 'station': f'world.npc.{cid}_bandit'}
    for key, name, exits, desc, extra in rooms:
        lines += [f'=== room: {cid}.{key}', f'name: {name}', f'exits: {exits}']
        if key in npcs:
            lines.append(f'npcs: {npcs[key]}')
        if extra:
            lines.append(extra)
        lines += ['---', desc, '']

    # 衙门差事
    o = c['officer']
    lines += [f'=== npc: {cid}.officer', f'name: {o}', f'brief: {n}衙门的公差，发放除害、送信之类的差事。',
              f'talk: {cid}.officer.talk', '---', c['officer_desc'], '']
    # 城市差事每天各做一次（D-054）：today 键在完成时记下
    lines += [f'=== dialog: {cid}.officer.talk', f'ifnone: {o}：今天的差事都派完了，明天再来吧。', '---',
              f'{o}：这位{{男:兄弟|女:姑娘}}，可是来领差事的？赏钱不多，胜在实在。']
    lines.append(f'* 有什么除害的差事？ -> {cid}.job.bandit ?!flag:world.job.bandit_{cid} ?!today:world.job.bandit_{cid}')
    lines.append(f'* 听说城里闹飞贼？ -> {cid}.job.thief ?!flag:world.job.thief_{cid} ?!today:world.job.thief_{cid}')
    lines.append(f'* 要不要去客栈查查外乡人？ -> {cid}.job.patrol ?!flag:world.job.patrol_{cid} ?!today:world.job.patrol_{cid}')
    for to in neighbors(cid):
        lines.append(f'* 有信要送去{NAMES[to]}吗？ -> {cid}.job.mail_{to} ?!flag:world.job.mail_{to} ?!today:world.job.mailday_{cid}_{to}')
    for frm in neighbors(cid):
        lines.append(f'* 交上{NAMES[frm]}衙门托付的书信 -> {cid}.job.deliver_{frm} ?flag:world.job.mail_{cid}_from_{frm}')
    lines += ['* 离开', '']
    # 飞贼（战斗）与巡查（走到客栈即完成）
    lv = c['bandit_lv']
    lines += [f'=== dialog: {cid}.job.thief', f'do: flag:world.job.thief_{cid}', '---',
              f'{o}：这几天市集上丢东西的人多，是个手脚利落的飞贼干的。去市集把他揪出来，赏钱一百二十文。',
              f'（差事：在{n}市集缉拿飞贼）', '']
    lines += [f'=== enemy: world.foe.{cid}_thief', 'weapon: 匕首', f'name: 飞贼',
              f'attrs: 根骨={10 + lv // 4}, 身法={18 + lv // 4}, 悟性=12',
              f'skills: base.zhang={lv + 10 + c.get("thief_bonus", 0)}, base.quan={lv + 4 + c.get("thief_bonus", 0)}, base.zhaojia={lv + 4 + c.get("thief_bonus", 0)}, base.tuna={lv + 8 + c.get("thief_bonus", 0)}',
              'ai: 巧=3, 刚=1, 守=1', 'cunning: 25', f'potential: {lv * 2 + 6}', '---', '一个精瘦的汉子，眼珠滴溜溜乱转，袖子里鼓鼓囊囊的。', '']
    lines += [f'=== npc: world.npc.{cid}_thief', 'name: 飞贼', f'brief: 在{n}市集偷东西的飞贼。', f'if: flag:world.job.thief_{cid}',
              f'talk: world.{cid}_thief.talk', '---', '一个精瘦的汉子在人群里钻来钻去，手不太老实。', '']
    lines += [f'=== dialog: world.{cid}_thief.talk', '---', '飞贼被你盯上，脸色一变，手已摸向腰间。', f'* 拿下他 !fight:world.b.{cid}_thief', '* 算了', '']
    lines += [f'=== battle: world.b.{cid}_thief', f'enemies: world.foe.{cid}_thief', '# 难度调校（tools/tune.mjs）', f'hpx: {c.get("thief_hpx", 1)}',
              f'win: world.{cid}_thief.win', '---', '飞贼拔出一把匕首，寒光一闪。', '']
    lines += [f'=== dialog: world.{cid}_thief.win', f'do: unflag:world.job.thief_{cid} today:world.job.thief_{cid} money:120', '---',
              '飞贼被你按倒在地，偷来的钱袋散了一地。（差事完成，赏钱一百二十文）', '']
    lines += [f'=== patch: {cid}.market', f'npcs: world.npc.{cid}_thief', '']
    lines += [f'=== dialog: {cid}.job.patrol', f'do: flag:world.job.patrol_{cid}', '---',
              f'{o}：近来外乡人多，去客栈查一查住店的有没有可疑之人。不用动手，看一圈回来就行。赏钱四十文。',
              f'（差事：去{n}客栈查访）', '']
    lines += [f'=== trigger: world.t.{cid}_patrol', f'room: {cid}.inn', f'if: flag:world.job.patrol_{cid}',
              f'do: unflag:world.job.patrol_{cid} today:world.job.patrol_{cid} money:40 potential:15', '---',
              '你跟掌柜要来住店的名簿翻了一遍，又在大堂里转了转，没发现什么可疑之人。（差事完成，赏钱四十文）', '']
    lines += [f'=== dialog: {cid}.job.bandit', f'do: flag:world.job.bandit_{cid}', '---',
              f'{o}：{c["bandit_where"]}有一伙{c["bandit"]}作乱，去把他们打发了，赏钱八十文。',
              f'（差事：在{n}车马行外教训{c["bandit"]}）', '']
    for to in neighbors(cid):
        r = mail_reward(cid, to)
        lines += [f'=== dialog: {cid}.job.mail_{to}', f'do: flag:world.job.mail_{to} flag:world.job.mail_{to}_from_{cid}', '---',
                  f'{o}递给你一个封了火漆的信封：“送到{NAMES[to]}衙门，那边自会付你 {r} 文脚钱。”',
                  f'（差事：把书信送到{NAMES[to]}衙门。坐马车 {DAYS[(cid, to)]} 日可到）', '']
    for frm in neighbors(cid):
        r = mail_reward(frm, cid)
        lines += [f'=== dialog: {cid}.job.deliver_{frm}',
                  f'do: unflag:world.job.mail_{cid} unflag:world.job.mail_{cid}_from_{frm} money:{r} potential:10 today:world.job.mailday_{frm}_{cid}', '---',
                  f'{o}拆开火漆看了看，点点头，数了 {r} 文钱给你。', f'{o}：一路辛苦。', '']

    # 本地匪患
    b = c['bandit']
    lv = c['bandit_lv']
    lines += [f'=== enemy: world.foe.{cid}_bandit', f'name: {b}', f'weapon: {c["weapon"]}', f'weaponName: {c["weapon_name"]}',
              f'attrs: 根骨={12 + lv // 4}, 身法={12 + lv // 5}, 悟性=10',
              f'skills: base.quan={lv}, base.zhang={max(1, lv - 4)}, base.zhaojia={max(1, lv - 4)}, base.tuna={lv}',
              'ai: 刚=3, 巧=2, 守=1', 'cunning: 15', f'potential: {lv * 2}', '---', c['bandit_desc'], '']
    lines += [f'=== npc: world.npc.{cid}_bandit', f'name: {b}', f'brief: 在{n}一带作乱的{b}。',
              f'if: flag:world.job.bandit_{cid}', f'talk: world.{cid}_bandit.talk', '---', c['bandit_desc'], '']
    lines += [f'=== dialog: world.{cid}_bandit.talk', '---', f'{b}：哟，又来一个送死的？',
              f'* 动手 !fight:world.b.{cid}_bandit', '* 走开', '']
    lines += [f'=== battle: world.b.{cid}_bandit', f'enemies: world.foe.{cid}_bandit, world.foe.{cid}_bandit',
              '# 难度调校：面向的玩家猜对 80% 时胜率约 75%（tools/tune.mjs）', f'hpx: {c.get("battle_hpx", 1)}',
              f'win: world.{cid}_bandit.win', '---', f'两个{b}抽出兵刃围了上来。', '']
    lines += [f'=== dialog: world.{cid}_bandit.win', f'do: unflag:world.job.bandit_{cid} today:world.job.bandit_{cid} money:80', '---',
              f'{b}丢下兵刃，作鸟兽散。（差事完成，赏钱八十文）', '']

    # 任务清单（D-045）：flag 设着时显示在"江湖 → 任务"里
    lines += ['# ---------------- 任务清单 ----------------', '']
    lines += [f'=== quest: world.q.{cid}_thief', f'name: 缉拿：{n}飞贼', f'flag: world.job.thief_{cid}', f'where: {cid}.market', '---',
              f'{n}衙门的差事：去市集缉拿飞贼。赏钱 120 文。', '']
    lines += [f'=== quest: world.q.{cid}_patrol', f'name: 查访：{n}客栈', f'flag: world.job.patrol_{cid}', f'where: {cid}.inn', '---',
              f'{n}衙门的差事：去客栈查访外乡人。赏钱 40 文。', '']
    lines += [f'=== quest: world.q.{cid}_bandit', f'name: 除害：{b}', f'flag: world.job.bandit_{cid}',
              f'where: {cid}.station', '---', f'{n}衙门的差事：去{n}车马行教训{c["bandit_where"]}作乱的{b}。赏钱 80 文。', '']
    for to in neighbors(cid):
        lines += [f'=== quest: world.q.mail_{cid}_{to}', f'name: 送信：{n} → {NAMES[to]}',
                  f'flag: world.job.mail_{to}_from_{cid}', f'where: {OFFICE.get(to, to + ".office")}', '---',
                  f'把{n}衙门的书信送到{NAMES[to]}衙门，脚钱 {mail_reward(cid, to)} 文。坐马车 {DAYS[(cid, to)]} 日。', '']
    return '\n'.join(lines).rstrip() + '\n'


if __name__ == '__main__':
    for cid, c in CITIES.items():
        with open(os.path.join(ROOT, f'{cid}.md'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(gen(cid, c))
        print('写入', cid)
    # 临安的差事（临安的房间是手写的，这里只生成差事和送信部分）
    print('临安邻居：', neighbors('linan'))
