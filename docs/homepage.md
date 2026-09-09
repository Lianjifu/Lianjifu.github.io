# 个人网站首页

首页采用独立的静态 HTML/CSS/JavaScript，不加载 NexT 的启动、搜索或动效脚本。文章、分类、归档和关于页继续使用原有主题。

## 文件与维护边界

| 文件 | 用途 |
| --- | --- |
| `index.html` | 导航、个人介绍、项目、文章、专题、札记与页脚 |
| `css/portal.css` | 首页专用排版、导航、响应式和概念插图 |
| `js/portal.js` | 移动导航、博客展开面板、锚点状态、动效加载与暂停 |
| `js/thought-space.js` | Three.js 场景与 GPU 资源生命周期 |
| `images/galaxy-field.svg` | 低对比星云与远景星点背景，静态降级时同样可见 |
| `images/thought-space.svg` | 无 JavaScript、减少动态效果或 WebGL 失败时的静态视觉 |
| `lib/three/` | 固定版本 Three.js 0.169.0 及 MIT 许可证 |
| `scripts/verify-homepage.js` | Playwright CLI 浏览器回归检查 |

这是静态输出仓库。源仓库重新生成站点前，应同步首页结构和以上资源，否则手工重构可能被覆盖。静态资源更新后，同步调整首页 CSS/JS 及动态导入 URL 的版本参数。

## 内容来源

- 作者介绍和三个项目取自现有 `about/index.html`。外链沿用原来的 GitHub 仓库地址，不据此宣称项目已经部署或持续维护。
- 项目图案是概念插图，不是产品截图；AIOpsPlatform 图案在页面中明确标注“概念图”。
- 精选文章与四个分类链接指向现有页面。首页文章数量为 91（2026-09-09 核对）；新增文章后同步更新统计与精选入口。
- “札记”目前是《Claude Code 第 25 章：工程哲学》的两条原文摘记，链接回相应锚点。没有创建虚构生活内容或独立札记详情页。
- 项目、札记导航链接到首页对应区块；博客展开面板链接到现有归档和分类。
- 首页不加载搜索组件及快捷键；其他页面的搜索不变。

## 动效与降级

三维主体采用通透的粒子核心、细线轨道和流动光点；不使用实体球面，透过前侧可见后侧结构，通过旋转和视差呈现空间层次。外围增加低亮度星云、远近星点与缓慢旋转的三条旋臂星尘，文字区域降低星点密度。静态图提供对应的粒子轨道构图。

文本、链接和静态视觉先可用，Three.js 通过动态导入增强首页。依赖位于本地，不依赖运行时第三方 CDN。

- 离开首屏、页面隐藏、打开移动菜单或点击暂停时停止动画循环。
- 桌面像素比上限 1.7，移动端 1.35；连续慢帧触发一次分辨率与粒子数量降级。
- 启用 `prefers-reduced-motion` 时不创建场景；初始启用时不下载 Three.js。运行中切换会释放场景并恢复静态图。
- 模块加载失败、WebGL 不可用或上下文丢失时，保留静态图与正常内容。控制台会给出诊断信息。
- 离开页面时释放 GPU 资源、监听器与观察器；进入浏览器往返缓存时只暂停，返回后恢复。
- 无 JavaScript 时使用原生 `details` 博客面板，并展示移动端导航。

## 预览与检查

```sh
python3 -m http.server 4000 --bind 127.0.0.1
node --check js/portal.js
node --check js/thought-space.js
git diff --check
```

浏览器回归使用 Playwright CLI，不需要为本仓库安装应用依赖或建立构建系统。在项目根目录执行：

```sh
mkdir -p output/playwright
npx --yes --package @playwright/cli playwright-cli -s=blog-home open http://127.0.0.1:4000/ --headed
npx --yes --package @playwright/cli playwright-cli -s=blog-home run-code --filename=scripts/verify-homepage.js
```

