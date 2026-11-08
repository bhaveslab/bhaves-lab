export const EBOOKS = {
  game: {
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
    priceEnv: "STRIPE_EBOOK_GAME_PRICE_ID",
  },
} as const;
export type Edition = keyof typeof EBOOKS;
export function editionForSku(sku: unknown): Edition | null {
  return (Object.keys(EBOOKS) as Edition[]).find((key) => EBOOKS[key].sku === sku) ?? null;
}
export class EbookError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
