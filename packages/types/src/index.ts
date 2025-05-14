import {
    Card,
    CardMetadata,
    CardRarity,
    CardWithMetadata,
    SeasonCollection
} from './card.js';
import { UUIDv7 } from './core.js';
import { User } from './users.js';
export * from './comment.js';
export * from './core.js';
export * from './runners.js';
export * from './users.js';
export * from './card.js';
export * from './transactions.js';

export type RunVerificationStatus = 'pending' | 'verified' | 'flagged';
export type RunnerApplicationStatus =
    | 'pending'
    | 'success'
    | 'alreadyRunner'
    | 'alreadySubmitted'
    | 'failed';
export type RunnerStatus = 'pending' | 'active' | 'inactive';
export type BidType = 'listing' | 'open';
export type BidStatusOpen = 'active' | 'filled';
export type BidStatusListed = 'topbid' | 'outbid';
export type BidStatus = BidStatusListed | BidStatusOpen | 'withdrawn';
export type PackType = 'scrawny' | 'toned' | 'swole' | 'phyt';

export interface AdminService {
    getPendingRunners: () => Promise<Runner[]>;
    getPendingRuns: () => Promise<PendingRun[]>;
    approveRunner: (user_id: UUIDv7) => Promise<User>;
    updateRunVerification: (
        runId: UUIDv7,
        status: 'verified' | 'flagged'
    ) => Promise<Run>;
}

export const PackTypes = [
    {
        id: 'scrawny',
        name: 'Scrawny',
        price: '0.00005',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkF7VEC9Qld7SzgEHyp0FWsev2oX4frOCijM6n9',
        description:
            'Will give 1 card. It will almost always be a Bronze, but will occasionally give a Silver.',
        cardCount: 1,
        color: '#C4C4C4', // Gray
        bgGradient: 'from-gray-400/30 to-gray-500/30'
    },
    {
        id: 'toned',
        name: 'Toned',
        price: '0.0001',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFjeYDIXKi2WN9i60TEnCxu4AG71LvblfVDYBO',
        description:
            "Will give 1 card. It will most commonly be a Bronze, but will often give a Silver, and if you're lucky, a Gold.",
        cardCount: 1,
        color: '#5F7FCF', // Blue
        bgGradient: 'from-blue-500/30 to-blue-600/30'
    },
    {
        id: 'swole',
        name: 'Swole',
        price: '0.0002',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkF2QPN0ASe0PMhWadOtKgnmuo8sYieIArRQ23x',
        description:
            '5 cards. 3 guaranteed Bronze, with the other 2 split between Bronze, Silver, Gold, and rarely a Ruby.',
        cardCount: 5,
        color: '#FE205D', // Pink/Red
        bgGradient: 'from-pink-500/30 to-pink-600/30'
    },
    {
        id: 'phyt',
        name: 'Phyt',
        price: '0.0003',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFYllb0dRPCduK0erjAyG7QSRxcnhM5Iv3YskT',
        description:
            '5 cards. 2 guaranteed Bronze, 1 Silver, and 2 mixed cards that could include Gold or Ruby.',
        cardCount: 5,
        color: '#0EF9FE', // Cyan
        bgGradient: 'from-cyan-400/30 to-cyan-500/30'
    }
];

export const RarityWeights = {
    bronze: 50,
    silver: 10,
    gold: 20,
    sapphire: 0,
    ruby: 0,
    opal: 0
} as const;

export const RarityMultipliers: Record<CardRarity, number> = {
    bronze: 1,
    silver: 1.5,
    gold: 2,
    sapphire: 3,
    ruby: 5,
    opal: 10
};

