import { createEnv } from '@t3-oss/env-core';
import { config } from 'dotenv';

import { z } from 'zod';

config({ path: '.env' });

config({ path: '.env' });

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url().min(1),
        POSTGRES_URL: z.string().url().min(1),
        POSTGRES_HOST: z.string().min(1),
        POSTGRES_PORT: z.coerce.number().min(1).optional(),
        POSTGRES_PORT: z.coerce.number().min(1).optional(),
        POSTGRES_USER: z.string().min(1),
        POSTGRES_PASSWORD: z.string().min(1),
        POSTGRES_DB: z.string().min(1)
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        POSTGRES_URL: process.env.POSTGRES_URL,
        POSTGRES_URL: process.env.POSTGRES_URL,
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DB: process.env.POSTGRES_DB
    }
});
