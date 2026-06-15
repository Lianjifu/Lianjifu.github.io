# LianJiFu'blogs

个人技术博客，部署于 [lianjifu.cn](https://lianjifu.cn)。

聚焦 **AI Agent 工程**、**智能安全事件可观测性** 与 **智能系统运维可观测性**，共 **86 篇**深度长文（约 432k 字）。

## 内容系列

| 系列 | 篇数 | 说明 | 入口 |
|------|------|------|------|
| Claude Code 源码深度分析 | 28 | 逆向 49 万行 TypeScript Agent CLI，26 章 + 2 附录 | [/categories/claude-code/](https://lianjifu.cn/categories/claude-code/) |
| 智能安全事件可观测性 | 31 | 业务 / 架构 / 参考三线，覆盖感知、研判、溯源与 SOC | [/categories/observable-security/](https://lianjifu.cn/categories/observable-security/) |
| 智能系统运维可观测性 | 27 | 业务 / 架构 / 参考三线，覆盖故障诊断与 SRE Agent | [/categories/observable-ops/](https://lianjifu.cn/categories/observable-ops/) |

### Claude Code 章节概览

| Part | 章节范围 | 主题 |
|------|----------|------|
| 1 · 基础架构 | 第 1 – 4 章 | 全景概览、启动流程、类型系统、查询引擎 |
| 2 · 核心引擎 | 第 5 – 6 章 | 消息系统、流式处理 |
| 3 · 工具系统 | 第 7 – 9 章 | 工具架构、内置工具、执行管线 |
| 4 · Agent 运行时 | 第 10 – 12 章 | Agent 模型、子 Agent、Skill 系统 |
| 5 · 安全与协议 | 第 13 – 16 章 | 权限模型、Bash 安全、MCP 协议、MCP 认证 |
| 6 · 状态与界面 | 第 17 – 20 章 | 状态管理、会话压缩、Ink UI、REPL |
| 7 · 工程实践 | 第 21 – 25 章 | 性能、测试、构建、设计模式、工程哲学 |
| 8 · 升华 | 第 26 章 + 附录 | 认知循环、术语表、源码导航 |

## 主要页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 系列入口、阅读路径、章节精选卡片 |
| 关于 | `/about/` | 作者介绍、技术栈、代表项目、写作框架 |
| 目录 | `/archives/` | 三大系列按 Part 分组的完整目录 |
| 分类 | `/categories/` | 分类总览 + 每个系列的详细目录 |
| 搜索 | 全站弹层 | 本地全文搜索（`/` 或 `⌘K` / `Ctrl+K`） |

## 站点特性

- **统一设计系统**：首页、关于、目录、分类页采用同一视觉语言（CSS 变量 token 体系）
- **文章阅读系统**：所有文章页采用 `post.css` 设计系统，统一排版、代码块、表格、引用样式
- **智能文章目录**：侧边栏 TOC 支持滚动追踪高亮、章节编号、阅读进度条、移动端悬浮按钮
- **本地搜索**：基于 `search.xml` 的全文检索，支持系列筛选、关键词高亮、键盘导航、输入防抖
- **宽屏适配**：全站支持 5 档断点（1280px → 2560px），大屏体验更佳
- **六维写作框架**：每篇长文围绕「为什么存在、解决什么问题、系统位置、如何工作、如何实现、平台对比」展开

## 技术栈

| 类别 | 技术 |
|------|------|
| 静态站点 | [Hexo 5.4.0](https://hexo.io/) + [NexT 7.8.0](https://theme-next.js.org/) Pisces |
| 部署 | GitHub Pages + 自定义域名（CNAME → lianjifu.cn） |
| 搜索 | 本地全文搜索（`search.xml` + `local-search.js`） |
| 图表 | Mermaid（jsDelivr CDN 按需加载，`/lib/mermaid.min.js` 备用；支持点击放大 / ESC 关闭） |
| 动效 | Velocity.js（页面入场动画） |
| 图标 | Font Awesome 5 |
| 样式 | 自定义 CSS 设计系统（8 个 CSS 文件，CSS 变量体系） |

## 仓库说明

**本仓库是 Hexo 生成后的静态站点输出**（`hexo generate` 的产物），可直接部署到 GitHub Pages。

Markdown 源文、Hexo 配置（`_config.yml`、`package.json`、`source/_posts/`）位于**独立的 Hexo 源仓库**。日常写作与主题配置应在源仓库完成，再执行 `hexo generate` 将输出同步到本仓库。

```
写作（源仓库） → hexo generate → 本仓库（部署） → GitHub Pages
```

> ⚠️ 源仓库重新生成后，本仓库中手动改过的 HTML/CSS/JS 可能被覆盖，需同步回源仓库或重新应用。

## 项目结构

```
/
├── index.html              # 首页（page-home）
├── about/index.html        # 关于页（page-about）
├── archives/index.html     # 目录页（page-archives）
│
├── 2026/05/21/             # Claude Code 系列（28 篇文章，已统一设计系统）
├── 2026/06/10/             # Observable Security 系列（31 篇文章）
├── 2026/06/13/             # Observable Ops 系列（27 篇文章）
│
├── categories/
│   ├── index.html          # 分类总览
│   ├── claude-code/        # Claude Code 分类页
│   ├── observable-security/ # 安全分类页
│   └── observable-ops/     # 运维分类页
│
├── css/
│   ├── main.css            # NexT 主样式
│   ├── home.css            # 首页专用样式
│   ├── about.css           # 关于页样式
│   ├── archives.css        # 目录页样式
│   ├── category.css        # 分类页样式
│   ├── post.css            # 文章页样式（含 TOC 增强）
│   ├── search.css          # 搜索弹层样式（动态加载）
│   └── 2026.css            # 文章通用增强（Mermaid、Guide Card）
│
├── js/
│   ├── local-search.js     # 增强本地搜索（防抖、去重、筛选计数）
│   ├── 2026.js             # TOC 生成器 + 滚动追踪 + 移动端面板
│   ├── home.js             # 首页粒子动效
│   ├── motion.js           # NexT 入场动画
│   └── src/fireworks.js    # 标签页烟花特效
│
├── images/                 # 图片资源（已清理冗余）
├── uploads/                # 头像等上传文件
├── lib/                    # 第三方库（Font Awesome、Velocity、Anime.js、Mermaid）
├── live2dw/                # Live2D 看板娘
│
├── search.xml              # 搜索索引（86 篇，约 830KB）
├── atom.xml                # Atom 订阅源
└── CNAME                   # 自定义域名 lianjifu.cn
```

## 本地预览

本仓库为纯静态文件，无需 Node.js 即可预览：

```bash
# 在项目根目录启动 HTTP 服务
python3 -m http.server 4000

# 浏览器访问
open http://localhost:4000
```

常用页面：

- 首页：http://localhost:4000/
- 关于：http://localhost:4000/about/
- 目录：http://localhost:4000/archives/

若需从 Markdown 重新生成站点，请在 Hexo 源仓库中执行：

```bash
hexo clean && hexo generate && hexo deploy
```

## 维护提示

- 修改 `search.xml` 时注意 XML 特殊字符转义（如 `MITRE ATT&amp;CK` 中的 `&`）
- Mermaid 图表通过 jsDelivr CDN 加载；勿在 HTML 中直接引用本地 3MB+ 的 `mermaid.min.js`（GitHub Pages 传输过慢会导致图表空白）
- 自定义页面样式改动后，记得 bump CSS/JS 的 `?v=` 版本号以避免浏览器缓存
- 新增文章后，`search.xml`、`atom.xml` 需要重新生成
- 页面若出现空白/无内容，检查 NexT `motion.js` 是否因缺少 DOM 元素而报错（常见于 `.site-nav-toggle` 被移除时）

## 作者

**JiFuLian** — 全栈开发者 · AI Agent 逆向工程

- 站点：https://lianjifu.cn
- GitHub：https://github.com/Lianjifu
- 知乎：https://www.zhihu.com/people/lian-ji-fu
