// 内容校验：node tools/validate.mjs
// 检查引用是否存在、命名空间规则（STORY.md §4.2）等。有错误时退出码为 1，可用于 CI。

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, addBlocks, emptyDb, parseMap, parseList, splitLinks } from '../src/content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const errors = [];
const warns = [];
const err = (b, msg) => errors.push(`${b.file} [${b.type}: ${b.id}] ${msg}`);
const warn = (b, msg) => warns.push(`${b.file} [${b.type}: ${b.id}] ${msg}`);

// 原生 console.warn 用于解析器的提示，收集起来
const origWarn = console.warn;
console.warn = (...a) => warns.push(a.join(' '));

const db = emptyDb();
const owner = new Map(); // 文件 → 所属命名空间（world 或主线 id）
const files = [...index.world.map((f) => [f, 'world'])];
for (const [id, s] of Object.entries(index.storylines ?? {})) {
  for (const f of [...(s.hook ?? []), ...(s.files ?? [])]) files.push([f, id]);
}
for (const [f, ns] of files) {
  owner.set(f, ns);
  addBlocks(db, parse(readFileSync(join(root, f), 'utf8'), f), f);
}
console.warn = origWarn;

const KNOWN = new Set(['meta', 'room', 'npc', 'item', 'dialog', 'entry', 'storyline', 'chapter', 'trigger', 'use', 'patch', 'skill', 'move', 'enemy', 'battle', 'sect', 'city', 'goods', 'quest', 'goal', 'combo']);
const words = (s = '') => s.split(/[\s,]+/).filter(Boolean);
const linkTarget = (id) => id.startsWith('go:') || ['npc', 'item', 'room', 'entry', 'storyline', 'skill', 'sect'].some((k) => db[k][id]);

function checkConds(b, conds) {
  for (const c of conds) {
    const [kind, key] = c.replace(/^!/, '').split(/:(.*)/);
    if (kind === 'has' && !db.item[key]) err(b, `条件引用了不存在的物品: ${key}`);
    else if (kind === 'visited' && !db.room[key]) err(b, `条件引用了不存在的房间: ${key}`);
    else if (kind === 'sect' && key !== 'none' && !db.sect[key]) err(b, `条件引用了不存在的门派: ${key}`);
    else if (kind === 'rank' && Number.isNaN(Number(key))) err(b, `rank 条件需要数字: ${c}`);
    else if (kind === 'gender' && !['男', '女'].includes(key)) err(b, `gender 条件只能是 男 或 女: ${c}`);
    else if (kind === 'money' && Number.isNaN(Number(key))) err(b, `money 条件需要数字: ${c}`);
    else if (kind === 'learned' && !db.skill[key]) err(b, `learned 条件引用了不存在的武功: ${key}`);
    else if (kind === 'stance' && !/^[刚巧守]:\d+$/.test(key)) err(b, `stance 条件格式应为 stance:刚:45，却是: ${c}`);
    else if (['maxhp', 'xiuwei', 'inner', 'party'].includes(kind) && Number.isNaN(Number(key))) err(b, `${kind} 条件需要数字: ${c}`);
    else if (!['flag', 'has', 'visited', 'sect', 'rank', 'gender', 'money', 'today', 'maxhp', 'xiuwei', 'inner', 'stance', 'talent', 'party', 'learned'].includes(kind)) err(b, `未知条件: ${c}`);
  }
}

