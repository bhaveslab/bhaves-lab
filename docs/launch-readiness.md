# Final integration and launch readiness — November 4, 2026

**Assessment: not production-ready.** PDFs and safe public presentation are ready for review. Standalone payment/delivery implementation remains disabled pending real test-mode configuration and E2E validation. Issue #7 has no booking backend, reservation store or identity provider; those are implementation dependencies, not merely missing environment values. No live payment, real reservation, confirmation email, or successful authenticated Room visit is claimed.

Work continues on `codex/issue-8-ebooks`, draft PR #9 stacked on Observatory draft PR #5. No production deployment, merge, private-app changes, new provider purchase or calendar publication.

## Final ebook assets

The owner authorized removal of review-only/not-for-sale notices. `scripts/finalize-ebooks.py` removes only the two-line notice on page 3 in each original PDF, plus the English metadata's review-edition description. It does not reconstruct or rewrite the manuscripts. Both language-specific covers are unchanged. All 24 pages were compared: text matches the original minus the exact authorized notice; rendered pixels outside the notice rectangles match at 144 dpi. The final copyright pages were visually inspected. Each final PDF remains 12 pages.

| Edition | Final filename | Bytes | Final SHA-256 |
| --- | --- | ---: | --- |
| English | The_Possibility_English_Final.pdf | 2923110 | `8e3d68c4a55fc9a21dea03cf6eec31240df72e61ad305e60e4e266f06a1e5562` |
| Spanish | La_Posibilidad_Spanish_Final.pdf | 1590929 | `cf4ef640095d833e26ed0b1d7c9e98d207581e7e1617f38a35b23aef0ff3bdd8` |

The Spanish chain is explicit: the supplied attachment hashed `587d2ec64616b566a2febef6da26f7b8f7743bf6560bf4a537d45388417b3c31`, differing from the historical issue record `178cbbccc3226edb8d069fe026332320990f7905f87690d109ad4d4146043c21`. The actual supplied, localized-cover attachment is the immutable source for this authorized edit. The final hash above is now authoritative in the delivery catalog and ingestion script; no assertion is made that the unavailable historical bytes were identical. Complete provenance: `final-ebooks-manifest.json`.

Final files were saved as new versions of the original supplied documents. No full PDF is committed, copied into public/, or remotely ingested into Blob. Existing public cover thumbnails still correspond to the unchanged covers. Purchases remain English $9.99 USD and Spanish $9.99 USD, separately.

## Changes to the continuous experience

- Observatory hero, original character, landscape composition and visual hierarchy unchanged.
- Concise session introduction now states the included ebook benefit.
- The existing request form captures a validated English/Spanish preference, explains that one edition is included only after verified payment AND reservation, and includes that preference in the operator request email. It does not grant a download or confirm a booking. Identical request emails use a deterministic Resend idempotency key (provider window: 24 hours).
- A pre-existing extensionless server import was corrected for strict Node ESM compatibility.
- Legacy `/shop/confirmation?status=success` now uses the protected ebook receipt view. A URL flag no longer displays a false paid-order confirmation or shipping promise.
- Protected Room resolver remains closed; no optional instruments appear in public JS. The paid ebook does not grant Room access.
- Build checks also reject paid PDFs in distribution and legacy false-confirmation claims in client chunks.

## Verified current infrastructure

Preview environment metadata was rechecked: **zero configured variables**. The connected Bhave Stripe account exposes live mode only, so no test checkout/charge could be performed through that connection. Live mode was not used. The private Blob store `bhaves-lab-ebooks-preview` is available but empty, unlinked, with zero projects and no available site token. Connected Google Calendar exposes an owned primary calendar, but it is not approved as the public booking calendar; its events were not queried or exposed. A connected calendar session is not a runtime credential for the hosted website.

## Exact standalone configuration still required

All values are server-only. Set these in the **feature branch Preview environment**, not production or VITE variables. Do not paste secret values into issues, PRs, or chat.

| Variable | Required value / verification |
| --- | --- |
| `STRIPE_SECRET_KEY` | Bhave Stripe **test-mode** server key; preview rejects live keys |
| `EBOOK_STRIPE_ACCOUNT_ID` | Corresponding verified account ID |
| `STRIPE_EBOOK_EN_PRICE_ID` | Active test one-time English price: USD 999 cents |
| `STRIPE_EBOOK_ES_PRICE_ID` | Active test one-time Spanish price: USD 999 cents |
| `STRIPE_WEBHOOK_SECRET_EBOOKS` | Signing secret for `/api/ebooks/webhook`, subscribed to completed and asynchronous-payment-success Checkout events |
| `EBOOK_BLOB_READ_WRITE_TOKEN` | Token for the private ebook store, followed by ingestion/readback of both final PDFs |
| `EBOOK_DOWNLOAD_SECRET` | Cryptographically random signing secret, at least 43 characters |
| `RESEND_API_KEY` | Authorized transactional email account server key |
| `EBOOK_RECEIPT_FROM` | Sender on a verified domain |
| `EBOOK_PUBLIC_ORIGIN` | Stable HTTPS branch preview origin |
| `EBOOK_RETAIL_APPROVED` | Remains false until final file review and controlled test activation |
| `EBOOK_ALLOW_LIVE_PAYMENTS` | Keep false; no live-payment authorization requested here |
| `LAB_BOOKING_FROM`, `LAB_BOOKING_TO` | Verified sender and authorized operator recipient for unconfirmed requests; also require `RESEND_API_KEY` |

