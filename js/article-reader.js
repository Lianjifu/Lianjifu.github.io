/* Enhance the static directory without requiring scripts for basic reading. */
(()=>{
 // The TOC aside and the prev/next pager are sometimes misplaced by the
 // upstream HTML generator (nested inside post-body, or stuck inside the
 // 2-column layout grid). Move them into the positions the CSS expects so
 // the sticky sidebar and the full-width pager render correctly everywhere.
 const layout=document.querySelector('.article-reading-layout');
 if(layout){
  const aside=document.querySelector('.article-toc-aside');
  if(aside&&aside.parentElement!==layout) layout.appendChild(aside);
  const pager=document.querySelector('.article-pager');
  const parent=layout.parentElement;
  if(pager&&parent&&pager.parentElement!==parent) parent.insertBefore(pager,null);
 }
 const toc=document.querySelector('.reading-toc');if(!toc)return;
 const links=[...toc.querySelectorAll('a')],targets=links.map(a=>document.getElementById(decodeURIComponent(a.hash.slice(1))));
 const wide=matchMedia('(min-width: 1200px)'),sync=()=>{toc.open=wide.matches;};sync();wide.addEventListener('change',sync);
 let frame=0;
 const update=()=>{frame=0;let active=0;targets.forEach((h,i)=>{if(h&&h.getBoundingClientRect().top<150)active=i;});links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});};
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});update();
 links.forEach((a,i)=>a.addEventListener('click',()=>{if(!wide.matches)toc.open=false;const h=targets[i];if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}));
 toc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!wide.matches){toc.open=false;toc.querySelector('summary').focus();}});
 document.querySelectorAll('.post-body pre').forEach(pre=>{
  if(pre.closest('.mermaid'))return;
  const button=document.createElement('button');button.className='article-copy';button.type='button';button.textContent='复制代码';
  button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText((pre.querySelector('code')||pre).textContent);button.textContent='已复制';}catch{button.textContent='复制失败，请手动选择';}setTimeout(()=>button.textContent='复制代码',2000);});pre.before(button);
 });
})();
