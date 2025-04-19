import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const address = z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: 'Must be a valid 0x-prefixed Ethereum address'
    })
    .min(1);

export const env = createEnv({
    client: {
        NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),
        NEXT_PUBLIC_API_URL: z.string().optional(),
        NEXT_PUBLIC_FRONTEND_URL: z.string().optional(),
        NEXT_PUBLIC_BASE_RPC_URL: z.string().optional(),
        NEXT_PUBLIC_MINTER_ADDRESS: address,
        NEXT_PUBLIC_EXCHANGE_ADDRESS: address,
        NEXT_PUBLIC_PHYT_CARDS_ADDRESS: address
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
        NEXT_PUBLIC_BASE_RPC_URL: process.env.NEXT_PUBLIC_BASE_RPC_URL,
        NEXT_PUBLIC_MINTER_ADDRESS: process.env.NEXT_PUBLIC_MINTER_ADDRESS,
        NEXT_PUBLIC_EXCHANGE_ADDRESS: process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS,
        NEXT_PUBLIC_PHYT_CARDS_ADDRESS:
            process.env.NEXT_PUBLIC_PHYT_CARDS_ADDRESS
    }
});
