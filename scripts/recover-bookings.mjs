// Run from an existing approved scheduler or manually. Never logs credentials or customer details.
const origin=process.env.EBOOK_PUBLIC_ORIGIN,key=process.env.BOOKING_RECOVERY_SECRET;
if(!origin||!key){console.error('BLOCKED: preview origin and recovery secret are required.');process.exit(2);}
const url=new URL(origin);
if(url.protocol!=='https:'||!url.hostname.endsWith('.vercel.app')||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw Error('Preview-only origin required.');
const r=await fetch(url.origin+'/api/booking',{method:'POST',headers:{Origin:url.origin,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({action:'recover'}),signal:AbortSignal.timeout(55000)});
if(!r.ok){console.error('Recovery endpoint failed:',r.status);process.exit(1);}
console.log(JSON.stringify(await r.json()));
