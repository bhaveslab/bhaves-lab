import type { VercelRequest, VercelResponse } from "@vercel/node";
import { EBOOKS } from "../_lib/ebooks/catalog.js";
import { configurationReady, assertMode } from "../_lib/ebooks/service.js";
import { secure } from "../_lib/ebooks/http.js";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed." });
  let ready = configurationReady(process.env);
  try {
    assertMode(process.env);
  } catch {
    ready = false;
  }
  return res
    .status(200)
    .json({
      checkoutAvailable: ready,
      editions: Object.entries(EBOOKS).map(([edition, b]) => ({
        edition,
        sku: b.sku,
        title: b.title,
        subtitle: b.subtitle,
        language: b.language,
        pages: b.pages,
        cents: b.cents,
        currency: b.currency,
      })),
    });
}
