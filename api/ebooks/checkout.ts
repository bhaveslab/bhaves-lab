import type { VercelRequest, VercelResponse } from "@vercel/node";
import { EbookError } from "../_lib/ebooks/catalog.js";
import { startCheckout } from "../_lib/ebooks/service.js";
import { ports } from "../_lib/ebooks/runtime.js";
import { secure, sameOrigin, fail } from "../_lib/ebooks/http.js";
import {
  jsonBody,
  newSeed,
  receiptSeed,
  RECEIPT_COOKIE,
} from "../_lib/ebooks/security.js";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed." });
  try {
    sameOrigin(req, process.env);
    const body = jsonBody(req.body);
    if (
      body.edition !== "game" ||
      typeof body.requestId !== "string" ||
      !/^[a-f0-9-]{36}$/.test(body.requestId) ||
      Object.keys(body).some((k) => !["edition", "requestId"].includes(k))
    )
      throw new EbookError(400, "Invalid edition or request.");
    const seed = receiptSeed(req.headers.cookie) || newSeed();
    res.setHeader(
      "Set-Cookie",
      `${RECEIPT_COOKIE}=${seed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
    );
    const url = await startCheckout(
      body.edition as "game",
      seed,
      body.requestId,
      ports(),
      process.env,
    );
    return res.status(200).json({ url });
  } catch (error) {
    return fail(res, error);
  }
}
