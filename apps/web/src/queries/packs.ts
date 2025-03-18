import { ApiError, PackDetails, PackPurchaseNotif, PackPurchaseResponse } from "@phyt/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetchPackDetails(wallet_address: `0x${string}`, packType: string, token: string | null): Promise<PackDetails> {
    const response = await fetch(`${API_URL}/packs/init/${wallet_address}?packType=${packType}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            error: data.error || 'Failed to purchase pack',
            status: response.status
        } as ApiError;
    }

    return data;
}

export async function notifyServerPackTxn({
    buyerId,
    hash,
    packPrice,
    packType = 'scrawny',
}: PackPurchaseNotif, token: string | null): Promise<PackPurchaseResponse> {
    const resp = await fetch(`${API_URL}/packs/purchase`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ buyerId, hash, packPrice, packType }),
    });

    if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw {
            error: data.error || 'Error notifying server',
            status: resp.status,
        } as ApiError;
    }

    return resp.json();
}