async(page)=>{
 const base='http://127.0.0.1:4000';await page.goto(base+'/docs/article-manifest.json');const rows=await (await page.request.get(base+'/docs/article-manifest.json')).json();
 const errors=[],failures=[],skipped=[];page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));await page.emulateMedia({reducedMotion:'reduce'});
 /* 各专题正文首行缩进的例外段落：展示性元素不参与缩进。
    note-meta 是全站统一的文末修订说明标记；claude-code / observable-security /
    observable-ops 三个专题除它之外没有例外段落。 */
 const EXCLUDE={ 'ai-agent':['section-summary'], 'openclaw':['oc-lead','oc-metric','oc-callout-lead'] };
 for(const row of rows){
  await page.goto(base+row.url,{waitUntil:'domcontentloaded'});await page.setViewportSize({width:1440,height:900});
  const r=await page.evaluate((exclude)=>{
   const pb=document.querySelector('.post-body');if(!pb)return {err:'no post-body'};
   const skip=['note-meta'].concat(exclude[document.body.dataset.series]||[]);
   const bad=[],nested=[];
   for(const p of pb.querySelectorAll(':scope > p')){
    const cls=p.className||'';
    const excluded=skip.some(c=>cls.split(/\s+/).includes(c));
    const fs=parseFloat(getComputedStyle(p).fontSize);
    const got=parseFloat(getComputedStyle(p).textIndent)||0;
    const expect=excluded?0:2*fs;
    if(Math.abs(got-expect)>0.5)bad.push({cls:cls||'(none)',got,expect});
   }
   for(const p of pb.querySelectorAll('blockquote p, li p, .thinking-note p, .section-callout p')){
    const got=parseFloat(getComputedStyle(p).textIndent)||0;
    if(got>0.5)nested.push({cls:p.className||'(none)',got});
   }
   return {bad,nested,total:pb.querySelectorAll(':scope > p').length,series:document.body.dataset.series};
  },EXCLUDE);
  if(r.err){failures.push({url:row.url,issue:r.err});continue;}
  if(r.bad.length)failures.push({url:row.url,series:r.series,issue:'indent',detail:r.bad.slice(0,3)});
  if(r.nested.length)failures.push({url:row.url,series:r.series,issue:'nested indent',detail:r.nested.slice(0,3)});
  if(r.total===0)skipped.push(row.url); /* 纯图表正文，没有可缩进的段落 */
 }
 /* 三个专题各抽查一篇：1440px 与 390px 均无横向溢出 */
 for(const url of ['/2026/05/21/claude-code-01-overview/','/2026/06/10/observable-security-01-00-intro-brief/','/2026/06/13/observable-ops-01-01-product-overview/']){
  await page.goto(base+url,{waitUntil:'domcontentloaded'});
  for(const width of [390,1440]){await page.setViewportSize({width,height:900});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push({url,issue:'overflow',width});}
 }
 return {pages:rows.length,failures,errors,skipped};
}
