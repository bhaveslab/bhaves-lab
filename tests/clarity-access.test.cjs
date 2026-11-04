const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
function load(file, customRequire = require) {
  const context = { exports: {}, require: customRequire };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    context,
  );
  return context.exports;
}
const authorization = load("api/_lib/clarity-authorization.ts");
const room = load("api/_lib/RoomOfClarity.ts");
const confirmed = {
  infrastructureReady: true,
  identity: { subject: "guest-1" },
  booking: {
    ownerSubject: "guest-1",
    status: "confirmed",
    paymentStatus: "paid",
    reservationStatus: "confirmed",
  },
};
async function invoke(context, request = {}) {
  let renders = 0;
  const handler = load("api/clarity-access.ts", (name) =>
    name === "./_lib/clarity-authorization.js"
      ? {
          ...authorization,
          ...(context ? { resolveClarityContext: async () => context } : {}),
        }
      : name === "./_lib/RoomOfClarity.js"
        ? room
        : name === "react-dom/server"
          ? {
              renderToStaticMarkup(...args) {
                renders++;
                return require(name).renderToStaticMarkup(...args);
              },
            }
          : require(name),
  ).default;
  const res = {
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
  await handler({ method: "GET", ...request }, res);
  return { ...res, renders };
}
test("unconfigured integration fails closed without rendering any room content", async () => {
  const r = await invoke();
  assert.equal(r.code, 503);
  assert.equal(r.data.html, undefined);
  assert.equal(r.renders, 0);
  assert.equal(r.headers["Cache-Control"], "private, no-store");
});
test("URL, bearer, body, and email receipt claims do not authenticate or confirm a booking", async () => {
  for (const request of [
    { query: { paid: "true", confirmed: "true" } },
    { query: { session_id: "cs_fake" } },
    { headers: { authorization: "Bearer fake" } },
    { body: { requestReceived: true, bookingConfirmed: true } },
  ]) {
    const r = await invoke(null, request);
    assert.equal(r.code, 503);
    assert.equal(r.renders, 0);
    assert.equal(r.data.html, undefined);
  }
});
test("an unauthenticated visitor cannot receive room markup", async () => {
  const r = await invoke({ ...confirmed, identity: null });
  assert.equal(r.code, 401);
  assert.equal(r.renders, 0);
});
test("another guests booking never grants access", async () => {
  const r = await invoke({ ...confirmed, identity: { subject: "guest-2" } });
  assert.equal(r.code, 403);
  assert.equal(r.renders, 0);
});
test("requested, unpaid, refunded, or cancelled records never render the room", async () => {
  for (const change of [
    { status: "requested" },
    { status: "cancelled" },
    { paymentStatus: "unpaid" },
    { paymentStatus: "refunded" },
    { reservationStatus: "pending" },
    { reservationStatus: "cancelled" },
  ]) {
    const r = await invoke({
      ...confirmed,
      booking: { ...confirmed.booking, ...change },
    });
    assert.equal(r.code, 403);
    assert.equal(r.renders, 0);
    assert.equal(r.data.html, undefined);
  }
});
test("server-verified identity with its own confirmed paid reservation receives the presentation", async () => {
  const r = await invoke(confirmed);
  assert.equal(r.code, 200);
  assert.equal(r.renders, 1);
  assert.ok(r.data.html.includes("Inner Mining"));
  assert.ok(r.data.html.includes("Bio-Well observation"));
});
test("unsupported methods cannot trigger rendering", async () => {
  const r = await invoke(confirmed, { method: "POST" });
  assert.equal(r.code, 405);
  assert.equal(r.renders, 0);
});
