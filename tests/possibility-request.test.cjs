const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
let sent = 0;
const source = ts.transpileModule(
  fs.readFileSync("api/possibility-request.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
const env = {};
const context = {
  exports: {},
  process: { env },
  URL,
  require: () => ({
    Resend: class {
      emails = {
        send: async () => {
          sent++;
          return { error: null };
        },
      };
    },
  }),
};
vm.runInNewContext(source, context);
const handler = context.exports.default;
const valid = {
  name: "Preview Test",
  email: "test@example.com",
  details: "A creative idea",
  availability: "Afternoons, Central",
  consent: "yes",
};
async function request(body, extra = {}) {
  const res = {
    code: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  await handler(
    {
      method: "POST",
      body,
      headers: { host: "bhaveslab.com", origin: "https://bhaveslab.com" },
      ...extra,
    },
    res,
  );
  return res;
}
test("rejects unsupported methods, malformed bodies, and cross-origin requests", async () => {
  assert.equal((await request(valid, { method: "GET" })).code, 405);
  assert.equal((await request("{")).code, 400);
  assert.equal((await request(null)).code, 400);
  assert.equal(
    (
      await request(valid, {
        headers: { host: "bhaveslab.com", origin: "https://other.example" },
      })
    ).code,
    403,
  );
});
test("validates required fields, bounds, consent, email, and honeypot", async () => {
  for (const change of [
    { name: "" },
    { details: "x".repeat(2001) },
    { consent: "no" },
    { email: "invalid" },
    { name: "a\nb" },
    { website: "spam" },
  ])
    assert.equal((await request({ ...valid, ...change })).code, 400);
  assert.equal(sent, 0);
});
test("never reports success while delivery is unconfigured", async () => {
  assert.equal((await request(valid)).code, 503);
  assert.equal(sent, 0);
});
test("reports success only after configured provider accepts the request", async () => {
  Object.assign(env, {
    RESEND_API_KEY: "mock",
    LAB_BOOKING_FROM: "mock@example.com",
    LAB_BOOKING_TO: "mock@example.com",
  });
  assert.equal((await request(valid)).code, 200);
  assert.equal(sent, 1);
});
