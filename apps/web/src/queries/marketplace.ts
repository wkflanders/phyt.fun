import { ApiError, type Listing, type Order } from '@phyt/types';
import { handleApiError } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const LISTINGS_QUERY_KEY = 'listings';
export const getListingsQueryKey = (filters?: ListingsFilters) => [LISTINGS_QUERY_KEY, filters];

export interface ListingsFilters {
    status?: 'active' | 'completed';
    sort?: 'price_asc' | 'price_desc' | 'created_at';
    minPrice?: string;
    maxPrice?: string;
    cursor?: string;
}

export interface ListingsResponse {
    listings: Listing[];
    cursor: string | null;
    hasNextPage: boolean;
}

export async function getListings(params: ListingsFilters = {}): Promise<ListingsResponse> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.status) searchParams.set('status', params.status);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.minPrice) searchParams.set('minPrice', params.minPrice);
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice);

    const response = await fetch(
        `${API_URL}/marketplace/listings?${searchParams.toString()}`,
        { credentials: 'include' }
    );

    if (!response.ok) {
        throw await handleApiError(response);
    }

    return response.json();
}

export async function getListingsByRunner(
    runnerId: number,
    cursor?: string
): Promise<ListingsResponse> {
    const searchParams = new URLSearchParams();
    if (cursor) searchParams.set('cursor', cursor);

    const response = await fetch(
        `${API_URL}/marketplace/listings/runner/${runnerId}?${searchParams.toString()}`,
        { credentials: 'include' }
    );

    if (!response.ok) {
        throw await handleApiError(response);
    }

    return response.json();
}

export interface CreateListingPayload {
    order: Order;
    signature: string;
    orderHash: string;
}

export async function createListing(data: CreateListingPayload): Promise<Listing> {
    const response = await fetch(`${API_URL}/marketplace/listings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw await handleApiError(response);
    }

    return response.json();
}

export async function updateListing(
    listingId: string,
    data: {
        status: 'completed' | 'cancelled';
        transactionHash?: string;
    }
): Promise<Listing> {
    const response = await fetch(`${API_URL}/marketplace/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw await handleApiError(response);
    }

    return response.json();
}