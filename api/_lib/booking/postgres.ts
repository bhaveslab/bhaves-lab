import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { BookingError, Conflict, validateLedger, type Ledger, type Store } from './ledger.js';

export function bookingDatabaseUrl(env: NodeJS.ProcessEnv) {
    const value = env.BOOKING_DATABASE_URL || env.DATABASE_URL;
    if (env.VERCEL_ENV !== 'preview' || !value || !env.BOOKING_TEST_DATABASE_HOST)
        return;
    try {
        const url = new URL(value);
        if (url.protocol === 'postgresql:' && url.hostname === env.BOOKING_TEST_DATABASE_HOST
            && /^ep-[a-z0-9-]+-pooler\.[a-z0-9.-]+\.neon\.tech$/.test(url.hostname)
            && !url.port && !url.hash && url.username && url.password && url.pathname.length > 1) {
            // Only forward connection options we control, and always verify TLS.
            url.search = '?sslmode=verify-full';
            return url.toString();
        }
    }
    catch { /* Invalid or missing configuration keeps paid booking unavailable. */ }
}

export class PostgresStore implements Store {
    constructor(private pool: Pool, private buffer: number) {}

    async read() {
        const result = await this.pool.query<{
            revision: string;
            recovery_at: string | null;
            records: Ledger['records'];
        }>(`
            SELECT revision, recovery_at,
                COALESCE((SELECT jsonb_agg(record ORDER BY id)
                          FROM (SELECT id, record FROM public.booking_reservations
                                ORDER BY id LIMIT 1001) AS bounded), '[]'::jsonb) AS records
            FROM public.booking_ledger WHERE singleton
        `);
        const row = result.rows[0];
        if (!row)
            throw new BookingError(503, 'Reservation ledger is unavailable.');
        const data: Ledger = {
            version: 1, revision: Number(row.revision), records: row.records,
            recoveryAt: row.recovery_at === null ? undefined : Number(row.recovery_at),
        };
        validateLedger(data);
        return { data, etag: row.revision };
    }

    async write(data: Ledger, etag: string) {
        validateLedger(data);
        const client = await this.pool.connect();
        let discard = false;
        try {
            await client.query('BEGIN');
            await client.query("SET LOCAL statement_timeout = '5s'");
            const claim = await client.query(`
                UPDATE public.booking_ledger SET revision = $1, recovery_at = $2
                WHERE singleton AND revision = $3 AND revision + 1 = $1
            `, [data.revision, data.recoveryAt ?? null, etag]);
            if (claim.rowCount !== 1)
                throw new Conflict();

            // Records are never removed by the booking service. State changes and
            // the revision commit together, including deferred slot validation.
            await client.query(`
                INSERT INTO public.booking_reservations AS existing (id, record, buffer_ms)
                SELECT value->>'id', value, $2 FROM jsonb_array_elements($1::jsonb)
                ON CONFLICT (id) DO UPDATE SET record = EXCLUDED.record, buffer_ms = EXCLUDED.buffer_ms
                WHERE existing.record IS DISTINCT FROM EXCLUDED.record
                   OR existing.buffer_ms IS DISTINCT FROM EXCLUDED.buffer_ms
            `, [JSON.stringify(data.records), this.buffer]);
            await client.query('COMMIT');
        }
        catch (error) {
            try { await client.query('ROLLBACK'); }
            catch { discard = true; }
            const failure = error as { code?: string; constraint?: string };
            if (failure.code === '23P01' && failure.constraint === 'booking_slots_do_not_overlap')
                throw new BookingError(409, 'Appointment no longer available.');
            throw error;
        }
        finally {
            client.release(discard);
        }
    }
}

let shared: { url: string; pool: Pool } | undefined;
export function postgresStore(url: string, buffer: number) {
    if (!shared || shared.url !== url) {
        const pool = new Pool({ connectionString: url, max: 4, connectionTimeoutMillis: 5000,
            query_timeout: 10000 });
        pool.on('error', () => console.error('Idle booking database connection failed.'));
        attachDatabasePool(pool);
        shared = { url, pool };
    }
    return new PostgresStore(shared.pool, buffer);
}
