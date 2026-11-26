# AI Agent 系统设计 · 系列文档

> 状态：持续维护 · 已发布 11 篇（01 问数、02 问答、03 客服、04 营销、05 电商、06 文旅、07 运维、08 安全运营、09 合同审查、10 办公写作、11 供应链）
> 专题页：`/categories/agent-design/`

## 系列定位

本系列拆解十一类 AI Agent 场景的**系统设计**：问数、问答、客服、营销、电商、文旅、系统运维、安全运营、合同审查、办公写作、供应链。

它回答的不是「Agent 能做什么」，而是「**这一类 Agent 怎么设计成一条能上线的链路**」：核心矛盾是什么、方法论落在哪几层、护栏放在执行层的哪一环、容量与成本怎么算、出了事怎么降级。

与站内其它专题的关系：

| 专题 | 角度 |
| --- | --- |
| AI 编程工程实践（5 篇） | 怎么把一次交付做成可复用的能力——方法论与平台 |
| **AI Agent 系统设计（本系列）** | **某一类 Agent 的系统怎么设计——分领域拆到护栏与容量** |
| Claude Code 源码笔记（28 篇） | 一个真实 Agent 框架的源码结构与运行机制 |
| OpenClaw 源码笔记（10 篇） | 一个个人 AI 网关的完整链路 |
| 智能安全运营 / 智能系统运维可观测性 | 对应领域的平台能力怎么建（感知、研判、执行） |

> 同一个领域会同时出现在两处：可观测性两个专题讲**平台能力怎么建**，本系列讲**Agent 系统怎么设计**。两者角度不同，互相引用。

## 章节骨架

每篇按同一套六节骨架组织，并按全站口径重排为「总—分—总」的段 / 小节两层：

```
导语段（.oc-lead）
引导思考表（table.guide-card.collapsed，四行：它为什么存在 / 它解决什么问题 /
          它在系统中的位置 / 它如何工作）
本章全景（.oc-keypoint + .oc-overview 表 + .oc-cards 路线图）—— 总
h2 章.段 段标题（seg-N）
  段标（.oc-part-lead，说明这一段回答什么）
  h3 章.段.节 小节（sec-N.K）
    本章要点（.oc-keypoint）
    思考笔记（.thinking-note，每个小节恰好一个）
    h4 子小节（sec-N.K.M，标题不带编号）
    图示、数据表、代码块、列表
h2 章.段 总结
  h3 章.段.1 一句话总结（thinking-note）
  h3 章.段.2 本章结论（ol.oc-points，3–5 条）
  h3 章.段.3 下一章
  h3 章.段.4 相关阅读
```

- 层级：h2 段 → h3 小节 → h4 子小节。编号只到 h3（`1.3.6`），h4 不带编号。
- 侧栏目录只收 h2 与 h3：段为 level-2，小节为 level-3。链接数量必须与 `docs/article-manifest.json` 中该篇的 `headings` 计数一致（01 篇 39 条、02 篇 37 条，其余各篇 37–41 条）。
- 每个小节恰好一个思考笔记，位置固定在小节开头：先本章要点，再思考笔记，再正文。

## 源稿与转换

内容源在 `/Users/lian/claude_work/system-design-notes/系统设计知识点总纲.md`（该文件由另一个会话持续维护，改造前先冻结副本再转换，避免边读边改）。源稿的六节结构（定义 → 矛盾 → 方法论 → 护栏 → 案例 → 演进）直接映射成六段，源稿的 `####` 子小节降为 h4。

转换时做了三件源稿不需要、博客必须做的事：

1. **编号重排**。源稿按 `23.3.x` 编号，博客按「章.段.小节」编号，两套对不上。源稿里所有 `§23.3.20` 形式的交叉引用改写成指向博客锚点的链接，文字用小节标题。
2. **「权威版」声明改写**。源稿的 `§23.4.3 只引用` 这类声明保留语义，锚点换成新的小节。
3. **跨章引用改写**。源稿引用「第一章 §1.4.4」「第 22 章客服 Agent」等博客里没有的章节，改成可独立成立的表述或站内链接。

## 正文词汇

正文只用博客自己的词汇，不带源站的设计系统：

| 用途 | 写法 |
| --- | --- |
| 导语 | `<p class="oc-lead">` |
| 本章要点 | `<div class="oc-keypoint">` + `<h3>` |
| 思考笔记 | `<div class="thinking-note">` + `<h3>`（样式来自 `css/2026.css`） |
| 引导思考表 | `<table class="guide-card collapsed">`（样式来自 `css/2026.css`） |
| 卡片组 | `<div class="oc-cards">` + `<div class="oc-card">` |
| 全景速览表 | `<table class="oc-overview">` |
| 本章结论 | `<ol class="oc-points">` |
| 数据表 | 普通 `<table>`，不加私有类 |
| 代码块 | 普通 `<pre>`，SQL 与 JSON 用 `language-sql` / `language-json` 标注 |