function checkEffects(b, effects) {
  const ns = owner.get(b.file);
  for (const e of effects) {
    const [kind, key] = e.split(/:(.*)/);
    if (kind === 'flag' || kind === 'unflag') {
      const prefix = ns === 'world' ? 'world.' : `${ns}.`;
      if (!key.startsWith(prefix)) err(b, `只能写 ${prefix}* 标记，却写了: ${key}`);
    } else if (kind === 'give' || kind === 'take') { if (!db.item[key]) err(b, `效果引用了不存在的物品: ${key}`); }
    else if (kind === 'goto') { if (!db.room[key]) err(b, `goto 目标房间不存在: ${key}`); }
    else if (kind === 'start') { if (!db.storyline[key]) err(b, `start 目标主线不存在: ${key}`); }
    else if (kind === 'chapter') { if (!db.chapter[key]) err(b, `chapter 目标章节不存在: ${key}`); }
    else if (kind === 'fight') { if (!db.battle[key]) err(b, `fight 目标战斗不存在: ${key}`); }
    else if (kind === 'join') { if (!db.sect[key]) err(b, `join 目标门派不存在: ${key}`); }
    else if (kind === 'learn') { if (!db.skill[key]) err(b, `learn 目标武功不存在: ${key}`); }
    else if (kind === 'rep') { const [sect, n] = key.split(':'); if (!db.sect[sect] || Number.isNaN(Number(n))) err(b, `rep 格式应为 rep:门派:数值，却是: ${e}`); }
    else if (kind === 'potential') { if (Number.isNaN(Number(key))) err(b, `potential 需要数字: ${e}`); }
    else if (kind === 'heal') { /* 无参数 */ }
    else if (kind === 'money' || kind === 'pay') { if (Number.isNaN(Number(key))) err(b, `${kind} 需要数字: ${e}`); }
    else if (kind === 'travel') { if (!db.city[key]) err(b, `travel 目标城市不存在: ${key}`); }
    else if (kind === 'today') { if (!key) err(b, 'today 需要一个键名'); }
    else if (kind === 'cap') { const [id, n] = key.split(':'); if (!db.skill[id] || Number.isNaN(Number(n))) err(b, `cap 格式应为 cap:武功:等级，却是: ${e}`); }
    else err(b, `未知效果: ${e}`);
  }
}

function checkBody(b) {
  for (const l of b.lines) {
    checkConds(b, l.cond);
    for (const part of splitLinks(l.text)) if (part.id && !linkTarget(part.id)) err(b, `链接目标不存在: ${part.id}`);
  }
  for (const c of b.choices) {
    checkConds(b, c.cond);
    checkEffects(b, c.effects);
    if (c.target && !db.dialog[c.target]) err(b, `选项目标对话不存在: ${c.target}`);
    if (!c.text) err(b, '选项没有文字');
  }
}

const all = [];
for (const type of Object.keys(db)) {
  if (type === 'patch') { for (const ps of Object.values(db.patch)) all.push(...ps); continue; }
  if (typeof db[type] !== 'object' || db[type] instanceof Set || type === 'loaded') continue;
  all.push(...Object.values(db[type]));
}

