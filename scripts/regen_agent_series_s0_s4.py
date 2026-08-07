#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenerate AI Agent series articles 01–03 + category/archives/search (S0–S4)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("/Users/LIANJIFU/GitHub/Lianjifu-log")

CSS = r"""
    .ai-engineering-page { background: #f8fafc; }
    .ai-engineering-page .post-block { max-width: 1180px; margin: 0 auto; }
    .ai-engineering-page .post-body { color: #172554; }
    .ai-engineering-page .post-body h2 { margin-top: 3.2rem; padding-bottom: .7rem; border-bottom: 2px solid #dbeafe; color: #123b8f; }
    .ai-engineering-page .post-body h3 { color: #1d4ed8; }
    .ai-engineering-page .section-kicker { display: inline-block; margin: 2.2rem 0 .35rem; color: #2563eb; font-size: .78rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .ai-engineering-page .section-summary { margin: .9rem 0 1.5rem; padding: 1rem 1.2rem; border-left: 4px solid #2563eb; background: #eff6ff; color: #1e3a8a; font-weight: 600; }
    .ai-engineering-page .content-block { margin: 1.25rem 0; }
    .ai-engineering-page .content-block h3 { margin-bottom: .55rem; font-size: 1.12rem; }
    .ai-engineering-page .callout { margin: 1.4rem 0; padding: 1rem 1.2rem; border: 1px solid #bfdbfe; border-radius: 10px; background: #f8fbff; }
    .ai-engineering-page .callout strong { color: #1d4ed8; }
    .ai-engineering-page .tip-box { margin: 1.2rem 0; padding: 1rem 1.15rem; border-left: 4px solid #f59e0b; background: #fffbeb; border-radius: 0 10px 10px 0; color: #78350f; }
    .ai-engineering-page .tip-box strong { color: #b45309; }
    .ai-engineering-page .warn-box { margin: 1.2rem 0; padding: 1rem 1.15rem; border-left: 4px solid #ef4444; background: #fef2f2; border-radius: 0 10px 10px 0; color: #7f1d1d; }
    .ai-engineering-page .warn-box strong { color: #b91c1c; }
    .ai-engineering-page .deliverables { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: .8rem; margin: 1rem 0 1.5rem; }
    .ai-engineering-page .deliverable { padding: .85rem 1rem; border: 1px solid #dbeafe; border-radius: 8px; background: #fff; }
    .ai-engineering-page .deliverable strong { display: block; margin-bottom: .25rem; color: #1e40af; }
    .ai-engineering-page .step-list { counter-reset: step; list-style: none; padding-left: 0; }
    .ai-engineering-page .step-list li { counter-increment: step; position: relative; margin: .75rem 0; padding: .7rem .9rem .7rem 3rem; border: 1px solid #dbeafe; border-radius: 8px; background: #fff; }
    .ai-engineering-page .step-list li::before { content: counter(step); position: absolute; left: .85rem; top: .65rem; width: 1.45rem; height: 1.45rem; border-radius: 50%; background: #2563eb; color: #fff; text-align: center; line-height: 1.45rem; font-weight: 700; }
    .ai-engineering-page .comparison-table { width: 100%; margin: 1rem 0 1.5rem; border-collapse: collapse; font-size: .95rem; }
    .ai-engineering-page .comparison-table th, .ai-engineering-page .comparison-table td { padding: .7rem .8rem; border: 1px solid #dbeafe; text-align: left; vertical-align: top; }
    .ai-engineering-page .comparison-table th { background: #dbeafe; color: #1e3a8a; }
    .ai-engineering-page .chapter-close { margin-top: 1.5rem; padding: .9rem 1.1rem; border-radius: 9px; background: #172554; color: #eff6ff; }
    .ai-engineering-page .chapter-close strong { color: #93c5fd; }
    .ai-engineering-page .chapter-image { display: block; width: 100%; height: auto; margin: 1rem auto 1.75rem; border: 1px solid #bfdbfe; border-radius: 12px; box-shadow: 0 12px 32px rgba(37, 99, 235, .12); }
    .ai-engineering-page .overview-image { margin: 1.25rem auto 2rem; }
    .ai-engineering-page .principles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1.5rem 0; }
    .ai-engineering-page .principle { padding: 1rem; border: 1px solid #bfdbfe; border-radius: 10px; background: #eff6ff; }
    .ai-engineering-page .principle strong { display: block; margin-bottom: .35rem; color: #1d4ed8; }
    .ai-engineering-page .contract-template { margin: 1rem 0 1.5rem; padding: 1rem 1.1rem; border-radius: 10px; background: #0f172a; color: #e2e8f0; overflow-x: auto; font-size: .9rem; line-height: 1.55; }
    .ai-engineering-page .contract-template code { color: inherit; background: transparent; }
    .ai-engineering-page .chapter-nav { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin: 2rem 0 1rem; padding-top: 1.2rem; border-top: 1px solid #dbeafe; }
    .ai-engineering-page .chapter-nav a { color: #2563eb; font-weight: 700; text-decoration: none; }
    .ai-engineering-page .chapter-nav a:hover { text-decoration: underline; }
    .ai-engineering-page hr { border: 0; border-top: 1px solid #dbeafe; margin: 2.4rem 0; }
    .ai-engineering-page .comparison-table a { color: #1d4ed8; font-weight: 600; text-decoration: none; }
    .ai-engineering-page .post-body > h2[id="intro"] { margin-top: 1.2rem; }
    .ai-engineering-page .note-take { margin: 1.1rem 0 0; padding: .85rem 1.1rem; border: 1px dashed #93c5fd; border-radius: 8px; background: #f8fafc; color: #1e3a8a; font-size: .95rem; }
    .ai-engineering-page .note-take strong { color: #1d4ed8; }
    .ai-engineering-page .note-meta { margin: 0 0 1rem; color: #64748b; font-size: .9rem; }
    .ai-engineering-page .series-path { margin: 1rem 0 1.5rem; padding: 1rem 1.15rem; border-radius: 10px; background: #0f172a; color: #e2e8f0; font-size: .92rem; line-height: 1.7; }
    .ai-engineering-page .series-path strong { color: #93c5fd; }
    .ai-engineering-page .series-path a { color: #93c5fd; }
    @media (max-width: 700px) {
      .ai-engineering-page .principles { grid-template-columns: 1fr 1fr; }
      .ai-engineering-page .deliverables { grid-template-columns: 1fr; }
      .ai-engineering-page .comparison-table { display: block; overflow-x: auto; }
      .ai-engineering-page .post-body { padding: 0 .75rem; }
    }
"""

SERIES_PATH_HTML = """
          <div class="series-path">
            <strong>五层路径：</strong>
            01 个人交付能力 → 02 系统理解能力 → 03 单产品设计能力 → 04 平台设计能力 → 05 场景工作台设计能力
          </div>
"""


