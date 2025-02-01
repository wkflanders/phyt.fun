import { Client, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket support
neonConfig.webSocketConstructor = ws;

export type TransactionCallback<T> = (client: Client) => Promise<T>;

export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
    const client = new Client(process.env.DATABASE_URL!);
    await client.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        await client.end();
    }
}

export async function withClient<T>(callback: TransactionCallback<T>): Promise<T> {
    const client = new Client(process.env.DATABASE_URL!);
    await client.connect();

    try {
        return await callback(client);
    } finally {
        await client.end();
    }
}