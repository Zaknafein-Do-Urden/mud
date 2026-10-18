# 英雄传：浏览器武侠 MUD

纯前端（ES modules，无构建），部署在 GitHub Pages；存档在浏览器本地；联机靠 WebRTC，没有后端。金庸同人，非商业。

## 和用户协作

- **一律用中文**：思考、回复、文档、提交信息。
- **只有用户说"commit + push"才推送**。推送会直接部署到公开网站；平时做完一个阶段在本地提交即可。
- **推送前改版本号** `src/version.js`：修 bug 加第三位，新功能、新章节加第二位（D-094）。版本号显示在页面标题上。
- 用户暂时不能回复时，自己选合理的方案继续做，记进 `docs/DEVLOG.md`，注明是代为决定的。
- 每个设计决策在 `docs/DEVLOG.md` 记一条 D-xxx，写清楚取舍。编号按会话分段，见下方"多个会话同时工作时"。

## 写剧情之前必读

**[docs/WRITING.md](docs/WRITING.md)**：用户对剧情的全部要求（版权、章节结构、战斗、门槛、联机、武学秘籍的平衡、防丢规则、检查流程、各主线章节规划）。

写天龙八部的会话再读 **[docs/TIANLONG.md](docs/TIANLONG.md)**（地图、门派关系、章节规划、多会话协作规则）。
写笑傲江湖的会话再读 **[docs/XIAOAO.md](docs/XIAOAO.md)**（同样的交接内容，另有华山派怎么与现有门派共存）。

## 多个会话同时工作时

- 只 `git add` 自己改的文件（写明路径），不要 `git add -A`；不要 checkout / stash / reset 别人正在改的文件。
- 开发日志编号分段：主线会话接着 D-086 往后；天龙八部会话从 D-200 开始。以后再开新主线的会话，从 D-300、D-400 依次往后。
- 共用的内容文件（index.json、world/arts.md、world/combos.md 等）只追加自己的小节。详见 docs/TIANLONG.md §6。

## 常用命令

```bash
node tools/validate.mjs            # 内容校验（引用、命名空间、锁定规则、剧情武学战力规则）
node tools/power.mjs               # 武学威力 / 敌人战斗力报表
node tools/balance.mjs <战斗id>    # 战斗胜率模拟（按猜对率）
node tools/goalcheck.mjs [主线id]  # 当前目标的连贯性（上一章的收尾目标有没有挡住后面）
python -m http.server 8000         # 本地预览：http://localhost:8000/?slot=9（slot 用独立存档）
```

## 目录

- `src/`：引擎（`game.js` 及 `game-*.js` 混入）、战斗 `combat.js`、威力公式 `power.js`、存档 `save.js`、界面 `ui/`、联机 `net/`。
- `content/`：内容。`world/` 共享地图和门派；`<主线>/` 各条剧情；`index.json` 登记文件和剧情顺序。
- `docs/`：设计文档。DESIGN（总体）、STORY（剧情结构）、COMBAT、SECT、POWER、MULTIPLAYER、ECONOMY、UX、TODO-CONTENT、DEVLOG。
- `tools/`：校验、平衡、报表脚本。

## 改代码的约定

- 引擎是纯逻辑，界面只发命令（界面和命令行等价，D-045）。
- 改了存档结构就升 `SAVE_VERSION` 并写迁移（`src/save.js`）。
- 改完跑 `node tools/validate.mjs`；涉及战斗数值的跑 `balance.mjs`。
