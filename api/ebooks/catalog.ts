import type { VercelRequest, VercelResponse } from "@vercel/node";
import { EBOOKS } from "../_lib/ebooks/catalog.js";
import { secure } from "../_lib/ebooks/http.js";
import { ports } from "../_lib/ebooks/runtime.js";
import { safeOrigin } from "../_lib/ebooks/security.js";
import { assertMode, configurationReady, validatePrice, verifiedAsset } from "../_lib/ebooks/service.js";

const paymentLinkId = "plink_1Ud8sH2c1Eq7UIp47XOCobYF";
const paymentLinkUrl = "https://buy.stripe.com/eVq28k7wo21s0sK1gLbQY0y";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed." });

  const env = process.env;
  if (env.VERCEL_ENV !== "production" || !configurationReady(env))
    return res.json({ checkoutAvailable: false, readiness: "disabled" });

  try {
    if (!assertMode(env)) return res.json({ checkoutAvailable: false, readiness: "disabled" });
    safeOrigin(env);
    const dependencies = ports(env);
    await Promise.all([
      validatePrice("unlimited", dependencies, env),
      verifiedAsset("unlimited", dependencies),
    ]);

    const link = await dependencies.stripe.paymentLinks.retrieve(paymentLinkId);
    if (
      !link.livemode ||
      link.url !== paymentLinkUrl ||
      link.metadata?.application !== "bhaves-lab" ||
      link.metadata?.purchase_kind !== "ebook" ||
      link.metadata?.ebook_sku !== EBOOKS.unlimited.sku ||
      link.metadata?.ebook_asset_sha256 !== EBOOKS.unlimited.sha256
    ) return res.json({ checkoutAvailable: false, readiness: "link_mismatch" });

    res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=30");
    return res.json({
      checkoutAvailable: link.active,
      readiness: link.active ? "ready" : "link_inactive",
      ...(link.active ? { checkoutUrl: paymentLinkUrl } : {}),
    });
  } catch (error) {
    console.error("Ebook catalog readiness check failed", error instanceof Error ? error.name : "unknown");
    return res.json({ checkoutAvailable: false, readiness: "verification_failed" });
  }
}
