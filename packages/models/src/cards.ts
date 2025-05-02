import { CardRarity, AcquisitionType, SeasonCollection } from './metadata.js';
import { UUIDv7 } from './uuid.js';

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
