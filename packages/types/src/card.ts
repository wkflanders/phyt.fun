import { UUIDv7 } from './core.js';
import { AcquisitionType } from './transactions.js';

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

export interface CardMetadata extends Pick<Card, 'tokenId'> {
    tokenId: number;
    runnerId: UUIDv7;
    runnerName: string;
    rarity: CardRarity;
    imageUrl: string;
    multiplier: number;
    season: SeasonCollection;
    createdAt: Date;
}

export interface CardWithMetadata extends Card {
    metadata: CardMetadata;
}
