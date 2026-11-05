> Diagnostic follow-up: [blob-failure-diagnostic.md](blob-failure-diagnostic.md). SDK and assertion inspected; sanitized response instrumentation added and validated offline. No real rerun. The actual prior failure remains unresolved and the safety stop below remains in force.

# Real provider audit and Blob safety stop — November 4, 2026 (America/Chicago)

**STOP: the real Blob contention probe failed. No further provider mutation tests were run after that failure. Paid booking and retail remain disabled. No alternative database, permanent ledger, PDF ingestion, live payment, merge or production deployment.**

## Existing service audit and configuration completed

- Existing Vercel project and private `bhaves-lab-ebooks-preview` store reused. The owner connected the store to the project. Connection metadata explicitly grants **Preview and Production** access and injects `BLOB_STORE_ID` / `BLOB_WEBHOOK_PUBLIC_KEY`; no static Blob read-write token appeared in the inspected Preview variables. Production access was inspected, not used or altered.
- Before the owner's Blob-test-only update, nine variables were configured **only for Preview, branch `codex/issue-8-ebooks`**: `RESEND_API_KEY` (Sensitive), `EBOOK_RECEIPT_FROM`, `EBOOK_PUBLIC_ORIGIN`, `EBOOK_STRIPE_ACCOUNT_ID`, `BOOKING_ENABLED=false`, `BOOKING_CALENDAR_WRITE_APPROVED=false`, `EBOOK_RETAIL_APPROVED=false`, `EBOOK_ALLOW_LIVE_PAYMENTS=false`, and `BOOKING_LEDGER_PATH=bookings/test/bhaves-lab-preview-v1.json`. Setting the path does not create its object.
- Resend's existing `auth.bhaveslab.com` domain is verified with sending enabled. A sending-only, domain-restricted credential named `Bhaves Lab Preview Fulfillment` was installed directly as the Sensitive Preview variable; its value was not displayed, committed, put in a command argument or written to a report. Existing keys were not rotated or modified. Sender: `BHAVÉ’S LAB <sessions@auth.bhaveslab.com>`.
- Real Resend API probes to its official disposable simulator recipients reported `delivered` and `bounced`. Replaying the exact batch/idempotency key returned the same two message IDs. IDs: `01a1a987-5151-7dfa-90e2-0d1a7f79bef5` / `01a1a987-5151-7d79-96c4-5daca691cb6c`. This verifies connected-account API processing and simulator outcomes, **not customer inbox delivery, the new runtime credential, booking emails or ebook fulfillment**. No customer recipient, booking, payment, protected link or PDF was involved.
- Stripe connection still exposes only the existing Bhave **live** context. No test-mode price or webhook could be created through it. No live mutation was attempted. Test-context reconnection or a restricted test credential remains required.
- Calendar connection works and shows the owned primary calendar plus two read-only calendars. No separate test calendar is present. The enabled Calendar connector does not provide calendar creation or export website-runtime OAuth credentials. No appointment was created or modified. Testing timezone will be `America/Chicago`; no operational hours were invented.

## Actual Blob execution

Source commit: `c4ee311c2489c70ba016f2c4637e5de6b0a8e852`.

One-off test deployment: `dpl_3vHjMhi2FPwPexw2RtfMrKwNEDPp`, target `null` (Preview), build log confirms `probeEnvironment: preview`, `authMode: preview-oidc`, expected existing store identity, no secret values logged. The SDK read the short-lived OIDC credential automatically; no token was exported or copied from Production.

The one-deployment build override ran `npm run build && node scripts/build-blob-probe.mjs`. It compiled only the booking core and ran the existing disposable probe with Preview OIDC support. Normal application build configuration does not automatically run this data mutation test. No public probe endpoint was created.

| Check | Actual result |
| --- | --- |
| Existing private store and Preview authentication | Verified by successful initial disposable object write and private origin read |
| Production access check | Connection includes Production, but no Production deployment or credential was used |
| Eight same-etag conditional writers | Exactly **one fulfilled write** and seven rejections were observed (the single-winner assertion passed) |
| Expected conflict classification | **FAILED**: at least one rejection was not the expected `BlobPreconditionFailedError` instance |
| Error recorded | `FAILED real Blob safety check: Unexpected provider error: fail test; do not introduce another store` |
| Exact underlying provider error | **Unknown**: the assertion did not record the rejected SDK error class, HTTP status or message. Do not infer rate limiting, broken atomicity or an SDK mapping defect without evidence |
| Stale-write rejection assertion | Not reached |
| Fresh-read consistency assertions after contention | Not reached; initial read and cleanup read did succeed |
| Injected interrupted-response recovery | Not reached |
| Independent Node-process restart read | Not reached |
| Twelve simultaneous reservations through actual Blob adapter | Not reached |
| Cleanup | Probe finally block completed without cleanup error; subsequent store metadata reports **0 objects / 0 bytes** |
| Overall gate | **FAILED / STOP**, test deployment `ERROR`, script exit 1 |

