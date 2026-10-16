# 武侠 MUD 设计文档

> 本文描述"现在的设计是什么"。分册：[COMBAT.md](COMBAT.md) 战斗与武学 · [MULTIPLAYER.md](MULTIPLAYER.md) 联机 · [UX.md](UX.md) 交互与界面 · [STORY.md](STORY.md) 剧情结构。
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
  ui/
    text.js         [[链接]] 渲染
    cards.js        悬停信息卡、右键固定
    complete.js     Tab 补全、拼音匹配
content/
  index.json        内容清单（静态站点无法列目录，需要清单）
  world/            共享世界
  shediao/          射雕英雄传主线：hook.md 总是加载，其余按需加载
tools/
  validate.mjs      内容校验：node tools/validate.mjs
docs/               设计文档与开发日志
```

无构建步骤：原生 ES Module，直接推到 GitHub Pages 即可运行（见 DEVLOG D-003）。

## 4. 存档

- **存储位置**：`localStorage`，键名带前缀 `wuxia-mud:`（见 D-001：为何不用 cookie；D-002：为何必须加前缀）。
- **自动存档**：每条命令执行后写入。
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
- 条件：`flag:x`、`has:物品`、`visited:房间`。
- 效果：`flag:x`、`unflag:x`、`give:物品`、`take:物品`、`goto:房间`、`start:主线`、`chapter:章节`。
- **链接**：正文中写 `[[显示名|id]]`，id 可以是人物、物品、房间、百科条目。在场人物的名字会被自动加上链接。
- **命名空间**：world 文件只写 `world.*` 标记，主线文件只写 `<主线>.*` 标记；主线中的 id 以主线名开头。由校验脚本检查。

### 5.2 块类型

| 类型 | 用途 | 主要属性 |
|---|---|---|
| `meta` | 游戏标题、起点、开场白 | `title`、`start` |
| `room` | 房间 | `name`、`exits`、`npcs` |
| `npc` | 人物 | `name`、`brief`、`talk`、`if`（出现条件） |
| `item` | 物品 | `name` |
| `dialog` | 对话节点 | `pace: slow`（重场戏逐段出现）、`do`（进入即生效的效果） |
| `entry` | 百科条目，供信息卡逐层查阅 | `name` |
| `storyline` | 主线 | `name`、`level` |
| `chapter` | 章节标题页 | `storyline`、`name` |
| `trigger` | 进入房间时触发 | `room`、`if`、`once: true`、`do`、`dialog` |
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
2. **战斗**：单机战斗，引擎仍是纯逻辑。
3. **联机**：Trystero 接入，主机权威同步，组队战斗、合击。
4. **内容工具**：校验脚本 + CI，按需拆分/懒加载区域文件。
