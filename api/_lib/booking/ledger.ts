import { get, put, BlobPreconditionFailedError } from '@vercel/blob';
export class BookingError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
export type Booking = {
    id: string;
    owner: string;
    start: number;
    end: number;
    edition: 'en' | 'es';
    email: string;
    created: number;
    expires: number;
    price: string;
    origin: string;
    state: 'held' | 'checkout' | 'paid_pending' | 'confirmed' | 'released' | 'review' | 'revoked';
    checkoutStarted?: number;
    checkoutId?: string;
    checkoutUrl?: string;
    calendarAttempt?: number;
    eventId: string;
    confirmedAt?: number;
    meet?: string;
    lastRecovered?: number;
    mail?: {
        firstAttempt: number;
        payload: {
            to: string;
            subject: string;
            text: string;
        };
        sent?: boolean;
    };
};
export type Ledger = {
    version: 1;
    revision: number;
    recoveryAt?: number;
    records: Booking[];
};
export interface Store {
    read(): Promise<{
        data: Ledger;
        etag: string;
    }>;
    write(data: Ledger, etag: string): Promise<void>;
}
export class Conflict extends Error {
}
export function validateLedger(data: Ledger) {
    if (data?.version !== 1 || !Number.isSafeInteger(data.revision) || !Array.isArray(data.records) || data.revision < 0 || (data.recoveryAt !== undefined && (!Number.isSafeInteger(data.recoveryAt) || data.recoveryAt < 0)) || data.records.length > 1000 || Buffer.byteLength(JSON.stringify(data)) > 512000)
        throw new BookingError(503, 'Reservation ledger needs operator review.');
    const ids = new Set<string>();
    for (const b of data.records) {
        if (!/^[a-f0-9]{64}$/.test(b.id) || ids.has(b.id) || !Number.isSafeInteger(b.start) || b.end !== b.start + 3600000 || typeof b.owner !== 'string' || b.owner.length < 1 || b.owner.length > 128 || !Number.isSafeInteger(b.created) || b.expires !== b.created + 3600000 || b.eventId !== 'b' + b.id || typeof b.email !== 'string' || b.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) || !/^price_[A-Za-z0-9]+$/.test(b.price) || (b.confirmedAt !== undefined && !Number.isSafeInteger(b.confirmedAt)) || (b.lastRecovered !== undefined && !Number.isSafeInteger(b.lastRecovered)) || !['en', 'es'].includes(b.edition) || !['held', 'checkout', 'paid_pending', 'confirmed', 'released', 'review', 'revoked'].includes(b.state))
            throw new BookingError(503, 'Invalid reservation ledger.');
        ids.add(b.id);
    }
}
export class BlobStore implements Store {
    constructor(private token: string | undefined, private path: string) {
        if (!/^bookings\/test\/[a-zA-Z0-9_-]+\.json$/.test(path))
            throw new BookingError(503, 'Test ledger path required.');
    }
    async read() {
        const r = await get(this.path, { access: 'private', token: this.token, useCache: false });
        // Never recreate a missing ledger: that could erase active holds after deletion.
        if (!r || r.statusCode !== 200 || !r.stream || !r.blob.etag)
            throw new BookingError(503, 'Reservation ledger is unavailable.');
        const text = await new Response(r.stream).text();
        if (Buffer.byteLength(text) > 512000)
            throw new BookingError(503, 'Reservation ledger limit reached.');
        const data = JSON.parse(text) as Ledger;
        validateLedger(data);
        return { data, etag: r.blob.etag };
    }
    async write(data: Ledger, etag: string) {
        validateLedger(data);
        try {
            await put(this.path, JSON.stringify(data), { access: 'private', token: this.token, addRandomSuffix: false, ifMatch: etag, contentType: 'application/json' });
        }
        catch (e) {
            if (e instanceof BlobPreconditionFailedError)
                throw new Conflict();
            throw e;
        }
    }
}
export async function transaction<T>(store: Store, change: (data: Ledger) => T): Promise<T> {
    for (let i = 0; i < 12; i++) {
        const { data, etag } = await store.read();
        // The callback must be synchronous and free of provider effects: it can replay.
        const result = change(data);
        data.revision++;
        validateLedger(data);
        try {
            await store.write(data, etag);
            return result;
        }
        catch (e) {
            if (!(e instanceof Conflict))
                throw e;
        }
    }
    throw new BookingError(409, 'Reservation changed. Please retry the same request.');
}
export const overlaps = (a: {
    start: number;
    end: number;
}, b: {
    start: number;
    end: number;
}, buffer = 0) => a.start < b.end + buffer && b.start < a.end + buffer;
export const protects = (b: Booking) => b.state !== 'released' && b.state !== 'revoked';
export async function readBooking(store: Store, id: string) {
    const b = (await store.read()).data.records.find(x => x.id === id);
    if (!b)
        throw new BookingError(404, 'Booking not found.');
    return b;
}
