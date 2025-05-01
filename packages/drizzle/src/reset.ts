import { sql } from 'drizzle-orm';

import { db } from './drizzle.js';

async function reset() {
    console.warn('⏳ Resetting database schema + installing uuidv7…');
    const start = Date.now();

    const teardownAndBootstrap = sql`
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- define a proper UUIDv7 generator (no hex‐literals)
    CREATE OR REPLACE FUNCTION uuid_generate_v7(p_timestamp timestamptz DEFAULT clock_timestamp())
      RETURNS uuid
      LANGUAGE plpgsql
    AS $$
    DECLARE
      ts              bigint := floor(extract(epoch FROM p_timestamp) * 1000);
      time_low        bigint := ts & 4294967295;
      time_mid        integer := ((ts >> 32) & 65535)::integer;
      time_hi_and_ver integer := (((ts >> 48) & 4095) | 28672)::integer;   -- set version = 7
      clock_seq       integer := ((floor(random() * 16384)::integer & 16383) | 32768)::integer; -- set variant bits
      node            bytea   := gen_random_bytes(6);
      hexstr          text;
    BEGIN
      hexstr :=
        lpad(to_hex(time_low),8,'0')  || '-' ||
        lpad(to_hex(time_mid),4,'0')  || '-' ||
        lpad(to_hex(time_hi_and_ver),4,'0') || '-' ||
        lpad(to_hex(clock_seq),4,'0') || '-' ||
        encode(node, 'hex');
      RETURN hexstr::uuid;
    END;
    $$;
  `;

    await db.execute(teardownAndBootstrap);

    const duration = Date.now() - start;
    console.warn(
        `✅ Schema + UUIDv7 reset complete (took ${String(duration)}ms)`
    );
    process.exit(0);
}

reset().catch((err: unknown) => {
    console.error('❌ Reset failed');
    console.error(err);
    process.exit(1);
});
