# 文章页维护

91 篇文章采用首页公共导航及页脚，正文使用 `css/article.css`。文章目录为静态 HTML，`js/article-reader.js` 增强高亮、移动展开、焦点和代码复制。图示及引导表折叠由 `js/article-diagrams.js` 保留原实现。文章页不再加载 NexT 启动脚本、旧侧栏或搜索。

站点 Logo 与 favicon 统一使用 `images/jifu-mark.svg` 的六边形 JL 标记，避免继续显示 NexT 默认 N 图标。

`docs/article-manifest.json` 记录专题顺序、URL、正文长度和 SHA-256。`node scripts/verify-articles.cjs` 核对正文是否改变。合法修改正文后需重新审核并更新对应基准。

迁移前运行 `node scripts/migrate-articles.cjs` 预检查；`--write` 写入并在系统临时目录保存备份。脚本检测到新版外壳时退出，防止重复迁移。重新生成 Hexo 页面后应在独立副本验证再应用。

浏览器检查：`playwright-cli run-code --filename=scripts/verify-articles-browser.js`。全量检查 390/1440px 横向溢出、目录数量和导航高亮；样本检查移动目录、菜单和无 JavaScript 阅读。图示仍包含原文 Mermaid 解析失败的情况，本次只迁移外壳，正文及图示源文本保持一致。

上一篇和下一篇依照四个专题页中的顺序生成，首尾不跨专题。旧正文中的章节导航保留在原始内容中但隐藏，避免与统一底部导航重复。
