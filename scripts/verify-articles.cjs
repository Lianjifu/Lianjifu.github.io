const fs=require('fs'),crypto=require('crypto'),path=require('path');
const root=path.resolve(__dirname,'..'),rows=JSON.parse(fs.readFileSync(path.join(root,'docs/article-manifest.json')));
if(rows.length!==91)throw Error('Count');
for(const row of rows){const s=fs.readFileSync(path.join(root,row.file),'utf8'),start=s.indexOf('<div class="post-body"'),body=s.slice(start,start+row.bodyLength);if(crypto.createHash('sha256').update(body).digest('hex')!==row.bodyHash)throw Error('Changed body: '+row.file);if(!s.includes('article-pager')||!s.includes('reading-toc')||s.includes('next-boot.js')||s.includes('local-search.js'))throw Error('Shell: '+row.file);}
console.log('91 exact article-body hashes and modern shells verified');
