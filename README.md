# JiFu Lian · 个人网站与技术博客

个人介绍、项目展示与技术长文，部署于 [lianjifu.cn](https://lianjifu.cn)。

当前收录 **91 篇文章、4 个专题**（2026-09-10 按实际文章文件与 [文章清单](docs/article-manifest.json) 核对）。内容覆盖 AI 编程与 Agent 产品工程、Claude Code 源码分析、安全运营和系统运维可观测性。

## 内容专题

| 专题 | 篇数 | 内容 | 阅读入口 |
| --- | ---: | --- | --- |
| AI Agent 工程 | 5 | AI 编程 → Agent 原理 → Agent 产品 → 数字员工平台 → AI 办公工作台 | [五阶段阅读路径](https://lianjifu.cn/categories/ai-agent/) |
| Claude Code 源码深度分析 | 28 | 26 章正文与 2 篇附录，覆盖启动、工具、Agent 运行时、安全与工程实践 | [章节目录](https://lianjifu.cn/categories/claude-code/) |
| 智能安全运营可观测性 | 31 | 业务、架构与参考资料，覆盖感知、研判、溯源和 SOC | [安全运营专题](https://lianjifu.cn/categories/observable-security/) |
| 智能系统运维可观测性 | 27 | 业务、架构与参考资料，覆盖故障诊断、决策、自动执行与 SRE Agent | [系统运维专题](https://lianjifu.cn/categories/observable-ops/) |

全部文章见 [博客目录](https://lianjifu.cn/archives/)。AI Agent 五篇文章的顺序与写作约束见 [系列说明](docs/ai-agent-series.md)。

## 页面与交互

| 页面 | 入口 | 说明 |
| --- | --- | --- |
| 首页 | [首页](https://lianjifu.cn/) | 个人介绍、项目、精选文章、专题与札记 |
| 关于我 | [关于页](https://lianjifu.cn/about/) | 技术方向、项目与公开资料 |
| 博客目录 | [完整目录](https://lianjifu.cn/archives/) | 四个专题、91 篇文章，按阅读顺序分组 |
| 专题页 | 上表中的四个阅读入口 | 专题介绍、阅读路径与章节导航 |
| 文章页 | `/2026/年内月份/日期/文章标识/` | 长文阅读、章节目录、代码复制与专题内上一篇 / 下一篇 |

- **公共界面**：首页、关于页、主目录、四个专题与文章页共享导航和页脚，使用独立的 HTML、CSS 与原生 JavaScript。
- **首页动效**：本地 Three.js 模块按需加载，提供粒子与轨道场景；支持暂停、减少动态效果及 WebGL 不可用时的静态图降级。
- **文章阅读**：静态章节目录在无 JavaScript 时仍可使用，脚本增强滚动高亮、移动端折叠与代码复制。
- **图示**：Mermaid 按需从 CDN 加载，失败后尝试本地资源，支持点击放大；渲染失败时显示图示源文本。
- **搜索范围**：当前公共界面和 91 篇文章不加载搜索组件；年度、月份归档及旧标签页仍保留 NexT 与本地搜索资源。

`/categories/` 当前没有分类总览页，请使用四个专题入口或 `/archives/`。

## 本地启动

本仓库是可直接提供 HTTP 服务的静态文件，无需安装 Node.js、Hexo 或应用依赖即可预览。需要 Python 3，在仓库根目录执行：

```bash
python3 -m http.server 4000 --bind 127.0.0.1
```

打开 [http://127.0.0.1:4000/](http://127.0.0.1:4000/)。终端保持运行，按 `Ctrl+C` 停止服务。macOS 也可另开终端执行：

```bash
open http://127.0.0.1:4000/
```

- [关于我](http://127.0.0.1:4000/about/)
- [博客目录](http://127.0.0.1:4000/archives/)
- [AI Agent 工程](http://127.0.0.1:4000/categories/ai-agent/)

页面资源使用站点根路径，应通过 HTTP 预览，避免直接双击 HTML 文件。如果 4000 端口被占用，可更换端口；浏览器检查脚本中的 `base` 地址也需同步调整。命令行请求若受代理影响，可用以下命令检查本地响应：

```bash
curl --noproxy '*' -I http://127.0.0.1:4000/
```

## 技术与仓库边界

| 层次 | 当前实现 |
| --- | --- |
| 站点来源 | Hexo 5.4.0 + NexT 7.8.0（Pisces）生成的静态输出 |
| 当前主要页面 | 独立静态 HTML、CSS 与原生 JavaScript，无构建步骤 |
| 首页三维场景 | 本地 Three.js 0.169.0（MIT），仅首页按需加载 |
| 文章图示 | Mermaid，CDN 优先、本地资源回退 |
| 历史页面资源 | NexT、Velocity.js、Font Awesome、本地搜索等 |
| 部署 | GitHub Pages，自定义域名由 `CNAME` 指定为 `lianjifu.cn` |

**本仓库不是 Hexo 源仓库**：这里不包含 `package.json`、`_config.yml` 或 `source/_posts/`。Markdown 源文与 Hexo 配置在独立源仓库维护。

当前仓库还包含对生成页面的定制。重新运行 Hexo 生成前，需要把对应模板、页面与资源同步回源仓库，或在独立副本中验证并重新应用定制，避免覆盖现有界面。

```text
源仓库 Markdown / 模板 → hexo generate → 核对静态输出与页面定制 → 发布到 GitHub Pages
```

`hexo generate`、`hexo server` 和 `hexo deploy` 均应在源仓库执行；本仓库的预览不需要生成或发布。

## 项目结构

```text
/
├── index.html                    # 首页
├── about/index.html              # 关于我
├── archives/index.html           # 四专题完整目录
├── archives/2026/                # 保留的年度与月份归档
├── categories/                   # ai-agent / claude-code / observable-security / observable-ops
├── 2026/
│   ├── 05/21/                    # Claude Code：28 篇
│   ├── 06/10/                    # 安全运营：31 篇
│   ├── 06/13/                    # 系统运维：27 篇
│   └── 08/                       # AI Agent 工程：5 篇
├── css/
│   ├── portal.css                # 公共导航、首页与基础视觉
│   ├── profile.css               # 关于页
│   ├── reading-index.css         # 博客目录
│   ├── agent-series.css          # AI Agent 专题及专题公共样式
│   ├── code-series.css           # Claude Code 专题
│   ├── security-series.css       # 安全运营专题
│   ├── ops-series.css            # 系统运维专题
│   └── article.css               # 文章阅读界面；旧样式文件另行保留
├── js/
│   ├── portal.js                 # 公共导航与首页动效生命周期
│   ├── thought-space.js          # 首页 Three.js 场景
│   ├── reading-index.js          # 目录交互
│   ├── code-series.js            # Claude Code / 运维专题导航
│   ├── security-series.js        # 安全运营专题交互
│   ├── article-reader.js         # 文章目录与代码复制
│   └── article-diagrams.js       # 图示渲染、放大与引导表折叠
├── docs/                         # 页面维护文档、系列约束与文章清单
├── scripts/                      # 文章迁移、正文校验与浏览器检查
├── images/                       # JL 标记、静态星空与站点图片
├── uploads/                      # 头像等上传资源
├── lib/                          # Three.js、Mermaid 等第三方资源
├── tags/                         # 保留的标签页
├── live2dw/                      # 保留的 Live2D 资源
├── search.xml                    # 91 条搜索索引，供旧搜索页面使用
├── atom.xml                      # Atom 订阅文件，见下方已知限制
└── CNAME                         # 自定义域名
```

## 校验与维护

预览只需 Python；以下校验命令另需 Node.js。正文校验使用 Node.js 内置模块，无需安装 npm 依赖：

```bash
node scripts/verify-articles.cjs
node --check js/portal.js
node --check js/article-reader.js
node --check js/article-diagrams.js
git diff --check
```

文章校验按 [article-manifest.json](docs/article-manifest.json) 检查 91 篇文章的正文 SHA-256 与新版页面结构。合法修改正文后，需审阅差异并更新对应基准；新增文章时还应同步专题、归档、首页统计、搜索索引和订阅文件，以及校验脚本中的数量断言。

浏览器检查需先启动上面的本地服务，并准备 Playwright CLI 所需的浏览器。首次运行 `npx` 会下载工具：

```bash
mkdir -p output/playwright
npx --yes --package @playwright/cli playwright-cli -s=blog-check open http://127.0.0.1:4000/ --headed
npx --yes --package @playwright/cli playwright-cli -s=blog-check run-code --filename=scripts/verify-homepage.js
npx --yes --package @playwright/cli playwright-cli -s=blog-check run-code --filename=scripts/verify-articles-browser.js
```

这两个浏览器脚本是 Playwright CLI 接收的函数表达式，不能直接用 `node` 执行。首页检查覆盖导航、响应式布局及动效降级；文章检查覆盖 91 页在 390/1440px 下的布局、目录与导航，并抽样检查移动交互和无 JavaScript 阅读。文章脚本返回的 `failures` 与 `errors` 都应为空，不能只按命令退出状态判断通过。布局检查不等于所有 Mermaid 图示均已正确渲染。

更多维护细节：

- [首页与公共页面](docs/homepage.md)：资源边界、动效降级和浏览器检查。
- [文章页维护](docs/article-pages.md)：正文基准、专题内导航与迁移脚本。迁移脚本默认预检查，`--write` 会写入页面并备份；重新生成后先在独立副本验证。
- [AI Agent 系列约束](docs/ai-agent-series.md)：五篇文章的顺序、定位与写作规则。
- [Three.js 来源与许可证](lib/three/README.md)。

更新 CSS/JS 后应同步引用 URL 的版本参数。修改 XML 时需转义特殊字符，例如将 `ATT&CK` 写成 `ATT&amp;CK`。

**已知限制（2026-09-10 核对）**：`atom.xml` 中有未转义的 `ATT&CK`，XML 解析在第 528 行报错，订阅功能仍需修复并验证。

## 作者

**JiFu Lian**

[个人站点](https://lianjifu.cn) · [GitHub](https://github.com/Lianjifu) · [知乎](https://www.zhihu.com/people/lian-ji-fu)
