# 江湖夜雨 · 武侠 MUD

纯静态网页文字 MUD，部署在 GitHub Pages。存档保存在浏览器本地，可导出为文本在其他浏览器导入。

- 设计文档：[docs/DESIGN.md](docs/DESIGN.md)
- 开发日志与决策记录：[docs/DEVLOG.md](docs/DEVLOG.md)
- 剧情内容：[content/](content/)（语法见设计文档 §5）

## 本地运行

浏览器不允许 `file://` 页面读取内容文件，需要起一个静态服务器：

```bash
python -m http.server 8000
```

然后打开 http://localhost:8000 。

修改剧情内容后，运行校验：

```bash
node tools/validate.mjs
```

调整战斗数值后，可以跑平衡模拟（按猜对率列胜率），以及按"猜对 80%"的标准调校固定难度的战斗：

```bash
node tools/balance.mjs
```

```bash
node tools/tune.mjs
```

## 联机

在旅店或门派驻地点"开设队伍"；朋友到同一个旅店或门派驻地点"搜索队伍"，从列表里选你的队伍加入。队长可以把成员踢出队伍。
一台电脑上测试：开两个标签页 `/?net=local` 和 `/?net=local&slot=2`。

## 部署

仓库 Settings → Pages → 选择 `main` 分支根目录即可。`.nojekyll` 让 GitHub Pages 原样提供 `.md` 内容文件。

## 声明

本项目是**非官方、非商业**的金庸武侠同人作品，仅供学习与交流。
游戏中涉及的人物、门派、武功等名称及原著设定，版权归金庸先生及相关权利人所有。
游戏内所有文字均为原创撰写，未复制原著文本。
本项目不收费、不含广告、不接受打赏。如权利人认为本项目侵犯其权益，请通过 Issue 联系，我们将立即下架相关内容。
