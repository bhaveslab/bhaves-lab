import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { createHash } from "node:crypto";

// Published offer: 60 minutes / $175. This endpoint records a request, never a paid booking.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host)
        return res.status(403).json({ error: "Invalid origin" });
    } catch {
      return res.status(403).json({ error: "Invalid origin" });
    }
  }
  let body: Record<string, unknown>;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid request" });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return res.status(400).json({ error: "Invalid request" });
  if (body.website) return res.status(400).json({ error: "Invalid request" });
  const limits = { name: 120, email: 254, details: 2000, availability: 300 };
  for (const [field, limit] of Object.entries(limits)) {
    if (
      typeof body[field] !== "string" ||
      !(body[field] as string).trim() ||
      (body[field] as string).length > limit
    )
      return res.status(400).json({ error: `Invalid ${field}` });
  }
  const { name, email, details, availability } = body as Record<string, string>;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    /[\r\n]/.test(email + name) ||
    body.consent !== "yes"
  )
    return res.status(400).json({ error: "Invalid contact or consent" });
  if (body.ebookEdition !== "en" && body.ebookEdition !== "es")
    return res
      .status(400)
      .json({ error: "Choose English or Spanish for the included ebook" });
  const ebookLanguage = body.ebookEdition === "es" ? "Spanish" : "English";
  const deliveryKey = createHash("sha256")
    .update(
      JSON.stringify({ name, email, details, availability, ebookLanguage }),
    )
    .digest("hex");
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LAB_BOOKING_FROM;
  const to = process.env.LAB_BOOKING_TO;
  if (!apiKey || !from || !to)
    return res.status(503).json({
      error:
        "Booking requests are not configured. Please email info@bhaveslab.com.",
    });
  try {
    const { error } = await new Resend(apiKey).emails.send(
      {
        from,
        to,
        replyTo: email,
        subject: "Possibility Session request",
        text: `The Possibility Session — 60 minutes — $175\nBooking request only. Payment and availability are not confirmed.\n\nName: ${name}\nEmail: ${email}\n\nExploration:\n${details}\n\nAvailability and time zone:\n${availability}\n\nIncluded ebook preference: ${ebookLanguage}. One edition is included only after verified $175 payment and confirmed calendar reservation. This request creates no ebook entitlement.\n\nConsent: contact by email about this session request.`,
      },
      { idempotencyKey: `session-request-${deliveryKey}` },
    );
    if (error)
      return res.status(502).json({ error: "Request could not be delivered" });
    return res
      .status(200)
      .json({ requestReceived: true, bookingConfirmed: false });
  } catch {
    return res.status(502).json({ error: "Request could not be delivered" });
  }
}
