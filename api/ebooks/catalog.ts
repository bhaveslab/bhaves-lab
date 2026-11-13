import type { VercelRequest, VercelResponse } from "@vercel/node";
import { secure } from "../_lib/ebooks/http.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed." });
  return res.status(200).json({ checkoutAvailable: false, readiness: "paused", editions: [] });
}
