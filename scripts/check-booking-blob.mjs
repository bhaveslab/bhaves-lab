// Real provider test, deliberately separate from simulated unit tests. No Calendar or Stripe mutations.
import assert from 'node:assert/strict';
import { randomUUID,createHash } from 'node:crypto';
import { get,put,del,BlobPreconditionFailedError } from '@vercel/blob';
const token=process.env.EBOOK_BLOB_READ_WRITE_TOKEN;
if(!token){console.error('BLOCKED: EBOOK_BLOB_READ_WRITE_TOKEN is absent. No real Blob concurrency/recovery test ran.');process.exit(2);}
if(process.env.BOOKING_BLOB_TEST_APPROVED!=='true'){console.error('BLOCKED: set BOOKING_BLOB_TEST_APPROVED=true to test only a fresh private bookings/test/probe-*.json object in the existing store.');process.exit(2);}
const path='bookings/test/probe-'+randomUUID()+'.json';let etag;
async function read(){const r=await get(path,{token,access:'private',useCache:false});assert.equal(r?.statusCode,200);return {data:await new Response(r.stream).json(),etag:r.blob.etag};}
try{
 await put(path,JSON.stringify({version:1,revision:0,records:[]}),{token,access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
 const initial=await read();
 // All contenders use the same etag: exactly one must commit, regardless of response order.
 const results=await Promise.allSettled(Array.from({length:8},(_,i)=>put(path,JSON.stringify({version:1,revision:1,records:[{winner:i}]}),{token,access:'private',addRandomSuffix:false,ifMatch:initial.etag,contentType:'application/json'})));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1,'Conditional write must have exactly one winner');
 for(const r of results.filter(r=>r.status==='rejected'))assert.ok(r.reason instanceof BlobPreconditionFailedError,'Unexpected provider error: fail test; do not introduce another store');
 const current=await read();etag=current.etag;assert.equal(current.data.revision,1);assert.equal(current.data.records.length,1);assert.notEqual(current.etag,initial.etag);
 await assert.rejects(put(path,JSON.stringify(initial.data),{token,access:'private',addRandomSuffix:false,ifMatch:initial.etag}),BlobPreconditionFailedError);
 // Simulate process restart by reading the provider again, without an in-memory snapshot.
 assert.deepEqual((await read()).data,current.data);
 // Exercise the actual reservation implementation on the same isolated probe.
 await put(path,JSON.stringify({version:1,revision:2,recoveryAt:Date.now(),records:[]}),{token,access:'private',addRandomSuffix:false,ifMatch:current.etag,contentType:'application/json'});
 const {BlobStore}=await import('../.qa/booking-runtime/_lib/booking/ledger.js');
 const {reserve}=await import('../.qa/booking-runtime/_lib/booking/service.js');
 const p={store:new BlobStore(token,path),now:Date.now,buffer:15*60000,available:async()=>true,asset:async()=>Buffer.from('probe')};
 const start=Date.now()+4*3600000;
 const attempts=await Promise.allSettled(Array.from({length:12},(_,i)=>reserve(p,{id:createHash('sha256').update(path+':'+i).digest('hex'),owner:'probe',start,edition:'en',email:'probe@example.test',price:'price_probe',origin:'https://preview.vercel.app'})));
 assert.equal(attempts.filter(r=>r.status==='fulfilled').length,1,'Actual slot protection must admit one claimant');
 for(const r of attempts.filter(r=>r.status==='rejected'))assert.equal(r.reason.status,409,'Unexpected Blob/provider error requires stopping and review');
 assert.equal((await read()).data.records.length,1);
 console.log('PASS real private Blob: eight contenders, one winner; stale overwrite rejected; consistent restart read; twelve real-store reservation attempts yield one hold. No payments or appointments created.');
}catch(e){console.error('FAILED real Blob safety check:',e.message);process.exitCode=1;}
finally{
 // Only this random probe object is eligible for cleanup; never touch runtime ledger/ebook objects.
 try{etag=(await read()).etag;await del(path,{token,ifMatch:etag});}catch{console.error('Probe cleanup requires review:',path);process.exitCode=1;}
}
