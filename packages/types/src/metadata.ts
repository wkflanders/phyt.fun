import { SeasonCollection, Card, CardRarity } from './cards.js';
import { UUIDv7 } from './core.js';

export interface Metadata extends Pick<Card, 'tokenId'> {
    tokenId: number;
    runnerId: UUIDv7;
    runnerName: string;
    rarity: CardRarity;
    imageUrl: string;
    multiplier: number;
    season: SeasonCollection;
    createdAt: Date;
    updatedAt: Date;
}

export interface MetadataInsert {
    tokenId: number;
    runnerId: UUIDv7;
    runnerName: string;
    rarity: CardRarity;
    imageUrl: string;
    multiplier: number;
    season: SeasonCollection;
}

export interface MetadataUpdate {
    runnerName?: string;
    rarity?: CardRarity;
    imageUrl?: string;
    multiplier?: number;
    season?: SeasonCollection;
}
