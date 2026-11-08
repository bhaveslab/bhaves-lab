# Bhavé’s Lab — observation only

This direction supersedes commercial launch/booking instructions as of November 8, 2026. No PostgreSQL booking development, migration or provider setup is required for the public Observatory.

## Public experience

BHAVÉ’S LAB — Bhavé — The Gentleman of Possibility.

“Life is already in motion.”

“We observe what is, explore what’s possible, and create from what becomes clear.”

The existing black-glass, teal/cyan Observatory, panoramic imagery, Lil Ego artwork, imagined bracelet form, landscape and Worlds / Patterns / Stories views remain. Navigation offers The Observatory and Possibility. Observation prompts replace all session and ebook sales invitations. The footer retains direct email contact: info@bhaveslab.com.

No public shop, pricing, cart, purchase, booking, membership or subscription interface remains. Former client routes, including /shop, /booking and /room-of-clarity, render only the public Observatory. No private tool-belt route, instrument or 30-day game is exposed.

## Retired APIs and preservation

All ten public commercial/private entrypoints return HTTP 410 with no-store and no provider initialization, regardless of environment flags:

- /api/booking and /api/booking-webhook
- /api/possibility-request and /api/create-checkout-session
- /api/clarity-access
- /api/ebooks/catalog, /checkout, /order, /download and /webhook

Existing page components, provider services, database code, assets and infrastructure are retained. Original entrypoint implementations remain in Draft PR #9 and Git history. PR #9 is not merged. No credentials, provider products, database state or private application were changed. The separate Meridian site is retained.

## Verification actually performed

- npm run build: passed.
- node scripts/check-public-build.mjs: passed. Initial JavaScript gzip 50,161 bytes; CSS gzip 8,298 bytes; initial mobile artwork 171,098 bytes. These are transfer budgets, not Lighthouse or device timings. Existing deferred Meridian Three.js chunk warning remains.
- python3 scripts/verify-public-assets.py: passed, including original artwork pixel/hash and public privacy boundary.
- node scripts/check-observation-only.mjs: strict API compilation; 30 GET/POST/OPTIONS retirement checks passed, without consulting request payloads. Static public render has valid internal anchors/images, email contact and no purchasing/form/private links. No retired client chunks or commercial/private API URLs in emitted JavaScript.
- Desktop Chrome: hero appearance, pause/resume, navigation, Patterns/Stories state changes, images and link targets checked. /booking and /shop showed the Observatory with no purchasing interface.
- Responsive Chrome iframe: 390px frame (380px content viewport with scrollbar), menu open/close and Possibility anchor checked. No horizontal overflow. This is not Safari emulation.
- Axe WCAG 2 A/AA and 2.1 A/AA: desktop zero violations/22 passes; mobile-width zero violations/23 passes. Color contrast remains incomplete because of layered backgrounds; screenshots were visually reviewed, but comprehensive contrast certification is not claimed.
- Hosted Preview dpl_EiceCimPkN633fh2LBD2yVMF5krM at application commit 0061c52441ae1c82a25dbc30be922233d33b0ed0: Ready; homepage HTTP 200 with matching built asset hashes; all ten retired API URLs returned HTTP 410 via authenticated Vercel fetch. Hosted POST/OPTIONS were not exercised; those methods were checked locally against the compiled deployed handlers.
- Production inspection: https://www.bhaveslab.com/ still displays the existing “Under construction. On purpose.” page with an email link and no visible purchasing/booking UI. Production was not modified. The Preview retirement behavior is not claimed for production until this change is released.

## Review and remaining limits

Review branch: codex/observation-only. Review PR: #11, based on main; this is the observation-only continuation, not a request to merge old PR #9.

Preview: https://bhaves-6x1r2awaw-bhaves-lab.vercel.app/ (existing Vercel protection retained; owner sign-in may be required).

Actual mobile Safari/iPhone is unavailable in this environment and remains unverified. Color contrast needs final manual checking on layered imagery. Production release is intentionally held for Preview review. No database access or payment credentials are needed to review or launch this observation-only experience.

Historical commercial test suites describe inactive code and are not launch criteria. Use the observation-only checker and public build/asset checks above for this direction.
