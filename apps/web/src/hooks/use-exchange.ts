import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { writeContract, simulateContract } from 'wagmi/actions';
import {
    keccak256,
    encodeAbiParameters,
    concat,
    type AbiParameter
} from 'viem';
import { config } from '@/lib/wagmi';
import { ExchangeAbi } from '@phyt/contracts';
import { Order } from '@phyt/types';

const EXCHANGE_ADDRESS =
    process.env.EXCHANGE_ADDRESS! ||
    '0x50480bDEF93a26f45B33aa2c26A00108bbC358c3';
const PHYT_CARDS_ADDRESS =
    process.env.PHYT_CARDS_ADDRESS! ||
    '0x8a1c168113088F7414fc637817859Afa87fb4244';

export function useExchange() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();

    const EXCHANGE_DOMAIN = {
        name: 'Phyt Exchange',
        version: '1',
        chainId: 84532, // Base Sepolia
        verifyingContract: EXCHANGE_ADDRESS
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
        const verifyingContract =
            EXCHANGE_DOMAIN.verifyingContract || process.env.EXCHANGE_ADDRESS;
        if (!verifyingContract) {
            throw new Error(
                'Missing verifying contract address for EXCHANGE_DOMAIN'
            );
        }

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
                    verifyingContract as `0x${string}`
                ]
            )
        );

        // Encode the order struct
        const orderHash = keccak256(
            encodeAbiParameters(ORDER_PARAMETERS.Order, [
                order.trader,
                order.side,
                order.collection,
                order.token_id,
                order.payment_token,
                order.price,
                order.expiration_time,
                order.merkle_root,
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
        if (!EXCHANGE_ADDRESS) {
            throw new Error('Missing environment variable: EXCHANGE_ADDRESS');
        }
        if (!PHYT_CARDS_ADDRESS) {
            throw new Error('Missing environment variable: PHYT_CARDS_ADDRESS');
        }

        const order: Order = {
            trader: address,
            side: 1, // sell
            collection: PHYT_CARDS_ADDRESS as `0x${string}`,
            token_id: BigInt(tokenId),
            payment_token: '0x0000000000000000000000000000000000000000', // ETH
            price: takePrice,
            expiration_time: BigInt(new Date(expiration).getTime()),
            merkle_root:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
            salt: BigInt(Math.floor(Math.random() * 1000000))
        };

        const signature = await walletClient.signTypedData({
            domain: {
                ...EXCHANGE_DOMAIN,
                verifyingContract: EXCHANGE_ADDRESS as `0x${string}`
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
        listingId: number;
        cardId: number;
        bidAmount: bigint;
    }) => {
        if (!walletClient || !address) {
            throw new Error('Wallet not connected');
        }

        const order: Order = {
            trader: address,
            side: 0, // buy
            collection: PHYT_CARDS_ADDRESS as `0x${string}`,
            token_id: BigInt(cardId),
            payment_token: '0x0000000000000000000000000000000000000000', // ETH
            price: bidAmount,
            expiration_time: BigInt(
                Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
            ),
            merkle_root:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
            salt: BigInt(Math.floor(Math.random() * 1000000))
        };

        const signature = await walletClient.signTypedData({
            domain: {
                ...EXCHANGE_DOMAIN,
                verifyingContract: EXCHANGE_ADDRESS as `0x${string}`
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
            address: EXCHANGE_ADDRESS as `0x${string}`,
            abi: ExchangeAbi,
            functionName: 'buy',
            args: [sellOrder, signature, false],
            value: sellOrder.price,
            account: address
        });

        const hash = await writeContract(config, request);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });

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
            address: EXCHANGE_ADDRESS as `0x${string}`,
            abi: ExchangeAbi,
            functionName: 'matchOrders',
            args: [sellOrder, buyOrder, sellerSignature, buyerSignature],
            value: buyOrder.price,
            account: address
        });

        const hash = await writeContract(config, request);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });

        return { hash, receipt };
    };

    return {
        signSellOrder,
        signBuyOrder,
        executeBuy,
        executeMatch
    };
}
