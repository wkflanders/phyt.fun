import { useQuery, useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useToast } from './use-toast';
import { useExchange } from './use-exchange';
import type { RunnerListing, Order } from '@phyt/types';

interface ListingFilters {
    minPrice?: string;
    maxPrice?: string;
    rarity?: string[];
    sort?: 'price_asc' | 'price_desc' | 'created_at';
}

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

            const response = await fetch(`/api/marketplace/listings?${searchParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }
            return response.json() as Promise<RunnerListing[]>;
        }
    });
}

// Create a new listing
export function useCreateListing() {
    const { toast } = useToast();
    const { signOrder } = useExchange();
    const { address } = useAccount();

    return useMutation({
        mutationFn: async ({ cardId, price }: { cardId: number; price: string; }) => {
            if (!address) throw new Error('Wallet not connected');

            // 1. Sign the sell order with the user's wallet
            const { order, signature, orderHash } = await signOrder({
                cardId,
                price: parseEther(price)
            });

            // 2. Store the listing in the database
            const response = await fetch('/api/marketplace/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order,
                    signature,
                    orderHash
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create listing');
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
                description: "Your card has been listed for sale",
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
            const order: Order = {
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
                order,
                signature: listing.signature,
                burnAfterPurchase: false
            });

            // Notify backend of successful purchase
            const response = await fetch(`/api/marketplace/listings/${listing.id}/complete`, {
                method: 'POST',
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

// Get user's active listings
export function useUserListings() {
    const { address } = useAccount();

    return useQuery({
        queryKey: ['user-listings', address],
        queryFn: async () => {
            if (!address) throw new Error('Wallet not connected');

            const response = await fetch(`/api/marketplace/users/${address}/listings`);
            if (!response.ok) {
                throw new Error('Failed to fetch user listings');
            }
            return response.json() as Promise<RunnerListing[]>;
        },
        enabled: !!address
    });
}