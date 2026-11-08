import type { VercelRequest, VercelResponse } from "@vercel/node";
import { EBOOKS } from "../_lib/ebooks/catalog.js";
import {
  configurationReady,
  assertMode,
  validatePrice,
  verifiedAsset,
} from "../_lib/ebooks/service.js";
import { ports } from "../_lib/ebooks/runtime.js";
import { secure } from "../_lib/ebooks/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed." });

  let ready = configurationReady(process.env);
  let stage = ready ? "mode" : "configuration";
  if (ready) {
    try {
      assertMode(process.env);
      const provider = ports();
      // The price retrieval itself is scoped to the authenticated Stripe account.
      stage = "price";
      await validatePrice("game", provider, process.env);
      stage = "ebook";
      await verifiedAsset("game", provider);
      stage = "ready";
    } catch (error) {
      ready = false;
      console.error(
        "ebook_checkout_readiness_failed",
        stage,
        error instanceof Error ? error.name + ": " + error.message : "unknown",
      );
    }
  }

  return res.status(200).json({
    checkoutAvailable: ready,
    readiness: ready ? "ready" : stage,
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
