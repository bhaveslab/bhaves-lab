import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { put, get } from "@vercel/blob";
// Supply the final Game PDF. Never put ebook bytes in public/ or Git.
// These pins match api/_lib/ebooks/catalog.ts and are checked before upload.
const inputs = [
  {
    lang: "game",
    file: process.argv[2],
    sha: "97cf0aecaf4574abfa96910c2f6e5ce7bcba391f0c6837fa9721b3296c6e3e5e",
    bytes: 2900537,
  },
];
const token = process.env.EBOOK_BLOB_READ_WRITE_TOKEN;
if (!token && !(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN))
  throw Error(
    "Configure the private-store token through the environment. Do not pass credentials as arguments.",
  );
const hash = (data) => createHash("sha256").update(data).digest("hex");
for (const item of inputs) {
  if (!item.file) throw Error("Pass the exact final Possibility Game PDF path.");
  const bytes = await readFile(item.file);
  if (
    bytes.length !== item.bytes ||
    hash(bytes) !== item.sha ||
    bytes.subarray(0, 5).toString() !== "%PDF-"
  )
    throw Error("Asset mismatch for " + item.lang);
  await put("ebooks/" + item.sha + ".pdf", bytes, {
    token,
    storeId: process.env.BLOB_STORE_ID,
    oidcToken: process.env.VERCEL_OIDC_TOKEN,
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
  const verified = await get("ebooks/" + item.sha + ".pdf", {
    token,
    storeId: process.env.BLOB_STORE_ID,
    oidcToken: process.env.VERCEL_OIDC_TOKEN,
    access: "private",
    useCache: false,
  });
  if (
    !verified ||
    verified.statusCode !== 200 ||
    hash(Buffer.from(await new Response(verified.stream).arrayBuffer())) !==
      item.sha
  )
    throw Error("Private readback failed for " + item.lang);
  console.log(
    JSON.stringify({
      edition: item.lang,
      bytes: bytes.length,
      sha256: item.sha,
      privateReadbackVerified: true,
    }),
  );
}
