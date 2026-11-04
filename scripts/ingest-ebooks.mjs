import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { put, get } from "@vercel/blob";
// Supply the two existing, final PDFs as arguments. Never put them in public/ or Git.
const inputs = [
  {
    lang: "en",
    file: process.argv[2],
    sha: "3d2cb2decac7617a4a7fbdbfc52ca9368e7981674c5ceba0de44a616223daeb1",
    bytes: 2922708,
  },
  {
    lang: "es",
    file: process.argv[3],
    sha: "587d2ec64616b566a2febef6da26f7b8f7743bf6560bf4a537d45388417b3c31",
    bytes: 1604365,
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
