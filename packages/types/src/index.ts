import type { Address } from 'viem';

export type CardRarity = 'bronze' | 'silver' | 'gold' | 'sapphire' | 'ruby' | 'opal';
export type AcquisitionType = 'mint' | 'transfer' | 'marketplace';
export type RunVerificationStatus = 'pending' | 'verified' | 'flagged';
export type RunnerStatus = 'pending' | 'active' | 'inactive';
export type TransactionType = 'packPurchase' | 'marketplaceSale' | 'rewardPayout';
export type UserRole = 'admin' | 'user' | 'runner';

export const RarityWeights = {
    bronze: 70,
    silver: 20,
    gold: 9,
    sapphire: 0,
    ruby: 1,
    opal: 0,
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
    updated_at: Date;
    created_at: Date;
    email: string;
    username: string;
    role: UserRole;
    privy_id: string;
    avatar_url: string;
    wallet_address: string | null;
    phytness_points: number;
}

export interface CreateUserInput {
    formData: FormData;
}

export interface Run {
    id: number;
    updated_at: Date;
    created_at: Date;
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
    is_burned: boolean,
    acquisition_type: AcquisitionType;
    updated_at: Date;
    created_at: Date;
}

export interface CardMetadata extends Pick<Card, 'token_id'> {
    token_id: number;
    runner_id: number;
    runner_name: string;
    rarity: CardRarity;
    image_url: string;
    multiplier: number;
    created_at: Date;
}

export interface CardWithMetadata extends Card {
    metadata: CardMetadata;
}

export interface Competition {
    id: number;
    updated_at: Date;
    created_at: Date;
    event_name: string;
    start_time: string;
    end_time: string;
    jackpot: number;
    distance_m: number | null;
    event_type: string | null;
}

export interface Lineup {
    id: number;
    updated_at: Date;
    created_at: Date;
    competition_id: number;
    gambler_id: number;
}

export interface LineupCard {
    id: number;
    updated_at: Date;
    created_at: Date;
    lineup_id: number;
    card_id: number;
    position: number;
}

export interface Runner {
    id: number;
    user_id: number;
    average_pace: number | null;
    total_distance_m: number;
    total_runs: number;
    best_mile_time: number | null;
    status: RunnerStatus;
    is_pooled: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface RunnerProfile extends Runner {
    username: string;
    avatar_url: string;
}

export interface PendingRunner {
    id: number;
    username: string;
    email: string;
    created_at: Date;
    role: string;
    privy_id: string;
    wallet_address?: string;
    avatar_url?: string;
}

export interface PendingRun {
    run: {
        id: number;
        runner_id: number;
        distance_m: number;
        duration_seconds: number;
        created_at: Date;
        verification_status: 'pending' | 'verified' | 'flagged';
    };
    runner_name: string;
}

export interface RunnerResult {
    id: number;
    updated_at: Date;
    created_at: Date;
    competition_id: number;
    runner_id: number;
    session_id: number;
    best_time_sec: number;
    ranking: number | null;
}

export interface GamblerResult {
    id: number;
    updated_at: Date;
    created_at: Date;
    lineup_id: number;
    total_score: number;
    final_placement: number | null;
    reward_amount_phyt: number | null;
}

export interface Transaction {
    id: number;
    updated_at: Date;
    created_at: Date;
    from_user_id: number | null;
    to_user_id: number | null;
    card_id: number | null;
    competition_id: number | null;
    token_amount: number | null;
    transaction_type: TransactionType;
}

export interface PackPurchase {
    id: number;
    updated_at: Date;
    created_at: Date;
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
    updated_at: Date;
    created_at: Date;
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
    buyer_id: number;
    seller_id: number;
    card_id: number;
    price: string; // Take price
    highest_bid: bigint; // Current highest bid
    highest_bidder: `0x${string}` | null;
    expiration_time: bigint;
    signature: string;
    order_hash: string;
    order_data: Order;
    transaction_hash: string | null;
    status: string;
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

export interface MarketListing {
    listing: Listing;
    metadata: CardMetadata;
    seller: User;
    card: Card;
}

export interface RunnerActivity {
    id: number;
    runner_id: number;
    username: string;
    avatar_url: string;
    distance_m: number;
    completed_at: string;
    is_pooled: boolean;
    time_ago: string;
}

export type PostFilter = 'all' | 'following' | 'trending';
export type PostStatus = 'visible' | 'hidden' | 'deleted';

export interface PostQueryParams {
    page?: number;
    limit?: number;
    filter?: PostFilter;
}

export interface Post {
    id: number;
    user_id: number;
    run_id: number;
    status: "visible" | "hidden" | "deleted";
    updated_at: Date;
    created_at: Date;
}

export interface PostUpdateRequest {
    postId: number;
    status: 'visible' | 'hidden' | 'deleted';
}

export interface PostCreateRequest {
    run_id: number;
    content?: string;
}

export interface PostResponse {
    posts: {
        post: Post,
        user: {
            username: string;
            avatar_url: string | null;
            role: "admin" | "user" | "runner";
            is_pooled: boolean;
        },
        run: {
            distance_m: number;
            duration_seconds: number;
            average_pace_sec: null | number;
            elevation_gain_m: null | number;
            gps_route_data: string | null;
            start_time: Date;
        },
        stats: {
            comments: number;
        };
    }[],
    pagination?: PostPagination;
}

export interface PostPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextPage: number | undefined;
}

export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    parent_comment_id: number | null;
    updated_at: Date;
    created_at: Date;
}

export interface CommentCreateRequest {
    post_id: number,
    content: string,
    parent_comment_id?: number;
}

export interface CommentUpdateRequest {
    commentId: number;
    content: string;
}

export interface CommentQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
}

export interface CommentPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CommentResponse {
    comments: {
        comment: Comment;
        user: {
            username: string;
            avatar_url: string | null;
        },
    }[],
    pagination?: CommentPagination;
}

export type Reaction = 'like' | 'funny' | 'insightful' | 'fire';

export type ReactionCount = Record<string, number>;

export interface ReactionToggleRequest {
    post_id?: number;
    comment_id?: number;
    type: Reaction;
}

export interface ReactionToggleResponse {
    action: 'added' | 'removed';
    reaction: Reaction;
}