import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  hasConfirmedRoomAccess,
  resolveClarityContext,
} from "./_lib/clarity-authorization";
import { RoomOfClarity } from "./_lib/RoomOfClarity";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Cookie");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const context = await resolveClarityContext(req);
    if (!context.infrastructureReady)
      return res.status(503).json({ access: "unavailable" });
    if (!context.identity)
      return res.status(401).json({ access: "authentication_required" });
    if (!hasConfirmedRoomAccess(context))
      return res.status(403).json({ access: "not_confirmed" });
    // Protected content exists only on the server. It is never shipped in client chunks.
    return res
      .status(200)
      .json({ html: renderToStaticMarkup(createElement(RoomOfClarity)) });
  } catch {
    return res.status(503).json({ access: "unavailable" });
  }
}
