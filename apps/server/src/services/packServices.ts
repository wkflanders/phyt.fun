import { createPublicClient, createWalletClient, http, decodeEventLog, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MinterAbi } from '@phyt/contracts';
import { db, transactions, cards, card_metadata, pack_purchases } from '@phyt/database';
import { PackPurchaseError, MintEvent, PackPurchaseInput, PackPurchaseResponse, TokenURIMetadata } from '@phyt/types';
import { metadataService } from './metadataServices';

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
                    parseEther("0.0001"),           // price in ETH
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
    purchasePack: async (data: PackPurchaseInput): Promise<PackPurchaseResponse> => {
        const { buyerId, buyerAddress } = data;

        try {
            // Create a new mint config for this purchase
            const mintConfigId = await packService.createMintConfig();

            const packPrice = await publicClient.readContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'getPackPrice',
                args: [mintConfigId]
            });

            const { request } = await publicClient.simulateContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'mint',
                args: [mintConfigId, []],
                value: packPrice,
                account: buyerAddress as `0x${string}`
            }).catch(error => {
                throw new PackPurchaseError(
                    'Failed to simulate transaction',
                    'SIMULATION_FAILED',
                    error
                );
            });;

            const hash = await walletClient.writeContract(request)
                .catch(error => {
                    throw new PackPurchaseError(
                        'Failed to execute transaction',
                        'TRANSACTION_FAILED',
                        error
                    );
                });
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

            return await db.transaction(async (tx) => {
                // Create pack purchase record
                const [packPurchase] = await tx.insert(pack_purchases).values({
                    buyer_id: buyerId,
                    purchase_price: Number(formatEther(packPrice))
                }).returning();

                // Create transaction record
                await tx.insert(transactions).values({
                    from_user_id: null, // Contract mint
                    to_user_id: buyerId,
                    transaction_type: 'packPurchase',
                    token_amount: Number(formatEther(packPrice))
                });

                // Create card records
                const cardPromises = [];
                const cardsMetadata: TokenURIMetadata[] = [];
                for (let tokenId = Number(mintEvent.args.firstTokenId);
                    tokenId <= Number(mintEvent.args.lastTokenId);
                    tokenId++) {

                    const metadata: TokenURIMetadata = await metadataService.generateMetadata(tokenId);
                    cardsMetadata.push(metadata);

                    cardPromises.push(
                        tx.insert(cards).values({
                            owner_id: buyerId,
                            pack_purchase_id: packPurchase.id,
                            acquisition_type: 'mint',
                            token_id: tokenId
                        })
                    );
                    cardPromises.push(
                        tx.insert(card_metadata).values({
                            token_id: tokenId,
                            runner_id: metadata.attributes[0].runner_id,
                            runner_name: metadata.attributes[0].runner_name,
                            rarity: metadata.attributes[0].rarity,
                            multiplier: metadata.attributes[0].multiplier,
                            image_url: metadata.image,
                        })
                    );
                }
                await Promise.all(cardPromises);

                return {
                    success: true,
                    hash,
                    packPurchaseId: packPurchase.id,
                    mintConfigId: Number(mintEvent.args.mintConfigId),
                    firstTokenId: Number(mintEvent.args.firstTokenId),
                    lastTokenId: Number(mintEvent.args.lastTokenId),
                    price: formatEther(packPrice),
                    cardsMetadata
                };
            }).catch(error => {
                throw new PackPurchaseError(
                    'Database operation failed',
                    'DATABASE_ERROR',
                    error
                );
            });

        } catch (error) {
            if (error instanceof PackPurchaseError) {
                throw error;
            }
            throw new PackPurchaseError(
                'Pack purchase failed',
                'UNKNOWN_ERROR',
                error
            );
        }
    }
};