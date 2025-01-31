import { createConfig } from '@privy-io/wagmi';
import { base, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';

export const localChain = {
    ...baseSepolia,
    id: 31337,
    name: 'Anvil Local',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545'],
        },
        public: {
            http: ['http://127.0.0.1:8545'],
        },
    },
} as const;

export const config = createConfig({
    chains: [localChain],
    transports: {
        [localChain.id]: http(),
    },
});