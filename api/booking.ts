import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { secure, sameOrigin, bearer } from './_lib/ebooks/http.js';
import { jsonBody, safeOrigin } from './_lib/ebooks/security.js';
import { BookingError, readBooking, overlaps, protects, transaction } from './_lib/booking/ledger.js';
import { runtime, ready, policy, permitted } from './_lib/booking/runtime.js';
import { reserve, startCheckout, recover, authorized, bookingId } from './_lib/booking/service.js';
import { EBOOKS, EbookError } from './_lib/ebooks/catalog.js';
const cookieName = '__Host-bhave_booking';
const digest = (s: string) => createHash('sha256').update(s).digest('hex');
export default async function handler(req: VercelRequest, res: VercelResponse) {
    secure(res);
    try {
        if (req.method !== 'POST' && req.method !== 'GET')
            return res.status(405).json({ error: 'Method not allowed.' });
        if (req.method === 'GET')
            return res.status(200).json({ ready: ready(process.env) });
        sameOrigin(req, process.env);
        const body = jsonBody(req.body), action = body.action;
        if (action === 'recover') {
            const raw = bearer(req), key = process.env.BOOKING_RECOVERY_SECRET;
            if (!key || raw.length !== key.length || !timingSafeEqual(Buffer.from(raw), Buffer.from(key)))
                throw new BookingError(403, 'Recovery authorization required.');
        }
        const p = await runtime();
        if (action === 'recover') {
            const records = (await p.store.read()).data.records.filter(b => b.state !== 'released' && b.state !== 'revoked' && !(b.state === 'confirmed' && b.mail?.sent && p.now() > Math.max(b.confirmedAt! + 7 * 86400000, b.end + 86400000))).sort((a, b) => (a.lastRecovered || 0) - (b.lastRecovered || 0));
            const outcomes = [];
            for (const b of records.slice(0, 3)) {
                try {
                    await transaction(p.store, d => { d.records.find(x => x.id === b.id)!.lastRecovered = p.now(); });
                    await recover(p, b.id);
                    outcomes.push({id:b.id,outcome:'processed'});
                }
                catch {
                    outcomes.push({id:b.id,outcome:'retry_or_review'});
                }
            }
            await transaction(p.store, d => { d.recoveryAt = p.now(); });
            return res.status(200).json({ outcomes, remaining: Math.max(0, records.length - 3) });
        }
        if (action === 'download') {
            const b = await authorized(p, bearer(req), 'ebook');
            const data = await p.asset(b.edition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${EBOOKS[b.edition].filename}"`);
            return res.status(200).send(data);
        }
        let seed = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
        if (!seed || !/^[a-f0-9]{64}$/.test(seed)) {
            seed = randomBytes(32).toString('hex');
            res.setHeader('Set-Cookie', `${cookieName}=${seed}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);
        }
        const owner = digest(seed);
        if (action === 'availability') {
            const pol = policy(process.env), date = body.date;
            if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
                throw new BookingError(400, 'Choose a date.');
            const day = Date.parse(date + 'T00:00:00Z');
            if (!Number.isFinite(day))
                throw new BookingError(400, 'Invalid date.');
            const now = p.now(), records = (await p.store.read()).data.records, slots: number[] = [];
            // Bounded UTC scan covers every timezone; local date filtering handles DST.
            const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: pol.timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
            for (let n = day - 86400000; n < day + 2 * 86400000; n += 1800000) {
                const parts = Object.fromEntries(fmt.formatToParts(n).map(x => [x.type, x.value]));
                if (`${parts.year}-${parts.month}-${parts.day}` !== date || !permitted(n, pol, now) || records.some(b => protects(b) && overlaps(b, { start: n, end: n + 3600000 }, p.buffer)))
                    continue;
                if (await p.available(n, n + 3600000))
                    slots.push(n);
            }
            return res.status(200).json({ slots, timezone: pol.timezone });
        }
        if (action === 'status') {
            if (typeof body.attempt !== 'string' || !/^[a-f0-9]{32}$/.test(body.attempt))
                throw new BookingError(400, 'Booking attempt required.');
            const id = bookingId(owner, body.attempt);
            let b = await readBooking(p.store, id);
            try {
                b = await recover(p, id);
            }
            catch { /* Preserve pending status, never assert success on provider errors. */ }
            if (b.state === 'confirmed') {
                const { token } = await import('./_lib/booking/service.js');
                try {
                    await authorized(p, token(b, 'room', p.secret), 'room');
                    return res.status(200).json({ state: 'confirmed', start: b.start, ebookEdition: b.edition, roomToken: token(b, 'room', p.secret), ebookToken: token(b, 'ebook', p.secret) });
                }
                catch {
                    return res.status(200).json({ state: 'verification_pending' });
                }
            }
            return res.status(200).json({ state: b.state === 'released' ? 'expired' : 'pending' });
        }
        if (action !== 'checkout')
            throw new BookingError(400, 'Unknown booking action.');
        const { attempt, start, edition, email } = body;
        if (typeof attempt !== 'string' || !/^[a-f0-9]{32}$/.test(attempt) || typeof start !== 'number' || !permitted(start, policy(process.env), p.now()) || !['en', 'es'].includes(String(edition)) || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            throw new BookingError(400, 'Check your appointment and contact details.');
        const b = await reserve(p, { id: bookingId(owner, attempt), owner, start, edition: edition as 'en' | 'es', email: email.trim().toLowerCase(), price: process.env.BOOKING_STRIPE_PRICE_ID!, origin: safeOrigin(process.env) });
        const checkout = await startCheckout(p, b.id);
        return res.status(200).json({ url: checkout.checkoutUrl });
    }
    catch (e) {
        return res.status((e instanceof BookingError || e instanceof EbookError) ? e.status : 503).json({ error: (e instanceof BookingError || e instanceof EbookError) ? e.message : 'Booking could not be verified. Retry the same attempt or contact info@bhaveslab.com.' });
    }
}
