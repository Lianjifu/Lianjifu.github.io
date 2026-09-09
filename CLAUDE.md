# Repository guidance for Claude Code

## 项目概览

这是部署到 [lianjifu.cn](https://lianjifu.cn) 的个人技术博客静态输出仓库。站点由 Hexo 生成，当前页面包含 91 篇文章、4 个专题：AI Agent 工程（5）、Claude Code 源码分析（28）、智能安全运营可观测性（31）、智能系统运维可观测性（27）。

本仓库不包含 Hexo 源文和构建配置，不要在这里运行生成命令或引入应用依赖。Markdown、模板和 `_config.yml` 位于独立的 Hexo 源仓库；这里的 HTML、CSS、JavaScript 与资源是可部署产物，并包含已同步的页面定制。

## 目录结构

- `index.html`：首页；`about/`：关于页；`archives/`：四专题完整目录。
- `categories/ai-agent/`、`categories/claude-code/`、`categories/observable-security/`、`categories/observable-ops/`：专题页。`categories/index.html` 当前不存在。
- `2026/`：91 篇文章，文章清单和正文基准在 `docs/article-manifest.json`。
- `css/`、`js/`：公共页面、专题页和文章阅读层；`images/`、`uploads/`、`lib/`：站点资源。
- `docs/`：页面及系列维护文档；`scripts/`：迁移、正文校验和浏览器检查脚本。
- `search.xml`：91 条搜索索引；`atom.xml`：订阅文件；`CNAME`：自定义域名。

首页与主要页面共享 `css/portal.css`、`js/portal.js`。首页的 Three.js 场景在 `js/thought-space.js` 中按需加载，并提供静态图、暂停和减少动态效果降级。文章页使用 `css/article.css`、`js/article-reader.js` 和 `js/article-diagrams.js`，支持目录高亮、移动端折叠、代码复制和 Mermaid 图示。

## 本地预览

在仓库根目录运行：

```bash
python3 -m http.server 4000 --bind 127.0.0.1
```

然后访问 <http://127.0.0.1:4000/>。静态资源使用根路径，必须通过 HTTP 服务预览，不要直接双击 HTML 文件。停止服务按 `Ctrl+C`。本地检查若受代理影响，使用 `curl --noproxy '*' -I http://127.0.0.1:4000/`。

## 修改边界

- 保留用户已有改动，严格限定在当前需求范围内。
- 修改 CSS/JS 后同步更新 HTML 中的 `?v=` 版本参数，避免缓存旧资源。
- 修改文章正文前先阅读 `docs/article-pages.md`；正文基准变更后更新 `docs/article-manifest.json`，并重新审阅专题、归档、搜索索引和订阅文件。
- 重新生成 Hexo 输出可能覆盖这里的页面定制。生成前在源仓库同步模板，或在独立副本中验证后再应用。
- 不在代码、日志或文档中写入密钥、令牌或个人敏感信息。

## 验证命令

无需安装 npm 依赖即可执行正文和语法检查：

```bash
node scripts/verify-articles.cjs
node --check js/portal.js
node --check js/article-reader.js
node --check js/article-diagrams.js
git diff --check
```

浏览器检查需使用 Playwright CLI：

```bash
mkdir -p output/playwright
npx --yes --package @playwright/cli playwright-cli -s=blog-check open http://127.0.0.1:4000/ --headed
npx --yes --package @playwright/cli playwright-cli -s=blog-check run-code --filename=scripts/verify-homepage.js
npx --yes --package @playwright/cli playwright-cli -s=blog-check run-code --filename=scripts/verify-articles-browser.js
```

浏览器脚本是 Playwright CLI 的函数表达式，不能直接用 `node` 执行。文章检查应返回空的 `failures` 和 `errors`。布局通过不代表所有 Mermaid 源图均无解析错误。

## 内容与发布工作流

```text
独立 Hexo 源仓库写作 → hexo generate → 核对静态输出与定制 → 发布到 GitHub Pages
```

`hexo clean`、`hexo generate`、`hexo server` 和 `hexo deploy` 只在源仓库执行。本仓库负责检查生成结果和提供静态部署文件。

## 已知限制

截至 2026-09-10，`atom.xml` 第 528 行的 `ATT&CK` 未转义，严格 XML 解析会失败；修复后需重新验证订阅内容。Mermaid 使用 CDN 优先、本地资源回退，网络不可用时可能保持源文本。

更多细节见：

- `README.md`：站点说明、结构和完整维护流程。
- `docs/homepage.md`：首页资源边界与动效降级。
- `docs/article-pages.md`：文章页迁移、正文校验和导航规则。
- `docs/ai-agent-series.md`：AI Agent 五篇系列的顺序与写作约束。
