import {
  createHash,
  createHmac,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";
import { EBOOKS, EbookError, editionForSku, type Edition } from "./catalog.js";
export const RECEIPT_COOKIE = "__Host-bhave_ebook";
export const TOKEN_TTL = 7 * 24 * 60 * 60;
export const digest = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
export function secret(env: NodeJS.ProcessEnv) {
  const key = env.EBOOK_DOWNLOAD_SECRET;
  if (!key || key.length < 43)
    throw new EbookError(503, "Digital delivery is being prepared.");
  return key;
}
export function mintDownload(
  session: { id: string; created: number },
  edition: Edition,
  key: string,
) {
  const payload = Buffer.from(
    JSON.stringify({
      v: 1,
      kind: "ebook-download",
      sid: session.id,
      sku: EBOOKS[edition].sku,
      exp: session.created + TOKEN_TTL,
    }),
  ).toString("base64url");
  return (
    payload +
    "." +
    createHmac("sha256", key).update(payload).digest("base64url")
  );
}
export function verifyDownload(
  token: string,
  key: string,
  now = Math.floor(Date.now() / 1000),
) {
  if (typeof token !== "string" || token.length > 1200)
    throw new EbookError(403, "This download link is invalid or has expired.");
  const parts = token.split(".");
  if (parts.length !== 2 || !parts.every((p) => /^[\w-]+$/.test(p)))
    throw new EbookError(403, "This download link is invalid or has expired.");
  const expected = createHmac("sha256", key).update(parts[0]).digest();
  const actual = Buffer.from(parts[1], "base64url");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    throw new EbookError(403, "This download link is invalid or has expired.");
  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[0], "base64url").toString());
  } catch {
    throw new EbookError(403, "This download link is invalid or has expired.");
  }
  const edition = editionForSku(payload.sku);
  if (
    payload.v !== 1 ||
    payload.kind !== "ebook-download" ||
    !edition ||
    !/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(payload.sid) ||
    !Number.isSafeInteger(payload.exp) ||
    payload.exp <= now ||
    payload.exp > now + TOKEN_TTL
  )
    throw new EbookError(403, "This download link is invalid or has expired.");
  return { sid: payload.sid as string, edition, exp: payload.exp as number };
}
export function receiptSeed(cookie: string | undefined) {
  const value = cookie
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(RECEIPT_COOKIE + "="))
    ?.slice(RECEIPT_COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}
export function newSeed() {
  return randomBytes(32).toString("hex");
}
export function safeOrigin(env: NodeJS.ProcessEnv) {
  const raw =
    env.EBOOK_PUBLIC_ORIGIN ||
    (env.VERCEL_URL ? "https://" + env.VERCEL_URL : "");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new EbookError(503, "Checkout is being prepared.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !(
      url.hostname === "bhaveslab.com" ||
      url.hostname === "www.bhaveslab.com" ||
      url.hostname.endsWith(".vercel.app")
    )
  )
    throw new EbookError(503, "Checkout is being prepared.");
  return url.origin;
}
export function jsonBody(body: unknown) {
  try {
    const text = typeof body === "string" ? body : JSON.stringify(body);
    if (!text || Buffer.byteLength(text) > 2048) throw Error();
    const parsed = JSON.parse(text);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object")
      throw Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new EbookError(400, "Invalid request.");
  }
}