def shell(meta: dict, body: str, prev_nav: str, next_nav: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2">
  <meta name="theme-color" content="#0f172a">
  <meta name="generator" content="Hexo 5.4.0">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon-next.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32-next.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16-next.png">
  <meta name="description" content="{meta['desc']}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{meta['title']}">
  <meta property="og:url" content="http://lianjifu.cn{meta['url']}">
  <meta property="og:site_name" content="LianJiFu'blogs">
  <meta property="og:description" content="{meta['desc']}">
  <meta property="og:locale" content="zh_CN">
  <meta property="article:published_time" content="{meta['published']}">
  <meta property="article:author" content="JiFuLian">
  <meta property="article:tag" content="AI Agent">
  <link rel="canonical" href="http://lianjifu.cn{meta['url']}">
  <title>{meta['title']} | LianJiFu'blogs</title>
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/lib/font-awesome/css/all.min.css">
  <link rel="stylesheet" href="/css/2026.css">
  <link rel="stylesheet" href="/css/post.css?v=6">
  <script id="hexo-configurations">
    var NexT = window.NexT || {{}};
    var CONFIG = {{"hostname":"lianjifu.cn","root":"/","scheme":"Pisces","version":"7.8.0","exturl":false,"sidebar":{{"position":"right","Pisces | Gemini":240,"display":"post","padding":18,"offset":12,"onmobile":false}},"copycode":{{"enable":false,"show_result":false,"style":null}},"back2top":{{"enable":true,"sidebar":false,"scrollpercent":false}},"fancybox":false,"mediumzoom":false,"lazyload":false,"pangu":false,"comments":{{"style":"tabs","active":null,"storage":true,"lazyload":false,"nav":null}},"algolia":{{"hits":{{"per_page":10}},"labels":{{"input_placeholder":"Search for Posts","hits_empty":"We didn't find any results for the search: ${{query}}","hits_stats":"${{hits}} results found in ${{time}} ms"}}}},"localsearch":{{"enable":true,"trigger":"auto","top_n_per_article":1,"unescape":false,"preload":false}},"motion":{{"enable":true,"async":false,"transition":{{"post_block":"fadeIn","post_header":"slideDownIn","post_body":"slideDownIn","coll_header":"slideLeftIn","sidebar":"slideUpIn"}}}},"path":"search.xml"}};
  </script>
  <script id="page-configurations">
    CONFIG.page = {{ sidebar: "", isHome: false, isPost: true, lang: "zh-CN" }};
  </script>
  <noscript>
    <style>
      .use-motion .brand, .use-motion .menu-item, .sidebar-inner,
      .use-motion .post-block, .use-motion .post-header, .use-motion .post-body {{ opacity: initial; }}
      .use-motion .site-title, .use-motion .site-subtitle {{ opacity: initial; top: initial; }}
    </style>
  </noscript>
  <style>{CSS}
  </style>
</head>
<body itemscope itemtype="http://schema.org/WebPage" class="page-post ai-engineering-page">
  <div class="container use-motion">
    <div class="headband"></div>
    <header class="header" itemscope itemtype="http://schema.org/WPHeader">
      <div class="header-inner">
        <div class="site-brand-container">
          <div class="site-nav-toggle">
            <div class="toggle" aria-label="切换导航栏">
              <span class="toggle-line toggle-line-first"></span>
              <span class="toggle-line toggle-line-middle"></span>
              <span class="toggle-line toggle-line-last"></span>
            </div>
          </div>
          <div class="site-meta">
            <a href="/" class="brand" rel="start">
              <span class="logo-line-before"><i></i></span>
              <h1 class="site-title">LianJiFu'blogs</h1>
              <span class="logo-line-after"><i></i></span>
            </a>
          </div>
          <div class="site-nav-right">
            <div class="toggle popup-trigger"><i class="fa fa-search fa-fw fa-lg"></i></div>
          </div>
        </div>
        <nav class="site-nav">
          <ul id="menu" class="main-menu menu">
            <li class="menu-item menu-item-home"><a href="/" rel="section"><i class="fa fa-home fa-fw"></i>首页</a></li>
            <li class="menu-item menu-item-about"><a href="/about/" rel="section"><i class="fa fa-user fa-fw"></i>关于</a></li>
            <li class="menu-item menu-item-archives"><a href="/archives/" rel="section"><i class="fa fa-book fa-fw"></i>目录</a></li>
            <li class="menu-item menu-item-search"><a role="button" class="popup-trigger"><i class="fa fa-search fa-fw"></i>搜索</a></li>
          </ul>
        </nav>
        <div class="search-pop-overlay">
          <div class="popup search-popup">
            <div class="search-header">
              <span class="search-icon"><i class="fa fa-search"></i></span>
              <div class="search-input-container">
                <input autocomplete="off" autocapitalize="off" placeholder="搜索..." spellcheck="false" type="search" class="search-input">
              </div>
              <span class="popup-btn-close"><i class="fa fa-times-circle"></i></span>
            </div>
            <div id="search-result">
              <div id="no-result"><i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="back-to-top"><i class="fa fa-arrow-up"></i><span>0%</span></div>
    <main class="main"><div class="main-inner"><div class="content-wrap"><div class="content post posts-expand">
      <article class="post-block" itemscope itemtype="http://schema.org/Article">
        <header class="post-header">
          <h1 class="post-title" itemprop="name headline">{meta['title']}</h1>
          <div class="post-meta"><span class="post-meta-item"><i class="far fa-calendar"></i> 发表于 {meta['date']}</span><span class="post-meta-item"><i class="far fa-folder"></i> 分类于 <a href="/categories/ai-agent/">AI Agent</a></span><span class="post-meta-item"><i class="fas fa-tags"></i> {meta['tags']}</span></div>
        </header>
        <div class="post-body" itemprop="articleBody" data-toc-mode="h2">
{body}
          <div class="chapter-nav">
            {prev_nav}
            {next_nav}
          </div>
        </div>
      </article>
    </div></div>
    <div class="toggle sidebar-toggle">
      <span class="toggle-line toggle-line-first"></span>
      <span class="toggle-line toggle-line-middle"></span>
      <span class="toggle-line toggle-line-last"></span>
    </div>
    <aside class="sidebar">
      <div class="sidebar-inner">
        <ul class="sidebar-nav motion-element">
          <li class="sidebar-nav-toc sidebar-nav-active">文章目录</li>
          <li class="sidebar-nav-overview">站点概览</li>
        </ul>
        <div class="post-toc-wrap sidebar-panel"></div>
        <div class="site-overview-wrap sidebar-panel">
          <div class="site-author motion-element">
            <img class="site-author-image" alt="JiFuLian" src="/uploads/avatar.png">
            <p class="site-author-name">JiFuLian</p>
            <div class="site-description">全栈开发者 · AI Agent 研究员</div>
          </div>
          <div class="site-state-wrap motion-element"><nav class="site-state">
            <div class="site-state-item"><a href="/archives/"><span class="site-state-item-count">87</span><span class="site-state-item-name">文章</span></a></div>
            <div class="site-state-item"><a href="/categories/"><span class="site-state-item-count">4</span><span class="site-state-item-name">分类</span></a></div>
          </nav></div>
          <div class="links-of-author motion-element"><span class="links-of-author-item"><a href="https://github.com/Lianjifu" title="GitHub" rel="noopener" target="_blank"><i class="fab fa-github fa-fw"></i>GitHub</a></span></div>
        </div>
      </div>
    </aside>
    <div id="sidebar-dimmer"></div>
    </div></main>
    <footer class="footer">
      <div class="footer-inner">
        <div class="copyright">&copy; 2017 – 2026 <span class="author">JiFuLian</span></div>
      </div>
    </footer>
  </div>
  <script src="/lib/anime.min.js"></script>
  <script src="/lib/velocity/velocity.min.js"></script>
  <script src="/lib/velocity/velocity.ui.min.js"></script>
  <script src="/js/utils.js"></script>
  <script src="/js/motion.js"></script>
  <script src="/js/schemes/pisces.js"></script>
  <script src="/js/next-boot.js"></script>
  <script src="/js/local-search.js?v=4"></script>
  <script src="/js/2026.js?v=8"></script>
</body>
</html>
"""


def section(hid: str, toc: str, title: str, kicker: str, summary: str, img: str | None, body: str, think: str) -> str:
    img_html = f'\n          <img class="chapter-image" src="{img}" alt="{toc}">' if img else ""
    return f"""
          <h2 id="{hid}" data-toc="{toc}">{title}</h2>
          <span class="section-kicker">{kicker}</span>
          <p class="section-summary">{summary}</p>{img_html}
{body}
          <div class="note-take"><strong>思考：</strong>{think}</div>
          <hr>
"""


def body_01() -> str:
    parts = []
    parts.append(f"""
          <h2 id="intro" data-toc="开篇">开篇 · 01 个人交付能力</h2>
          <span class="section-kicker">00 / 个人交付能力 · AI 编程个人交付</span>
          <p class="note-meta">本篇 = 01 · 个人交付能力 · AI 编程个人交付 · 案例：用户认证系统</p>
          <p class="section-summary">思考一句：会生成只是起点；能交付靠的是你怎么组织每一次对 AI 的输入、拆步与验收。</p>
{SERIES_PATH_HTML}
          <div class="callout">
            <strong>本层解决：</strong>用 AI 编程工具把一次任务交到可合并、可上线。<br>
            <strong>本层不做：</strong>Agent 原理、单产品/平台/工作台设计（→ 02–05）。<br>
            <strong>邻接：</strong>无前置 → 本层产出「个人交付工序」→ 02 系统理解。
          </div>
          <img class="chapter-image overview-image" src="/images/ai-programming-engineering/00-overview.png" alt="AI 编程个人交付总览">
          <p>对象模型（本层）：<strong>任务 · 契约 · 证据 · 步骤 · 反馈</strong>。主语是「你」——使用者，不是系统，也不是产品。</p>
""")

    parts.append(section(
        "part-01", "问题地图", "Part 01 · 问题地图：失败不是一个点",
        "01 / 定义问题", "翻车先归层，再修；不要看到失败就「再生成一次」。",
        "/images/ai-programming-engineering/01-problem-map.png",
        """
          <div class="content-block">
            <h3>四层失败</h3>
            <table class="comparison-table">
              <tr><th>层</th><th>症状</th><th>先修什么</th></tr>
              <tr><td>说不清</td><td>做了不该做的 / 漏了验收</td><td>任务契约</td></tr>
              <tr><td>依据错</td><td>改错文件、用过时约定</td><td>证据包</td></tr>
              <tr><td>步骤不可检</td><td>一大坨 Diff、中断无法续</td><td>可检查工序</td></tr>
              <tr><td>无闭环</td><td>测红了仍宣称完成</td><td>反馈写回下一轮</td></tr>
            </table>
          </div>
""",
        "这次翻车先归哪一层？"))

    parts.append(section(
        "part-02", "能力链", "Part 02 · 交付能力链：说清楚 · 给依据 · 跑可靠 · 变更好",
        "02 / 能力总图", "四件事缺一，交付就会卡在对应那一层。",
        "/images/ai-programming-engineering/02-four-engineering.png",
        """
          <div class="principles">
            <div class="principle"><strong>说清楚</strong>目标、边界、验收</div>
            <div class="principle"><strong>给依据</strong>最小充分的材料</div>
            <div class="principle"><strong>跑可靠</strong>拆步、检查点、可交接</div>
            <div class="principle"><strong>变更好</strong>失败写回下一轮</div>
          </div>
          <p>本层用口语描述四件事。系统侧机制名见 <a href="/2026/08/08/llm-agent-principles/">02 · 系统理解</a>，此处不展开。</p>
""",
        "四件事里你最常缺哪一件？"))

    parts.append(section(
        "part-03", "任务契约", "Part 03 · 任务契约：把需求写成可执行 Spec",
        "03 / 说清楚", "喂给 AI 的不是一句话，而是任务契约。",
        "/images/ai-programming-engineering/03-prompt-engineering.png",
        """
          <div class="contract-template"><code>Goal: …
Boundary: 只改 … / 禁止 …
Acceptance: 可观测的通过条件
Non-goals: 明确不做
Evidence: 必读文件/规范（见下一章）</code></div>
          <div class="tip-box"><strong>边界：</strong>契约回答「要什么」；不回答「系统里 Context 如何治理」（那是 02）。</div>
""",
        "你的下一条 Prompt 有没有可一票否决的验收句？"))

    parts.append(section(
        "part-04", "证据包", "Part 04 · 证据包：刚好够用的材料",
        "04 / 给依据", "不是仓库一股脑塞进去，而是最小且充分。",
        "/images/ai-programming-engineering/04-context-engineering.png",
        """
          <ul>
            <li>只附：本步会改到的文件、直接依赖、现行规范片段</li>
            <li>不附：整仓、密钥、与本步无关的历史讨论</li>
            <li>每加一份材料问：缺了会导致什么错？答不清就是噪音</li>
          </ul>
""",
        "多塞的那份文件解决了什么问题？"))

    parts.append(section(
        "part-05", "可检查工序", "Part 05 · 可检查工序：拆开 · 可恢复 · 可交接",
        "05 / 跑可靠", "大任务拆成可检查、可恢复、可交接的步骤（人侧工序）。",
        "/images/ai-programming-engineering/05-harness-engineering.png",
        """
          <ol class="step-list">
            <li>一步只做一个可验证目标</li>
            <li>每步结束有检查点（测试/接口探测/清单勾选）</li>
            <li>中断后能从检查点续上，而不是从头再生成</li>
            <li>交接时留下：做到哪、产物在哪、阻塞是什么</li>
          </ol>
          <p class="warn-box"><strong>边界：</strong>这里教的是「人如何拆」；系统执行控制框架见 02，不在本篇展开。</p>
""",
        "中断十分钟后，你能否不靠聊天记录续上？"))

    parts.append(section(
        "part-06", "反馈闭环", "Part 06 · 反馈闭环：验收不是终点",
        "06 / 变更好", "失败必须写成下一轮输入里的约束，用法才会越用越稳。",
        "/images/ai-programming-engineering/06-loop-engineering.png",
        """
          <p>验收失败时的默认动作不是「再生成一整份」，而是：</p>
          <ol class="step-list">
            <li>记录失败证据（日志、测试、接口结果）</li>
            <li>归层（说不清 / 依据错 / 步骤 / 闭环）</li>
            <li>把约束写进下一轮契约或证据包</li>
          </ol>
""",
        "最近一次失败有没有变成下一轮约束？"))

    parts.append(section(
        "part-07", "认证实战", "Part 07 · 认证实战：Spec v0.1 → v1.0",
        "07 / 系列唯一完整 Spec", "从模糊需求到可验收 Spec——本系列只在本篇写完整迭代。",
        "/images/ai-programming-engineering/07-case-study.png",
        """
          <table class="comparison-table">
            <tr><th>版本</th><th>问题</th><th>补强</th></tr>
            <tr><td>v0.1</td><td>「做个登录」</td><td>无边界、无验收</td></tr>
            <tr><td>v0.5</td><td>有功能列表</td><td>仍缺登出后 401、错误体、禁止项</td></tr>
            <tr><td>v1.0</td><td>可交付</td><td>Goal + Boundary + Acceptance + Non-goals + 证据清单</td></tr>
          </table>
          <div class="contract-template"><code>【认证 · Spec v1.0 节选】
Goal: 注册/登录/登出；登出后受保护接口返回 401
Boundary: 只改 auth 相关模块；禁止动哈希算法与生产密钥
Acceptance: 单测绿；手动：登出后 GET /me → 401
Non-goals: 本轮不做 OAuth / 多租户
Evidence: session.ts · auth 路由 · 错误体规范</code></div>
""",
        "你的 v1.0 验收句能否一票否决「做完了」？"))

    parts.append(section(
        "part-08", "故障分诊", "Part 08 · 故障分诊台：按层修复",
        "08 / 分诊", "先判断主责层，再修；顺序通常是契约 → 证据 → 工序 → 闭环。",
        "/images/ai-programming-engineering/08-defect-mapping.png",
        """
          <div class="deliverables">
            <div class="deliverable"><strong>1 契约</strong>验收句是否可观测</div>
            <div class="deliverable"><strong>2 证据</strong>是否读对文件/规范</div>
            <div class="deliverable"><strong>3 工序</strong>是否一步一检</div>
            <div class="deliverable"><strong>4 闭环</strong>失败是否写回</div>
          </div>
""",
        "先改 Prompt 还是先补证据？你的默认顺序是什么？"))

    parts.append(section(
        "part-09", "任务关系图", "Part 09 · 任务关系图：看清依赖",
        "09 / 给人看的图", "用图看清步骤依赖与可并行处——不是多 Agent 机制课。",
        "/images/ai-programming-engineering/09-graph-engineering.png",
        """
          <p>把四件事连成一张执行图：哪些步骤串行、哪些可并行、检查点挂在哪条边上。目的是<strong>人</strong>看清任务，不是讲解 Multi-Agent（→ 02）。</p>
""",
        "哪一步可以并行而不破坏验收？"))

    parts.append(section(
        "part-10", "按风险选型", "Part 10 · 按风险选拆法",
        "10 / 人侧选型", "风险越高，拆得越细、验收越硬。",
        "/images/ai-programming-engineering/10-harness-selection.png",
        """
          <table class="comparison-table">
            <tr><th>风险</th><th>做法</th></tr>
            <tr><td>低</td><td>短契约 + 一次生成 + 冒烟</td></tr>
            <tr><td>中</td><td>分步 + 每步测试</td></tr>
            <tr><td>高</td><td>强验收 + 人工门 + 小步 Diff</td></tr>
          </table>
""",
        "当前任务的风险等级是哪一档？"))

    parts.append(section(
        "part-11", "避坑", "Part 11 · 避坑指南：别把 AI 当一次性生成器",
        "11 / 反模式", "乘客心态是个人交付的头号敌人。",
        "/images/ai-programming-engineering/11-anti-patterns.png",
        """
          <ul>
            <li>无验收的「帮我实现」</li>
            <li>整仓塞上下文</li>
            <li>一大步改完再测</li>
            <li>测红了只说「再试一次」却不写回约束</li>
          </ul>
""",
        "你最近一次踩了哪条？"))

    parts.append(section(
        "part-12", "开工清单", "Part 12 · 开工清单：四问四产物",
        "12 / 设计产物", "开干前四问打勾；四产物齐全再呼叫 AI。",
        "/images/ai-programming-engineering/12-checklist.png",
        """
          <div class="deliverables">
            <div class="deliverable"><strong>契约</strong>Goal / Boundary / Acceptance</div>
            <div class="deliverable"><strong>证据包</strong>必读材料列表</div>
            <div class="deliverable"><strong>执行图</strong>步骤与检查点</div>
            <div class="deliverable"><strong>验收记录</strong>通过/失败与回流</div>
          </div>
          <p><strong>四问：</strong>① 要完成什么？② 依据是什么？③ 如何一步一检？④ 失败如何写回？</p>
""",
        "四产物是否齐全再开工？"))

    parts.append("""
          <h2 id="closing" data-toc="结语">结语 · 个人交付收束</h2>
          <span class="section-kicker">结语 / 01 → 02</span>
          <p class="section-summary">带走：开工清单 · Spec 模板 · 分诊顺序。自检：能否独立完成一次可合并增量？</p>
          <div class="note-take"><strong>本笔记带走：</strong>契约 · 证据包 · 可检查工序 · 验收回流。</div>
          <div class="tip-box"><strong>下一层问题：</strong>工具背后为何要这样组织？系统里各层机制补什么缺口？→
            <a href="/2026/08/08/llm-agent-principles/">02 · 系统理解能力 · AI Agent 系统理解</a></div>
          <p><em>Last updated: 2026-08-07 · 五层系列 S1</em></p>
""")
    return "".join(parts)


def body_02() -> str:
    parts = []
    parts.append(f"""
          <h2 id="intro" data-toc="开篇">开篇 · 02 系统理解能力</h2>
          <span class="section-kicker">00 / 系统理解能力 · AI Agent 系统理解</span>
          <p class="note-meta">本篇 = 02 · 系统理解能力 · AI Agent 系统理解 · 案例：认证短例（无完整 Spec）</p>
          <p class="section-summary">思考一句：LLM 是智能内核；Agent 是让智能参与真实任务的运行时系统。</p>
{SERIES_PATH_HTML}
          <div class="callout">
            <strong>本层解决：</strong>理解 Agent 各层机制补什么缺口、边界在哪。<br>
            <strong>本层不做：</strong>Spec 操作课（01）、设计卡与验收四柱（03）、数字员工平台（04）、办公工作台（05）。<br>
            <strong>邻接：</strong>输入来自 01 的交付直觉 → 产出机制地图 → 03 单产品设计。
          </div>
          <img class="chapter-image overview-image" src="/images/llm-agent-principles/00-overview.png" alt="AI Agent 系统理解总览">
          <p>对象模型（本层）：<strong>目标 · 上下文 · 工具 · 计划 · 状态 · 验证 · 治理</strong>。主语是「系统」。</p>
""")

    chapters = [
        ("part-01", "LLM≠Agent", "Part 01 · 起点：为何 LLM 还不等于 Agent", "01 / 缺口",
         "语言能力不够用；真实任务还缺事实、行动、状态、验证。",
         "/images/llm-agent-principles/01-why-not-agent.png",
         """<table class="comparison-table"><tr><th>缺口</th><th>含义</th><th>认证短例</th></tr>
<tr><td>事实</td><td>实时可追溯依据</td><td>不知现网接口真实行为</td></tr>
<tr><td>行动</td><td>受控外部操作</td><td>不能只「建议」改 session</td></tr>
<tr><td>状态</td><td>做到哪、如何恢复</td><td>多步认证中途丢失进度</td></tr>
<tr><td>验证</td><td>如何证明做对</td><td>无法自证登出后 401</td></tr></table>""",
         "四个缺口里，你的方案最先缺哪一个？"),
        ("part-02", "全景闭环", "Part 02 · 全景图：从目标到交付", "02 / 总图",
         "Agent 不是一次生成，而是目标—行动—反馈—改进的持续循环。",
         "/images/llm-agent-principles/02-panorama.png",
         """<ol class="step-list"><li>目标与上下文</li><li>理解与规划</li><li>工具行动</li><li>观察与验证</li><li>经验沉淀（写回规则/评估，不是只留在聊天）</li></ol>
<p>验证失败必须回流，禁止「感觉做完了」就收工。</p>""",
         "验证失败后的默认动作是什么？"),
        ("part-03", "LLM 基础", "Part 03 · LLM：推理核，不是完整系统", "03 / LLM",
         "让 LLM 输出结构化意图/计划/工具参数；不要让它代替事实源。",
         "/images/llm-agent-principles/03-llm-fundamentals.png",
         """<p>边界：上下文有限、知识过时、输出非确定、会幻觉、无持久状态。设计纪律：模型负责「想清楚下一步」；事实与写操作交给工具与策略。</p>""",
         "方案里有没有「以模型陈述代替测试报告」？"),
        ("part-04", "Context", "Part 04 · Context：当前依据包", "04 / Context",
         "系统侧依据包：来源 · 版本 · 有效期 · 权限。不是「你该选哪几个文件」的操作课。",
         "/images/llm-agent-principles/04-context.png",
         """<p><strong>定义：</strong>当前任务的可控依据集合。<strong>边界：</strong>最小充分、可追溯、敏感隔离。<strong>例子：</strong>认证步骤只加载本步契约与 session 相关事实，并标注版本。</p>
<p class="warn-box"><strong>不做：</strong>人如何挑文件塞进 IDE——见 <a href="/2026/08/06/ai-programming-engineering/">01</a>。</p>""",
         "每条上下文能否回答：从哪来、约束什么？"),
        ("part-05", "Tool", "Part 05 · Tool Calling：感知与行动", "05 / Tool",
         "工具是受控接口：描述 · 参数 · 权限 · 返回；重点是可控、可验证、可审计。",
         "/images/llm-agent-principles/05-tool-calling.png",
         """<p>返回四态：成功 / 失败 / 异常 / 可重试。调用前四检：必要、完整、授权、可验证。</p>""",
         "你的工具有没有「无 Schema 的全能 shell」？"),
        ("part-06", "ReAct", "Part 06 · ReAct：推理与行动交织", "06 / ReAct",
         "用观察—推理—行动处理局部不确定；长任务不能只靠 ReAct。",
         "/images/llm-agent-principles/06-react.png",
         """<p>适合排查「登出后仍 200」这类局部问题；整体认证交付需要计划层托底。必须设步数/费用退出条件。</p>""",
         "ReAct 循环有没有硬退出条件？"),
        ("part-07", "Plan", "Part 07 · Plan-and-Execute：长任务先拆计划", "07 / Plan",
         "计划拆依赖；执行保状态；下一步只消费已确认输出。",
         "/images/llm-agent-principles/07-plan-execute.png",
         """<p>步骤契约：输入 · 输出 · 工具 · 完成条件 · 风险 · 恢复点。与 01「人拆待办」不同：这里是<strong>运行时计划对象</strong>。</p>""",
         "下一步是否可能吃到未确认输出？"),
        ("part-08", "Reflection", "Part 08 · Reflection：回证据检查", "08 / Reflection",
         "可靠性来自规则、事实、测试或独立审核，不是「再想一遍」。",
         "/images/llm-agent-principles/08-reflection.png",
         """<p>失败出口：重试 / 重规划 / 补上下文 / 人工。产品验收四柱见 03，本篇只讲机制。</p>""",
         "反思节点有没有外部依据清单？"),
        ("part-09", "Multi-Agent", "Part 09 · Multi-Agent：专业分工机制", "09 / Multi-Agent",
         "先统一 Task ID / 状态版本 / 交接格式，再谈多角色。",
         "/images/llm-agent-principles/09-multi-agent.png",
         """<p>机制课：协调、检索、分析、执行、审核等角色如何通过协议协作。<strong>岗位编制与平台运营见 04，不在此展开。</strong></p>""",
         "多角色是否共享同一任务状态版本？"),
        ("part-10", "Harness", "Part 10 · Harness：执行控制框架", "10 / Harness",
         "状态、Checkpoint、超时重试、幂等回滚、日志交接——让任务可运行、可恢复、可审计。",
         "/images/llm-agent-principles/10-harness.png",
         """<p>与 01「人侧工序」切割：Harness 是系统控制框架，不是「你怎么拆步骤」的清单。</p>""",
         "失败后能否不从头再来、不靠聊天续上？"),
        ("part-11", "Routing", "Part 11 · Dynamic Routing：按任务选路径", "11 / Routing",
         "风险决定控制强度；策略可配置，不要全任务同一自动化路径。",
         "/images/llm-agent-principles/11-routing.png",
         """<p>简单 / 复杂 / 敏感 / 高危 / 降级五类路径。人侧「按风险选拆法」见 01；此处是系统路由器。</p>""",
         "高危写操作是否前置审批路由？"),
        ("part-12", "Evolution", "Part 12 · Self-Evolution：受控演进", "12 / Evolution",
         "经验可沉淀，但必须受评估与权限约束。",
         "/images/llm-agent-principles/12-evolution.png",
         """<p>把失败模式写入规则/评估集；禁止无审计地自动改生产策略。</p>""",
         "演进变更有没有评估门槛？"),
        ("part-13", "治理", "Part 13 · 治理与安全", "13 / Governance",
         "权限、审计、人工闸门：让能力在边界内运行。",
         "/images/llm-agent-principles/13-governance.png",
         """<p>最小权限、操作审计、高风险人工确认。平台侧治理落地见 04；工作台体验侧见 05。</p>""",
         "越权操作能否被审计追到？"),
        ("part-14", "架构整合", "Part 14 · 架构整合：可持续运行的系统", "14 / 整合",
         "各层拼成可运行系统：缺一层，闭环就会在对应位置断开。",
         "/images/llm-agent-principles/14-architecture.png",
         """<p>用总图自检：目标、依据、工具、计划、验证、控制、治理是否都有着落。</p>""",
         "你的架构图上，验证失败回流画到了哪里？"),
    ]
    for c in chapters:
        parts.append(section(*c))

    parts.append(section(
        "part-bridge", "通往 03", "过渡 · 通往 03：机制 → 产品问题",
        "过渡 / 半页对照", "只列产品问题，不给设计步骤与设计卡。",
        "/images/llm-agent-principles/15-practical-design.png",
        """
          <table class="comparison-table">
            <tr><th>机制（本篇）</th><th>产品侧将回答的问题（→ 03）</th></tr>
            <tr><td>目标/上下文</td><td>用户目标与成功标准如何写成产品契约？</td></tr>
            <tr><td>Plan / Tool</td><td>规划与工具能力如何规格化？</td></tr>
            <tr><td>Harness / Reflection</td><td>状态恢复与验证如何对用户可见？</td></tr>
            <tr><td>Governance</td><td>权限与上线闸门如何成为产品约束？</td></tr>
          </table>
          <p class="warn-box"><strong>禁止：</strong>在本篇填写设计卡或验收四柱——那是 03 的产物。</p>
""",
        "对照表里，你的方案哪一格还是空的？"))

    parts.append("""
          <h2 id="closing" data-toc="结语">结语 · 系统理解收束</h2>
          <span class="section-kicker">结语 / 02 → 03</span>
          <p class="section-summary">带走：机制地图 · 失败→缺层对照。自检：给定失败，能否指出缺哪一层机制？</p>
          <div class="note-take"><strong>本笔记带走：</strong>缺口四项 · 闭环五步 · 机制分层 · 通往 03 的问题清单。</div>
          <div class="tip-box"><strong>下一层问题：</strong>如何把机制封成可验收的<strong>单个</strong> Agent 产品？→
            <a href="/2026/08/07/ai-agent-engineering/">03 · 单产品设计能力 · AI Agent 单产品设计</a></div>
          <p>上一层：<a href="/2026/08/06/ai-programming-engineering/">01 · 个人交付能力 · AI 编程个人交付</a></p>
          <p><em>Last updated: 2026-08-07 · 五层系列 S2</em></p>
""")
    return "".join(parts)


def body_03() -> str:
    parts = []
    parts.append(f"""
          <h2 id="intro" data-toc="开篇">开篇 · 03 单产品设计能力</h2>
          <span class="section-kicker">00 / 单产品设计能力 · AI Agent 单产品设计</span>
          <p class="note-meta">本篇 = 03 · 单产品设计能力 · AI Agent 单产品设计 · 案例：认证设计卡（无 Spec 全文）</p>
          <p class="section-summary">思考一句：设计终点是用户目标交付完成，不是回答完成。</p>
{SERIES_PATH_HTML}
          <div class="callout">
            <strong>本层解决：</strong>设计并验收<strong>一个</strong>可服务用户的 Agent 产品。<br>
            <strong>本层不做：</strong>用法操作（01）、机制科普（02）、数字员工平台（04）、办公工作台（05）。<br>
            <strong>邻接：</strong>输入 01+02 → 产出设计卡与验收 → 04 平台设计。
          </div>
          <img class="chapter-image overview-image" src="/images/ai-agent-engineering/00-overview.png" alt="AI Agent 单产品设计总览">
          <p>对象模型（本层）：<strong>用户 · 目标 · 能力模块 · 边界 · 验收</strong>。主语是「单个 Agent 产品」。</p>
""")

    parts.append(section(
        "part-01", "产品问题", "Part 01 · 产品问题：为谁完成什么",
        "01 / 问题定义", "先钉用户、场景、成功标准与非目标——不是「什么是 Agent」科普。",
        "/images/ai-agent-engineering/01-know-agent.png",
        """
          <ul>
            <li>用户是谁？在什么场景触发？</li>
            <li>完成态长什么样？（可观测）</li>
            <li>明确非目标，防止范围膨胀</li>
          </ul>
          <p>认证例：用户要「安全完成登录会话」；非目标：本产品不做多租户 SSO。</p>
""",
        "成功标准能否被外部观察，而不是「感觉好用」？"))

    parts.append(section(
        "part-02", "机制对照", "Part 02 · 机制 → 能力对照（一页）",
        "02 / 引用 02", "只放对照，不解释机制。机制定义见 02。",
        "/images/ai-agent-engineering/02-work-model.png",
        """
          <table class="comparison-table">
            <tr><th>02 机制</th><th>03 产品能力</th></tr>
            <tr><td>目标/上下文</td><td>目标理解</td></tr>
            <tr><td>Plan</td><td>任务规划</td></tr>
            <tr><td>Tool</td><td>工具调用</td></tr>
            <tr><td>Context/Memory</td><td>上下文与记忆</td></tr>
            <tr><td>Harness 状态</td><td>状态与恢复</td></tr>
            <tr><td>Reflection/验证</td><td>验证与反馈</td></tr>
          </table>
""",
        "六项能力是否都能在对照表里找到机制来源？"))

    parts.append(section(
        "part-03", "能力地图", "Part 03 · 能力地图（产品视角）",
        "03 / 总图", "六项能力是产品模块：可规格、可组合、可验收。",
        "/images/ai-agent-engineering/03-capability-map.png",
        """
          <div class="principles" style="grid-template-columns:repeat(3,1fr)">
            <div class="principle"><strong>目标理解</strong></div>
            <div class="principle"><strong>任务规划</strong></div>
            <div class="principle"><strong>工具调用</strong></div>
            <div class="principle"><strong>上下文与记忆</strong></div>
            <div class="principle"><strong>状态与恢复</strong></div>
            <div class="principle"><strong>验证与反馈</strong></div>
          </div>
""",
        "本产品最少需要组合哪几项？"))

    caps = [
        ("part-04", "目标理解", "Part 04 · 能力规格：目标理解", "04 / 规格",
         "/images/ai-agent-engineering/04-goal-understanding.png",
         "输入：用户意图与场景；输出：目标契约字段；失败态：歧义未消除则停；验收点：成功标准可观测。"),
        ("part-05", "任务规划", "Part 05 · 能力规格：任务规划", "05 / 规格",
         "/images/ai-agent-engineering/05-task-planning.png",
         "输入：已确认目标；输出：可验证步骤与依赖；失败态：依赖不清则重规划；验收点：每步有完成条件。（不讲 Plan 原理）"),
        ("part-06", "工具调用", "Part 06 · 能力规格：工具调用", "06 / 规格",
         "/images/ai-agent-engineering/06-tool-calling.png",
         "输入：步骤与权限集；输出：受控调用与结果；失败态：越权/失败对用户可见；验收点：关键写操作可审计。"),
        ("part-07", "上下文记忆", "Part 07 · 能力规格：上下文与记忆", "07 / 规格",
         "/images/ai-agent-engineering/07-context-memory.png",
         "输入：任务所需事实；输出：当前依据与必要记忆；失败态：过期/越权数据不得进入；验收点：来源可追溯。（不讲 Context 机制课）"),
        ("part-08", "状态恢复", "Part 08 · 能力规格：状态与恢复", "08 / 规格",
         "/images/ai-agent-engineering/08-state-recovery.png",
         "输入：执行进度；输出：可暂停/恢复/交接的状态；失败态：不可恢复须明确告知；验收点：中断后可续。"),
        ("part-09", "验证反馈", "Part 09 · 能力规格：验证与反馈", "09 / 规格",
         "/images/ai-agent-engineering/09-verify-feedback.png",
         "输入：产物与证据；输出：通过/不通过与回流；失败态：不得在证据不足时宣称完成；验收点：用户能看见未通过原因。"),
    ]
    for hid, toc, title, kicker, img, text in caps:
        parts.append(section(
            hid, toc, title, kicker,
            "产品规格语言：输入 / 输出 / 失败态 / 验收点。",
            img,
            f"<div class=\"content-block\"><p>{text}</p></div>",
            "四段规格是否写全？"))

    parts.append(section(
        "part-10", "设计卡", "Part 10 · 设计流程 + 一页设计卡",
        "10 / 设计产物", "把能力组合成可执行、可检查、可恢复的产品方案。",
        "/images/ai-agent-engineering/10-agent-design.png",
        """
          <ol class="step-list">
            <li>钉产品问题（用户/目标/非目标）</li>
            <li>勾选能力组合</li>
            <li>写清权限与失败可见性</li>
            <li>定义验证与上线闸门</li>
          </ol>
          <div class="contract-template"><code>【设计卡 · 认证 Agent 产品】
用户/场景: 终端用户登录
目标: 安全完成注册/登录/登出会话
非目标: 不做 OAuth / 多租户
成功标准: 登出后受保护接口 401；关键路径可审计
能力组合: 目标理解 · 规划 · 工具 · 验证（本轮）
工具与权限: 限 auth 模块读写；禁生产密钥
失败时用户看到: 明确错误码与下一步
验证: 单测 + 接口探测
上线闸门: 安全清单通过</code></div>
""",
        "设计卡九项是否都能填实，而不是形容词？"))

    parts.append(section(
        "part-11", "验收四柱", "Part 11 · 验收四柱 + 交付物",
        "11 / 验收", "验收对象是工程成果，不是一句回答。",
        "/images/ai-agent-engineering/11-agent-acceptance.png",
        """
          <div class="deliverables">
            <div class="deliverable"><strong>正确</strong>满足成功标准</div>
            <div class="deliverable"><strong>完整</strong>范围与非目标一致</div>
            <div class="deliverable"><strong>可恢复</strong>失败可续可交接</div>
            <div class="deliverable"><strong>可解释</strong>关键决策有依据</div>
          </div>
          <p>交付物建议：设计卡 · 能力规格摘要 · 权限表 · 验证记录 · 上线闸门结论。</p>
          <p class="tip-box"><strong>切割：</strong>01 验的是「代码增量」；本篇验的是「产品是否完成用户目标」。员工绩效考核见 04，工作台可观测见 05。</p>
""",
        "四柱里哪一柱现在最弱？"))

    parts.append("""
          <h2 id="closing" data-toc="结语">结语 · 单产品设计收束</h2>
          <span class="section-kicker">结语 / 03 → 04</span>
          <p class="section-summary">带走：设计卡 · 验收四柱。自检：能否独立完成一张 Agent 设计卡并通过四柱？</p>
          <div class="note-take"><strong>本笔记带走：</strong>产品问题 · 六项规格 · 设计卡 · 验收四柱。</div>
          <div class="tip-box"><strong>下一层问题：</strong>多个合格 Agent 如何编成可运营体系？→
            <strong>04 · 平台设计能力 · 数字员工平台设计</strong>（即将发布）<br>
            再往后：人在办公场景如何与员工共作？→ <strong>05 · 场景工作台设计能力 · AI 办公工作台设计</strong>（即将发布）</div>
          <p>上一层：<a href="/2026/08/08/llm-agent-principles/">02 · 系统理解</a> ·
            <a href="/2026/08/06/ai-programming-engineering/">01 · 个人交付</a></p>
          <p><em>Last updated: 2026-08-07 · 五层系列 S3</em></p>
""")
    return "".join(parts)


def write_articles() -> None:
    arts = [
        {
            "path": ROOT / "2026/08/06/ai-programming-engineering/index.html",
            "meta": {
                "title": "01 · 个人交付能力 · AI 编程个人交付",
                "desc": "五层系列 01：个人交付能力。学会使用 AI 编程，组织契约、证据、工序与验收，交付可合并增量。",
                "url": "/2026/08/06/ai-programming-engineering/",
                "published": "2026-08-06T00:00:00.000Z",
                "date": "2026-08-06",
                "tags": "学习笔记 · 01 个人交付 · AI 编程",
            },
            "body": body_01(),
            "prev": '<a href="/categories/ai-agent/" class="chapter-prev">← 五层路径总览</a>',
            "next": '<a href="/2026/08/08/llm-agent-principles/" class="chapter-next">02 · 系统理解 →</a>',
        },
        {
            "path": ROOT / "2026/08/08/llm-agent-principles/index.html",
            "meta": {
                "title": "02 · 系统理解能力 · AI Agent 系统理解",
                "desc": "五层系列 02：系统理解能力。掌握 AI Agent 原理与机制边界，建立从目标到交付的运行时心智模型。",
                "url": "/2026/08/08/llm-agent-principles/",
                "published": "2026-08-08T00:00:00.000Z",
                "date": "2026-08-08",
                "tags": "学习笔记 · 02 系统理解 · Agent 原理",
            },
            "body": body_02(),
            "prev": '<a href="/2026/08/06/ai-programming-engineering/" class="chapter-prev">← 01 · 个人交付</a>',
            "next": '<a href="/2026/08/07/ai-agent-engineering/" class="chapter-next">03 · 单产品设计 →</a>',
        },
        {
            "path": ROOT / "2026/08/07/ai-agent-engineering/index.html",
            "meta": {
                "title": "03 · 单产品设计能力 · AI Agent 单产品设计",
                "desc": "五层系列 03：单产品设计能力。设计并验收一个可服务用户的 AI Agent 产品（设计卡与验收四柱）。",
                "url": "/2026/08/07/ai-agent-engineering/",
                "published": "2026-08-07T00:00:00.000Z",
                "date": "2026-08-07",
                "tags": "学习笔记 · 03 单产品设计 · Agent 产品",
            },
            "body": body_03(),
            "prev": '<a href="/2026/08/08/llm-agent-principles/" class="chapter-prev">← 02 · 系统理解</a>',
            "next": '<a href="/categories/ai-agent/" class="chapter-next">04/05 占位 · 分类页 →</a>',
        },
    ]
    for a in arts:
        html = shell(a["meta"], a["body"], a["prev"], a["next"])
        a["path"].parent.mkdir(parents=True, exist_ok=True)
        a["path"].write_text(html, encoding="utf-8")
        print("wrote", a["path"], "bytes", a["path"].stat().st_size)


def write_category() -> None:
    path = ROOT / "categories/ai-agent/index.html"
    html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2">
  <meta name="theme-color" content="#0f172a">
  <meta name="generator" content="Hexo 5.4.0">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon-next.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32-next.png">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/lib/font-awesome/css/all.min.css">
  <link rel="stylesheet" href="/css/category.css?v=1">
  <meta name="description" content="AI Agent 五层路径：个人交付 → 系统理解 → 单产品设计 → 平台设计 → 场景工作台设计。">
  <meta property="og:type" content="website">
  <meta property="og:title" content="AI Agent | LianJiFu'blogs">
  <meta property="og:url" content="http://lianjifu.cn/categories/ai-agent/">
  <meta property="og:site_name" content="LianJiFu'blogs">
  <meta property="og:description" content="个人交付 → 系统理解 → 单产品设计 → 平台设计 → 场景工作台设计">
  <link rel="canonical" href="http://lianjifu.cn/categories/ai-agent/">
  <title>AI Agent | LianJiFu'blogs</title>
  <style>
    .cat-soon { opacity: .72; }
    .cat-badge { display:inline-block; margin-left:.5rem; padding:.1rem .45rem; border-radius:999px; background:#e2e8f0; color:#475569; font-size:.72rem; font-weight:700; vertical-align:middle; }
    .cat-badge--live { background:#dbeafe; color:#1d4ed8; }
    .cat-badge--soon { background:#f1f5f9; color:#64748b; }
  </style>
</head>
<body class="page-category">
  <div class="container use-motion">
    <div class="headband"></div>
    <header class="header">
      <div class="header-inner"><div class="site-brand-container">
        <div class="site-meta"><a href="/" class="brand"><h1 class="site-title">LianJiFu'blogs</h1></a></div>
        <nav class="site-nav"><ul id="menu" class="main-menu menu">
          <li class="menu-item"><a href="/"><i class="fa fa-home fa-fw"></i>首页</a></li>
          <li class="menu-item"><a href="/about/"><i class="fa fa-user fa-fw"></i>关于</a></li>
          <li class="menu-item"><a href="/archives/"><i class="fa fa-archive fa-fw"></i>归档</a></li>
          <li class="menu-item"><a href="/categories/"><i class="fa fa-th-large fa-fw"></i>分类</a></li>
        </ul></nav>
      </div></div>
    </header>
    <main class="main"><div class="main-inner"><div class="content-wrap"><div class="content category">
      <div class="post-block"><div class="posts-collapse"><div class="cat-page">
        <div class="cat-hero cat-hero--agent">
          <div class="cat-hero-inner">
            <div class="cat-hero-kicker"><span class="cat-hero-kicker-dot"></span>CATEGORY</div>
            <h1 class="cat-hero-title">AI Agent 五层路径</h1>
            <p class="cat-hero-desc">个人交付 → 系统理解 → 单产品设计 → 平台设计 → 场景工作台设计</p>
            <div class="cat-hero-stats" style="grid-template-columns:repeat(3,minmax(0,1fr))">
              <div class="cat-hero-stat"><strong>5</strong><span>能力层</span></div>
              <div class="cat-hero-stat"><strong>3</strong><span>已发布</span></div>
              <div class="cat-hero-stat"><strong>2</strong><span>即将</span></div>
            </div>
          </div>
        </div>

        <div class="cat-section">
          <div class="cat-section-label cat-section-label--agent"><i class="fa fa-terminal"></i> 01 · 个人交付能力</div>
          <div class="cat-card cat-card--part-agent">
            <div class="cat-card-header cat-card-header--agent">
              <div class="cat-card-icon"><i class="fa fa-code"></i></div>
              <div class="cat-card-info">
                <div class="cat-card-title">AI 编程个人交付 <span class="cat-badge cat-badge--live">已发布</span></div>
                <div class="cat-card-desc">用好 AI 编程：契约 · 证据 · 工序 · 验收，交付可合并增量。</div>
              </div>
            </div>
            <div>
              <a class="cat-item" href="/2026/08/06/ai-programming-engineering/">
                <span class="cat-num">01</span>
                <span class="cat-name">01 · 个人交付能力 · AI 编程个人交付</span>
                <span class="cat-arrow"><i class="fa fa-arrow-right"></i></span>
              </a>
            </div>
          </div>
        </div>

        <div class="cat-section">
          <div class="cat-section-label cat-section-label--agent"><i class="fa fa-sitemap"></i> 02 · 系统理解能力</div>
          <div class="cat-card cat-card--part-agent">
            <div class="cat-card-header cat-card-header--agent">
              <div class="cat-card-icon"><i class="fa fa-brain"></i></div>
              <div class="cat-card-info">
                <div class="cat-card-title">AI Agent 系统理解 <span class="cat-badge cat-badge--live">已发布</span></div>
                <div class="cat-card-desc">掌握 Agent 运行原理与机制边界，建立目标到交付的心智模型。</div>
              </div>
            </div>
            <div>
              <a class="cat-item" href="/2026/08/08/llm-agent-principles/">
                <span class="cat-num">02</span>
                <span class="cat-name">02 · 系统理解能力 · AI Agent 系统理解</span>
                <span class="cat-arrow"><i class="fa fa-arrow-right"></i></span>
              </a>
            </div>
          </div>
        </div>

        <div class="cat-section">
          <div class="cat-section-label cat-section-label--agent"><i class="fa fa-cube"></i> 03 · 单产品设计能力</div>
          <div class="cat-card cat-card--part-agent">
            <div class="cat-card-header cat-card-header--agent">
              <div class="cat-card-icon"><i class="fa fa-project-diagram"></i></div>
              <div class="cat-card-info">
                <div class="cat-card-title">AI Agent 单产品设计 <span class="cat-badge cat-badge--live">已发布</span></div>
                <div class="cat-card-desc">设计并验收一个可服务用户的 Agent：设计卡与验收四柱。</div>
              </div>
            </div>
            <div>
              <a class="cat-item" href="/2026/08/07/ai-agent-engineering/">
                <span class="cat-num">03</span>
                <span class="cat-name">03 · 单产品设计能力 · AI Agent 单产品设计</span>
                <span class="cat-arrow"><i class="fa fa-arrow-right"></i></span>
              </a>
            </div>
          </div>
        </div>

        <div class="cat-section cat-soon">
          <div class="cat-section-label cat-section-label--agent"><i class="fa fa-users"></i> 04 · 平台设计能力</div>
          <div class="cat-card cat-card--part-agent">
            <div class="cat-card-header cat-card-header--agent">
              <div class="cat-card-icon"><i class="fa fa-building"></i></div>
              <div class="cat-card-info">
                <div class="cat-card-title">数字员工平台设计 <span class="cat-badge cat-badge--soon">即将</span></div>
                <div class="cat-card-desc">把多个 Agent 编成可运营的数字员工平台（岗 · 权 · 编 · 运）。</div>
              </div>
            </div>
            <div>
              <span class="cat-item" style="cursor:default;opacity:.85">
                <span class="cat-num">04</span>
                <span class="cat-name">04 · 平台设计能力 · 数字员工平台设计</span>
                <span class="cat-arrow"><i class="fa fa-clock"></i></span>
              </span>
            </div>
          </div>
        </div>

        <div class="cat-section cat-soon">
          <div class="cat-section-label cat-section-label--agent"><i class="fa fa-desktop"></i> 05 · 场景工作台设计能力</div>
          <div class="cat-card cat-card--part-agent">
            <div class="cat-card-header cat-card-header--agent">
              <div class="cat-card-icon"><i class="fa fa-th-large"></i></div>
              <div class="cat-card-info">
                <div class="cat-card-title">AI 办公工作台设计 <span class="cat-badge cat-badge--soon">即将</span></div>
                <div class="cat-card-desc">为人与数字员工设计办公共作工作台（场景 · 共作面 · 连接器）。</div>
              </div>
            </div>
            <div>
              <span class="cat-item" style="cursor:default;opacity:.85">
                <span class="cat-num">05</span>
                <span class="cat-name">05 · 场景工作台设计能力 · AI 办公工作台设计</span>
                <span class="cat-arrow"><i class="fa fa-clock"></i></span>
              </span>
            </div>
          </div>
        </div>

      </div></div></div>
    </div></div></div></main>
    <footer class="footer"><div class="footer-inner"><div class="copyright">© 2026 LianJiFu'blogs</div></div></footer>
  </div>
</body>
</html>
"""
    path.write_text(html, encoding="utf-8")
    print("wrote", path)


def patch_archives() -> None:
    path = ROOT / "archives/index.html"
    text = path.read_text(encoding="utf-8")
    old = re.search(
        r'<section class="archive-series-section archive-series-section--agent" id="series-engineering".*?</section>',
        text,
        re.S,
    )
    if not old:
        raise SystemExit("archives series-engineering block not found")
    new = """<section class="archive-series-section archive-series-section--agent" id="series-engineering" aria-label="AI Agent 五层路径">
    <div class="archive-series-label archive-series-label--agent"><i class="fa fa-robot"></i> AI Agent · 五层路径</div>
    <div class="archive-card archive-card--part-foundation"><div class="archive-card-header">
      <span class="archive-card-icon"><i class="fa fa-layer-group"></i></span>
      <div class="archive-card-info">
        <div class="archive-card-title">
          <span>五层能力路径</span>
          <span class="archive-card-sub">Personal → Runtime → Unit → Platform → Workbench</span>
        </div>
        <div class="archive-card-desc">个人交付 → 系统理解 → 单产品设计 → 平台设计 → 场景工作台设计</div>
      </div>
    </div><a href="/2026/08/06/ai-programming-engineering/" class="archive-item">
      <span class="archive-num">01</span>
      <span class="archive-name">个人交付能力 · AI 编程个人交付</span>
      <span class="archive-arrow"><i class="fa fa-arrow-right"></i></span>
    </a><a href="/2026/08/08/llm-agent-principles/" class="archive-item">
      <span class="archive-num">02</span>
      <span class="archive-name">系统理解能力 · AI Agent 系统理解</span>
      <span class="archive-arrow"><i class="fa fa-arrow-right"></i></span>
    </a><a href="/2026/08/07/ai-agent-engineering/" class="archive-item">
      <span class="archive-num">03</span>
      <span class="archive-name">单产品设计能力 · AI Agent 单产品设计</span>
      <span class="archive-arrow"><i class="fa fa-arrow-right"></i></span>
    </a><div class="archive-item" style="opacity:.7;cursor:default">
      <span class="archive-num">04</span>
      <span class="archive-name">平台设计能力 · 数字员工平台设计（即将）</span>
      <span class="archive-arrow"><i class="fa fa-clock"></i></span>
    </div><div class="archive-item" style="opacity:.7;cursor:default">
      <span class="archive-num">05</span>
      <span class="archive-name">场景工作台设计能力 · AI 办公工作台设计（即将）</span>
      <span class="archive-arrow"><i class="fa fa-clock"></i></span>
    </div></div>
  </section>"""
    path.write_text(text[: old.start()] + new + text[old.end() :], encoding="utf-8")
    print("patched archives")


def upsert_search() -> None:
    path = ROOT / "search.xml"
    text = path.read_text(encoding="utf-8")
    entries = {
        "/2026/08/06/ai-programming-engineering/": (
            "01 · 个人交付能力 · AI 编程个人交付",
            "五层系列 01 个人交付能力。学会使用 AI 编程：契约、证据包、可检查工序、反馈闭环、开工清单。不讲原理与产品设计。",
        ),
        "/2026/08/08/llm-agent-principles/": (
            "02 · 系统理解能力 · AI Agent 系统理解",
            "五层系列 02 系统理解能力。LLM≠Agent、Context、Tool、ReAct、Plan、Reflection、Multi-Agent、Harness、Routing、治理与架构整合。通往 03 对照表。",
        ),
        "/2026/08/07/ai-agent-engineering/": (
            "03 · 单产品设计能力 · AI Agent 单产品设计",
            "五层系列 03 单产品设计能力。产品问题、六项能力规格、设计卡、验收四柱。不讲平台与工作台。",
        ),
    }

    def entry_xml(url: str, title: str, content: str) -> str:
        return (
            f"  <entry>\n"
            f"    <title>{title}</title>\n"
            f"    <url>{url}</url>\n"
            f"    <content><![CDATA[{content}]]></content>\n"
            f"    <categories><category>AI Agent</category></categories>\n"
            f"    <tags><tag>ai-agent</tag><tag>learning-notes</tag></tags>\n"
            f"  </entry>\n"
        )

    for url, (title, content) in entries.items():
        pat = re.compile(
            rf"  <entry>\s*<title>.*?</title>\s*<url>{re.escape(url)}</url>.*?</entry>\n?",
            re.S,
        )
        block = entry_xml(url, title, content)
        if pat.search(text):
            text = pat.sub(block, text, count=1)
            print("updated search", url)
        else:
            text = text.replace("</search>", block + "</search>")
            print("inserted search", url)

    # remove obsolete titles if duplicated oddly — leave as is
    path.write_text(text, encoding="utf-8")


def main() -> None:
    write_articles()
    write_category()
    patch_archives()
    upsert_search()
    print("S0–S4 content generation done")


if __name__ == "__main__":
    main()
