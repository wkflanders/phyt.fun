import { SeasonCollection, CardRarity } from './cards.js';

import type { AvatarUrl, Pagination, UUIDv7 } from './core.js';

export type PackType = 'scrawny' | 'toned' | 'swole' | 'phyt';

export interface MintEvent {
    eventName: string;
    args: {
        firstTokenId: number;
    };
}

export interface TokenURIMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
        runnerId: UUIDv7;
        runnerName: string;
        rarity: CardRarity;
        multiplier: number;
        season: SeasonCollection;
    }[];
}

export interface PackPurchaseNotif {
    buyerId: string;
    hash: string;
    packPrice: string;
    packType: PackType;
}

export interface Pack {
    id: UUIDv7;
    buyerId: UUIDv7;
    purchasePrice: string;
    packType: PackType;
    updatedAt: Date;
    createdAt: Date;
}

export interface PackInsert {
    buyerId: UUIDv7;
    purchasePrice: string;
    packType: PackType;
}

export interface PackWithUser extends Pack {
    username: string;
    avatarUrl: AvatarUrl;
}

export interface PackQueryParams {
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'packType' | 'purchasePrice';
    order?: 'asc' | 'desc';
    packType?: PackType;
}

export interface PaginatedPacks<T = Pack> {
    packs: T[];
    pagination: Pagination;
}
