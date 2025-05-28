import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

import { createPublicClient, createWalletClient, http } from 'viem';

import { env } from './env.js';

import type { WalletClient, PrivateKeyAccount } from 'viem';

const transport = http(env.BASE_RPC_URL);

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport
});

const account: PrivateKeyAccount = privateKeyToAccount(
    env.SERVER_PRIVATE_KEY as `0x${string}`
);

const walletClient: WalletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport
});

export { walletClient, publicClient, account };
