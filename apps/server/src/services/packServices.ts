import { createPublicClient, createWalletClient, http, decodeEventLog, parseEther, formatEther, Chain } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MinterAbi } from '@phyt/contracts';
import { db, transactions, cards, card_metadata, pack_purchases, withTransaction } from '@phyt/database';
import { MintEvent, PackPurchaseNotif, PackPurchaseResponse, TokenURIMetadata, } from '@phyt/types';
import { metadataService } from './metadataServices';
import { getMerkleRoot, getMerkleProofForWallet } from '../lib/merkleWhitelist';

if (!process.env.MINTER_ADDRESS || !process.env.PHYT_CARDS_ADDRESS) {
    throw new Error('Missing contract addresses in environment variables');
}

const MINTER = process.env.MINTER_ADDRESS as `0x${string}`;
const PHYT_CARDS = process.env.PHYT_CARDS_ADDRESS as `0x${string}`;

const transport = http(process.env.BASE_RPC_URL);

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport,
});

if (!process.env.SERVER_PRIVATE_KEY) {
    throw new Error('Missing SERVER_PRIVATE_KEY in environment variables');
}

const account = privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport,
});

export const packService = {
    createMintConfig: async () => {
        try {
            console.log('Creating mint config with account:', account.address);
            console.log('PHYT_CARDS address:', PHYT_CARDS);
            console.log('MINTER address:', MINTER);

            const now = Math.floor(Date.now() / 1000);
            const startTime = BigInt(now);
            const endTime = BigInt(now + (7 * 24 * 60 * 60)); // End in 7 days

            console.log('Timestamps:', {
                now,
                startTime,
                endTime
            });

            const computedMerkleRoot = await getMerkleRoot();
            console.log('Computed merkle root:', computedMerkleRoot);

            const { request } = await publicClient.simulateContract({
                address: MINTER,
                abi: MinterAbi,
                functionName: 'newMintConfig',
                args: [
                    PHYT_CARDS,
                    1n,                    // 3 cards per pack
                    1n,                 // max total packs
                    parseEther("0.0001"),  // price per pack
                    1n,                   // max packs per address
                    true,                  // whitelist enabled
                    computedMerkleRoot,    // merkle root
                    startTime,             // start time (now - 1 min)
                    endTime,               // end time (7 days)
                ],
                account,
            });

            console.log('Contract simulation successful');

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log('Transaction receipt:', receipt);

            if (receipt.status === 'reverted') {
                // Try to decode error if possible
                if (receipt.logs && receipt.logs.length > 0) {
                    try {
                        const decodedLogs = receipt.logs.map(log =>
                            decodeEventLog({
                                abi: MinterAbi,
                                data: log.data,
                                topics: log.topics,
                            })
                        );
                        console.log('Decoded logs:', decodedLogs);
                    } catch (error) {
                        console.error('Error decoding logs:', error);
                    }
                }
                throw new Error('Transaction reverted - check roles and parameters');
            }

            const totalConfigs = await publicClient.readContract({
                address: MINTER,
                abi: MinterAbi,
                functionName: 'mintConfigIdCounter'
            });

            const configId = totalConfigs - 1n;
            console.log('New mint config ID:', configId);
            return configId;
        } catch (error) {
            console.error('Failed to create mint config:', error);
            throw error;
        }
    },
    getWhitelistProof: async (wallet: string): Promise<string[]> => {
        return getMerkleProofForWallet(wallet);
    },

    getPackPrice: async (mintConfigId: bigint) => {
        const packPrice = await publicClient.readContract({
            address: MINTER,
            abi: MinterAbi,
            functionName: 'getPackPrice',
            args: [mintConfigId]
        });
        console.log('made it to packPrice');
        return packPrice;
    },

    purchasePack: async (data: PackPurchaseNotif): Promise<PackPurchaseResponse> => {
        const { buyerId, hash, packPrice } = data;
        console.log(hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'reverted') {
            throw new Error("Transaction failed");
        }

        try {
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

            return await withTransaction(async (client) => {
                // Create pack purchase record
                const { rows: [packPurchase] } = await client.query(
                    'INSERT INTO pack_purchases (buyer_id, purchase_price) VALUES ($1, $2) RETURNING *',
                    [buyerId, Number(formatEther(BigInt(packPrice)))]
                );

                // Create card records and metadata
                const cardsMetadata: TokenURIMetadata[] = [];
                const cardsIds: number[] = [];

                for (let tokenId = Number(mintEvent.args.firstTokenId);
                    tokenId <= Number(mintEvent.args.lastTokenId);
                    tokenId++) {

                    // 1. Insert the card into the cards table first
                    const { rows: [card] } = await client.query(
                        'INSERT INTO cards (owner_id, pack_purchase_id, token_id, acquisition_type) VALUES ($1, $2, $3, $4) RETURNING *',
                        [buyerId, packPurchase.id, tokenId, 'mint']
                    );

                    if (!card) {
                        throw new Error(`Failed to insert card with token_id: ${tokenId}`);
                    }

                    cardsIds.push(card.d);

                    // 2. Now generate metadata and insert it into card_metadata.
                    const metadata = await metadataService.generateMetadata(tokenId);
                    cardsMetadata.push(metadata);

                    // Insert metadata using your own query (if needed)
                    await client.query(
                        'INSERT INTO card_metadata (token_id, runner_id, runner_name, rarity, multiplier, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
                        [
                            tokenId,
                            metadata.attributes[0].runner_id,
                            metadata.attributes[0].runner_name,
                            metadata.attributes[0].rarity,
                            metadata.attributes[0].multiplier,
                            metadata.image,
                        ]
                    );

                    await client.query(
                        'INSERT INTO transactions (from_user_id, to_user_id, card_id, transaction_type, token_amount, hash) VALUES ($1, $2, $3, $4, $5, $6)',
                        [
                            null,
                            buyerId,
                            card.id,
                            'packPurchase',
                            Number(formatEther(BigInt(packPrice))) / cardsIds.length, // Divide the total price by number of cards
                            hash
                        ]
                    );
                }

                return {
                    cardsMetadata,
                };
            });
        } catch (error) {
            console.error('Pack purchase error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to purchase pack');
        }
    }
};