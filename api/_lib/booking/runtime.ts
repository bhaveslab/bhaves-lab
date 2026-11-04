import Stripe from 'stripe';
import { BlobStore, BookingError, overlaps, type Booking, type Store } from './ledger.js';
import type { Ports, Payment, Event } from './service.js';
import { ports as ebookPorts } from '../ebooks/runtime.js';
import { verifiedAsset, type EbookPorts } from '../ebooks/service.js';
import { safeOrigin } from '../ebooks/security.js';
export type Policy = {
    timezone: string;
    windows: {
        day: number;
        start: string;
        end: string;
    }[];
    noticeMinutes: number;
    horizonDays: number;
    bufferMinutes: number;
};
export function policy(env: NodeJS.ProcessEnv): Policy {
    let p: Policy;
    try {
        p = JSON.parse(env.BOOKING_AVAILABILITY_JSON || '');
        new Intl.DateTimeFormat('en', { timeZone: p.timezone }).format();
    }
    catch {
        throw new BookingError(503, 'Approved availability is not configured.');
    }
    if (!p.timezone || !Array.isArray(p.windows) || !p.windows.length || p.windows.length > 21 || !Number.isInteger(p.noticeMinutes) || p.noticeMinutes < 60 || !Number.isInteger(p.horizonDays) || p.horizonDays < 1 || p.horizonDays > 90 || !Number.isInteger(p.bufferMinutes) || p.bufferMinutes < 0 || p.bufferMinutes > 180 || p.windows.some(w => !Number.isInteger(w.day) || w.day < 0 || w.day > 6 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(w.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(w.end) || w.end <= w.start))
        throw new BookingError(503, 'Invalid availability policy.');
    return p;
}
export function permitted(start: number, p: Policy, now: number) {
    if (!Number.isSafeInteger(start) || start % 1800000 !== 0 || start < now + p.noticeMinutes * 60000 || start > now + p.horizonDays * 86400000)
        return false;
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: p.timezone, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const local = (n: number) => Object.fromEntries(fmt.formatToParts(n).map(x => [x.type, x.value]));
    const a = local(start), b = local(start + 3600000), day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(a.weekday);
    if (a.year !== b.year || a.month !== b.month || a.day !== b.day)
        return false;
    return p.windows.some(w => w.day === day && a.hour + ':' + a.minute >= w.start && b.hour + ':' + b.minute <= w.end);
}
export function ready(env: NodeJS.ProcessEnv) {
    return env.BOOKING_ENABLED === 'true' && env.VERCEL_ENV !== 'production' && /^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || '') && ['BOOKING_TEST_CALENDAR_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'BOOKING_AVAILABILITY_JSON', 'BOOKING_LEDGER_PATH', 'BOOKING_STRIPE_PRICE_ID', 'BOOKING_WEBHOOK_SECRET', 'BOOKING_ACCESS_SECRET', 'BOOKING_RECOVERY_SECRET', 'EBOOK_BLOB_READ_WRITE_TOKEN', 'EBOOK_STRIPE_ACCOUNT_ID', 'RESEND_API_KEY', 'EBOOK_RECEIPT_FROM', 'EBOOK_DOWNLOAD_SECRET', 'EBOOK_PUBLIC_ORIGIN'].every(k => !!env[k]) && (env.BOOKING_ACCESS_SECRET?.length || 0) >= 43 && (env.BOOKING_RECOVERY_SECRET?.length || 0) >= 43 && env.BOOKING_CALENDAR_WRITE_APPROVED === 'true';
}
export async function runtime(env: NodeJS.ProcessEnv = process.env, dependencies: {
    stripe?: Stripe;
    fetch?: typeof fetch;
    ebook?: EbookPorts;
    store?: Store;
} = {}): Promise<Ports> {
    if (!ready(env))
        throw new BookingError(503, 'Paid booking is being prepared. No reservation has been confirmed.');
    const p = policy(env), origin = safeOrigin(env), calendar = env.BOOKING_TEST_CALENDAR_ID!;
    const stripe = dependencies.stripe || new Stripe(env.STRIPE_SECRET_KEY!), ebook = dependencies.ebook || ebookPorts(env), request = dependencies.fetch || fetch;
    const account = await stripe.accounts.retrieve();
    if (account.id !== env.EBOOK_STRIPE_ACCOUNT_ID || !account.charges_enabled)
        throw new BookingError(503, 'Payment account mismatch.');
    const price = await stripe.prices.retrieve(env.BOOKING_STRIPE_PRICE_ID!);
    if (price.livemode || !price.active || price.currency !== 'usd' || price.unit_amount !== 17500 || price.type !== 'one_time')
        throw new BookingError(503, 'Invalid session price.');
    let accessToken: string | undefined;
    async function google(path: string, method = 'GET', body?: unknown) {
        if (!accessToken) {
            const r = await request('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, refresh_token: env.GOOGLE_REFRESH_TOKEN!, grant_type: 'refresh_token' }), signal: AbortSignal.timeout(15000) });
            if (!r.ok)
                throw new BookingError(503, 'Calendar authorization unavailable.');
            accessToken = (await r.json()).access_token;
            if (!accessToken)
                throw new BookingError(503, 'Calendar authorization unavailable.');
        }
        const r = await request('https://www.googleapis.com/calendar/v3/' + path, { method, headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
        if (r.status === 404)
            return null;
        if (!r.ok)
            throw new BookingError(503, 'Calendar operation needs retry or review.');
        return r.json();
    }
    const busyDays = new Map<string, {start:number;end:number}[]>();
    const root = 'calendars/' + encodeURIComponent(calendar) + '/events';
    async function calendarGet(b: Booking): Promise<Event | null> {
        const e = await google(root + '/' + b.eventId);
        if (!e)
            return null;
        if (e.status === 'cancelled')
            return { state: 'cancelled' };
        if (e.id !== b.eventId || e.extendedProperties?.private?.labBooking !== b.id || Date.parse(e.start?.dateTime) !== b.start || Date.parse(e.end?.dateTime) !== b.end || !e.attendees?.some((a: {
            email: string;
        }) => a.email?.toLowerCase() === b.email.toLowerCase()))
            throw new BookingError(403, 'Calendar reservation identity mismatch.');
        const meet = e.conferenceData?.entryPoints?.find((x: {
            entryPointType: string;
            uri: string;
        }) => x.entryPointType === 'video')?.uri;
        if (meet && !/^https:\/\/meet\.google\.com\/[a-z-]+$/.test(meet))
            throw new BookingError(503, 'Invalid conference link.');
        return { state: e.status === 'confirmed' && !['pending','failure'].includes(e.conferenceData?.createRequest?.status?.statusCode) ? 'confirmed' : 'pending', meet };
    }
    return {
        store: dependencies.store || new BlobStore(env.EBOOK_BLOB_READ_WRITE_TOKEN!, env.BOOKING_LEDGER_PATH!), now: Date.now, buffer: p.bufferMinutes * 60000, secret: env.BOOKING_ACCESS_SECRET!,
        async available(start, end, exclude) {
            // A confirmed past booking is still verifiable; policy is enforced on admission only.
            const min = new Date(start - p.bufferMinutes * 60000).toISOString(), max = new Date(end + p.bufferMinutes * 60000).toISOString();
            if (!exclude) {
                const day = new Date(start).toISOString().slice(0,10);
                if (!busyDays.has(day)) {
                    const midnight = Date.parse(day+'T00:00:00Z');
                    const fb = await google('freeBusy', 'POST', { timeMin: new Date(midnight-p.bufferMinutes*60000).toISOString(), timeMax: new Date(midnight+86400000+3600000+p.bufferMinutes*60000).toISOString(), items: [{ id: calendar }] });
                    const cal = fb?.calendars?.[calendar];
                    if (!cal || cal.errors?.length || !Array.isArray(cal.busy)) throw new BookingError(503, 'Calendar availability unavailable.');
                    const intervals = cal.busy.map((b:{start:string;end:string})=>({start:Date.parse(b.start),end:Date.parse(b.end)}));
                    if (intervals.some((b:{start:number;end:number})=>!Number.isFinite(b.start)||!Number.isFinite(b.end)||b.end<=b.start)) throw new BookingError(503,'Invalid calendar availability.');
                    busyDays.set(day,intervals);
                }
                return !busyDays.get(day)!.some(b=>overlaps(b,{start,end},p.bufferMinutes*60000));
            }
            let page: string | undefined;
            do {
                const q = new URLSearchParams({ timeMin: min, timeMax: max, singleEvents: 'true', showDeleted: 'false', maxResults: '250' });
                if (page)
                    q.set('pageToken', page);
                const r = await google(root + '?' + q);
                if (!r || !Array.isArray(r.items))
                    throw new BookingError(503, 'Calendar availability unavailable.');
                for (const e of r.items) {
                    if (e.id === exclude || e.status === 'cancelled' || e.transparency === 'transparent' || e.attendees?.some((a: {
                        self?: boolean;
                        responseStatus?: string;
                    }) => a.self && a.responseStatus === 'declined'))
                        continue;
                    // All-day events intersecting this query conservatively block; no private detail returned.
                    if (!e.start?.dateTime || !e.end?.dateTime || overlaps({ start: Date.parse(e.start.dateTime), end: Date.parse(e.end.dateTime) }, { start, end }, p.bufferMinutes * 60000))
                        return false;
                }
                page = r.nextPageToken;
            } while (page);
            return true;
        },
        async checkout(b) {
            if (b.price !== env.BOOKING_STRIPE_PRICE_ID || b.origin !== origin)
                throw new BookingError(503, 'Checkout configuration changed.');
            const s = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price: b.price, quantity: 1 }], customer_email: b.email, expires_at: Math.floor(b.expires / 1000), client_reference_id: b.id, success_url: b.origin + '/booking?stage=confirmed', cancel_url: b.origin + '/booking?stage=cancelled', metadata: { application: 'bhaves-lab', purchase_kind: 'booking', booking_id: b.id, ebook_edition: b.edition } }, { idempotencyKey: 'booking-checkout-' + b.id });
            if (!s.url || new URL(s.url).origin !== 'https://checkout.stripe.com')
                throw new BookingError(503, 'Checkout response requires recovery.');
            return { id: s.id, url: s.url };
        },
        async payment(b): Promise<Payment> {
            if (!b.checkoutId)
                throw new BookingError(503, 'Checkout is unresolved.');
            const s = await stripe.checkout.sessions.retrieve(b.checkoutId);
            if (s.livemode || s.mode !== 'payment' || s.client_reference_id !== b.id || s.metadata?.application !== 'bhaves-lab' || s.metadata.purchase_kind !== 'booking' || s.metadata.booking_id !== b.id || s.metadata.ebook_edition !== b.edition || s.amount_total !== 17500 || s.currency !== 'usd')
                throw new BookingError(403, 'Payment binding mismatch.');
            const lines = await stripe.checkout.sessions.listLineItems(s.id, { limit: 2 });
            if (lines.has_more || lines.data.length !== 1 || lines.data[0].quantity !== 1 || lines.data[0].price?.id !== b.price || lines.data[0].amount_total !== 17500)
                throw new BookingError(403, 'Session price mismatch.');
            const pid = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id;
            const pi = pid ? await stripe.paymentIntents.retrieve(pid, { expand: ['latest_charge'] }) : null;
            const charge = pi?.latest_charge;
            if (charge && typeof charge !== 'string' && (charge.refunded || charge.amount_refunded > 0 || charge.disputed))
                return { state: 'revoked' };
            if (s.status === 'complete' && s.payment_status === 'paid' && pi?.status === 'succeeded' && !pi.livemode && pi.currency === 'usd' && pi.amount_received === 17500 && charge && typeof charge !== 'string' && charge.paid)
                return { state: 'paid', email: s.customer_details?.email || s.customer_email || undefined };
            if (s.status === 'expired' && s.payment_status === 'unpaid' && (!pi || pi.status === 'canceled' || pi.status === 'requires_payment_method'))
                return { state: 'expired' };
            return { state: s.status === 'open' ? 'open' : 'pending' };
        },
        calendarGet,
        async calendarCreate(b) {
            // This POST is permitted once per ledger record. Timeout -> GET recovery, never blind repeat.
            await google(root + '?conferenceDataVersion=1&sendUpdates=all', 'POST', { id: b.eventId, summary: 'The Possibility Session', start: { dateTime: new Date(b.start).toISOString(), timeZone: p.timezone }, end: { dateTime: new Date(b.end).toISOString(), timeZone: p.timezone }, attendees: [{ email: b.email }], guestsCanModify: false, guestsCanInviteOthers: false, visibility: 'private', extendedProperties: { private: { labBooking: b.id } }, conferenceData: { createRequest: { requestId: b.id, conferenceSolutionKey: { type: 'hangoutsMeet' } } } });
        },
        asset: edition => verifiedAsset(edition, ebook),
        send: (payload, key) => ebook.sendReceipt({ ...payload, idempotencyKey: key }),
    };
}
