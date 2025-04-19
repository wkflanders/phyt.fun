import { env } from '@/env';
import { createConfig } from '@privy-io/wagmi';
import { base, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';

export const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(
            env.NEXT_PUBLIC_BASE_RPC_URL ?? 'https://sepolia.base.org'
        )
    }
});
