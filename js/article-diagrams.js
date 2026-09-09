// Guide Card collapsible behavior
(function() {
  document.querySelectorAll('.guide-card-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var table = header.closest('.guide-card');
      table.classList.toggle('collapsed');
    });
  });
})();

// Mermaid: load from CDN (GitHub Pages 上本地 3MB+ 文件加载过慢), then render
(function() {
  var MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js';
  var MERMAID_LOCAL = '/lib/mermaid.min.js?v=2';
  var mermaidDivs = document.querySelectorAll('.mermaid');
  if (mermaidDivs.length === 0) return;

  // A few generated diagrams contain compact directives such as "style节点 fill".
  // Mermaid requires a space after the directive keyword; normalize only those
  // directive boundaries and leave node labels and diagram data untouched.
  function normalizeSource(source) {
    return source
      .replace(/(^|\n)(\s*)style(?=\S)/g, '$1$2style ')
      .replace(/(^|\n)(\s*)classDef(?=\S)/g, '$1$2classDef ')
      .replace(/(^|\n)(\s*)class(?!Def)(?=\S)/g, '$1$2class ')
      .replace(/([^\n])\s+(style\s+\S+\s+fill:)/g, '$1\n$2')
      .replace(/([^\n])\s+(classDef\s+\S+\s+fill:)/g, '$1\n$2')
      // Generated flowcharts occasionally use a visible numeric module label
      // as a node identifier (for example, "09 智能决策"). Mermaid identifiers
      // cannot begin with a number, so give the node a stable internal ID.
      .replace(/(^|\n)(\s*\S+\s+-->(?:\|[^|]+\|)?\s+)(\d{1,2})\s+([^\n]+)/g,
        '$1$2module_$3["$3 $4"]')
      .replace(/\bend\s+style\s+/g, 'end\nstyle ');
  }
  var originalSources = new WeakMap();

  mermaidDivs.forEach(function(div) {
    if (!div.querySelector('svg') && !div.classList.contains('mermaid-loading')) {
      div.classList.add('mermaid-loading');
    }
  });

  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      if (typeof mermaid !== 'undefined') {
        resolve();
        return;
      }
      var marker = 'script[data-mermaid-src="' + src + '"]';
      var existing = document.querySelector(marker);
      if (existing) {
        if (existing.getAttribute('data-loaded') === '1') {
          resolve();
          return;
        }
        existing.addEventListener('load', function() { resolve(); }, { once: true });
        existing.addEventListener('error', function() { reject(new Error('load failed: ' + src)); }, { once: true });
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.setAttribute('data-mermaid-src', src);
      s.onload = function() {
        s.setAttribute('data-loaded', '1');
        resolve();
      };
      s.onerror = function() {
        reject(new Error('load failed: ' + src));
      };
      document.head.appendChild(s);
    });
  }

  function ensureMermaid() {
    if (typeof mermaid !== 'undefined') return Promise.resolve();
    // 移除页面内嵌的慢速本地 async 标签，避免重复加载
    document.querySelectorAll('script[src*="mermaid.min.js"]').forEach(function(s) {
      if (!s.getAttribute('data-mermaid-src')) s.remove();
    });
    return loadScript(MERMAID_CDN).catch(function() {
      return loadScript(MERMAID_LOCAL);
    });
  }

  function initMermaid() {
    if (typeof mermaid === 'undefined') {
      throw new Error('mermaid is not available');
    }
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          primaryColor: '#ffffff',
          primaryTextColor: '#1e293b',
          primaryBorderColor: '#e2e8f0',
          lineColor: '#64748b',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#f8fafc',
        },
        securityLevel: 'loose',
        flowchart: { curve: 'basis', padding: 15, nodeSpacing: 50, rankSpacing: 80 },
        maxTextSize: 50000,
      });
      var nodes = Array.from(mermaidDivs).filter(function(d) {
        return !d.hasAttribute('data-processed') && !d.querySelector('svg');
      });
      nodes.forEach(function(div) {
        var source = div.textContent;
        var normalized = normalizeSource(source);
        originalSources.set(div, normalized);
        div.dataset.mermaidSource = normalized;
        if (normalized !== source) div.textContent = normalized;
      });
      nodes.forEach(function(div) {
        div.classList.remove('mermaid-loading');
      });
      if (nodes.length > 0) {
        Promise.all(nodes.map(function(div) {
          return mermaid.run({ nodes: [div] }).then(function() {
            if (!div.querySelector('svg')) throw new Error('no SVG output');
          }).catch(function(error) {
            console.error('Mermaid diagram skipped:', error);
            div.classList.remove('mermaid-loading');
            if (!div.querySelector('svg')) {
              div.classList.add('mermaid-error');
              div.setAttribute('role', 'img');
              div.setAttribute('aria-label', '图表解析失败');
              div.innerHTML = '<p>图表暂时无法渲染，原始图示代码仍保留。</p><pre>' +
                escapeDiagramSource(originalSources.get(div) || div.dataset.mermaidSource || '') + '</pre>';
            }
          });
        })).then(function() {
          mermaidDivs.forEach(wrapZoomable);
        });
      }
    } catch (e) {
      console.error('Mermaid init error:', e);
    }
  }

  function escapeDiagramSource(source) {
    return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function wrapZoomable(div) {
    if (div.parentNode.classList.contains('mermaid-zoom-container')) return;
    if (!div.querySelector('svg')) return;
    div.classList.add('rendered');
    var wrapper = document.createElement('div');
    wrapper.className = 'mermaid-zoom-container';
    div.parentNode.insertBefore(wrapper, div);
    wrapper.appendChild(div);
    var overlay = document.createElement('div');
    overlay.className = 'mermaid-expand-overlay';
    overlay.innerHTML = '<span><span class="expand-icon">⛶</span> 点击查看全图</span>';
    wrapper.appendChild(overlay);
    wrapper.addEventListener('click', function() { openMermaidModal(div); });
  }

  var modalInstance = null;
  function openMermaidModal(sourceDiv) {
    if (modalInstance) { modalInstance.remove(); modalInstance = null; }
    var clone = sourceDiv.cloneNode(true);
    var svg = clone.querySelector('svg');
    if (!svg) return;
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.maxWidth = 'none';
    var modal = document.createElement('div'); modal.className = 'mermaid-modal active';
    var content = document.createElement('div'); content.className = 'mermaid-modal-content';
    var header = document.createElement('div'); header.className = 'mermaid-modal-header';
    var hint = '';
    var article = sourceDiv.closest('article');
    if (article) { var h = article.querySelector('h2, h3'); if (h) hint = h.textContent.replace(/[#\d.]/g,'').trim().slice(0, 30); }
    header.innerHTML = '<div class="modal-title-wrap"><span class="modal-icon">⬡</span><span class="modal-title">' + (hint || '图表') + '</span></div><button class="modal-close" title="关闭 (ESC)">✕</button>';
    var body = document.createElement('div'); body.className = 'mermaid-modal-body'; body.appendChild(clone);
    content.appendChild(header); content.appendChild(body); modal.appendChild(content); document.body.appendChild(modal);
    header.querySelector('.modal-close').addEventListener('click', function() { modal.remove(); modalInstance = null; });
    modal.addEventListener('click', function(e) { if (e.target === modal) { modal.remove(); modalInstance = null; } });
    modalInstance = modal;
  }
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modalInstance) { modalInstance.remove(); modalInstance = null; } });

  ensureMermaid().then(initMermaid).catch(function(err) {
    console.error('Mermaid load failed:', err);
    mermaidDivs.forEach(function(div) {
      div.classList.remove('mermaid-loading');
      if (!div.querySelector('svg')) {
        div.classList.add('mermaid-error');
        div.innerHTML = '<p>图表库加载失败，请检查网络后刷新页面。</p>';
      }
    });
  });
})();
