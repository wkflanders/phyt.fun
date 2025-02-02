import { createPublicClient, createWalletClient, http, type WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const transport = http(process.env.BASE_RPC_URL);

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport,
});

if (!process.env.SERVER_PRIVATE_KEY) {
    throw new Error('Missing SERVER_PRIVATE_KEY in environment variables');
}

const account = privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as `0x${string}`);

const walletClient: WalletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport,
});

export { walletClient, publicClient, account };