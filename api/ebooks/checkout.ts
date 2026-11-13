import type { VercelRequest, VercelResponse } from "@vercel/node";
import { secure } from "../_lib/ebooks/http.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed." });
  return res.status(503).json({ error: "New ebook purchases are currently paused." });
}
