import type { VercelRequest, VercelResponse } from "@vercel/node";
/** Fail closed until a server-owned reservation and payment verifier is integrated.
 * Never trust a query parameter, browser storage, request receipt or checkout redirect.
 * No access token is issued by the current request-only booking endpoint.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res
    .status(503)
    .json({
      access: "unavailable",
      paymentVerified: false,
      availabilityVerified: false,
    });
}
