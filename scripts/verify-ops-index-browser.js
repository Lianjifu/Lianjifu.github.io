// Run with playwright-cli run-code --filename=scripts/verify-ops-index-browser.js.
async (page) => {
  const base = 'http://127.0.0.1:4000';
  const failures = [], errors = [], results = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const measure = () => {
    const get = selector => document.querySelector(selector);
    const box = selector => get(selector).getBoundingClientRect();
    const style = selector => getComputedStyle(get(selector));
    return {
      contentTop: box('.agent-hero-content').top,
      headerBottom: box('.portal-header').bottom,
      padding: style('.hero').paddingTop,
      font: style('.hero h1').fontSize,
      introWidth: style('.agent-intro').maxWidth,
      orbitPosition: style('.agent-orbits').position,
      orbitTop: style('.agent-orbits').top,
      orbitRight: style('.agent-orbits').right,
      grid: style('.code-layout').gridTemplateColumns,
      sidebar: style('.code-sidebar').display,
      picker: style('.code-picker').display,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      countInsideHero: box('.agent-count').bottom <= box('.hero').bottom,
      links: [...document.querySelectorAll('.code-entries a')].map(a => a.pathname)
    };
  };
  for (const width of [320, 390, 768, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/categories/observable-security/');
    const reference = await page.evaluate(measure);
    await page.goto(base + '/categories/observable-ops/');
    const actual = await page.evaluate(measure);
    if (actual.contentTop < actual.headerBottom + 24) failures.push({ width, issue: 'hero overlaps navigation' });
    if (actual.orbitPosition !== 'absolute') failures.push({ width, issue: 'orbit is in document flow' });
    if (actual.overflow || !actual.countInsideHero) failures.push({ width, issue: 'content escapes page or hero' });
    for (const key of ['contentTop', 'padding', 'font', 'introWidth', 'orbitPosition', 'orbitTop', 'orbitRight', 'grid', 'sidebar', 'picker']) {
      if (actual[key] !== reference[key]) failures.push({ width, key, actual: actual[key], reference: reference[key] });
    }
    if (new Set(actual.links).size !== 27 || actual.links.length !== 27) failures.push({ width, issue: 'article inventory' });
    results.push({ width, contentTop: actual.contentTop, headerBottom: actual.headerBottom });
  }
  const rows = await (await page.request.get(base + '/docs/article-manifest.json')).json();
  const expected = rows.filter(row => row.series === 'observable-ops').map(row => row.url);
  const links = await page.locator('.code-entries a').evaluateAll(nodes => nodes.map(a => a.pathname));
  if (JSON.stringify(links) !== JSON.stringify(expected)) failures.push({ issue: 'article order differs from manifest' });
  for (const link of links) if (!(await page.request.get(base + link)).ok()) failures.push({ issue: 'broken article', link });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/categories/observable-ops/');
  await page.locator('.code-picker summary').click();
  await page.locator('.code-picker a[href="#chapter-2"]').click();
  if (await page.locator('.code-picker').evaluate(el => el.open)) failures.push({ issue: 'picker stays open after selection' });
  await page.waitForFunction(() => document.querySelector('#current-chapter').textContent.includes('功能逻辑'));
  await page.locator('.code-picker summary').click();
  await page.keyboard.press('Escape');
  if (await page.locator('.code-picker').evaluate(el => el.open)) failures.push({ issue: 'escape does not close picker' });
  await page.goto(base + '/categories/observable-ops/');
  await page.screenshot({ path: 'output/playwright/ops-index-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/categories/observable-ops/');
  await page.screenshot({ path: 'output/playwright/ops-index-desktop.png' });
  const context = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJS = await context.newPage();
  await noJS.goto(base + '/categories/observable-ops/');
  await noJS.locator('.code-picker summary').click();
  if (!await noJS.locator('.code-picker a').first().isVisible()) failures.push({ issue: 'no JS chapter links hidden' });
  await context.close();
  if (failures.length || errors.length) throw new Error(JSON.stringify({ failures, errors, results }));
  return { results, articles: links.length, failures, errors, interactions: 'chapter selection, Escape, no-JS directory' };
}
