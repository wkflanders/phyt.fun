import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useToast } from './use-toast';
import { useExchange } from './use-exchange';
import type { RunnerListing, Order, User } from '@phyt/types';

interface ListingFilters {
    minPrice?: string;
    maxPrice?: string;
    rarity?: string[];
    sort?: 'price_asc' | 'price_desc' | 'created_at';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Fetch active listings
export function useListings(filters?: ListingFilters) {
    return useQuery({
        queryKey: ['listings', filters],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (filters?.minPrice) searchParams.append('minPrice', filters.minPrice);
            if (filters?.maxPrice) searchParams.append('maxPrice', filters.maxPrice);
            if (filters?.rarity) filters.rarity.forEach(r => searchParams.append('rarity', r));
            if (filters?.sort) searchParams.append('sort', filters.sort);

            const response = await fetch(`${API_URL}/marketplace/listings?${searchParams.toString()}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }
            return response.json() as Promise<RunnerListing[]>;
        }
    });
}

export const useOpenBids = (cardId: number) => {
    return useQuery({
        queryKey: ['openBids', cardId],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/marketplace/cards/${cardId}/open-bids`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to fetch open bids');
            return res.json();
        }
    });
};

export const useUserBids = (userId: string) => {
    return useQuery({
        queryKey: ['userBids', userId],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/marketplace/users/${userId}/bids`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to fetch user bids');
            return res.json();
        },
        enabled: !!userId
    });
};

export const useAcceptOpenBid = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bidId, transactionHash }: { bidId: number; transactionHash: string; }) => {
            const res = await fetch(`${API_URL}/marketplace/open-bids/${bidId}/accept`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionHash })
            });
            if (!res.ok) throw new Error('Failed to accept bid');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            queryClient.invalidateQueries({ queryKey: ['openBids'] });
        }
    });
};

// Create a new listing
export function useCreateListing(user: User) {
    const { toast } = useToast();
    const { signSellOrder } = useExchange();
    const { address } = useAccount();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            cardId,
            takePrice,
            expiration, // added parameter
        }: {
            cardId: number;
            takePrice: bigint;
            expiration: string; // e.g. an ISO string or UNIX timestamp string
        }) => {
            if (!address) throw new Error('Wallet not connected');
            // Sign the sell order with the expiration value included.
            const { order, signature, orderHash } = await signSellOrder({
                cardId,
                takePrice,
                expiration, // pass expiration to  signing logic
            } as { cardId: number; takePrice: bigint; expiration: string; });

            // Send the auction listing to API, aligning with the validation schema.
            const response = await fetch(`${API_URL}/marketplace/listings`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardId,
                    price: takePrice.toString(),
                    signature,
                    orderHash,
                    orderData: {
                        trader: order.trader,
                        side: order.side,
                        collection: order.collection,
                        token_id: order.token_id.toString(),
                        payment_token: order.payment_token,
                        price: order.price.toString(),
                        expiration_time: expiration,
                        merkle_root: order.merkle_root,
                        salt: order.salt.toString(),
                    },
                    user: user,
                }, (_key, value) => typeof value === 'bigint' ? value.toString() : value),

            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create listing');
            }

            return response.json();
        },
        onMutate: async (newListing) => {
            await queryClient.cancelQueries({ queryKey: ['listings'] });
            const previousListings = queryClient.getQueryData(['listings']);

            queryClient.setQueryData(['listings'], (old: any) =>
                Array.isArray(old) ? [...old, newListing] : [newListing]
            );

            return { previousListings };
        },
        onError: (error: Error) => {
            console.log(error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Your card has been listed for auction",
            });
        }
    });
}


// Purchase a listed card
export function usePurchaseListing() {
    const { toast } = useToast();
    const { executeBuy } = useExchange();
    const { address } = useAccount();

    return useMutation({
        mutationFn: async (listing: RunnerListing) => {
            if (!address) throw new Error('Wallet not connected');

            // Convert the listing data into the Order format
            const sellOrder: Order = {
                trader: listing.order.trader as `0x${string}`,
                side: 1, // 1 for sell
                collection: listing.order.collection as `0x${string}`,
                token_id: BigInt(listing.order.token_id),
                payment_token: listing.order.payment_token as `0x${string}`,
                price: BigInt(listing.order.price),
                expiration_time: BigInt(listing.order.expiration_time),
                merkle_root: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
                salt: BigInt(listing.order.salt)
            };

            // Execute the purchase transaction
            const { hash, receipt } = await executeBuy({
                sellOrder,
                signature: listing.signature
            });

            // Notify backend of successful purchase
            const response = await fetch(`${API_URL}/marketplace/listings/${listing.id}/complete`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hash,
                    buyer: address
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update listing status');
            }

            return { hash, receipt };
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Purchase completed successfully",
            });
        }
    });
}

// Place a bid on a listing
export function usePlaceBid() {
    const { toast } = useToast();
    const { signBuyOrder } = useExchange();
    const { address } = useAccount();

    return useMutation({
        mutationFn: async ({ listingId, cardId, bidAmount }: { listingId: number; cardId: number; bidAmount: bigint; }) => {
            if (!address) throw new Error('Wallet not connected');

            // 1. Sign the buy order
            const { order, signature, orderHash } = await signBuyOrder({
                listingId,
                cardId,
                bidAmount
            });

            // 2. Store the bid in the database
            const response = await fetch(`${API_URL}/marketplace/bids`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order,
                    signature,
                    orderHash
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to place bid');
            }

            return response.json();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Your bid has been placed",
            });
        }
    });
}

// Get user's active listings
export function useUserListings() {
    const { address } = useAccount();

    return useQuery({
        queryKey: ['user-listings', address],
        queryFn: async () => {
            if (!address) throw new Error('Wallet not connected');

            const response = await fetch(`${API_URL}/marketplace/users/${address}/listings`, {
                method: "GET",
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user listings');
            }
            return response.json() as Promise<RunnerListing[]>;
        },
        enabled: !!address
    });
}