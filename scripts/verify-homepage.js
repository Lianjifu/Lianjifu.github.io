/* Run with playwright-cli run-code --filename=scripts/verify-homepage.js after opening the local site. */
async (page) => {
  const base = 'http://127.0.0.1:4000';
  const results = [];
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
    results.push(message);
  };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'ready');
  check(await page.locator('canvas').count() === 1, 'Three.js creates one canvas');
  check(await page.locator('.search-popup, .popup-trigger, input[type=search]').count() === 0, 'Homepage contains no search controls');
  await page.keyboard.press('/');
  check(await page.locator('[role=dialog]').count() === 0, 'Search shortcut does not open a dialog');
  await page.locator('.blog-disclosure summary').click();
  check(await page.locator('.blog-disclosure').getAttribute('open') !== null, 'Blog menu opens');
  check(await page.locator('.blog-panel-grid a').count() === 4, 'Blog menu contains four real series');
  await page.keyboard.press('Escape');
  check(await page.locator('.blog-disclosure').getAttribute('open') === null, 'Escape closes blog menu');
  check(await page.locator('summary').evaluate(el => el === document.activeElement), 'Escape restores summary focus');
  await page.locator('.blog-disclosure summary').click();
  await page.locator('h1').click();
  check(await page.locator('.blog-disclosure').getAttribute('open') === null, 'Outside click closes blog menu');
  await page.getByRole('button', { name: '暂停动效' }).click();
  check(await page.locator('#thought-space').getAttribute('data-animating') === 'false', 'User pause stops rendering');
  await page.getByRole('button', { name: '播放动效' }).click();
  check(await page.locator('#thought-space').getAttribute('data-animating') === 'true', 'User resume restarts rendering');
  await page.locator('.hero-actions a').first().click();
  await page.waitForFunction(() => document.querySelector('#thought-space').dataset.animating === 'false');
  check(await page.locator('#site-header').evaluate(el => el.classList.contains('is-scrolled')), 'Navigation changes after leaving the hero');
  await page.waitForFunction(() => document.querySelector('.primary-nav a[href="#projects"]').getAttribute('aria-current') === 'location');
  check(true, 'Project anchor highlights current section');
  await page.screenshot({ path: 'output/playwright/home-projects.png' });
  await page.locator('.primary-nav a[href="#top"]').click();
  await page.waitForFunction(() => scrollY < 5 && document.querySelector('#thought-space').dataset.animating === 'true');

  for (const [width, height] of [[1920,1080], [2560,1440], [3440,1440], [1024,768], [768,1024], [390,844], [320,740]]) {
    await page.setViewportSize({width,height});
    await page.waitForFunction(() => document.documentElement.clientWidth === innerWidth);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}px`);
    check(await page.locator('h1').isVisible(), `Hero heading visible at ${width}px`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'ready');
  await page.screenshot({path:'output/playwright/home-mobile.png', fullPage:true});
  await page.getByRole('button', {name:'打开导航菜单'}).click();
  check(await page.locator('main').evaluate(el => el.inert), 'Mobile menu makes background inert');
  check(await page.locator('#thought-space').getAttribute('data-animating') === 'false', 'Mobile menu pauses rendering');
  await page.locator('.blog-disclosure summary').click();
  await page.screenshot({path:'output/playwright/home-mobile-menu.png'});
  await page.keyboard.press('Escape');
  check(await page.getByRole('button', {name:'关闭导航菜单'}).isVisible(), 'First Escape closes nested blog panel');
  await page.keyboard.press('Escape');
  check(await page.getByRole('button', {name:'打开导航菜单'}).evaluate(el => el === document.activeElement), 'Second Escape closes mobile menu and restores focus');
  check(await page.locator('main').evaluate(el => !el.inert), 'Closing mobile menu restores content access');
  await page.getByRole('button', {name:'打开导航菜单'}).click();
  await page.locator('.nav-github').focus();
  await page.keyboard.press('Tab');
  check(await page.locator('.wordmark').evaluate(el => el === document.activeElement), 'Mobile menu traps forward keyboard focus');
  await page.keyboard.press('Shift+Tab');
  check(await page.locator('.nav-github').evaluate(el => el === document.activeElement), 'Mobile menu traps reverse keyboard focus');
  await page.locator('.primary-nav a[href="#notes"]').click();
  await page.waitForFunction(() => !document.body.classList.contains('menu-open') && document.querySelector('#notes').getBoundingClientRect().top < 120);
  check(await page.locator('main').evaluate(el => !el.inert), 'Mobile section link navigates and closes menu');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'ready');
  await page.screenshot({path:'output/playwright/home-desktop.png'});
  await page.screenshot({path:'output/playwright/home-full.png',fullPage:true});
  check(errors.length === 0, 'No uncaught browser errors in normal navigation');

  const browser = page.context().browser();
  const reduced = await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
  try {
    const p = await reduced.newPage();
    await p.goto(base);
    await p.waitForLoadState('networkidle');
    check(await p.locator('canvas').count() === 0, 'Reduced motion avoids creating a canvas');
    check(await p.evaluate(() => !performance.getEntriesByType('resource').some(r => r.name.includes('/lib/three/'))), 'Reduced motion avoids downloading Three.js');
    await p.screenshot({path:'output/playwright/home-reduced-motion.png'});
    await p.emulateMedia({reducedMotion:'no-preference'});
    await p.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'ready');
    await p.emulateMedia({reducedMotion:'reduce'});
    await p.waitForFunction(() => document.querySelectorAll('canvas').length === 0);
    check(await p.locator('#thought-space').getAttribute('data-state') === 'static', 'Changing motion preference disposes renderer and restores artwork');
  } finally { await reduced.close(); }

  const noJS = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {
    const p = await noJS.newPage();
    await p.goto(base);
    check(await p.locator('.primary-nav a[href="#projects"]').isVisible(), 'No-JavaScript mobile navigation remains visible');
    await p.locator('summary').click();
    check(await p.locator('.blog-panel').isVisible(), 'Native blog disclosure works without JavaScript');
    check(await p.getByRole('heading',{level:1}).isVisible(), 'No-JavaScript content remains readable');
    check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No-JavaScript mobile layout has no overflow');
  } finally { await noJS.close(); }

  const blocked = await browser.newContext({viewport:{width:1440,height:1000}});
  try {
    const p = await blocked.newPage();
    await p.route('**/lib/three/**', route => route.abort());
    await p.goto(base);
    await p.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'fallback');
    check(await p.locator('.space-fallback').evaluate(el => el.complete && el.naturalWidth > 0), 'Failed module download retains loaded fallback image');
    check(await p.locator('.hero-actions a').first().isVisible(), 'Failed module download does not block primary action');
  } finally { await blocked.close(); }

  const noGL = await browser.newContext();
  try {
    const p = await noGL.newPage();
    await p.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(kind,...args) {
        if (kind.includes('webgl')) return null;
        return original.call(this,kind,...args);
      };
    });
    await p.goto(base);
    await p.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'fallback');
    check(await p.locator('canvas').count() === 0, 'Unavailable WebGL falls back without leaving a broken canvas');
  } finally { await noGL.close(); }

  await page.bringToFront();
  await page.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'fallback');
  check(await page.locator('canvas').count() === 0, 'Context loss disposes renderer and falls back');
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('#thought-space').dataset.state === 'ready');
  return {passed:results.length,results};
}
