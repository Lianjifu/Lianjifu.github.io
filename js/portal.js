/* Shared personal-site navigation; the Three.js enhancement is homepage-only. */
(() => {
  "use strict";
  const header = document.querySelector(".portal-header");
  const nav = document.querySelector(".primary-nav");
  const menuButton = document.querySelector(".mobile-toggle");
  const blog = document.querySelector(".blog-disclosure");
  const summary = blog.querySelector("summary");
  const hero = document.querySelector(".hero, .personal-article .post-header");
  const isAbout = document.body.classList.contains("personal-about");
  const isArchives = document.body.classList.contains("personal-archives");
  const isSeries = document.body.matches(".personal-series, .personal-article");
  const isArticle = document.body.classList.contains("personal-article");
  if (isArticle) {
    const toc = document.querySelector('.post-toc-wrap');
    if (toc) document.querySelector('main').append(toc);
  }
  const stage = document.querySelector("#thought-space");
  const motionButton = document.querySelector(".motion-toggle");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 760px)");
  let scene;
  let loading = false;
  let failed = false;
  let userPaused = false;
  let heroVisible = true;
  let scrollFrame = 0;
  let disposed = false;

  document.documentElement.classList.add("portal-enhanced");

  function syncMotion() {
    if (!motionButton) return;
    const running =
      heroVisible &&
      !document.hidden &&
      !userPaused &&
      !reducedMotion.matches &&
      !header.classList.contains("menu-visible");
    if (scene) scene.setRunning(running);
    motionButton.hidden = !scene || reducedMotion.matches || failed;
    motionButton.setAttribute("aria-pressed", String(userPaused));
    motionButton.querySelector(".motion-label").textContent = userPaused
      ? "播放动效"
      : "暂停动效";
  }

  function setMenu(open, returnFocus = false) {
    header.classList.toggle("menu-visible", open);
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "关闭导航菜单" : "打开导航菜单",
    );
    // Inert the content behind the mobile menu; the menu itself is a normal navigation region.
    document.querySelector("main").inert = open;
    document.querySelector("footer").inert = open;
    if (!open) blog.open = false;
    if (returnFocus) menuButton.focus();
    syncMotion();
  }

  menuButton.addEventListener("click", () =>
    setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
  );
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenu(false);
      blog.open = false;
    }
  });
  document.addEventListener("click", (event) => {
    if (!blog.contains(event.target)) blog.open = false;
    if (
      header.classList.contains("menu-visible") &&
      !header.contains(event.target)
    )
      setMenu(false);
  });
  document.addEventListener("focusin", (event) => {
    if (!blog.contains(event.target)) blog.open = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (blog.open) {
        blog.open = false;
        summary.focus();
      } else if (header.classList.contains("menu-visible")) {
        setMenu(false, true);
      }
    }
    if (event.key === "Tab" && header.classList.contains("menu-visible")) {
      const items = [...header.querySelectorAll("a, button, summary")].filter(
        (el) => el.getClientRects().length,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  mobile.addEventListener("change", () => {
    if (!mobile.matches) setMenu(false);
  });

  const sections = ["top", "projects", "blog", "notes"];
  function updateScroll() {
    scrollFrame = 0;
    const progress = Math.min(
      1,
      Math.max(0, window.scrollY / hero.offsetHeight),
    );
    header.classList.toggle(
      "is-scrolled",
      window.scrollY >= hero.offsetHeight - header.offsetHeight,
    );
    if (isArticle) document.body.classList.toggle('article-reading', window.scrollY >= hero.offsetHeight - header.offsetHeight);
    let current = "top";
    sections.slice(1).forEach((id) => {
      if (document.getElementById(id)?.getBoundingClientRect().top <= 160)
        current = id;
    });
    nav.querySelectorAll(".nav-link").forEach((link) => {
      const selected = isAbout
        ? link.getAttribute("href") === "/about/"
        : isArchives || isSeries
          ? link === summary
          : link === summary
            ? current === "blog"
            : link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-current", selected);
      if (selected)
        link.setAttribute(
          "aria-current",
          isAbout || isArchives || isSeries || current === "top"
            ? "page"
            : "location",
        );
      else link.removeAttribute("aria-current");
    });
    if (stage && !reducedMotion.matches) {
      stage.style.opacity = String(1 - progress * 0.7);
      if (scene) scene.setScroll(progress);
    }
  }
  function queueScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll, { passive: true });
  updateScroll();

  // About uses static star artwork and native content, so it never downloads Three.js.
  if (!stage) return;

  const observer = new IntersectionObserver(
    (entries) => {
      heroVisible = entries[0].isIntersecting;
      syncMotion();
      if (heroVisible) loadScene();
    },
    { threshold: 0 },
  );
  observer.observe(hero);
  document.addEventListener("visibilitychange", syncMotion);
  motionButton.addEventListener("click", () => {
    userPaused = !userPaused;
    syncMotion();
  });

  function useFallback(error) {
    failed = true;
    stage.dataset.state = "fallback";
    motionButton.hidden = true;
    console.warn(
      "Thought-space animation unavailable; static artwork remains visible.",
      error,
    );
  }

  async function loadScene() {
    if (
      scene ||
      loading ||
      failed ||
      disposed ||
      reducedMotion.matches ||
      !heroVisible
    )
      return;
    loading = true;
    try {
      const { createThoughtSpace } = await import("/js/thought-space.js?v=1");
      if (disposed || reducedMotion.matches) return;
      scene = createThoughtSpace(stage, { onUnavailable: useFallback });
      stage.dataset.state = "ready";
      updateScroll();
      syncMotion();
    } catch (error) {
      useFallback(error);
    } finally {
      loading = false;
    }
  }
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      if (scene) scene.dispose();
      scene = undefined;
      stage.dataset.state = "static";
      stage.style.opacity = "1";
    } else loadScene();
    syncMotion();
  });
  // Load after the HTML is usable; reduced-motion visitors never need Three.js.
  if ("requestIdleCallback" in window)
    requestIdleCallback(loadScene, { timeout: 1800 });
  else setTimeout(loadScene, 100);
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) {
      if (scene) scene.setRunning(false);
      return;
    }
    disposed = true;
    observer.disconnect();
    cancelAnimationFrame(scrollFrame);
    if (scene) scene.dispose();
  });
  window.addEventListener("pageshow", syncMotion);
})();
