'use strict';
/* 从冻结的源稿 + 手写计划生成「AI Agent 系统设计」专题的文章页。
 *
 * 用法：node scripts/agent-design/build.cjs <篇号>
 *   例：node scripts/agent-design/build.cjs 03
 *
 * 输入：
 *   docs/agent-design-source/<source>.md   冻结的源稿（总纲对应章）
 *   scripts/agent-design/plan-<篇号>.cjs    手写内容：导语、引导思考表、全景、
 *                                          路线图、每段段标、每小节的本章要点与
 *                                          思考笔记、结尾四小节、编号改写规则
 *   scripts/agent-design/fixups-<源章号>.cjs  源稿里 §编号与跨章引用的改写规则
 *
 * 输出：
 *   2026/11/26/agent-design-<篇号>-<slug>/index.html
 */
const fs = require('fs');
const path = require('path');
const { mdToHtml } = require('./md.cjs');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC_DIR = path.join(ROOT, 'docs/agent-design-source');
const SHELL = path.join(ROOT, '2026/11/07/openclaw-01-overview/index.html');

/* ---------- 读取源稿并切成段 / 小节 ---------- */
function loadSource(source, fixups) {
  let text = fs.readFileSync(path.join(SRC_DIR, source + '.md'), 'utf8');
  (fixups || []).forEach(([from, to], i) => {
    const n = text.split(from).length - 1;
    if (n !== 1)
      throw new Error('第 ' + (i + 1) + ' 条改写规则命中 ' + n + ' 次（应恰好 1 次）：' + from.slice(0, 50));
    text = text.split(from).join(to);
  });
  const lines = text.split('\n');
  const secs = new Map(); // '22.1' -> { title, body }
  const subs = new Map(); // '22.3.1' -> { title, body }
  let cur = null;
  let curSub = null;
  for (const l of lines) {
    let m = l.match(/^### (\d+(?:\.\d+)+) (.+)$/);
    if (m) {
      cur = { title: m[2], body: [] };
      secs.set(m[1], cur);
      curSub = null;
      continue;
    }
    m = l.match(/^#### (\d+(?:\.\d+)+) (.+)$/);
    if (m) {
      curSub = { title: m[2], body: [] };
      subs.set(m[1], curSub);
      continue;
    }
    if (curSub) curSub.body.push(l);
    else if (cur) cur.body.push(l);
  }
  return { secs, subs };
}

function sliceByMarkers(body, from, to) {
  let start = 0;
  let end = body.length;
  if (from && from.length) {
    start = body.findIndex((l) => l.startsWith(from[0]));
    if (start < 0) throw new Error('找不到起始标记：' + from[0]);
  }
  if (to && to.length) {
    const e = body.findIndex((l, i) => i > start && l.startsWith(to[0]));
    if (e < 0) throw new Error('找不到结束标记：' + to[0]);
    end = e;
  }
  return body.slice(start, end);
}

/* ---------- 组装正文 ---------- */
function buildBody(plan, src, chapterNo) {
  const out = [];
  const toc = [];

  out.push('<p class="oc-lead">\n  ' + plan.lead + '\n</p>');
  out.push(renderGuide(plan.guide));
  out.push(renderOverview(plan.overview));
  out.push(renderRoute(plan.route));

  // 段与源稿的一级小节按顺序一一对应
  const secKeys = [...src.secs.keys()];

  plan.segs.forEach((seg, si) => {
    const srcSec = secKeys[si];
    if (!srcSec) throw new Error('源稿段数少于计划的段数');
    const segNo = si + 1;
    const segId = 'seg-' + segNo;
    const segTitle = chapterNo + '.' + segNo + ' ' + seg.title;
    out.push(
      '<h2 id="' + segId + '">' + segTitle + '</h2>' +
        '<div class="oc-part-lead"><strong>' + plan.route[si][0] + '</strong>' + seg.part + '</div>'
    );
    toc.push({ level: 2, id: segId, text: segTitle });

    seg.secs.forEach((sec, ki) => {
      const secId = 'sec-' + segNo + '.' + (ki + 1);
      const secTitle = chapterNo + '.' + segNo + '.' + (ki + 1) + ' ' + sec.title;
      out.push(
        '<h3 id="' + secId + '">' + secTitle + '</h3>' +
          '<div class="oc-keypoint">\n<h3>本章要点</h3>\n<p>' + sec.key + '</p>\n</div>' +
          '<div class="thinking-note">\n<h3>思考笔记</h3>\n<p>' + sec.note + '</p>\n</div>'
      );
      toc.push({ level: 3, id: secId, text: secTitle });

      if (sec.subs) {
        sec.subs.forEach((sid) => {
          const sub = src.subs.get(sid);
          if (!sub) throw new Error('源稿里没有小节 ' + sid);
          const subId = secId + '.' + sid.split('.').pop();
          out.push('<h4 id="' + subId + '" data-toc-skip>' + sub.title + '</h4>');
          out.push(mdToHtml(sub.body));
        });
      } else {
        const s = src.secs.get(srcSec);
        const body = sliceByMarkers(s.body, sec.from || [], sec.to || []);
        out.push(mdToHtml(body));
      }
    });
  });

  // 结尾
  const segNo = plan.segs.length + 1;
  const segId = 'seg-' + segNo;
  const segTitle = chapterNo + '.' + segNo + ' 总结';
  const c = plan.closing;
  out.push(
    '<h2 id="' + segId + '">' + segTitle + '</h2>' +
      '<div class="oc-part-lead"><strong>总结</strong>把这一章收成一页纸：结论、边界，以及下一章要解决什么。</div>'
  );
  toc.push({ level: 2, id: segId, text: segTitle });

  const subs = [
    ['一句话总结', '<div class="thinking-note">\n<h3>思考笔记</h3>\n<p>' + c.summary + '</p>\n</div>'],
    [
      '本章结论',
      '<ol class="oc-points">\n' +
        c.points.map((p) => '  <li><strong>' + p[0] + '</strong>' + p[1] + '</li>').join('\n') +
        '\n</ol>',
    ],
    ['下一章', '<p>' + c.next + '</p>'],
    [
      '相关阅读',
      '<ul>\n' +
        c.reading
          .map((r) => '  <li><a href="' + r[2] + '"><strong>' + r[0] + '</strong></a> — ' + r[1] + '</li>')
          .join('\n') +
        '\n</ul>',
    ],
  ];
  subs.forEach((s, i) => {
    const sid = 'sec-' + segNo + '.' + (i + 1);
    const st = chapterNo + '.' + segNo + '.' + (i + 1) + ' ' + s[0];
    out.push('<h3 id="' + sid + '">' + st + '</h3>' + s[1]);
    toc.push({ level: 3, id: sid, text: st });
  });

  return { body: out.join('\n\n'), toc };
}

function renderGuide(guide) {
  const rows = guide
    .map(
      (g, i) =>
        '    <tr>\n      <td><strong>' +
        ['它为什么存在', '它解决什么问题', '它在系统中的位置', '它如何工作'][i] +
        '</strong></td>\n      <td>\n        <ul>\n' +
        g.map((x) => '          <li>' + x + '</li>').join('\n') +
        '\n        </ul>\n      </td>\n    </tr>'
    )
    .join('\n');
  return [
    '<table class="guide-card collapsed">',
    '    <thead>',
    '      <tr>',
    '        <th>思考维度</th>',
    '        <th>内容</th>',
    '      </tr>',
    '    </thead>',
    '    <tbody>',
    '    <tr class="guide-card-header">',
    '      <td colspan="2"><span class="collapse-icon"></span>引导思考 <span class="collapse-hint">展开</span></td>',
    '    </tr>',
    rows,
    '    </tbody>',
    '  </table>',
  ].join('\n');
}

function renderOverview(rows) {
  return [
    '<div class="oc-keypoint">',
    '  <h3>本章全景</h3>',
    ...rows.map((r) => '  <p><strong>' + r[0] + '</strong>：' + r[1] + '</p>'),
    '</div>',
    '',
    '<table class="oc-overview">',
    '  <thead><tr><th scope="col">维度</th><th scope="col">内容</th></tr></thead>',
    '  <tbody>',
    ...rows.map((r) => '    <tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'),
    '  </tbody>',
    '</table>',
  ].join('\n');
}

function renderRoute(route) {
  const cards = route
    .map((r) => '  <div class="oc-card">\n    <div>' + r[0] + '</div>\n    <div>' + r[1] + '</div>\n  </div>')
    .join('\n');
  return '<div class="oc-cards">\n' + cards + '\n</div>';
}

/* ---------- 组装整页 ---------- */
function buildPage(chapter, plan, body, toc, prev, next) {
  const shell = fs.readFileSync(SHELL, 'utf8');
  const sprite = shell.slice(
    shell.indexOf('<svg\n      class="icon-definitions"'),
    shell.indexOf('</svg>', shell.indexOf('<svg\n      class="icon-definitions"')) + 6
  );
  const header = shell.slice(
    shell.indexOf('<header class="portal-header"'),
    shell.indexOf('</header>', shell.indexOf('<header class="portal-header"')) + 9
  );
  const footer = shell.slice(shell.indexOf('<footer class="portal-footer">'));

  const tocHtml =
    '<aside class="article-toc-aside"><details class="reading-toc"><summary>本文目录</summary><nav aria-label="本文目录">' +
    toc
      .map((t) => '<a class="reading-toc-link level-' + t.level + '" href="#' + t.id + '">' + t.text + '</a>')
      .join('') +
    '</nav></details></aside>';

  const pager =
    '<nav class="article-pager" aria-label="专题阅读导航">' +
    '<div>' +
    (prev ? '<a href="' + prev.url + '"><small>← 上一篇</small><span>' + prev.title + '</span></a>' : '') +
    '</div><div>' +
    (next ? '<a href="' + next.url + '"><small>下一篇 →</small><span>' + next.title + '</span></a>' : '') +
    '</div><a class="article-series-return" href="/categories/' + series.CAT + '/">返回' + series.SERIES + ' ↗</a></nav>';

  const url = 'https://www.lianjifu.cn' + series.urlOf(chapter.no);
  const num = String(parseInt(chapter.no, 10));
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2">
  <meta name="theme-color" content="#0f172a">
  <title>${chapter.kicker}：${chapter.title} | ${series.SERIES}</title>
  <meta name="description" content="${plan.desc}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${chapter.kicker}：${chapter.title}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="LianJiFu'blogs">
  <meta property="og:description" content="${plan.desc}">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:image" content="http://lianjifu.cn/uploads/avatar.png">
  <meta property="article:published_time" content="${series.DATE}T10:00:00.000Z">
  <meta property="article:modified_time" content="${series.DATE}T12:00:00.000Z">
  <meta property="article:author" content="JiFuLian">
  <meta property="article:tag" content="agent-design">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:image" content="http://lianjifu.cn/uploads/avatar.png">
  <link rel="canonical" content="${url}">
  <link rel="alternate" href="/atom.xml" title="LianJiFu'blogs" type="application/atom+xml">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="/css/2026.css?v=2">
  <link rel="stylesheet" href="/css/portal.css?v=13">
  <link rel="stylesheet" href="/css/article.css?v=8">
  <link rel="stylesheet" href="/css/agent-design.css?v=1">
  <script src="/js/portal.js?v=7" defer></script>
  <script src="/js/article-reader.js?v=2" defer></script>
</head>
<body id="top" class="personal-article" data-series="${series.CAT}">${sprite}
${header}
<main id="main">
  <article class="post-block" itemscope itemtype="https://schema.org/Article">
    <header class="post-header">
      <div class="article-breadcrumb"><a href="/archives/">博客</a><span>/</span><a href="/categories/${series.CAT}/">${series.SERIES}</a></div>
      <span class="article-kicker">${chapter.kicker}</span>
      <h1 class="post-title" itemprop="name headline">${chapter.title}</h1>
      <div class="post-meta">
        <span class="post-meta-item"><span class="post-meta-item-icon"><svg class="icon meta-icon" aria-hidden="true"><use href="#i-calendar" /></svg></span><span class="post-meta-item-text">发表于</span><time datetime="${series.DATE}T10:00:00+08:00">${series.DATE}</time></span>
        <span class="post-meta-item"><span class="post-meta-item-icon"><svg class="icon meta-icon" aria-hidden="true"><use href="#i-folder" /></svg></span><span class="post-meta-item-text">分类于</span><span itemprop="about" itemscope itemtype="http://schema.org/Thing"><a href="/categories/${series.CAT}/" itemprop="url" rel="index"><span itemprop="name">${series.SERIES}</span></a></span></span>
      </div>
    </header>
    <div class="article-reading-layout">
      <div class="post-body agent-design-body" itemprop="articleBody">
${body}
</div>${tocHtml}
    </div>
    ${pager}
  </article>
</main>
${footer}`;
}

/* ---------- 入口 ---------- */
const no = process.argv[2];
if (!no) throw new Error('用法：node scripts/agent-design/build.cjs <篇号>');
const chapter = series.byNo[no];
if (!chapter) throw new Error('没有这一篇：' + no);
const plan = require('./plan-' + no + '.cjs')[no];
if (!plan) throw new Error('缺少 scripts/agent-design/plan-' + no + '.cjs');

const src = loadSource(chapter.source, plan.fixups);
const { body, toc } = buildBody(plan, src, String(parseInt(no, 10)));

const order = series.CHAPTERS.map((c) => c.no);
const i = order.indexOf(no);
const prev = i > 0 ? { url: series.urlOf(order[i - 1]), title: series.byNo[order[i - 1]].title } : null;
const next = i < order.length - 1 ? { url: series.urlOf(order[i + 1]), title: series.byNo[order[i + 1]].title } : null;

const page = buildPage(chapter, plan, body, toc, prev, next);
const outDir = path.join(ROOT, series.DATE.replace(/-/g, '/'), series.slugOf(no));
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), page);

console.log('写入', path.relative(ROOT, outDir) + '/index.html');
console.log('  段落', plan.segs.length, '· 小节', toc.filter((t) => t.level === 3).length, '· 目录条目', toc.length);
console.log('  正文长度', body.length, '字符');
