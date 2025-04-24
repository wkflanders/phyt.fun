import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';

import { env } from './env.ts';
import * as schema from './schema.ts';

config({ path: '.env' });

const { Pool } = pkg;

const pool = new Pool({
    connectionString: env.DATABASE_URL
});

export const db = drizzle(pool, { schema });
