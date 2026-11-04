const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
const source = ts.transpileModule(
  fs.readFileSync("api/clarity-access.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
const context = { exports: {} };
vm.runInNewContext(source, context);
async function invoke(extra = {}) {
  const result = {
    code: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(c) {
      this.code = c;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  await context.exports.default({ method: "GET", ...extra }, result);
  return result;
}
test("room access fails closed while booking verification is unavailable", async () => {
  const r = await invoke();
  assert.equal(r.code, 503);
  assert.equal(r.data.paymentVerified, false);
  assert.equal(r.data.availabilityVerified, false);
  assert.equal(r.headers["Cache-Control"], "no-store");
});
test("forged paid, confirmed, checkout and bearer claims never unlock the room", async () => {
  for (const extra of [
    { query: { paid: "true", confirmed: "true" } },
    { query: { session_id: "cs_fake" } },
    { headers: { authorization: "Bearer fake" } },
    { body: { paymentVerified: true, availabilityVerified: true } },
  ]) {
    const r = await invoke(extra);
    assert.notEqual(r.data.access, "confirmed");
    assert.equal(r.code, 503);
  }
});
test("unsupported access methods are rejected", async () => {
  const r = await invoke({ method: "POST" });
  assert.equal(r.code, 405);
  assert.equal(r.headers.Allow, "GET");
});
