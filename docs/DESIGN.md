# 武侠 MUD 设计文档

> 本文描述"现在的设计是什么"。分册：[COMBAT.md](COMBAT.md) 战斗与武学 · [SECT.md](SECT.md) 门派 · [ECONOMY.md](ECONOMY.md) 经济与旅行 · [MULTIPLAYER.md](MULTIPLAYER.md) 联机 · [UX.md](UX.md) 交互与界面 · [STORY.md](STORY.md) 剧情结构。
>"为什么这样设计、放弃了什么"记录在 [DEVLOG.md](DEVLOG.md)。

## 1. 核心约束

| 约束 | 含义 |
|---|---|
| 部署在 GitHub Pages | 只有静态文件，没有任何自有后端 |
| 存档在本地 | 服务器不保存任何玩家数据；存档可导出为文本文件，在别的浏览器导入 |
| 重剧情探索 | 文本量会很大，内容创作的效率比代码更重要 |
| 多人合作 | 2~4 人组队探索、战斗，无服务器条件下联机 |

## 2. 总体架构

```
┌──────────────────────── 浏览器（每个玩家一份）────────────────────────┐
│                                                                      │
│  UI 层（终端式输出 + 输入框 + 快捷按钮）                              │
│        │ 文本命令                ▲ 事件 / 文本                        │
│        ▼                         │                                   │
│  命令解析 ──► 游戏引擎（纯逻辑：state + command → state' + events）   │
│                 │            │                                       │
│        内容库（只读）    存档层（localStorage / 导入导出）             │
│        content/*.md                                                  │
│                                                                      │
│  联机层（第 3 阶段）：WebRTC DataChannel，主机权威                    │
└──────────────────────────────────────────────────────────────────────┘
```

关键原则：**引擎是纯逻辑**，不碰 DOM、不碰网络、不碰存储。
单机模式下 UI 直接调用引擎；联机模式下引擎只在主机上运行，客户端把命令发给主机、接收事件。这样单机与联机共用同一套规则代码。

## 3. 目录结构

```
index.html          入口
style.css
src/
  main.js           启动、UI 绑定、输出队列（重场戏逐段出现）
  game.js           游戏引擎：命令处理（纯逻辑）
  content.js        内容文件解析器 / 加载器（world + 按需加载主线）
  save.js           存档：本地保存、导出、导入、版本迁移
  character.js      角色数值：派生属性、武功上限
  combat.js         战斗引擎（纯逻辑，战斗状态可存档）
  game-martial.js   引擎的武学部分：战斗流程、门派、修炼、旅店
  game-trade.js     引擎的经济部分：金钱、市场、钱庄、马车
  game-views.js     给界面面板的只读数据
  talents.js        天赋树
  game-party.js     引擎的联机部分（房主一侧）
  net/transport.js  联机传输层
  economy.js        价格、车资、劫道概率（纯函数）
  ui/
    text.js         [[链接]] 渲染
    cards.js        悬停信息卡、右键固定
    complete.js     Tab 补全、拼音匹配
    combat.js       战斗面板
    map.js          区域地图
    worldmap.js     大地图
    panels.js       人物、江湖、市集、钱庄面板
    party.js        联机控制
content/
  index.json        内容清单（静态站点无法列目录，需要清单）
  world/            共享世界
  shediao/          射雕英雄传主线：hook.md 总是加载，其余按需加载
tools/
  validate.mjs      内容校验：node tools/validate.mjs
  balance.mjs       战斗平衡模拟：node tools/balance.mjs
  gen_cities.py     城市内容骨架生成器
  tune.mjs          固定难度战斗的调校：node tools/tune.mjs
docs/               设计文档与开发日志
```

无构建步骤：原生 ES Module，直接推到 GitHub Pages 即可运行（见 DEVLOG D-003）。

## 4. 存档

- **存储位置**：`localStorage`，键名带前缀 `wuxia-mud:`（见 D-001：为何不用 cookie；D-002：为何必须加前缀）。
- **自动存档**：每条命令执行后写入。进行中的对话也记在存档里（`dialog` 字段），刷新页面或读档后会接着显示选项。
- **存档结构**：
  ```json
  {
    "v": 2,                      // 存档格式版本，用于迁移
    "createdAt": 0, "updatedAt": 0,
    "player": { "name": "", "room": "linan.gate", "hp": 100, "inventory": {"coin": 3} },
    "flags": { "world.beggar_friend": true, "shediao.started": true },   // 剧情标记：剧情状态的唯一真相
    "visited": { "linan.gate": true }
  }
  ```
