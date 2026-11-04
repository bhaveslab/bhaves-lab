# Issue #8: The Possibility editions

Feature branch: `codex/issue-8-ebooks`, based on Observatory commit `a1a7a3088ca300c34abef296af10a5a21edb696d`. Review this as a stacked PR against `codex/cinematic-public-lab` (PR #5). Production is unchanged.

## Implemented

Shop at `/shop`: exact supplied covers, English and Spanish selectable editions, $9.99 USD each, 12-page PDF, separate purchases. Observatory composition and animation are unchanged; only the existing Shop entrance copy/link changes. No merchandise or extra services.

Hosted Stripe Checkout uses server-allowlisted prices, account identity, mode and asset checks before payment. The ebook webhook verifies the raw-body Stripe signature, re-fetches the complete paid session, checks its line item and successful payment/charge, then sends a localized receipt through Resend. No fulfillment from the redirect. Its receipt page requires the original secure HttpOnly browser cookie or a signed seven-day email link. Download authorization re-fetches payment, rejects refunds/disputes, and checks private PDF byte length and SHA-256 before serving an attachment. No public PDF URLs, browser credentials, localStorage entitlements, or booking access.

Ebook events use `purchase_kind=ebook` and their own webhook signing secret. Issue #7 booking requests and confirmed Room access remain separate and unchanged. An ebook, emailed request, redirect, or client flag never confirms a session.

## Exact supplied assets

| Edition | Local attachment | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| English | The_Possibility_English_Covered(1).pdf | 2922708 | `3d2cb2decac7617a4a7fbdbfc52ca9368e7981674c5ceba0de44a616223daeb1` |
| Spanish | La_Posibilidad_ES_FINAL_REVIEW(1).pdf | 1604365 | `587d2ec64616b566a2febef6da26f7b8f7743bf6560bf4a537d45388417b3c31` |

The English matches Issue #8. The directly supplied Spanish attachment differs from the issue's recorded `178cbbccc3226edb8d069fe026332320990f7905f87690d109ad4d4146043c21`. This implementation pins the actual attached bytes; it does not regenerate or change them. Both PDFs contain author-review/not-for-sale notices on page 3. Confirm retail approval and the final Spanish version before enabling sales. If replacements are approved, update the manifest and tests deliberately; never silently replace a paid asset.

Only rendered first-page WebP covers are committed. Full PDFs are excluded from source and public output. Private ingestion script checks both originals before upload and reads back the private objects to verify exact hashes.

## Remaining activation blockers

Vercel preview currently has no configured integration variables. The connected Stripe account exposes live mode only; no test payment was attempted. No real checkout/payment/email/delivery end-to-end success is claimed. A private, empty, unlinked Blob store `bhaves-lab-ebooks-preview` (`store_O9OJNZXDYMzkyTu5`) was created, but no token or store-connect capability was available; no PDF has been remotely ingested. Do not connect it to production automatically.

Configure preview-only server variables listed in `.env.example`, including Stripe TEST key, matching account ID, two verified active one-time $9.99 USD test prices, dedicated signed webhook endpoint `/api/ebooks/webhook`, private Blob token, strong download secret, verified Resend sender/key and stable HTTPS origin. Use the ingestion script with the two exact local attachments. Do not put secrets or paid files into Git or VITE variables. Once retail approval exists, set `EBOOK_RETAIL_APPROVED=true` for the test preview. Preview rejects live Stripe keys regardless of the activation flag.

Webhook subscriptions: `checkout.session.completed`, `checkout.session.async_payment_succeeded`. Refund/dispute access is revoked by the live payment recheck on every download. Failed/asynchronous unpaid events never fulfill. Production additionally requires explicit `EBOOK_ALLOW_LIVE_PAYMENTS=true` and approval; do not set that as part of this PR.

Receipt deduplication uses a deterministic Resend idempotency key plus a persistent Stripe metadata delivery marker. Concurrent retries use the same email payload/origin. Resend's deduplication window is 24 hours: an accepted email followed by persistent Stripe marker-write failure beyond that window may duplicate a receipt. Entitlement checks remain paid-only. This intentionally adds no booking database or new paid scheduling provider.

## Verification

- 15 ebook tests pass using the actual two attached PDFs, with no skipped asset tests: mode/config guards, Stripe SDK raw signatures, body bounds, unpaid/wrong-price/wrong-edition denial, exact-byte integrity, duplicate/concurrent fulfillment, email retry, ownership, signed link tampering/expiry, refund/dispute revocation and booking isolation. External providers are mocked; no real charge or receipt was sent.
- Existing 17 booking/Room/Observatory tests pass.
- Vite production build, strict server ESM compilation, original-character/public privacy checks and transfer-size budgets pass. Initial JS ~51 KB gzip, CSS ~8.2 KB, mobile Observatory artwork ~171 KB. Existing deferred Three.js chunk warning remains.
- Emitted ESM handler smoke checks pass: catalog disabled, missing-token download denied, unconfigured webhook unavailable, unsupported order method denied and foreign-origin checkout denied. Automated Shop accessibility scan: zero WCAG A/AA violations (17 rules passed); color contrast retained as a manual review item.
- Desktop English/Spanish selection and 390px mobile layout checked in Chrome. Screenshots in `docs/review/ebook-shop-*.jpg`. Physical iPhone/Safari paid-download behavior and real provider test-mode end-to-end remain required after configuration.

Run: `node scripts/test-ebooks.mjs '../upload/The_Possibility_English_Covered(1).pdf' '../upload/La_Posibilidad_ES_FINAL_REVIEW(1).pdf'`. Without fixture paths, private-asset positive tests explicitly skip; do not report that as complete delivery validation.
