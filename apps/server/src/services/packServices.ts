import { createPublicClient, createWalletClient, http, decodeEventLog, parseEther } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MinterAbi } from '@phyt/contracts';
import { DatabaseError, NotFoundError, ValidationError, MintEvent } from '@phyt/types';

const MINTER = process.env.MINTER_ADDRESS;
const PHYT_CARDS = process.env.PHYT_CARDS_ADDRESS;

const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL),
});

const account = privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(process.env.BASE_RPC_URL),
});

export const packService = {
    createMintConfig: async () => {
        try {
            const { request } = await publicClient.simulateContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'createMintConfig',
                args: [
                    PHYT_CARDS,     // collection address
                    1n,                          // cardsPerPack
                    1n,                          // maxPacks (1 pack per config)
                    parseEther("0.1"),           // price in ETH
                    1n,                          // maxPacksPerAddress
                    false,                       // requiresWhitelist
                    "0x0000000000000000000000000000000000000000000000000000000000000000", // merkleRoot
                    0n,                          // startTimestamp (0 means start immediately)
                    0n,                          // expirationTimestamp (0 means no expiration)
                ]
            });

            const hash = await walletClient.writeContract(request);
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // Get the latest config ID
            const totalConfigs = await publicClient.readContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'totalConfigs'
            });

            return totalConfigs - 1n; // Return the new config ID
        } catch (error) {
            console.error('Failed to create mint config:', error);
            throw error;
        }
    },
    purchasePack: async (data: {
        mintConfigId: number;
        buyer: string;
        merkleProof?: string[];
    }) => {
        const { mintConfigId, buyer, merkleProof = [] } = data;

        try {
            // Create a new mint config for this purchase
            const mintConfigId = await packService.createMintConfig();

            const packPrice = await publicClient.readContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'getPackPrice',
                args: [mintConfigId]
            });

            // Empty merkle proof since we're not using whitelist
            const merkleProof: `0x${string}`[] = [];

            const { request } = await publicClient.simulateContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'mint',
                args: [mintConfigId, merkleProof],
                value: packPrice,
                account: buyer as `0x${string}`
            });

            const hash = await walletClient.writeContract(request);
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            const mintEvents = receipt.logs
                .map(log => {
                    try {
                        return decodeEventLog({
                            abi: MinterAbi,
                            data: log.data,
                            topics: log.topics,
                        });
                    } catch {
                        return null;
                    }
                })
                .filter((event): event is MintEvent => event?.eventName === 'Mint');

            if (mintEvents.length === 0) {
                throw new Error('No mint event found in transaction');
            }

            const mintEvent = mintEvents[0];

            return {
                hash: hash,
                mintConfigId: Number(mintEvent.args.mintConfigId),
                totalMintedPacks: Number(mintEvent.args.totalMintedPacks),
                firstTokenId: Number(mintEvent.args.firstTokenId),
                lastTokenId: Number(mintEvent.args.lastTokenId),
                price: Number(mintEvent.args.price),
            };

        } catch (error: any) {
            if (error instanceof ValidationError) throw error;
            console.error('Pack purchase error:', error);
            throw new Error(error.message || 'Failed to purchase pack');
        }
    }
};