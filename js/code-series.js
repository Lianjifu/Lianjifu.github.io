/* Native chapter anchors work without JavaScript; this adds position feedback. */
(() => {
  const sections = [...document.querySelectorAll(".code-chapter")];
  const links = [...document.querySelectorAll(".chapter-link")];
  const picker = document.querySelector(".code-picker");
  const label = document.querySelector("#current-chapter");
  let frame = 0;
  function update() {
    frame = 0;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 175) active = section;
    }
    for (const link of links) {
      if (link.hash === "#" + active.id)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    label.textContent = active.querySelector("h2").textContent;
  }
  function queue() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  links.forEach((link) =>
    link.addEventListener("click", () => {
      const wasOpen = picker.open;
      picker.open = false;
      // Move focus out of the collapsed picker to the selected chapter.
      if (wasOpen) {
        const heading = document.querySelector(link.hash + " h2");
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
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
