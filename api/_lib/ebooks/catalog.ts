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
    filename: "The_Possibility_English_Covered.pdf",
    sha256: "3d2cb2decac7617a4a7fbdbfc52ca9368e7981674c5ceba0de44a616223daeb1",
    bytes: 2922708,
    path: "ebooks/3d2cb2decac7617a4a7fbdbfc52ca9368e7981674c5ceba0de44a616223daeb1.pdf",
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
    filename: "La_Posibilidad_ES_FINAL_REVIEW.pdf",
    sha256: "587d2ec64616b566a2febef6da26f7b8f7743bf6560bf4a537d45388417b3c31",
    bytes: 1604365,
    path: "ebooks/587d2ec64616b566a2febef6da26f7b8f7743bf6560bf4a537d45388417b3c31.pdf",
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
