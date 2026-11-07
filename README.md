<div align="center">

<img src="./images/jifu-mark.svg" alt="JiFu Lian 标记" width="96" />

# JiFu Lian · 个人技术博客

**一个记录 AI 编程、Claude Code、OpenClaw 与智能系统工程实践的静态博客。**

从问题出发，写清原理、实现路径和验证方法。

[![在线阅读](https://img.shields.io/badge/在线阅读-lianjifu.cn-6366f1?style=flat-square)](https://lianjifu.cn/)
[![文章](https://img.shields.io/badge/文章-101-0ea5e9?style=flat-square)](https://lianjifu.cn/archives/)
[![专题](https://img.shields.io/badge/专题-5-f97316?style=flat-square)](https://lianjifu.cn/archives/)
[![部署](https://img.shields.io/badge/部署-GitHub%20Pages-111827?style=flat-square)](https://github.com/Lianjifu/Lianjifu.github.io)
[![静态站点](https://img.shields.io/badge/类型-Static%20Site-10b981?style=flat-square)](#-技术实现)

[项目介绍](#-项目介绍) · [我的项目](#-我的项目) · [内容专题](#-内容专题) · [页面能力](#-页面能力) · [技术实现](#-技术实现) · [仓库结构](#-仓库结构) · [文档索引](#-文档索引)

</div>

---

## ✦ 项目介绍

这是 [lianjifu.cn](https://lianjifu.cn/) 的 GitHub Pages 静态发布仓库，保存 Hexo 生成后的 HTML、CSS、JavaScript 和站点资源。博客关注 AI 编程与 Agent 产品工程，也记录 Claude Code 与 OpenClaw 源码、安全运营和系统运维可观测性的长期研究。

博客文章尽量把一个主题拆成可以复查的工程问题：

| 关注点 | 内容方式 |
| --- | --- |
| 原理 | 解释概念、边界、关键机制和常见误区 |
| 实现 | 通过架构图、时序图、代码片段和模块关系说明落地路径 |
| 工程 | 关注状态、权限、可靠性、可观测性和故障恢复 |
| 验证 | 区分设计建议、代码实现、页面检查和外部运行结果 |

> 这个仓库面向网站访问者和维护者。它是**可部署的静态输出**，不是 Hexo 源仓库，也不是应用服务代码仓库。

## ✦ 我的项目

公开仓库里的四个项目，每个都在回答一个具体问题：

| 项目 | 回答的问题 | 主要技术 |
| --- | --- | --- |
| [智能系统运维 · 可观测平台](https://github.com/Lianjifu/intelligent-operations-observability-platform) | 故障感知、诊断与决策如何闭环 | Vue · AIOps · 可观测性 |
| [企智搭 · 数字伙伴平台](https://github.com/Lianjifu/QiZhiDaPartnerPlatform) | 企业如何获得 7×24 小时的陪伴式协作 | Go · React |
| [企智搭 · 智能体平台](https://github.com/Lianjifu/QiZhiDaAgentPlatform) | 中小企业如何搭建并运营自己的智能体 | Python · FastAPI · React |
| [企智搭 · 代码平台](https://github.com/Lianjifu/QiZhiDaCodePlatform) | Agent 如何在代码工作区里真的动手，并对每次动手负责 | Python · FastAPI · React |

代码平台覆盖代码生成、评审、部署全流程：改代码自动放行，跑命令与联网要人批，破坏性操作永远要人批，每一次能力调用都留痕可查；失败会变成复盘，改进落进记忆 / 技能 / 提示词三层。

> 项目的能力与更新状态以各仓库的 README 为准；博客文章负责记录设计取舍与验证过程。

## ✦ 内容专题

当前文章清单以 [docs/article-manifest.json](./docs/article-manifest.json) 为准，共 101 篇文章、5 个专题。

| 专题 | 篇数 | 主要内容 | 在线入口 |
| --- | ---: | --- | --- |
| AI 编程工程实践 | 5 | AI 编程、Agent 原理、Agent 产品、数字员工与 AI 办公工作台 | [五阶段阅读路径](https://lianjifu.cn/categories/ai-agent/) |
| Claude Code 源码笔记 | 28 | 启动、类型系统、工具、MCP、Agent 运行时、权限与工程实践 | [章节目录](https://lianjifu.cn/categories/claude-code/) |
| OpenClaw 源码笔记 | 10 | 网关与信任边界、通道协议、模型与会话、工具与钩子、端到端链路、性能与降级 | [模块目录](https://lianjifu.cn/categories/openclaw/) |
| 智能安全运营可观测性 | 31 | 安全感知、事件研判、攻击溯源、影响评估与 SOC 运营 | [安全运营专题](https://lianjifu.cn/categories/observable-security/) |
| 智能系统运维可观测性 | 27 | 拓扑感知、故障诊断、根因分析、决策、自动执行与 SRE Agent | [系统运维专题](https://lianjifu.cn/categories/observable-ops/) |

完整阅读入口：

- [博客首页](https://lianjifu.cn/)：个人介绍、项目、精选文章和专题入口。
- [关于我](https://lianjifu.cn/about/)：技术方向、项目经历和公开资料。
- [博客目录](https://lianjifu.cn/archives/)：按专题和阅读顺序查看全部文章。

## ✦ 页面能力

| 能力 | 说明 |
| --- | --- |
| 统一站点界面 | 首页、关于页、目录、专题页和文章页共享导航、页脚与视觉系统。 |
| 首页动效 | 本地 Three.js 场景按需加载，支持暂停、减少动态效果和 WebGL 不可用时的静态图降级。 |
| 长文阅读 | 文章页提供静态目录、章节高亮、移动端折叠、代码复制和专题内上一篇 / 下一篇导航。 |
| Mermaid 图示 | 图示接近视口时才加载并绘制，CDN 优先、本地资源回退；支持图示放大，解析失败时保留源文本。 |
| 加载性能 | 文章页首屏不拉取图示库与图标字体；首页头像用 WebP，星空图改为分组 SVG。 |
| 响应式布局 | 面向桌面和移动端适配，浏览器检查覆盖 390px 与 1440px 等常用视口。 |
| GitHub Pages | 使用仓库根目录静态文件部署，自定义域名由 CNAME 指定为 `www.lianjifu.cn`。 |

## ✦ 技术实现

| 层次 | 当前实现 |
| --- | --- |
| 站点来源 | Hexo + NexT（Pisces）生成的静态输出 |
| 页面层 | 独立 HTML、CSS 与原生 JavaScript，无构建步骤 |
| 首页场景 | 本地 Three.js 0.169.0（MIT），只在首页按需加载 |
| 文章图示 | Mermaid，按需加载，CDN 优先、本地资源回退 |
| 历史资源 | NexT、Velocity.js、Font Awesome、本地搜索等资源继续保留在旧页面 |
| 发布方式 | GitHub Pages + `CNAME`（`www.lianjifu.cn`） |

### 静态输出边界

本仓库不包含以下 Hexo 源文件：

- package.json
- _config.yml
- source/_posts/
- Markdown 原文和主题模板

源文和生成配置在独立的 Hexo 源仓库维护。修改文章或模板时，先在源仓库完成写作和生成，再把静态输出与本仓库已有页面定制进行核对。

~~~text
Hexo 源仓库 Markdown / 模板
              │
              ▼
        hexo generate
              │
              ▼
    核对静态输出与页面定制
              │
              ▼
       发布到 GitHub Pages
~~~

hexo clean、hexo generate、hexo server 和 hexo deploy 只应在源仓库执行；本仓库负责检查生成结果并提供可部署文件。

## ✦ 仓库结构

~~~text
.
├── index.html                    # 首页
├── about/index.html              # 关于页
├── archives/                     # 完整目录、年度与月份归档
├── categories/                   # 五个专题入口
├── 2026/                         # 101 篇文章页面
│   ├── 05/21/                    # Claude Code 源码笔记
│   ├── 06/10/                    # 智能安全运营可观测性
│   ├── 06/13/                    # 智能系统运维可观测性
│   ├── 08/                       # AI 编程工程实践
│   └── 11/07/                    # OpenClaw 源码笔记
├── css/                          # 公共、专题和文章样式
├── js/                           # 导航、动效、目录和图示脚本
├── images/                       # Logo、静态背景和文章配图
├── uploads/                      # 头像等上传资源
├── lib/                          # Three.js、Mermaid 等第三方资源
├── docs/                         # 页面维护文档、系列约束和文章清单
├── scripts/                      # 迁移、正文基准重算、校验和浏览器检查脚本
├── search.xml                    # 旧搜索页面使用的搜索索引（101 条）
├── atom.xml                      # Atom 订阅文件
├── CNAME                         # GitHub Pages 自定义域名
└── README.md
~~~

主要入口脚本：

| 文件 | 作用 |
| --- | --- |
| [js/portal.js](./js/portal.js) | 公共导航、移动菜单和首页动效生命周期 |
| [js/thought-space.js](./js/thought-space.js) | 首页 Three.js 场景 |
| [js/reading-index.js](./js/reading-index.js) | 博客目录交互 |
| [js/article-reader.js](./js/article-reader.js) | 文章目录高亮、移动折叠和代码复制 |
| [js/article-diagrams.js](./js/article-diagrams.js) | Mermaid 图示、放大和引导表折叠 |

## ✦ 文档索引

| 文档 | 用途 |
| --- | --- |
| [docs/homepage.md](./docs/homepage.md) | 首页资源边界、动效降级和页面检查 |
| [docs/article-pages.md](./docs/article-pages.md) | 文章页迁移、正文基准、目录和专题导航 |
| [docs/ai-agent-series.md](./docs/ai-agent-series.md) | AI 编程工程实践五篇系列的顺序、定位和写作约束 |
| [docs/openclaw-series.md](./docs/openclaw-series.md) | OpenClaw 源码笔记十篇系列的顺序、图示和写作约束 |
| [docs/article-manifest.json](./docs/article-manifest.json) | 文章文件、正文长度和 SHA-256 基准 |
| [lib/three/README.md](./lib/three/README.md) | 本地 Three.js 来源和许可证 |

## ✦ 已知限制

- atom.xml 当前仍有历史 XML 转义问题：`ATT&CK` 未写成 `ATT&amp;CK`，严格 XML 解析会在第 528 行失败。
- /categories/ 没有分类总览页，请使用五个专题入口或 [/archives/](https://lianjifu.cn/archives/)。
- Mermaid 使用 CDN 优先、本地资源回退，并在图示接近视口时才加载；网络不可用时，页面可能保留 Mermaid 源文本。

## ✦ 作者

<div align="center">

<img src="./uploads/avatar.webp" alt="JiFu Lian 的头像" width="96" />

**JiFu Lian**

[个人网站](https://lianjifu.cn/) · [GitHub](https://github.com/Lianjifu) · [知乎](https://www.zhihu.com/people/lian-ji-fu)

</div>

---

<div align="center">

[回到顶部](#jifu-lian--个人技术博客)

Made with curiosity and code by JiFu Lian.

</div>
