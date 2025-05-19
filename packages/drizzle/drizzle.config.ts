import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export default defineConfig({
    schema: './src/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url:
            process.env.DATABASE_URL ??
            (() => {
                throw new Error('DATABASE_URL is not defined');
            })()
    }
});
