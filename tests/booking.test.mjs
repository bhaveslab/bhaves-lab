import test from 'node:test';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Conflict,transaction,readBooking } from '../.qa/booking-runtime/_lib/booking/ledger.js';
import { reserve,startCheckout,recover,authorized,fulfill,bookingId,token,claim,linkCheckout } from '../.qa/booking-runtime/_lib/booking/service.js';
import { ready,policy,permitted,runtime } from '../.qa/booking-runtime/_lib/booking/runtime.js';
import api from '../.qa/booking-runtime/booking.js';
import webhook from '../.qa/booking-runtime/booking-webhook.js';
class MemoryStore {
 data={version:1,revision:0,records:[]};etag=0;lostWrite=false;
 async read(){await Promise.resolve();return {data:structuredClone(this.data),etag:String(this.etag)};}
 async write(data,etag){await Promise.resolve();if(etag!==String(this.etag))throw new Conflict();this.data=structuredClone(data);this.etag++;if(this.lostWrite){this.lostWrite=false;throw Error('Committed write response lost');}}
}
function fixture(){
 let clock=Date.UTC(2026,10,9,12);const store=new MemoryStore();store.data.recoveryAt=clock;let payment='open',calendar=null,available=true;const sessions=new Map(),sends=new Map();let creates=0,calendarCalls=0,mailCalls=0;
 const p={store,now:()=>clock,buffer:15*60000,secret:'s'.repeat(48),available:async()=>available,checkout:async b=>{const value=sessions.get(b.id)||{id:'cs_test_'+b.id,url:'https://checkout.stripe.com/c/pay/'+b.id};if(!sessions.has(b.id))creates++;sessions.set(b.id,value);return value;},payment:async b=>({state:payment,email:b.email}),calendarGet:async()=>calendar,calendarCreate:async()=>{calendarCalls++;calendar={state:'confirmed',meet:'https://meet.google.com/abc-defg-hij'};},asset:async edition=>Buffer.from(edition),send:async(payload,key)=>{mailCalls++;if(sends.has(key))assert.deepEqual(sends.get(key),payload);else sends.set(key,structuredClone(payload));}};
 const input={id:bookingId('owner','attempt'),owner:'owner',start:clock+4*3600000,edition:'en',email:'guest@example.test',price:'price_Test',origin:'https://preview.vercel.app'};
 return {p,input,store,sends,sessions,setPayment:v=>payment=v,setEvent:v=>calendar=v,setAvailable:v=>available=v,advance:n=>clock+=n,counts:()=>({creates,calendarCalls,mailCalls})};
}
async function prepared(f){await reserve(f.p,f.input);await startCheckout(f.p,f.input.id);}
test('50 simultaneous overlapping reservations admit exactly one ledger record',async()=>{const f=fixture();const out=await Promise.allSettled(Array.from({length:50},(_,i)=>reserve(f.p,{...f.input,id:bookingId('owner',String(i)),start:f.input.start+(i%2)*1800000})));assert.equal(out.filter(x=>x.status==='fulfilled').length,1);assert.equal(f.store.data.records.length,1);});
test('same attempt replay returns one hold; mutation of edition/time/email rejected',async()=>{const f=fixture();await Promise.all(Array.from({length:8},()=>reserve(f.p,f.input)));assert.equal(f.store.data.records.length,1);for(const change of [{edition:'es'},{email:'other@example.test'},{start:f.input.start+7200000}])await assert.rejects(reserve(f.p,{...f.input,...change}));});
test('buffer overlap blocked; nonoverlapping appointments permitted',async()=>{const f=fixture();await reserve(f.p,f.input);await assert.rejects(reserve(f.p,{...f.input,id:bookingId('o','2'),start:f.input.start+3600000}));await reserve(f.p,{...f.input,id:bookingId('o','3'),start:f.input.start+5400000});assert.equal(f.store.data.records.length,2);});
test('simulated calendar unavailability fails before any charge or hold',async()=>{const f=fixture();f.setAvailable(false);await assert.rejects(reserve(f.p,f.input));assert.equal(f.counts().creates,0);assert.equal(f.store.data.records.length,0);});
test('concurrent checkout retries share one provider idempotency identity',async()=>{const f=fixture();await reserve(f.p,f.input);await Promise.all(Array.from({length:6},()=>startCheckout(f.p,f.input.id)));assert.equal(f.counts().creates,1);assert.equal(f.sessions.size,1);});
test('lost Stripe create response is recovered using the same attempt',async()=>{const f=fixture();await reserve(f.p,f.input);const original=f.p.checkout;let once=true;f.p.checkout=async b=>{const result=await original(b);if(once){once=false;throw Error('response lost');}return result;};await assert.rejects(startCheckout(f.p,f.input.id));await startCheckout(f.p,f.input.id);assert.equal(f.counts().creates,1);});
test('lost committed ledger response cannot create a second hold',async()=>{const f=fixture();f.store.lostWrite=true;await assert.rejects(reserve(f.p,f.input));await reserve(f.p,f.input);assert.equal(f.store.data.records.length,1);});
test('expired local clock never releases open or asynchronous pending payment',async()=>{for(const state of ['open','pending']){const f=fixture();await prepared(f);f.advance(2*3600000);f.setPayment(state);await recover(f.p,f.input.id);await assert.rejects(reserve(f.p,{...f.input,id:bookingId('o','other')}));assert.equal(f.counts().calendarCalls,0);}});
test('only authoritative terminal unpaid expiration releases the interval',async()=>{const f=fixture();await prepared(f);f.setPayment('expired');await recover(f.p,f.input.id);assert.equal((await readBooking(f.store,f.input.id)).state,'released');await reserve(f.p,{...f.input,id:bookingId('o','other')});});
test('hold with no started provider operation can be safely released after expiry',async()=>{const f=fixture();await reserve(f.p,f.input);f.advance(2*3600000);assert.equal((await recover(f.p,f.input.id)).state,'released');});
test('uncertain checkout after replay window remains protected, never creates a fresh charge',async()=>{const f=fixture();await reserve(f.p,f.input);const original=f.p.checkout;f.p.checkout=async b=>{await original(b);throw Error('lost');};await assert.rejects(startCheckout(f.p,f.input.id));f.advance(25*3600000);await assert.rejects(recover(f.p,f.input.id));assert.equal(f.counts().creates,1);await assert.rejects(reserve(f.p,{...f.input,id:bookingId('o','new')}));});
test('duplicate verified payment notifications create one event and one entitlement/email',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');await Promise.allSettled(Array.from({length:10},()=>recover(f.p,f.input.id)));await recover(f.p,f.input.id);assert.equal(f.counts().calendarCalls,1);assert.equal(f.sends.size,1);assert.equal((await readBooking(f.store,f.input.id)).state,'confirmed');assert.equal(f.store.data.records.length,1);});
test('calendar POST committed but response lost recovers with GET and never repeats POST',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');const create=f.p.calendarCreate;f.p.calendarCreate=async b=>{await create(b);throw Error('lost');};await assert.rejects(recover(f.p,f.input.id));await recover(f.p,f.input.id);assert.equal(f.counts().calendarCalls,1);assert.equal((await readBooking(f.store,f.input.id)).state,'confirmed');});
test('calendar POST uncommitted/unknown stays pending; no second POST, email or access',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');let calls=0;f.p.calendarCreate=async()=>{calls++;throw Error('unknown');};await assert.rejects(recover(f.p,f.input.id));await recover(f.p,f.input.id);assert.equal(calls,1);assert.equal(f.sends.size,0);assert.equal((await readBooking(f.store,f.input.id)).state,'paid_pending');});
test('external calendar conflict after payment goes to review without another charge',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');f.setAvailable(false);await recover(f.p,f.input.id);assert.equal((await readBooking(f.store,f.input.id)).state,'review');assert.equal(f.counts().calendarCalls,0);assert.equal(f.sends.size,0);assert.equal(f.counts().creates,1);});
test('pending Meet never grants confirmation or fulfillment',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');f.p.calendarCreate=async()=>f.setEvent({state:'pending'});await recover(f.p,f.input.id);assert.equal((await readBooking(f.store,f.input.id)).state,'paid_pending');assert.equal(f.sends.size,0);});
test('email committed then response lost retries same frozen payload/key without duplicate send',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');const send=f.p.send;let once=true;f.p.send=async(...args)=>{await send(...args);if(once){once=false;throw Error('response lost');}};await assert.rejects(recover(f.p,f.input.id));await recover(f.p,f.input.id);assert.equal(f.sends.size,1);assert.equal((await readBooking(f.store,f.input.id)).mail.sent,true);});
test('uncertain email beyond provider idempotency window is quarantined, never blindly resent',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');const send=f.p.send;f.p.send=async(...args)=>{await send(...args);throw Error('lost');};await assert.rejects(recover(f.p,f.input.id));f.advance(24*3600000);await assert.rejects(fulfill(f.p,f.input.id));assert.equal(f.counts().mailCalls,1);});
test('both language selections get exactly their own complimentary entitlement; no second Checkout',async()=>{for(const edition of ['en','es']){const f=fixture();f.input.edition=edition;await prepared(f);f.setPayment('paid');await recover(f.p,f.input.id);const b=await readBooking(f.store,f.input.id);assert.equal((await authorized(f.p,token(b,'ebook',f.p.secret),'ebook')).edition,edition);assert.ok([...f.sends.values()][0].text.includes(edition==='en'?'English':'Español'));assert.equal(f.counts().creates,1);}});
test('refunds and calendar cancellations immediately deny Room/ebook links',async()=>{for(const kind of ['refund','cancel']){const f=fixture();await prepared(f);f.setPayment('paid');await recover(f.p,f.input.id);const b=await readBooking(f.store,f.input.id),raw=token(b,'room',f.p.secret);if(kind==='refund')f.setPayment('revoked');else f.setEvent({state:'cancelled'});await assert.rejects(authorized(f.p,raw,'room'));await recover(f.p,f.input.id);assert.equal((await readBooking(f.store,f.input.id)).state,'revoked');}});
test('wrong kind, language, tampered and expired bearer claims denied',async()=>{const f=fixture();await prepared(f);f.setPayment('paid');await recover(f.p,f.input.id);const b=await readBooking(f.store,f.input.id),raw=token(b,'room',f.p.secret);assert.throws(()=>claim(raw,'ebook',f.p.secret,f.p.now()));assert.throws(()=>claim(raw+'!','room',f.p.secret,f.p.now()));f.advance(7*86400000+1);await assert.rejects(authorized(f.p,raw,'room'));});
test('missing ledger or persistent CAS conflicts fail closed, not in-memory fallback',async()=>{const f=fixture();f.p.store={read:async()=>{throw Error('missing');},write:async()=>{}};await assert.rejects(reserve(f.p,f.input));const store=new MemoryStore();store.write=async()=>{throw new Conflict();};await assert.rejects(transaction(store,()=>true));});
test('configuration refuses live and production; no fabricated hours; DST uses approved local windows',()=>{assert.equal(ready({}),false);assert.equal(ready({BOOKING_ENABLED:'true',STRIPE_SECRET_KEY:'sk_live_forbidden'}),false);assert.throws(()=>policy({}));const p={timezone:'America/Chicago',windows:[{day:1,start:'09:00',end:'17:00'}],noticeMinutes:60,horizonDays:30,bufferMinutes:15};const now=Date.UTC(2026,9,20);assert.equal(permitted(Date.UTC(2026,10,2,15),p,now),true);assert.equal(permitted(Date.UTC(2026,10,2,9),p,now),false);});
test('unconfigured HTTP/webhook API cannot confirm, charge or reveal content',async()=>{const response=()=>({code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.data=v;return this;}});let r=response();await api({method:'GET',headers:{}},r);assert.equal(r.data.ready,false);r=response();await webhook({method:'POST',headers:{}},r);assert.equal(r.code,503);assert.equal(r.data.bookingConfirmed,undefined);});

test('verified webhook can recover a lost checkout linkage without creating another charge',async()=>{const f=fixture();await reserve(f.p,f.input);const original=f.p.checkout;f.p.checkout=async b=>{await original(b);throw Error('response lost');};await assert.rejects(startCheckout(f.p,f.input.id));f.advance(40*60000);const session=[...f.sessions.values()][0];f.setPayment('paid');await linkCheckout(f.p,f.input.id,session.id);await recover(f.p,f.input.id);assert.equal(f.counts().creates,1);assert.equal((await readBooking(f.store,f.input.id)).state,'confirmed');});
async function adapters(){
 const f=fixture(),env={BOOKING_ENABLED:'true',VERCEL_ENV:'preview',STRIPE_SECRET_KEY:'sk_test_fixture',BOOKING_TEST_CALENDAR_ID:'test-calendar@example.test',GOOGLE_CLIENT_ID:'fixture',GOOGLE_CLIENT_SECRET:'fixture',GOOGLE_REFRESH_TOKEN:'fixture',BOOKING_CALENDAR_WRITE_APPROVED:'true',BOOKING_AVAILABILITY_JSON:JSON.stringify({timezone:'America/Chicago',windows:[{day:1,start:'09:00',end:'17:00'}],noticeMinutes:60,horizonDays:30,bufferMinutes:15}),BOOKING_DATABASE_URL:'postgresql://fixture:fixture@ep-booking-test-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full',BOOKING_TEST_DATABASE_HOST:'ep-booking-test-pooler.us-east-2.aws.neon.tech',BOOKING_STRIPE_PRICE_ID:'price_Test',BOOKING_WEBHOOK_SECRET:'whsec_fixture',BOOKING_ACCESS_SECRET:'s'.repeat(48),BOOKING_RECOVERY_SECRET:'r'.repeat(48),EBOOK_BLOB_READ_WRITE_TOKEN:'fixture',EBOOK_STRIPE_ACCOUNT_ID:'acct_fixture',RESEND_API_KEY:'fixture',EBOOK_RECEIPT_FROM:'Lab <test@example.test>',EBOOK_DOWNLOAD_SECRET:'e'.repeat(48),EBOOK_PUBLIC_ORIGIN:'https://preview.vercel.app'};
 let event=null,snapshot=null,pi={livemode:false,status:'succeeded',currency:'usd',amount_received:17500,latest_charge:{paid:true,refunded:false,amount_refunded:0,disputed:false}};
 const calls=[],googleCalls=[];
 const stripe={accounts:{retrieve:async()=>({id:'acct_fixture',charges_enabled:true})},prices:{retrieve:async()=>({active:true,livemode:false,currency:'usd',unit_amount:17500,type:'one_time'})},checkout:{sessions:{create:async(params,options)=>{calls.push({params,options});snapshot={id:'cs_test_fixture',livemode:false,mode:'payment',status:'complete',payment_status:'paid',client_reference_id:params.client_reference_id,metadata:params.metadata,amount_total:17500,currency:'usd',payment_intent:'pi_fixture',customer_email:params.customer_email};return {...snapshot,url:'https://checkout.stripe.com/c/pay/fixture'};},retrieve:async()=>structuredClone(snapshot),listLineItems:async()=>({has_more:false,data:[{quantity:1,price:{id:'price_Test'},amount_total:17500}]})}},paymentIntents:{retrieve:async()=>structuredClone(pi)}};
 const fetch=async(url,options={})=>{
  googleCalls.push({url,options});let value;
  if(url.includes('oauth2.googleapis.com'))value={access_token:'fixture-access'};
  else if(url.endsWith('/freeBusy'))value={calendars:{[env.BOOKING_TEST_CALENDAR_ID]:{busy:[]}}};
  else if(options.method==='POST' && url.includes('/events?')){event={...JSON.parse(options.body),status:'confirmed'};event.conferenceData={createRequest:{status:{statusCode:'success'}},entryPoints:[{entryPointType:'video',uri:'https://meet.google.com/abc-defg-hij'}]};value=event;}
  else if(url.includes('/events?'))value={items:event?[event]:[]};
  else if(url.includes('/events/')){if(!event)return new Response('{}',{status:404});value=event;}
  else throw Error('Unexpected Google URL');return new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
 };
 const ebook={stripe,readAsset:edition=>readFile('../final-ebooks/'+(edition==='en'?'The_Possibility_English_Final.pdf':'La_Posibilidad_Spanish_Final.pdf')),sendReceipt:async()=>{}};
 // Explicit paths are outside git/public. Tests fail rather than substitute missing PDF bytes.

 const p=await runtime(env,{stripe,fetch,ebook,store:f.store});p.now=f.p.now;
 return {f,p,env,calls,googleCalls,order:()=>snapshot,pi:()=>pi,event:()=>event,stripe};
}
test('runtime adapters (simulated providers): exact $175 Checkout params and one edition; verified Calendar/Meet and private PDF bytes',async()=>{for(const edition of ['en','es']){const {f,p,calls,googleCalls}=await adapters();f.input.edition=edition;await reserve(p,f.input);await startCheckout(p,f.input.id);await recover(p,f.input.id);assert.equal(calls.length,1);assert.deepEqual(calls[0].params.line_items,[{price:'price_Test',quantity:1}]);assert.equal(calls[0].params.metadata.ebook_edition,edition);assert.equal(calls[0].options.idempotencyKey,'booking-checkout-'+f.input.id);assert.ok(!('payment_method_types' in calls[0].params));assert.equal(calls[0].params.expires_at,Math.floor((f.p.now()+3600000)/1000));assert.equal(googleCalls.filter(x=>x.options.method==='POST'&&x.url.includes('/events?')).length,1);const b=await readBooking(p.store,f.input.id);assert.equal(b.state,'confirmed');assert.ok(b.mail.sent);assert.equal((await p.asset(edition)).subarray(0,5).toString(),'%PDF-');}});
test('runtime payment adapter (simulated Stripe) rejects wrong binding, edition, amount, mode and duplicate line items',async()=>{for(const change of [{amount_total:999},{currency:'eur'},{livemode:true},{client_reference_id:'wrong'},{metadata:{application:'bhaves-lab',purchase_kind:'ebook'}},{metadata:{application:'bhaves-lab',purchase_kind:'booking',booking_id:'wrong',ebook_edition:'es'}}]){const {f,p,order}=await adapters();await reserve(p,f.input);const b=await startCheckout(p,f.input.id);Object.assign(order(),change);await assert.rejects(p.payment(b));}});
test('runtime payment adapter (simulated Stripe) checks actual charge refund/dispute and terminal payment status',async()=>{for(const change of [{refunded:true},{amount_refunded:1},{disputed:true}]){const {f,p,pi}=await adapters();await reserve(p,f.input);const b=await startCheckout(p,f.input.id);Object.assign(pi().latest_charge,change);assert.equal((await p.payment(b)).state,'revoked');}const {f,p,order,pi}=await adapters();await reserve(p,f.input);const b=await startCheckout(p,f.input.id);order().status='expired';order().payment_status='unpaid';pi().status='processing';assert.equal((await p.payment(b)).state,'pending');pi().status='canceled';assert.equal((await p.payment(b)).state,'expired');});
test('runtime Calendar adapter (simulated Google) denies moved, wrong-owner and cancelled reservations',async()=>{for(const mode of ['moved','owner','cancelled']){const {f,p,event}=await adapters();await reserve(p,f.input);await startCheckout(p,f.input.id);await recover(p,f.input.id);const b=await readBooking(p.store,f.input.id);if(mode==='moved'){event().start.dateTime=new Date(b.start+3600000).toISOString();await assert.rejects(p.calendarGet(b));}else if(mode==='owner'){event().extendedProperties.private.labBooking='wrong';await assert.rejects(p.calendarGet(b));}else{event().status='cancelled';assert.equal((await p.calendarGet(b)).state,'cancelled');}}});

test('new reservations fail closed when the recovery heartbeat is absent or stale',async()=>{for(const recoveryAt of [undefined,1]){const f=fixture();f.store.data.recoveryAt=recoveryAt;await assert.rejects(reserve(f.p,f.input),/recovery is offline/);assert.equal(f.store.data.records.length,0);assert.equal(f.counts().creates,0);}});

test('runtime adapter rejects duplicated price lines and a wrong-language binding',async()=>{const {f,p,stripe,order}=await adapters();await reserve(p,f.input);const b=await startCheckout(p,f.input.id);order().metadata.ebook_edition='es';await assert.rejects(p.payment(b));order().metadata.ebook_edition='en';stripe.checkout.sessions.listLineItems=async()=>({has_more:false,data:[{quantity:1,price:{id:'price_Test'},amount_total:17500},{quantity:1,price:{id:'price_Test'},amount_total:17500}]});await assert.rejects(p.payment(b));});
test('scoped authorization rejects a validly signed wrong edition and keeps future-session Room links valid',async()=>{const f=fixture();f.input.start+=20*86400000;await prepared(f);f.setPayment('paid');await recover(f.p,f.input.id);const b=await readBooking(f.store,f.input.id);await assert.rejects(authorized(f.p,token({...b,edition:'es'},'ebook',f.p.secret),'ebook'));const room=token(b,'room',f.p.secret);f.advance(8*86400000);assert.equal((await authorized(f.p,room,'room')).id,b.id);await assert.rejects(authorized(f.p,token(b,'ebook',f.p.secret),'ebook'));});
test('HTTP cross-origin checkout and unauthorized recovery are rejected before provider initialization',async()=>{const before=process.env.EBOOK_PUBLIC_ORIGIN;process.env.EBOOK_PUBLIC_ORIGIN='https://preview.vercel.app';const response=()=>({code:200,setHeader(){},status(n){this.code=n;return this;},json(v){this.data=v;return this;}});try{let r=response();await api({method:'POST',headers:{origin:'https://evil.example'},body:{action:'checkout'}},r);assert.equal(r.code,403);r=response();await api({method:'POST',headers:{origin:'https://preview.vercel.app',authorization:'Bearer wrong'},body:{action:'recover'}},r);assert.equal(r.code,403);}finally{if(before===undefined)delete process.env.EBOOK_PUBLIC_ORIGIN;else process.env.EBOOK_PUBLIC_ORIGIN=before;}});
test('booking webhook rejects an invalid raw signature even with test configuration present',async()=>{const {Readable}=await import('node:stream');const {env}=await adapters();const old={};for(const [key,value]of Object.entries(env)){old[key]=process.env[key];process.env[key]=value;}try{const req=Object.assign(Readable.from([Buffer.from('{}')]),{method:'POST',headers:{'stripe-signature':'invalid'}}),res={code:200,setHeader(){},status(n){this.code=n;return this;},json(v){this.data=v;return this;}};await webhook(req,res);assert.equal(res.code,400);}finally{for(const [key,value]of Object.entries(old)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}});

test('booking database requires a pinned TLS Preview endpoint', async () => {
 const { bookingDatabaseUrl } = await import('../.qa/booking-runtime/_lib/booking/postgres.js');
 const { env } = await adapters();
 assert.equal(bookingDatabaseUrl(env), env.BOOKING_DATABASE_URL);
 for (const changes of [
  { VERCEL_ENV: 'production' },
  { BOOKING_TEST_DATABASE_HOST: undefined },
  { BOOKING_DATABASE_URL: env.BOOKING_DATABASE_URL.replace('ep-booking-test', 'ep-main') },
 ]) assert.equal(bookingDatabaseUrl({ ...env, ...changes }), undefined);
 const fallback = bookingDatabaseUrl({ ...env, BOOKING_DATABASE_URL: undefined,
  DATABASE_URL: env.BOOKING_DATABASE_URL + '&sslmode=disable' });
 assert.equal(fallback, env.BOOKING_DATABASE_URL);
});

test('PostgreSQL serializes reservations and persists interrupted checkout recovery', {
 skip: !process.env.BOOKING_LOCAL_TEST_URL && 'Requires a fresh disposable local PostgreSQL database',
}, async () => {
 const url = new URL(process.env.BOOKING_LOCAL_TEST_URL);
 assert.equal(url.hostname, '127.0.0.1');
 assert.equal(url.pathname, '/booking_test');
 assert.equal(url.search, '');
 const { Pool } = await import('pg');
 const { PostgresStore } = await import('../.qa/booking-runtime/_lib/booking/postgres.js');
 const connectionString = url.toString();
 const pool = new Pool({ connectionString, max: 8 });
 const restartedPool = new Pool({ connectionString });
 try {
  await pool.query(await readFile(new URL('../db/booking.sql', import.meta.url), 'utf8'));
  const f = fixture();
  f.p.store = new PostgresStore(pool, f.p.buffer);
  await transaction(f.p.store, d => { d.recoveryAt = f.p.now(); });
  const candidates = Array.from({ length: 16 }, (_, i) => ({ ...f.input,
   id: bookingId('owner', String(i)), start: f.input.start + (i % 2) * 1800000 }));
  const outcomes = await Promise.allSettled(candidates.map(input => reserve(f.p, input)));
  const winners = outcomes.filter(outcome => outcome.status === 'fulfilled');
  assert.equal(winners.length, 1);
  for (const outcome of outcomes.filter(x => x.status === 'rejected'))
   assert.equal(outcome.reason.status, 409);
  const id = winners[0].value.id;
  const snapshot = await f.p.store.read();
  assert.equal(snapshot.data.records.length, 1);

  // Bypass the service's overlap check to exercise the database constraint.
  const conflict = { ...snapshot.data.records[0], id: bookingId('owner', 'raw') };
  conflict.eventId = 'b' + conflict.id;
  await assert.rejects(f.p.store.write({ ...snapshot.data, revision: snapshot.data.revision + 1,
   records: [...snapshot.data.records, conflict] }, snapshot.etag), { status: 409 });
  assert.deepEqual(await f.p.store.read(), snapshot);

  const checkout = f.p.checkout;
  f.p.checkout = async b => {
   await checkout(b);
   throw new Error('Lost checkout response');
  };
  await assert.rejects(startCheckout(f.p, id), /Lost checkout response/);
  await assert.rejects(f.p.store.write({ ...snapshot.data, revision: snapshot.data.revision + 1 },
   snapshot.etag), Conflict);

  f.p.store = new PostgresStore(restartedPool, f.p.buffer);
  f.p.checkout = checkout;
  await startCheckout(f.p, id);
  f.setPayment('paid');
  const notices = await Promise.allSettled(Array.from({ length: 8 }, () => recover(f.p, id)));
  for (const notice of notices) if (notice.status === 'rejected')
   assert.equal(notice.reason.status, 409, String(notice.reason));
  const booking = await recover(f.p, id);
  assert.equal(booking.state, 'confirmed');
  assert.equal(booking.mail.sent, true);
  assert.equal(f.sends.size, 1);
  assert.equal(f.counts().creates, 1);
  assert.equal(f.counts().calendarCalls, 1);
  assert.equal((await authorized(f.p, token(booking, 'room', f.p.secret), 'room')).id, id);
 } finally {
  await Promise.all([pool.end(), restartedPool.end()]);
 }
});
