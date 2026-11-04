# Public Lab — observatory refinement review

## Current scope

Continue `codex/cinematic-public-lab`, PR #5, from deployed commit `d5dcba58f1510b3cf5e8ca9ff6b0494d98dc0a66`. Preserve the approved environment, Vite/React implementation, shared Meridian hostname routing, existing APIs and legacy order confirmation. No production deployment, merge, dependency upgrade, new paid provider or private-application change.

The repository default branch remains older than `main`; the feature branch already contains the audited main baseline. Latest branch and PR were inspected before this refinement.

## Completed

- Preserved Bhavé, his coat, panoramic moonlit landscape, reflective glass and dark teal observatory. One continuous entrance, session and shop experience.
- Replaced Lil Ego's opaque white card with a transparent observation plane: subtle boundary, grid, waveform, light sweep and scene perspective. Original character proportions and all visible source RGB are retained.
- Added an unbranded graphite cuff with cyan inlay on another transparent screen at a different depth. This is artwork for an exploratory wearable concept, not a product, private device, development announcement or sale listing.
- Published the approved one-session offer: The Possibility Session, Enter the Room of Clarity, 60 minutes, $175, Book Your Session. Session stands alone with no required additional purchase.
- Kept the native request form and public email fallback. The response contract explicitly distinguishes `requestReceived: true` from `bookingConfirmed: false`; an HTTP 200 containing HTML or unrelated JSON cannot produce a success receipt.
- Built the intimate Room of Clarity chamber and curated optional-instrument introduction as a server-only presentation under `api/_lib`. No add-on prices or purchase flow.
- Added `/room-of-clarity` with a server access-check boundary. It fails closed while verification is not implemented. Query strings claiming payment or confirmation do not grant access. There is no client-side unlock, demo unlock or request-receipt link into the room. The public introduction links to a distinct `/booking` stage; no booking form appears on the public entrance. The server checks authenticated identity, record ownership, confirmed booking, paid status and a confirmed reservation before rendering any Room markup.
- Shop stays visible with no unverified purchases. No external scheduling service is used.

## Exact character evidence

Original file: `public/observatory/lil-ego-reference.jpeg`, copied unchanged from the supplied `766C1317-92A7-4057-B146-C4CBD7EFFFBB.jpeg`.

SHA256: `0f6ed23728dfd5a244036585decb9b2ce1548ac793c9706bfc9106612f65a38b`.

`docs/lil-ego-provenance.json` records extraction and unchanged RGB evidence. `scripts/extract-lil-ego.py` creates an alpha-only cutout from the original pixels, without a generative redraw. It uses Pillow, NumPy and SciPy. `scripts/verify-public-assets.py` verifies the reference hash, zero visible RGB differences in the lossless master, transparent exterior, responsive variants and privacy boundaries. Responsive variants scale the original artwork for display; they do not redraw it.

The hero background remains derived from `Bhavé’s Lab: Life in Motion(3).png` (above the mockup text/grid). No hero regeneration occurred.

The bracelet alone was generated as a new, unbranded concept using the built-in image tool. Prompt: “Single elegant lightweight everyday graphite black slim open cuff, polished dark metal, restrained thin cyan inlay, subtle circular abstract symbol, three-quarter view, jewelry-like proportions, transparent background; no text, logos, watch display, sensors, specifications, medical imagery or shadow plane.” The generated source was converted to lossless WebP and responsive variants at `public/observatory/bracelet-concept*.webp`.

## Actual integration status

On November 4, 2026, the Vercel environment metadata query for this project and feature branch returned no environment variables. No secret values were requested or printed. The existing Resend account has verified sending for `auth.bhaveslab.com`, but this does not configure website delivery automatically. No credential or domain was changed, and no real email was sent.