- **导出格式**：`WXMUD1:` + base64( deflate( JSON ) ) + `:` + 校验码。
  - 压缩：浏览器原生 `CompressionStream`，无需第三方库。
  - 校验码只用来发现复制粘贴损坏，**不是防作弊**（见 D-005）。
  - 导出为 `.txt` 文件下载；导入支持选文件或直接粘贴文本。
- **版本迁移**：`save.js` 中维护 `migrations[v]`，导入旧存档时逐级升级。

## 5. 内容格式

内容是本项目最大的工作量，格式以"写作者舒服"为第一目标（见 D-004）。
每个文件由若干**块**组成，块以 `=== 类型: id` 开头，`---` 之前是属性，之后是正文。

```
=== room: linan.gate
name: 临安城·钱塘门
exits: 北=linan.street, 东=linan.lake
npcs: linan.beggar
---
城门高耸，守卒倚着长枪打盹。
?!flag:world.beggar_friend 墙根下蜷着一个老乞丐。
?flag:world.beggar_friend 老乞丐冲你挤了挤眼睛。

=== npc: linan.beggar
name: 老乞丐
# brief 是信息卡上的一句话简介
brief: 钱塘门下的老乞丐。
talk: linan.beggar.start
---
一个衣衫褴褛的老乞丐，眼神却亮得出奇。

=== dialog: linan.beggar.start
---
老乞丐：这位客官，行行好……
* 给他一文钱 -> linan.beggar.give ?has:coin !take:coin !flag:world.beggar_friend
* 不理他
```

### 5.1 通用规则

- 以 `#` 开头的行是注释（只能在行首）。
- 正文行首 `?条件 `：条件满足才显示该行，`?!` 为取反，可以连写多个。
- 对话选项 `* 文字 -> 目标 ?条件 !效果`。没有目标也没有效果的选项（如"离开"）总是排在最后。
- 属性中的条件、效果列表（`if:`、`do:`）用空格或逗号分隔，取反写 `!flag:x`。
- 条件：`flag:x`、`has:物品`、`visited:房间`、`sect:门派`（`sect:none` 为无门派）、`rank:数字`（门派阶位不低于）、`gender:男/女`、`money:数字`（身上现钱不少于）、`today:键`（这个键今天已经记过，现实日期）。
- 效果：`flag:x`、`unflag:x`、`give:物品`、`take:物品`、`goto:房间`、`start:主线`、`chapter:章节`、`fight:战斗`、`join:门派`、`rep:门派:数值`、`potential:数值`、`learn:武功`、`heal`、`money:数值`（得钱）、`pay:数值`（付钱）、`travel:城市`、`today:键`（记下今天，用于每天一次的任务）。
- **称呼**：正文中 `{姓名}`、`{姓}`、`{名}` 替换为玩家名字；`{男:兄台|女:姑娘}` 按性别选择。
- **链接**：正文中写 `[[显示名|id]]`，id 可以是人物、物品、房间、百科条目。在场人物的名字会被自动加上链接。
- **命名空间**：world 文件只写 `world.*` 标记，主线文件只写 `<主线>.*` 标记；主线中的 id 以主线名开头。由校验脚本检查。

### 5.2 块类型

