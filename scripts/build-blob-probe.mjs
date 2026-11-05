// One-off Preview build override only. No permanent ledger, PDF, Stripe, Calendar or email mutation.
import {execFileSync} from 'node:child_process';
if(process.env.VERCEL_ENV!=='preview')throw Error('Disposable Blob probe requires a Preview build.');
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit','false','--strict','--skipLibCheck','--esModuleInterop','--target','ES2020','--module','NodeNext','--moduleResolution','NodeNext','--rootDir','api','--outDir','.qa/booking-runtime','api/_lib/booking/service.ts'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-booking-blob.mjs'],{stdio:'inherit',env:{...process.env,BOOKING_BLOB_TEST_APPROVED:'true'}});
