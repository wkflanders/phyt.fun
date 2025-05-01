CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- fixed UUIDv7 implementation: 48-bit timestamp, version=7, variant bits, and 6-byte node
CREATE OR REPLACE FUNCTION uuid_generate_v7(p_timestamp timestamptz DEFAULT clock_timestamp())
  RETURNS uuid
  LANGUAGE plpgsql
AS $$
DECLARE
  ts bigint := floor(extract(epoch FROM p_timestamp) * 1000);
  time_low bigint := ts & 4294967295;
  time_mid integer := ((ts >> 32) & 65535)::integer;
  time_hi_and_ver integer := (((ts >> 48) & 4095) | 28672)::integer;   -- set version = 7
  clock_seq integer := ((floor(random() * 16384)::integer & 16383) | 32768)::integer; -- set variant bits
  node bytea := gen_random_bytes(6);
  hexstr text;
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