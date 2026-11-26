'use strict';
/* 把已生成的篇目接进全站：专题页、归档页、首页、搜索索引、订阅文件、正文基准。
 *
 * 用法：node scripts/agent-design/integrate.cjs
 *
 * 只处理「页面已生成、但还没接进全站」的篇目；重复执行不会重复插入。
 * 正文哈希与篇数在最后由 update-manifest.cjs --write 重算。
 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const DATE_DIR = series.DATE.replace(/-/g, '/');

/* 分篇：按博客篇号 */
const PARTS = [
  {
    id: 'chapter-1',
    eyebrow: 'PART / 01',
    title: '数据与知识',
    desc: '两类「读 → 推理 → 答」的 Agent：一个读结构化数仓，一个读非结构化知识库。',
    nos: ['01', '02'],
  },
  {
    id: 'chapter-2',
    eyebrow: 'PART / 02',
    title: '业务与触达',
    desc: '面向用户的四类 Agent：客服、营销、电商、文旅——难点都在「动作会被执行」。',
    nos: ['03', '04', '05', '06'],
  },
  {
    id: 'chapter-3',
    eyebrow: 'PART / 03',
    title: '生产与合规',
    desc: '面向真实生产环境与法务场景：运维、安全运营、合同审查、办公写作——防线要落在执行层。',
    nos: ['07', '08', '09', '10'],
  },
  {
    id: 'chapter-4',
    eyebrow: 'PART / 04',
    title: '供给与决策',
    desc: '供应链：把自然语言经营目标变成受约束的补货与履约决策。',
    nos: ['11'],
  },
];

/* 归档页上每篇的一句话 */
const ARCHIVE_DESC = {
  '01': '语义层、Schema 裁剪、权限重写与结果集下推：四道让数字可信的防线。',
  '02': '宽召回、窄注入、可点开的引用，以及一个敢拒答的产品设计。',
  '03': '答疑之外还要能代办：状态机、幂等键与转人工的边界。',
  '04': '从自然语言目标到可圈选、可频控、可归因的一次触达。',
  '05': '导购、交易、售后三条链路共享同一套资金与幂等护栏。',
  '06': '行程规划、资源预订与旅中动态重排：时空约束下的多段编排。',
  '07': '先降噪再调查、先只读后写：把告警风暴收敛成一次受控止血。',
  '08': '跨身份、终端、网络与云审计拼出攻击链，再用最小可逆动作遏制。',
  '09': '逐条可判定的审查结论：漏检与误报的代价并不对称。',
  '10': '文档、PPT 与周报的生成：模板、引用与事实一致性怎么守。',
  '11': '需求预测、安全库存与约束求解：错一次的代价 45 天后才兑现。',
};

/* 归档页的分篇卡：类名 / 中英标题 / 一句话 */
const ARCHIVE_PARTS = [
  {
    id: 'part-agent-model',
    title: 'Part 1 · 数据与知识',
    sub: 'Data & Knowledge',
    desc: '两类「读 → 推理 → 答」的 Agent：一个读结构化数仓，一个读非结构化知识库',
    nos: ['01', '02'],
  },
  {
    id: 'part-agent-business',
    title: 'Part 2 · 业务与触达',
    sub: 'Business & Outreach',
    desc: '面向用户的四类 Agent：客服、营销、电商、文旅',
    nos: ['03', '04', '05', '06'],
  },
  {
    id: 'part-agent-production',
    title: 'Part 3 · 生产与合规',
    sub: 'Production & Compliance',
    desc: '面向真实生产环境与法务场景：运维、安全运营、合同审查、办公写作',
    nos: ['07', '08', '09', '10'],
  },
  {
    id: 'part-agent-supply',
    title: 'Part 4 · 供给与决策',
    sub: 'Supply & Decision',
    desc: '供应链：把经营目标变成受约束的补货与履约决策',
    nos: ['11'],
  },
];

/* ---------- 读源 ---------- */
function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, s) {
  fs.writeFileSync(path.join(ROOT, rel), s);
  console.log('  ' + rel + ' 已更新');
}

/* ---------- 哪些篇目已经生成 ---------- */
const built = series.CHAPTERS.filter((c) => fs.existsSync(path.join(ROOT, DATE_DIR, series.slugOf(c.no), 'index.html')));
if (!built.length) throw new Error('一篇都还没生成');

const meta = {};
built.forEach((c) => {
  const plan = require(path.join(ROOT, 'scripts/agent-design/plan-' + c.no + '.cjs'))[c.no];
  meta[c.no] = {
    no: c.no,
    url: series.urlOf(c.no),
    file: DATE_DIR + '/' + series.slugOf(c.no) + '/index.html',
    title: c.title,
    desc: plan.desc,
  };
});

