# The Possibility Game — one-shot field guide (November 9, 2026)

This replaces public book marketing with the 14-page, one-character challenge. “30 days to see what becomes” is an experiment for observing embodiment, not thirty daily lessons.

- Cover: `public/observatory/the-possibility-game-cover.webp`
- Subtitle: **One Shot. One Character. Your Life Is the Playing Field.**
- Price: **$10.00 USD**, one-time digital PDF
- Current purchasable edition: `game` (`possibility-game-en-v2`).
- Private PDF: **2,900,537 bytes**; SHA-256 `97cf0aecaf4574abfa96910c2f6e5ce7bcba391f0c6837fa9721b3296c6e3e5e`; store path `ebooks/97cf0aecaf4574abfa96910c2f6e5ce7bcba391f0c6837fa9721b3296c6e3e5e.pdf`.
- Prior purchases of `possibility-game-en-v1` remain recognized as `gameLegacy`, with their original original asset SHA, 49-page PDF, and $9.99 amount.
- Set `STRIPE_EBOOK_GAME_LEGACY_PRICE_ID` to the prior price (live: `price_1UZWaf2c1Eq7UIp4GTKhDvC1`; test: `price_1UZWNY2c1Eq7UIp4gxvIXCqE`) to preserve prior purchasers' downloads.
- Set `STRIPE_EBOOK_GAME_PRICE_ID` to a $10.00 one-time Price on the existing Stripe product (live: `price_1UZtt72c1Eq7UIp4Xs5NOaS8`; test: `price_1UZu4e2c1Eq7UIp4pvOjy80f`).
- Ingest and privately read back the NEW exact PDF with `scripts/ingest-ebooks.mjs` before enabling a real checkout. The existing catalog asset-integrity gate protects buyers from receiving the old PDF while purchasing the new edition.
- **No donation feature is part of this ebook update.**

Never commit the paid PDF to `public/` or any GitHub branch.
