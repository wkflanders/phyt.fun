/* eslint-disable no-console */
import { connection as pool } from './db.js';

async function dropAllTables() {
    const client = await pool.connect();
    try {
        // Get all tables in the public schema
        const { rows }: { rows: { tablename: string }[] } = await client.query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public';
        `);
        if (rows.length === 0) {
            console.log('No tables found.');
            return;
        }
        // Disable referential integrity
        await client.query('SET session_replication_role = replica;');
        // Drop all tables
        for (const { tablename } of rows) {
            console.log(`Dropping table: ${tablename}`);
            await client.query(`DROP TABLE IF EXISTS "${tablename}" CASCADE;`);
        }
        // Re-enable referential integrity
        await client.query('SET session_replication_role = DEFAULT;');
        console.log('All tables dropped.');
    } finally {
        client.release();
    }
}

dropAllTables()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
        console.error(err);
        process.exit(1);
    });
