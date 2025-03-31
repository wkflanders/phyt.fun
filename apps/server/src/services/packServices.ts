import { MinterAbi } from '@phyt/contracts';
import {
    db,
    pack_purchases,
    cards,
    card_metadata,
    transactions
} from '@phyt/database';
import {
    MintEvent,
    PackPurchaseNotif,
    PackTypes,
    CardRarity,
    TokenURIMetadata
} from '@phyt/types';
import { decodeEventLog, parseEther, formatEther, Abi } from 'viem';

import { getMerkleRoot, getMerkleProofForWallet } from '@/lib/merkleWhitelist';
import { walletClient, publicClient, account } from '@/lib/viemClient';

import { metadataService } from './metadataServices';

if (!process.env.MINTER_ADDRESS || !process.env.PHYT_CARDS_ADDRESS) {
    throw new Error('Missing contract addresses in environment variables');
}

const MINTER = process.env.MINTER_ADDRESS as `0x${string}`;
const PHYT_CARDS = process.env.PHYT_CARDS_ADDRESS as `0x${string}`;

// Define a custom type guard that checks if a decoded log is a MintEvent.
function isMintEvent(event: unknown): event is MintEvent {
    return (
        event !== null &&
        typeof event === 'object' &&
        'eventName' in event &&
        (event as { eventName: string }).eventName === 'Mint'
    );
}

export const packService = {
    createMintConfig: async (packType = 'scrawny'): Promise<bigint> => {
        try {
            console.log('Creating mint config with account:', account.address);
            console.log('PHYT_CARDS address:', PHYT_CARDS);
            console.log('MINTER address:', MINTER);

            const now = Math.floor(Date.now() / 1000);
            const startTime = BigInt(now);
            const endTime = BigInt(now + 7 * 24 * 60 * 60); // End in 7 days

            console.log('Timestamps:', {
                now,
                startTime,
                endTime
            });

            const computedMerkleRoot = await getMerkleRoot();
            console.log('Computed merkle root:', computedMerkleRoot);

            const packConfig =
                PackTypes.find((p) => p.id === packType) ?? PackTypes[0];
            const cardCount = packConfig.cardCount || 1;
            const price = parseEther(packConfig.price);

            const simulation = await publicClient.simulateContract({
                address: MINTER,
                abi: MinterAbi as Abi,
                functionName: 'newMintConfig',
                args: [
                    PHYT_CARDS,
                    BigInt(cardCount), // cards per pack
                    1n, // max total packs
                    price, // price per pack
                    1n, // max packs per address
                    true, // whitelist enabled
                    computedMerkleRoot, // merkle root
                    startTime, // start time (now - 1 min)
                    endTime // end time (7 days)
                ],
                account
            });

            console.log('Contract simulation successful');

            const hash = await walletClient.writeContract(simulation.request);
            console.log('Transaction hash:', hash);

            const receipt = await publicClient.waitForTransactionReceipt({
                hash
            });
            console.log('Transaction receipt:', receipt);

            if (receipt.status === 'reverted') {
                // Try to decode error if possible
                if (receipt.logs.length > 0) {
                    try {
                        const decodedLogs = receipt.logs.map((log) =>
                            decodeEventLog({
                                abi: MinterAbi as Abi,
                                data: log.data,
                                topics: log.topics
                            })
                        );
                        console.log('Decoded logs:', decodedLogs);
                    } catch (error) {
                        console.error('Error decoding logs:', error);
                    }
                }
                throw new Error(
                    'Transaction reverted - check roles and parameters'
                );
            }

            const totalConfigs = (await publicClient.readContract({
                address: MINTER,
                abi: MinterAbi as Abi,
                functionName: 'mintConfigIdCounter'
            })) as bigint;

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

    getPackPrice: (packType = 'scrawny'): bigint => {
        const packConfig =
            PackTypes.find((p) => p.id === packType) ?? PackTypes[0];
        return parseEther(packConfig.price);
    },

    generateCardRarities: (packType = 'scrawny'): CardRarity[] => {
        const packConfig =
            PackTypes.find((p) => p.id === packType) ?? PackTypes[0];
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

        rarities.push(...guaranteedRarities);

        const remainingSlots = cardCount - rarities.length;
        for (let i = 0; i < remainingSlots; i++) {
            rarities.push(metadataService.generateRarity());
        }

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

    purchasePack: async (
        data: PackPurchaseNotif & { packType?: string }
    ): Promise<TokenURIMetadata[]> => {
        const { buyerId, hash, packPrice, packType = 'scrawny' } = data;

        console.log(packType);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'reverted') {
            throw new Error('Transaction failed');
        }

        try {
            const mintEvents = receipt.logs
                .map((log) => {
                    try {
                        const decoded = decodeEventLog({
                            abi: MinterAbi as Abi,
                            data: log.data,
                            topics: log.topics
                        });
                        // First cast to unknown, then to MintEvent
                        return decoded as unknown as MintEvent;
                    } catch {
                        return null;
                    }
                })
                // Use the custom type guard instead of an inline type predicate.
                .filter(isMintEvent);

            if (mintEvents.length === 0) {
                throw new Error('No mint event found in transaction');
            }

            const mintEvent = mintEvents[0];

            const cardRarities = packService.generateCardRarities(packType);

            return await db.transaction(async (tx) => {
                const [packPurchase] = await tx
                    .insert(pack_purchases)
                    .values({
                        buyer_id: buyerId,
                        purchase_price: formatEther(BigInt(packPrice)),
                        pack_type: packType
                    })
                    .returning();

                const cardsMetadata = [];
                const cardsIds = [];

                for (let i = 0; i < cardRarities.length; i++) {
                    const tokenId = Number(mintEvent.args.firstTokenId) + i;
                    const rarity = cardRarities[i];

                    const [card] = await tx
                        .insert(cards)
                        .values({
                            owner_id: buyerId,
                            pack_purchase_id: packPurchase.id,
                            token_id: tokenId,
                            acquisition_type: 'mint'
                        })
                        .returning();

                    cardsIds.push(card.id);

                    const metadata =
                        await metadataService.generateMetadataWithRarity(
                            tokenId,
                            rarity
                        );
                    cardsMetadata.push(metadata);

                    await tx.insert(card_metadata).values({
                        token_id: tokenId,
                        runner_id: metadata.attributes[0].runner_id,
                        runner_name: metadata.attributes[0].runner_name,
                        rarity: metadata.attributes[0].rarity,
                        multiplier: metadata.attributes[0].multiplier,
                        image_url: metadata.image,
                        season: metadata.attributes[0].season
                    });

                    await tx.insert(transactions).values({
                        from_user_id: buyerId,
                        to_user_id: null,
                        card_id: card.id,
                        transaction_type: 'packPurchase',
                        price: formatEther(BigInt(packPrice)),
                        pack_purchases_id: packPurchase.id,
                        hash
                    });
                }
                console.log(cardsMetadata);
                return cardsMetadata;
            });
        } catch (error) {
            console.error('Pack purchase error:', error);
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Failed to purchase pack'
            );
        }
    }
};
