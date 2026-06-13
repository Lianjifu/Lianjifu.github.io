/* global CONFIG */
/* Enhanced local search for LianJiFu'blogs — v4 */

(function () {
  'use strict';

  var SERIES_FILTERS = {
    all: { label: '全部', match: function () { return true; } },
    agent: {
      label: 'Claude Code',
      match: function (url) {
        return /\/claude-code/i.test(url) || /\/2026\/05\/21\/claude-code/i.test(url);
      }
    },
    security: {
      label: 'Security',
      match: function (url) {
        return /observable-security/i.test(url);
      }
    },
    ops: {
      label: 'Ops',
      match: function (url) {
        return /observable-ops/i.test(url);
      }
    }
  };

  var SERIES_COLORS = {
    agent: '#2563eb',
    security: '#ea580c',
    ops: '#059669',
    legacy: '#64748b'
  };

  var QUICK_LINKS = [
    { label: 'Claude Code 第 1 章', href: '/2026/05/21/claude-code-01-overview/', icon: 'fa-code' },
    { label: 'MCP 协议实现', href: '/2026/05/21/claude-code-15-mcp-protocol/', icon: 'fa-plug' },
    { label: 'Agent 模型', href: '/2026/05/21/claude-code-10-agent-model/', icon: 'fa-robot' },
    { label: '安全架构总览', href: '/2026/06/10/observable-security-01-00-intro-brief/', icon: 'fa-shield-alt' },
    { label: '运维产品概述', href: '/2026/06/13/observable-ops-01-01-product-overview/', icon: 'fa-cogs' },
    { label: '文章目录', href: '/archives/', icon: 'fa-list' }
  ];

  var SEARCH_DEBOUNCE_MS = 200;
  var MAX_SNIPPETS = 3;
  var TOTAL_ARTICLES = 0;
  var seenUrls = {};

  function loadStylesheet() {
    if (document.querySelector('link[data-search-css]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/search.css?v=4';
    link.setAttribute('data-search-css', '1');
    document.head.appendChild(link);
  }

  function detectSeries(url) {
    if (SERIES_FILTERS.agent.match(url)) return 'agent';
    if (SERIES_FILTERS.security.match(url)) return 'security';
    if (SERIES_FILTERS.ops.match(url)) return 'ops';
    return 'legacy';
  }

  function seriesBadge(series) {
    var labels = {
      agent: 'Claude Code',
      security: 'Security',
      ops: 'Ops',
      legacy: 'Archive'
    };
    return '<span class="search-result-badge search-result-badge--' + series + '">' + labels[series] + '</span>';
  }

  function countByFilter(datas) {
    var counts = { all: 0, agent: 0, security: 0, ops: 0, legacy: 0 };
    datas.forEach(function (d) {
      var s = detectSeries(d.url);
      counts[s] = (counts[s] || 0) + 1;
      counts.all++;
    });
    return counts;
  }

  function enhancePopupDOM(overlay) {
    overlay.classList.add('search-enhanced');

    var popup = overlay.querySelector('.search-popup');
    if (!popup || popup.querySelector('.search-toolbar')) return;

    var header = popup.querySelector('.search-header');
    if (header) {
      var icon = header.querySelector('.search-icon');
      var inputContainer = header.querySelector('.search-input-container');
      var closeBtn = header.querySelector('.popup-btn-close');
      var input = header.querySelector('.search-input');

      // Add clear button inside input container
      if (inputContainer && input) {
        var clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'search-input-clear';
        clearBtn.innerHTML = '<i class="fa fa-times-circle"></i>';
        clearBtn.setAttribute('aria-label', '清除搜索');
        clearBtn.style.display = 'none';
        inputContainer.appendChild(clearBtn);

        input.addEventListener('input', function () {
          clearBtn.style.display = this.value ? 'flex' : 'none';
        });
        clearBtn.addEventListener('click', function () {
          input.value = '';
          input.focus();
          clearBtn.style.display = 'none';
          runSearch();
        });
      }

      var top = document.createElement('div');
      top.className = 'search-header-top';
      top.innerHTML = '<h2 class="search-header-title">搜索文章</h2><span class="search-header-hint"><kbd>/</kbd> 或 <kbd>⌘K</kbd> 打开</span>';

      var row = document.createElement('div');
      row.className = 'search-input-row';

      if (inputContainer) {
        if (icon) inputContainer.insertBefore(icon, inputContainer.firstChild);
        row.appendChild(inputContainer);
      }
      if (closeBtn) row.appendChild(closeBtn);

      header.textContent = '';
      header.appendChild(top);
      header.appendChild(row);

      if (input) {
        input.placeholder = '搜索标题或正文… 如 Agent、MCP、威胁狩猎';
        input.setAttribute('aria-label', '搜索文章');
      }
    }

    var toolbar = document.createElement('div');
    toolbar.className = 'search-toolbar';
    toolbar.innerHTML =
      '<div class="search-filters" role="tablist" aria-label="系列筛选">' +
      Object.keys(SERIES_FILTERS).map(function (key) {
        var active = key === 'all' ? ' is-active' : '';
        return '<button type="button" class="search-filter-btn' + active + '" data-filter="' + key + '"><span class="search-filter-label">' + SERIES_FILTERS[key].label + '</span><span class="search-filter-count" data-filter-count="' + key + '"></span></button>';
      }).join('') +
      '</div>' +
      '<div class="search-stats" id="search-stats" aria-live="polite">输入关键词开始搜索</div>';

    var footer = document.createElement('div');
    footer.className = 'search-footer';
    footer.innerHTML = '<span><kbd>↑</kbd><kbd>↓</kbd> 选择 · <kbd>Enter</kbd> 打开 · <kbd>Esc</kbd> 关闭</span><span class="search-footer-total">86 篇索引</span>';

    var result = popup.querySelector('#search-result');
    if (result) {
      result.parentNode.insertBefore(toolbar, result);
      popup.appendChild(footer);
    }
  }

  function renderIdleState(container) {
    container.innerHTML =
      '<div id="no-result">' +
      '<i class="fa fa-search fa-3x"></i>' +
      '<p class="search-empty-title">搜索 ' + TOTAL_ARTICLES + ' 篇深度长文</p>' +
      '<p class="search-empty-desc">支持标题与正文关键词，可按系列筛选 Claude Code、Security、Ops。</p>' +
      '<div class="search-suggestions">' +
      QUICK_LINKS.map(function (item) {
        return '<a class="search-suggestion" href="' + item.href + '"><i class="fa ' + item.icon + '"></i> ' + item.label + '</a>';
      }).join('') +
      '</div></div>';
  }

  function renderEmptyState(container, query, onClearFilter) {
    container.innerHTML =
      '<div id="no-result">' +
      '<i class="far fa-frown fa-3x"></i>' +
      '<p class="search-empty-title">未找到「' + escapeHtml(query) + '」</p>' +
      '<p class="search-empty-desc">试试更短的关键词，或切换系列筛选。也可浏览目录页按章节阅读。</p>' +
      '<div class="search-suggestions">' +
      '<a class="search-suggestion" href="/archives/"><i class="fa fa-list"></i> 查看全部目录</a>' +
      '<button type="button" class="search-suggestion" data-clear-filter><i class="fa fa-filter"></i> 清除系列筛选</button>' +
      '</div></div>';

    var clearBtn = container.querySelector('[data-clear-filter]');
    if (clearBtn && onClearFilter) clearBtn.addEventListener('click', onClearFilter);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadStylesheet();

    var isfetched = false;
    var isFetching = false;
    var datas = [];
    var isXml = true;
    var activeFilter = 'all';
    var activeResultIndex = -1;

    var searchPath = CONFIG.path;
    if (searchPath.length === 0) {
      searchPath = 'search.xml';
    } else if (searchPath.endsWith('json')) {
      isXml = false;
    }

    var overlay = document.querySelector('.search-pop-overlay');
    if (overlay) enhancePopupDOM(overlay);

    var input = document.querySelector('.search-input');
    var resultContent = document.getElementById('search-result');
    var statsEl = document.getElementById('search-stats');

    if (!input || !resultContent || !overlay) return;

    function updateStats(text) {
      if (statsEl) statsEl.textContent = text;
    }

    function updateFilterCounts() {
      var counts = countByFilter(datas);
      document.querySelectorAll('[data-filter-count]').forEach(function (el) {
        var key = el.getAttribute('data-filter-count');
        var c = counts[key] || 0;
        el.textContent = c;
      });
      var totalEl = document.querySelector('.search-footer-total');
      if (totalEl) totalEl.textContent = TOTAL_ARTICLES + ' 篇索引';
    }

    // Simple debounce
    function debounce(fn, ms) {
      var timer = null;
      return function () {
        var ctx = this, args = arguments;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
      };
    }

    var debouncedSearch = debounce(runSearch, SEARCH_DEBOUNCE_MS);

    function getIndexByWord(word, text) {
      if (CONFIG.localsearch.unescape) {
        var div = document.createElement('div');
        div.innerText = word;
        word = div.innerHTML;
      }
      var wordLen = word.length;
      if (wordLen === 0) return [];
      var startPosition = 0;
      var position;
      var index = [];
      text = text.toLowerCase();
      word = word.toLowerCase();
      while ((position = text.indexOf(word, startPosition)) > -1) {
        index.push({ position: position, word: word });
        startPosition = position + wordLen;
      }
      return index;
    }

    function mergeIntoSlice(start, end, index, searchText) {
      var item = index[index.length - 1];
      var position = item.position;
      var word = item.word;
      var hits = [];
      var searchTextCountInSlice = 0;
      while (position + word.length <= end && index.length !== 0) {
        if (word === searchText) searchTextCountInSlice++;
        hits.push({ position: position, length: word.length });
        var wordEnd = position + word.length;
        index.pop();
        while (index.length !== 0) {
          item = index[index.length - 1];
          position = item.position;
          word = item.word;
          if (wordEnd > position) index.pop();
          else break;
        }
      }
      return { hits: hits, start: start, end: end, searchTextCount: searchTextCountInSlice };
    }

    function highlightKeyword(text, slice) {
      var result = '';
      var prevEnd = slice.start;
      slice.hits.forEach(function (hit) {
        result += text.substring(prevEnd, hit.position);
        var end = hit.position + hit.length;
        result += '<b class="search-keyword">' + text.substring(hit.position, end) + '</b>';
        prevEnd = end;
      });
      result += text.substring(prevEnd, slice.end);
      return result;
    }

    function scoreItem(title, content, keywords, searchText) {
      var titleLower = title.toLowerCase();
      var contentLower = content.toLowerCase();
      var score = 0;
      keywords.forEach(function (keyword) {
        if (!keyword) return;
        if (titleLower.indexOf(keyword) === 0) score += 120;
        else if (titleLower.indexOf(keyword) > -1) score += 80;
        if (contentLower.indexOf(keyword) > -1) score += 20;
      });
      if (titleLower.indexOf(searchText) > -1) score += 40;
      return score;
    }

    function setActiveResult(index) {
      var items = resultContent.querySelectorAll('.search-result-list > li');
      if (!items.length) return;
      activeResultIndex = Math.max(0, Math.min(index, items.length - 1));
      items.forEach(function (el, i) {
        el.classList.toggle('is-active', i === activeResultIndex);
      });
      items[activeResultIndex].scrollIntoView({ block: 'nearest' });
    }

    function clearFilterAndSearch() {
      activeFilter = 'all';
      document.querySelectorAll('.search-filter-btn').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-filter') === 'all');
      });
      runSearch();
    }

    function runSearch() {
      if (!isfetched) return;

      var searchText = input.value.trim().toLowerCase();
      var keywords = searchText.split(/[-\s]+/).filter(Boolean);
      if (keywords.length > 1) keywords.push(searchText);

      if (searchText.length === 0) {
        renderIdleState(resultContent);
        updateStats('输入关键词开始搜索');
        activeResultIndex = -1;
        return;
      }

      var startTime = performance.now();
      var resultItems = [];
      var filterFn = SERIES_FILTERS[activeFilter] ? SERIES_FILTERS[activeFilter].match : SERIES_FILTERS.all.match;

      datas.forEach(function (data) {
        var title = data.title;
        var content = data.content;
        var url = data.url;
        if (!filterFn(url)) return;

        var titleInLowerCase = title.toLowerCase();
        var contentInLowerCase = content.toLowerCase();
        var indexOfTitle = [];
        var indexOfContent = [];
        keywords.forEach(function (keyword) {
          indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, titleInLowerCase));
          indexOfContent = indexOfContent.concat(getIndexByWord(keyword, contentInLowerCase));
        });

        if (indexOfTitle.length === 0 && indexOfContent.length === 0) return;

        var hitCount = indexOfTitle.length + indexOfContent.length;
        [indexOfTitle, indexOfContent].forEach(function (index) {
          index.sort(function (a, b) {
            if (b.position !== a.position) return b.position - a.position;
            return a.word.length - b.word.length;
          });
        });

        var slicesOfTitle = [];
        if (indexOfTitle.length !== 0) {
          slicesOfTitle.push(mergeIntoSlice(0, title.length, indexOfTitle, searchText));
        }

        var slicesOfContent = [];
        var contentIndexCopy = indexOfContent.slice();
        while (contentIndexCopy.length !== 0) {
          var hit = contentIndexCopy[contentIndexCopy.length - 1];
          var pos = hit.position;
          var start = Math.max(0, pos - 40);
          var end = Math.min(content.length, pos + 120);
          slicesOfContent.push(mergeIntoSlice(start, end, contentIndexCopy, searchText));
        }

        slicesOfContent.sort(function (a, b) {
          if (a.searchTextCount !== b.searchTextCount) return b.searchTextCount - a.searchTextCount;
          if (a.hits.length !== b.hits.length) return b.hits.length - a.hits.length;
          return a.start - b.start;
        });

        var upperBound = parseInt(CONFIG.localsearch.top_n_per_article, 10);
        if (upperBound >= 0) slicesOfContent = slicesOfContent.slice(0, Math.max(upperBound, MAX_SNIPPETS));

        var series = detectSeries(url);
        var resultItem = '<li data-url="' + url + '">';
        if (slicesOfTitle.length !== 0) {
          resultItem += '<a href="' + url + '" class="search-result-title"><span>' + highlightKeyword(title, slicesOfTitle[0]) + '</span>' + seriesBadge(series) + '</a>';
        } else {
          resultItem += '<a href="' + url + '" class="search-result-title"><span>' + escapeHtml(title) + '</span>' + seriesBadge(series) + '</a>';
        }
        slicesOfContent.forEach(function (slice) {
          resultItem += '<p class="search-result">' + highlightKeyword(content, slice) + '…</p>';
        });
        resultItem += '</li>';

        resultItems.push({
          item: resultItem,
          score: scoreItem(title, content, keywords, searchText) + hitCount,
          hitCount: hitCount
        });
      });

      var elapsed = Math.max(1, Math.round(performance.now() - startTime));

      if (resultItems.length === 0) {
        renderEmptyState(resultContent, searchText, clearFilterAndSearch);
        updateStats('0 条结果 · ' + elapsed + ' ms');
        activeResultIndex = -1;
        return;
      }

      resultItems.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.hitCount - a.hitCount;
      });

      resultContent.innerHTML = '<ul class="search-result-list">' + resultItems.map(function (r) { return r.item; }).join('') + '</ul>';
      updateStats(resultItems.length + ' 条结果 · ' + elapsed + ' ms');
      activeResultIndex = 0;
      setActiveResult(0);
      window.pjax && window.pjax.refresh(resultContent);
    }

    function normalizeEntry(data) {
      if (!data || !data.title) return null;
      data.title = data.title.trim();
      if (!data.title) return null;
      data.content = data.content ? data.content.trim().replace(/<[^>]+>/g, '') : '';
      data.url = decodeURIComponent(data.url || '').replace(/\/{2,}/g, '/');
      return data.url ? data : null;
    }

    function parseSearchIndex(res) {
      var entries;
      if (isXml) {
        var doc = new DOMParser().parseFromString(res, 'text/xml');
        if (doc.querySelector('parsererror')) {
          throw new Error('search index xml parse error');
        }
        entries = [].slice.call(doc.querySelectorAll('entry')).map(function (element) {
          var titleEl = element.querySelector('title');
          var contentEl = element.querySelector('content');
          var urlEl = element.querySelector('url');
          if (!titleEl || !urlEl) return null;
          return {
            title: titleEl.textContent,
            content: contentEl ? contentEl.textContent : '',
            url: urlEl.textContent
          };
        }).map(normalizeEntry).filter(Boolean);
      } else {
        entries = JSON.parse(res).map(normalizeEntry).filter(Boolean);
      }
      // Dedup by URL
      seenUrls = {};
      entries = entries.filter(function (e) {
        if (seenUrls[e.url]) return false;
        seenUrls[e.url] = true;
        return true;
      });
      TOTAL_ARTICLES = entries.length;
      return entries;
    }

    function fetchData() {
      if (isfetched || isFetching) return;
      isFetching = true;

      var indexUrl = CONFIG.root + searchPath + '?v=3';

      fetch(indexUrl)
        .then(function (response) {
          if (!response.ok) throw new Error('search index fetch failed');
          return response.text();
        })
        .then(function (res) {
          datas = parseSearchIndex(res);
          isfetched = true;
          updateFilterCounts();
          if (!input.value.trim()) renderIdleState(resultContent);
          runSearch();
        })
        .catch(function () {
          isfetched = false;
          datas = [];
          resultContent.innerHTML = '<div id="no-result"><p class="search-empty-title">搜索索引加载失败</p><p class="search-empty-desc">请刷新页面后重试，或直接浏览<a href="/archives/">文章目录</a>。</p></div>';
          updateStats('索引不可用');
        })
        .finally(function () {
          isFetching = false;
        });
    }

    if (CONFIG.localsearch.preload) {
      fetchData();
    } else if ('requestIdleCallback' in window) {
      requestIdleCallback(function () { fetchData(); }, { timeout: 3000 });
    }

    if (CONFIG.localsearch.trigger === 'auto') {
      input.addEventListener('input', debouncedSearch);
    } else {
      var searchIcon = document.querySelector('.search-icon');
      if (searchIcon) searchIcon.addEventListener('click', runSearch);
      input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') runSearch();
      });
    }

    document.querySelectorAll('.search-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFilter = btn.getAttribute('data-filter') || 'all';
        document.querySelectorAll('.search-filter-btn').forEach(function (el) {
          el.classList.toggle('is-active', el === btn);
        });
        runSearch();
      });
    });

    function renderLoadingState(container) {
      container.innerHTML =
        '<div id="no-result">' +
        '<i class="fa fa-spinner fa-spin fa-2x"></i>' +
        '<p class="search-empty-title">正在加载搜索索引…</p>' +
        '<p class="search-empty-desc">' + TOTAL_ARTICLES + ' 篇文章 · 首次打开需稍候</p>' +
        '</div>';
      updateStats('加载中…');
    }

    function openSearchOverlay() {
      document.body.style.overflow = 'hidden';
      overlay.classList.add('search-active');
      input.focus();
      input.select();
      if (!isfetched) {
        renderLoadingState(resultContent);
        fetchData();
      } else if (!input.value.trim()) {
        renderIdleState(resultContent);
      }
    }

    function closeSearchOverlay() {
      document.body.style.overflow = '';
      overlay.classList.remove('search-active');
      activeResultIndex = -1;
    }

    document.querySelectorAll('.popup-trigger').forEach(function (element) {
      element.addEventListener('click', openSearchOverlay);
    });

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeSearchOverlay();
    });

    var closeBtn = document.querySelector('.popup-btn-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSearchOverlay);
    window.addEventListener('pjax:success', closeSearchOverlay);

    document.addEventListener('keydown', function (event) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);

      if ((event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) && !inField) {
        event.preventDefault();
        openSearchOverlay();
        return;
      }

      if (!overlay.classList.contains('search-active')) return;

      if (event.key === 'Escape') {
        closeSearchOverlay();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveResult(activeResultIndex + 1);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveResult(activeResultIndex <= 0 ? 0 : activeResultIndex - 1);
        return;
      }

      if (event.key === 'Enter' && activeResultIndex >= 0 && inField && event.target === input) {
        var activeItem = resultContent.querySelectorAll('.search-result-list > li')[activeResultIndex];
        if (activeItem) {
          var href = activeItem.getAttribute('data-url');
          if (href) window.location.href = href;
        }
      }
    });

    window.siteSearch = {
      open: openSearchOverlay,
      close: closeSearchOverlay,
      refresh: runSearch
    };
  });
})();
