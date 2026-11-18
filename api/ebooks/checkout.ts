import type { VercelRequest, VercelResponse } from "@vercel/node";
import { UNLIMITED_PAYMENT_LINK } from "../_lib/ebooks/catalog.js";
import { secure, fail } from "../_lib/ebooks/http.js";
import { digest, newSeed, RECEIPT_COOKIE, receiptSeed, TOKEN_TTL } from "../_lib/ebooks/security.js";
import { assertMode, configurationReady } from "../_lib/ebooks/service.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed." });

  const env = process.env;
  if (env.VERCEL_ENV !== "production" || !configurationReady(env))
    return res.status(503).json({ error: "Checkout is currently unavailable." });

  try {
    assertMode(env);
    const seed = receiptSeed(req.headers.cookie) ?? newSeed();
    const checkout = new URL(UNLIMITED_PAYMENT_LINK.url);
    checkout.searchParams.set("client_reference_id", digest(seed));
    res.setHeader("Set-Cookie", `${RECEIPT_COOKIE}=${seed}; Path=/; Max-Age=${TOKEN_TTL}; Secure; HttpOnly; SameSite=Lax`);
    return res.redirect(303, checkout.toString());
  } catch (error) {
    return fail(res, error);
  }
}
