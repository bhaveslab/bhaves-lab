import assert from "node:assert/strict";
process.env.VERCEL_URL ??= "preview.vercel.app";
const res = () => ({
  code: 200,
  headers: {},
  setHeader(k, v) {
    this.headers[k] = v;
  },
  status(n) {
    this.code = n;
    return this;
  },
  json(v) {
    this.data = v;
    return this;
  },
});
for (const [name, request, expected] of [
  ["catalog", { method: "GET" }, 200],
  ["download", { method: "POST", headers: {} }, 403],
  ["webhook", { method: "POST", headers: {} }, 503],
  ["order", { method: "GET", headers: {} }, 405],
  [
    "checkout",
    { method: "POST", headers: { origin: "https://evil.example" } },
    403,
  ],
]) {
  const { default: handler } = await import(
    "../.qa/ebook-runtime/ebooks/" + name + ".js"
  );
  const response = res();
  await handler(request, response);
  assert.equal(response.code, expected, name);
  assert.match(response.headers["Cache-Control"], /no-store/);
  if (name === "catalog") assert.equal(response.data.checkoutAvailable, false);
  console.log("PASS", name, expected);
}
