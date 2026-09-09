async(page)=>{
 const base='http://127.0.0.1:4000';await page.goto(base+'/docs/article-manifest.json');const rows=await (await page.request.get(base+'/docs/article-manifest.json')).json();
 const errors=[],failures=[];page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));await page.emulateMedia({reducedMotion:'reduce'});
 for(const row of rows){await page.goto(base+row.url,{waitUntil:'domcontentloaded'});for(const width of [390,1440]){await page.setViewportSize({width,height:900});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push({url:row.url,width});}if(await page.locator('.reading-toc a').count()!==row.headings)failures.push({url:row.url,issue:'toc count'});if(await page.locator('.primary-nav [aria-current]').count()!==1)failures.push({url:row.url,issue:'navigation'});}
 await page.goto(base+rows[0].url);await page.setViewportSize({width:390,height:844});await page.locator('.reading-toc summary').click();await page.locator('.reading-toc a').nth(1).click();if(await page.locator('.reading-toc').evaluate(e=>e.open))failures.push({issue:'toc close'});
 await page.locator('.mobile-toggle').click();if(!await page.locator('main').evaluate(e=>e.inert))failures.push({issue:'menu inert'});await page.keyboard.press('Escape');
 const context=await page.context().browser().newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const p=await context.newPage();await p.goto(base+rows[0].url);await p.locator('.reading-toc summary').click();if(!await p.locator('.reading-toc a').first().isVisible())failures.push({issue:'no JS toc'});await context.close();
 return {pages:rows.length,failures,errors};
}
