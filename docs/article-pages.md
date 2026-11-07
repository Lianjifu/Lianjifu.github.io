# 文章页维护

101 篇文章采用首页公共导航及页脚，正文使用 `css/article.css`；OpenClaw 十篇另加 `css/openclaw.css`，加载顺序在 `article.css` 之后。文章目录为静态 HTML，`js/article-reader.js` 增强高亮、移动展开、焦点和代码复制。图示及引导表折叠由 `js/article-diagrams.js` 保留原实现。文章页不再加载 NexT 启动脚本、旧侧栏或搜索。

站点 Logo 与 favicon 统一使用 `images/jifu-mark.svg` 的六边形 JL 标记，避免继续显示 NexT 默认 N 图标。

文章页的元信息图标（日历、分类、标签）用页面自带的 SVG sprite（`i-calendar`、`i-folder`、`i-tags`）绘制，不再引用 Font Awesome——91 个文章页原本只为这两个字形引入 148 KB 图标字体。旧的 `/tags/`、`/archives/2026/` 页面仍使用 Font Awesome，不受影响。

图示按需加载：Mermaid 的 554 KB 运行时只有在图示接近视口时才下载，读者停在文章开头不会拉取这份资源。`js/article-diagrams.js` 用 IntersectionObserver 判断图示是否进入视口（提前 600 px），命中后下载 Mermaid，并按离视口的远近依次绘制。加载中的图示显示占位框而不是源码。页面 `<head>` 预连接 `cdn.jsdelivr.net`，命中后能立即开始下载。

`docs/article-manifest.json` 记录专题顺序、URL、正文长度和 SHA-256。`node scripts/verify-articles.cjs` 核对正文是否改变。合法修改正文后需重新审核并更新对应基准：`node scripts/update-manifest.cjs` 先打印将要变更的条目，确认后加 `--write` 重写清单。基准只覆盖 `post-body` 正文元素，不含目录、翻页等外壳，改外壳不会让它失效。

迁移前运行 `node scripts/migrate-articles.cjs` 预检查；`--write` 写入并在系统临时目录保存备份。脚本检测到新版外壳时退出，防止重复迁移。重新生成 Hexo 页面后应在独立副本验证再应用。

浏览器检查：`playwright-cli run-code --filename=scripts/verify-articles-browser.js`。全量检查 390/1440px 横向溢出、目录数量和导航高亮；样本检查移动目录、菜单和无 JavaScript 阅读。图示仍包含原文 Mermaid 解析失败的情况，本次只迁移外壳，正文及图示源文本保持一致。

图示改为按需加载后，浏览器检查不再等待图示渲染。要确认图示本身能画出来，需滚动经过图示再统计 `.mermaid svg` 数量：滚动到底后应有 `.mermaid svg` 与 `.mermaid` 数量相等、`.mermaid-error` 为 0。

上一篇和下一篇依照五个专题页中的顺序生成，首尾不跨专题。旧正文中的章节导航保留在原始内容中但隐藏，避免与统一底部导航重复。