/* 已经在正文基准里的篇目（基准里的 order 是数字，这里补齐成两位） */
const manifestPath = path.join(ROOT, 'docs/article-manifest.json');
const rows = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const wired = new Set(
  rows.filter((r) => r.series === series.CAT).map((r) => String(r.order).padStart(2, '0'))
);
const todo = built.filter((c) => !wired.has(c.no)).map((c) => c.no);

console.log('已生成 ' + built.length + ' 篇，本次接入 ' + todo.length + ' 篇：' + (todo.join('、') || '（无）'));

/* ---------- 1. 专题页 ---------- */
{
  const file = 'categories/agent-design/index.html';
  let s = read(file);

  const navItems = PARTS.map(
    (p) =>
      '<a class="chapter-link" href="#' + p.id + '"><span>' + p.eyebrow.replace('PART / ', '') + '</span>' + p.title + '<small>' + String(p.nos.length).padStart(2, '0') + '</small></a>'
  ).join('\n            ');
  s = s.replace(/(<nav aria-label="篇目导航">\n)[\s\S]*?(\n          <\/nav>)/, '$1            ' + navItems + '$2');
  s = s.replace(/(<nav aria-label="移动章节导航">\n)[\s\S]*?(\n          <\/nav>)/, '$1            ' + navItems + '$2');
  s = s.replace(/选择篇章 · <span id="current-chapter">[^<]*/, '选择篇章 · <span id="current-chapter">' + PARTS[0].title);

  const chapters = PARTS.map((p) => {
    const items = p.nos
      .filter((no) => meta[no])
      .map(
        (no) => `              <li>
                <a href="${meta[no].url}"><span class="code-entry-number">${no}</span><span>${meta[no].title}</span><span class="code-entry-arrow" aria-hidden="true">↗</span></a>
              </li>`
      )
      .join('\n');
    return `          <section class="code-chapter" id="${p.id}" aria-labelledby="chapter-title-${p.id}">
            <header class="code-chapter-head">
              <p class="eyebrow">${p.eyebrow}</p>
              <div>
                <h2 id="chapter-title-${p.id}">${p.title}</h2>
                <span>${String(p.nos.length).padStart(2, '0')} 篇</span>
              </div>
              <p>${p.desc}</p>
            </header>
            <ol class="code-entries">
${items}
            </ol>
          </section>`;
  }).join('\n');

  const start = s.indexOf('          <section class="code-chapter" id="chapter-1"');
  const end = s.indexOf('        </div>\n      </div>\n      <section class="agent-related');
  if (start < 0 || end < 0) throw new Error('专题页找不到章节区');
  s = s.slice(0, start) + chapters + '\n' + s.slice(end);

  s = s.replace(
    /\d+ <span>篇已发布<\/span><b>·<\/b>\d+ <span>个业务领域<\/span>/,
    String(built.length).padStart(2, '0') +
      ' <span>篇已发布</span><b>·</b>' +
      built.length +
      ' <span>个业务领域</span>'
  );
  write(file, s);
}

