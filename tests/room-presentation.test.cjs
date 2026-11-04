const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(file) {
  const context = {
    exports: {},
    require: (name) => (name.endsWith(".css") ? {} : require(name)),
  };
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
test("room introduction contains optional instruments without add-on purchases or private links", () => {
  const { RoomOfClarity } = load("src/pages/RoomOfClarity.tsx");
  const html = renderToStaticMarkup(React.createElement(RoomOfClarity));
  for (const label of [
    "Inner Mining",
    "Bio-Well observation",
    "Meditation",
    "Hypnosis",
  ])
    assert.ok(html.includes(label));
  assert.ok(html.includes("No additional purchase is necessary"));
  assert.ok(
    !/app\.bhaveslab|Source Connect|Source Motion|checkout|\$/.test(html),
  );
});
test("unverified access renders checking state, not the room or instrument presentation", () => {
  const { ClarityAccess } = load("src/pages/ClarityAccess.tsx");
  const html = renderToStaticMarkup(React.createElement(ClarityAccess));
  assert.ok(html.includes("Checking your session access"));
  assert.ok(!html.includes("Inner Mining"));
  assert.ok(!html.includes("Bio-Well observation"));
});
