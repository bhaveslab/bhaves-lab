import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { PRICE_TO_PRODUCT } from './_lib/priceToProduct';

const MAX_LINE_QTY = 20;
const MAX_LINES = 50;

interface CartLine {
  key: string;
  qty: number;
}

function badRequest(res: VercelResponse, message: string) {
  res.status(400).json({ error: message });
}

function shippingMetadata(shipping: unknown): Record<string, string> | undefined {
  if (!shipping || typeof shipping !== 'object') return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(shipping as Record<string, unknown>).slice(0, 10)) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Checkout is not configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const items: unknown = body?.items;
  const email: unknown = body?.email;

  if (!Array.isArray(items) || items.length === 0) {
    return badRequest(res, 'Cart is empty');
  }
  if (items.length > MAX_LINES) {
    return badRequest(res, 'Too many distinct items in cart');
  }

  const lines: CartLine[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') return badRequest(res, 'Malformed cart item');
    const key = (raw as Record<string, unknown>).key;
    const qty = (raw as Record<string, unknown>).qty;
    if (typeof key !== 'string' || !key) return badRequest(res, 'Malformed cart item key');
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > MAX_LINE_QTY) {
      return badRequest(res, `Invalid quantity for "${key}"`);
    }
    lines.push({ key, qty });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const line of lines) {
    const priceId = PRICE_TO_PRODUCT[line.key];
    if (priceId === undefined) {
      return badRequest(res, `Unknown product "${line.key}"`);
    }
    if (priceId === null) {
      return badRequest(res, `Product "${line.key}" is not yet available for purchase`);
    }
    line_items.push({ price: priceId, quantity: line.qty });
  }

  const origin = `https://${req.headers.host}`;

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${origin}/shop/confirmation?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/confirmation?status=cancelled`,
      customer_email: typeof email === 'string' && email ? email : undefined,
      metadata: shippingMetadata(body?.shipping),
    });

    if (!session.url) {
      console.error('Stripe session created without a url', session.id);
      return res.status(502).json({ error: 'Could not start checkout' });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Failed to create Stripe checkout session', err);
    return res.status(502).json({ error: 'Could not start checkout' });
  }
}
