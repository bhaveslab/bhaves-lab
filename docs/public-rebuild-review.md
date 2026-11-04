# Public observatory rebuild — review record

## Audited baseline

- Production domain resolves to Vercel project `bhaves-lab`, Vite, Node 24.x, team `team_lV8zTJpLq4jz9YyEia88aHGr`.
- Production source: `main`, commit `35ab3072ab501f2657460a31ef5f0c59919d1e2a`. The GitHub default branch differs (`claude/home-page-initial-push-qye9yi`). This feature branch deliberately starts from the deployed source.
- Inspected all eight remote branches. Newer branches include unrelated Meridian prototypes and an obsolete public app entrance; none were incorporated.
- Existing dependencies: React 18, Vite 5, TypeScript 5, Three.js, Stripe, Resend, Vercel functions. No dependency or lockfile changes.
- Existing hostname handling also serves Meridian. Its pages, API, assets, routing configuration, and entry point are preserved. The Lab entry now loads Meridian and confirmation code only when required.
- Existing Lab entry was an under-construction page. Existing shop has book/apparel images and display prices, but all Stripe price mappings are null. Fulfillment could not be verified. No catalog items are offered by the new public page.
- Existing historical home/footer contains a Calendly 30-minute link. Its suitability for The Possibility Session is unverified. Session inquiries use the existing `info@bhaveslab.com` contact address; no new scheduling/payment integration or price was created.

## Implemented

- Continuous observatory entrance, perspective, single session, and shop entrance. No service card grid.
- Existing observatory artwork cropped to the scene only and compressed to WebP. Lower mockup content is excluded from the published image.
- Approved Lil Ego JPEG copied unchanged, rendered as a separate screen with independent branding. SHA-256: `0f6ed23728dfd5a244036585decb9b2ce1548ac793c9706bfc9106612f65a38b`.
- CSS mist, breathing light and decorative wave; pause control and reduced-motion override. No animation loops or WebGL on the Lab page.
- Mobile navigation, Escape dismissal with focus return, skip link, descriptive imagery, semantic headings, visible focus styles.
- `/shop` and `/shop/` enter the continuous page at its shop section. Existing checkout API and confirmation route remain in source. No purchase controls are shown until products are verified.
- Preview development host allowed explicitly; no deployment or security settings changed.

## Validation

- Baseline and changed production builds pass (`tsc -b && vite build`). `git diff --check` passes.
- Desktop browser inspection at 1363px, responsive iframe inspection at 390×844, 768×1024, and 320×667. No horizontal overflow at any inspected width. These are responsive browser checks, not physical device tests.
- Mobile menu open/close, Escape focus return, session/shop anchors, loaded images, motion pause state verified in browser. Session request is a mailto entry; no email was sent.
- Approved character byte equality confirmed with SHA-256.
- Main JS reduced from ~212 KB / 64 KB gzip to ~154 KB / 50 KB gzip. Observatory image ~100 KB; approved character ~280 KB unchanged. Existing Meridian Three.js chunk remains large but is lazy-loaded outside the Lab entrance. No Lighthouse score or field performance claim.
- Reduced-motion is enforced by a CSS media query; OS preference emulation was unavailable in this browser. Screen-reader and physical-device testing remain recommended before release.

## Before production

Visual approval is required. Do not merge or promote this branch before approval. Confirm the session scheduling destination if direct calendar booking is desired. Verify product assets, current prices, payment mapping, and fulfillment before enabling sales. No production deployment is authorized by this review record.
