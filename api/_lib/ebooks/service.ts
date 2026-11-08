import type Stripe from "stripe";
import { EBOOKS, EbookError, editionForSku, type Edition } from "./catalog.js";
import {
  digest,
  mintDownload,
  verifyDownload,
  secret,
  safeOrigin,
} from "./security.js";

export type EbookPorts = {
  stripe: Stripe;
  readAsset: (edition: Edition) => Promise<Buffer>;
  sendReceipt: (data: {
    to: string;
    subject: string;
    text: string;
    idempotencyKey: string;
  }) => Promise<void>;
};
export function configurationReady(env: NodeJS.ProcessEnv) {
  return (
    env.EBOOK_RETAIL_APPROVED === "true" &&
    !!env.STRIPE_SECRET_KEY &&
    !!env.STRIPE_WEBHOOK_SECRET_EBOOKS &&
    !!env.EBOOK_STRIPE_ACCOUNT_ID &&
    !!env.STRIPE_EBOOK_GAME_PRICE_ID &&
    (!!env.EBOOK_BLOB_READ_WRITE_TOKEN || (!!env.BLOB_STORE_ID && !!env.VERCEL_ENV)) &&
    !!env.RESEND_API_KEY &&
    !!env.EBOOK_RECEIPT_FROM &&
    (env.EBOOK_DOWNLOAD_SECRET?.length ?? 0) >= 43
  );
}
export function assertMode(env: NodeJS.ProcessEnv) {
  const key = env.STRIPE_SECRET_KEY || "";
  const test = /^(sk|rk)_test_/.test(key);
  const live = /^(sk|rk)_live_/.test(key);
  if (test && env.VERCEL_ENV === "production")
    throw new EbookError(503, "Production requires a live Stripe API key.");
  if (
    !test &&
    !(
      live &&
      env.VERCEL_ENV === "production" &&
      env.EBOOK_ALLOW_LIVE_PAYMENTS === "true"
    )
  )
    throw new EbookError(503, "Live Stripe credentials or payment authorization are missing.");
  return live;
}
export async function validatePrice(
  edition: Edition,
  ports: EbookPorts,
  env: NodeJS.ProcessEnv,
) {
  const id = env[EBOOKS[edition].priceEnv];
  if (!id || !/^price_[A-Za-z0-9]+$/.test(id))
    throw new EbookError(503, "Checkout is being prepared.");
  const price = await ports.stripe.prices.retrieve(id);
  if (
    !price.active ||
    price.currency !== "usd" ||
    price.unit_amount !== 999 ||
    price.type !== "one_time" ||
    price.livemode !== assertMode(env)
  )
    throw new EbookError(503, "Checkout is being prepared.");
  return id;
}
export async function verifiedAsset(edition: Edition, ports: EbookPorts) {
  const data = await ports.readAsset(edition);
  const expected = EBOOKS[edition];
  if (
    data.length !== expected.bytes ||
    data.subarray(0, 5).toString() !== "%PDF-" ||
    digest(data) !== expected.sha256
  )
    throw new EbookError(
      503,
      "The edition is temporarily unavailable. Please contact info@bhaveslab.com.",
    );
  return data;
}
export async function startCheckout(
  edition: Edition,
  seed: string,
  requestId: string,
  ports: EbookPorts,
  env: NodeJS.ProcessEnv,
) {
  if (!configurationReady(env))
    throw new EbookError(503, "Purchasing is being prepared.");
  const live = assertMode(env);
  const account = await ports.stripe.accounts.retrieve();
  if (account.id !== env.EBOOK_STRIPE_ACCOUNT_ID)
    throw new EbookError(503, "The Stripe key belongs to a different account.");
  if (!account.charges_enabled)
    throw new EbookError(503, "Stripe has not enabled payments for this account.");
  const [price] = await Promise.all([
    validatePrice(edition, ports, env),
    verifiedAsset(edition, ports),
  ]);
  const origin = safeOrigin(env);
  const book = EBOOKS[edition];
  const session = await ports.stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: origin + "/library/delivery?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/library?cancelled=1",
      metadata: {
        application: "bhaves-lab",
        purchase_kind: "ebook",
        ebook_sku: book.sku,
        ebook_asset_sha256: book.sha256,
        ebook_receipt_owner: digest(seed),
        ebook_expected_mode: live ? "live" : "test",
        ebook_receipt_origin: origin,
      },
    },
    {
      idempotencyKey: "ebook:" + digest(seed + ":" + edition + ":" + requestId),
    },
  );
  if (
    !session.url ||
    new URL(session.url).origin !== "https://checkout.stripe.com"
  )
    throw new EbookError(502, "Checkout could not be opened.");
  return session.url;
}

