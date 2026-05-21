// Guide Card collapsible behavior
(function() {
  document.querySelectorAll('.guide-card-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var table = header.closest('.guide-card');
      table.classList.toggle('collapsed');
    });
  });
})();

// Table of Contents generator - hierarchical numbering
(function() {
  var tocWrap = document.querySelector('.post-toc-wrap');
  var article = document.querySelector('.post-body');
  if (!tocWrap || !article) return;

  var headings = article.querySelectorAll('h2, h3, h4');
  if (headings.length === 0) return;

  // Build hierarchical TOC: walk headings and nest by level
  function renderTOC(items, minLevel) {
    var html = '';
    var i = 0;
    while (i < items.length) {
      var item = items[i];
      if (item.level <= minLevel) {
        break; // return control to parent
      }
      html += '<li class="nav-item nav-level-' + item.level + '">' +
        '<a class="nav-link" href="#' + item.id + '">' +
        '<span class="nav-text">' + item.text + '</span></a>';

      // Collect children (next headings at deeper level)
      var children = [];
      var j = i + 1;
      while (j < items.length && items[j].level > item.level) {
        children.push(items[j]);
        j++;
      }
      i = j;

      if (children.length > 0) {
        html += '<ol class="nav-child">' + renderTOC(children, item.level) + '</ol>';
      }
      html += '</li>';
    }
    return html;
  }

  // Convert NodeList to array and filter
  var items = [];
  headings.forEach(function(h) {
    if (!h.id) return;
    items.push({
      level: parseInt(h.tagName[1]),
      id: h.id,
      text: h.textContent.trim()
    });
  });

  var html = '<ol class="nav">' + renderTOC(items, 1) + '</ol>';

  tocWrap.innerHTML = '<div class="post-toc motion-element">' + html + '</div>';
})();

// Mermaid: wait for async-loaded library, then render
(function() {
  var mermaidDivs = document.querySelectorAll('.mermaid');
  if (mermaidDivs.length === 0) return;

  function initMermaid() {
    if (typeof mermaid === 'undefined') {
      setTimeout(initMermaid, 200);
      return;
    }
    try {
      mermaid.initialize({
        startOnLoad: false, theme: 'base',
        themeVariables: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          primaryColor: '#ffffff', primaryTextColor: '#1e293b', primaryBorderColor: '#e2e8f0',
          lineColor: '#64748b', secondaryColor: '#f1f5f9', tertiaryColor: '#f8fafc',
        },
        securityLevel: 'loose',
        flowchart: { curve: 'basis', padding: 15, nodeSpacing: 50, rankSpacing: 80 },
        maxTextSize: 50000,
      });
      mermaid.run({ querySelector: '.mermaid' }).then(function() {
        mermaidDivs.forEach(wrapZoomable);
      });
    } catch(e) {
      console.error('Mermaid error:', e);
    }
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

  initMermaid();
})();