Private ingestion command: `node scripts/ingest-ebooks.mjs /private/path/The_Possibility_English_Final.pdf /private/path/La_Posibilidad_Spanish_Final.pdf`. It requires the token through the environment and verifies file hashes and private readback. Never use a public object as a shortcut.

## Issue #7 decisions and implementation still required

No competing booking service or guessed slots were introduced. Before implementing a durable reservation/identity architecture, confirm an approved **public-site** transactional booking backend and identity mechanism, isolated from the private application. No existing such backend was found. The required design is one booking record and fulfillment pipeline shared by the session, included ebook and Room authorization:

1. Approve a calendar of record, actual weekly working windows, time zone, buffers, booking notice/horizon, cancellation/rescheduling and calendar-conflict policy. America/Chicago is only the issue's proposed default; no working hours are approved.
2. Provision authorized Google Calendar runtime credentials with free/busy and event operations; expose only available slots, never private event details.
3. Implement transactional, expiring slot holds and unique checkout/booking/entitlement records. Concurrent requests for a slot must serialize. Durable outbox/delivery records are needed for booking/confirmation/included-ebook retries. Do not use Blob, browser flags, or the connected personal-calendar tool as a reservation database.
4. Add the server-allowlisted $175 USD session Stripe price, dedicated signed webhook and one state machine. Verify paid payment and successful reservation before confirmation. On calendar failure retain a recoverable state and follow the approved refund/repair policy; do not falsely confirm.
5. Persist the chosen included edition against that booking. Issue exactly one included entitlement, without a second $9.99 Checkout, through the existing private PDF verification and delivery path. A request preference is not an entitlement. Current standalone `purchase_kind=ebook` handlers correctly ignore session events; automatic session fulfillment is **not implemented**.
6. Implement server identity verification, owned-booking lookup, revocation/refunds, and confirmation emails. Replace the deliberate unavailable `resolveClarityContext` stub only after those authoritative sources exist.

Naming variables for an unapproved backend now would imply nonexistent adapters. The exact *existing* configuration is listed above; booking-specific credentials/schema/configuration must be finalized with that architecture. This is the concrete blocker to a complete $175 customer flow, included delivery and authenticated Room access.

## Test evidence and remaining verification

34 automated tests pass (19 request/Room/Observatory, 15 ebook tests using both real final PDF fixtures, none skipped), plus five ebook API runtime smoke checks and the Room ESM smoke check. All API entrypoints pass strict NodeNext TypeScript compilation. Payment/email/identity adapters in the positive automated tests are simulated.

| Flow / check | Result |
| --- | --- |
| Observatory exploration, book language selection, session invitation | Browser checked; approved composition retained |
| English/Spanish standalone paid delivery | Simulated Stripe/Resend/private-asset adapters: exact final PDF bytes verified for both editions |
| Tampered tokens, unpaid/wrong price/currency/edition, duplicate/concurrent webhooks, provider failure/retry, refunds/disputes | Automated ebook tests pass; no actual Stripe refund or charge performed |
| Booking preference, forged confirmation claims and request-only receipt | Automated validation passes; no request creates a booking or ebook entitlement |
| Unauthorized/unpaid/refunded/other-guest Room access | Server-fixture denial tests pass; real resolver remains unavailable |
| Calendar availability, collision/hold expiry, calendar failure, DST, real $175 payment + reservation | **Not implemented/tested end-to-end**; no real slot invented or reserved |
| Automatic included ebook + genuine confirmation + authenticated Room | **Blocked/not verified**; no successful customer-flow screenshot fabricated |
| Desktop and 390px booking accessibility | Axe WCAG 2/2.1 A/AA: zero violations, 23 checks passed per view; cinematic contrast remains manual |
| Mobile responsiveness | Chrome iframe: no horizontal overflow; language selector inspected; physical iPhone/Safari/reduced-motion OS tests remain |
| Production build, Node ESM API checks, public privacy/artwork and transfer-size budgets | Pass; initial JS ~50.8 KB gzip, CSS ~8.2 KB, mobile Observatory artwork ~171 KB |
| Dependency security audit | Production: **0 vulnerabilities**. Full development tree after compatible fixes: **10 advisories (3 moderate, 6 high, 1 critical)**. Remaining legacy Vite/@vercel/node toolchain upgrades require a separate reviewed compatibility change; do not call the full audit clean. |

Standalone email deduplication currently uses Resend's 24-hour idempotency window plus the Stripe delivery marker. A sustained marker-write failure after accepted email can duplicate a receipt after that window. Strict durable retry/delivery guarantees for the full combined experience remain part of the transactional booking/outbox work above.

No real payment, provider email, calendar reservation, or physical-device test has passed yet. Final approval and production readiness require those checks and resolution of the development-tooling security findings.

Screenshots: `review/ebook-shop-en.jpg`, `ebook-shop-es.jpg`, `ebook-shop-mobile.jpg`, `launch-booking-desktop.jpg`, `launch-booking-mobile.jpg`, `launch-booking-mobile-choice.jpg`, `launch-session-unconfirmed.jpg`. These show current product views and an actual locked session state; they are not proof of a paid booking.
