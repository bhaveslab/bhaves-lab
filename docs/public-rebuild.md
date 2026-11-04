# Public observatory rebuild — review only

## Verified baseline

- Based on `main` at `35ab307`. Repository default branch is the older `claude/home-page-initial-push-qye9yi`; other remote branches were inspected before choosing the current production lineage.
- Vite 5, React 18, TypeScript 5; existing Three.js, Stripe and Resend retained. No dependency or lockfile changes.
- Vercel project `bhaves-lab` / `prj_91b5CTzCcQwAkRCjLgVd5VreuZ7x`, team `team_lV8zTJpLq4jz9YyEia88aHGr`, Node 24. Shared Meridian hostname routing and its API are retained.
- Existing clean-URL SPA rewrite retained. Existing checkout/confirmation code retained. Public `/shop` now reaches the shop entrance because every Stripe product mapping is null and fulfillment is unverified.
- Existing Calendly reference was inspected and deliberately not carried forward, per the latest direction to build native booking.

## Experience

One continuous observatory entrance, original supplied Lil Ego on a screen, session exploration and native booking request, and an unpublished shop collection. No technology launches, product prices, preorders, private app links, or collaborator content are introduced.

Hero environment derives from `Bhavé’s Lab: Life in Motion(3).png` (cropped above the mockup text and product grid), Library ID `libfile_18855bb0a8888191a2340cfd31203285`. WebP variants are 853×621 and 640×466. No image regeneration was used.

`public/observatory/lil-ego-reference.jpeg` is a byte-for-byte copy of `766C1317-92A7-4057-B146-C4CBD7EFFFBB.jpeg`, Library ID `libfile_3f121e477fbc81919cc21662e7dda509`. SHA256: `0f6ed23728dfd5a244036585decb9b2ce1548ac793c9706bfc9106612f65a38b`. The whole character is displayed with its original background and proportions.

CSS uses short opacity/transform atmospheric animations, a pause control, reduced-motion rules, system fonts, visible focus, labeled fields, consent, and a status message. No WebGL is loaded for the Lab entrance. Meridian and order confirmation are lazy-loaded.

## Native booking boundary

The request form accepts name, email, a short exploration, and availability/time zone. It does not promise an available slot, charge a price, or confirm an appointment. The API validates fields, origin and consent, avoids logging submitted details, and returns success only after the email provider accepts delivery.

Configure in the intended preview environment before testing real delivery:

- `RESEND_API_KEY` (existing provider dependency; no new vendor)
- `LAB_BOOKING_FROM` (verified sender)
- `LAB_BOOKING_TO` (authorized receiving inbox)

No credentials were read, changed, or committed. Missing configuration returns 503 and the interface offers the existing public contact email. Provider success is tested with a mock only; no real message was sent.

Before automatic confirmed time-slot booking: establish session duration, availability/time zone, buffers, calendar of record, cancellation policy, durable reservation storage and collision prevention. These are intentionally unresolved; no scheduling rules or architecture were invented. Add durable rate limiting/bot protection before enabling public delivery at production traffic levels; the current honeypot/origin validation is a basic request filter, not a complete abuse control.

## Validation

- `npm run build` (TypeScript and Vite).
- `node --test tests/possibility-request.test.cjs`: validation, malformed JSON, methods, origins, consent, honeypot, missing configuration and provider acceptance with mocked email.
- Desktop and 390px iframe viewport visual inspection; screenshots in `docs/review`.
- Reduced-motion implementation reviewed in CSS; no physical mobile device or Lighthouse lab score claimed.
- Build's large Three.js warning belongs to retained, deferred Meridian/legacy components, not the Lab initial download.

Do not merge or promote this branch until visual approval. The private application repository was not accessed or modified.
