import type { Address } from 'viem';
import { type WaitForTransactionReceiptReturnType } from "@wagmi/core";

export type CardRarity = 'bronze' | 'silver' | 'gold' | 'sapphire' | 'ruby' | 'opal';
export type AcquisitionType = 'mint' | 'transfer' | 'marketplace';
export type RunVerificationStatus = 'pending' | 'verified' | 'flagged';
export type TransactionType = 'packPurchase' | 'marketplaceSale' | 'rewardPayout';
export type UserRole = 'admin' | 'user' | 'runner';

export const RarityWeights = {
    bronze: 50,
    silver: 25,
    gold: 15,
    sapphire: 7,
    ruby: 2,
    opal: 1,
} as const;

export const RarityMultipliers: Record<CardRarity, number> = {
    bronze: 1,
    silver: 1.5,
    gold: 2,
    sapphire: 3,
    ruby: 5,
    opal: 10,
};


export interface User {
    id: number;
    updated_at: string;
    created_at: string;
    email: string;
    username: string;
    role: UserRole;
    privy_id: string;
    avatar_url: string;
    wallet_address: string | null;
}

export interface CreateUserInput {
    formData: FormData;
}


export interface Run {
    id: number;
    updated_at: string;
    created_at: string;
    runner_id: number;
    start_time: string;
    end_time: string;
    duration_seconds: number;
    distance_m: number;
    average_pace_sec: number | null;
    calories_burned: number | null;
    step_count: number | null;
    elevation_gain_m: number | null;
    average_heart_rate: number | null;
    max_heart_rate: number | null;
    device_id: string | null;
    gps_route_data: string | null;
    verification_status: RunVerificationStatus;
    raw_data_json: any | null;
}

export interface TokenURIMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
        runner_id: number;
        runner_name: string;
        rarity: CardRarity;
        multiplier: number;
    }[];
}

export interface Card {
    id: number;
    owner_id: number;
    pack_purchase_id: number | null;
    token_id: number,
    acquisition_type: AcquisitionType;
    updated_at: Date | null;
    created_at: Date | null;
}

export interface CardMetadata extends Pick<Card, 'token_id'> {
    token_id: number;
    runner_id: number;
    runner_name: string;
    rarity: CardRarity;
    image_url: string;
    multiplier: number;
    created_at: Date | null;
}

export interface CardWithMetadata extends Card {
    metadata: CardMetadata;
}

export interface Competition {
    id: number;
    updated_at: string;
    created_at: string;
    event_name: string;
    start_time: string;
    end_time: string;
    distance_m: number | null;
    event_type: string | null;
}

export interface Lineup {
    id: number;
    updated_at: string;
    created_at: string;
    competition_id: number;
    gambler_id: number;
}

export interface LineupCard {
    id: number;
    updated_at: string;
    created_at: string;
    lineup_id: number;
    card_id: number;
    position: number;
}

export interface Runner {
    id: number;
    updated_at: string;
    created_at: string;
    user_id: number;
    average_pace: number | null;
    total_distance_m: number;
    total_runs: number;
    best_mile_time: number | null;
}

export interface RunnerResult {
    id: number;
    updated_at: string;
    created_at: string;
    competition_id: number;
    runner_id: number;
    session_id: number;
    best_time_sec: number;
    ranking: number | null;
}

export interface GamblerResult {
    id: number;
    updated_at: string;
    created_at: string;
    lineup_id: number;
    total_score: number;
    final_placement: number | null;
    reward_amount_phyt: number | null;
}

export interface Transaction {
    id: number;
    updated_at: string;
    created_at: string;
    from_user_id: number | null;
    to_user_id: number | null;
    card_id: number | null;
    competition_id: number | null;
    token_amount: number | null;
    transaction_type: TransactionType;
}

export interface PackPurchase {
    id: number;
    updated_at: string;
    created_at: string;
    buyer_id: number;
    purchase_price: number;
}

export interface PackPurchaseCardId {
    _order: number;
    _parent_id: number;
    id: string;
    card_id: number | null;
}

export interface UserDeviceAuthorization {
    id: number;
    updated_at: string;
    created_at: string;
    user_id: number;
    device_type: string;
    access_token: string | null;
    refresh_token: string | null;
    scopes: string | null;
    last_synced_at: string | null;
}

export interface SessionCookie {
    value: string;
    userId: string;
};

export interface PaginationParams {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
}

export interface ApiError extends Error {
    error: string;
    status: number;
}

export class DatabaseError extends Error {
    statusCode: number;
    constructor(message: string, public originalError?: any) {
        super(message);
        this.name = 'DatabaseError';
        this.statusCode = 500;
    }
}

export class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class DuplicateError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'DuplicateError';
        this.statusCode = 409;
    }
}

export class ValidationError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export class PackPurchaseError extends Error {
    constructor(message: string, public code: string, public details?: any) {
        super(message);
        this.name = 'PackPurchaseError';
    }
}

export interface PackDetails {
    mintConfigId: string;
    packPrice: string;
    merkleProof: string;
}

export interface PackPurchaseInput {
    buyerId: number;
    buyerAddress: `0x${string}`;
}

export interface PackPurchaseNotif {
    buyerId: number;
    hash: `0x${string}`;
    packPrice: string;
}

export interface PackPurchaseResponse {
    cardsMetadata: TokenURIMetadata[];
}

export interface ContractConfig {
    address: Address;
    abi: unknown;
}

export class ContractError extends Error {
    constructor(message: string, public readonly code?: number) {
        super(message);
        this.name = 'ContractError';
    }
}

export interface MintEvent {
    eventName: 'Mint';
    args: {
        mintConfigId: bigint;
        buyer: `0x${string}`;
        totalMintedPacks: bigint;
        firstTokenId: bigint;
        lastTokenId: bigint;
        price: bigint;
    };
}

export type Side = 'buy' | 'sell';

export interface Order {
    trader: `0x${string}`;
    side: 0 | 1; // 0 for buy (bid), 1 for sell (ask)
    collection: `0x${string}`;
    token_id: bigint;
    payment_token: `0x${string}`;
    price: bigint; // For sell orders: take price, For buy orders: bid price
    expiration_time: bigint;
    merkle_root: `0x${string}`;
    salt: bigint;
}

export interface Listing {
    id: number;
    seller_id: number;
    card_id: number;
    take_price: bigint; // Immediate purchase price
    highest_bid: bigint; // Current highest bid
    highest_bidder: `0x${string}` | null;
    payment_token: `0x${string}`;
    expiration_time: bigint;
    signature: string;
    salt: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Bid {
    id: number;
    listing_id: number;
    bidder_id: number;
    bid_amount: bigint;
    signature: string; // Signed buy order
    created_at: Date;
}

export interface RunnerListing extends Listing {
    metadata: {
        runner_id: number;
        runner_name: string;
        runner_avatar?: string;
        rarity: CardRarity;
        multiplier: number;
        image_url: string;
    };
    order: {
        trader: string;
        side: number;
        collection: string;
        token_id: number;
        payment_token: string;
        price: string;
        expiration_time: number;
        salt: string;
    };
}
export interface Offer {
    id: number;
    buyer_id: number;
    card_id: number;
    price: number;
    payment_token: string;
    expiration_time: Date;
    active: boolean;
    signature: string;
    salt: string;
    created_at: Date;
    updated_at: Date;
    buyer: any;
    card: Card;
}