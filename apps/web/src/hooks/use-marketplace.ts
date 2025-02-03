import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getListings, getListingsByRunner } from '@/queries/marketplace';
import { RunnerListing } from '@phyt/types';
import { useMemo } from 'react';

interface ListingFilters {
    status?: 'active' | 'completed';
    sort?: 'price_asc' | 'price_desc' | 'created_at';
    minPrice?: string;
    maxPrice?: string;
}

interface ListingResponse {
    listings: RunnerListing[];
    cursor: string | null;
}

interface GroupedListing {
    runnerId: number;
    runnerName: string;
    avatarUrl?: string;
    listings: RunnerListing[];
    floorPrice: bigint;
    totalListings: number;
}

import { useInfiniteQuery } from '@tanstack/react-query';
import { getListings, getListingsByRunner } from '@/queries/marketplace';
import { RunnerListing } from '@phyt/types';
import { useMemo } from 'react';

export function useListings(filters?: {
    status?: 'active' | 'completed';
    sort?: 'price_asc' | 'price_desc' | 'created_at';
    minPrice?: string;
    maxPrice?: string;
}) {
    return useInfiniteQuery({
        queryKey: ['listings', filters],
        queryFn: ({ pageParam }) => getListings({
            cursor: pageParam,
            ...filters
        }),
        getNextPageParam: (lastPage) => lastPage.cursor,
    });
}

export function useRunnerListings(runnerId?: number) {
    return useInfiniteQuery({
        queryKey: ['listings', 'runner', runnerId],
        queryFn: ({ pageParam }) => getListingsByRunner(runnerId!, pageParam),
        getNextPageParam: (lastPage) => lastPage.cursor,
        enabled: !!runnerId,
    });
}

export function useGroupedListings() {
    const {
        data,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage
    } = useListings();

    const groupedListings = useMemo(() => {
        if (!data?.pages) return {};

        return data.pages.reduce((acc, page) => {
            page.listings.forEach((listing) => {
                const runnerId = listing.metadata.runner_id;
                if (!acc[runnerId]) {
                    acc[runnerId] = {
                        runnerId,
                        runnerName: listing.metadata.runner_name,
                        avatarUrl: listing.metadata.runner_avatar,
                        listings: [],
                        floorPrice: BigInt(listing.order.price),
                        totalListings: 0,
                    };
                }

                acc[runnerId].listings.push(listing);
                acc[runnerId].totalListings++;

                if (BigInt(listing.order.price) < acc[runnerId].floorPrice) {
                    acc[runnerId].floorPrice = BigInt(listing.order.price);
                }
            });
            return acc;
        }, {} as Record<number, RunnerListing>);
    }, [data]);

    return {
        groupedListings,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage
    };
}

export function useGroupedListings() {
    const { data: listings, isLoading, error, fetchNextPage } = useListings();

    const groupedListings = useMemo(() => {
        if (!listings?.pages) return {};

        return listings.pages.reduce((acc, page) => {
            page.listings.forEach((listing) => {
                const runnerId = listing.metadata.runner_id;
                if (!acc[runnerId]) {
                    acc[runnerId] = {
                        runnerId,
                        runnerName: listing.metadata.runner_name,
                        avatarUrl: listing.metadata.runner_avatar,
                        listings: [],
                        floorPrice: BigInt(listing.order.price),
                        totalListings: 0,
                    };
                }

                acc[runnerId].listings.push(listing);
                acc[runnerId].totalListings++;

                const price = BigInt(listing.order.price);
                if (price < acc[runnerId].floorPrice) {
                    acc[runnerId].floorPrice = price;
                }
            });
            return acc;
        }, {} as Record<number, GroupedListing>);
    }, [listings]);

    return {
        groupedListings,
        isLoading,
        error,
        hasNextPage: listings?.pages[listings.pages.length - 1]?.nextPage,
        fetchNextPage,
    };
}