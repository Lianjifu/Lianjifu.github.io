/* Article pages use the shared portal header while preserving NexT article content. */
(() => {
  const header = document.querySelector(".portal-header");
  const button = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".primary-nav");
  if (!header || !button || !nav) return;
  button.addEventListener("click", () => {
    const open = header.classList.toggle("menu-visible");
    document.body.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      header.classList.remove("menu-visible");
      document.body.classList.remove("menu-open");
      button.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      header.classList.remove("menu-visible");
      document.body.classList.remove("menu-open");
      button.setAttribute("aria-expanded", "false");
      button.focus();
    }
  });
})();
