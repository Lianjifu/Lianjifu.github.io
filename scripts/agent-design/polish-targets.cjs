'use strict';
/* 润色工作清单：把十一篇里「正文撞开头」的地方挑出来，剔掉骨架标签。
 *
 * 用法：node scripts/agent-design/polish-targets.cjs [--json] [篇号…]
 *
 * 骨架标签（全系列刻意对齐，不改）：
 *   route[].k            路线图卡片标题
 *   seg*.title           小节标题
 *   closing.next         「下一章 <strong>…</strong>：…」的整句结构
 *   closing.reading[].k  相关阅读的条目标题
 *   closing.points[].k   本章结论的条目标题
 *   seg*.part            「这一段回答：」前缀
 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const list = args.filter((a) => a !== '--json').length ? args.filter((a) => a !== '--json') : series.CHAPTERS.map((c) => c.no);

const norm = (s) => (typeof s === 'string' ? s : '').replace(/\s+/g, ' ').trim();

/* 结构性前缀：比较时剥掉 */
const STRIP = [
  [/^这一段回答：/, ''],
  [/^下一章\s*(<strong>.*?<\/strong>)?[：:]\s*/, ''],
];

function fieldsOf(no) {
  const plan = require(path.join(ROOT, 'scripts/agent-design/plan-' + no + '.cjs'))[no];
  const out = [];
  const add = (where, text, kind) => {
    let t = norm(text);
    if (kind === 'seg.part' || kind === 'closing.next') STRIP.forEach(([re]) => (t = t.replace(re, '')));
    if (t.length >= 10) out.push({ where, text: t, kind });
  };
  add('lead', plan.lead, 'lead');
  (plan.guide || []).forEach((g, i) => g.forEach((x, j) => add('guide[' + i + '][' + j + ']', x, 'guide')));
  (plan.overview || []).forEach((r, i) => {
    add('overview[' + i + '].k', r[0], 'ovkey');
    add('overview[' + i + '].v', r[1], 'ovval');
  });
  (plan.route || []).forEach((r, i) => {
    add('route[' + i + '].k', r[0], 'routekey');
    add('route[' + i + '].v', r[1], 'routeval');
  });
  (plan.segs || []).forEach((s, si) => {
    add('seg' + (si + 1) + '.part', s.part, 'seg.part');
    (s.secs || []).forEach((c, ci) => {
      add('seg' + (si + 1) + '.sec' + (ci + 1) + '.title', c.title, 'title');
      add('seg' + (si + 1) + '.sec' + (ci + 1) + '.key', c.key, 'key');
      add('seg' + (si + 1) + '.sec' + (ci + 1) + '.note', c.note, 'note');
    });
  });
  const cl = plan.closing || {};
  add('closing.summary', cl.summary, 'summary');
  (cl.points || []).forEach((p, i) => {
    add('closing.points[' + i + '].k', p[0], 'pointkey');
    add('closing.points[' + i + '].v', p[1], 'pointval');
  });
  (cl.reading || []).forEach((r, i) => {
    add('closing.reading[' + i + '].k', r[0], 'readkey');
    add('closing.reading[' + i + '].v', r[1], 'readval');
  });
  return out;
}

/* 只比较正文类 */
const BODY = new Set(['lead', 'guide', 'ovkey', 'ovval', 'routeval', 'seg.part', 'key', 'note', 'summary', 'pointval', 'readval']);

const all = {};
list.forEach((no) => (all[no] = fieldsOf(no)));

const index = {};
list.forEach((no) =>
  all[no].forEach((f) => {
    if (!BODY.has(f.kind)) return;
    const k = f.text.slice(0, 8);
    (index[k] = index[k] || {})[no] = (index[k][no] || 0) + 1;
  })
);

const out = {};
list.forEach((no) => {
  const rows = [];
  all[no].forEach((f) => {
    if (!BODY.has(f.kind)) return;
    const k = f.text.slice(0, 8);
    const others = Object.keys(index[k] || {}).filter((x) => x !== no);
    if (others.length) rows.push({ where: f.where, kind: f.kind, key: k, others, text: f.text });
  });
  out[no] = rows;
});

if (asJson) {
  fs.writeFileSync('/tmp/polish-targets.json', JSON.stringify(out, null, 2));
  console.log('已写出 /tmp/polish-targets.json');
}

let total = 0;
list.forEach((no) => {
  const rows = out[no];
  total += rows.length;
  console.log('\n===== ' + no + ' ' + series.byNo[no].title + '：' + rows.length + ' 处 =====');
  rows.forEach((r) => {
    console.log('  ' + r.where.padEnd(22) + '[' + r.kind + ']  与 ' + r.others.join(',') + ' 撞「' + r.key + '」');
    console.log('      ' + r.text.slice(0, 100));
  });
});
console.log('\n合计 ' + total + ' 处');
