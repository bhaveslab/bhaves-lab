import { execFileSync } from 'node:child_process';
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit','false','--strict','--skipLibCheck','--esModuleInterop','--target','ES2020','--module','NodeNext','--moduleResolution','NodeNext','--rootDir','api','--outDir','.qa/booking-runtime','api/booking.ts','api/booking-webhook.ts','api/clarity-access.ts'],{stdio:'inherit'});
execFileSync(process.execPath,['--test','tests/booking.test.mjs'],{stdio:'inherit'});
