'use strict';
/* 自检：node scripts/agent-design/check.cjs <篇号>
 *
 * 检查生成的页面是否满足本系列的结构约束：
 *   1. 正文里不残留源稿的 §编号
 *   2. 标题里没有 undefined / 空字段
 *   3. 侧栏目录条目数 = 页面里带 id 的 h2/h3 数
 *   4. 本章要点与思考笔记各等于小节数
 *   5. 跨篇引用用的是博客篇号，不是总纲章号
 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const no = process.argv[2];
if (!no) throw new Error('用法：node scripts/agent-design/check.cjs <篇号>');
const chapter = series.byNo[no];
if (!chapter) throw new Error('没有这一篇：' + no);

const file = path.join(ROOT, series.DATE.replace(/-/g, '/'), series.slugOf(no), 'index.html');
const src = fs.readFileSync(file, 'utf8');
const bodyStart = src.indexOf('<div class="post-body');
const bodyEnd = src.indexOf('<aside class="article-toc-aside">');
const body = src.slice(bodyStart, bodyEnd);

const problems = [];
const notes = [];

// 1. 残留的源稿编号
const stale = [...new Set((body.match(/§\d+(?:\.\d+)*/g) || []))];
if (stale.length) problems.push('残留源稿编号：' + stale.join(' '));

// 2. 空字段（只查标题与面板里的空值，不查正文散字）
if (/>\s*(undefined|null|NaN)\s*</.test(body)) problems.push('正文里有空的标题或面板');
if (/\b(undefined|null)\b/.test(body.replace(/[a-z-]*\.js[^"'\s]*/g, '')))
  problems.push('正文里出现 undefined / null');
const tocBad = [...new Set((src.match(/>([^<>]*undefined[^<>]*)</g) || []))];
if (tocBad.length) problems.push('目录里出现 undefined');

// 3. 目录条目数 = 带 id 的 h2/h3
const tocCount = (src.match(/class="reading-toc-link /g) || []).length;
const headingCount = [...body.matchAll(/<h([23])\b([^>]*)>/g)].filter(
  (m) => /\bid="([^"]+)"/.test(m[2]) && !m[2].includes('data-toc-skip')
).length;
if (tocCount !== headingCount)
  problems.push('目录 ' + tocCount + ' 条 ≠ 带 id 的 h2/h3 ' + headingCount + ' 个');

// 4. 面板数量：正文段的小节每个都要有本章要点与思考笔记；结尾四小节不算
const segIds = [...new Set([...body.matchAll(/<h3 id="sec-(\d+)\.\d+"/g)].map((m) => m[1]))];
const lastSeg = segIds[segIds.length - 1];
const secCount = [...body.matchAll(/<h3 id="sec-(\d+)\.\d+"/g)].filter((m) => m[1] !== lastSeg).length;
const keypoints = (body.match(/<div class="oc-keypoint">\s*<h3>本章要点<\/h3>/g) || []).length;
const thinking = (body.match(/<div class="thinking-note">\s*<h3>思考笔记<\/h3>/g) || []).length;
if (keypoints !== secCount) problems.push('本章要点 ' + keypoints + ' 个 ≠ 正文小节 ' + secCount + ' 个');
if (thinking !== secCount + 1) problems.push('思考笔记 ' + thinking + ' 个 ≠ 正文小节 ' + secCount + ' + 结尾 1 = ' + (secCount + 1));

// 5. 跨篇引用
const badRefs = [...new Set((body.match(/第\s*(2[2-9]|3[0-2])\s*章/g) || []))];
if (badRefs.length)
  problems.push('正文里出现总纲章号：' + badRefs.join(' ') + '（应写成「第 N 章」并指向本系列）');

notes.push('目录 ' + tocCount + ' 条 · 小节 ' + secCount + ' 个 · 正文 ' + body.length + ' 字符');
if (problems.length) {
  console.log('✗ ' + no + ' ' + chapter.title);
  problems.forEach((p) => console.log('  · ' + p));
  process.exitCode = 1;
} else {
  console.log('✓ ' + no + ' ' + chapter.title + ' · ' + notes.join(' · '));
}
