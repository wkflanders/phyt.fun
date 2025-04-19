import { env } from './src/env.js';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
    schema: './src/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url:
            env.DATABASE_URL ??
            (() => {
                throw new Error('DATABASE_URL is not defined');
            })()
    }
});
