import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
// Exercise emitted Node ESM, not just a transpiled CommonJS test fixture.
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc','--noEmit','false','--strict','--skipLibCheck','--esModuleInterop','--target','ES2020','--module','NodeNext','--moduleResolution','NodeNext','--jsx','react-jsx','--rootDir','api','--outDir','.qa/clarity-runtime','api/clarity-access.ts'],{stdio:'inherit'});
const {default:handler}=await import(pathToFileURL(resolve('.qa/clarity-runtime/clarity-access.js')).href);
const response={code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(data){this.data=data;return this}};
await handler({method:'GET',query:{paid:'true',confirmed:'true'}},response);
assert.equal(response.code,503);assert.equal(response.data.access,'unavailable');assert.equal(response.data.html,undefined);
console.log('PASS: emitted Node ESM imports and unconfigured access response');
