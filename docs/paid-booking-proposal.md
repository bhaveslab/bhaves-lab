# Paid session booking: decision for approval — November 4, 2026

**Not launch-ready. No paid scheduler or reservation ledger has been implemented.** This assessment supersedes the native-paid-scheduling recommendation in simplified-booking.md. Existing request handling and protected Room remain closed to unverified bookings. Observatory, ebook prices/assets and private application are unchanged.

## Verified findings

- Owner tested the supplied Google schedule: it accepts appointments without collecting payment and this account does not expose paid-booking settings. Do not publish/embed that unpaid link as checkout or recommend an upgrade as the default solution.
- Direct read-only inspection of that public page shows a 60-minute Possibility Session, Google Meet, $175 in descriptive copy, and available weekday starts from 3 AM through 10 AM in the displayed Central Time–Chicago timezone. Some dates differ; weekends were unavailable in the inspected week. Description text is not a payment requirement.
- One existing matching Calendar appointment was read without mutation: confirmed Calendar status, 60-minute duration and Meet present, start corresponding to 3 AM Chicago time. Calendar confirmation proves no payment. No attendee details, event identifiers or Meet URLs are published here.
- Display timezone was verified; the owner's underlying calendar/schedule timezone, buffers, minimum notice, booking horizon and cancellation/reschedule settings were NOT verified. Do not infer the cause of the 3 AM opening or change business hours without approval.
- Connected Calendar owner access works. This is not a website runtime OAuth grant.
- Existing Stripe connection exposes the live Bhave account only; no test-mode credentials or real test payment. No charge was made.
- Preview environment has zero integration variables. Existing private ebook Blob store is empty and unlinked. Resend sending domain remains verified, but runtime key/sender are absent. Both final PDFs and their manifest hashes remain unchanged.

## Why payment-first needs persistent coordination

Google free/busy reads availability; events.insert does not provide an atomic check-and-reserve across overlapping intervals or a transaction with Stripe. Event etags protect updates to an existing resource, not all appointments. Deterministic event IDs are useful recovery identifiers, not a lock: Google's insert documentation explicitly does not guarantee collision detection at creation. Native schedule payment integration is unavailable on this account. No supported API reservation contract for this supplied native schedule was established.

Consequently, redirecting from Stripe to the unpaid Google page cannot guarantee a paid customer receives a slot. Storing only final Calendar events or Stripe metadata cannot serialize simultaneous overlapping requests and recover all intermediate states safely.

## Smallest candidate: reuse private Vercel Blob for a bounded booking ledger

Approval requested for persistent booking state in the **existing** private Blob store, with existing Vercel functions, Stripe, Calendar and Resend. No new provider, Supabase project, SQL database, customer account or subscription. This is a design proposal, not a tested production reservation system.

Installed @vercel/blob 2.8.2 supports conditional writes (`ifMatch`) and fresh private reads (`useCache:false`). A single bounded ledger object with etag compare-and-swap can serialize all app-created overlapping holds; losing writers reload and recheck the entire interval. Bootstrap, contention, failure and stale-read behavior must be proven against the actual store before relying on it. Reject excessive ledger growth; establish retention and recovery procedures. A per-booking blob alone cannot protect overlapping appointments. Never fall back to unconditional writes or cached availability as authority.

Proposed flow:

1. Read Google free/busy inside owner-approved timezone, weekly windows, notice, buffers and horizon. Return only bookable slots, never private event details.
2. Atomically claim a time interval in the ledger, with booking ID, immutable selected edition and attempt ownership. Recheck Calendar; any optional busy hold event requires authorized calendar write access and must not send a premature attendee confirmation.
3. Persist an idempotent $175 USD Checkout attempt bound to that hold before exposing its URL. Retry the same attempt after uncertainty; do not create a new charge attempt. A second independent checkout for the same booking is blocked. Verify price server-side. Stripe Checkout's configured expiry is at least 30 minutes; reservation expiry must agree with its actual payment lifecycle. No local-clock-only release while payment may still succeed.
4. Verify webhook raw signature and retrieve the exact Checkout/PaymentIntent/charge in the correct account and mode. Validate price, booking and edition. A redirect grants nothing. If asynchronous payments are allowed, retain the hold until terminal payment status; evaluate immediate-payment configuration in test mode before choosing policy.
5. Keep paid-but-calendar-pending bookings unavailable. Idempotently create/recover the exact Calendar event, obtain and verify Meet, then re-read payment and event before marking confirmed. A crash, conflict or failed Calendar/Meet call must never produce confirmation, Room access or resale of the slot. Establish owner-approved repair/refund policy for irrecoverable conflicts.
6. Issue one session ebook entitlement for the recorded EN/ES choice, reusing finalized private assets with hash verification. No extra ebook checkout. Send booking/Meet details, protected ebook link and short-lived booking-specific Room link via Resend. Persist fulfillment/outbox state with conditional claims. No passwords or customer dashboard.
7. Recheck authoritative payment, reservation, ownership, token scope/expiry and revocation before Room/PDF access. Refunds, disputes, cancellations and rescheduling update the same booking and entitlement rather than creating independent grants. Agree policy for partial refunds, expiry, cancellations and rescheduling before activation.

