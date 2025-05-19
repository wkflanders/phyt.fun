import { createEnv } from '@t3-oss/env-core';

import { z } from 'zod';

const address = z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: 'Must be a valid 0x-prefixed Ethereum address'
    })
    .min(1);

export const env = createEnv({
    server: {
        PRIVY_APP_ID: z.string().min(1),
        PRIVY_SECRET_KEY: z.string().min(1),
        PRIVY_VERIFICATION_KEY: z.string().min(1),
        API_URL: z.string().url().optional(),
        FRONTEND_URL: z.string().url().optional(),
        BASE_RPC_URL: z.string().min(1).optional(),
        SERVER_ADDRESS: address,
        SERVER_PRIVATE_KEY: address,
        SERVER_PORT: z.coerce.number().default(4000),
        ADMIN_IDS: z
            .string()
            .default('')
            .transform(
                (csv) =>
                    new Set(
                        csv
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                    )
            ),
        NODE_ENV: z.enum(['development', 'production', 'test'])
    },
    runtimeEnv: {
        PRIVY_APP_ID: process.env.PRIVY_APP_ID,
        PRIVY_SECRET_KEY: process.env.PRIVY_SECRET_KEY,
        PRIVY_VERIFICATION_KEY: process.env.PRIVY_VERIFICATION_KEY,
        API_URL: process.env.API_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
        BASE_RPC_URL: process.env.BASE_RPC_URL,
        SERVER_ADDRESS: process.env.SERVER_ADDRESS,
        SERVER_PRIVATE_KEY: process.env.SERVER_PRIVATE_KEY,
        SERVER_PORT: process.env.SERVER_PORT,
        ADMIN_IDS: process.env.ADMIN_IDS,
        NODE_ENV: process.env.NODE_ENV
    }
});
