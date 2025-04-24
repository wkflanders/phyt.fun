import { env } from './src/env.ts';
import { defineConfig } from 'drizzle-kit';

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
