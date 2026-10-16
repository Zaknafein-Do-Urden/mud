// 天赋树（D-044）：三支，对应刚、巧、守。天赋点来自修为（所有武功等级之和）。
// 天赋的效果需要代码配合（战斗公式里的钩子），所以定义写在代码里而不是内容文件里。

export const TALENT_STEP = 25; // 每 25 点修为得 1 个天赋点
const BASE_XIUWEI = 40; // 开局四门基础武功各 10 级

/** 每支 4 个天赋，必须先点前一个（至少 1 级）才能点后一个 */
export const TALENT_TREE = [
  {
    id: 'gang', name: '刚猛', stance: '刚',
    nodes: [
      { id: 'manli', name: '蛮力', max: 3, desc: '刚招威力 +4% / 级' },
      { id: 'pojia', name: '破甲', max: 1, desc: '刚招破防时，伤害倍率由 ×1.5 提高到 ×1.8' },
      { id: 'zhongchuang', name: '重创', max: 2, desc: '造成的内伤每回合伤害 +25% / 级' },
      { id: 'wangqian', name: '一往无前', max: 1, desc: '刚招被巧克制时，伤害倍率由 ×0.5 提高到 ×0.65' },
    ],
  },
  {
    id: 'qiao', name: '灵巧', stance: '巧',
    nodes: [
      { id: 'xunjie', name: '迅捷', max: 3, desc: '身法 +2 / 级（出手更快）' },
      { id: 'huiyan', name: '慧眼', max: 3, desc: '看破虚招的概率 +10% / 级' },
      { id: 'ruili', name: '锐利', max: 3, desc: '巧招威力 +4% / 级' },
      { id: 'youren', name: '游刃', max: 1, desc: '巧招被守克制时，伤害倍率由 ×0.5 提高到 ×0.65，所受反震减半' },
    ],
  },
  {
    id: 'shou', name: '坚韧', stance: '守',
    nodes: [
      { id: 'tiegu', name: '铁骨', max: 3, desc: '气血上限 +5% / 级' },
      { id: 'tuna', name: '吐纳', max: 3, desc: '调息时多恢复 3% 内力上限 / 级' },
      { id: 'fanzhen', name: '反震', max: 2, desc: '守势反震伤害 +25% / 级' },
      { id: 'taishan', name: '稳如泰山', max: 1, desc: '守势被刚招破防时，所受伤害倍率由 ×1.5 降到 ×1.3' },
    ],
  },
];

const NODE = Object.fromEntries(TALENT_TREE.flatMap((b) => b.nodes.map((n, i) => [n.id, { ...n, branch: b, index: i }])));

/** 修为：所有已学武功等级之和 */
export function xiuwei(p) {
  return Object.values(p.skills).reduce((a, lv) => a + lv, 0);
}

export function talentPointsTotal(p) {
  return Math.max(0, Math.floor((xiuwei(p) - BASE_XIUWEI) / TALENT_STEP));
}

export function talentPointsSpent(p) {
  return Object.values(p.talents ?? {}).reduce((a, n) => a + n, 0);
}

/** 天赋等级（战斗中对 unit 也适用：unit.talents 是玩家天赋的拷贝） */
export function tal(x, id) {
  return x?.talents?.[id] ?? 0;
}

/** 能否再点一级。返回 null 表示可以，否则返回原因 */
export function canAddTalent(p, id) {
  const n = NODE[id];
  if (!n) return '没有这个天赋。';
  if (tal(p, id) >= n.max) return `${n.name}已经点满了。`;
  if (talentPointsSpent(p) >= talentPointsTotal(p)) return '天赋点不足。修为每提高 25 点，获得 1 个天赋点。';
  if (n.index > 0 && !tal(p, n.branch.nodes[n.index - 1].id)) return `要先点"${n.branch.nodes[n.index - 1].name}"。`;
  return null;
}

export function talentNode(id) { return NODE[id]; }

export function findTalent(name) {
  return Object.values(NODE).find((n) => n.id === name || n.name === name);
}

/** 下一个天赋点还差多少修为 */
export function xiuweiToNext(p) {
  const x = xiuwei(p) - BASE_XIUWEI;
  return TALENT_STEP - (((x % TALENT_STEP) + TALENT_STEP) % TALENT_STEP);
}
