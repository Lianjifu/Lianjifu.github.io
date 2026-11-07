# OpenClaw 源码笔记 · 十篇模块系列

> 状态：持续维护 · 模块 01–10 全部已发布
> 阅读顺序固定：先建立心智模型，再拆运行机制，最后看上线之后的代价与失败。

## 系列定位

本系列记录 OpenClaw v2026.9.2 的源码结构。它不是使用手册，也不是产品评价，而是「读一遍源码，看清一次委托如何落地」的工程笔记：每个模块回答一个具体问题，答案必须能在源码里找到落点。

源文位于独立仓库 `/Users/LIANJIFU/ops/openclaw-docs-site`，本仓库只保存迁移后的静态产物。

## 模块顺序与正式名

| 编号 | 分组 | 正式名 | URL |
|------|------|--------|-----|
| 01 | 建立心智模型 | 第 1 章：OpenClaw 是什么 — 概览与心智模型 | `/2026/11/07/openclaw-01-overview/` |
| 02 | 建立心智模型 | 第 2 章：核心架构与三原则落地 | `/2026/11/07/openclaw-02-architecture/` |
| 03 | 运行机制 | 第 3 章：消息通道与适配器协议 | `/2026/11/07/openclaw-03-channels/` |
| 04 | 运行机制 | 第 4 章：LLM Provider 与 Runtime 适配 | `/2026/11/07/openclaw-04-models-runtimes/` |
| 05 | 运行机制 | 第 5 章：会话生命周期与状态管理 | `/2026/11/07/openclaw-05-sessions/` |
| 06 | 运行机制 | 第 6 章：工具执行与钩子拦截 | `/2026/11/07/openclaw-06-tools-hooks/` |
| 07 | 上线之后 | 第 7 章：端到端消息流程 | `/2026/11/07/openclaw-07-end-to-end/` |
| 08 | 上线之后 | 第 8 章：性能基线与延迟分析 | `/2026/11/07/openclaw-08-performance/` |
| 09 | 上线之后 | 第 9 章：错误处理与降级策略 | `/2026/11/07/openclaw-09-error-handling/` |
| 10 | 上线之后 | 第 10 章：源码导览与目录树 | `/2026/11/07/openclaw-10-source-walkthrough/` |

## 硬规则

1. 模块顺序不可打乱；后篇只引用前篇结论，不重讲定义。
2. 机制专名只在对应模块首次出现：Envelope 协议仅 03、Provider / Runtime 抽象仅 04、会话三层存储仅 05、钩子链仅 06。
3. 性能数据仅 08 给出基线，其他模块不重复贴数字。
4. 异常矩阵仅 09 汇总，其他模块只描述本模块的失败点。
5. 目录树与路径引用仅 10 完整给出，其他模块按需引用局部路径。
6. 每篇必须给出源码落点（路径或符号名），没有落点的结论不写。

## 标题格式

`第 N 章：〔正式名〕`

正文页 `<h1 class="post-title">` 用不带编号前缀的正式名，编号只出现在 `<title>`、面包屑分类与「第 N 章 · 〔标签〕」的 kicker 中。

## 章节骨架

每篇按 Claude Code 系列的章节形状组织，读者进入正文前先拿到框架：

```
导语段（.oc-lead）
引导思考表（table.guide-card.collapsed，四行：它为什么存在 / 它解决什么问题 /
          它在系统中的位置 / 它如何工作）
h2 编号小节
  本章要点（.oc-keypoint）
  思考笔记（.thinking-note）
  图示（figure + mermaid + figcaption）
  数据表、代码块、列表
```

- 标题编号：h2 写 `章.节`（如 `2.4`），h3 写 `章.节.条`（如 `2.4.1`），与 Claude Code 的 `1.1` 同一套口径；正文里的交叉引用同步写成新编号。
- h4 层级太深，不带编号；指向 h4 的引用连编号一起去掉，只留标题。
- 「引导思考」表逐篇手写，内容必须来自该章正文，不得跨章搬用。

## 结尾小节

每篇最后一节固定为「总结」，结构只有两小节：

