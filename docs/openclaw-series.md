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

## 图示规则

本系列共有 155 张 Mermaid 图示，全部带题注（`图 X.Y · 说明`），题注随正文一并维护。

- 图示写 `<figure><div class="mermaid">…</div><figcaption>…</figcaption></figure>`，不要用 `<pre class="mermaid">`。
- Mermaid 源码是语法，不是中文散文：源码里的 `:` `,` `(` `)` 保持半角，不要做全角标点转换。
- 图示按自然宽度绘制：`js/article-diagrams.js` 对 `data-series="openclaw"` 的页面读取 viewBox 宽高，宽图不压缩，容器横向滚动；缩放比低于 0.68 时保持原尺寸并给出「可横向滚动」提示。
- 图内文字不能被裁切；若 `foreignObject` 装不下文字，先改图，不靠 CSS 缩放补救。

## 页面样式

- 专用样式：`css/openclaw.css`，正文容器类名 `.openclaw-body`，全部规则以 `body.personal-article .openclaw-body` 为前缀，避免与 `css/article.css` 的 `body.personal-article .post-body` 规则冲突。
- 加载顺序：`portal.css` → `article.css` → `openclaw.css`，专题样式必须最后加载。
- 页面壳与 Claude Code 系列一致：`post-body` / `article-toc-aside` / `reading-toc` / `article-pager` / `article-series-return`。

## 目录与正文基准

- 每篇的目录是人工精选的，链接数量必须与 `docs/article-manifest.json` 中该篇的 `headings` 计数一致；未被目录收录的 h3/h4 标 `data-toc-skip`。
- 改完正文后运行 `node scripts/update-manifest.cjs --write` 更新基准，再跑 `node scripts/verify-articles.cjs`。
