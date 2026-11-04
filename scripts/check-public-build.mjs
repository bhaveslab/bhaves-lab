import { readFileSync, statSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
const html=readFileSync('dist/index.html','utf8');
const entry=html.match(/src="(\/assets\/main-[^"]+\.js)"/)[1];
const css=html.match(/href="(\/assets\/main-[^"]+\.css)"/)[1];
const jsGzip=gzipSync(readFileSync('dist'+entry)).length;
const cssGzip=gzipSync(readFileSync('dist'+css)).length;
const artwork=['observatory-mobile.webp','lil-ego-cutout-336.webp','bracelet-concept-480.webp'].map(name=>({name,bytes:statSync('public/observatory/'+name).size}));
const mobileImageBytes=artwork.reduce((sum,item)=>sum+item.bytes,0);
assert.ok(jsGzip<65000,'Initial JavaScript gzip budget exceeded');
assert.ok(cssGzip<10000,'CSS gzip budget exceeded');
assert.ok(mobileImageBytes<200000,'Mobile artwork budget exceeded');
for (const name of readdirSync('dist/assets').filter(name=>name.endsWith('.js'))) {
 const code=readFileSync('dist/assets/'+name,'utf8');
 for(const unpaidSchedule of ['calendar.app.google/deuuggaTWKq5q6JL8','AcZssZ1zyAf0L1u-iKLzbe5-Jn-wZo2JZBOOJ-ThOpC46RPkXcqv6rtbCjqa1FEZpOzApm4vOSMEX2VK']) assert.ok(!code.includes(unpaidSchedule),'Unpaid native schedule exposed in '+name);
 for(const phrase of ['Order confirmed', 'received your payment and will follow up', 'Inner Mining','Bio-Well observation','A few ways','No additional purchase is necessary'])assert.ok(!code.includes(phrase),'Protected Room content leaked into '+name);
}
assert.ok(!readdirSync('dist/assets').some(name=>name.startsWith('RoomOfClarity-')),'Protected Room client chunk emitted');
const report={initialJavaScriptGzipBytes:jsGzip,cssGzipBytes:cssGzip,mobileImageBytes,artwork,roomContentServerOnly:true,notes:'Transfer-size budget, not Lighthouse or real-device timing. Retained Meridian Three.js is deferred.'};
console.log(JSON.stringify(report,null,2));

function noPublicPdfs(dir) {
 for (const entry of readdirSync(dir,{withFileTypes:true})) {
  const path=dir+'/'+entry.name;
  if(entry.isDirectory()) noPublicPdfs(path);
  else assert.ok(!entry.name.toLowerCase().endsWith('.pdf'),'Paid PDF must not be in public build: '+path);
 }
}
noPublicPdfs('dist');
