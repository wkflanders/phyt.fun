import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getListings,
    getListingsByRunner,
    createListing,
    updateListing,
    getListingsQueryKey,
    type ListingsFilters
} from '@/queries/marketplace';
import { type Listing } from '@phyt/types';
import { useToast } from './use-toast';

export function useListings(filters?: ListingsFilters) {
    return useInfiniteQuery<{ listings: Listing[]; cursor?: string; }, Error>({
        queryKey: getListingsQueryKey(filters),
        queryFn: async ({ pageParam = undefined }) => {
            const response = await getListings({
                ...filters,
                cursor: pageParam as string | undefined
            });
            return { ...response, cursor: response.cursor ?? undefined };
        },
        getNextPageParam: (lastPage) => lastPage.cursor,
        initialPageParam: undefined,
    });
}
export function useRunnerListings(runnerId?: number) {
    return useInfiniteQuery<{ listings: Listing[]; cursor?: string; }, Error>({
        queryKey: ['listings', 'runner', runnerId],
        queryFn: async ({ pageParam = undefined }) => {
            const response = await getListingsByRunner(runnerId!, pageParam as string | undefined);
            return { listings: response.listings, cursor: response.cursor ?? undefined };
        },
        getNextPageParam: (lastPage) => lastPage.cursor,
        enabled: !!runnerId,
        initialPageParam: undefined,
    });
}

export function useCreateListing() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createListing,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            toast({
                title: "Success",
                description: "Listing created successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });
}

export function useUpdateListing() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ listingId, data }: { listingId: string, data: { status: "completed" | "cancelled"; transactionHash?: string | undefined; }; }) => updateListing(listingId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            toast({
                title: "Success",
                description: "Listing updated successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });
}