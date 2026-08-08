// Manual-entry map: cart item key -> Stripe Price ID.
//
// Cart item keys come from src/pages/Shop/products.ts + the selected size
// (tees only), built as `${product.id}` or `${product.id}-${size}`.
//
// Fill in each value after creating the matching Product + Price in the
// Stripe Dashboard (Products -> New). Tees need one Price per size;
// hat and books need a single Price each. Leave an entry as `null` until
// its Price exists — the checkout API will reject any cart line that maps
// to `null` with a clear error instead of forwarding a bad ID to Stripe.
export const PRICE_TO_PRODUCT: Record<string, string | null> = {
  // I Am A Natural Resource — Gold Edition ($27.99)
  'tee-inr-gold-S': null,
  'tee-inr-gold-M': null,
  'tee-inr-gold-L': null,
  'tee-inr-gold-XL': null,
  'tee-inr-gold-2XL': null,

  // I Am A Natural Resource — Diamond ($27.99)
  'tee-inr-diamond-S': null,
  'tee-inr-diamond-M': null,
  'tee-inr-diamond-L': null,
  'tee-inr-diamond-XL': null,
  'tee-inr-diamond-2XL': null,

  // I Beat Up Bullies ($27.99)
  'tee-bullies-S': null,
  'tee-bullies-M': null,
  'tee-bullies-L': null,
  'tee-bullies-XL': null,
  'tee-bullies-2XL': null,

  // Confidence/Dominance ($27.99)
  'tee-confidence-S': null,
  'tee-confidence-M': null,
  'tee-confidence-L': null,
  'tee-confidence-XL': null,
  'tee-confidence-2XL': null,

  // 100% Created By God — tee ($27.99)
  'tee-created-by-god-S': null,
  'tee-created-by-god-M': null,
  'tee-created-by-god-L': null,
  'tee-created-by-god-XL': null,
  'tee-created-by-god-2XL': null,

  // 100% Created By God — hat ($19.99), no size
  'hat-created-by-god': null,

  // Books, no size
  'gospel-book': null, // The Gospel: Lost Chapters ($24.99)
  'gospel-workbook': null, // Gospel Study Companion Workbook ($15.99)
  'break-the-illusion': null, // Break the Illusion ($22.99)
};
