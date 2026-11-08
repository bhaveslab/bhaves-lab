// Entire suite is offline. MockAgent refuses all real network connections.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { MockAgent,getGlobalDispatcher,setGlobalDispatcher } from 'undici';
import { put,BlobPreconditionFailedError } from '@vercel/blob';
import { installBlobDiagnostics,describeError,sanitize,logBlobContenders } from '../scripts/lib/blob-probe-diagnostics.mjs';
const dummyToken='vercel_blob_rw_offline_not_a_real_credential';
async function mocked(status,code,message,operation){
 const old=getGlobalDispatcher(),oldRetries=process.env.VERCEL_BLOB_RETRIES;
 const mock=new MockAgent();mock.disableNetConnect();setGlobalDispatcher(mock);process.env.VERCEL_BLOB_RETRIES='0';
 const pool=mock.get('https://vercel.com');
 pool.intercept({path:/^\/api\/blob\//,method:'PUT'}).reply(status,{error:{code,message}},{headers:{'content-type':'application/json','retry-after':'2'}});
 const diagnostic=installBlobDiagnostics({env:{TEST_SECRET:dummyToken}});
 try{
  const r=await diagnostic.track('offline-write',()=>put('offline-only.json','offline',{token:dummyToken,access:'private',ifMatch:'old-etag',addRandomSuffix:false}));
  await operation(r,diagnostic);mock.assertNoPendingInterceptors();
 }finally{diagnostic.restore();setGlobalDispatcher(old);await mock.close();if(oldRetries===undefined)delete process.env.VERCEL_BLOB_RETRIES;else process.env.VERCEL_BLOB_RETRIES=oldRetries;}
}
test('offline 412/precondition_failed yields exact SDK conflict and captures status/code',async()=>{
 await mocked(412,'precondition_failed','ETag changed',async(r,d)=>{
  assert.equal(r.status,'rejected');assert.ok(r.reason instanceof BlobPreconditionFailedError);
  assert.equal(r.diagnostic.sdk.constructorClass,'BlobPreconditionFailedError');
  assert.equal(r.diagnostic.sdk.name,'Error');assert.equal(r.diagnostic.sdk.sdkCode,null);assert.equal(r.diagnostic.sdk.reportedHttpStatus,null);
  assert.equal(r.diagnostic.responses[0].httpStatus,412);assert.equal(r.diagnostic.responses[0].providerCode,'precondition_failed');
  assert.equal(r.diagnostic.classification,'expected-sdk-conditional-conflict');assert.equal(d.summary([r]).rejected,1);
 });
});
test('offline 412 with unknown error code is not silently accepted as a conflict',async()=>{
 await mocked(412,'different_provider_code','opaque failure',async r=>{
  assert.equal(r.diagnostic.sdk.constructorClass,'BlobUnknownError');assert.equal(r.diagnostic.exactExpectedClass,false);
  assert.equal(r.diagnostic.responses[0].providerCode,'different_provider_code');assert.equal(r.diagnostic.classification,'unresolved');
 });
});
test('offline 429 retains rate limit signal and retry-after without converting to conflict',async()=>{
 await mocked(429,'rate_limited','slow down',async r=>{
  assert.equal(r.diagnostic.sdk.constructorClass,'BlobServiceRateLimited');assert.equal(r.diagnostic.sdk.retryAfterSeconds,2);
  assert.equal(r.diagnostic.classification,'transient-provider-failure-signal');assert.equal(r.diagnostic.exactExpectedClass,false);
 });
});
test('offline 503 records provider unavailability and remains a failed safety result',async()=>{
 await mocked(503,'service_unavailable','temporary failure',async r=>{
  assert.equal(r.diagnostic.responses[0].httpStatus,503);assert.equal(r.diagnostic.sdk.constructorClass,'BlobServiceNotAvailable');
  assert.equal(r.diagnostic.exactExpectedClass,false);assert.equal(r.diagnostic.classification,'transient-provider-failure-signal');
 });
});
test('offline 403 is distinguished from conditional-write rejection',async()=>{
 await mocked(403,'forbidden','denied',async r=>{assert.equal(r.diagnostic.classification,'authorization-failure');assert.equal(r.diagnostic.exactExpectedClass,false);});
});
test('sanitization removes secrets, JWTs, bearer values, signed URLs and emails',()=>{
 const secret='secret-value-known-only-to-this-offline-fixture';
 const s=sanitize(`${secret} Bearer example-private-token sk_test_0123456789 re_0123456789 vercel_blob_rw_store_private eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.signature https://example.test/?secret=hidden person@example.test`,{BOOKING_ACCESS_SECRET:secret});
 for(const forbidden of [secret,'example-private-token','sk_test_','re_0123','vercel_blob_rw_','eyJhbGci','https://','person@example.test'])assert.ok(!s.includes(forbidden));
 assert.ok(s.length<=1024);
});
test('only allowlisted error fields survive; raw request/response/stack data is omitted',()=>{
 const e=Object.assign(new Error('safe failure'),{code:'E_SAFE',statusCode:503,request:{headers:{authorization:'private'}},response:{body:'private'},extra:'private'});
 const result=JSON.stringify(describeError(e));assert.ok(!result.includes('private'));assert.ok(!result.includes('stack'));assert.ok(result.includes('E_SAFE'));
});
test('a copied/named SDK conflict with a 412/code signal is diagnosed but still fails instanceof',()=>{
 const require=createRequire(import.meta.url),Other=require('@vercel/blob').BlobPreconditionFailedError;
 const other=new Other();assert.ok(!(other instanceof BlobPreconditionFailedError));
 const r=describeError(other,[{httpStatus:412,providerCode:'precondition_failed',message:null}]);
 assert.equal(r.exactExpectedClass,false);assert.equal(r.classification,'conditional-response-sdk-behavior-difference');
});
test('successful mocked requests record status without retaining body, URL, or headers',async()=>{
 const old=getGlobalDispatcher(),mock=new MockAgent();mock.disableNetConnect();setGlobalDispatcher(mock);
 mock.get('https://vercel.com').intercept({path:/^\/api\/blob\//,method:'PUT'}).reply(200,{url:'https://offline.private.blob.vercel-storage.com/offline-only.json',downloadUrl:'https://offline.private.blob.vercel-storage.com/offline-only.json',pathname:'offline-only.json',contentType:'application/json',contentDisposition:'attachment',etag:'new-etag'});
 const d=installBlobDiagnostics();try{
  const r=await d.track('offline-success',()=>put('offline-only.json','DO_NOT_LOG_BODY',{token:dummyToken,access:'private',ifMatch:'old-etag',addRandomSuffix:false}));
  assert.equal(r.status,'fulfilled');const report=JSON.stringify(d.summary([r]));assert.ok(!report.includes('DO_NOT_LOG_BODY'));assert.ok(!report.includes('offline-only.json'));assert.ok(!report.includes(dummyToken));assert.ok(report.includes('200'));mock.assertNoPendingInterceptors();
 }finally{d.restore();setGlobalDispatcher(old);await mock.close();}
});
test('oversized provider error bodies are omitted rather than emitted or partially logged',async()=>{
 await mocked(400,'bad_request','x'.repeat(10000),async r=>{
  assert.equal(r.diagnostic.responses[0].errorBody,'omitted-oversize');assert.equal(r.diagnostic.responses[0].message,null);assert.equal(r.diagnostic.responses[0].providerCode,null);
  assert.ok(r.diagnostic.sdk.message.length<=1024);assert.equal(r.diagnostic.exactExpectedClass,false);
 });
});
test('concurrent offline writes retain their own response evidence and diagnostic label',async()=>{
 const old=getGlobalDispatcher(),mock=new MockAgent();mock.disableNetConnect();setGlobalDispatcher(mock);
 const pool=mock.get('https://vercel.com');
 pool.intercept({path:/^\/api\/blob\//,method:'PUT'}).reply(412,{error:{code:'precondition_failed',message:'first'}});
 pool.intercept({path:/^\/api\/blob\//,method:'PUT'}).reply(429,{error:{code:'rate_limited',message:'second'}});
 const d=installBlobDiagnostics();try{
  const results=await Promise.all(['first','second'].map(label=>d.track(label,()=>put('offline-only.json','offline',{token:dummyToken,access:'private',ifMatch:'old-etag',addRandomSuffix:false}))));
  assert.equal(results[0].label,'first');assert.equal(results[0].diagnostic.responses[0].httpStatus,412);
  assert.equal(results[1].label,'second');assert.equal(results[1].diagnostic.responses[0].httpStatus,429);mock.assertNoPendingInterceptors();
 }finally{d.restore();setGlobalDispatcher(old);await mock.close();}
});

test('each contender is a separate log record and long retry histories survive the line limit', () => {
 const first = { label: 'contention-0', status: 'fulfilled', responses: [{ httpStatus: 200 }] };
 const second = {
  label: 'contention-1',
  responses: Array.from({ length: 64 }, (_, attempt) => ({
   httpStatus: attempt === 63 ? 400 : 503,
   providerCode: attempt === 63 ? 'bad_request' : 'service_unavailable',
   message: 'é'.repeat(1000),
  })),
 };
 const third = { label: 'contention-2', responses: [{ httpStatus: 412, providerCode: 'precondition_failed' }] };
 const lines = [];
 logBlobContenders([first, second, third], line => lines.push(line));

 assert.ok(lines.every(line => Buffer.byteLength(line) <= 1800));
 assert.deepEqual(JSON.parse(lines[0]), { blobContender: first });
 assert.deepEqual(JSON.parse(lines.at(-1)), { blobContender: third });
 const frames = lines.slice(1, -1).map(line => JSON.parse(line).blobContenderFrame);
 assert.ok(frames.length > 1);
 for (const [index, frame] of frames.entries()) {
  assert.equal(frame.label, second.label);
  assert.equal(frame.part, index + 1);
  assert.equal(frame.total, frames.length);
 }
 const decoded = Buffer.from(frames.map(frame => frame.data).join(''), 'base64').toString('utf8');
 assert.deepEqual(JSON.parse(decoded), { blobContender: second });
});
