import { writeContract, simulateContract } from 'wagmi/actions';

import { keccak256, encodeAbiParameters, concat } from 'viem';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';

import { ExchangeAbi } from '@phyt/contracts';
import { UUIDv7, Order } from '@phyt/types';

import { env } from '@/env';
import { config } from '@/lib/wagmi';

import type { AbiParameter } from 'viem';

export function useExchange() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();

    const EXCHANGE_DOMAIN = {
        name: 'Phyt Exchange',
        version: '1',
        chainId: 84532, // Base Sepolia
        verifyingContract: env.NEXT_PUBLIC_EXCHANGE_ADDRESS as `0x${string}`
    } as const;

    const ORDER_PARAMETERS: { Order: AbiParameter[] } = {
        Order: [
            { name: 'trader', type: 'address' },
            { name: 'side', type: 'uint8' },
            { name: 'collection', type: 'address' },
            { name: 'token_id', type: 'uint256' },
            { name: 'payment_token', type: 'address' },
            { name: 'price', type: 'uint256' },
            { name: 'expiration_time', type: 'uint256' },
            { name: 'merkle_root', type: 'bytes32' },
            { name: 'salt', type: 'uint256' }
        ]
    };

    function generateOrderHash(order: Order): `0x${string}` {
        const verifyingContract = EXCHANGE_DOMAIN.verifyingContract;

        // Encode the domain separator
        const domainSeparator = keccak256(
            encodeAbiParameters(
                [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' }
                ],
                [
                    EXCHANGE_DOMAIN.name,
                    EXCHANGE_DOMAIN.version,
                    BigInt(EXCHANGE_DOMAIN.chainId),
                    verifyingContract
                ]
            )
        );

        // Encode the order struct
        const orderHash = keccak256(
            encodeAbiParameters(ORDER_PARAMETERS.Order, [
                order.trader,
                order.side,
                order.collection,
                order.tokenId,
                order.paymentToken,
                order.price,
                order.expirationTime,
                order.merkleRoot,
                order.salt
            ])
        );

        return keccak256(concat(['0x1901', domainSeparator, orderHash]));
    }

    // Sign a sell order (listing)
    const signSellOrder = async ({
        tokenId,
        takePrice,
        expiration
    }: {
        tokenId: number;
        takePrice: bigint;
        expiration: string;
    }) => {
        if (!walletClient || !address) {
            throw new Error('Wallet not connected');
        }
        if (!env.NEXT_PUBLIC_EXCHANGE_ADDRESS) {
            throw new Error('Missing environment variable: EXCHANGE_ADDRESS');
        }
        if (!env.NEXT_PUBLIC_PHYT_CARDS_ADDRESS) {
            throw new Error('Missing environment variable: PHYT_CARDS_ADDRESS');
        }

        const order: Order = {
            trader: address,
            side: 'sell', // sell
            collection: env.NEXT_PUBLIC_PHYT_CARDS_ADDRESS as `0x${string}`,
            tokenId: BigInt(tokenId),
            paymentToken: '0x0000000000000000000000000000000000000000', // ETH
            price: takePrice,
            expirationTime: BigInt(new Date(expiration).getTime()),
            merkleRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
            salt: BigInt(Math.floor(Math.random() * 1000000))
        };

        const signature = await walletClient.signTypedData({
            domain: {
                ...EXCHANGE_DOMAIN
            },
            types: ORDER_PARAMETERS,
            primaryType: 'Order',
            message: order as unknown as Record<string, unknown>
        });

        return {
            order,
            signature,
            orderHash: generateOrderHash(order)
        };
    };

    // Sign a buy order (bid)
    const signBuyOrder = async ({
        listingId,
        cardId,
        bidAmount
    }: {
        listingId: UUIDv7;
        cardId: UUIDv7;
        bidAmount: bigint;
    }) => {
        if (!walletClient || !address) {
            throw new Error('Wallet not connected');
        }

        const order: Order = {
            trader: address,
            side: 'buy', // buy
            collection: env.NEXT_PUBLIC_PHYT_CARDS_ADDRESS as `0x${string}`,
            tokenId: BigInt(cardId),
            paymentToken: '0x0000000000000000000000000000000000000000', // ETH
            price: bidAmount,
            expirationTime: BigInt(
                Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
            ),
            merkleRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
            salt: BigInt(Math.floor(Math.random() * 1000000))
        };

        const signature = await walletClient.signTypedData({
            domain: {
                ...EXCHANGE_DOMAIN
            },
            types: ORDER_PARAMETERS,
            primaryType: 'Order',
            message: order as unknown as Record<string, unknown>
        });

        return {
            order,
            signature,
            orderHash: generateOrderHash(order)
        };
    };

    // Execute an immediate purchase at the take price
    const executeBuy = async ({
        sellOrder,
        signature
    }: {
        sellOrder: Order;
        signature: string;
    }) => {
        if (!address) throw new Error('Wallet not connected');

        const { request } = await simulateContract(config, {
            address: env.NEXT_PUBLIC_EXCHANGE_ADDRESS as `0x${string}`,
            abi: ExchangeAbi,
            functionName: 'buy',
            args: [sellOrder, signature, false],
            value: sellOrder.price,
            account: address
        });

        const hash = await writeContract(config, request);
        if (!publicClient) {
            throw new Error('Public client not available');
        }
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return { hash, receipt };
    };

    // Execute a match between a bid and ask
    const executeMatch = async ({
        sellOrder,
        buyOrder,
        sellerSignature,
        buyerSignature
    }: {
        sellOrder: Order;
        buyOrder: Order;
        sellerSignature: string;
        buyerSignature: string;
    }) => {
        if (!address) throw new Error('Wallet not connected');

        const { request } = await simulateContract(config, {
            address: env.NEXT_PUBLIC_EXCHANGE_ADDRESS as `0x${string}`,
            abi: ExchangeAbi,
            functionName: 'matchOrders',
            args: [sellOrder, buyOrder, sellerSignature, buyerSignature],
            value: buyOrder.price,
            account: address
        });

        const hash = await writeContract(config, request);
        if (!publicClient) {
            throw new Error('Public client not available');
        }
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return { hash, receipt };
    };

    return {
        signSellOrder,
        signBuyOrder,
        executeBuy,
        executeMatch
    };
}
