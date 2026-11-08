import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { secure } from './_lib/ebooks/http.js';
import { rawBody } from './ebooks/webhook.js';
import { ready, runtime } from './_lib/booking/runtime.js';
import { recover, linkCheckout } from './_lib/booking/service.js';
export const config = { api: { bodyParser: false } };
export default async function handler(req: VercelRequest, res: VercelResponse) {
    secure(res);
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed.' });
    if (!ready(process.env))
        return res.status(503).json({ error: 'Booking webhook not configured.' });
    let event: Stripe.Event;
    try {
        const signature = req.headers['stripe-signature'];
        if (typeof signature !== 'string')
            throw Error();
        event = new Stripe(process.env.STRIPE_SECRET_KEY!).webhooks.constructEvent(await rawBody(req), signature, process.env.BOOKING_WEBHOOK_SECRET!);
        if (event.livemode)
            throw Error();
    }
    catch {
        return res.status(400).json({ error: 'Invalid webhook.' });
    }
    try {
        // Retrieve authoritative state; webhook event data never authorizes fulfillment.
        const p = await runtime();
        const object = event.data.object as unknown as {
            id: string;
            object: string;
            metadata?: Record<string, string>;
        };
        const allowed = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired', 'charge.refunded', 'charge.dispute.created'];
        if (!allowed.includes(event.type))
            return res.status(200).json({ received: true, ignored: true });
        const records = (await p.store.read()).data.records;
        if (object.object === 'checkout.session') {
            const b = records.find(b => b.checkoutId === object.id);
            if (b)
                await recover(p, b.id);
            // Checkout may have succeeded before its ID was persisted. Return retry, never acknowledge loss.
            else if (object.metadata?.application === 'bhaves-lab' && object.metadata.purchase_kind === 'booking' && object.metadata.booking_id) {
                await linkCheckout(p, object.metadata.booking_id, object.id);
                await recover(p, object.metadata.booking_id);
            }
        }
        else {
            const pi = (event.data.object as unknown as {
                payment_intent?: string;
            }).payment_intent;
            if (typeof pi !== 'string')
                return res.status(200).json({ received: true, ignored: true });
            const sessions = await new Stripe(process.env.STRIPE_SECRET_KEY!).checkout.sessions.list({ payment_intent: pi, limit: 2 });
            if (sessions.has_more)
                throw Error('Ambiguous payment association');
            for (const s of sessions.data) {
                const b = records.find(b => b.checkoutId === s.id);
                if (b)
                    await recover(p, b.id);
            }
        }
        return res.status(200).json({ received: true });
    }
    catch {
        return res.status(503).json({ error: 'Booking recovery pending. Retry required.' });
    }
}
