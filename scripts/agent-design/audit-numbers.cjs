'use strict';
/* 数值口径核对（相邻匹配）：只在「指标名 + 紧邻的数值」这种写法上比对。
 *
 * 例如「误拒率 ≤ 3%」与「误拒率 5%」会被当作同一指标的两个取值报出来；
 * 而一句里同时出现 QPS、覆盖率和百分比不会被误判。
 */
const fs = require('fs');
const path = require('path');
const series = require('./series.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const DATE_DIR = series.DATE.replace(/-/g, '/');

const LABELS = [
  '召回率', '准确率', '精确率', '幻觉率', '误拒率', '误报率', '漏报率', '漏检率', '转人工率', '投诉率', '退订率',
  '覆盖率', '引用完整率', '采纳率', '推翻率', '命中率', '满足率', '超卖率', '重复退款', '通过率', '成功率',
  '错误率', '一致率', '分歧率', '缺勤率', '中断率', '超时率', '损耗率', '命中率', '完播率', '退款率',
  'P50', 'P95', 'P99', 'QPS', 'TPS', 'RPS',
];

function lines(no) {
  const file = path.join(ROOT, DATE_DIR, series.slugOf(no), 'index.html');
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, 'utf8');
  const body = src.slice(src.indexOf('<div class="post-body'), src.indexOf('<aside class="article-toc-aside">'));
  return body
    .replace(/<\/(p|li|h[2345]|tr|td)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 8);
}

const list = process.argv.slice(2).length ? process.argv.slice(2) : series.CHAPTERS.map((c) => c.no);
let flagged = 0;

list.forEach((no) => {
  const bag = {};
  lines(no).forEach((s) => {
    LABELS.forEach((lab) => {
      const re = new RegExp(lab + '[^0-9%倍万亿]{0,6}([\\d][\\d,.]*)\\s*(%|倍|万|亿|毫秒|秒|分钟|QPS|TPS|ms)?', 'g');
      [...s.matchAll(re)].forEach((m) => {
        if (!m[1]) return;
        (bag[lab] = bag[lab] || []).push({ v: m[1] + (m[2] || ''), s: s.slice(0, 100) });
      });
    });
  });
  const flags = Object.entries(bag).filter(([, v]) => new Set(v.map((x) => x.v)).size > 1);
  if (!flags.length) return;
  flagged += flags.length;
  console.log('\n===== ' + no + ' ' + series.byNo[no].title + ' =====');
  flags.forEach(([lab, v]) => {
    console.log('  · ' + lab + '：' + [...new Set(v.map((x) => x.v))].join('  /  '));
    v.slice(0, 5).forEach((x) => console.log('      ' + x.v.padStart(9) + '  ' + x.s));
  });
});

console.log('\n相邻数值口径存疑：' + flagged + ' 处');
