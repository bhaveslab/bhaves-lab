> Historical commercial work, superseded November 8, 2026. The public Lab is observation-only. Do not continue booking development, run migrations, or activate these flows. See [current direction and verification](observation-only.md).

# Verification — November 8, 2026

Status: blocked; not operational for paid booking or ebook purchases. No production migration, merge, payment activation, calendar write, real charge or email was performed.

## Verified current state

- Draft PR #9 remains on `codex/issue-8-ebooks`, inspected at `5ee1a7b68e858228c32395b019d2e838aedc0385`. Its Ready Preview is `dpl_8oRsxSzF3kxyv1rzSraj11oHTVgE`.
- Authenticated Preview GET /api/booking returned HTTP 200, `{"ready":false}`.
- Authenticated Preview GET /api/ebooks/catalog returned HTTP 200, checkoutAvailable false, EN/ES prices 999 USD cents each.
- Vercel storage metadata now confirms `store_zajy3cxmicwaKWgY`, named neon-cobalt-crystal, maps to externalResourceId `wild-rain-02483727` and project `prj_91b5CTzCcQwAkRCjLgVd5VreuZ7x`, Preview only. This resolves the resource ownership mapping, not test-branch isolation.
- Neon describe_project and list_branches for that project both returned HTTP 404 “project not found.” No branch endpoint can be verified.
- Preview database variables remain sensitive and shared across Preview; the single-variable PGHOST read returned no value. BOOKING_DATABASE_URL and BOOKING_TEST_DATABASE_HOST are absent.
- Preview environment metadata lacks Stripe runtime key, booking/ebook price and webhook variables, Google OAuth/test calendar/availability, booking link/recovery secrets, ebook download secret, and ebook Blob token. Resend key and sender metadata exist; delivery was not tested.
- Existing private ebook store remains attached; attachment metadata supplies BLOB_STORE_ID and BLOB_WEBHOOK_PUBLIC_KEY, not the required ebook runtime token.
- Connected Bhave Stripe test account lists four prices, none at 17500 USD cents. Two are 999 USD cents, but their ebook identity was not verified; no prices were changed or created.
- Desktop Chrome public-domain inspection redirected to https://www.bhaveslab.com/ and displayed “Under construction. On purpose.” The Observatory implementation is retained in this draft, not currently shown on the public domain.

## Checks executed against the inspected code

| Check | Result |
| --- | --- |
| npm ci | Completed |
| npm run build | Passed; existing large Three.js chunk warning |
| check-public-build | Passed; protected Room content server-only |
| verify-public-assets | Passed; original character pixels/privacy boundary |
| Booking suite with saved PDFs | 30 passed, 5 failed, 1 database case skipped |
| Ebook suite with saved PDFs | 10 passed, 5 failed |
| Room, request, presentation, offline Blob diagnostics | 32 passed |
| Ebook HTTP runtime checks | 5 passed |
| Spanish verifiedAsset exact byte/hash check | Passed |

The booking and ebook failures occur at the English asset-integrity gate before the simulated successful provider paths. The skipped database case requires a disposable loopback PostgreSQL database. These results do not reproduce the earlier 36-pass database-backed run and are not Neon verification. Provider-oriented passing checks use simulations.

## Exact asset discrepancy

Both saved files were resolved by exact filename and downloaded for verification.

| Edition | Expected bytes | Saved bytes | Expected SHA-256 | Saved SHA-256 |
| --- | --- | --- | --- | --- |
| English | 2923110 | 2948058 | 8e3d68c4a55fc9a21dea03cf6eec31240df72e61ad305e60e4e266f06a1e5562 | 8721246060d08fc98d24039adda495d1998ab2a883f96da29f74ffd629a735d6 |
| Spanish | 1590929 | 1590929 | cf4ef640095d833e26ed0b1d7c9e98d207581e7e1617f38a35b23aef0ff3bdd8 | cf4ef640095d833e26ed0b1d7c9e98d207581e7e1617f38a35b23aef0ff3bdd8 |

Both PDFs have 12 pages. The English pin was not changed to force tests to pass. Locate the exact pinned English artifact or review and approve its replacement before changing the manifest.

## Remaining work

1. Obtain read access to existing test-branch metadata/endpoint without creating infrastructure. Connected Neon currently cannot supply it. Browser inspection is the remaining alternative and has not been attempted.
2. Verify isolated endpoint, scope its protected URL and host pin to this PR branch, then migrate/test only that branch.
3. Resolve English asset discrepancy and configure verified private assets.
4. Configure test runtime Stripe, webhook, isolated Calendar/OAuth, availability and access/recovery secrets. Verify recovery execution.
5. Run actual payment, webhook/retry, Calendar/Meet, Resend, included and standalone downloads, refund/revocation and protected Room flows.
6. Perform desktop interaction tests of the configured Preview and actual iPhone/mobile Safari testing. No mobile Safari environment is exposed in this session.
7. Production remains intentionally rejected by booking runtime. A reviewed launch change and production approval are still required after test verification; this report does not authorize either.
