// 可调参数总表（D-116）：数值平衡、难度、经济、联机等能手动改的参数都集中在这里。
// 改完刷新页面即可生效（没有构建）。涉及战斗数值的，改完跑 node tools/balance.mjs 看看胜率。
// 以后开发新功能，凡是"以后可能想调"的数字，一律加到这里，不要散在各个文件里写死。
// 只放数值和开关；招式、门派、剧情这类内容仍写在 content/ 里。

export const CONFIG = {
  // ---- 敌人强弱按我方战斗力浮动（D-051、D-106、D-115，combat.js 的 adaptEnemyHp）----
  adapt: {
    // 我方战斗力的权重：主角 ×1 + 每个 NPC 队友 ×1 + 每个联机客人 ×0.5
    host: 1,
    ally: 1,
    guest: 0.5,
    acc: 0.6, // 设计时假定玩家猜对几成
    rounds: 6, // 按这个猜对率，约几回合打完全部敌人
    taken: 0.6, // 打完时主角约掉多少比例的气血
    hpMin: 0.25, // 敌人气血相对模板的缩放下限
    hpCap: 3, // ……上限（太大成了肉盾，太小一碰就倒）
    dmgMin: 0.1, // 敌人伤害倍率的下限
    dmgCap: 8, // ……上限
    hardMin: 0.8, // 难度系数（劫道按货值给）的范围
    hardMax: 1.25,
  },

  // ---- 战斗规则（combat.js）----
  combat: {
    // 攻方势 × 受方姿态 → 伤害倍率（COMBAT.md §4.2）：克制、被克、打在没摆架势（调息、被点穴）的人身上
    counterMult: 1.5,
    counteredMult: 0.5,
    openMult: 1.2,
    restRate: 0.1, // 调息回复内力上限的比例
    aoeRate: 0.6, // 群攻招式对多个对手时，每人受的伤害比例（D-081）
    partyHpPerExtra: 0.7, // 不自适应的战斗（必败战、陪练）：每多一个玩家，敌人气血加几成
    allyAutoRounds: 60, // 玩家全倒、NPC 队友自己打，最多再打几回合（打不完算输）
  },

  // ---- 战斗结果（game-martial.js、game-trade.js）----
  outcome: {
    reviveHp: 1, // 打赢后，战斗中倒下的人回到几点气血（D-115）
    loseHpRate: 0.3, // 必败剧情战、劫道输了、晋阶考核没过，醒来时的气血比例
    robberyMoneyLoss: 0.5, // 劫道输了，被搜走的现钱比例（货物全丢）
  },

  // ---- 角色（character.js）----
  character: {
    maxOuter: 4, // 外功栏格数
    baseCap: 50, // 基础武功等级上限
  },

  // ---- 武学威力报表（power.js）----
  power: {
    standard: 25, // 标准威力
  },

  // ---- 经济、跑商（economy.js，ECONOMY.md）----
  economy: {
    cargoCap: 100, // 马车最多装几件货（D-077）
    sellRate: 0.9, // 卖价是行情价的几成
    wave: 0.1, // 每天价格波动 ±
    foreignBase: 1.15, // 外地货的基础倍率
    foreignPerDay: 0.06, // 离最近产地每多一天路程加多少
    foreignCap: 1.8, // 外地货倍率上限
  },

  // ---- 劫道、镖师（economy.js、game-trade.js，D-040、D-104、D-115）----
  robbery: {
    perDay: 0.03, // 每天路程加多少被劫概率
    valueWeight: 0.5, // 货值带来的被劫概率最多加多少
    valueScale: 5000, // 货值到这个数时，上面那部分加一半
    maxChance: 0.65, // 被劫概率上限
    countAt: [3000, 15000], // 货值加现钱到这些数，劫匪各多一人（起步一人）
    hardExtra: 0.2, // 货越值钱越难：难度系数最多加几成
    hardScale: 50000, // 货值加现钱到这个数时加满
    escortRate: 0.4, // 雇了镖师，被劫概率乘这个数
    escortBaseFee: 50, // 镖师起步价（文）
    escortFeeRate: 0.08, // 再加货值的几成
  },

  // ---- 马车奇遇（game-trade.js，D-114）----
  qiyu: {
    rate: 0.2, // 没遇上劫道时，碰上小故事的概率
    recent: 5, // 全部看过一遍后重新洗牌，最近看过的这几个排到最后
    money: [50, 150], // 选对了给的钱（文）
    potential: [20, 60], // 选对了给的潜能
    attr: 0.08, // 根骨、身法、悟性随机一项 +1 的概率
    book: 0.03, // 送秘籍的概率
    bookStep: 20, // 已经会了，再读一本提高的上限
    bookMax: 100, // 秘籍上限最高到多少
  },

  // ---- 联机（game-party.js、ui/party.js）----
  party: {
    maxGuests: 3, // 最多几个客人（队伍人数 = 这个 + 1）
    roundSeconds: 20, // 组队时每回合出招时限（秒）
  },
};
