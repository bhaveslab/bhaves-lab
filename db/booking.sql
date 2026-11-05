BEGIN;

CREATE TABLE public.booking_ledger (
    singleton boolean PRIMARY KEY CHECK (singleton),
    revision bigint NOT NULL CHECK (revision >= 0),
    recovery_at bigint
);

INSERT INTO public.booking_ledger (singleton, revision) VALUES (true, 0);

CREATE TABLE public.booking_reservations (
    id text PRIMARY KEY,
    record jsonb NOT NULL,
    buffer_ms integer NOT NULL CHECK (buffer_ms BETWEEN 0 AND 10800000),
    protected_slot int8range GENERATED ALWAYS AS (
        CASE WHEN record->>'state' NOT IN ('released', 'revoked')
             THEN int8range((record->>'start')::bigint, (record->>'end')::bigint + buffer_ms, '[)')
        END
    ) STORED,
    CHECK (record ?& ARRAY['id', 'state', 'start', 'end']),
    CHECK (record->>'id' IS NOT NULL AND record->>'id' = id),
    CHECK (record->>'state' IS NOT NULL AND record->>'state' IN
        ('held', 'checkout', 'paid_pending', 'confirmed', 'released', 'review', 'revoked')),
    CHECK (record->>'start' IS NOT NULL AND record->>'end' IS NOT NULL
        AND (record->>'end')::bigint = (record->>'start')::bigint + 3600000),
    CONSTRAINT booking_slots_do_not_overlap EXCLUDE USING gist (protected_slot WITH &&)
        DEFERRABLE INITIALLY DEFERRED
);

COMMIT;
