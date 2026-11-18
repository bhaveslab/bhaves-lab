export const EBOOKS = {
  unlimited: {
    sku: "unlimited-possibilities-en-v1",
    language: "English",
    lang: "en",
    title: "Unlimited Possibilities",
    subtitle: "The Pattern of Choice",
    cents: 1000,
    currency: "usd",
    pages: 17,
    filename: "Unlimited_Possibilities_The_Pattern_of_Choice.pdf",
    sha256: "1abb66ccdfe5b324dffbefe62d48edd34cdbc869356c004f450cb2cfd55be42b",
    bytes: 3643117,
    path: "ebooks/1abb66ccdfe5b324dffbefe62d48edd34cdbc869356c004f450cb2cfd55be42b.pdf",
    priceEnv: "STRIPE_EBOOK_GAME_PRICE_ID",
  },
  // Historical edition keys are retained solely to honor prior paid receipts.
  game: {
    sku: "possibility-game-en-v2",
    language: "English",
    lang: "en",
    title: "The Possibility Game",
    subtitle: "One Shot. One Character. Your Life Is the Playing Field.",
    cents: 1000,
    currency: "usd",
    pages: 14,
    filename: "The_Possibility_Game_One_Shot.pdf",
    sha256: "97cf0aecaf4574abfa96910c2f6e5ce7bcba391f0c6837fa9721b3296c6e3e5e",
    bytes: 2900537,
    path: "ebooks/97cf0aecaf4574abfa96910c2f6e5ce7bcba391f0c6837fa9721b3296c6e3e5e.pdf",
    priceEnv: "STRIPE_EBOOK_GAME_PRICE_ID",
  },
  // Historical receipts retain the original asset and price checks.
  gameLegacy: {
    sku: "possibility-game-en-v1",
    language: "English",
    lang: "en",
    title: "The Possibility Game",
    subtitle: "30 Days to a Possible Reality — and Beyond",
    cents: 999,
    currency: "usd",
    pages: 49,
    filename: "The_Possibility_Game_Observatory_Edition.pdf",
    sha256: "14cce07e292853a1e2046df796124f48e78051f1b878241e9f0acd0749fba83d",
    bytes: 2979876,
    path: "ebooks/14cce07e292853a1e2046df796124f48e78051f1b878241e9f0acd0749fba83d.pdf",
    priceEnv: "STRIPE_EBOOK_GAME_LEGACY_PRICE_ID",
  },
} as const;
export type Edition = keyof typeof EBOOKS;
export function editionForSku(sku: unknown): Edition | null {
  return (Object.keys(EBOOKS) as Edition[]).find((key) => EBOOKS[key].sku === sku) ?? null;
}
export class EbookError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