const referenced = new Set();
for (const b of all) {
  if (!KNOWN.has(b.type)) { warn(b, `未知块类型: ${b.type}`); continue; }
  checkBody(b);
  if (b.props.if) checkConds(b, words(b.props.if));
  if (b.props.do) checkEffects(b, words(b.props.do));

  if (b.type === 'room' || b.type === 'patch') {
    for (const [dir, to] of Object.entries(parseMap(b.props.exits))) {
      if (!db.room[to]) err(b, `出口 ${dir} 指向不存在的房间: ${to}`);
      referenced.add(to);
    }
    for (const n of parseList(b.props.npcs)) if (!db.npc[n]) err(b, `NPC 不存在: ${n}`);
  }
  if (b.type === 'patch') {
    const target = db.room[b.id] ?? db.dialog[b.id] ?? db.npc[b.id];
    if (!target) err(b, 'patch 目标不存在');
  }
  if (b.type === 'npc' && b.props.talk && !db.dialog[b.props.talk]) err(b, `对话不存在: ${b.props.talk}`);
  if (b.type === 'trigger') {
    if (!db.room[b.props.room]) err(b, `触发房间不存在: ${b.props.room}`);
    if (b.props.dialog && !db.dialog[b.props.dialog]) err(b, `触发对话不存在: ${b.props.dialog}`);
  }
  if (b.type === 'use') {
    if (!db.item[b.props.item]) err(b, `物品不存在: ${b.props.item}`);
    if (b.props.room && !db.room[b.props.room]) err(b, `房间不存在: ${b.props.room}`);
    if (b.props.dialog && !db.dialog[b.props.dialog]) err(b, `对话不存在: ${b.props.dialog}`);
  }
  if (b.type === 'skill') {
    if (!['外功', '内功', '轻功'].includes(b.props.kind)) err(b, `kind 应为 外功/内功/轻功: ${b.props.kind}`);
    if (b.props.kind === '外功' && !['刚', '巧', '守'].includes(b.props.stance)) err(b, `外功必须指定 stance（刚/巧/守）`);
    if (b.props.sect && !db.sect[b.props.sect]) err(b, `所属门派不存在: ${b.props.sect}`);
    if (b.props.kind === '外功' && !Object.values(db.move).some((m) => m.props.skill === b.id)) err(b, '外功没有任何招式');
  }
  if (b.type === 'move') {
    if (!db.skill[b.props.skill]) err(b, `所属武功不存在: ${b.props.skill}`);
    for (const k of ['power', 'mp', 'level']) if (Number.isNaN(Number(b.props[k] ?? 0))) err(b, `${k} 需要数字`);
    const okEffects = b.props.support === 'true' ? ['疗伤', '回气', '振奋', '护体', '解穴'] : ['内伤', '点穴', '破绽', '吸内', '化内', '缴械'];
    for (const e of parseList(b.props.effects)) if (!okEffects.includes(e.split(':')[0])) err(b, `未知招式效果: ${e}`);
    if (b.props.support === 'true' && db.skill[b.props.skill]?.props.stance !== '守') err(b, '辅助招式必须属于守类武功');
  }
  if ((b.type === 'enemy' || b.type === 'skill') && b.props.weapon && !['拳', '刀', '剑', '棍', '鞭', '匕首', '暗器'].includes(b.props.weapon)) err(b, `未知兵器: ${b.props.weapon}`);
  if (b.type === 'enemy' && !b.props.weapon) warn(b, '敌人没有兵器标签（weapon），出招描述会用招式自带的文案');
  if (b.type === 'enemy' && b.props.obscure && !(Number(b.props.obscure) >= 0 && Number(b.props.obscure) <= 100)) err(b, 'obscure 应为 0~100');
  if (b.type === 'enemy') {
    for (const part of parseList(b.props.skills)) {
      const id = part.split('=')[0].trim();
      if (!db.skill[id]) err(b, `敌人武功不存在: ${id}`);
    }
  }
  if (b.type === 'battle') {
    for (const id of parseList(b.props.enemies)) if (!db.enemy[id]) err(b, `敌人不存在: ${id}`);
    for (const k of ['win', 'lose']) if (b.props[k] && !db.dialog[b.props[k]]) err(b, `${k} 对话不存在: ${b.props[k]}`);
  }
  if (b.type === 'sect') {
    // 用户规定：门派可以有侧重，但刚、巧、守三类外功至少各有一门
    const outer = Object.values(db.skill).filter((sk) => sk.props.sect === b.id && sk.props.kind === '外功');
    for (const st of ['刚', '巧', '守']) if (!outer.some((sk) => sk.props.stance === st)) err(b, `门派缺少「${st}」类外功`);
    if (!Object.values(db.skill).some((sk) => sk.props.sect === b.id && sk.props.kind === '内功')) err(b, '门派没有内功');
    const ranks = (b.props.ranks ?? '').split(',').filter(Boolean).length;
    const caps = (b.props.caps ?? '').split(',').filter(Boolean).length;
    if (!ranks || ranks !== caps) err(b, `ranks（${ranks} 阶）与 caps（${caps} 个）数量必须一致`);
  }
  if (b.type === 'city') {
    if (!db.room[b.props.station]) err(b, `车马行房间不存在: ${b.props.station}`);
    else if (db.room[b.props.station].props.station !== 'true') err(b, `车马行房间缺少 station: true`);
    for (const part of parseList(b.props.routes)) {
      const to = part.split('=')[0].trim();
      if (!db.city[to]) err(b, `路线目的地城市不存在: ${to}`);
    }
    for (const part of parseList(b.props.goods)) {
      const g = part.split('=')[0].trim();
      if (!db.goods[g]) err(b, `货物不存在: ${g}`);
    }
    if (!/^\d+,\d+$/.test(b.props.pos ?? '')) err(b, 'pos 应为 "x,y"（大地图坐标）');
  }
  if (b.type === 'goods' && !(Number(b.props.price) > 0)) err(b, 'price 需要正数');
  if (b.type === 'item' && b.props.slot === 'weapon' && !['刀', '剑', '棍', '鞭'].includes(b.props.weapon)) err(b, `兵器的 weapon 应为 刀/剑/棍/鞭: ${b.props.weapon}`);
  if (b.type === 'quest') {
    if (!b.props.flag || !b.props.name) err(b, 'quest 需要 name 和 flag');
    if (b.props.where && !db.room[b.props.where]) err(b, `where 房间不存在: ${b.props.where}`);
  }
  if (b.type === 'goal' && !db.storyline[b.props.storyline]) err(b, `所属主线不存在: ${b.props.storyline}`);
  if (b.type === 'combo') {
    for (const k of ['a', 'b']) {
      const [sk, lv] = (b.props[k] ?? '').split('@');
      if (!db.skill[sk?.trim()]) err(b, `合击 ${k} 方武功不存在: ${b.props[k]}`);
      if (lv && Number.isNaN(Number(lv))) err(b, `合击 ${k} 方等级需要数字`);
    }
    if (!(Number(b.props.bonus) > 1)) err(b, 'bonus 需要大于 1');
    for (const e of parseList(b.props.effects)) if (!['内伤', '点穴', '破绽', '化内'].includes(e.split(':')[0])) err(b, `合击不支持的效果: ${e}`);
  }
  if (b.type === 'chapter' && b.props.done) checkConds(b, words(b.props.done));
  if (b.type === 'battle' && owner.get(b.file) !== 'world' && !b.props.lose) {
    // 主线战斗默认必须打赢（输了回到章节开始），确认所在文件有章节（D-042）
    if (!Object.values(db.chapter).some((ch) => ch.props.storyline === owner.get(b.file))) err(b, '主线战斗需要章节检查点');
  }
  if (b.type === 'npc' && b.props.teaches && !db.sect[b.props.teaches]) err(b, `teaches 门派不存在: ${b.props.teaches}`);
  if (b.type === 'chapter' && !db.storyline[b.props.storyline]) err(b, `所属主线不存在: ${b.props.storyline}`);
  // 主线文件里定义的 id 应带主线前缀（world 文件不限）
  const ns = owner.get(b.file);
  if (ns !== 'world' && b.type !== 'patch' && b.id !== ns && !b.id.startsWith(ns + '.')) warn(b, `id 建议以 ${ns}. 开头`);
}

const start = db.meta.game?.props.start;
if (!db.room[start]) errors.push(`起始房间不存在: ${start}`);
for (const id of Object.keys(db.room)) {
  if (id !== start && !referenced.has(id)) warns.push(`房间没有任何入口: ${id}`);
}

// 待写占位：剧情推进后要回头删掉，清单见 docs/TODO-CONTENT.md
const PLACEHOLDER = /尚未编写|待续|敬请期待|开发中/;
for (const [f] of files) {
  readFileSync(join(root, f), 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (PLACEHOLDER.test(line) && !line.startsWith('#')) warns.push(`待写占位 ${f}:${i + 1}　${line.trim()}（见 docs/TODO-CONTENT.md）`);
  });
}

const count = Object.fromEntries(['room', 'npc', 'dialog', 'item', 'entry'].map((k) => [k, Object.keys(db[k]).length]));
console.log(`内容统计：${JSON.stringify(count)}，${files.length} 个文件`);
for (const w of warns) console.log('⚠ ' + w);
for (const e of errors) console.log('✗ ' + e);
console.log(errors.length ? `\n${errors.length} 个错误` : '\n✓ 校验通过');
process.exit(errors.length ? 1 : 0);
