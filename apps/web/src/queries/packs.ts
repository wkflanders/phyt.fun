import { ApiError } from "@phyt/types";

export interface PurchasePackInput {
    buyer: string;
}

export interface PurchasePackResponse {
    hash: string;
    mintConfigId: number;
    totalMintedPacks: number;
    firstTokenId: number;
    lastTokenId: number;
    price: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function purchasePack(packData: PurchasePackInput): Promise<PurchasePackResponse> {
    const response = await fetch(`${API_URL}/packs/purchase`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(packData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            error: data.error || 'Failed to purchase pack',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export const packQueryKeys = {
    all: ['packs'] as const,
    purchase: () => [...packQueryKeys.all, 'purchase'] as const,
} as const;