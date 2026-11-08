# Paid booking implementation — review, not launch authorization

The reservation ledger uses PostgreSQL on the existing Neon integration. Private Vercel Blob serves only the ebook PDFs. The repository branch remains `codex/issue-8-ebooks`, draft PR #9 stacked on Observatory PR #5; booking coordination remains Issue #7.

**Current assessment: implementation available for review, genuine provider verification BLOCKED. Not ready for live purchases.** The preview serves the request fallback. Vercel lists sensitive database variables in Preview, but their endpoint is masked and the current Neon connection cannot see the specified project. No remote schema changes or real booking have been made. An unavailable real-provider test is not a passed test or a concurrency failure.

## Implemented flow

- `/api/booking` supplies readiness, real-calendar availability, checkout, owner-scoped status, included download and operator recovery actions. `/api/booking-webhook` verifies exact raw Stripe signatures, rejects live events and retrieves authoritative provider state. New booking runtime refuses **all live keys and production**, regardless of ebook live settings.
- New private booking form appears only when test configuration is present; otherwise the existing unconfirmed request form remains. The Observatory, original character artwork, Shop hierarchy, standalone $9.99 prices, final covers/PDF hashes and existing ebook handlers are preserved. The unpaid native Google schedule is never published/embedded.
- Explicit date search returns only owner-approved local windows minus Google free/busy and protected ledger intervals, with buffers. No default business hours. UTC timestamps are displayed in the approved IANA timezone, with DST-aware window checks. Search does not reserve a slot.
- The PostgreSQL ledger keeps one bounded reservation snapshot (1,000 records / 512,000 bytes) and stores each reservation in its own row. A revision update serializes writers and commits with the affected rows. A GiST exclusion constraint rejects overlapping active ranges, including the booking buffer. Released and revoked rows remain available for reconciliation. Stale revisions reload and re-evaluate, and missing or invalid data keeps booking closed.
- A server-owned HttpOnly, Secure, SameSite cookie plus a random browser attempt identifier scopes checkout retries. No password, membership or account. Immutable booking ID binds email, slot, selected EN/ES edition, price and origin. Changes to a used attempt are rejected.
- One $175 USD Checkout Session is created with a deterministic booking idempotency key and fixed parameters. PDFs are verified before a new hold and before checkout. A one-hour hold aligns to Checkout expiry; creation/replay stops when less than 31 minutes remain, with a conservative margin above Stripe's 30-minute minimum. No recovery creates a replacement payment attempt after uncertainty or idempotency expiry. Signed webhooks can recover an orphaned checkout ID only after authoritative metadata/line-item verification.
- An open/processing/unknown payment never releases a slot merely because a timer elapsed. Release requires authoritative expired/unpaid Checkout and a terminal safe PaymentIntent, or an expired hold on which no provider operation ever started. Unknown outcomes stay protected for review.
- Payment verification checks the existing Stripe account, test mode, exact $175 price/quantity/currency, immutable booking ID and language metadata, complete paid Checkout, successful PaymentIntent and paid, non-refunded, non-disputed charge.
- Calendar creation has a durable, conditional one-time claim and deterministic event/Meet request IDs. Exactly one app worker may send its POST. A lost response recovers with GET; if Google still reports no event, automatic POST retry is prohibited. This preserves safety even though Google documents that event-ID collision detection is not guaranteed. An uncommitted/unknown POST therefore needs operator reconciliation rather than an unsafe automatic retry.
- Final confirmation requires exact Calendar event identity, start/end, attendee, private booking metadata, confirmed status, valid Meet, no detected competing event, and rechecked payment. Paid-but-calendar-pending and conflicting bookings grant nothing and remain protected. Customer Calendar invitations occur only after payment verification.
- One included entitlement is the immutable language on that confirmed booking; there is no second ebook charge or session ebook Checkout. Assets use the existing private storage, exact SHA-256 verification and Resend adapter. The confirmation contains time, Google Meet, included download and booking-specific Room links.
- Room and included downloads accept distinct signed bearer scopes, check expiry and the exact ledger record, and re-fetch current payment and Calendar authorization. A redirect, cookie alone, email request, client flag or standalone ebook receipt cannot unlock the Room. Link fragments are removed from the address bar before API access. Ebook links expire seven days after confirmation; Room links last until at least seven days after confirmation or one day after the scheduled session, whichever is later.
- Confirmation email payload is frozen in the ledger before sending. Retries use the same Resend key and payload. Persisted sent state suppresses future sends. Uncertain outcomes older than 23 hours are quarantined rather than risking a resend beyond Resend's 24-hour idempotency window. One provider delivery is simulated in concurrent/retry tests; an unconditional distributed exactly-once guarantee is not claimed.
- Authenticated recovery visits at most three active records per request, rotating with persisted visit timestamps, and records a heartbeat. Fully delivered sessions leave the recovery scan after both access windows expire; historical records are preserved. Recovery does not repeatedly read delivered PDF bytes. Availability uses a per-request daily free/busy snapshot rather than one Google request per displayed slot. **New holds and first checkout creation fail closed if recovery has not run in the last 15 minutes.** The operator can run the included recovery script from an existing approved scheduler at least every ten minutes, with enough requests per cycle to cover the ledger. No paid cron/queue has been provisioned, and no scheduler capability/frequency has been assumed from Vercel's public product descriptions.

