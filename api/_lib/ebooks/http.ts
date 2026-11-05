import type { VercelRequest, VercelResponse } from "@vercel/node";
import { EbookError } from "./catalog.js";
import { safeOrigin } from "./security.js";
export function secure(res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
}
export function sameOrigin(req: VercelRequest, env: NodeJS.ProcessEnv) {
  if (req.headers.origin !== safeOrigin(env))
    throw new EbookError(403, "Invalid request origin.");
}
export function fail(res: VercelResponse, error: unknown) {
  if (error instanceof EbookError)
    return res.status(error.status).json({ error: error.message });
  return res
    .status(503)
    .json({
      error:
        "Digital purchasing is temporarily unavailable. Please try again later.",
    });
}
export function bearer(req: VercelRequest) {
  const raw = req.headers.authorization;
  if (typeof raw !== "string" || !raw.startsWith("Bearer "))
    throw new EbookError(403, "A private download link is required.");
  return raw.slice(7);
}
