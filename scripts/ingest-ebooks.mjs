import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { put, get } from "@vercel/blob";
// Supply the final Game PDF. Never put ebook bytes in public/ or Git.
// These pins match api/_lib/ebooks/catalog.ts and are checked before upload.
const inputs = [
  {
    lang: "game",
    file: process.argv[2],
    sha: "14cce07e292853a1e2046df796124f48e78051f1b878241e9f0acd0749fba83d",
    bytes: 2979876,
  },
];
const token = process.env.EBOOK_BLOB_READ_WRITE_TOKEN;
if (!token)
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
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
  const verified = await get("ebooks/" + item.sha + ".pdf", {
    token,
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