Email cannot have an unconditional exactly-once guarantee across provider failures. Reuse deterministic Resend idempotency within its 24-hour window, persist delivery outcome, and quarantine ambiguous outcomes outside that window for reconciliation instead of blind automatic resend. Durable recovery execution, retries and operator alerts must be validated using existing Vercel capabilities before launch; no new paid cron/queue assumed.

External/manual Calendar writers do not honor this ledger. The unpaid native route must cease offering competing future bookings before launch, with owner approval and existing appointments preserved. Check free/busy again before finalizing; unexpected external conflicts need a recovery/refund path. This design does not promise an atomic transaction across Google and Stripe.

If real Blob contention/recovery tests cannot establish safety, stop and report the smallest transactional-store alternative for separate approval. Do not silently provision it.

## Configuration and owner decisions

Already implemented ebook/request variables (server-only): `STRIPE_SECRET_KEY` in test mode, `EBOOK_STRIPE_ACCOUNT_ID`, `STRIPE_EBOOK_EN_PRICE_ID`, `STRIPE_EBOOK_ES_PRICE_ID`, `STRIPE_WEBHOOK_SECRET_EBOOKS`, `EBOOK_BLOB_READ_WRITE_TOKEN`, `EBOOK_DOWNLOAD_SECRET` (at least 43 characters), `RESEND_API_KEY`, `EBOOK_RECEIPT_FROM`, `EBOOK_PUBLIC_ORIGIN`, and request-only `LAB_BOOKING_FROM`/`LAB_BOOKING_TO`. Keep `EBOOK_ALLOW_LIVE_PAYMENTS=false`; enable preview retail only after safe test configuration.

Additional booking requirements, not implemented environment variables: website-runtime Google OAuth client/refresh authorization scoped for chosen calendar free/busy, event writes and Meet; exact owned calendar ID; Stripe TEST $175 one-time USD price and separately verified booking-webhook signing secret; server-only booking token signing secret; approved private ledger path/retention; verified sender and recovery execution configuration. Exact adapter variable names will be documented when approved, not invented as if setting them now completes the backend. Test and live credentials/events must remain isolated.

Owner decisions: booking calendar and IANA timezone; weekly hours; buffers; minimum notice/horizon; hold duration compatible with Checkout; cancellation/refund/rescheduling policy; handling paid reservation conflicts and ambiguous emails; approval to close future unpaid native bookings while retaining existing appointments. No settings or appointments were changed.

## Verification and launch gate

Current regression results are recorded below after execution. Existing unit tests simulate providers; they do not demonstrate live payment/calendar coordination. Prior desktop/mobile screenshots and Axe evidence remain applicable because no UI was changed. Physical iPhone/Safari and native booking settings remain unverified.

Before launch, actual test-mode E2E must prove: both selected editions; successful $175 payment plus reserved event/Meet; failed/abandoned and delayed payments; duplicated/out-of-order webhooks; simultaneous overlapping requests and expiry races; unavailable Calendar slots; paid-then-calendar failure; process crashes/retries; refunds/disputes/cancel/reschedule revocation; wrong-language, expired and unauthorized download/Room links; email rejection and ambiguous delivery; mobile and Safari. No positive booking integration tests can run until credentials, ledger approval and schedule policies exist. No live calendar test event without explicit authorization.

## Primary references

- [Google event insert and conference creation](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert)
- [Google resource conditional updates](https://developers.google.com/workspace/calendar/api/guides/version-resources)
- [Vercel Blob conditional writes](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Consistent private Blob reads](https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage)
- [Stripe Checkout expiry](https://docs.stripe.com/api/checkout/sessions/create)

## Executed regression checks for this proposal

- `node --test tests/*.test.cjs`: 20 passed.
- `node scripts/test-ebooks.mjs ../final-ebooks/The_Possibility_English_Final.pdf ../final-ebooks/La_Posibilidad_Spanish_Final.pdf`: 15 passed, zero skipped, actual final PDF fixtures. Initial run without explicit fixture paths skipped six; complete rerun above passed all. Stripe/email/provider responses remain simulated.
- `node scripts/check-ebook-runtime.mjs`: five API smoke checks passed; `node scripts/check-clarity-runtime.mjs`: emitted Node ESM and locked Room passed.
- `npm run build`, public build guard (including unpaid schedule exclusion), exact-character/artwork/privacy verification: passed. Initial JS 50,836 gzip bytes; CSS 8,244; mobile artwork 171,098 bytes. Deferred legacy Three.js size warning remains.
- `npm audit --omit=dev`: zero vulnerabilities. Full dependency audit: 10 unresolved findings (3 moderate, 6 high, 1 critical), in the legacy development toolchain; no dependencies were changed. React static-render tests also retain a fetchPriority casing warning.
- Existing Vercel preview booking page inspected: request-only language, EN/ES preference, no account/password required, no payment collected, no confirmed access. No form submitted. No UI edits or new accessibility/device claims in this proposal; prior desktop/mobile Axe evidence remains in simplified-booking-checks.json.
- No real Stripe test payment, calendar mutation, email delivery, private Blob contention test or included-session entitlement E2E performed. These remain launch blockers.
