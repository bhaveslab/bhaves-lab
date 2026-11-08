import type { VercelRequest, VercelResponse } from "@vercel/node";
import { download } from "../_lib/ebooks/service.js";
import { EBOOKS } from "../_lib/ebooks/catalog.js";
import { ports } from "../_lib/ebooks/runtime.js";
import { secure, fail, bearer } from "../_lib/ebooks/http.js";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  secure(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed." });
  try {
    const token = bearer(req);
    const file = await download(token, ports(), process.env);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${EBOOKS[file.edition].filename}"`,
    );
    res.setHeader("Content-Length", file.data.length);
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'");
    return res.status(200).send(file.data);
  } catch (error) {
    return fail(res, error);
  }
}
