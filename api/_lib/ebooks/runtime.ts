import Stripe from "stripe";
import { Resend } from "resend";
import { get } from "@vercel/blob";
import { EBOOKS, EbookError, type Edition } from "./catalog.js";
import type { EbookPorts } from "./service.js";
export function ports(env: NodeJS.ProcessEnv = process.env): EbookPorts {
  if (!env.STRIPE_SECRET_KEY)
    throw new EbookError(503, "Purchasing is being prepared.");
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  return {
    stripe,
    async readAsset(edition: Edition) {
      if (!env.EBOOK_BLOB_READ_WRITE_TOKEN)
        throw new EbookError(503, "Digital delivery is being prepared.");
      const result = await get(EBOOKS[edition].path, {
        access: "private",
        token: env.EBOOK_BLOB_READ_WRITE_TOKEN,
        useCache: false,
      });
      if (!result || result.statusCode !== 200 || !result.stream)
        throw new EbookError(503, "The edition is temporarily unavailable.");
      const buffer = Buffer.from(
        await new Response(result.stream).arrayBuffer(),
      );
      return buffer;
    },
    async sendReceipt(data) {
      if (!env.RESEND_API_KEY || !env.EBOOK_RECEIPT_FROM)
        throw new EbookError(503, "Receipt delivery is pending.");
      const { error } = await new Resend(env.RESEND_API_KEY).emails.send(
        {
          from: env.EBOOK_RECEIPT_FROM,
          to: data.to,
          subject: data.subject,
          text: data.text,
        },
        { idempotencyKey: data.idempotencyKey },
      );
      if (error) throw new EbookError(503, "Receipt delivery is pending.");
    },
  };
}
