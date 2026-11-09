import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

// Match only the verified, active Contribution to Ongoing Research link.
// Never treat unrelated Stripe checkouts as Lab research contributions.
const RESEARCH_PAYMENT_LINK_ID = "plink_1UZupP2c1Eq7UIp4WfxFOMGZ";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ state: "unverified" });
  }

  const sessionId = req.query.session_id;
  if (
    typeof sessionId !== "string" ||
    sessionId.length > 160 ||
    !/^cs_live_[A-Za-z0-9]+$/.test(sessionId)
  ) {
    return res.status(400).json({ state: "unverified" });
  }

  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || !/^(sk|rk)_live_/.test(key)) {
    return res.status(503).json({ state: "unavailable" });
  }

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (
      !session.livemode ||
      session.mode !== "payment" ||
      session.payment_link !== RESEARCH_PAYMENT_LINK_ID ||
      session.currency !== "usd" ||
      (session.amount_total ?? 0) < 100
    ) {
      return res.status(404).json({ state: "unverified" });
    }

    if (session.status === "complete" && session.payment_status === "paid") {
      return res.status(200).json({ state: "confirmed" });
    }
    return res.status(200).json({ state: "processing" });
  } catch (error) {
    // Avoid exposing Stripe exception details or customer information.
    if (error instanceof Stripe.errors.StripeInvalidRequestError && error.statusCode === 404) {
      return res.status(404).json({ state: "unverified" });
    }
    return res.status(503).json({ state: "unavailable" });
  }
}
