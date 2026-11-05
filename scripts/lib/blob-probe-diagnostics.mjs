// Observer for disposable probes only. Does not retry, change requests, or authorize conflicts.
import { AsyncLocalStorage } from 'node:async_hooks';
import { Dispatcher, getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import { BlobPreconditionFailedError } from '@vercel/blob';
const MAX_ERROR_BODY=8192;
const MAX_RESPONSES=64;
export function sanitize(value,env=process.env) {
 if(typeof value!=='string')return null;
 let text=value;
 for(const [key,secret] of Object.entries(env)) {
  if(/token|secret|password|api_key|authorization|private_key|credential/i.test(key)&&typeof secret==='string'&&secret.length>=4) text=text.split(secret).join('[redacted]');
 }
 return text
  .replace(/Bearer\s+[^\s"'<>]+/gi,'Bearer [redacted]')
  .replace(/\b(?:access_token|refresh_token|token|secret|password|api[_-]?key|authorization)\s*[:=]\s*["']?[^\s"',;}]+/gi,'credential=[redacted]')
  .replace(/\b(?:vercel_blob_rw_|re_|sk_(?:test|live)_|rk_(?:test|live)_|whsec_)[A-Za-z0-9_-]+/g,'[redacted]')
  .replace(/\beyJ[A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+){1,2}/g,'[redacted-jwt]')
  .replace(/https?:\/\/[^\s"'<>]+/gi,'[redacted-url]')
  .replace(/\b[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+\b/g,'[redacted-email]')
  .slice(0,1024);
}
function field(value,key){try{return value?.[key];}catch{return undefined;}}
function status(value){return Number.isInteger(value)&&value>=100&&value<=599?value:null;}
export function describeError(error,responses=[],env=process.env) {
 const sdk={
  constructorClass:sanitize(field(field(error,'constructor'),'name'),env),
  name:sanitize(field(error,'name'),env),
  sdkCode:sanitize(field(error,'code'),env),
  reportedHttpStatus:status(field(error,'statusCode'))||status(field(error,'status')),
  message:sanitize(field(error,'message'),env),
  causeCode:sanitize(field(field(error,'cause'),'code'),env),
  retryAfterSeconds:Number.isFinite(field(error,'retryAfter'))?field(error,'retryAfter'):null,
 };
 responses=responses.slice(0,MAX_RESPONSES).map(r=>({httpStatus:status(field(r,'httpStatus')),providerCode:sanitize(field(r,'providerCode'),env),message:sanitize(field(r,'message'),env),errorBody:sanitize(field(r,'errorBody'),env)}));
 const exactExpectedClass=error instanceof BlobPreconditionFailedError;
 const conditionalResponse=responses.some(r=>r.httpStatus===412 && r.providerCode==='precondition_failed');
 let classification='unresolved';
 if(exactExpectedClass) classification='expected-sdk-conditional-conflict';
 else if(conditionalResponse) classification='conditional-response-sdk-behavior-difference';
 else if(responses.some(r=>r.httpStatus===429||r.httpStatus>=500)||['BlobServiceRateLimited','BlobServiceNotAvailable'].includes(sdk.constructorClass)) classification='transient-provider-failure-signal';
 else if(responses.some(r=>r.httpStatus===401||r.httpStatus===403))classification='authorization-failure';
 // Classification is informational: it NEVER changes the exact-class safety assertion.
 return {sdk,exactExpectedClass,classification,responses};
}
function observesBlob(options){
 try {
  const origin=String(options.origin),path=String(options.path);
  return (origin==='https://vercel.com'&&/^\/api\/blob(?:[/?]|$)/.test(path))||/^https:\/\/[a-z0-9-]+\.(?:private\.|public\.)?blob\.vercel-storage\.com$/i.test(origin);
 }catch{return false;}
}
export function installBlobDiagnostics({env=process.env}={}) {
 const storage=new AsyncLocalStorage(),previous=getGlobalDispatcher();
 class Observer extends Dispatcher {
  dispatch(options,handler){
   const context=storage.getStore();
   if(!context||!observesBlob(options))return previous.dispatch(options,handler);
   let httpStatus=null,chunks=[],size=0,overflow=false,finished=false;
   const record=()=>{
    if(finished)return;finished=true;
    if(context.responses.length>=MAX_RESPONSES)return;
    let providerCode=null,message=null,errorBody='not-captured';
    if(httpStatus>=400){
     if(overflow)errorBody='omitted-oversize';
     else {try{const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));providerCode=sanitize(body?.error?.code,env);message=sanitize(body?.error?.message,env);errorBody='sanitized-json-fields';}catch{errorBody='omitted-non-json';}}
    }
    context.responses.push({httpStatus,providerCode,message,errorBody});chunks=[];
   };
   const wrapped=Object.create(handler);
   for(const name of ['onConnect','onUpgrade','onBodySent','onRequestSent']) if(typeof handler[name]==='function') wrapped[name]=(...args)=>handler[name](...args);
   wrapped.onHeaders=(code,...args)=>{httpStatus=status(code);return handler.onHeaders(code,...args);};
   wrapped.onData=chunk=>{
    if(httpStatus>=400&&!overflow){size+=chunk.length;if(size>MAX_ERROR_BODY){overflow=true;chunks=[];}else chunks.push(Buffer.from(chunk));}
    return handler.onData(chunk);
   };
   wrapped.onComplete=(...args)=>{record();return handler.onComplete(...args);};
   wrapped.onError=error=>{record();return handler.onError(error);};
   return previous.dispatch(options,wrapped);
  }
 }
 const observer=new Observer();setGlobalDispatcher(observer);
 return {
  async track(label,operation){
   if(!/^[a-z0-9-]{1,64}$/.test(label))throw Error('A fixed non-sensitive diagnostic label is required.');
   const context={responses:[]};
   return storage.run(context,async()=>{
    try{return {status:'fulfilled',label,value:await operation(),transport:context.responses};}
    catch(reason){return {status:'rejected',label,reason,diagnostic:describeError(reason,context.responses,env)};}
   });
  },
  summary(results){return {fulfilled:results.filter(r=>r.status==='fulfilled').length,rejected:results.filter(r=>r.status==='rejected').length,operations:results.map(r=>r.status==='rejected'?{label:r.label,...r.diagnostic}:{label:r.label,status:'fulfilled',responses:r.transport})};},
  restore(){if(getGlobalDispatcher()===observer)setGlobalDispatcher(previous);},
 };
}
