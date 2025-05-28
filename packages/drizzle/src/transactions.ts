import { Pool } from 'pg';

import { drizzle } from 'drizzle-orm/node-postgres';

import { env } from './env.js';
import * as schema from './schema.js';

const pool = new Pool({
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT ?? 5432,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB
});

export type TransactionCallback<T> = (
    db: ReturnType<typeof drizzle>
) => Promise<T>;

export async function withTransaction<T>(
    callback: TransactionCallback<T>
): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const db = drizzle(client, { schema });
        const result = await callback(db);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// TEMP COME BACK TO THIS POTENTIALLY TO ADJUST LOWER LEVEL POOL CLIENT

// export type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

// export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
//     const client = await pool.connect();

//     try {
//         await client.query('BEGIN');
//         const db = drizzle(client, { schema });
//         const result = await callback(client);
//         await client.query('COMMIT');
//         return result;
//     } catch (error) {
//         await client.query('ROLLBACK');
//         throw error;
//     } finally {
//         client.release();
//     }
// }