export async function paidOrder(
  sid: string,
  ports: EbookPorts,
  env: NodeJS.ProcessEnv,
) {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sid))
    throw new EbookError(403, "Purchase access could not be verified.");
  const order = await ports.stripe.checkout.sessions.retrieve(sid);
  const edition = editionForSku(order.metadata?.ebook_sku);
  if (
    !edition ||
    order.metadata?.application !== "bhaves-lab" ||
    order.metadata.purchase_kind !== "ebook" ||
    order.metadata.ebook_asset_sha256 !== EBOOKS[edition].sha256
  )
    throw new EbookError(403, "Purchase access could not be verified.");
  if (
    order.livemode !== assertMode(env) ||
    order.mode !== "payment" ||
    order.status !== "complete" ||
    order.payment_status !== "paid" ||
    order.amount_total !== 999 ||
    order.currency !== "usd"
  )
    throw new EbookError(403, "Payment has not been verified.");
  const price = env[EBOOKS[edition].priceEnv];
  const lines = await ports.stripe.checkout.sessions.listLineItems(order.id, {
    limit: 2,
  });
  if (
    lines.has_more ||
    lines.data.length !== 1 ||
    lines.data[0].quantity !== 1 ||
    lines.data[0].price?.id !== price ||
    lines.data[0].amount_total !== 999
  )
    throw new EbookError(403, "Purchase access could not be verified.");
  const paymentId =
    typeof order.payment_intent === "string"
      ? order.payment_intent
      : order.payment_intent?.id;
  if (!paymentId) throw new EbookError(403, "Payment has not been verified.");
  const payment = await ports.stripe.paymentIntents.retrieve(paymentId, {
    expand: ["latest_charge"],
  });
  const charge = payment.latest_charge;
  if (
    payment.status !== "succeeded" ||
    payment.amount_received !== 999 ||
    payment.currency !== "usd" ||
    !charge ||
    typeof charge === "string" ||
    !charge.paid ||
    charge.refunded ||
    charge.amount_refunded > 0 ||
    charge.disputed
  )
    throw new EbookError(
      403,
      "This purchase is not currently eligible for download.",
    );
  return { order, edition };
}

export async function fulfillCheckout(
  sid: string,
  ports: EbookPorts,
  env: NodeJS.ProcessEnv,
) {
  const { order, edition } = await paidOrder(sid, ports, env);
  await verifiedAsset(edition, ports);
  if (order.metadata?.ebook_delivery_status === "sent")
    return { delivered: true, duplicate: true };
  const email = order.customer_details?.email || order.customer_email;
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    throw new EbookError(503, "Receipt delivery is pending.");
  const book = EBOOKS[edition];
  const token = mintDownload(order, edition, secret(env));
  const link =
    safeOrigin({
      ...env,
      EBOOK_PUBLIC_ORIGIN:
        order.metadata?.ebook_receipt_origin || safeOrigin(env),
    }) +
    "/library/delivery#access=" +
    token;
  await ports.sendReceipt({
    to: email,
    subject: "Your edition of The Possibility Game",
    text: `Thank you for your purchase.\n\n${book.title} — ${book.subtitle}\nDigital PDF · $9.99 USD\n\nPrivate download (available for seven days from purchase):\n${link}\n\nSupport: info@bhaveslab.com`,
    idempotencyKey: "ebook-receipt-" + order.id,
  });
  await ports.stripe.checkout.sessions.update(
    order.id,
    {
      metadata: {
        ebook_delivery_status: "sent",
        ebook_fulfilled_asset: book.sha256,
      },
    },
    { idempotencyKey: "ebook-fulfilled-" + order.id },
  );
  return { delivered: true, duplicate: false };
}

export async function download(
  token: string,
  ports: EbookPorts,
  env: NodeJS.ProcessEnv,
  now?: number,
) {
  const claim = verifyDownload(token, secret(env), now);
  const { order, edition } = await paidOrder(claim.sid, ports, env);
  if (
    edition !== claim.edition ||
    order.metadata?.ebook_delivery_status !== "sent" ||
    order.metadata.ebook_fulfilled_asset !== EBOOKS[edition].sha256
  )
    throw new EbookError(403, "Digital delivery has not been confirmed.");
  return { data: await verifiedAsset(edition, ports), edition };
}
export async function receiptAccess(
  sid: string,
  ownerSeed: string | null,
  ports: EbookPorts,
  env: NodeJS.ProcessEnv,
) {
  if (!ownerSeed)
    throw new EbookError(403, "Open the private link in your receipt email.");
  const { order, edition } = await paidOrder(sid, ports, env);
  if (order.metadata?.ebook_receipt_owner !== digest(ownerSeed))
    throw new EbookError(403, "Open the private link in your receipt email.");
  if (
    order.metadata.ebook_delivery_status !== "sent" ||
    order.metadata.ebook_fulfilled_asset !== EBOOKS[edition].sha256
  )
    return { state: "processing" as const };
  return {
    state: "ready" as const,
    edition,
    token: mintDownload(order, edition, secret(env)),
  };
}

export async function processEbookEvent(
  event: Stripe.Event,
  dependencies: EbookPorts,
  env: NodeJS.ProcessEnv,
) {
  if (event.livemode !== assertMode(env))
    throw new EbookError(400, "Invalid webhook mode.");
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(event.type)
  )
    return { received: true, ignored: true };
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.purchase_kind !== "ebook")
    return { received: true, ignored: true };
  if (session.payment_status !== "paid")
    return { received: true, pending: true };
  await fulfillCheckout(session.id, dependencies, env);
  return { received: true };
}

