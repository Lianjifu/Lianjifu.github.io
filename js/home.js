(function () {
  'use strict';

  function openSearch() {
    if (window.siteSearch && typeof window.siteSearch.open === 'function') {
      window.siteSearch.open();
      return;
    }
    var trigger = document.querySelector('.site-nav .popup-trigger, .site-nav-right .popup-trigger');
    if (trigger) trigger.click();
  }

  var searchBtn = document.getElementById('home-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function (event) {
      event.preventDefault();
      openSearch();
    });
  }

  var aboutSearchBtn = document.getElementById('about-search-btn');
  if (aboutSearchBtn) {
    aboutSearchBtn.addEventListener('click', function (event) {
      event.preventDefault();
      openSearch();
    });
  }

  function syncBusuanziDisplay() {
    ['site_uv', 'site_pv'].forEach(function (key) {
      var valueEl = document.getElementById('busuanzi_value_' + key);
      if (!valueEl) return;
      var text = (valueEl.textContent || '').trim();
      if (!text || text === '—') return;
      valueEl.textContent = text;
    });

    var visitors = document.getElementById('home-footer-visitors');
    if (!visitors) return;

    var uv = document.getElementById('busuanzi_value_site_uv');
    var pv = document.getElementById('busuanzi_value_site_pv');
    var uvText = uv && (uv.textContent || '').trim();
    var pvText = pv && (pv.textContent || '').trim();
    var uvReady = uvText && uvText !== '—';
    var pvReady = pvText && pvText !== '—';

    if (!uvReady && !pvReady) {
      visitors.style.display = 'none';
    }
  }

  if (document.body.classList.contains('page-home') || document.body.classList.contains('page-about') || document.body.classList.contains('page-archives')) {
    window.setTimeout(syncBusuanziDisplay, 2500);
    window.setTimeout(syncBusuanziDisplay, 6000);
  }
})();
