import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

import type { WalletClient } from 'viem';

const transport = http(process.env.BASE_RPC_URL);

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport
});

if (!process.env.SERVER_PRIVATE_KEY) {
    throw new Error('Missing SERVER_PRIVATE_KEY in environment variables');
}

const account = privateKeyToAccount(
    process.env.SERVER_PRIVATE_KEY as `0x${string}`
);

const walletClient: WalletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport
});

export { walletClient, publicClient, account };
