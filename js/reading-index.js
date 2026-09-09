/* All chapters remain in HTML; navigation only enhances native anchor links. */
(() => {
  const sections = [...document.querySelectorAll(".archive-series-section")];
  const links = [...document.querySelectorAll(".topic-link")];
  const picker = document.querySelector(".topic-mobile");
  let frame = 0;
  function update() {
    frame = 0;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 195) active = section;
    }
    for (const link of links) {
      const selected = link.hash === "#" + active.id;
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    document.querySelector("#current-topic").textContent =
      active.querySelector("h2").textContent;
  }
  function queue() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  links.forEach((link) =>
    link.addEventListener("click", () => {
      picker.open = false;
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && picker.open) {
      picker.open = false;
      picker.querySelector("summary").focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!picker.contains(event.target)) picker.open = false;
  });
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  update();
})();
