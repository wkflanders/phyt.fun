import { createPublicClient, createWalletClient, http, decodeEventLog, parseEther, formatEther, createTestClient, Chain } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MinterAbi } from '@phyt/contracts';
import { db, transactions, cards, card_metadata, pack_purchases } from '@phyt/database';
import { MintEvent, PackPurchaseNotif, PackPurchaseResponse, TokenURIMetadata, } from '@phyt/types';
import { metadataService } from './metadataServices';

if (!process.env.MINTER_ADDRESS || !process.env.PHYT_CARDS_ADDRESS) {
    throw new Error('Missing contract addresses in environment variables');
}

const MINTER = process.env.MINTER_ADDRESS as `0x${string}`;
const PHYT_CARDS = process.env.PHYT_CARDS_ADDRESS as `0x${string}`;

const localChain: Chain = {
    ...baseSepolia,
    id: 84532,
    name: 'Anvil Local',
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545'],
        },
        public: {
            http: ['http://127.0.0.1:8545'],
        }
    }
};

const transport = http('http://127.0.0.1:8545');

const publicClient = createPublicClient({
    chain: localChain,
    transport,
});


if (!process.env.SERVER_PRIVATE_KEY) {
    throw new Error('Missing SERVER_PRIVATE_KEY in environment variables');
}

const account = privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account,
    chain: localChain,
    transport,
});

export const packService = {
    createMintConfig: async () => {
        try {
            console.log('Chain ID:', await publicClient.getChainId());
            console.log('Creating mint config with account:', account.address);
            console.log('PHYT_CARDS address:', PHYT_CARDS);
            console.log('MINTER address:', MINTER);

            // Verify role
            const MINT_CONFIG_ROLE = await publicClient.readContract({
                address: MINTER,
                abi: MinterAbi,
                functionName: 'MINT_CONFIG_ROLE'
            });

            const hasRole = await publicClient.readContract({
                address: MINTER,
                abi: MinterAbi,
                functionName: 'hasRole',
                args: [MINT_CONFIG_ROLE, account.address]
            });

            console.log('Account has MINT_CONFIG_ROLE:', hasRole);

            const now = Math.floor(Date.now() / 1000);
            const startTime = BigInt(now - 1000);
            const endTime = BigInt(now + (1000 * 24 * 60 * 60));

            if (!hasRole) {
                throw new Error(`Account \${account.address} does not have MINT_CONFIG_ROLE`);
            }

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
                    false,
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
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
                    purchase_price: Number(formatEther(packPrice))
                }).returning();

                // Create transaction record
                await tx.insert(transactions).values({
                    from_user_id: null,
                    to_user_id: buyerId,
                    transaction_type: 'packPurchase',
                    token_amount: Number(formatEther(packPrice)),
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
                    txHash: hash,
                    packPurchaseId: packPurchase.id
                };
            });
        } catch (error) {
            console.error('Pack purchase error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to purchase pack');
        }
    }
};;