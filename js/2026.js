// Guide Card collapsible behavior
(function() {
  document.querySelectorAll('.guide-card-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var table = header.closest('.guide-card');
      table.classList.toggle('collapsed');
    });
  });
})();

// Table of Contents generator - hierarchical with scroll spy & progress
(function() {
  var tocWrap = document.querySelector('.post-toc-wrap');
  var article = document.querySelector('.post-body');
  if (!tocWrap || !article) return;

  var headings = article.querySelectorAll('h2, h3, h4');
  if (headings.length === 0) return;

  var tocItems = [];

  // Collect heading data
  headings.forEach(function(h) {
    if (!h.id) return;
    var level = parseInt(h.tagName[1]);
    var text = h.textContent.trim();
    tocItems.push({ level: level, id: h.id, text: text, el: h });
  });

  // Assign sequential section numbers (e.g. 1, 1.1, 1.1.1)
  var counters = [0, 0, 0, 0];
  tocItems.forEach(function(item) {
    var idx = item.level - 2;
    counters[idx]++;
    for (var k = idx + 1; k < counters.length; k++) counters[k] = 0;
    var parts = [];
    for (var k = 0; k <= idx; k++) {
      if (counters[k] > 0) parts.push(counters[k]);
    }
    item.num = parts.join('.');
  });

  // Progress bar element
  var progressBar = document.createElement('div');
  progressBar.className = 'toc-progress';
  tocWrap.parentNode.insertBefore(progressBar, tocWrap);

  // Build hierarchical HTML
  function renderTOC(items, minLevel) {
    var html = '';
    var i = 0;
    while (i < items.length) {
      var item = items[i];
      if (item.level <= minLevel) break;

      var hasChildren = false;
      var j = i + 1;
      while (j < items.length && items[j].level > item.level) {
        hasChildren = true;
        j++;
      }

      html += '<li class="nav-item nav-level-' + item.level + (hasChildren ? ' has-child' : '') + '">' +
        '<a class="nav-link" href="#' + item.id + '">' +
        '<span class="toc-num">' + item.num + '</span>' +
        '<span class="nav-text">' + item.text + '</span></a>';

      var children = [];
      j = i + 1;
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

  var tocHtml = '<ol class="nav">' + renderTOC(tocItems, 1) + '</ol>';
  tocWrap.innerHTML = '<div class="post-toc motion-element">' + tocHtml + '</div>';

  var tocLinks = tocWrap.querySelectorAll('.nav-link');
  var headingEls = tocItems.map(function(item) { return item.el; });
  var tocAnchors = tocWrap.querySelectorAll('.nav-item');
  var ticking = false;
  var lastActiveIdx = -1;

  // Scroll spy: highlight active heading
  function updateActiveTOC() {
    if (headingEls.length === 0) return;

    var offset = 120;
    var activeIdx = -1;

    for (var i = headingEls.length - 1; i >= 0; i--) {
      var rect = headingEls[i].getBoundingClientRect();
      if (rect.top <= offset) {
        activeIdx = i;
        break;
      }
    }

    // Only update if changed
    if (activeIdx === lastActiveIdx) return;
    lastActiveIdx = activeIdx;

    tocAnchors.forEach(function(li, idx) {
      li.classList.toggle('active', idx === activeIdx);
    });

    // Progress bar: article body total scrollable height
    var articleEl = article;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = Math.max(
      articleEl.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(scrollTop / docHeight * 100, 100) : 0;
    progressBar.style.width = pct + '%';

    // Gently scroll sidebar to keep active item visible (only once per change)
    if (activeIdx >= 0 && tocAnchors[activeIdx]) {
      var parent = tocAnchors[activeIdx].closest('.post-toc-wrap');
      if (parent) {
        var itemTop = tocAnchors[activeIdx].offsetTop;
        var parentScroll = parent.scrollTop;
        var parentHeight = parent.clientHeight;
        if (itemTop < parentScroll || itemTop > parentScroll + parentHeight - 60) {
          tocAnchors[activeIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }

  // Throttled scroll handler
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateActiveTOC();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Smooth scroll to heading on click
  tocLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        var target = document.getElementById(href.substring(1));
        if (target) {
          var top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    });
  });

  // Initial update
  setTimeout(updateActiveTOC, 300);
})();

// Mobile floating TOC button
(function() {
  var wrap = document.querySelector('.post-toc-wrap');
  if (!wrap) return;

  var btn = document.createElement('button');
  btn.className = 'mobile-toc-toggle';
  btn.setAttribute('aria-label', '文章目录');
  btn.innerHTML = '<i class="fa fa-list"></i>';

  var overlay = document.createElement('div');
  overlay.className = 'mobile-toc-overlay';

  var panel = document.createElement('div');
  panel.className = 'mobile-toc-panel';

  var handle = document.createElement('div');
  handle.className = 'mobile-toc-handle';
  handle.innerHTML = '<strong><i class="fa fa-list"></i> 文章目录</strong><button class="mobile-toc-close" aria-label="关闭"><i class="fa fa-times"></i></button>';

  var body = document.createElement('div');
  body.className = 'mobile-toc-body';

  // Clone the sidebar TOC into mobile panel
  var toc = wrap.querySelector('.post-toc');
  if (toc) body.appendChild(toc.cloneNode(true));

  panel.appendChild(handle);
  panel.appendChild(body);
  overlay.appendChild(panel);
  document.body.appendChild(btn);
  document.body.appendChild(overlay);

  // Toggle overlay
  btn.addEventListener('click', function() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeMobileTOC() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeMobileTOC();
  });

  handle.querySelector('.mobile-toc-close').addEventListener('click', closeMobileTOC);

  // Sync mobile TOC active state with desktop
  var desktopObserver = new MutationObserver(function() {
    var activeDesktop = wrap.querySelector('.nav-item.active');
    var mobileItems = body.querySelectorAll('.nav-item');
    var found = false;
    mobileItems.forEach(function(item) {
      var id = item.querySelector('.nav-link')?.getAttribute('href');
      if (id && activeDesktop) {
        var adId = activeDesktop.querySelector('.nav-link')?.getAttribute('href');
        item.classList.toggle('active', adId === id);
        if (adId === id) found = true;
      } else {
        item.classList.remove('active');
      }
    });
  });
  desktopObserver.observe(wrap, { attributes: true, subtree: true, attributeFilter: ['class'] });

  // Click on mobile TOC items closes panel
  body.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      setTimeout(closeMobileTOC, 200);
    });
  });
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