| Capability | Verified current state | Remaining work |
| --- | --- | --- |
| Request form | Client/server validation and explicit unconfirmed receipt implemented; local failure and mocked provider outcomes tested | Configure `RESEND_API_KEY`, an approved verified `LAB_BOOKING_FROM` and authorized `LAB_BOOKING_TO`; test delivery |
| Session price | Public approved $175 / 60 minutes | No payment is collected by the current form |
| Payments | Existing Stripe SDK and generic shop Checkout API retained; all product price mappings remain null | Session-specific verified price, credentials, Checkout integration, signed webhook and idempotent fulfillment |
| Availability | No configured calendar, availability endpoint or reservation persistence in this repository/preview | Choose calendar of record and actual working hours/time zone; buffers, collision-safe holds/reservations and cancellation rules |
| Confirmation email | Not implemented for confirmed appointments | Trigger only after both payment and calendar reservation are verified |
| Room access | API deliberately returns unavailable; forged flags remain locked | Implement a booking-scoped server verifier/access credential after the booking infrastructure is selected and approved |
| Room presentation | Implemented server-side; no Room content or optional-instrument text is included in public JavaScript | Live post-confirmation reveal is not enabled or claimed |
| Shop | Entrance with no active products or purchase actions | Verified assets, inventory, price, payments and fulfillment per product |

A major calendar/reservation architecture has not been invented. A new paid provider has not been introduced. Availability, price or payment success is never fabricated. Public email is available while delivery is unconfigured. Basic honeypot and origin filtering are present; production request delivery also needs durable abuse controls.

## Validation and limits

- `npm run build`: TypeScript + Vite passes.
- Explicit strict TypeScript check for both API modules passes.
- `node --test tests/*.test.cjs`: 16 tests pass, including validation, provider rejection/exception, explicit unconfirmed request receipts, unauthenticated and other-guest denial, unpaid/refunded/cancelled reservation denial, positive server-fixture authorization, and separation of introduction/booking stages.
- `python3 scripts/verify-public-assets.py`: source hash, visible-pixel fidelity, transparent edges, responsive assets and public privacy checks pass.
- `node scripts/check-public-build.mjs`: initial JavaScript gzip budget under 65 KB, CSS under 10 KB and phone hero artwork under 200 KB. Actual results in `docs/performance-check.json`.
- Desktop, 390px phone iframe and 768px tablet iframe inspected. No horizontal document overflow at phone/tablet widths. Responsive artwork sources loaded. Menu, Escape dismissal, pause/resume, session anchors, form failure handling and forged-confirmation locked state checked in browser.
- Axe automated WCAG 2 A/AA and 2.1 A/AA audit: desktop zero violations / 25 passed checks; cinematic-image contrast requires manual review. Mobile audit also reports zero violations after correcting the menu’s accessible name; full result in `docs/mobile-accessibility-check.json`.
- Reduced-motion CSS disables animations and pseudo-element reflections, and the manual atmosphere control also pauses the observation screens. A physical iPhone/Safari session and OS-level reduced-motion behavior remain device tests. No Lighthouse or real-world Core Web Vitals score is claimed.
- Retained Three.js emits the existing large-chunk warning but remains deferred with Meridian; no WebGL is used by this Lab entrance.

## Screenshots

- `docs/review/desktop-refined.jpg`
- `docs/review/mobile-refined.jpg`
- `docs/review/observation-screens.jpg` (bracelet + exact Lil Ego in environmental context)
- `docs/review/session-refined.jpg`
- `docs/review/room-locked.jpg` (actual visitor state)
- `docs/review/room-design-only.jpg` (explicitly labeled design review, not a confirmed booking)

Historical design-only screenshots remain review artifacts. The old client Room module was removed; an automated build assertion rejects instrument content or a Room chunk in any public JavaScript. Local `.qa` fixtures and the audit dependency are excluded from Git and the Vercel build. They provide visual review without adding a public room-unlock shortcut. The Room screenshot is a design artifact, not proof of a successful payment or appointment.

Keep production unchanged pending visual approval.

## Latest stage separation

1. Public observatory and introduction (`/#session`): offer, price, duration and invitation only.
2. Individual booking (`/booking`): request details, consent, availability preference and explicit unconfirmed receipt. No Room content. Email is a request channel, not booking proof.
3. Confirmed session (`/room-of-clarity`): generic access-check shell. Room markup is rendered only by `/api/clarity-access` after server verification of the authenticated visitor and their authoritative booking record. Protected text no longer ships in a lazy client chunk.

The actual identity/booking resolver remains unavailable while integrations are absent. Its default is closed. Tests use synthetic server-owned identities and records to verify authorization branches; those fixtures are not deployed and no live booking is claimed. The booking stage is an individual request process, not a claim that authentication has been provisioned.
