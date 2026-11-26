'use strict';
/* 找出十一篇里写法雷同、可能需要打磨的地方。 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const DATE_DIR = series.DATE.replace(/-/g, '/');

const strip = (h) =>
  h
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const all = [];
series.CHAPTERS.forEach((c) => {
  const file = path.join(ROOT, DATE_DIR, series.slugOf(c.no), 'index.html');
  if (!fs.existsSync(file)) return;
  const src = fs.readFileSync(file, 'utf8');
  const body = src.slice(src.indexOf('<div class="post-body'), src.indexOf('<aside class="article-toc-aside">'));
  const secs = [
    ...body.matchAll(
      /<h3 id="sec-(\d+\.\d+)">([^<]+)<\/h3>\s*<div class="oc-keypoint">\s*<h3>本章要点<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<\/div>\s*<div class="thinking-note">\s*<h3>思考笔记<\/h3>\s*<p>([\s\S]*?)<\/p>/g
    ),
  ];
  secs.forEach((m) => all.push({ no: c.no, id: m[1], title: strip(m[2]), key: strip(m[3]), note: strip(m[4]) }));
  // 结尾四小节
  const tail = body.slice(body.indexOf('<h2 id="seg-7">'));
  const concl = tail.match(/<ol class="oc-points">([\s\S]*?)<\/ol>/);
  const reading = tail.match(/<li><a href="([^"]+)"><strong>([^<]*)<\/strong><\/a> — ([^<]*)<\/li>/g) || [];
  all.push({
    no: c.no,
    id: 'conclusion',
    title: '结尾',
    key: concl ? '结论 ' + (concl[1].match(/<li>/g) || []).length + ' 条' : '无结论列表',
    note: '相关阅读 ' + reading.length + ' 条',
  });
});

/* 思考笔记开头前 6 字 */
const buckets = {};
all.filter((s) => s.note && s.id !== 'conclusion').forEach((s) => {
  const k = s.note.slice(0, 6);
  (buckets[k] = buckets[k] || []).push(s.no + '/' + s.id);
});
console.log('思考笔记开头前 6 字出现 3 次以上的：');
Object.entries(buckets)
  .filter(([, v]) => v.length >= 3)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([k, v]) => console.log('  「' + k + '」×' + v.length + '  ' + v.slice(0, 8).join(' ')));

/* 思考笔记里出现频率最高的 8 字片段 */
const grams = {};
all.filter((s) => s.note && s.id !== 'conclusion').forEach((s) => {
  for (let i = 0; i + 8 <= s.note.length; i += 2) {
    const g = s.note.slice(i, i + 8);
    (grams[g] = grams[g] || []).push(s.no);
  }
});
console.log('\n跨篇重复出现的 8 字片段（≥4 篇）：');
Object.entries(grams)
  .filter(([, v]) => new Set(v).size >= 4)
  .sort((a, b) => new Set(b[1]).size - new Set(a[1]).size)
  .slice(0, 15)
  .forEach(([g, v]) => console.log('  「' + g + '」 出现在 ' + new Set(v).size + ' 篇：' + [...new Set(v)].join(',')));

/* 每篇结尾小节 */
console.log('\n结尾四小节：');
series.CHAPTERS.forEach((c) => {
  const s = all.find((x) => x.no === c.no && x.id === 'conclusion');
  if (s) console.log('  ' + c.no + '：' + s.key + '，' + s.note);
});