export interface Run {
    id: UUIDv7;
    runnerId: UUIDv7;
    startTime: Date;
    endTime: Date;
    durationSeconds: number;
    distance: number;
    averagePaceSec: number | null;
    caloriesBurned: number | null;
    stepCount: number | null;
    elevationGain: number | null;
    averageHeartRate: number | null;
    maxHeartRate: number | null;
    deviceId: string | null;
    gpsRouteData: string | null;
    isPosted: boolean | null;
    verificationStatus: RunVerificationStatus;
    rawDataJson: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PendingRun {
    run: Run;
    runner: string;
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

export interface Competition {
    id: UUIDv7;
    eventName: string;
    startTime: string;
    endTime: string;
    jackpot: string;
    distance: number | null;
    eventType: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Lineup {
    id: UUIDv7;
    competitionId: UUIDv7;
    managerId: UUIDv7;
    createdAt: Date;
    updatedAt: Date;
}

export interface LineupCard {
    id: UUIDv7;
    updatedAt: Date;
    createdAt: Date;
    lineupId: UUIDv7;
    cardId: UUIDv7;
    position: number;
}

export interface LineupSubmissionResponse {
    success: boolean;
    message: string;
    lineupId: UUIDv7;
}

export interface CompetitionLineupRequestBody {
    userId: UUIDv7;
    cardIds: UUIDv7[];
}

export interface Runner {
    id: UUIDv7;
    userId: UUIDv7;
    averagePace: number | null;
    totalDistance: number;
    totalRuns: number;
    bestMileTime: number | null;
    status: RunnerStatus;
    isPooled: boolean;
    runnerWallet: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RunnerProfile extends Runner {
    username: string;
    avatarUrl: string;
}

export type RunnerSortFields =
    | 'totalDistance'
    | 'averagePace'
    | 'totalRuns'
    | 'bestMileTime'
    | 'createdAt'
    | 'username';

export type RunnerSortOrder = 'asc' | 'desc';

export interface RunnerQueryParams {
    search?: string;
    sortBy?: RunnerSortFields;
    sortOrder?: RunnerSortOrder;
}

export interface PendingRunner {
    id: UUIDv7;
    username: string;
    email: string;
    createdAt: Date;
    role: string;
    privyId: string;
    walletAddress: string;
    avatarUrl: string;
}

export interface RunnerResult {
    id: UUIDv7;
    updatedAt: Date;
    createdAt: Date;
    competitionId: UUIDv7;
    runnerId: UUIDv7;
    sessionId: UUIDv7;
    bestTimeSec: number;
    ranking: number | null;
}

export interface GamblerResult {
    id: UUIDv7;
    updatedAt: Date;
    createdAt: Date;
    lineupId: UUIDv7;
    totalScore: number;
    finalPlacement: number | null;
    rewardAmountPhyt: number | null;
}

export interface PackPurchase {
    id: UUIDv7;
    buyerId: UUIDv7;
    purchasePrice: string;
    packType: PackType;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserDeviceAuthorization {
    id: UUIDv7;
    updatedAt: Date;
    createdAt: Date;
    userId: UUIDv7;
    deviceType: string;
    accessToken: string | null;
    refreshToken: string | null;
    scopes: string | null;
    lastSyncedAt: string | null;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
}

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly originalError?: unknown;

    constructor(message: string, statusCode = 503, originalError?: unknown) {
        super(message);
        Object.setPrototypeOf(this, ApiError.prototype);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

export class DatabaseError extends Error {
    statusCode: number;
    constructor(
        message: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'DatabaseError';
        this.statusCode = 512;
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
        this.statusCode = 422;
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

export class AuthenticationError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}

export class PermissionError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

export class PackPurchaseError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'PackPurchaseError';
    }
}

export class MarketplaceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'MarketplaceError';
    }
}
export interface MintConfigResponse {
    mintConfigId: string;
    packPrice: string;
    merkleProof: string[];
    packType: string;
}

// Come back to this
export interface PackDetails {
    mintConfigId: string;
    packPrice: string;
    merkleProof: string;
}

export interface PackPurchaseInput {
    buyerId: UUIDv7;
    buyerAddress: `0x${string}`;
    packType: PackType;
}

// Come back to this
export interface PackPurchaseNotif {
    buyerId: UUIDv7;
    hash: `0x${string}`;
    packPrice: string;
    packType: PackType;
}

export interface PackPurchaseResponse {
    cardsMetadata: TokenURIMetadata[];
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
    side: Side;
    collection: `0x${string}`;
    tokenId: bigint;
    paymentToken: `0x${string}`;
    price: bigint; // For sell orders: take price, For buy orders: bid price
    expirationTime: bigint;
    merkleRoot: `0x${string}`;
    salt: bigint;
}

export interface OrderBook {
    bid: Bid[];
    bidder: User[];
}

export interface OrderBookEntry {
    price: number;
    quantity: number;
}

export interface Listing {
    id: UUIDv7;
    buyerId: UUIDv7 | null;
    sellerId: UUIDv7;
    cardId: UUIDv7;
    price: string; // Take price
    highestBid: string | null; // Current highest bid
    highestBidderId: UUIDv7 | null;
    expirationTime: Date;
    signature: string;
    orderHash: string;
    orderData: Order;
    transactionHash: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateListingRequestBody {
    user: User;
    cardId: UUIDv7;
    price: string;
    signature: string;
    orderHash: string;
    orderData: Order;
}

export interface CreateListingProps {
    cardId: UUIDv7;
    sellerId: UUIDv7;
    price: string;
    signature: string;
    orderHash: string;
    orderData: Order;
    expirationTime: string;
}

export interface GetListingProps {
    minPrice?: string;
    maxPrice?: string;
    rarity?: string[];
    sort?: 'priceAsc' | 'priceDesc' | 'createdAt';
}

export interface Bid {
    id: UUIDv7;
    bidderId: UUIDv7;
    bidType: BidType;
    bidAmount: string;
    cardId: UUIDv7;
    signature: string;
    orderHash: string;
    orderData: Order;
    status: BidStatus;
    expirationTime: Date;
    acceptedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
    listing_id?: UUIDv7 | null;
}

export interface ListingBid extends Bid {
    bidType: 'listing';
    bidStatus: BidStatusListed | 'withdrawn';
    listingId: UUIDv7;
}

export interface OpenBid extends Bid {
    bidType: 'open';
    bidStatus: BidStatusOpen | 'withdrawn';
}

export interface BaseBidProps {
    bidderId: UUIDv7;
    bidAmount: string;
    signature: string;
    orderHash: string;
    orderData: Order;
}

export interface CreateListingBidProps extends BaseBidProps {
    bidType: 'listing';
    listingId: UUIDv7;
}

export interface CreateOpenBidProps extends BaseBidProps {
    bidType: 'open';
    cardId: UUIDv7;
    expirationTime: Date;
}

export interface ListedBidRequestBody {
    listingId: UUIDv7;
    bidAmount: string;
    signature: string;
    orderHash: string;
    orderData: Order;
    user: User;
}

export interface OpenBidRequestBody {
    cardId: UUIDv7;
    bidAmount: string;
    signature: string;
    orderHash: string;
    orderData: Order;
    user: User;
    expirationTime: Date;
}

export interface UserBids {
    bid: Bid;
    card: Card;
    metadata: CardMetadata;
    listing: {
        id: UUIDv7;
        price: string;
        expirationTime: Date;
    } | null;
    owner: {
        id: UUIDv7;
        walletAddress: string;
        username: string;
        avatarUrl: string;
    };
}

export interface AcceptOpenBidProps {
    bidId: UUIDv7;
    transactionHash: string;
}

export interface CompletePurchaseProps {
    listingId: UUIDv7;
    buyerId: UUIDv7;
    transactionHash: string;
}

export interface RunnerListing extends Listing {
    metadata: {
        runnerId: UUIDv7;
        runnerName: string;
        runnerAvatar: string;
        rarity: CardRarity;
        multiplier: number;
        imageUrl: string;
    };
    order: {
        traderId: UUIDv7;
        side: number;
        collection: string;
        tokenId: number;
        paymentToken: string;
        price: string;
        expirationTime: number;
        salt: string;
    };
}
export interface Offer {
    id: UUIDv7;
    buyerId: UUIDv7;
    cardId: UUIDv7;
    price: string;
    paymentToken: string;
    expirationTime: Date;
    active: boolean;
    signature: string;
    salt: string;
    createdAt: Date;
    updatedAt: Date;
    buyerAddress: `0x${string}`;
    card: Card;
}

export interface MarketListing {
    listing: Listing;
    metadata: CardMetadata;
    seller: User;
    card: Card;
}

export interface RunnerActivity {
    id: UUIDv7;
    runnerId: UUIDv7;
    username: string;
    avatarUrl: string;
    distance: number;
    completedAt: string;
    isPooled: boolean;
    timeAgo: string;
}

export interface RunnerPoolStatus {
    status: RunnerStatus;
    isPooled: boolean;
}

export type PostFilter = 'all' | 'following' | 'trending';
export type PostStatus = 'visible' | 'hidden' | 'deleted';

export interface PostQueryParams {
    page?: number;
    limit?: number;
    filter?: PostFilter;
}

export interface Post {
    id: UUIDv7;
    userId: UUIDv7;
    runId: UUIDv7;
    status: PostStatus;
    updatedAt: Date;
    createdAt: Date;
}

export interface UpdatePostRequest {
    postId: UUIDv7;
    status: PostStatus;
}

export interface CreatePostRequest {
    userId: UUIDv7;
    runId: UUIDv7;
    content: string | null;
}

export interface PostResponse {
    posts: {
        post: Post;
        user: {
            username: string;
            avatarUrl: string | null;
            role: 'admin' | 'user' | 'runner';
            isPooled: boolean;
        };
        run: {
            distance: number;
            durationSeconds: number;
            averagePaceSec: null | number;
            elevationGain: null | number;
            gpsRouteData: string | null;
            startTime: Date;
            endTime: Date;
        };
        stats: {
            comments: number;
            reactions: number;
        };
    }[];
    pagination?: PostPagination;
}

export interface PostPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextPage?: number;
}

export type Reaction = 'like' | 'funny' | 'insightful' | 'fire';

export type ReactionCount = Record<Reaction, number>;

export type ReactionAction = 'added' | 'removed';

export interface ReactionToggleRequest {
    userId: UUIDv7;
    postId: UUIDv7;
    commentId: UUIDv7;
    type: Reaction;
}

export interface ReactionToggleResponse {
    action: ReactionAction;
    reaction: Reaction;
}

export interface LeaderboardPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface RunnerStanding {
    id: UUIDv7;
    runner: RunnerProfile;
    ranking: number;
    updatedAt: Date;
    createdAt: Date;
}

export interface ManagerStanding {
    id: UUIDv7;
    user: User;
    ranking: number;
    updatedAt: Date;
    createdAt: Date;
}

export interface RunnerLeaderboard {
    standings: RunnerStanding[];
    pagination?: LeaderboardPagination;
}

export interface ManagerLeaderboard {
    standings: ManagerStanding[];
    pagination?: LeaderboardPagination;
}

export interface LeaderboardQueryParams {
    page?: number;
    limit?: number;
    timeFrame?: 'weekly' | 'monthly' | 'allTime';
}

export interface ListingModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    card: CardWithMetadata;
}

export interface ExpirationOption {
    value: string;
    label: string;
}
