import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { put, get } from "@vercel/blob";
// Supply the two existing, final PDFs as arguments. Never put them in public/ or Git.
const inputs = [
  {
    lang: "en",
    file: process.argv[2],
    sha: "8e3d68c4a55fc9a21dea03cf6eec31240df72e61ad305e60e4e266f06a1e5562",
    bytes: 2923110,
  },
  {
    lang: "es",
    file: process.argv[3],
    sha: "cf4ef640095d833e26ed0b1d7c9e98d207581e7e1617f38a35b23aef0ff3bdd8",
    bytes: 1590929,
  },
];
const token = process.env.EBOOK_BLOB_READ_WRITE_TOKEN;
if (!token)
  throw Error(
    "Configure the private-store token through the environment. Do not pass credentials as arguments.",
  );
const hash = (data) => createHash("sha256").update(data).digest("hex");
for (const item of inputs) {
  if (!item.file) throw Error("Pass the exact English and Spanish PDF paths.");
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
