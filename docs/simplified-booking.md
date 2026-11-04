> Current decision: [paid-booking-proposal.md](paid-booking-proposal.md) supersedes earlier native-paid-scheduling recommendations. The supplied Google schedule accepts unpaid appointments. A small ledger in existing private Blob storage is proposed, pending owner approval and real concurrency/recovery tests. Historical evidence below is retained.

# Simplified booking integration — November 4, 2026

## Decision

Use existing Google Calendar appointment scheduling first **if this account is eligible and its paid-booking integration can be verified**. No customer accounts, passwords, memberships or dashboards. No new Supabase project or custom booking database is approved, created, or demonstrated necessary. This supersedes the earlier default database/auth recommendation in the launch report.

The current public request remains a request. Real appointment selection, payment, included ebook fulfillment and booking-specific Room links are not operational; no native booking URL or successful payment was invented.

## Current account evidence

| Check | Actual result |
| --- | --- |
| Reconnected Calendar profile and calendar ownership | Connection works; owned primary calendar is accessible |
| Real Google free/busy request | Succeeded without errors for a bounded seven-day diagnostic interval; event titles/details were not fetched or published. This does not establish working hours or public appointment slots. |
| Browser access to appointment settings | Still signed out after reconnection. Native subscription/payment settings could not be inspected. No sign-in failure proves that the feature is unavailable. |
| Stripe Bhave account | Existing account is charges-enabled, details submitted, card-payments capability active; read-only check, no payment mutation |
| Stripe test access | Connection exposes only live mode. No test credentials or Google-native test-mode path verified. No live charge attempted. |
| Resend | `auth.bhaveslab.com` remains verified with sending enabled. Site preview has no Resend API key/sender configuration. No email sent. |
| Vercel preview | Zero integration environment variables configured; purchases remain disabled |
| Private ebooks | Finalized hashes/covers unchanged. Existing private Blob store remains empty/unlinked; ingestion still blocked by its missing runtime token. |

Account emails, private availability and customer/payment information are intentionally excluded from this public report. Reconnecting a Calendar app provides tool access, not a browser session or credentials for the hosted website.

## What native Google can provide

Google documents configurable appointment duration, availability, buffers, booking-form questions, confirmation emails and Stripe payment at booking on eligible plans. A required ebook-language question can be evaluated in the native form. Customers can verify their email without creating a Google account where the feature is eligible. These are product capabilities, not verified settings of this particular account.

Google's current eligibility chart distinguishes free/personal appointment pages from paid scheduling: Google One Premium/AI Pro/AI Ultra do not have the chart's appointment-payment checkmark; eligible Workspace plans do. A Gmail address alone is not proof of subscription eligibility.

Cancellation does **not** automatically refund payment. Owner cancellation/refund policy must be reflected consistently in Google, Stripe and Lab access.

