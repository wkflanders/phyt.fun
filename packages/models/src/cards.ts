import { CardRarity, AcquisitionType, SeasonCollection } from './metadata.js';
import { UUIDv7 } from './primitives.js';

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
