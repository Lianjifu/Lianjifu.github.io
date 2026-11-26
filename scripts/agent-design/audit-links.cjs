'use strict';
/* 体检：node scripts/agent-design/audit-links.cjs [篇号…]
 *
 * 检查专题文章页正文里的锚点链接是否都能落到本页真实的 id 上。
 *
 * 博客的锚点编号跟源稿编号不是一回事：
 *   段     seg-<段号>
 *   小节   sec-<段号>.<该段内的小节序号>
 *   子小节 sec-<段号>.<该段内的小节序号>.<源稿 #### 编号的最后一段>
 * 手写 fixups 时很容易把「显示编号」当成「锚点 id」，写出来的链接点不到。
 *
 * 这个脚本会把失效的锚点连同「按子小节序号换算后的正确答案」一起列出来。
 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const nos = process.argv.slice(2);
const targets = nos.length ? nos : series.CHAPTERS.map((c) => c.no);

let bad = 0;
targets.forEach((no) => {
  const dir = path.join(ROOT, series.DATE.replace(/-/g, '/'), series.slugOf(no));
  const file = path.join(dir, 'index.html');
  if (!fs.existsSync(file)) {
    console.log('— ' + no + ' 尚未生成');
    return;
  }
  const src = fs.readFileSync(file, 'utf8');

  /* 本页所有 id */
  const ids = new Set([...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

  /* 每个 h3 小节下面的 h4 子小节，按出现顺序 */
  const subsOf = new Map();
  for (const m of src.matchAll(/<h3 id="(sec-[\d.]+)">[\s\S]*?(?=<h3 id="|<\/div>\s*<aside)/g)) {
    const secId = m[1];
    const list = [];
    for (const h of m[0].matchAll(/<h4 id="(sec-[\d.]+)"[^>]*>([^<]*)</g)) list.push({ id: h[1], title: h[2] });
    if (list.length) subsOf.set(secId, list);
  }

  /* 正文里的锚点链接 */
  const bodyStart = src.indexOf('<div class="post-body');
  const bodyEnd = src.indexOf('<aside class="article-toc-aside">');
  const body = src.slice(bodyStart, bodyEnd);
  const links = [...body.matchAll(/<a href="#([^"]+)"[^>]*>([^<]*)</g)];

  const broken = [];
  links.forEach((m) => {
    if (ids.has(m[1])) return;
    const fix = suggest(m[1], subsOf);
    broken.push({ id: m[1], text: m[2].trim(), fix });
  });

  if (!broken.length) {
    console.log('✓ ' + no + ' ' + series.byNo[no].title + ' · 正文锚点 ' + links.length + ' 个，全部命中');
    return;
  }
  bad += broken.length;
  console.log('✗ ' + no + ' ' + series.byNo[no].title + ' · 正文锚点 ' + links.length + ' 个，' + broken.length + ' 个失效');
  broken.forEach((b) => {
    console.log(
      '    ' + b.id + '  「' + b.text + '」  →  ' + (b.fix ? b.fix.id + '  「' + b.fix.title + '」' : '（无法换算）')
    );
  });
});

function suggest(id, subsOf) {
  const m = /^sec-(\d+)\.(\d+)\.(\d+)$/.exec(id);
  if (!m) return null;
  const owner = 'sec-' + m[1] + '.' + m[2];
  const list = subsOf.get(owner);
  if (!list) return null;
  return list[parseInt(m[3], 10) - 1] || null;
}

if (bad) process.exitCode = 1;
