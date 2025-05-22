import { UUIDv7 } from './core.js';
import { Metadata } from './metadata.js';
import { AcquisitionType } from './transactions.js';

export const RarityWeights: Record<CardRarity, number> = {
    bronze: 70,
    silver: 20,
    gold: 5,
    sapphire: 2.5,
    ruby: 1.5,
    opal: 1
};
export const RarityMultipliers: Record<CardRarity, number> = {
    bronze: 1.0,
    silver: 1.5,
    gold: 2.0,
    sapphire: 3.0,
    ruby: 4.0,
    opal: 5.0
};
export type SeasonCollection = 'season_0';
export type CardRarity =
    | 'bronze'
    | 'silver'
    | 'gold'
    | 'sapphire'
    | 'ruby'
    | 'opal';

export interface Card {
    id: UUIDv7;
    ownerId: UUIDv7;
    packPurchaseId: UUIDv7 | null;
    tokenId: number;
    isBurned: boolean;
    acquisitionType: AcquisitionType;
    updatedAt: Date;
    createdAt: Date;
}

export interface CardInsert {
    ownerId: UUIDv7;
    packPurchaseId: UUIDv7 | null;
    tokenId: number;
    isBurned?: boolean;
    acquisitionType: AcquisitionType;
}

export interface CardUpdate {
    isBurned?: boolean;
    acquisitionType?: AcquisitionType;
}

export interface CardWithMetadata extends Card {
    metadata: Metadata;
}
