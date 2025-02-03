import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { writeContract, simulateContract } from 'wagmi/actions';
import { ExchangeAbi } from '@phyt/contracts';
import { config } from '@/lib/wagmi';
import { useToast } from './use-toast';
import { Order } from '@phyt/types';

const EXCHANGE_ADDRESS = process.env.EXCHANGE_ADDRESS as `0x${string}`;
const PHYT_CARDS_ADDRESS = process.env.PHYT_CARDS_ADDRESS as `0x${string}`;

export interface UseExchangeConfig {
    onSuccess?: (hash: `0x${string}`) => void;
    onError?: (error: Error) => void;
}

export const EXCHANGE_DOMAIN = {
    name: 'Phyt Exchange',
    version: '1',
    chainId: 84532, // Base Sepolia
    verifyingContract: EXCHANGE_ADDRESS,
} as const;

export const ORDER_TYPE = {
    Order: [
        { name: 'trader', type: 'address' },
        { name: 'side', type: 'uint8' },
        { name: 'collection', type: 'address' },
        { name: 'token_id', type: 'uint256' },
        { name: 'payment_token', type: 'address' },
        { name: 'price', type: 'uint256' },
        { name: 'expiration_time', type: 'uint256' },
        { name: 'merkle_root', type: 'bytes32' },
        { name: 'salt', type: 'uint256' },
    ],
} as const;

export function useExchange() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const { toast } = useToast();

    const signOrder = async (order: Order) => {
        if (!walletClient) throw new Error('Wallet not connected');

        const signature = await walletClient.signTypedData({
            domain: EXCHANGE_DOMAIN,
            types: ORDER_TYPE,
            primaryType: 'Order',
            message: order,
        });

        return signature;
    };

    const executeBuy = async (order: Order, signature: string, burnAfterPurchase: boolean = false) => {
        if (!address) throw new Error('Wallet not connected');

        const { request } = await simulateContract(config, {
            address: EXCHANGE_ADDRESS,
            abi: ExchangeAbi,
            functionName: 'buy',
            args: [order, signature, burnAfterPurchase],
            value: order.price,
            account: address,
        });

        const hash = await writeContract(config, request);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });

        return { hash, receipt };
    };

    const executeSell = async (order: Order, signature: string, tokenId: bigint, merkleProof: `0x${string}`[]) => {
        if (!address) throw new Error('Wallet not connected');

        const { request } = await simulateContract(config, {
            address: EXCHANGE_ADDRESS,
            abi: ExchangeAbi,
            functionName: 'sell',
            args: [order, signature, tokenId, merkleProof],
            account: address,
        });

        const hash = await writeContract(config, request);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });

        return { hash, receipt };
    };

    const cancelOrder = async (order: Order) => {
        if (!address) throw new Error('Wallet not connected');

        const { request } = await simulateContract(config, {
            address: EXCHANGE_ADDRESS,
            abi: ExchangeAbi,
            functionName: 'cancelOrder',
            args: [order],
            account: address,
        });

        const hash = await writeContract(config, request);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });

        return { hash, receipt };
    };

    return {
        signOrder,
        executeBuy,
        executeSell,
        cancelOrder,
    };
}