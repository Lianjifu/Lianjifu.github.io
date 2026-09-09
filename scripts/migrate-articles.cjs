const fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shell=read('categories/ai-agent/index.html');
const header=shell.match(/<header class="portal-header"[\s\S]*?<\/header>/)[0],footer=shell.match(/<footer class="portal-footer"[\s\S]*?<\/footer>/)[0],icons=shell.match(/<svg\s+class="icon-definitions"[\s\S]*?<\/svg>/)[0];
const sets=[['ai-agent','AI Agent 工程实践'],['claude-code','Claude Code 源码分析'],['observable-security','安全运营可观测性'],['observable-ops','系统运维可观测性']];
const records=[],changes=[];
if(read('2026/08/08/llm-agent-principles/index.html').includes('article-reading-layout')) { console.log('Already migrated; no files changed.'); process.exit(0); }
for(const [slug,label] of sets){
 const urls=[...new Set([...read(`categories/${slug}/index.html`).matchAll(/href="(\/2026\/[^"#]+)"/g)].map(m=>m[1]))];
 const posts=urls.map(url=>{const file=url.slice(1)+'index.html',source=read(file);const begin=source.indexOf('<div class="post-body"'),articleEnd=source.indexOf('</article>',begin),end=source.lastIndexOf('</div>',articleEnd)+6;if(begin<0||end<begin)throw Error(file);return {url,file,source,body:source.slice(begin,end),title:source.match(/<title>([\s\S]*?)<\/title>/)[1].split(' | ')[0]};});
 posts.forEach((p,i)=>{
  let head=p.source.slice(0,p.source.indexOf('</head>'));
  head=head.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<noscript>[\s\S]*?<\/noscript>/g,'').replace(/<link[^>]+href="\/css\/(?:main|post|article|portal)\.css[^>]*>/g,'');
  head+='<link rel="stylesheet" href="/css/portal.css?v=1"><link rel="stylesheet" href="/css/article.css?v=3"><script src="/js/portal.js?v=6" defer></script><script src="/js/article-reader.js?v=1" defer></script></head>';
  const bodyClass=p.source.match(/<body[^>]+class="([^"]+)"/)[1];
  let posthead=p.source.match(/<header class="post-header">[\s\S]*?<\/header>/)[0];
  posthead=posthead.replace('<header class="post-header">','<header class="post-header"><div class="article-breadcrumb"><a href="/archives/">博客</a><span>/</span><a href="/categories/'+slug+'/">'+label+'</a></div>');
  const h2only=p.body.slice(0,p.body.indexOf('>')).includes('data-toc-mode="h2"');
  const headings=[...p.body.matchAll(/<h([234])\b([^>]*)>([\s\S]*?)<\/h\1>/g)].filter(m=>!m[2].includes('data-toc-skip')&&(!h2only||m[1]==='2')&&/\bid="([^"]+)"/.test(m[2]));
  const toc=headings.map(m=>'<a class="reading-toc-link level-'+m[1]+'" href="#'+m[2].match(/\bid="([^"]+)"/)[1]+'">'+(m[2].match(/data-toc="([^"]+)"/)?.[1]||m[3].replace(/<[^>]*>/g,''))+'</a>').join('');
  const item=(q,d)=>q?'<a href="'+q.url+'"><small>'+d+'</small><span>'+q.title+'</span></a>':'';
  const pager='<nav class="article-pager" aria-label="专题阅读导航"><div>'+item(posts[i-1],'← 上一篇')+'</div><div>'+item(posts[i+1],'下一篇 →')+'</div><a class="article-series-return" href="/categories/'+slug+'/">返回'+label+' ↗</a></nav>';
  const output=head+'<body id="top" class="'+bodyClass+'" data-series="'+slug+'">'+icons+header+'<main id="main"><article class="post-block" itemscope itemtype="https://schema.org/Article">'+posthead+'<div class="article-reading-layout">'+p.body+'<aside class="article-toc-aside"><details class="reading-toc"><summary>本文目录</summary><nav aria-label="本文目录">'+toc+'</nav></details></aside></div>'+pager+'</article></main>'+footer+'<script src="/js/article-diagrams.js?v=1" defer></script></body></html>';
  records.push({url:p.url,file:p.file,title:p.title,series:slug,order:i+1,bodyHash:crypto.createHash('sha256').update(p.body).digest('hex'),bodyLength:p.body.length,headings:headings.length});changes.push([p.file,output,p.source]);
 });
}
if(changes.length!==91)throw Error('Expected 91');
if(process.argv.includes('--write')){
 const backup=fs.mkdtempSync(path.join(os.tmpdir(),'article-shell-'));
 for(const [file,output,original]of changes){const dest=path.join(backup,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,original);fs.writeFileSync(path.join(root,file),output);}
 fs.writeFileSync(path.join(root,'docs/article-manifest.json'),JSON.stringify(records,null,2)+'\n');console.log('91 articles migrated. Backup: '+backup);
}else console.log('Dry run: 91 article bodies captured');
