// Real provider test, deliberately separate from simulated unit tests. No Calendar or Stripe mutations.
import assert from 'node:assert/strict';
import { randomUUID,createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { get,put,del,BlobPreconditionFailedError } from '@vercel/blob';
import {installBlobDiagnostics,describeError} from './lib/blob-probe-diagnostics.mjs';
const token=process.env.EBOOK_BLOB_READ_WRITE_TOKEN||process.env.BLOB_READ_WRITE_TOKEN;
const expectedStore='store_O9OJNZXDYMzkyTu5';
const sameStore=(process.env.BLOB_STORE_ID||'').replace(/^store_/,'')===expectedStore.replace(/^store_/,'');
const oidc=process.env.VERCEL_ENV==='preview' && !!process.env.VERCEL_OIDC_TOKEN && sameStore;
if(process.env.VERCEL_ENV==='production'){console.error('BLOCKED: Production must never run this probe.');process.exit(2);}
if(!token && !oidc){console.error('BLOCKED: no Preview Blob credential is available; no provider test ran.');process.exit(2);}
if(process.env.BLOB_STORE_ID && !sameStore){console.error('BLOCKED: Blob store identity mismatch.');process.exit(2);}
console.log(JSON.stringify({probeEnvironment:process.env.VERCEL_ENV||'local',authMode:token?'read-write-token':'preview-oidc',expectedPrivateStore:expectedStore,secretValuesLogged:false}));
if(process.env.BOOKING_BLOB_TEST_APPROVED!=='true'){console.error('BLOCKED: set BOOKING_BLOB_TEST_APPROVED=true to test only a fresh private bookings/test/probe-*.json object in the existing store.');process.exit(2);}
const path='bookings/test/probe-'+randomUUID()+'.json';let etag;
const diagnostics=installBlobDiagnostics();
async function observed(label,operation){const r=await diagnostics.track(label,operation);console.log(JSON.stringify({blobDiagnostic:diagnostics.summary([r])}));if(r.status==='rejected')throw r.reason;return r.value;}
async function read(){return observed('fresh-read',async()=>{const r=await get(path,{token,access:'private',useCache:false});assert.equal(r?.statusCode,200);return {data:await new Response(r.stream).json(),etag:r.blob.etag};});}
try{
 await observed('seed-write',()=>put(path,JSON.stringify({version:1,revision:0,records:[]}),{token,access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'}));
 const initial=await read();
 // All contenders use the same etag: exactly one must commit, regardless of response order.
 const results=await Promise.all(Array.from({length:8},(_,i)=>diagnostics.track('contention-'+i,()=>put(path,JSON.stringify({version:1,revision:1,records:[{winner:i}]}),{token,access:'private',addRandomSuffix:false,ifMatch:initial.etag,contentType:'application/json'}))));
 console.log(JSON.stringify({blobContentionDiagnostics:diagnostics.summary(results)}));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1,'Conditional write must have exactly one winner');
 for(const r of results.filter(r=>r.status==='rejected'))assert.ok(r.reason instanceof BlobPreconditionFailedError,'Unexpected provider error: fail test; do not introduce another store');
 const current=await read();etag=current.etag;assert.equal(current.data.revision,1);assert.equal(current.data.records.length,1);assert.notEqual(current.etag,initial.etag);
 await assert.rejects(observed('stale-write',()=>put(path,JSON.stringify(initial.data),{token,access:'private',addRandomSuffix:false,ifMatch:initial.etag})),BlobPreconditionFailedError);
 // Lose the successful write response deliberately, then recover committed state by fresh read.
 let interrupted=false;
 try {
  await observed('interrupted-commit',()=>put(path,JSON.stringify({version:1,revision:2,records:current.data.records}),{token,access:'private',addRandomSuffix:false,ifMatch:current.etag,contentType:'application/json'}));
  throw Error('probe-interrupted-after-commit');
 } catch(e) { if(e.message!=='probe-interrupted-after-commit')throw e;interrupted=true; }
 assert.ok(interrupted);const recovered=await read();assert.equal(recovered.data.revision,2);assert.deepEqual(recovered.data.records,current.data.records);
 // A separate Node process performs a fresh authenticated read. Secret travels only via inherited environment.
 const restart=execFileSync(process.execPath,['--input-type=module','-e',`import {get} from '@vercel/blob'; const r=await get(process.env.BOOKING_BLOB_PROBE_PATH,{access:'private',token:process.env.EBOOK_BLOB_READ_WRITE_TOKEN,useCache:false}); if(r?.statusCode!==200)process.exit(1); const d=await new Response(r.stream).json(); console.log(JSON.stringify({revision:d.revision,records:d.records}));`],{env:{...process.env,BOOKING_BLOB_PROBE_PATH:path},encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']});
 assert.deepEqual(JSON.parse(restart),{revision:2,records:current.data.records});
 // Exercise the actual reservation implementation on the same isolated probe.
 await observed('reservation-fixture',()=>put(path,JSON.stringify({version:1,revision:3,recoveryAt:Date.now(),records:[]}),{token,access:'private',addRandomSuffix:false,ifMatch:recovered.etag,contentType:'application/json'}));
 const {BlobStore}=await import('../.qa/booking-runtime/_lib/booking/ledger.js');
 const {reserve}=await import('../.qa/booking-runtime/_lib/booking/service.js');
 const p={store:new BlobStore(token,path),now:Date.now,buffer:15*60000,available:async()=>true,asset:async()=>Buffer.from('probe')};
 const start=Date.now()+4*3600000;
 const attempts=await Promise.all(Array.from({length:12},(_,i)=>diagnostics.track('reservation-'+i,()=>reserve(p,{id:createHash('sha256').update(path+':'+i).digest('hex'),owner:'probe',start,edition:'en',email:'probe@example.test',price:'price_probe',origin:'https://preview.vercel.app'}))));
 console.log(JSON.stringify({blobReservationDiagnostics:diagnostics.summary(attempts)}));
 assert.equal(attempts.filter(r=>r.status==='fulfilled').length,1,'Actual slot protection must admit one claimant');
 for(const r of attempts.filter(r=>r.status==='rejected'))assert.equal(r.reason.status,409,'Unexpected Blob/provider error requires stopping and review');
 assert.equal((await read()).data.records.length,1);
 console.log('PASS real private Blob: eight contenders, one winner; stale overwrite rejected; interrupted-response recovery and independent-process restart read; twelve real-store reservation attempts yield one hold. No payments or appointments created.');
}catch(e){console.error('FAILED real Blob safety check:',JSON.stringify(describeError(e)));process.exitCode=1;}
finally{
 // Only this random probe object is eligible for cleanup; never touch runtime ledger/ebook objects.
 try{etag=(await read()).etag;await observed('probe-cleanup',()=>del(path,{token,ifMatch:etag}));}catch(e){console.error('Probe cleanup requires review:',JSON.stringify(describeError(e)));process.exitCode=1;}
 diagnostics.restore();
}
