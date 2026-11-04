import {get,put} from '@vercel/blob';
const token=process.env.EBOOK_BLOB_READ_WRITE_TOKEN,path=process.env.BOOKING_LEDGER_PATH;
if(!token||!/^bookings\/test\/[a-zA-Z0-9_-]+\.json$/.test(path||'')||process.env.BOOKING_INITIALIZE_TEST_LEDGER!=='true'||process.env.BOOKING_ENABLED==='true')throw Error('Initialize only an explicitly approved test ledger with booking disabled and existing-store credentials.');
const existing=await get(path,{token,access:'private',useCache:false});
if(existing)throw Error('Ledger already exists. Never overwrite/reinitialize it.');
await put(path,JSON.stringify({version:1,revision:0,records:[]}),{token,access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
console.log('Initialized empty private test ledger. Run contention checks before enabling test booking.');
