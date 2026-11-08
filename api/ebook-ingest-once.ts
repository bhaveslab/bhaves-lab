import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { get, put } from '@vercel/blob';
export const config = { api: { bodyParser: false } };
const expected = '14cce07e292853a1e2046df796124f48e78051f1b878241e9f0acd0749fba83d';
const hash = (b: Buffer|string) => createHash('sha256').update(b).digest('hex');
export default async function handler(req: VercelRequest, res: VercelResponse) {
 res.setHeader('Cache-Control','private, no-store');
 if (Date.now()/1000 > 1794149389) return res.status(410).end();
 if (req.method !== 'POST' || hash(req.headers.authorization || '') !== '46cf73c5606853af7d8b89ca9bd4e8b8ea9c14a7dd0e733c74f7fe265b220beb') return res.status(404).end();
 try {
  const chunks: Buffer[]=[]; let size=0;
  for await (const chunk of req) {const b=Buffer.from(chunk);size+=b.length;if(size>2979876)return res.status(413).end();chunks.push(b);}
  const bytes=Buffer.concat(chunks);
  if(bytes.length!==2979876 || hash(bytes)!==expected)return res.status(400).end();
  const path='ebooks/'+expected+'.pdf';
  const opts={access:'private' as const,storeId:process.env.BLOB_STORE_ID};
  let stored=await get(path,{...opts,useCache:false});
  if(!stored){await put(path,bytes,{...opts,addRandomSuffix:false,allowOverwrite:false,contentType:'application/pdf'});stored=await get(path,{...opts,useCache:false});}
  if(!stored || stored.statusCode!==200 || !stored.stream)throw Error();
  const saved=Buffer.from(await new Response(stored.stream).arrayBuffer());
  if(hash(saved)!==expected)throw Error();
  return res.status(200).json({saved:true,bytes:saved.length,sha256:expected});
 }catch{return res.status(503).json({error:'Private PDF ingestion unavailable.'});}
}
