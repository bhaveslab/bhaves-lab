const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
let sent = 0;
let lastEmail;
let lastOptions;
let providerError = null;
let providerThrows = false;
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
  require: (name) =>
    name === "node:crypto"
      ? require(name)
      : {
          Resend: class {
            emails = {
              send: async (message, options) => {
                lastEmail = message;
                lastOptions = options;
                sent++;
                if (providerThrows)
                  throw new Error("Simulated provider failure");
                return { error: providerError };
              },
            };
          },
        },
};
vm.runInNewContext(source, context);
const handler = context.exports.default;
const valid = {
  name: "Preview Test",
  email: "test@example.com",
  details: "A creative idea",
  availability: "Afternoons, Central",
  consent: "yes",
  ebookEdition: "en",
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
    { ebookEdition: "fr" },
    { ebookEdition: undefined },
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
test("a received request explicitly remains unconfirmed and cannot open the room", async () => {
  const response = await request({
    ...valid,
    paid: true,
    bookingConfirmed: true,
    amount: 1,
  });
  assert.equal(response.code, 200);
  assert.equal(response.data.requestReceived, true);
  assert.equal(response.data.bookingConfirmed, false);
  assert.equal(response.data.access, undefined);
});

test("delivery rejection and exceptions never produce request receipts", async () => {
  providerError = { message: "Rejected" };
  let result = await request(valid);
  assert.equal(result.code, 502);
  assert.equal(result.data.requestReceived, undefined);
  providerError = null;
  providerThrows = true;
  result = await request(valid);
  assert.equal(result.code, 502);
  assert.equal(result.data.requestReceived, undefined);
  providerThrows = false;
});

test("request retains the included language and never delivers or confirms it", async () => {
  providerError = null;
  providerThrows = false;
  for (const [ebookEdition, label] of [
    ["en", "English"],
    ["es", "Spanish"],
  ]) {
    const result = await request({ ...valid, ebookEdition });
    assert.equal(result.code, 200);
    assert.match(
      lastEmail.text,
      new RegExp("Included ebook preference: " + label),
    );
    assert.match(lastEmail.text, /This request creates no ebook entitlement/);
    assert.equal(result.data.bookingConfirmed, false);
    assert.equal(result.data.download, undefined);
    const key = lastOptions.idempotencyKey;
    await request({ ...valid, ebookEdition });
    assert.equal(lastOptions.idempotencyKey, key);
    assert.match(key, /^session-request-[a-f0-9]{64}$/);
  }
});
