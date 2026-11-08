import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { ports } from "../_lib/ebooks/runtime.js";
import { assertMode, processEbookEvent } from "../_lib/ebooks/service.js";
import { secure } from "../_lib/ebooks/http.js";
export const config = { api: { bodyParser: false } };
export async function rawBody(req: AsyncIterable<unknown>) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += bytes.length;
    if (size > 1048576) throw Error("Body too large");
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed." });
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  const signing = process.env.STRIPE_WEBHOOK_SECRET_EBOOKS;
  if (!key || !signing)
    return res.status(503).json({ error: "Webhook is not configured." });
  let event: Stripe.Event;
  try {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") throw Error();
    event = new Stripe(key).webhooks.constructEvent(
      await rawBody(req),
      signature,
      signing,
    );
    if (event.livemode !== assertMode(process.env)) throw Error();
  } catch {
    return res.status(400).json({ error: "Invalid webhook." });
  }
  try {
    return res
      .status(200)
      .json(await processEbookEvent(event, ports(), process.env));
  } catch {
    return res
      .status(503)
      .json({ error: "Fulfillment pending; retry required." });
  }
}
