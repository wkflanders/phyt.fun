import { Listing, Order } from '@phyt/types';
import { handleApiError } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ListingsResponse {
    listings: Listing[];
    cursor: string | null;
}

interface ListingsParams {
    cursor?: string;
    status?: 'active' | 'completed';
    sort?: 'price_asc' | 'price_desc' | 'created_at';
    minPrice?: string;
    maxPrice?: string;
}

export async function getListings(params: ListingsParams = {}): Promise<ListingsResponse> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.status) searchParams.set('status', params.status);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.minPrice) searchParams.set('minPrice', params.minPrice);
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice);

    const response = await fetch(`${API_URL}/marketplace/listings?${searchParams.toString()}`, {
        credentials: 'include',
    });

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

export async function createListing(data: {
    order: Order;
    signature: string;
    orderHash: string;
}): Promise<Listing> {
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