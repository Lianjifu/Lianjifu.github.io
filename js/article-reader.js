/* Enhance the static directory without requiring scripts for basic reading. */
(()=>{
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