## Recovery and operational limits

| Case | Behavior |
| --- | --- |
| Simultaneous overlapping app requests | One conditional ledger winner; others get conflict before payment |
| Lost Stripe create response / duplicate browser retries | Same immutable Stripe idempotency key; no replacement charge |
| Local hold expired but payment uncertain | Hold remains protected |
| Expired, unpaid terminal Checkout | Release; never inferred from redirect or local clock |
| Paid, Calendar unavailable/conflicting | Pending/review; no Room, ebook or Lab confirmation; operator repair/refund policy required |
| Calendar POST interrupted | Recover exact event with GET; never repeat uncertain POST |
| Meet still pending | No final confirmation or fulfillment |
| Email failed/lost response | Same frozen message/key; safe retry within provider window, then operator reconciliation |
| Refund, partial refund, dispute | Current access denied; webhook/recovery marks revoked |
| Calendar cancelled | Current access denied; recovery marks revoked |
| Calendar manually rescheduled | Existing event preserved; changed start/end fails authorization until approved reconciliation. No automatic second reservation or charge |
| Worker stops / store corrupt or deleted | New bookings closed; existing uncertain holds are not silently discarded |

External/manual Calendar writers and the separate unpaid native page cannot participate in the PostgreSQL transaction. They can create conflicts during payment. Rechecks detect observed conflicts, but **there is no atomic transaction across Calendar and Stripe**. The owner must close competing future unpaid booking availability before activation, preserving existing appointments. Never claim that this prevents arbitrary external changes after a final check. Unknown Calendar creation, late orphaned checkout, ambiguous email, rescheduling and paid reservation conflicts require an operator; no unsafe new create/refund is automated without policy.

## Exact configuration still needed

All server-only; never `VITE_` prefixed. Keep `BOOKING_ENABLED=false` until the real safety gates pass. `.env.example` contains these names.

| Variable | Required value/purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Restricted **test** key in the existing Bhave account, scoped to required Checkout, prices, account, PaymentIntent and charge reads/writes |
| `EBOOK_STRIPE_ACCOUNT_ID` | Exact existing Stripe business account ID; checked at runtime |
| `BOOKING_STRIPE_PRICE_ID` | Verified active test one-time **17500 USD cents** price; one session, no ebook line-item charge |
| `BOOKING_WEBHOOK_SECRET` | Test webhook signing secret for `/api/booking-webhook` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Server-side OAuth grant authorized for the owner's approved **test** calendar: free/busy, event reads/writes and Google Meet creation. ChatGPT's connected Calendar is not this grant |
| `BOOKING_TEST_CALENDAR_ID` | Explicit owner-approved test calendar; no testing against existing live appointments |
| `BOOKING_CALENDAR_WRITE_APPROVED` | `true` only after approval of that exact test calendar |
| `BOOKING_AVAILABILITY_JSON` | Owner-approved `{timezone,windows:[{day,start,end}],noticeMinutes,horizonDays,bufferMinutes}`; days 0–6 Sunday–Saturday, HH:mm local windows, no overnight windows. Current safety bounds: notice at least 60 minutes, horizon 1–90 days, buffer 0–180 minutes. No actual hours inferred or supplied |
| `EBOOK_BLOB_READ_WRITE_TOKEN` | Access to existing **private** `bhaves-lab-ebooks-preview` store, not a newly created store |
| `BOOKING_TEST_DATABASE_HOST` | Exact **pooled hostname** of the existing Neon `bhaves-lab-booking-test` branch, scoped to Vercel Preview for `codex/issue-8-ebooks` |
| `BOOKING_DATABASE_URL` | Optional Preview branch override if the integration-provided `DATABASE_URL` targets a different endpoint. Runtime requires the URL hostname to match the pin and enforces verified TLS. |
| `BOOKING_ACCESS_SECRET` | At least 43 random characters for scoped booking links |
| `BOOKING_RECOVERY_SECRET` | Separate at least 43 random characters for the private recovery endpoint/script |
| `RESEND_API_KEY`, `EBOOK_RECEIPT_FROM` | Existing Resend account and verified-domain transactional sender |
| `EBOOK_DOWNLOAD_SECRET`, `EBOOK_PUBLIC_ORIGIN` | Existing ebook signing secret (43+ characters) and exact HTTPS preview origin |
| `BOOKING_ENABLED` | Opt-in `true` only in a test preview after safety checks; production hard-rejected |

