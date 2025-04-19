import { env } from '@/env';
import {
    ApiError,
    PackDetails,
    PackPurchaseNotif,
    PackPurchaseResponse
} from '@phyt/types';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function fetchPackDetails(
    wallet_address: `0x${string}`,
    packType: string,
    token: string
): Promise<PackDetails> {
    const response = await fetch(
        `${API_URL}/packs/init/${wallet_address}?packType=${packType}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to purchase pack',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function notifyServerPackTxn(
    { buyerId, hash, packPrice, packType = 'scrawny' }: PackPurchaseNotif,
    token: string
): Promise<PackPurchaseResponse> {
    const response = await fetch(`${API_URL}/packs/purchase`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ buyerId, hash, packPrice, packType })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw {
            error: data.error ?? 'Error notifying server',
            status: response.status
        } as ApiError;
    }

    return response.json();
}
