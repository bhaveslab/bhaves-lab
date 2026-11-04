export const EBOOKS = {
  en: {
    sku: "possibility-en-v1",
    language: "English",
    lang: "en",
    title: "The Possibility",
    subtitle: "Life Is Already in Motion",
    cents: 999,
    currency: "usd",
    pages: 12,
    filename: "The_Possibility_English_Final.pdf",
    sha256: "8e3d68c4a55fc9a21dea03cf6eec31240df72e61ad305e60e4e266f06a1e5562",
    bytes: 2923110,
    path: "ebooks/8e3d68c4a55fc9a21dea03cf6eec31240df72e61ad305e60e4e266f06a1e5562.pdf",
    priceEnv: "STRIPE_EBOOK_EN_PRICE_ID",
  },
  es: {
    sku: "possibility-es-v1",
    language: "Español",
    lang: "es",
    title: "La posibilidad",
    subtitle: "La vida ya está en movimiento",
    cents: 999,
    currency: "usd",
    pages: 12,
    filename: "La_Posibilidad_Spanish_Final.pdf",
    sha256: "cf4ef640095d833e26ed0b1d7c9e98d207581e7e1617f38a35b23aef0ff3bdd8",
    bytes: 1590929,
    path: "ebooks/cf4ef640095d833e26ed0b1d7c9e98d207581e7e1617f38a35b23aef0ff3bdd8.pdf",
    priceEnv: "STRIPE_EBOOK_ES_PRICE_ID",
  },
} as const;
export type Edition = keyof typeof EBOOKS;
export function editionForSku(sku: unknown): Edition | null {
  return (
    (Object.keys(EBOOKS) as Edition[]).find((key) => EBOOKS[key].sku === sku) ??
    null
  );
}
export class EbookError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
