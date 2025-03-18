import { walletClient, publicClient, account } from '../lib/viemClient';
import { decodeEventLog, parseEther, formatEther } from 'viem';
import { MinterAbi } from '@phyt/contracts';
import { withTransaction } from '@phyt/database';
import { MintEvent, PackPurchaseNotif, PackPurchaseResponse, TokenURIMetadata, PackTypes, CardRarity } from '@phyt/types';
import { metadataService } from './metadataServices';
import { getMerkleRoot, getMerkleProofForWallet } from '../lib/merkleWhitelist';

if (!process.env.MINTER_ADDRESS || !process.env.PHYT_CARDS_ADDRESS) {
    throw new Error('Missing contract addresses in environment variables');
}

const MINTER = process.env.MINTER_ADDRESS as `0x${string}`;
const PHYT_CARDS = process.env.PHYT_CARDS_ADDRESS as `0x${string}`;


export const packService = {
    createMintConfig: async (packType = 'scrawny') => {
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

            const packConfig = PackTypes.find(p => p.id === packType) || PackTypes[0];
            const cardCount = packConfig.cardCount || 1;
            const price = parseEther(packConfig.price);

            const { request } = await publicClient.simulateContract({
                address: MINTER,
                abi: MinterAbi,
                functionName: 'newMintConfig',
                args: [
                    PHYT_CARDS,
                    BigInt(cardCount),                    // cards per pack
                    1n,                                   // max total packs
                    parseEther("0.0001"),                 // price per pack
                    1n,                                   // max packs per address
                    true,                                 // whitelist enabled
                    computedMerkleRoot,                   // merkle root
                    startTime,                            // start time (now - 1 min)
                    endTime,                              // end time (7 days)
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

    getPackPrice: async (mintConfigId: bigint, packType = 'scrawny') => {
        const packConfig = PackTypes.find(p => p.id === packType) || PackTypes[0];
        return parseEther(packConfig.price);
    },

    generateCardRarity: (packType: string = 'scrawny'): CardRarity => {
        // The existing generateRarity function in metadataService uses the RarityWeights defined in types
        // We can use that directly as it already has the rarity distribution we want
        return metadataService.generateRarity();
    },

    generateCardRarities: (packType: string = 'scrawny'): CardRarity[] => {
        const packConfig = PackTypes.find(p => p.id === packType) || PackTypes[0];
        const cardCount = packConfig.cardCount || 1;
        const rarities: CardRarity[] = [];

        // Define guaranteed rarities for each pack type
        let guaranteedRarities: CardRarity[] = [];

        switch (packType) {
            case 'swole':
                // 3 guaranteed bronze
                guaranteedRarities = ['bronze', 'bronze', 'bronze'];
                break;
            case 'phyt':
                // 2 guaranteed bronze, 1 guaranteed silver
                guaranteedRarities = ['bronze', 'bronze', 'silver'];
                break;
            default:
                // No guaranteed rarities for other pack types
                guaranteedRarities = [];
        }

        // Add guaranteed rarities first
        rarities.push(...guaranteedRarities);

        // Fill remaining slots with random rarities
        const remainingSlots = cardCount - rarities.length;
        for (let i = 0; i < remainingSlots; i++) {
            rarities.push(packService.generateCardRarity(packType));
        }

        // Shuffle the array to randomize the order
        return packService.shuffleArray(rarities);
    },

    shuffleArray: <T>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    purchasePack: async (data: PackPurchaseNotif & { packType?: string; }): Promise<PackPurchaseResponse> => {
        const { buyerId, hash, packPrice, packType = 'scrawny' } = data;

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
                    'INSERT INTO pack_purchases (buyer_id, purchase_price, pack_type) VALUES ($1, $2, $3) RETURNING *',
                    [buyerId, Number(formatEther(BigInt(packPrice))), packType]
                );

                // Get the card rarities for this pack type
                const cardRarities = packService.generateCardRarities(packType);

                // Create card records and metadata
                const cardsMetadata: TokenURIMetadata[] = [];
                const cardsIds: number[] = [];

                for (let i = 0; i < cardRarities.length; i++) {
                    const tokenId = Number(mintEvent.args.firstTokenId) + i;
                    const rarity = cardRarities[i];

                    // 1. Insert the card into the cards table first
                    const { rows: [card] } = await client.query(
                        'INSERT INTO cards (owner_id, pack_purchase_id, token_id, acquisition_type) VALUES ($1, $2, $3, $4) RETURNING *',
                        [buyerId, packPurchase.id, tokenId, 'mint']
                    );

                    if (!card) {
                        throw new Error(`Failed to insert card with token_id: ${tokenId}`);
                    }

                    cardsIds.push(card.id);

                    // 2. Generate metadata with the specific rarity
                    const metadata = await metadataService.generateMetadataWithRarity(tokenId, rarity);
                    cardsMetadata.push(metadata);

                    // Insert metadata
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