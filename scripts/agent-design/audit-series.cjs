'use strict';
/* 横向体检十一篇：结构一致性、篇幅、要点与思考笔记的写法、跨篇引用。 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const DATE_DIR = series.DATE.replace(/-/g, '/');

function strip(html) {
  return html
    .replace(/<[^>]+>/g, '\n')
    .replace(/&[a-z]+;/g, '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

const rows = [];
series.CHAPTERS.forEach((c) => {
  const file = path.join(ROOT, DATE_DIR, series.slugOf(c.no), 'index.html');
  if (!fs.existsSync(file)) return;
  const src = fs.readFileSync(file, 'utf8');
  const body = src.slice(src.indexOf('<div class="post-body'), src.indexOf('<aside class="article-toc-aside">'));

  const secs = [...body.matchAll(/<h3 id="sec-(\d+)\.(\d+)">([^<]+)<\/h3>\s*<div class="oc-keypoint">\s*<h3>本章要点<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<\/div>\s*<div class="thinking-note">\s*<h3>思考笔记<\/h3>\s*<p>([\s\S]*?)<\/p>/g)];
  const h4 = [...body.matchAll(/<h4 id="sec-[\d.]+"/g)].length;
  const tables = [...body.matchAll(/<table>/g)].length;
  const code = [...body.matchAll(/<pre>/g)].length;
  const quotes = [...body.matchAll(/<blockquote>/g)].length;
  const lists = [...body.matchAll(/<ul>|<ol>/g)].length;
  const paras = (body.match(/<p>/g) || []).length;

  const keyLens = secs.map((m) => strip(m[4]).join('').length);
  const noteLens = secs.map((m) => strip(m[5]).join('').length);

  rows.push({
    no: c.no,
    title: c.title,
    len: body.length,
    h2: (body.match(/<h2 id=/g) || []).length,
    h3: secs.length,
    h4,
    tables,
    code,
    quotes,
    lists,
    paras,
    keyMin: Math.min(...keyLens),
    keyMax: Math.max(...keyLens),
    keyAvg: Math.round(keyLens.reduce((a, b) => a + b, 0) / keyLens.length),
    noteMin: Math.min(...noteLens),
    noteMax: Math.max(...noteLens),
    noteAvg: Math.round(noteLens.reduce((a, b) => a + b, 0) / noteLens.length),
    shortNote: noteLens.filter((l) => l < 40).length,
    shortKey: keyLens.filter((l) => l < 40).length,
    secTitles: secs.map((m) => m[3].replace(/^\d+\.\d+\.\d+\s*/, '')),
    bodyText: strip(body),
  });
});

console.log('篇  正文字符  段  小节  子小节  表  代码  引用  列表  段落 | 要点字数(短/均/长) | 笔记字数(短/均/长)');
rows.forEach((r) => {
  console.log(
    String(r.no).padStart(2, '0') +
      '  ' +
      String(r.len).padStart(7) +
      '  ' +
      String(r.h2).padStart(2) +
      '  ' +
      String(r.h3).padStart(3) +
      '  ' +
      String(r.h4).padStart(5) +
      '  ' +
      String(r.tables).padStart(3) +
      '  ' +
      String(r.code).padStart(4) +
      '  ' +
      String(r.quotes).padStart(4) +
      '  ' +
      String(r.lists).padStart(4) +
      '  ' +
      String(r.paras).padStart(4) +
      ' | ' +
      String(r.keyMin).padStart(3) + '/' + String(r.keyAvg).padStart(3) + '/' + String(r.keyMax).padStart(3) +
      ' (' + r.shortKey + ') | ' +
      String(r.noteMin).padStart(3) + '/' + String(r.noteAvg).padStart(3) + '/' + String(r.noteMax).padStart(3) +
      ' (' + r.shortNote + ')'
  );
});

/* 跨篇引用 */
console.log('\n跨篇引用检查：');
rows.forEach((r) => {
  const links = [...r.bodyText.join(' ').matchAll(/第\s*(\d+)\s*章/g)].map((m) => m[1]);
  const bad = links.filter((n) => !series.byNo[String(n).padStart(2, '0')]);
  const self = links.filter((n) => String(n).padStart(2, '0') === r.no);
  console.log('  ' + r.no + '：引用 ' + (links.length ? [...new Set(links)].join(',') : '无') + (bad.length ? '  ⚠ 未知篇号 ' + bad.join(',') : '') + (self.length ? '  ⚠ 自我引用 ' + self.join(',') : ''));
});

/* 小节标题重复 */
console.log('\n同一篇里的小节标题重复：');
rows.forEach((r) => {
  const seen = {};
  r.secTitles.forEach((t) => (seen[t] = (seen[t] || 0) + 1));
  const dup = Object.keys(seen).filter((t) => seen[t] > 1);
  if (dup.length) console.log('  ' + r.no + '：' + dup.join(' / '));
});
