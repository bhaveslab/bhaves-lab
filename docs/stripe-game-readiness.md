# Possibility Game Stripe readiness — November 8, 2026

Status: purchasing is not operational. No charge, refund, provider product, webhook, private-file upload, migration or production code deployment was performed during this review.

## Actual checks

- Production GET /api/ebooks/catalog returned 200 with checkoutAvailable false and the single Game edition at 999 USD cents, 49 pages.
- Production POST /api/ebooks/checkout with a valid Game request returned 403 Invalid request origin. EBOOK_PUBLIC_ORIGIN is absent, so the deployment-host fallback does not match the public www origin. This is a missing canonical-origin configuration, not authorization to bypass origin checks.
- Vercel environment metadata has no runtime Stripe key, Game price ID, ebook webhook secret, private PDF token, download-signing secret, production ebook account/sender/origin configuration or production retail/live enable flags. A general Resend key exists; email sending was not tested.
- Connected Stripe Bhave account is accessible in live and test mode. Product name searches for Possibility returned zero matches in each mode. Live webhook listing has three unrelated/private-application endpoints; none targets the public site's /api/ebooks/webhook. Test mode lists zero webhook endpoints. No existing endpoint or private app was modified.
- A live price listing contains unrelated prices and is paginated; no claim is made that all live prices were enumerated or that any existing 999-cent price belongs to this ebook.
- auth.bhaveslab.com is a verified Resend sending domain. The existing branch-only ebook sender is BHAVÉ’S LAB <sessions@auth.bhaveslab.com>. Its runtime key permissions and delivery remain untested.
- The final supplied Game PDF is 2,979,876 bytes and SHA-256 14cce07e292853a1e2046df796124f48e78051f1b878241e9f0acd0749fba83d, matching the production catalog. Private-store upload/readback is unverified; no runtime token is accessible.

## Accessible corrections completed

The prior upload script, configuration template and regression fixtures still referenced two retired EN/ES ebooks. They now target only the final Game PDF and STRIPE_EBOOK_GAME_PRICE_ID. The upload script keeps private-only writes, exact byte/hash verification and private readback; it never uploads public PDFs or logs credentials.

All 15 regression checks passed with the exact final PDF:

- missing configuration/live Preview mode denied;
- token tampering, expiry, path substitution and obsolete-edition claims denied;
- unpaid, wrong amount/currency/asset, booking and refunded/disputed payments denied;
- raw webhook signatures and body limits checked;
- simulated Game Checkout creates one fixed 999-cent ebook line;
- corrupt/missing/substituted assets rejected before checkout;
- simulated duplicate fulfillment uses one receipt identity;
- failed email remains retryable;
- simulated paid fulfillment and private download deliver exact PDF bytes;
- refund after delivery denies access.

These use simulated Stripe/email/storage providers and do not establish actual payment, webhook delivery, email delivery or hosted downloads.

Run: node scripts/test-ebooks.mjs /absolute/path/to/The_Possibility_Game.pdf

Ingest only after existing private-store credentials are securely available: node scripts/ingest-ebooks.mjs /absolute/path/to/The_Possibility_Game.pdf

## Remaining setup

1. Confirm authority to change provider/project configuration and whether the ebook collects sales tax, VAT or GST before creating a Stripe product/price.
2. Configure an existing-account restricted test runtime key through protected Vercel credentials. A connected Stripe session does not export a deployment API key. Do not paste credentials in chat.
3. Establish the Game test price and required test webhook, safely save its signing secret, configure branch-only signing/private-store access, and upload/read back the exact final PDF in the existing private store.
4. Use exact Preview origin and the verified sender. Test real Stripe test Checkout, signed webhook fulfillment, receipt and download, duplicate events, failures, expiry and refund denial.
5. After verification, configure the separate live key/price/webhook and https://www.bhaveslab.com origin. Enable production purchasing only after verification and authorization. No real-money test has been authorized or completed here.

An attempted batch saving canonical origin, account/sender, separate protected download secrets and disabled flags was rejected by automatic approval review because checking readiness did not explicitly authorize persistent configuration changes. No values from that rejected batch were applied. This is separate from the missing runtime Stripe and private-store credentials.

## Authorized setup completed after the audit

The owner authorized configuring the existing Stripe/Vercel setup and confirmed no current sales tax/VAT/GST collection. Automatic tax was not enabled.

- Existing Bhave Stripe account: test product prod_Vahn4qiZ6hGwYd, default one-time USD price price_1UZWNY2c1Eq7UIp4gxvIXCqE at 999 cents.
- Test webhook we_1UZWOO2c1Eq7UIp44nHSeGZR targets the verified branch alias https://bhaves-lab-git-fix-possibility-game-payment-v-ad236e-bhaves-lab.vercel.app/api/ebooks/webhook and subscribes to checkout.session.completed and checkout.session.async_payment_succeeded. Signing secret was saved as a sensitive variable for this Preview branch only. No test event delivery has been verified yet.
- Saved production canonical origin https://www.bhaveslab.com, existing account identity and verified sender. Generated separate production and branch-only Preview download-signing secrets; stored as sensitive values without publishing them.
- Saved the Game test price ID for this Preview branch. Production retail/live-payment flags remain false. These environment changes require a new deployment before they affect runtime. No production deployment was triggered here.
- No live Stripe product, live webhook, real charge or refund was created.

Remaining blocking credentials are STRIPE_SECRET_KEY (a restricted test key for the existing Bhave account, scoped to this Preview branch) and EBOOK_BLOB_READ_WRITE_TOKEN (the existing private bhaves-lab-ebooks-preview store). The connected tools can manage products/webhooks but cannot export a deployment API key or the private-store token. They must be added directly to protected Vercel settings, not chat.

After those two secrets are available: upload and privately read back the pinned PDF, redeploy Preview, then exercise real Stripe test Checkout, signed webhook, Resend receipt and download access before any live activation. All existing 15 local simulated-provider checks still pass; this setup has not established end-to-end success.