/* ---------- 2. 归档页 ---------- */
{
  const file = 'archives/index.html';
  let s = read(file);

  const cards = ARCHIVE_PARTS.map((p) => {
    const items = p.nos
      .filter((no) => meta[no])
      .map(
        (no) => `            <a
              href="${meta[no].url}"
              class="archive-item archive-item--table"
            >
              <span class="archive-num">${no}</span>
              <span class="archive-name">${meta[no].title}</span>
              <span class="archive-item-desc">${ARCHIVE_DESC[no]}</span>
              <span class="archive-arrow" aria-hidden="true">↗</span>
            </a>`
      )
      .join('\n');
    return `          <div class="archive-card archive-card--${p.id}">
            <div class="archive-card-header">
              <span class="archive-card-icon"></span>
              <div class="archive-card-info">
                <div class="archive-card-title">
                  <span>${p.title}</span>
                  <span class="archive-card-sub">${p.sub}</span>
                </div>
                <div class="archive-card-desc">${p.desc}</div>
              </div>
            </div>
${items}
          </div>`;
  }).join('\n');

  /* 整段分篇卡：连同原来那张 Part 1 卡一起换掉，重复执行不会重复插入 */
  const partStart = s.indexOf('          <div class="archive-card archive-card--part-agent-model">');
  const sectionEnd = s.indexOf(
    '        </section>\n        <section\n          class="archive-series-section archive-series-section--agent"\n          id="series-agent"'
  );
  if (partStart < 0 || sectionEnd < 0 || sectionEnd < partStart) throw new Error('归档页找不到分篇卡区');
  s = s.slice(0, partStart) + cards + '\n' + s.slice(sectionEnd);

  const total = rows.length + todo.length;
  s = s.replace(/content="六大专题、\d+ 篇文章：/, 'content="六大专题、' + total + ' 篇文章：');
  s = s.replace(
    /<span>06 <small>个专题<\/small><\/span\n            ><i><\/i><span>\d+ <small>篇文章<\/small>/,
    '<span>06 <small>个专题</small></span\n            ><i></i><span>' + total + ' <small>篇文章</small>'
  );
  s = s.replace(
    /<span>AI Agent 系统设计<\/span><small>\d+<\/small>/g,
    '<span>AI Agent 系统设计</span><small>' + String(built.length).padStart(2, '0') + '</small>'
  );
  write(file, s);
}

/* ---------- 3. 首页篇数 ---------- */
{
  const file = 'index.html';
  let s = read(file);
  const total = rows.length + todo.length;
  s = s.replace(/>全部 \d+ 篇文章/, '>全部 ' + total + ' 篇文章');
  s = s.replace(
    /(href="\/categories\/agent-design\/"[\s\S]{0,600}?>)\d+ 篇 <span aria-hidden="true">↗<\/span>/,
    '$1' + String(built.length).padStart(2, '0') + ' 篇 <span aria-hidden="true">↗</span>'
  );
  s = s.replace(/十类业务场景的 Agent 系统设计/, '十一类业务场景的 Agent 系统设计');
  write(file, s);
}

/* ---------- 4. 搜索索引 ---------- */
if (todo.length) {
  const file = 'search.xml';
  let s = read(file);
  const anchor = '  <entry>\n    <title>OpenClaw 是什么——概览与心智模型</title>';
  const entries = todo
    .map(
      (no) => `  <entry>
    <title>${meta[no].title}</title>
    <url>${meta[no].url}</url>
    <content><![CDATA[${meta[no].desc}]]></content>
    <categories><category>${series.SERIES}</category></categories>
    <tags><tag>agent-design</tag><tag>system-design</tag></tags>
  </entry>
`
    )
    .join('');
  if (!s.includes(anchor)) throw new Error('search.xml 找不到锚点');
  s = s.replace(anchor, entries + anchor);
  write(file, s);
}

/* ---------- 5. 订阅文件 ---------- */
if (todo.length) {
  const file = 'atom.xml';
  let s = read(file);
  const anchor = '<entry><title>OpenClaw 是什么——概览与心智模型</title>';
  const entries = todo
    .map(
      (no) =>
        `<entry><title>${meta[no].title}</title><link href="http://lianjifu.cn${meta[no].url}"/><id>http://lianjifu.cn${meta[no].url}</id><published>${series.DATE}T10:00:00.000Z</published><updated>${series.DATE}T12:00:00.000Z</updated><summary type="html">${meta[no].desc}</summary><category term="${series.SERIES}"/><category term="agent-design"/></entry>\n`
    )
    .join('');
  if (!s.includes(anchor)) throw new Error('atom.xml 找不到锚点');
  s = s.replace(anchor, entries + anchor);
  write(file, s);
}

/* ---------- 6. 正文基准：插入新条目的占位 ---------- */
if (todo.length) {
  const at = rows.findIndex((r) => r.series === series.CAT && r.order === 2) + 1;
  const newRows = todo.map((no) => ({
    url: meta[no].url,
    file: meta[no].file,
    title: meta[no].title,
    series: series.CAT,
    order: Number(no),
    bodyHash: '',
    bodyLength: 0,
    headings: 0,
  }));
  rows.splice(at, 0, ...newRows);
  fs.writeFileSync(manifestPath, JSON.stringify(rows, null, 2) + '\n');
  console.log('  docs/article-manifest.json 已插入 ' + todo.length + ' 条（哈希待重算）');
}

/* ---------- 7. 校验脚本的期望篇数 ---------- */
{
  const total = rows.length;
  const files = [
    ['scripts/verify-articles.cjs', /if\(rows\.length!==\d+\)/, 'if(rows.length!==' + total + ')'],
    ['scripts/verify-articles.cjs', /console\.log\("\d+ exact article-body/, 'console.log("' + total + ' exact article-body'],
    ['scripts/update-manifest.cjs', /const EXPECTED = \d+;/, 'const EXPECTED = ' + total + ';'],
  ];
  files.forEach(([f, re, to]) => {
    const p = path.join(ROOT, f);
    let s = fs.readFileSync(p, 'utf8');
    if (!re.test(s)) throw new Error('期望篇数那行没找到：' + f);
    s = s.replace(re, to);
    fs.writeFileSync(p, s);
  });
  console.log('  scripts：期望篇数改为 ' + total);
}

console.log('\n下一步：node scripts/update-manifest.cjs --write');
