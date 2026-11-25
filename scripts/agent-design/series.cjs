'use strict';
/* AI Agent 系统设计 · 专题总表。
 *
 * 博客篇号与总纲章号的对应关系：
 *   源 22 客服 → 博客 03；源 23 问数 → 01；源 24 问答 → 02；源 25 营销 → 04；
 *   源 26 电商 → 05；源 27 供应链 → 11；源 28 文旅 → 06；源 29 运维 → 07；
 *   源 30 安全运营 → 08；源 31 合同审查 → 09；源 32 办公写作 → 10。
 *
 * 阅读顺序按博客篇号排；跨篇引用一律用 blogNo 与 title，
 * 不要出现总纲的章号（总纲还在增补，章号会漂移）。
 */

const DATE = '2026-11-26';
const SERIES = 'AI Agent 系统设计';
const CAT = 'agent-design';

const CHAPTERS = [
  {
    no: '01',
    source: '23-text2sql',
    title: '问数 Agent——从模糊提问到可信结论',
    kicker: '第 1 章：问数 Agent',
  },
  {
    no: '02',
    source: '24-rag',
    title: '问答 Agent——从知识库到可核验答案',
    kicker: '第 2 章：问答 Agent',
  },
  {
    no: '03',
    source: '22-customer-service',
    title: '客服 Agent——从答疑到受控代办',
    kicker: '第 3 章：客服 Agent',
  },
  {
    no: '04',
    source: '25-marketing',
    title: '营销 Agent——从自然语言目标到可归因的触达',
    kicker: '第 4 章：营销 Agent',
  },
  {
    no: '05',
    source: '26-ecommerce',
    title: '电商 Agent——导购、交易与售后的受控编排',
    kicker: '第 5 章：电商 Agent',
  },
  {
    no: '06',
    source: '28-travel',
    title: '文旅 Agent——行程、资源与动态重排',
    kicker: '第 6 章：文旅 Agent',
  },
  {
    no: '07',
    source: '29-sre-ops',
    title: '运维 Agent——从告警风暴到受控止血',
    kicker: '第 7 章：运维 Agent',
  },
  {
    no: '08',
    source: '30-secops',
    title: '安全运营 Agent——跨源取证与最小遏制',
    kicker: '第 8 章：安全运营 Agent',
  },
  {
    no: '09',
    source: '31-contract-review',
    title: '合同审查 Agent——逐条可判定的审查结论',
    kicker: '第 9 章：合同审查 Agent',
  },
  {
    no: '10',
    source: '32-office-writing',
    title: '办公写作 Agent——文档、PPT 与周报的生成',
    kicker: '第 10 章：办公写作 Agent',
  },
  {
    no: '11',
    source: '27-supply-chain',
    title: '供应链 Agent——预测、补货与履约的约束求解',
    kicker: '第 11 章：供应链 Agent',
  },
];

const byNo = Object.fromEntries(CHAPTERS.map((c) => [c.no, c]));
const urlOf = (no) => '/2026/11/26/' + slugOf(no) + '/';
const slugOf = (no) => 'agent-design-' + no + '-' + slugSuffix(byNo[no].source);

function slugSuffix(source) {
  return source.replace(/^\d+-/, '');
}

/* 篇号 → 站内链接的辅助函数，写进 plan 里做跨篇引用 */
function linkTo(no) {
  return '<a href="' + urlOf(no) + '">第 ' + no + ' 章 · ' + byNo[no].title + '</a>';
}

module.exports = { DATE, SERIES, CAT, CHAPTERS, byNo, urlOf, slugOf, linkTo };
