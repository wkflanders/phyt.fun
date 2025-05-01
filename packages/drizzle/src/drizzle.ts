import { config } from 'dotenv';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pkg from 'pg';

import { env } from './env.js';
import * as schema from './schema.js';

config({ path: '.env' });

const { Pool } = pkg;

const pool = new Pool({
    connectionString: env.DATABASE_URL
});

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

export { pool as connection };