| 类型 | 用途 | 主要属性 |
|---|---|---|
| `meta` | 游戏标题、起点、开场白 | `title`、`start` |
| `room` | 房间 | `name`、`exits`、`npcs`、`inn: true`（旅店：休息、修炼、战败复活点、组队）、`restmsg`（休息时的描述）、`train: true`（可修炼，如门派驻地）、`station: true`（车马行）、`market: true`（市集）、`bank: true`（钱庄） |
| `npc` | 人物 | `name`、`brief`、`talk`、`if`（出现条件）、`teaches: 门派`（门派师父：学艺、晋阶） |
| `item` | 物品 | `name`、`verb`（专用动词，如"吹"）、`usefail`（用了但没效果时的文字） |
| `dialog` | 对话节点 | `ifnone`（除离开外没有任何选项时显示的话）、`pace: slow`（重场戏逐段出现）、`lock: true`（剧情对话，必须做出选择才能离开，锁定一直延续到这条对话链结束）、`do`（进入即生效的效果） |
| `entry` | 百科条目，供信息卡逐层查阅 | `name` |
| `storyline` | 主线 | `name`、`level`、`hint`（未开始时给玩家的线索） |
| `chapter` | 章节标题页与检查点 | `storyline`、`name`、`done`（完成条件，用于主线进度）、`start`（重来时回到的房间）、`retry`（重来提示） |
| `trigger` | 进入房间时触发 | `room`、`if`、`once: true`、`do`、`dialog` |
| `use` | 在某处（或任何地方）使用某物品时发生的事 | `item`、`room`（可省略）、`if`、`once: true`、`do`、`dialog` |
| `skill` | 武功 | `kind`（外功/内功/轻功）、`stance`（外功：刚/巧/守）、`weapon`（用的兵器，默认拳）、`sect`、`rank`（需要的门派阶位）、`cap`（门派外武功的典籍上限）；内功另有 `hp`、`mp`、`affinity` |
| `move` | 招式 | `skill`、`name`、`level`（解锁等级）、`power`、`mp`、`effects`（内伤、点穴、破绽、吸内:系数、化内:系数）、`omen`（预兆，可用 | 分隔多种）；正文是出招描述，可用 $N $n $招 $部位 |
| `enemy` | 敌人 | `name`、`attrs`、`skills`（武功id=等级）、`ai`（各势权重）、`pattern`（固定出势顺序）、`cunning`（虚招概率%）、`potential`、`hpx`（气血倍率）、`weapon` / `weaponName`（兵器标签）、`obscure`（藏招概率%）、`robber: true`（劫匪模板） |
| `battle` | 一场战斗 | `enemies`、`win` / `lose`（胜负后的对话）、`flee: false`（不可逃跑）、`hpx`（这一场的敌人气血倍率，调校用）、`adapt: true`（按玩家功力自适应）。没有 lose 时：世界战斗战败回旅店，主线战斗回到章节开始 |
| `sect` | 门派 | `ranks`（阶位名=所需声望）、`caps`（各阶武功上限）、`examiner`（晋阶考核者） |
| `city` | 城市 | `name`、`pos`（大地图坐标）、`station`、`routes`（城市=天数）、`goods`（货物=倍率）、`areas`（属于本城的其他区域，如 shaolin） |
| `goods` | 货物 | `name`、`price`（基准价） |
| `quest` | 任务清单条目 | `name`、`flag`（这个标记设着时显示在任务清单里）、`where`（地点房间）；正文是说明 |
| `goal` | 主线当前目标 | `storyline`、`if`（条件）；按文件顺序取第一个条件满足的；正文是目标说明 |
| `patch` | 往别处定义的房间或对话里追加内容（STORY.md §5.1） | `if`、`exits`、`npcs`，正文和选项会被追加 |

### 5.3 校验

`node tools/validate.mjs` 检查：引用的房间、人物、对话、物品、链接是否存在；命名空间规则；没有入口的房间。有错误时退出码为 1，之后可以放进 GitHub Actions。

## 6. 战斗系统

详见 [COMBAT.md](COMBAT.md)（讨论中）。要点：

- 同时出招的回合制。联机时每回合限时 20 秒，单机不限时。
- 刚、巧、守三势相克。克制倍率固定，武功等级只提升威力，被克时照样吃亏。
- 内功是根基：提升气血、内力、威力加成。所有招式耗内力，耗尽只能调息。
- 可研究的层次：内功亲和、套路组合、连环、合击、门派克制。还有吸内类武学。
- 敌人用文字透露预兆，会出虚招，首领有路数。剧情中获得的知识直接帮助战斗。
- 战败无惩罚：被人救起，回到最近的旅店。

## 7. 联机

详见 [MULTIPLAYER.md](MULTIPLAYER.md)（讨论中）。要点：

- 传输：WebRTC，信令借助 Trystero 公共中继，兜底方案是手动复制连接码（D-007）。
- 在旅店开设或加入队伍。房主权威：房主的浏览器运行游戏，客人只是终端。
- 房主推进自己的主线；客人只能跟随、建议，出战力，拿战斗收益，不影响自己的主线。
- 每场战斗后立即结算到客人的本地存档；队伍解散后客人回到加入时的旅店。

## 8. 开发阶段

1. **骨架**（已完成）：房间移动、查看、对话、剧情标记、物品、存档导入导出。
2. **战斗**（第一版已完成）：单机战斗，引擎仍是纯逻辑。门派系统第一版（丐帮）。
3. **联机**（第一版已完成）：Trystero 接入，主机权威同步，组队战斗。合击待做。
4. **内容工具**：校验脚本 + CI，按需拆分/懒加载区域文件。
