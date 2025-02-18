import { Pool, PoolClient } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

export type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const db = drizzle(client, { schema });
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}