Sources: [Google schedule setup](https://support.google.com/calendar/answer/10729749), [plan comparison](https://support.google.com/calendar/answer/16287038), [paid appointments and refunds](https://support.google.com/calendar/answer/13762729).

## Where native scheduling alone is insufficiently verified

The public Events API schema has event IDs, status, time, attendees and extended properties, but no documented structured Stripe payment identifier or paid status. A Calendar change notification has no event body or payment confirmation: the website must retrieve the resource. Event presence, matching email/title/time/amount, confirmation email, and redirects are not sufficient authorization.

The inspected official documentation does not establish a guaranteed native payment-to-event correlation, supported test-mode switch, API-readable ebook-language answer, native rescheduling identifier behavior, or webhook access in the existing Stripe account. These remain **unverified**, not proven impossible. A real account inspection and safe test booking must establish them before deciding native paid scheduling is unsuitable. Do not implement fuzzy matching or treat a presumed field as a contract.

Sources: [Events schema](https://developers.google.com/workspace/calendar/api/v3/reference/events), [Calendar notifications](https://developers.google.com/workspace/calendar/api/guides/push), [Stripe webhook verification](https://docs.stripe.com/webhooks).

## Is a new database necessary?

**Not established.** Basic scheduling/payment can be owned by Google and Stripe. Google explicitly supports private event extended properties for application data without an external database, and etag/If-Match updates for concurrency control. Those existing records are the first place to evaluate storing one language choice, correlated payment ID and delivery status. Use only organizer-private properties; shared attendee-editable metadata must never authorize access. Treat this as a candidate design requiring validation, not an implemented atomic transaction across providers.

One delivery record and safe retry policy are still required. Avoid introducing an entire customer identity system. Possession of a short-lived, unguessable booking-specific link can identify an authorized booking without creating an account; the server must still recheck the actual appointment and payment for every protected operation. The existing signed ebook download logic and private asset verification can be reused, with a separate session entitlement type so a standalone $9.99 ebook never unlocks the Room.

Sources: [Private event metadata](https://developers.google.com/workspace/calendar/api/guides/extended-properties), [conditional updates](https://developers.google.com/workspace/calendar/api/guides/version-resources), [Stripe metadata](https://docs.stripe.com/metadata).

## Smallest viable options, in order

1. **Preferred: native paid schedule plus a small Lab fulfillment/access bridge.** Google owns slots/reservations and takes the single $175 payment through the existing Bhave account, if supported. The bridge verifies the exact event/payment correlation and chosen language, uses the existing protected PDF/Resend infrastructure, and sends one booking-specific access link. It creates no second charge or customer account. Do not build or enable the bridge until its input contract can be demonstrated with actual safe test data.
2. **If native paid scheduling lacks a verifiable integration contract:** recommend first-party Stripe Checkout plus Google Calendar, reusing the existing Vercel functions and delivery code. Explicitly demonstrate the gap before requesting approval. Collision-safe slot holds and durable retry state would be needed; evaluate Calendar's private records/conditional writes before any additional store. Free/busy followed by insert is not a transaction or double-booking guarantee. No custom scheduler is implemented in this change.
3. **Only if existing records demonstrably cannot provide the needed concurrency/deduplication/recovery guarantees:** document that failure and request approval for the smallest durable ledger. No Supabase project by default; no separate customer-auth/account system.

An owner-reviewed manual confirmation could be an interim operational option, but is not the requested automatic booking/payment/ebook/Room flow and has not been substituted for it.

## Exact next checks before implementation or launch

1. Inspect the actual owner's Calendar → Settings → Appointment schedules and the existing booking page. Verify eligibility, ability to require payment, account connected to Stripe, native custom language field and guest email verification. No subscription purchase or payment activation without approval. If an appointment booking-page URL already exists, provide that URL for direct inspection.
2. Set the single offer to 60 minutes / $175 USD only after actual weekly availability, timezone, buffers, notice/horizon and cancellation/rescheduling policy are supplied. No default working hours or fictional slots.
3. Establish a **safe Stripe test configuration in the same business account**. Confirm native scheduling can use it; otherwise stop rather than create a live charge. Inspect exact Google event and Stripe identifiers from a controlled native booking, plus language, cancel/refund/reschedule behavior. Do not use an unrelated sandbox/account as proof of this integration.
4. Prove an immutable appointment/payment link that the hosted server can retrieve and validate. Confirm website runtime OAuth/service access and webhook permissions separately from connected-tool access.
5. Reuse the ebook functions: inspect active paid $175 payment, exact reserved event, selected language and final asset hash; issue one complimentary entitlement without a second Checkout. Recheck cancellation/refund/dispute on download and Room access. Exercise webhook concurrency, payment failure, calendar failure, email retry and rescheduling before claiming completion. Existing provider-window idempotency alone is not a perpetual exactly-once guarantee.
6. Configure existing private PDF storage and Resend in Preview and run genuine safe provider tests. Keep the Room closed and live flags off until all checks pass and the owner approves production.

Existing required server variables are listed in `.env.example`: `STRIPE_SECRET_KEY` (test), `EBOOK_STRIPE_ACCOUNT_ID`, both `STRIPE_EBOOK_*_PRICE_ID` values, `STRIPE_WEBHOOK_SECRET_EBOOKS`, `EBOOK_BLOB_READ_WRITE_TOKEN`, `EBOOK_DOWNLOAD_SECRET`, `RESEND_API_KEY`, `EBOOK_RECEIPT_FROM`, `EBOOK_PUBLIC_ORIGIN`, and request-only `LAB_BOOKING_FROM` / `LAB_BOOKING_TO`. Keep `EBOOK_ALLOW_LIVE_PAYMENTS=false` and purchases disabled. A native booking-page link needs no secret API key merely to display, but authenticated verification/fulfillment needs its own website runtime credentials. No imaginary environment variables for an unimplemented booking adapter are presented as sufficient configuration.

## This change and verification

Added explicit account-free public copy and clarified that a server-verified booking-link identity does not imply a customer account. Protected access remains closed. No scheduler, database, subscription, account creation, payment activation, native schedule publication or private-app modification.

35 automated tests pass (20 request/Room/Observatory and 15 ebook tests using the actual final PDFs, none skipped). Build, five ebook API runtime smoke checks, Room ESM smoke check, privacy/artwork and performance-budget checks pass. Production dependency audit reports zero vulnerabilities. Desktop and 390px mobile Axe WCAG A/AA scans each report zero violations with 23 checks passed; cinematic contrast remains a manual check. Mobile document width equals scroll width (no horizontal overflow). Evidence: `simplified-booking-checks.json` and `review/simplified-booking-desktop.jpg` / `review/simplified-booking-mobile.jpg`. Previous full development-toolchain audit still has 10 unresolved findings (3 moderate, 6 high, 1 critical); dependencies were not changed by this task. Positive payment/email/Room tests use simulated providers and do not prove native paid scheduling. Native availability UI, Google/Stripe test booking, included fulfillment, cancellations/refunds/rescheduling and physical-device behavior remain blocked/unverified. Detailed command results are reported in the PR.
