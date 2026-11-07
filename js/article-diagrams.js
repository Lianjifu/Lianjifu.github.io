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
  var mermaidDivs = Array.prototype.slice.call(document.querySelectorAll('.mermaid'));
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
  }

  function escapeDiagramSource(source) {
    return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Mermaid writes width="100%" plus a max-width, so a wide diagram is scaled
  // down until its labels are illegible. Draw the source-note diagrams as large
  // as the column allows, keep the few very wide ones at their natural width,
  // and let those scroll sideways.
  var naturalWidth = document.body.getAttribute('data-series') === 'openclaw';
  var MIN_SCALE = 0.5;

  function sizeToViewBox(div) {
    var svg = div.querySelector('svg');
    if (!svg) return;
    var box = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(parseFloat);
    if (box.length !== 4 || !(box[2] > 0) || !(box[3] > 0)) return;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.setProperty('max-width', 'none', 'important');
    svg.style.setProperty('min-width', '0', 'important');
    svg.style.setProperty('width', box[2] + 'px', 'important');

    var cs = getComputedStyle(div);
    var inner = (div.clientWidth || 0) -
                (parseFloat(cs.paddingLeft) || 0) -
                (parseFloat(cs.paddingRight) || 0);
    var wide = inner > 0 && box[2] > inner && inner / box[2] < MIN_SCALE;
    if (wide) {
      svg.style.setProperty('width', box[2] + 'px', 'important');
      svg.style.setProperty('margin-left', '0', 'important');
      svg.style.setProperty('margin-right', '0', 'important');
    } else if (inner > 0 && box[2] > inner) {
      svg.style.setProperty('width', inner + 'px', 'important');
      svg.style.setProperty('margin-left', '0', 'important');
      svg.style.setProperty('margin-right', '0', 'important');
    } else {
      svg.style.setProperty('margin-left', 'auto', 'important');
      svg.style.setProperty('margin-right', 'auto', 'important');
    }
    div.classList.toggle('is-scrollable', wide);
    toggleScrollHint(div, wide);
  }

  function toggleScrollHint(div, show) {
    var holder = div.closest('figure') || div.parentNode;
    if (!holder) return;
    var hint = holder.querySelector('.diagram-scroll-hint');
    if (!show) {
      if (hint) hint.remove();
      return;
    }
    if (hint) return;
    hint = document.createElement('p');
    hint.className = 'diagram-scroll-hint';
    hint.textContent = '← 图比正文宽，横向滚动或点击放大查看完整内容 →';
    var caption = holder.querySelector('figcaption');
    if (caption) holder.insertBefore(hint, caption);
    else holder.insertBefore(hint, div.nextSibling);
  }

  // A wide diagram scrolls sideways, but a vertical wheel gesture does not
  // pan a horizontal box, so the diagram looked stuck. Map the wheel over a
  // diagram that can still scroll sideways onto its horizontal offset.
  // The click-to-zoom overlay sits on top of the diagram, so the diagram is
  // found through its wrapper.
  if (naturalWidth) {
    document.addEventListener('wheel', function(e) {
      if (e.deltaX) return;
      var wrap = e.target.closest && e.target.closest('.mermaid-zoom-container');
      var div = wrap ? wrap.querySelector('.mermaid') : (e.target.closest && e.target.closest('.mermaid'));
      if (!div || !div.classList.contains('is-scrollable')) return;
      var max = div.scrollWidth - div.clientWidth;
      if (max <= 0) return;
      var next = div.scrollLeft + e.deltaY;
      if (next <= 0 || next >= max) return;
      div.scrollLeft = next;
      e.preventDefault();
    }, { passive: false });
  }

  // The fit depends on the column width, so recompute it when the window
  // changes size.
  if (naturalWidth) {
    var resizeTimer = null;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        document.querySelectorAll('.mermaid').forEach(sizeToViewBox);
      }, 150);
    });
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
    // Take the SVG itself, not the diagram box: the box scrolls on its own
    // and would hide the modal's scrollbar.
    var source = sourceDiv.querySelector('svg');
    if (!source) return;
    var svg = source.cloneNode(true);
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.style.height = 'auto'; svg.style.maxWidth = 'none';
    var modal = document.createElement('div'); modal.className = 'mermaid-modal active';
    var content = document.createElement('div'); content.className = 'mermaid-modal-content';
    var header = document.createElement('div'); header.className = 'mermaid-modal-header';
    var hint = '';
    var article = sourceDiv.closest('article');
    if (article) { var h = article.querySelector('h2, h3'); if (h) hint = h.textContent.replace(/[#\d.]/g,'').trim().slice(0, 30); }
    header.innerHTML = '<div class="modal-title-wrap"><span class="modal-icon">⬡</span><span class="modal-title">' + (hint || '图表') + '</span></div><button class="modal-close" title="关闭 (ESC)">✕</button>';
    var body = document.createElement('div'); body.className = 'mermaid-modal-body'; body.appendChild(svg);
    content.appendChild(header); content.appendChild(body); modal.appendChild(content); document.body.appendChild(modal);
    // A diagram wider than the modal keeps its natural size: the modal body
    // scrolls sideways, so nothing is shrunk into illegibility.
    var box = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(parseFloat);
    var natural = box.length === 4 ? box[2] : 0;
    svg.style.width = natural > body.clientWidth && natural > 0 ? natural + 'px' : '100%';
    header.querySelector('.modal-close').addEventListener('click', function() { modal.remove(); modalInstance = null; });
    modal.addEventListener('click', function(e) { if (e.target === modal) { modal.remove(); modalInstance = null; } });
    // The same wheel gesture: sideways for a diagram wider than the box.
    body.addEventListener('wheel', function(e) {
      if (e.deltaX) return;
      var max = body.scrollWidth - body.clientWidth;
      if (max <= 0) return;
      var next = body.scrollLeft + e.deltaY;
      if (next <= 0 || next >= max) return;
      body.scrollLeft = next;
      e.preventDefault();
    }, { passive: false });
    modalInstance = modal;
  }
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modalInstance) { modalInstance.remove(); modalInstance = null; } });

  // ----- rendering pipeline -----
  //
  // The Mermaid bundle is 554 KB. On most articles the first diagram sits far
  // below the fold, so the library is only fetched once a diagram comes near
  // the viewport, and each diagram is drawn as the reader reaches it. A reader
  // who stops at the top of an article never downloads the bundle at all.

  // Mermaid 11 has shared internal state that mis-renders when many diagrams
  // are kicked off concurrently: every div ends up with the same timestamp id
  // and only one survives. Draw them one at a time.
  var renderQueue = Promise.resolve();
  var wanted = new Set();

  function renderDiagram(div) {
    if (div.getAttribute('data-processed') === 'true' || div.querySelector('svg')) return renderQueue;
    renderQueue = renderQueue.then(function() {
      if (div.getAttribute('data-processed') === 'true' || div.querySelector('svg')) return null;
      var source = div.textContent;
      var normalized = normalizeSource(source);
      originalSources.set(div, normalized);
      div.dataset.mermaidSource = normalized;
      if (normalized !== source) div.textContent = normalized;
      // Keep the source out of sight until the figure is drawn.
      div.classList.remove('mermaid-loading');
      div.classList.add('mermaid-rendering');
      return mermaid.run({ nodes: [div] }).then(function() {
        if (!div.querySelector('svg')) throw new Error('no SVG output');
        div.classList.remove('mermaid-rendering');
        if (naturalWidth) sizeToViewBox(div);
        wrapZoomable(div);
      });
    }).catch(function(error) {
      console.error('Mermaid diagram skipped:', error);
      div.classList.remove('mermaid-loading');
      div.classList.remove('mermaid-rendering');
      if (!div.querySelector('svg')) {
        div.classList.add('mermaid-error');
        div.setAttribute('role', 'img');
        div.setAttribute('aria-label', '图表解析失败');
        div.innerHTML = '<p>图表暂时无法渲染，原始图示代码仍保留。</p><pre>' +
          escapeDiagramSource(originalSources.get(div) || div.dataset.mermaidSource || '') + '</pre>';
      }
    });
    return renderQueue;
  }

  function renderWanted() {
    // Draw the diagrams the reader is looking at first: each one takes a
    // moment, and the queue is serial.
    var pending = mermaidDivs.filter(function(div) {
      return wanted.has(div) &&
        div.getAttribute('data-processed') !== 'true' &&
        !div.querySelector('svg');
    });
    var middle = window.innerHeight / 2;
    pending.sort(function(a, b) {
      var da = Math.abs(a.getBoundingClientRect().top - middle);
      var db = Math.abs(b.getBoundingClientRect().top - middle);
      return da - db;
    });
    pending.forEach(renderDiagram);
  }

  var libraryPromise = null;
  function loadLibrary() {
    if (!libraryPromise) {
      libraryPromise = ensureMermaid().then(function() {
        initMermaid();
      }).catch(function(err) {
        console.error('Mermaid load failed:', err);
        mermaidDivs.forEach(function(div) {
          div.classList.remove('mermaid-loading');
          if (!div.querySelector('svg')) {
            div.classList.add('mermaid-error');
            div.innerHTML = '<p>图表库加载失败，请检查网络后刷新页面。</p>';
          }
        });
        throw err;
      });
    }
    return libraryPromise.then(renderWanted, function() {});
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      var hit = false;
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        wanted.add(entry.target);
        hit = true;
      });
      if (hit) loadLibrary();
    }, { rootMargin: '600px 0px' });
    mermaidDivs.forEach(function(div) { observer.observe(div); });
  } else {
    // Without an observer there is no way to tell where the reader is, so
    // draw everything as soon as the library is there.
    mermaidDivs.forEach(function(div) { wanted.add(div); });
    loadLibrary();
  }
})();
