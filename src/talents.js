// 天赋树（D-044，D-107 重做）：不再是给刚、巧、守加数值，而是五条"机制"线：
// 制敌（控制对手）、医术（回复自己和队友）、洞察（看穿招式）、应变（化险为夷）、内息（内力的运用）。
// 天赋点来自门派阶位和主线进度（D-107、D-108），每条线 7 点，终局能点满两条多。
// 天赋的效果需要代码配合（战斗公式里的钩子），所以定义写在代码里而不是内容文件里。

/** 每条线的天赋按顺序解锁：必须先点前一个（至少 1 级）才能点后一个 */
export const TALENT_TREE = [
  {
    id: 'zhidi', name: '制敌', desc: '点穴、缴械、内伤：让对手有力使不出',
    nodes: [
      { id: 'jiemai', name: '截脉', max: 3, desc: '招式没被克制时，有 6% / 级的机会顺势点中对手穴道（即使招式本身不带点穴）' },
      { id: 'xiebing', name: '卸兵', max: 2, desc: '招式自带的缴械成功率 +15% / 级' },
      { id: 'zhongchuang', name: '重创', max: 1, desc: '你造成的内伤多发作两回合（3 → 5 回合）' },
      { id: 'fengxue', name: '封穴', max: 1, desc: '被你点中穴道的对手，要僵住两回合' },
    ],
  },
  {
    id: 'yishu', name: '医术', desc: '疗伤、回气：让自己和队友撑得更久',
    nodes: [
      { id: 'miaoshou', name: '妙手', max: 3, desc: '疗伤、回气类辅助招式的效果 +20% / 级' },
      { id: 'liaoshang', name: '调息疗伤', max: 2, desc: '调息时，同时恢复 4% / 级的气血上限' },
      { id: 'jinchuang', name: '金创', max: 1, desc: '打赢一场后，全队恢复 20% 气血上限' },
      { id: 'shengsheng', name: '生生不息', max: 1, desc: '战斗中每回合结束，全队恢复 2% 气血上限' },
    ],
  },
  {
    id: 'dongcha', name: '洞察', desc: '看破虚招、藏招，看清对手的意图',
    nodes: [
      { id: 'huiyan', name: '慧眼', max: 3, desc: '看破虚招、看穿藏招的概率 +10% / 级' },
      { id: 'liaodi', name: '料敌', max: 1, desc: '对手的目标人人看得见，但虚招会摆出假目标、藏招看不出目标；料敌能看穿每个对手这一招真正要打谁' },
      { id: 'houfa', name: '后发制人', max: 2, desc: '你的招克制了对手时，有 20% / 级的机会让他露出破绽（下一次受伤 +30%）' },
      { id: 'xianji', name: '洞察先机', max: 1, desc: '对手的藏招对你无效：总能看出他要出的势' },
    ],
  },
  {
    id: 'yingbian', name: '应变', desc: '闪避、护法、绝境求生：化险为夷',
    nodes: [
      { id: 'lingkong', name: '凌空', max: 3, desc: '被对手的招克制时，有 8% / 级的机会闪开这一下' },
      { id: 'dingshen', name: '定神', max: 1, desc: '调息、换兵器、被点穴时不再门户大开（所受伤害不再加成）' },
      { id: 'hufa', name: '护法', max: 2, desc: '用守招护住队友时，替他挡下的伤害 -20% / 级' },
      { id: 'beishui', name: '背水', max: 1, desc: '每场战斗一次：受到致命一击时，留住最后一口气（气血 1）' },
    ],
  },
  {
    id: 'neixi', name: '内息', desc: '内力的运用：越打越有余力',
    nodes: [
      { id: 'tuna', name: '吐纳', max: 2, desc: '你的招克制了对手时，回复 3% / 级的内力上限' },
      { id: 'zhoutian', name: '小周天', max: 2, desc: '战斗中每回合结束，回复 2% / 级的内力上限' },
      { id: 'jieli', name: '借力', max: 2, desc: '守势反震巧招时，顺势吸走对手的内力（反震伤害的 25% / 级）' },
      { id: 'qichen', name: '气沉丹田', max: 1, desc: '内力不够时仍能出招：不足的内力以两倍气血代替（气血不够则不行）' },
    ],
  },
];

const NODE = Object.fromEntries(TALENT_TREE.flatMap((b) => b.nodes.map((n, i) => [n.id, { ...n, branch: b, index: i }])));

export function talentPointsSpent(p) {
  return Object.values(p.talents ?? {}).reduce((a, n) => a + n, 0);
}

/** 天赋等级（战斗中对 unit 也适用：unit.talents 是玩家天赋的拷贝） */
export function tal(x, id) {
  return x?.talents?.[id] ?? 0;
}

/** 能否再点一级。total：现有的天赋点总数（来源见 game-martial 的 talentPoints）。返回 null 表示可以，否则返回原因 */
export function canAddTalent(p, id, total) {
  const n = NODE[id];
  if (!n) return '没有这个天赋。';
  if (tal(p, id) >= n.max) return `${n.name}已经点满了。`;
  if (talentPointsSpent(p) >= total) return '天赋点不足。门派每晋升一阶得 1 点；每条主线走到三成、七成左右和完结时各得 1 点。';
  if (n.index > 0 && !tal(p, n.branch.nodes[n.index - 1].id)) return `要先点"${n.branch.nodes[n.index - 1].name}"。`;
  return null;
}

export function talentNode(id) { return NODE[id]; }

export function findTalent(name) {
  return Object.values(NODE).find((n) => n.id === name || n.name === name);
}

/** 老存档里已经不存在的天赋 id（D-107 重做后的迁移用） */
export function unknownTalents(talents) {
  return Object.keys(talents ?? {}).filter((id) => !NODE[id]);
}