```
h2  章.节 总结
  h3  章.节.1 一句话总结    —— thinking-note，给出本章的落点与边界
  h3  章.节.2 相关阅读      —— 指向系列内其它篇目的锚点
```

原来的「阅读路径 + FAQ + 总结」三段式（阅读路径 / 常见问题 / 一句话总结 / 相关阅读）已去掉前两段：阅读路径按读者类型分叉，与正文目录重复；FAQ 的内容多在正文对应小节已经讲过。删掉后只留结论和横向链接，结尾小节从四小节收成两小节。

## 正文词汇

正文只用博客自己的词汇，不带源站的设计系统：

| 用途 | 写法 |
| --- | --- |
| 导语 | `<p class="oc-lead">` |
| 本章要点 | `<div class="oc-keypoint">` + `<h3>` |
| 思考笔记 | `<div class="thinking-note">` + `<h3>`（样式来自 `css/2026.css`） |
| 引导思考表 | `<table class="guide-card collapsed">`（样式来自 `css/2026.css`） |
| 卡片组 | `<div class="oc-cards">` + `<div class="oc-card">` |
| 步骤 | `<div class="oc-step">` + `<p class="oc-step-num">` |
| 带标题小节 | `<div class="oc-sub">` + `<p class="oc-sub-title">` |
| 指标行 | `<p class="oc-metric">` |
| 标签 | `<span class="oc-chip">` |
| 数据表 | 普通 `<table>`，不加私有类 |
| 代码块 | 普通 `<pre>`，源码内的高亮用 `.key` / `.str` / `.comment` 等内联类 |

## 图示规则

本系列共有 155 张 Mermaid 图示，全部带题注（`图 X.Y · 说明`），题注随正文一并维护。

- 图示写 `<figure><div class="mermaid">…</div><figcaption>…</figcaption></figure>`，不要用 `<pre class="mermaid">`。
- **图示源码是文本，不是标记**：节点标签里的 `<br/>`、`<b>` 必须转义成 `&lt;br/&gt;`、`&lt;b&gt;` 再写进页面。直接写尖括号，浏览器会把它当元素吃掉，渲染器读到的源码里换行和加粗就没了——标签会连成一长串。
- Mermaid 源码是语法，不是中文散文：源码里的 `:` `,` `(` `)` 保持半角，不要做全角标点转换。
- 图示宽度按栏目宽定：缩到一半以上就等比缩到栏宽，能一眼看全；再宽的保持自然尺寸，容器横向滚动，并给出「图比正文宽」的提示。
- 宽图的滚动条常驻可见，鼠标竖向滚轮悬停在图上会转为横向平移；点击图示放大后，弹窗按自然尺寸显示，同样可横向滚动。
- 图内文字不能被裁切；若 `foreignObject` 装不下文字，先改图，不靠 CSS 缩放补救。
- Mermaid 运行时（554 KB）按需加载：图示接近视口时才下载并绘制，图示源码始终留在 HTML 里。未渲染时显示占位框，不显示源码。

## 页面样式

- 页面加载 `css/2026.css`（引导思考表、思考笔记、Mermaid 层）、`css/portal.css`、`css/article.css`、`css/openclaw.css`，顺序与其它文章页一致。
- 专用样式：`css/openclaw.css` 只承载本系列特有的部分（导语、卡片、步骤、指标行、代码高亮），正文排版交给 `css/article.css`。
- 正文容器类名 `.openclaw-body`，规则以 `body.personal-article .openclaw-body` 为前缀，避免与 `body.personal-article .post-body` 的规则冲突。
- 页面壳与 Claude Code 系列一致：`post-body` / `article-toc-aside` / `reading-toc` / `article-pager` / `article-series-return`。

## 目录与正文基准

- 目录收录全部 h2 与 h3，链接数量必须与 `docs/article-manifest.json` 中该篇的 `headings` 计数一致；h4 与其它未收录的标题标 `data-toc-skip`。
- 改完正文后运行 `node scripts/update-manifest.cjs --write` 更新基准，再跑 `node scripts/verify-articles.cjs`。
