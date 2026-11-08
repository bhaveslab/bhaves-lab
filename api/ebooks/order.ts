import type { VercelRequest, VercelResponse } from "@vercel/node";
import { receiptAccess } from "../_lib/ebooks/service.js";
import { ports } from "../_lib/ebooks/runtime.js";
import { secure, fail } from "../_lib/ebooks/http.js";
import { receiptSeed, jsonBody } from "../_lib/ebooks/security.js";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed." });
  try {
    const body = jsonBody(req.body);
    return res
      .status(200)
      .json(
        await receiptAccess(
          String(body.sessionId || ""),
          receiptSeed(req.headers.cookie),
          ports(),
          process.env,
        ),
      );
  } catch (error) {
    return fail(res, error);
  }
}
