import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { put, get } from "@vercel/blob";
// Supply the reviewed Unlimited Possibilities PDF. Never put ebook bytes in public/ or Git.
// These pins match api/_lib/ebooks/catalog.ts and are checked before upload.
const inputs = [
  {
    edition: "unlimited",
    file: process.argv[2],
    sha: "1abb66ccdfe5b324dffbefe62d48edd34cdbc869356c004f450cb2cfd55be42b",
    bytes: 3643117,
  },
];
const token = process.env.EBOOK_BLOB_READ_WRITE_TOKEN;
if (!token && !(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN))
  throw Error(
    "Configure the private-store token through the environment. Do not pass credentials as arguments.",
  );
const hash = (data) => createHash("sha256").update(data).digest("hex");
for (const item of inputs) {
  if (!item.file) throw Error("Pass the exact reviewed Unlimited Possibilities PDF path.");
  const bytes = await readFile(item.file);
  if (
    bytes.length !== item.bytes ||
    hash(bytes) !== item.sha ||
    bytes.subarray(0, 5).toString() !== "%PDF-"
  )
    throw Error("Asset mismatch for " + item.edition);
  const path = "ebooks/" + item.sha + ".pdf";
  const options = {
    token,
    storeId: process.env.BLOB_STORE_ID,
    oidcToken: process.env.VERCEL_OIDC_TOKEN,
    access: "private",
  };
  const readback = () => get(path, { ...options, useCache: false });
  let verified = await readback();
  if (!verified) {
    await put(path, bytes, {
      ...options,
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    verified = await readback();
  }
  if (
    !verified ||
    verified.statusCode !== 200 ||
    hash(Buffer.from(await new Response(verified.stream).arrayBuffer())) !==
      item.sha
  )
    throw Error("Private readback failed for " + item.edition);
  console.log(
    JSON.stringify({
      edition: item.edition,
      bytes: bytes.length,
      sha256: item.sha,
      privateReadbackVerified: true,
    }),
  );
}
