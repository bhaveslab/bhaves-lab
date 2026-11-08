import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Stripe from "stripe";
import { EBOOKS } from "../.qa/ebook-runtime/_lib/ebooks/catalog.js";
import {
  digest,
  mintDownload,
  verifyDownload,
} from "../.qa/ebook-runtime/_lib/ebooks/security.js";
import {
  startCheckout,
  paidOrder,
  fulfillCheckout,
  download,
  receiptAccess,
  processEbookEvent,
} from "../.qa/ebook-runtime/_lib/ebooks/service.js";
import { rawBody } from "../.qa/ebook-runtime/ebooks/webhook.js";
const env = {
  STRIPE_SECRET_KEY: "sk_test_fixture",
  STRIPE_WEBHOOK_SECRET_EBOOKS: "whsec_fixture",
  EBOOK_STRIPE_ACCOUNT_ID: "acct_expected",
  STRIPE_EBOOK_EN_PRICE_ID: "price_English",
  STRIPE_EBOOK_ES_PRICE_ID: "price_Spanish",
  EBOOK_BLOB_READ_WRITE_TOKEN: "fixture",
  RESEND_API_KEY: "fixture",
  EBOOK_RECEIPT_FROM: "Books <test@example.com>",
  EBOOK_DOWNLOAD_SECRET: "x".repeat(48),
  EBOOK_PUBLIC_ORIGIN: "https://bhaveslab.com",
  EBOOK_RETAIL_APPROVED: "true",
  VERCEL_ENV: "preview",
};
const now = Math.floor(Date.now() / 1000);
const fixtureFiles = {
  en: process.env.EBOOK_TEST_EN_FILE,
  es: process.env.EBOOK_TEST_ES_FILE,
};
const fixtures = Object.values(fixtureFiles).every(Boolean);
const assetTest = (name, fn) => test(name, { skip: !fixtures }, fn);
function setup(edition = "en") {
  const owner = "f".repeat(64);
  const state = {
    order: {
      id: "cs_test_order123",
      created: now - 20,
      livemode: false,
      mode: "payment",
      status: "complete",
      payment_status: "paid",
      amount_total: 999,
      currency: "usd",
      payment_intent: "pi_fixture",
      customer_details: { email: "buyer@example.com" },
      metadata: {
        application: "bhaves-lab",
        purchase_kind: "ebook",
        ebook_sku: EBOOKS[edition].sku,
        ebook_asset_sha256: EBOOKS[edition].sha256,
        ebook_receipt_owner: digest(owner),
        ebook_receipt_origin: "https://bhaveslab.com",
      },
    },
    payment: {
      status: "succeeded",
      amount_received: 999,
      currency: "usd",
      latest_charge: {
        paid: true,
        refunded: false,
        amount_refunded: 0,
        disputed: false,
      },
    },
    sends: new Map(),
    calls: [],
    failEmail: false,
  };
  const ports = {
    stripe: {
      accounts: {
        retrieve: async () => ({ id: "acct_expected", charges_enabled: true }),
      },
      prices: {
        retrieve: async (id) => ({
          id,
          active: true,
          currency: "usd",
          unit_amount: 999,
          type: "one_time",
          livemode: false,
        }),
      },
      checkout: {
        sessions: {
          create: async (data, options) => {
            state.calls.push({ data, options });
            return { url: "https://checkout.stripe.com/c/test" };
          },
          retrieve: async () => structuredClone(state.order),
          listLineItems: async () => ({
            has_more: false,
            data: [
              {
                quantity: 1,
                price: { id: env[EBOOKS[edition].priceEnv] },
                amount_total: 999,
              },
            ],
          }),
          update: async (id, data) => {
            Object.assign(state.order.metadata, data.metadata);
            return state.order;
          },
        },
      },
      paymentIntents: { retrieve: async () => structuredClone(state.payment) },
    },
    readAsset: async (lang) => readFile(fixtureFiles[lang]),
    sendReceipt: async (data) => {
      if (state.failEmail) throw Error("mail unavailable");
      const prior = state.sends.get(data.idempotencyKey);
      if (prior) assert.deepEqual(data, prior);
      state.sends.set(data.idempotencyKey, data);
    },
  };
  return { state, ports, owner, edition };
}
test("unconfigured and live preview checkout fail closed", async () => {
  const { ports } = setup();
  await assert.rejects(startCheckout("en", "seed", "req", ports, {}));
  await assert.rejects(
    startCheckout("en", "seed", "req", ports, {
      ...env,
      STRIPE_SECRET_KEY: "sk_live_forbidden",
      EBOOK_ALLOW_LIVE_PAYMENTS: "true",
    }),
  );
});
test("signed tokens reject tampering, expiry, arbitrary paths, and wrong token kinds", () => {
  const token = mintDownload(
    { id: "cs_test_order123", created: now },
    "en",
    env.EBOOK_DOWNLOAD_SECRET,
  );
  assert.equal(verifyDownload(token, env.EBOOK_DOWNLOAD_SECRET).edition, "en");
  assert.throws(() =>
    verifyDownload(token.replace(/.$/, "!"), env.EBOOK_DOWNLOAD_SECRET),
  );
  assert.throws(() =>
    verifyDownload(token, env.EBOOK_DOWNLOAD_SECRET, now + 604801),
  );
  assert.throws(() =>
    verifyDownload("../../public/book.pdf", env.EBOOK_DOWNLOAD_SECRET),
  );
  assert.throws(() => verifyDownload(token, "y".repeat(48)));
});
test("unpaid, wrong totals/currency, booking purchases and wrong asset versions are denied", async () => {
  for (const change of [
    { payment_status: "unpaid" },
    { amount_total: 1 },
    { currency: "eur" },
    { status: "expired" },
    { metadata: { purchase_kind: "booking" } },
    {
      metadata: {
        ...setup().state.order.metadata,
        ebook_asset_sha256: "wrong",
      },
    },
  ]) {
    const { ports, state } = setup();
    Object.assign(state.order, change);
    await assert.rejects(paidOrder(state.order.id, ports, env));
  }
});
test("refunds, partial refunds, disputes, and failed payment intents revoke access", async () => {
  for (const change of [
    { refunded: true },
    { amount_refunded: 1 },
    { disputed: true },
  ]) {
    const { ports, state } = setup();
    Object.assign(state.payment.latest_charge, change);
    await assert.rejects(paidOrder(state.order.id, ports, env));
  }
  const { ports, state } = setup();
  state.payment.status = "canceled";
  await assert.rejects(paidOrder(state.order.id, ports, env));
});
test("session ID or redirect alone cannot claim a receipt", async () => {
  const { ports, state } = setup();
  await assert.rejects(receiptAccess(state.order.id, null, ports, env));
  await assert.rejects(receiptAccess(state.order.id, "attacker", ports, env));
});
test("validly signed but wrong-language or unfulfilled download is denied", async () => {
  const { ports, state } = setup();
  await assert.rejects(
    download(
      mintDownload(state.order, "es", env.EBOOK_DOWNLOAD_SECRET),
      ports,
      env,
    ),
  );
  await assert.rejects(
    download(
      mintDownload(state.order, "en", env.EBOOK_DOWNLOAD_SECRET),
      ports,
      env,
    ),
  );
});
test("webhook signatures require exact raw bytes and signing secret", () => {
  const stripe = new Stripe("sk_test_fixture");
  const payload = JSON.stringify({
    id: "evt_fixture",
    type: "checkout.session.completed",
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: "whsec_fixture",
  });
  assert.equal(
    stripe.webhooks.constructEvent(payload, signature, "whsec_fixture").id,
    "evt_fixture",
  );
  assert.throws(() =>
    stripe.webhooks.constructEvent(payload + " ", signature, "whsec_fixture"),
  );
  assert.throws(() =>
    stripe.webhooks.constructEvent(payload, signature, "wrong"),
  );
});
test("webhook raw bodies are bounded", async () => {
  async function* oversized() {
    yield Buffer.alloc(1048577);
  }
  await assert.rejects(rawBody(oversized()));
  async function* split() {
    yield Buffer.from("ab");
    yield Buffer.from("cd");
  }
  assert.equal((await rawBody(split())).toString(), "abcd");
});
test("booking events, unpaid events, and asynchronous failure cannot fulfill ebooks", async () => {
  const { ports, state } = setup();
  for (const event of [
    {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { purchase_kind: "booking" },
          payment_status: "paid",
        },
      },
    },
    {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { purchase_kind: "ebook" },
          payment_status: "unpaid",
        },
      },
    },
    {
      type: "checkout.session.async_payment_failed",
      data: { object: state.order },
    },
  ])
    await processEbookEvent({ livemode: false, ...event }, ports, env);
  assert.equal(state.sends.size, 0);
});
assetTest(
  "checkout uses approved server price, one copy, separate edition, and no session entitlement",
  async () => {
    const { ports, state, owner } = setup();
    await startCheckout("en", owner, "test-request", ports, env);
    const { data, options } = state.calls[0];
    assert.deepEqual(data.line_items, [
      { price: "price_English", quantity: 1 },
    ]);
    assert.equal(data.metadata.purchase_kind, "ebook");
    assert.equal(data.metadata.ebook_sku, EBOOKS.en.sku);
    assert.ok(!("payment_method_types" in data));
    assert.ok(options.idempotencyKey);
    assert.ok(!JSON.stringify(data).includes("room-of-clarity"));
  },
);
assetTest(
  "corrupt, missing, and swapped-language assets fail before checkout or delivery",
  async () => {
    for (const mode of ["corrupt", "missing", "wrong-language"]) {
      const { ports, owner } = setup();
      ports.readAsset = async () => {
        if (mode === "missing") throw Error();
        return mode === "corrupt"
          ? Buffer.from("%PDF-invalid")
          : readFile(fixtureFiles.es);
      };
      await assert.rejects(startCheckout("en", owner, "request", ports, env));
    }
  },
);
assetTest(
  "duplicate and concurrent signed-event fulfillment produces one receipt and one entitlement",
  async () => {
    const { ports, state } = setup();
    await Promise.all([
      fulfillCheckout(state.order.id, ports, env),
      fulfillCheckout(state.order.id, ports, env),
    ]);
    await fulfillCheckout(state.order.id, ports, env);
    assert.equal(state.sends.size, 1);
    assert.equal(state.order.metadata.ebook_delivery_status, "sent");
    assert.equal(state.order.metadata.ebook_fulfilled_asset, EBOOKS.en.sha256);
  },
);
assetTest(
  "email failure stays retryable and never marks fulfillment as delivered",
  async () => {
    const { ports, state } = setup();
    state.failEmail = true;
    await assert.rejects(fulfillCheckout(state.order.id, ports, env));
    assert.equal(state.order.metadata.ebook_delivery_status, undefined);
    state.failEmail = false;
    await fulfillCheckout(state.order.id, ports, env);
    assert.equal(state.sends.size, 1);
  },
);
assetTest(
  "both paid editions deliver the exact supplied bytes and correct language",
  async () => {
    for (const edition of ["en", "es"]) {
      const { ports, state, owner } = setup(edition);
      await fulfillCheckout(state.order.id, ports, env);
      const receipt = await receiptAccess(state.order.id, owner, ports, env);
      assert.equal(receipt.edition, edition);
      const file = await download(receipt.token, ports, env);
      assert.equal(file.edition, edition);
      assert.deepEqual(file.data, await readFile(fixtureFiles[edition]));
      assert.equal(digest(file.data), EBOOKS[edition].sha256);
      const email = [...state.sends.values()][0];
      assert.ok(email.text.includes(EBOOKS[edition].title));
      assert.ok(email.text.includes("#access="));
      assert.ok(!email.text.includes("/api/ebooks/download?"));
    }
  },
);
assetTest(
  "refund after delivery blocks an otherwise valid signed link",
  async () => {
    const { ports, state, owner } = setup();
    await fulfillCheckout(state.order.id, ports, env);
    const receipt = await receiptAccess(state.order.id, owner, ports, env);
    state.payment.latest_charge.refunded = true;
    await assert.rejects(download(receipt.token, ports, env));
  },
);
