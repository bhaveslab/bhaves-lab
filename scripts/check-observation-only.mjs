import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const paths = ['booking', 'booking-webhook', 'clarity-access', 'create-checkout-session', 'possibility-request', 'ebooks/catalog', 'ebooks/checkout', 'ebooks/order', 'ebooks/download', 'ebooks/webhook'];
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '--strict', '--skipLibCheck', '--esModuleInterop', '--target', 'ES2020', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--rootDir', 'api', '--outDir', '.qa/observation-runtime', ...paths.map(path => 'api/' + path + '.ts')], { stdio: 'inherit' });
let methods = 0;
for (const path of paths) {
  const { default: handler } = await import('../.qa/observation-runtime/' + path + '.js');
  for (const method of ['GET', 'POST', 'OPTIONS']) {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    // No request payload, credentials, payment flags or provider initialization
    // should be consulted by retired endpoints, including webhook/recovery paths.
    const request = new Proxy({ method }, { get() { throw new Error('Retired endpoint inspected a request'); } });
    await handler(request, res);
    assert.equal(res.code, 410, path + ' ' + method);
    assert.match(res.headers['Cache-Control'], /no-store/);
    assert.deepEqual(res.body, { error: 'This endpoint is no longer available.' });
    methods++;
  }
}
function load(file) {
  const context = { exports: {}, require: name => name.endsWith('.css') ? {} : name === '../components/ObservationField' ? load('src/components/ObservationField.tsx') : require(name) };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return context.exports;
}
const html = renderToStaticMarkup(React.createElement(load('src/pages/Home.tsx').Home));
for (const forbidden of [/\$\d/, /href="\/(shop|booking|room-of-clarity)/, /app\.bhaveslab\.com/, /checkout|subscription|membership/i, /<form\b/]) assert.ok(!forbidden.test(html), String(forbidden));
assert.ok(html.includes('mailto:info@bhaveslab.com'));
assert.ok(html.includes('The Gentleman of Possibility'));
for (const [, href] of html.matchAll(/href="(#[^"]+)"/g)) assert.ok(html.includes('id="' + href.slice(1) + '"'), 'Missing anchor ' + href);
for (const [, src] of html.matchAll(/src="(\/[^\"]+)"/g)) assert.ok(existsSync('public' + src), 'Missing image ' + src);
for (const name of readdirSync('dist/assets')) {
  assert.ok(!/^(Booking|PaidBooking|EbookShop|ClarityAccess|RoomOfClarity|CheckoutOverlay|CartDrawer)-/.test(name), 'Retired client chunk emitted: ' + name);
  if (name.endsWith('.js')) {
    const code = readFileSync('dist/assets/' + name, 'utf8');
    assert.ok(!/app\.bhaveslab\.com|\/api\/booking|\/api\/ebooks|\/api\/create-checkout-session/.test(code), 'Private/commercial client route in ' + name);
  }
}
console.log(JSON.stringify({ retiredApiMethodChecks: methods, publicContact: true, publicCommerce: false, privateClientRoutes: false, anchorsAndImages: 'pass' }, null, 2));
