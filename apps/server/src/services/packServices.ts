import { createPublicClient, createWalletClient, http, decodeEventLog, parseEther, formatEther, Chain } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MinterAbi } from '@phyt/contracts';
import { db, transactions, cards, card_metadata, pack_purchases } from '@phyt/database';
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
            console.log('Chain ID:', await publicClient.getChainId());

            const computedMerkleRoot = await getMerkleRoot();

            const now = Math.floor(Date.now() / 1000);
            const startTime = BigInt(now + 1);
            const endTime = 0;

            const { request } = await publicClient.simulateContract({
                address: MINTER,
                abi: MinterAbi,
                functionName: 'newMintConfig',
                args: [
                    PHYT_CARDS,
                    1n,
                    1n,
                    parseEther("0.0001"),
                    1n,
                    true,
                    computedMerkleRoot,
                    startTime,
                    endTime,
                ],
                account,
            });

            console.log('Contract simulation successful');

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log('Transaction receipt:', receipt);

            const totalConfigs = await publicClient.readContract({
                address: MINTER,
                abi: MinterAbi,
                functionName: 'mintConfigIdCounter'
            });

            console.log('New mint config ID:', totalConfigs - 1n);
            return totalConfigs - 1n;
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

            return await db.transaction(async (tx) => {
                // Create pack purchase record
                const [packPurchase] = await tx.insert(pack_purchases).values({
                    buyer_id: buyerId,
                    purchase_price: Number(formatEther(BigInt(packPrice)))
                }).returning();

                // Create transaction record
                await tx.insert(transactions).values({
                    from_user_id: null,
                    to_user_id: buyerId,
                    transaction_type: 'packPurchase',
                    token_amount: Number(formatEther(BigInt(packPrice))),
                    hash: hash
                });

                // Create card records
                const cardPromises = [];
                const cardsMetadata: TokenURIMetadata[] = [];
                for (let tokenId = Number(mintEvent.args.firstTokenId);
                    tokenId <= Number(mintEvent.args.lastTokenId);
                    tokenId++) {

                    const metadata = await metadataService.generateMetadata(tokenId);
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
                    cardsMetadata,
                };
            });
        } catch (error) {
            console.error('Pack purchase error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to purchase pack');
        }
    }
};;