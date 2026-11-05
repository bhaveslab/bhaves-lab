import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import { BookingError, transaction, readBooking, overlaps, protects, type Store, type Booking } from './ledger.js';
export type Payment = {
    state: 'open' | 'pending' | 'paid' | 'expired' | 'revoked';
    email?: string;
};
export type Event = {
    state: 'confirmed' | 'cancelled' | 'pending';
    meet?: string;
};
export type Ports = {
    store: Store;
    now: () => number;
    buffer: number;
    secret: string;
    available: (start: number, end: number, excludeEvent?: string) => Promise<boolean>;
    checkout: (b: Booking) => Promise<{
        id: string;
        url: string;
    }>;
    payment: (b: Booking) => Promise<Payment>;
    calendarGet: (b: Booking) => Promise<Event | null>;
    calendarCreate: (b: Booking) => Promise<void>;
    asset: (edition: 'en' | 'es') => Promise<Buffer>;
    send: (payload: {
        to: string;
        subject: string;
        text: string;
    }, key: string) => Promise<void>;
};
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export function bookingId(owner: string, attempt: string) { return hash(owner + ':' + attempt); }
export const tokenExpiry = (b: Booking, kind: 'room' | 'ebook') => kind === 'room' ? Math.max(b.confirmedAt! + 7 * 86400000, b.end + 86400000) : b.confirmedAt! + 7 * 86400000;
export function token(b: Booking, kind: 'room' | 'ebook', secret: string) {
    if (!b.confirmedAt)
        throw new BookingError(403, 'Booking not confirmed.');
    const payload = Buffer.from(JSON.stringify({ v: 1, id: b.id, kind, edition: b.edition, exp: tokenExpiry(b, kind) })).toString('base64url');
    return payload + '.' + createHmac('sha256', secret).update(payload).digest('base64url');
}
export function claim(raw: string, kind: 'room' | 'ebook', secret: string, now: number) {
    if (!secret || secret.length < 43 || !raw || raw.length > 1024)
        throw new BookingError(403, 'Invalid access link.');
    const [body, sig, ...extra] = raw.split('.');
    if (extra.length || !body || !sig || !/^[\w-]+$/.test(body) || !/^[\w-]+$/.test(sig))
        throw new BookingError(403, 'Invalid access link.');
    const a = Buffer.from(sig, 'base64url'), e = createHmac('sha256', secret).update(body).digest();
    if (a.length !== e.length || !timingSafeEqual(a, e))
        throw new BookingError(403, 'Invalid access link.');
    let c;
    try {
        c = JSON.parse(Buffer.from(body, 'base64url').toString());
    }
    catch {
        throw new BookingError(403, 'Invalid access link.');
    }
    if (c.v !== 1 || c.kind !== kind || !/^[a-f0-9]{64}$/.test(c.id) || !['en', 'es'].includes(c.edition) || !Number.isSafeInteger(c.exp) || c.exp <= now || c.exp > now + (kind === 'room' ? 92 : 7) * 86400000)
        throw new BookingError(403, 'Expired or invalid access link.');
    return c as {
        id: string;
        edition: 'en' | 'es';
        exp: number;
    };
}
export async function reserve(p: Ports, input: Pick<Booking, 'id' | 'owner' | 'start' | 'edition' | 'email' | 'price' | 'origin'>) {
    const end = input.start + 3600000;
    const old = (await p.store.read()).data.records.find(b => b.id === input.id);
    if (old) {
        if (old.owner !== input.owner || old.start !== input.start || old.edition !== input.edition || old.email !== input.email || old.price !== input.price || old.origin !== input.origin)
            throw new BookingError(409, 'A booking attempt cannot be changed.');
        return old;
    }
    await p.asset(input.edition);
    if (!await p.available(input.start, end))
        throw new BookingError(409, 'This appointment is no longer available.');
    const created = p.now();
    return transaction(p.store, data => {
        const same = data.records.find(b => b.id === input.id);
        if (same) {
            if (same.owner !== input.owner || same.start !== input.start || same.edition !== input.edition || same.email !== input.email || same.price !== input.price || same.origin !== input.origin)
                throw new BookingError(409, 'A booking attempt cannot be changed.');
            return same;
        }
        if (!data.recoveryAt || p.now() - data.recoveryAt > 15 * 60000)
            throw new BookingError(503, 'Reservation recovery is offline. No new slot was reserved.');
        if (data.records.some(b => protects(b) && overlaps(b, { start: input.start, end }, p.buffer)))
            throw new BookingError(409, 'This appointment is being reserved.');
        const b: Booking = { ...input, end, created, expires: created + 3600000, state: 'held', eventId: 'b' + input.id };
        data.records.push(b);
        return b;
    });
}
export async function startCheckout(p: Ports, id: string) {
    let b = await readBooking(p.store, id);
    if (b.checkoutId)
        return b;
    if (b.state !== 'held' && b.state !== 'checkout')
        throw new BookingError(409, 'This booking requires review.');
    // Never replay creation beyond Stripe's idempotency window. Unknown creation stays protected.
    if (p.now() - b.created > 20 * 3600000 || p.now() > b.expires - 31 * 60000)
        throw new BookingError(409, 'Checkout recovery needs operator review.');
    const recoveryAt = (await p.store.read()).data.recoveryAt;
    if (!b.checkoutStarted && (!recoveryAt || p.now() - recoveryAt > 15 * 60000))
        throw new BookingError(503, 'Reservation recovery is offline.');
    await p.asset(b.edition);
    b = await transaction(p.store, d => {
        const x = d.records.find(x => x.id === id)!;
        if (x.state !== 'held' && x.state !== 'checkout')
            throw new BookingError(409, 'Booking changed.');
        x.checkoutStarted ??= p.now();
        x.state = 'checkout';
        return x;
    });
    const session = await p.checkout(b); // Same immutable params and Stripe idempotency key on every retry.
    return transaction(p.store, d => {
        const x = d.records.find(x => x.id === id)!;
        if (x.checkoutId && x.checkoutId !== session.id)
            throw new BookingError(503, 'Checkout identity mismatch.');
        x.checkoutId = session.id;
        x.checkoutUrl = session.url;
        return x;
    });
}
export async function linkCheckout(p: Ports, id: string, sid: string) {
    const b = await readBooking(p.store, id);
    if (!b.checkoutStarted || !/^cs_(test_)?[A-Za-z0-9]+$/.test(sid))
        throw new BookingError(403, 'Unrecognized checkout.');
    // The runtime payment adapter re-fetches account-bound Checkout, metadata and line items.
    await p.payment({ ...b, checkoutId: sid });
    return transaction(p.store, d => {
        const x = d.records.find(x => x.id === id)!;
        if (x.checkoutId && x.checkoutId !== sid)
            throw new BookingError(409, 'Checkout identity changed.');
        x.checkoutId = sid;
        return x;
    });
}
export async function recover(p: Ports, id: string) {
    let b = await readBooking(p.store, id);
    if (b.state === 'released' || b.state === 'revoked')
        return b;
    if (!b.checkoutId) {
        if (!b.checkoutStarted && p.now() > b.expires)
            return transaction(p.store, d => {
                const x = d.records.find(x => x.id === id)!;
                if (!x.checkoutStarted && x.state === 'held')
                    x.state = 'released';
                return x;
            });
        return startCheckout(p, id);
    }
    const paid = await p.payment(b);
    if (paid.state === 'revoked')
        return transaction(p.store, d => { const x = d.records.find(x => x.id === id)!; x.state = 'revoked'; return x; });
    if (paid.state === 'expired')
        return transaction(p.store, d => { const x = d.records.find(x => x.id === id)!; if (!x.calendarAttempt && x.state !== 'confirmed')
            x.state = 'released'; return x; });
    if (paid.state !== 'paid')
        return b; // open, async pending, unknown: never release by local clock.
    if (!paid.email || paid.email.toLowerCase() !== b.email.toLowerCase())
        throw new BookingError(503, 'Payment identity requires review.');
    await transaction(p.store, d => { const x = d.records.find(x => x.id === id)!; if (x.state !== 'confirmed' && x.state !== 'review')
        x.state = 'paid_pending'; });
    b = await readBooking(p.store, id);
    let event = await p.calendarGet(b);
    if (event?.state === 'cancelled')
        return transaction(p.store, d => { const x = d.records.find(x => x.id === id)!; x.state = 'revoked'; return x; });
    if (!event && !b.calendarAttempt) {
        if (!await p.available(b.start, b.end))
            return transaction(p.store, d => { const x = d.records.find(x => x.id === id)!; x.state = 'review'; return x; });
        const won = await transaction(p.store, d => {
            const x = d.records.find(x => x.id === id)!;
            if (x.calendarAttempt || x.state !== 'paid_pending')
                return false;
            x.calendarAttempt = p.now();
            return true;
        });
        if (won)
            await p.calendarCreate(b);
        // A lost response/crash is recovered only with GET. Never retry a possibly-committed POST.
        event = await p.calendarGet(b);
    }
    if (!event || event.state !== 'confirmed' || !event.meet)
        return readBooking(p.store, id);
    if (!await p.available(b.start, b.end, b.eventId))
        return transaction(p.store, d => { const x = d.records.find(x => x.id === id)!; x.state = 'review'; return x; });
    if ((await p.payment(b)).state !== 'paid')
        return readBooking(p.store, id);
    b = await transaction(p.store, d => {
        const x = d.records.find(x => x.id === id)!;
        if (x.state === 'revoked' || x.state === 'released' || x.state === 'review')
            return x;
        x.state = 'confirmed';
        x.confirmedAt ??= p.now();
        x.meet = event!.meet;
        return x;
    });
    if (b.state === 'confirmed' && !b.mail?.sent)
        await fulfill(p, b.id);
    return readBooking(p.store, id);
}
export async function authorized(p: Ports, raw: string, kind: 'room' | 'ebook') {
    const c = claim(raw, kind, p.secret, p.now());
    const b = await readBooking(p.store, c.id);
    if (b.state !== 'confirmed' || b.edition !== c.edition || c.exp !== tokenExpiry(b, kind))
        throw new BookingError(403, 'Session is not authorized.');
    const [payment, event] = await Promise.all([p.payment(b), p.calendarGet(b)]);
    if (payment.state !== 'paid' || event?.state !== 'confirmed' || !event.meet || !await p.available(b.start, b.end, b.eventId))
        throw new BookingError(403, 'Session is not currently authorized.');
    return b;
}
export async function fulfill(p: Ports, id: string) {
    let b = await readBooking(p.store, id);
    if (b.state !== 'confirmed' || !b.confirmedAt || !b.meet)
        throw new BookingError(409, 'Confirmation pending.');
    if (b.mail?.sent) return;
    await authorized(p, token(b, 'ebook', p.secret), 'ebook');
    await p.asset(b.edition);
    b = await transaction(p.store, d => {
        const x = d.records.find(x => x.id === id)!;
        if (x.state !== 'confirmed')
            throw new BookingError(409, 'Booking changed.');
        x.mail ??= { firstAttempt: p.now(), payload: { to: x.email, subject: x.edition === 'es' ? 'Tu Possibility Session confirmada' : 'Your Possibility Session is confirmed', text: `The Possibility Session · 60 minutes · $175 USD\n${new Date(x.start).toISOString()} (UTC)\nGoogle Meet: ${x.meet}\n\nIncluded ebook (${x.edition === 'es' ? 'Español — La posibilidad' : 'English — The Possibility'}), no additional charge:\n${x.origin}/booking?stage=confirmed#ebook=${token(x, 'ebook', p.secret)}\n\nPrivate Room access:\n${x.origin}/room-of-clarity#access=${token(x, 'room', p.secret)}\n\nThe ebook link expires seven days after confirmation. Room access expires after the session (at least seven days after confirmation). Assistance: info@bhaveslab.com` } };
        return x;
    });
    if (b.mail!.sent)
        return;
    if (p.now() - b.mail!.firstAttempt > 23 * 3600000)
        throw new BookingError(503, 'Ambiguous email requires operator reconciliation.');
    await p.send(b.mail!.payload, 'booking-confirmation-' + id);
    await transaction(p.store, d => { const x = d.records.find(x => x.id === id)!; x.mail!.sent = true; });
}
