import { createPublicClient, createWalletClient, http, decodeEventLog } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MinterAbi, deployedAddresses } from '@phyt/contracts';
import { DatabaseError, NotFoundError, ValidationError, MintEvent } from '@phyt/types';

const { MINTER } = deployedAddresses;

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
    purchasePack: async (data: {
        mintConfigId: number;
        buyer: string;
        merkleProof?: string[];
    }) => {
        const { mintConfigId, buyer, merkleProof = [] } = data;

        try {
            const packPrice = await publicClient.readContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'getPackPrice',
                args: [BigInt(mintConfigId)]
            });

            const [
                collection,
                cardsPerPack,
                maxPacks,
                price,
                maxPacksPerAddress,
                requiresWhitelist,
                merkleRoot,
                startTimestamp,
                expirationTimestamp,
                totalMintedPacks,
                cancelled
            ] = await publicClient.readContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'getMintConfig',
                args: [BigInt(mintConfigId)]
            });

            if (cancelled) {
                throw new ValidationError('Mint config has been cancelled');
            }

            if (Number(startTimestamp) > Date.now() / 1000) {
                throw new ValidationError('Mint has not started yet');
            }

            if (Number(expirationTimestamp) !== 0 && Number(expirationTimestamp) < Date.now() / 1000) {
                throw new ValidationError('Mint has expired');
            }

            // Smart contract should handle this
            // if (Number(totalMintedPacks) >= Number(maxPacks)) {
            //     throw new ValidationError('All packs have been minted');
            // }

            // if (Number(maxPacksPerAddress) > 0) {
            //     const userMinted = await publicClient.readContract({
            //         address: MINTER as `0x${string}`,
            //         abi: MinterAbi,
            //         functionName: 'getAmountMintedPerAddress',
            //         args: [BigInt(mintConfigId), buyer as `0x${string}`]
            //     });

            //     if (Number(userMinted) >= Number(maxPacksPerAddress)) {
            //         throw new ValidationError('User has reached their minting limit');
            //     }
            // }

            const { request } = await publicClient.simulateContract({
                address: MINTER as `0x${string}`,
                abi: MinterAbi,
                functionName: 'mint',
                args: [BigInt(mintConfigId), merkleProof],
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