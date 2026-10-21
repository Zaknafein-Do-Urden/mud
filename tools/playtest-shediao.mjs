// 射雕英雄传第十一~二十章的脚本走查：node tools/playtest-shediao.mjs
// 五个分章脚本在 tools/playtest-shediao/（写章节的会话各写一份），这里依次跑，任何一份报错就以退出码 1 结束。
// 写法照 tools/playtest-xiaoao.mjs：在 Node 里建 Game，exec 命令，战斗时把敌人气血压到 1。
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'playtest-shediao');
let bad = 0;
for (const f of ['ch11-12.mjs', 'ch13-14.mjs', 'ch15-16.mjs', 'ch17-18.mjs', 'ch19-20.mjs']) {
  const r = spawnSync(process.execPath, [join(dir, f)], { encoding: 'utf8' });
  const out = (r.stdout + r.stderr).trim();
  console.log(`== ${f}\n${out.split('\n').slice(-6).join('\n')}`);
  if (r.status !== 0) bad++;
}
if (bad) { console.log(`\n${bad} 份走查有问题`); process.exit(1); }
console.log('\n✓ 射雕第十一~二十章全部走通');