Standalone ebooks additionally retain `STRIPE_EBOOK_EN_PRICE_ID`, `STRIPE_EBOOK_ES_PRICE_ID`, `STRIPE_WEBHOOK_SECRET_EBOOKS`, `EBOOK_RETAIL_APPROVED` and `EBOOK_ALLOW_LIVE_PAYMENTS=false`. Request fallback needs `LAB_BOOKING_FROM`, `LAB_BOOKING_TO` and the shared Resend key to send; without them it honestly reports unavailable and offers email. Final PDFs must be ingested into existing private storage using the existing manifest-pinned ingestion script; neither PDF is public or committed.

Webhook test events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`. Refund/dispute association uses Stripe PaymentIntent-to-Checkout identity, never matching email/time/amount. Recovery also checks Calendar cancellations and rescheduling; no unverified Calendar push notification can authorize a booking.

## Safe provider verification procedure

1. In Neon project `wild-rain-02483727`, open the existing `bhaves-lab-booking-test` branch and confirm its pooled and direct endpoints. Compare the pooled endpoint with the Vercel Preview credential. Scope the hostname pin to `codex/issue-8-ebooks`. If necessary, set the existing test branch URL as a sensitive override for that Git branch only. Keep the booking flag off.
2. In the Neon SQL Editor, select that exact test branch and its application database, or use the verified direct endpoint. Apply [the migration](../db/booking.sql) once. Confirm both tables and the exclusion constraint. Never apply it to main. There is no runtime auto-migration.
3. Run `node scripts/test-booking.mjs` for simulated provider coverage. Set `BOOKING_LOCAL_TEST_URL` to a fresh disposable loopback PostgreSQL database named `booking_test` to include the database-backed cases. Repeat the concurrency and recovery checks on the verified Neon test branch before enabling the Preview flow.
4. Configure owner-approved isolated test Calendar/OAuth, test Stripe price/webhook, private final PDFs, signing secrets and verified Resend sender. Use test contact addresses; no real calendar test booking without authorization for that calendar.
5. Set up the existing recovery execution mechanism, run `node scripts/recover-bookings.mjs` and verify the heartbeat; repeat at least every ten minutes and cover every active record per cycle. This requires no customer account. Worker downtime must make new checkout unavailable.
6. Enable only test preview. Exercise both selected languages, Stripe successful/failed/abandoned/delayed payments, duplicate/out-of-order webhooks, simultaneous slot claims, commit-response loss, cancellation/refund/dispute, email failures, expired/wrong-kind links and conflicting slots with actual providers. Check Calendar and Stripe records directly for exactly one reservation/payment attempt. Physical Safari/iPhone remains a separate check.
7. Confirm actual hours/timezone, notice, buffers, cancellation/refund/rescheduling and paid-conflict policy with the owner. Close future unpaid native scheduling without deleting existing appointments. Resolve audit findings and all real safety gates, then request separate production approval. This code intentionally cannot enable production/live payments.

## Executed checks and evidence

- All 36 booking checks passed locally. The database-backed check used PostgreSQL via PGlite with a loopback socket and multiplexed connections. It admitted one of 16 overlapping requests, rejected a direct overlapping write without committing the revision, rejected a stale write, and recovered an interrupted checkout with a new connection pool. Duplicate recovery converged to one simulated Checkout, event, and confirmation. This is not a Neon multi-session test.
- The standalone ebook, request, Room, and offline diagnostics regression suites passed, as did strict API compilation and the Vite build. Provider payments, Meet creation, email delivery, and protected assets remain to be verified end to end in the configured Preview.
- Production dependency audit: zero vulnerabilities. Existing full development audit: 10 unresolved advisories (3 moderate, 6 high, 1 critical). Deferred legacy Three.js bundle and static-render fetchPriority warnings remain; the ledger adds the server-side `pg` driver.
- Local browser review uses a clearly labeled, uncommitted synthetic fixture, not invented public availability. Date search, slot selection, Spanish language choice and failed checkout were exercised; failure did not display confirmation. Desktop and 390px iframe Axe WCAG A/AA: zero final violations, 23 and 22 checks passed respectively, no horizontal overflow. Color contrast remains an incomplete/manual check; an early transient contrast result was rerun on the fully loaded form. This is Chrome at a mobile layout width, not physical iPhone/Safari.
- Screenshots `review/paid-booking-simulated-desktop.jpg` and `review/paid-booking-simulated-mobile.jpg` show **simulation**, not successful provider bookings. Existing approved Observatory and Shop screenshots remain valid.
- **Real Blob test execution: BLOCKED (exit 2), no token present.** Vercel reconfirmed zero preview integration variables; existing private Blob store still empty/unlinked. Local runtime has no Blob, Stripe, Google or Resend credentials. No real payment, reservation, Meet creation, email or included-delivery E2E was performed. No Blob test failed because none could run; safety against the actual service remains unproved.
