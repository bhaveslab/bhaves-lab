import { execFileSync } from "node:child_process";
execFileSync(
  process.execPath,
  [
    "node_modules/typescript/bin/tsc",
    "--noEmit",
    "false",
    "--strict",
    "--skipLibCheck",
    "--esModuleInterop",
    "--target",
    "ES2020",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--rootDir",
    "api",
    "--outDir",
    ".qa/ebook-runtime",
    "api/ebooks/catalog.ts",
    "api/ebooks/checkout.ts",
    "api/ebooks/download.ts",
    "api/ebooks/order.ts",
    "api/ebooks/webhook.ts",
  ],
  { stdio: "inherit" },
);
execFileSync(process.execPath, ["--test", "tests/ebooks.test.mjs"], {
  stdio: "inherit",
  env: {
    ...process.env,
    EBOOK_TEST_GAME_FILE: process.argv[2] || process.env.EBOOK_TEST_GAME_FILE || "",
  },
});