`verify-homepage.js` 是 CLI 接收的函数表达式，不是 Node.js 可直接执行的测试文件；保持末尾没有分号（CLI 会把整个文件包进函数调用）。结果返回检查数量与检查项，失败时抛出具体错误。截图输出在 `output/playwright/`。

覆盖桌面与移动导航、键盘焦点、锚点、动效暂停恢复、320–3440px 布局、减少动态效果、无 JavaScript、模块下载失败、WebGL 不可用与上下文丢失。浏览器检查不能代替所有实际移动设备的 GPU 性能测试。

## 关于页

`about/index.html` 已采用相同的导航、页脚和静态星空风格，专用布局在 `css/profile.css`。`js/portal.js` 复用移动菜单与导航状态；关于页不含 `#thought-space` 时不会加载 Three.js。项目与札记入口返回首页锚点。正文沿用原关于页的经历方向、技术清单与公开仓库，未添加未证实的任职时间线或项目成果。

关于页验证：320、390、768、1920px 无横向溢出，移动菜单及 Esc 关闭正常，当前页标识保持“关于我”，浏览器无未捕获错误；49 个本地链接与资源引用检查通过。

## 博客目录

主目录 `/archives/` 使用共享导航与页脚，配合 `css/reading-index.css` 和 `js/reading-index.js`。保留全部 91 篇文章链接及 `series-engineering`、`series-agent`、`series-security`、`series-ops` 锚点。桌面使用顶部专题导航与分组双列，移动端使用原生 details 专题选择及单列目录。年度与月份归档未改动。页面不加载搜索或 Three.js。

验证了目录与实际文章文件集合一致、320–1920px 无横向溢出、移动专题跳转与高亮、菜单关闭以及首页 46 项回归检查。注意浏览器可能保留旧 HTML 缓存，首次预览可使用 `/archives/?v=reading-2`。

## AI Agent 专题页

Claude Code 专题 `/categories/claude-code/` 复用同一星空首屏与公共导航，专用布局与交互为 `css/code-series.css`、`js/code-series.js`。保留 26 篇正文及 2 篇附录；桌面左侧章节导航停靠，移动端使用原生折叠目录。验证了全部文章链接与顺序、320–1920px 布局、章节定位与高亮、移动菜单、无 JavaScript 阅读及相关页面导航。

## 文章阅读页

`2026/**/index.html` 下的 91 篇文章已接入共享文章阅读层。公共导航与页脚复用首页设计，标题区使用通栏静态星空背景，正文统一为浅色长文阅读布局。公共样式为 `css/article.css`，导航交互复用 `js/portal.js`。文章页的项目、札记入口指向首页锚点，只有博客栏目高亮。旧侧栏个人卡片隐藏；目录容器由公共脚本移出旧侧栏，在大屏进入正文后显示，保留原目录生成与移动目录功能。文章页不再加载依赖旧页脚的 Pisces 侧栏定位脚本。

2026-09-10 顶部修复验证：91 篇文章分别检查 390px 与 1440px，通栏宽度、标题对齐、导航高亮及无横向溢出均通过。代表文章另检查 320/768/1920px、滚动导航、桌面目录、移动菜单及 Escape。正文区域与本次修复前快照逐字节一致。巡检发现部分原文 Mermaid 图示有解析错误，此次未改动图示源内容；布局检查通过不代表所有图示都已正确渲染。仓库为 Hexo 生成结果，重新生成静态站点时需同步文章模板和公共资源。

`/categories/ai-agent/` 使用共享导航与页脚，专用布局在 `css/agent-series.css`。静态星空与轨道首屏、五阶段阅读路径和纵向文章单元保留五篇原文的链接及进阶顺序；移动端路径改为纵向排列。无新增依赖，不加载 Three.js 或搜索。`js/portal.js` 通过 `personal-series` 类保持“博客”栏目高亮。

验证覆盖五篇文章 HTTP 响应、320/390/768/1440/1920px 布局、桌面及移动锚点、菜单与 Escape、无 JavaScript 阅读，以及关于页与目录导航高亮。首页 46 项回归通过。首次预览可使用 `/categories/ai-agent/?v=agent-1`。