The normal application Preview for the same source commit was READY (`dpl_FFvudZVQXQ4FcnbF7KQ4SuMNaCkQ`). A successful application build is not a passed Blob test. The failed one-off safety build was not promoted. Thirty-four simulated booking regression tests passed locally before the real probe; previous ebook/public tests remain simulated evidence only.

The limited result does **not** establish that Blob permits duplicate writers: the observed successful-writer count was one. It also does **not** establish the safety contract required for launch, because unexpected rejection behavior failed the probe and all subsequent recovery/reservation assertions were skipped. No test thresholds were weakened, no retry was run after failure, and no database fallback was introduced.

## Remaining blockers and precise owner actions

### Blob — stop first

The approved failure condition has been reached. The next investigation needs the exact rejected SDK error type/status under a separately authorized diagnostic run. Do not initialize a permanent ledger or ingest retail PDFs. Do not interpret the absence of a static token as absence of Preview access: OIDC access is now verified.

The business runtime still requires its existing `EBOOK_BLOB_READ_WRITE_TOKEN` configuration; only the probe/ledger adapter's optional credential accepts the connected Preview OIDC path. Booking remains disabled; do not broaden runtime authentication or switch storage architecture while the safety gate is failed. Production storage access already exists because of the owner's connection and should be reviewed by the owner independently; this task did not remove or expand it.

### Stripe — dependent testing paused

Authorize **test mode for the existing Bhave account** through the Stripe connection screen, or install a restricted test key as `STRIPE_SECRET_KEY` in Preview for this branch. Do not create a second account or use a live key. After test access is available and the Blob gate is resolved, inspect existing test prices first; reuse or create one-time USD prices of 17500 cents (session), 999 cents English and 999 cents Spanish. Then register the exact Preview `/api/booking-webhook` and `/api/ebooks/webhook` endpoints in **test mode**, saving their separate signing secrets directly in Vercel. No prices or webhooks were fabricated here.

### Calendar — owner setup required, dependent tests paused

In the existing owner account, Settings → Add calendar → Create new calendar, create a clearly named `Bhavé’s Lab — Integration Test` calendar with timezone **America/Chicago**, or identify an existing separately approved test calendar. Supply its Calendar ID from Integrate calendar, not the primary/personal calendar. Do not change the public Appointment Schedule.

Use an existing approved Google Cloud project with Calendar API enabled and a dedicated public-Lab OAuth client. Authorize the same owner with `calendar.events` and `calendar.events.freebusy` scopes and offline access, storing `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` directly in branch-scoped Sensitive Preview variables. Do not repurpose the private application's credentials or create a new Cloud project without approval. Google OAuth Playground with the owner's client is an official option for obtaining offline authorization; never paste credentials in chat. An external OAuth consent app in Testing can issue seven-day refresh tokens, which must be accounted for before launch.

Set `BOOKING_TEST_CALENDAR_ID` only to the approved test calendar. Keep write approval false until controlled testing is actually authorized and the Blob safety stop is resolved. Owner-approved `BOOKING_AVAILABILITY_JSON` still needs hours, notice, horizon and buffers; the timezone instruction alone supplies none of those values.

### Recovery — platform and implementation constraints

No schedule is configured in `vercel.json`. Vercel Cron invokes **GET on Production**, while current recovery is authenticated **POST on Preview** with exact Origin and bearer-secret validation. Adding a cron expression alone cannot schedule this Preview recovery. The actual account plan/frequency entitlement is not exposed by the inspected account metadata. Official limits differ: Hobby daily versus Pro/Enterprise minute intervals; no upgrade was purchased or recommended as an automatic solution.

For a controlled Preview test, the existing recovery script can be invoked manually after all safety gates/credentials are ready. Automatic recovery frequency, downtime closure, authentication and retry behavior are **not yet validated with providers**. Production requires an explicitly approved execution arrangement and appropriate authenticated invocation; no additional scheduler was purchased or provisioned. Separate booking/access/download signing secrets remain missing.

## Primary documentation

- [Blob SDK OIDC and credential resolution](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Resend disposable simulator recipients](https://resend.com/docs/dashboard/emails/send-test-emails)
- [Vercel Cron production GET behavior](https://vercel.com/docs/cron-jobs)
- [Vercel Cron plan limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Calendar free/busy scopes](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query)
- [Google OAuth refresh token expiry](https://developers.google.com/identity/protocols/oauth2#expiration)
