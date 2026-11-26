'use strict';
/* 润色前的横向盘点：雷同句式、术语变体、可疑的数值口径。
 * 覆盖十篇（01–10），11 篇作为参照一并扫描但不改。 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const TARGET = series.CHAPTERS.filter((c) => Number(c.no) <= 10);

/* ---------- 把 plan 拆成「字段 → 文本」 ---------- */
function loadFields(no) {
  const plan = require(path.join(ROOT, 'scripts/agent-design/plan-' + no + '.cjs'))[no];
  const fields = [];
  const push = (where, text) => {
    if (typeof text === 'string' && text.trim()) fields.push({ where, text: text.replace(/\s+/g, ' ').trim() });
  };
  push('lead', plan.lead);
  (plan.guide || []).forEach((g, i) => g.forEach((x, j) => push('guide[' + i + '][' + j + ']', x)));
  (plan.overview || []).forEach((r, i) => {
    push('overview[' + i + '].k', r[0]);
    push('overview[' + i + '].v', r[1]);
  });
  (plan.route || []).forEach((r, i) => {
    push('route[' + i + '].k', r[0]);
    push('route[' + i + '].v', r[1]);
  });
  (plan.segs || []).forEach((s, si) => {
    push('seg' + (si + 1) + '.part', s.part);
    (s.secs || []).forEach((c, ci) => {
      push('seg' + (si + 1) + '.sec' + (ci + 1) + '.title', c.title);
      push('seg' + (si + 1) + '.sec' + (ci + 1) + '.key', c.key);
      push('seg' + (si + 1) + '.sec' + (ci + 1) + '.note', c.note);
    });
  });
  const cl = plan.closing || {};
  push('closing.summary', cl.summary);
  (cl.points || []).forEach((p, i) => {
    push('closing.points[' + i + '].k', p[0]);
    push('closing.points[' + i + '].v', p[1]);
  });
  push('closing.next', cl.next);
  (cl.reading || []).forEach((r, i) => {
    push('closing.reading[' + i + '].k', r[0]);
    push('closing.reading[' + i + '].v', r[1]);
  });
  return fields;
}

const docs = TARGET.map((c) => ({ no: c.no, fields: loadFields(c.no) }));
const ref = series.CHAPTERS.filter((c) => Number(c.no) > 10).map((c) => ({ no: c.no, fields: loadFields(c.no) }));

/* ---------- 1. 雷同句式 ---------- */
console.log('【一】跨篇雷同的开头（同一句式出现在 ≥3 篇）');
const heads = {};
docs.forEach((d) =>
  d.fields.forEach((f) => {
    if (f.text.length < 12) return;
    const k = f.text.slice(0, 8);
    (heads[k] = heads[k] || []).push(d.no + ' ' + f.where);
  })
);
Object.entries(heads)
  .filter(([, v]) => new Set(v.map((x) => x.split(' ')[0])).size >= 3)
  .sort((a, b) => new Set(b[1].map((x) => x.split(' ')[0])).size - new Set(a[1].map((x) => x.split(' ')[0])).size)
  .forEach(([k, v]) => console.log('  「' + k + '…」 ' + [...new Set(v.map((x) => x.split(' ')[0]))].join(',') + '  → ' + v.join(' / ')));

/* ---------- 2. 术语变体 ---------- */
console.log('\n【二】可能的术语变体（同一概念的不同写法）');
const VARIANTS = [
  ['幂等', /幂等键|幂等 ID|幂等 id|幂等标识|幂等令牌|幂等键设计/],
  ['降级', /降级矩阵|降级策略|降级方案|降级开关|降级表|分级降级/],
  ['熔断', /熔断|断路/],
  ['提示注入', /Prompt Injection|提示注入|提示词注入|注入防护/],
  ['授权', /鉴权|授权|身份认证|认证/],
  ['回滚', /回滚|撤销|冲正|补偿/],
  ['护栏', /护栏|闸门|门控|卡点|拦截/],
  ['幂等与重试', /重试|退避|backoff|重放/],
  ['可观测', /可观测性|可观测|观测点|埋点/],
  ['成本', /推理成本|token 成本|token成本|Token 成本/],
  ['SLO', /SLO|SLOs|服务目标|可用性目标/],
  ['SOP', /SOP|作业流程|处置流程|响应流程/],
];
VARIANTS.forEach(([name, re]) => {
  const hits = {};
  docs.forEach((d) =>
    d.fields.forEach((f) => {
      const m = f.text.match(re);
      if (m) (hits[m[0]] = hits[m[0]] || new Set()).add(d.no);
    })
  );
  const keys = Object.keys(hits);
  if (keys.length > 1) console.log('  ' + name + '：' + keys.map((k) => k + '(' + hits[k].size + '篇)').join(' / '));
});

/* ---------- 3. 可疑数值口径 ---------- */
console.log('\n【三】同一篇内重复出现的数字口径（用于核对是否自相矛盾）');
const NUM = /(?:P50|P90|P95|P99|99\.9%|99\.99%|≥\s*\d+|\d+\s*%|日\s*[\d.]+\s*万|[\d.]+\s*倍)/g;
docs.forEach((d) => {
  const bag = {};
  d.fields.forEach((f) => {
    (f.text.match(NUM) || []).forEach((n) => {
      (bag[n] = bag[n] || []).push(f.where);
    });
  });
  const rep = Object.entries(bag).filter(([, v]) => v.length >= 3);
  if (rep.length) console.log('  ' + d.no + '：' + rep.map(([k, v]) => k + '×' + v.length).join('  '));
});

/* ---------- 4. 跨篇共享概念的数值 ---------- */
console.log('\n【四】跨篇共享数字（同一数值出现在多篇，检查是否指同一件事）');
const numBag = {};
docs.forEach((d) =>
  d.fields.forEach((f) => {
    (f.text.match(/\d[\d.,]*\s*(?:万|亿|%|倍|秒|毫秒|天|小时|分钟|QPS|TPS|条|个|次)/g) || []).forEach((n) => {
      const k = n.replace(/\s+/g, '');
      (numBag[k] = numBag[k] || new Set()).add(d.no);
    });
  })
);
Object.entries(numBag)
  .filter(([, v]) => v.size >= 4)
  .sort((a, b) => b[1].size - a[1].size)
  .slice(0, 25)
  .forEach(([k, v]) => console.log('  ' + k + '：' + [...v].join(',')));

/* ---------- 5. 参照：11 篇是否也有雷同 ---------- */
console.log('\n【五】11 篇的句式（本次不改，但要避免改完后与它雷同）');
ref.forEach((d) => {
  const g = {};
  d.fields.forEach((f) => {
    if (f.text.length < 12) return;
    const k = f.text.slice(0, 8);
    (g[k] = g[k] || []).push(f.where);
  });
  Object.entries(g)
    .filter(([, v]) => v.length >= 1)
    .filter(([k]) => heads[k])
    .forEach(([k, v]) => console.log('  11 的「' + k + '…」与上面雷同：' + v.join(' / ')));
});
