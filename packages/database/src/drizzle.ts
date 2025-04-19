import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from './env.js';
import * as schema from './schema.js';

config({ path: '.env' });

const pool = new Pool({
    connectionString: env.DATABASE_URL
});

export const db = drizzle(pool, { schema });