## 页面样式

- 页面加载 `css/2026.css`（引导思考表、思考笔记）、`css/portal.css`、`css/article.css`、`css/agent-design.css`，顺序与其它文章页一致。
- 专用样式：`css/agent-design.css` 承载本系列特有的部分（导语、要点面板、卡片、段标、全景表、结论列表、层级字号与首行缩进）。这套 `.oc-*` 词汇与 `css/openclaw.css` 同源，作用域不同（`.agent-design-body` 对 `.openclaw-body`），两处都稳定后可以合并。
- 正文容器类名 `.agent-design-body`，`data-series="agent-design"`。
- 页面壳与其它文章页一致：`post-body` / `article-toc-aside` / `reading-toc` / `article-pager` / `article-series-return`。

## 目录与正文基准

- 目录收录全部 h2 与 h3，链接数量必须与 `docs/article-manifest.json` 中该篇的 `headings` 计数一致；h4 标 `data-toc-skip`。
- 改完正文后运行 `node scripts/update-manifest.cjs --write` 更新基准，再跑 `node scripts/verify-articles.cjs`。

## 生成流水线

十一篇都由 `scripts/agent-design/` 里的生成器产出，不手工写 HTML：

| 文件 | 作用 |
| --- | --- |
| `docs/agent-design-source/<源章>.md` | 冻结的源稿快照（总纲对应章），带 sha1 |
| `scripts/agent-design/series.cjs` | 专题总表：博客篇号 ↔ 总纲章号 ↔ 标题 ↔ URL |
| `scripts/agent-design/plan-<篇号>.cjs` | 手写内容：导语、引导思考表、全景表、路线图、每段段标、每小节的要点与思考笔记、结尾四小节 |
| `scripts/agent-design/fixups-<源章号>.cjs` | 源稿编号与跨章引用的改写规则 |
| `scripts/agent-design/md.cjs` | Markdown → HTML（表格、代码块、引用、列表、行内 HTML） |
| `scripts/agent-design/build.cjs` | 生成整页 |
| `scripts/agent-design/check.cjs` | 结构自检：目录条数、面板数量、残留编号 |
| `scripts/agent-design/audit-links.cjs` | 锚点体检：正文里的 `#…` 链接是否都落到真实 id 上 |

```bash
node scripts/agent-design/build.cjs 03      # 生成
node scripts/agent-design/check.cjs 03       # 结构自检
node scripts/agent-design/audit-links.cjs 03 # 锚点体检
```

规范细节见 `scripts/agent-design/README.md`，其中「锚点 id 怎么算」一节是本系列最容易踩的坑：
**标题上印的「章.段.小节」不是锚点 id**，锚点是不含章号的段内局部编号，h4 的第三段取的是
**源稿编号的最后一段**而非段内序号。手算必错，一律用 `audit-links.cjs` 换算。

## 新增一篇要动的位置

1. 冻结源稿到 `docs/agent-design-source/`，记下 sha1。
2. 在 `scripts/agent-design/series.cjs` 登记篇号、标题、slug、源章。
3. 写 `scripts/agent-design/plan-<篇号>.cjs`（手写内容）与 `scripts/agent-design/fixups-<源章号>.cjs`（编号改写规则）。
4. `node scripts/agent-design/build.cjs <篇号>` 生成 `2026/11/26/agent-design-<篇号>-<slug>/index.html`。
5. `check.cjs` + `audit-links.cjs` 全绿，再浏览器看一眼 1440 / 390。
6. 全站接线（由主会话统一做）：`categories/agent-design/index.html`、`archives/index.html`、首页篇数、`search.xml`、`atom.xml`、`docs/article-manifest.json`。
7. `node scripts/update-manifest.cjs --write` 更新正文基准，再跑 `node scripts/verify-articles.cjs` 与浏览器回归。

## 十一篇的对应关系

| 博客篇号 | 标题 | 总纲章号 |
| --- | --- | --- |
| 01 | 问数 Agent——从模糊提问到可信结论 | 23 |
| 02 | 问答 Agent——从知识库到可核验答案 | 24 |
| 03 | 客服 Agent——从答疑到受控代办 | 22 |
| 04 | 营销 Agent——从自然语言目标到可归因的触达 | 25 |
| 05 | 电商 Agent——导购、交易与售后的受控编排 | 26 |
| 06 | 文旅 Agent——行程、资源与动态重排 | 28 |
| 07 | 运维 Agent——从告警风暴到受控止血 | 29 |
| 08 | 安全运营 Agent——跨源取证与最小遏制 | 30 |
| 09 | 合同审查 Agent——逐条可判定的审查结论 | 31 |
| 10 | 办公写作 Agent——文档、PPT 与周报的生成 | 32 |
| 11 | 供应链 Agent——预测、补货与履约的约束求解 | 27 |

阅读顺序按博客篇号排，不按总纲章号排。跨篇引用一律用博客篇号 + 站内链接。
