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
    require: (name) =>
      name === "../components/ObservationField"
        ? load("src/components/ObservationField.tsx")
        : name.endsWith(".css")
          ? {}
          : require(name),
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
  const { RoomOfClarity } = load("api/_lib/RoomOfClarity.ts");
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

test("public introduction and booking are separate stages without instrument content", () => {
  const { Home } = load("src/pages/Home.tsx");
  const home = renderToStaticMarkup(React.createElement(Home));
  const { Booking } = load("src/pages/Booking.tsx");
  const booking = renderToStaticMarkup(React.createElement(Booking));
  assert.ok(!home.includes("<form"));
  assert.ok(home.includes('href="/booking"'));
  assert.ok(booking.includes("<form"));
  assert.ok(booking.includes("does not confirm a time"));
  for (const html of [home, booking])
    for (const word of [
      "Inner Mining",
      "Bio-Well observation",
      "Meditation",
      "Hypnosis",
    ])
      assert.ok(!html.includes(word));
});

test("Observatory leads without repeated booking calls or fictional shop products", () => {
  const { Home } = load("src/pages/Home.tsx");
  const html = renderToStaticMarkup(React.createElement(Home));
  assert.equal((html.match(/href="\/booking"/g) || []).length, 1);
  assert.ok(html.includes("Explore the Observatory"));
  assert.ok(html.includes("What do"));
  assert.ok(html.includes("Worlds"));
  assert.ok(html.includes("Patterns"));
  assert.ok(html.includes("Stories"));
  assert.ok(!html.includes("Book Your Session"));
  assert.ok(!html.includes("book-sculpture"));
  assert.ok(!html.includes("Room of Clarity"));
});

test("the session includes a selected ebook but a request grants no download", () => {
 const {Booking} = load("src/pages/Booking.tsx");
 const html = renderToStaticMarkup(React.createElement(Booking));
 assert.ok(html.includes('name="ebookEdition"'));
 assert.ok(html.includes('value="en"'));
 assert.ok(html.includes('value="es"'));
 assert.ok(html.includes('at no additional cost'));
 assert.ok(html.includes('Delivery follows'));
 assert.ok(!html.includes('href="/shop/delivery'));
});
