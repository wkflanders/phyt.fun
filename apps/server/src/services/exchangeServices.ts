import {
    Address,
    Hash,
    parseEther,
    formatEther,
    createPublicClient,
    createWalletClient,
    http
} from "viem";
import { walletClient, publicClient } from '../lib/viemClient';
import { ExchangeAbi } from "@phyt/contracts";
import {
    Order,
    ValidationError,
    CreateListingParams,
    CreateOfferParams
} from "@phyt/types";
import { marketplaceService } from "./marketplaceServices";
import { privateKeyToAccount } from "viem/accounts";

if (!process.env.EXCHANGE_ADDRESS || !process.env.PHYT_CARDS_ADDRESS) {
    throw new Error('Missing contract addresses in environment variables');
}

const EXCHANGE_ADDRESS = process.env.EXCHANGE_ADDRESS as Address;
const PHYT_CARDS_ADDRESS = process.env.PHYT_CARDS_ADDRESS as Address;

export const exchangeService = {
    async executeSellOrder(order: Order, buyerSignature: string): Promise<Hash> {
        try {
            const { request } = await publicClient.simulateContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'sell',
                args: [
                    order,
                    buyerSignature,
                    order.token_id,
                    [] // Empty merkle proof since we're not using whitelist
                ],
                value: order.price // Include ETH value for the purchase
            });

            const hash = await walletClient.writeContract(request);
            return hash;
        } catch (error) {
            console.error('Failed to execute sell order:', error);
            throw new Error('Failed to execute sell order on exchange');
        }
    },

    async executeBuyOrder(order: Order, sellerSignature: string, burnAfterPurchase: boolean = false): Promise<Hash> {
        try {
            const { request } = await publicClient.simulateContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'buy',
                args: [
                    order,
                    sellerSignature,
                    burnAfterPurchase
                ],
                value: order.price // Include ETH value for the purchase
            });

            const hash = await walletClient.writeContract(request);
            return hash;
        } catch (error) {
            console.error('Failed to execute buy order:', error);
            throw new Error('Failed to execute buy order on exchange');
        }
    },

    async executeBatchBuy(
        sellOrders: Order[],
        sellerSignatures: string[],
        burnAfterPurchase: boolean = false
    ): Promise<Hash> {
        try {
            const totalValue = sellOrders.reduce((sum, order) => sum + order.price, 0n);

            const { request } = await publicClient.simulateContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'batchBuy',
                args: [
                    sellOrders,
                    sellerSignatures,
                    burnAfterPurchase
                ],
                value: totalValue
            });

            const hash = await walletClient.writeContract(request);
            return hash;
        } catch (error) {
            console.error('Failed to execute batch buy:', error);
            throw new Error('Failed to execute batch buy on exchange');
        }
    },

    async executeBatchSell(
        buyOrders: Order[],
        buyerSignatures: string[],
        tokenIds: bigint[],
        merkleProofs: `0x${string}`[][]
    ): Promise<Hash> {
        try {
            const { request } = await publicClient.simulateContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'batchSell',
                args: [
                    buyOrders,
                    buyerSignatures,
                    tokenIds,
                    merkleProofs
                ]
            });

            const hash = await walletClient.writeContract(request);
            return hash;
        } catch (error) {
            console.error('Failed to execute batch sell:', error);
            throw new Error('Failed to execute batch sell on exchange');
        }
    },

    async cancelOrder(order: Order): Promise<Hash> {
        try {
            const { request } = await publicClient.simulateContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'cancelOrder',
                args: [order]
            });

            const hash = await walletClient.writeContract(request);
            return hash;
        } catch (error) {
            console.error('Failed to cancel order:', error);
            throw new Error('Failed to cancel order on exchange');
        }
    },

    async batchCancelOrders(orders: Order[]): Promise<Hash> {
        try {
            const { request } = await publicClient.simulateContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'batchCancelOrders',
                args: [orders]
            });

            const hash = await walletClient.writeContract(request);
            return hash;
        } catch (error) {
            console.error('Failed to batch cancel orders:', error);
            throw new Error('Failed to batch cancel orders on exchange');
        }
    },

    async isOrderValid(order: Order): Promise<boolean> {
        try {
            // Check if order is cancelled or filled
            const cancelled = await publicClient.readContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'cancelledOrFilled',
                args: [order]
            });

            if (cancelled) {
                return false;
            }

            // Check if the collection is whitelisted
            const whitelisted = await publicClient.readContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'whitelistedCollections',
                args: [order.collection]
            });

            if (!whitelisted) {
                return false;
            }

            // Check order expiration
            if (order.expiration_time < BigInt(Math.floor(Date.now() / 1000))) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to check order validity:', error);
            throw new Error('Failed to validate order');
        }
    }
};