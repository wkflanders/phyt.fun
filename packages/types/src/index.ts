import type { Address } from 'viem';

export type CardRarity =
    | 'bronze'
    | 'silver'
    | 'gold'
    | 'sapphire'
    | 'ruby'
    | 'opal';
export type AcquisitionType = 'mint' | 'transfer' | 'marketplace';
export type RunVerificationStatus = 'pending' | 'verified' | 'flagged';
export type RunnerApplicationStatus =
    | 'pending'
    | 'success'
    | 'already_runner'
    | 'already_submitted'
    | 'failed';
export type RunnerStatus = 'pending' | 'active' | 'inactive';
export type TransactionType =
    | 'packPurchase'
    | 'marketplaceSale'
    | 'marketplaceOffer'
    | 'marketplaceListing'
    | 'rewardPayout';
export type UserRole = 'admin' | 'user' | 'runner';
export type BidType = 'listing' | 'open';
export type BidStatusOpen = 'active' | 'filled';
export type BidStatusListed = 'topbid' | 'outbid';
export type BidStatus = BidStatusListed | BidStatusOpen | 'withdrawn';
export type PackType = 'scrawny' | 'toned' | 'swole' | 'phyt';

export interface AdminService {
    getPendingRunners: () => Promise<Runner[]>;
    getPendingRuns: () => Promise<PendingRun[]>;
    approveRunner: (userId: number) => Promise<User>;
    updateRunVerification: (
        runId: number,
        status: 'verified' | 'flagged'
    ) => Promise<Run>;
}

export interface CommentService {
    createComment(request: CommentCreateRequest): Promise<Comment>;
    getPostComments(
        post_id: number,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    getCommentReplies(
        comment_id: number,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    updateComment(
        comment_id: number,
        data: { content: string }
    ): Promise<Comment>;
    deleteComment(comment_id: number): Promise<Comment>;
    getCommentById(commentId: number): Promise<Comment>;
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

export interface User {
    id: number;
    email: string;
    username: string;
    role: UserRole;
    privy_id: string;
    avatar_url: string;
    wallet_address: string;
    phytness_points: number | null;
    twitter_handle: string | null;
    strava_handle: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface UserWithStatus extends User {
    status?: RunnerStatus;
}

export interface CreateUserFormData extends FormData {
    email: string;
    username: string;
    privy_id: string;
    wallet_address: `0x${string}`;
}

export interface CreateUserInput {
    formData: CreateUserFormData;
}

export interface Run {
    id: number;
    runner_id: number;
    start_time: Date;
    end_time: Date;
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
    is_posted: boolean | null;
    verification_status: RunVerificationStatus;
    raw_data_json: Record<string, unknown> | null;
    created_at: Date;
    updated_at: Date;
}

export interface PendingRun {
    run: Run;
    runner: string;
}

export type SeasonCollection = 'season_0';

export interface TokenURIMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
        runner_id: number;
        runner_name: string;
        rarity: CardRarity;
        multiplier: number;
        season: SeasonCollection;
    }[];
}

export interface Card {
    id: number;
    owner_id: number;
    pack_purchase_id: number | null;
    token_id: number;
    is_burned: boolean;
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
    season: SeasonCollection;
    created_at: Date;
}

export interface CardWithMetadata extends Card {
    metadata: CardMetadata;
}

export interface Competition {
    id: number;
    event_name: string;
    start_time: string;
    end_time: string;
    jackpot: string;
    distance_m: number | null;
    event_type: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Lineup {
    id: number;
    competition_id: number;
    manager_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface LineupCard {
    id: number;
    updated_at: Date;
    created_at: Date;
    lineup_id: number;
    card_id: number;
    position: number;
}

export interface LineupSubmissionResponse {
    success: boolean;
    message: string;
    lineup_id: number;
}

export interface CompetitionLineupRequestBody {
    userId: number;
    cardIds: number[];
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
    runner_wallet: string;
    created_at: Date;
    updated_at: Date;
}

export interface RunnerProfile extends Runner {
    username: string;
    avatar_url: string;
}

export type RunnerSortFields =
    | 'total_distance_m'
    | 'average_pace'
    | 'total_runs'
    | 'best_mile_time'
    | 'created_at'
    | 'username';

export type RunnerSortOrder = 'asc' | 'desc';

export interface RunnerQueryParams {
    search?: string;
    sortBy?: RunnerSortFields;
    sortOrder?: RunnerSortOrder;
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
    from_user_id: number | null;
    to_user_id: number | null;
    card_id: number | null;
    competition_id: number | null;
    price: string | null;
    transaction_type: TransactionType;
    pack_purchases_id: number | null;
    hash: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface PackPurchase {
    id: number;
    buyer_id: number;
    purchase_price: string;
    pack_type: PackType;
    created_at: Date;
    updated_at: Date;
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
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
}

// export interface ApiError extends Error {
//     error: string;
//     status: number;
// }

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
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

export class PackPurchaseError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 551) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'PackPurchaseError';
    }
}

export class MarketplaceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 571) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'MarketplaceError';
    }
}

export class HttpError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HttpError';
    }
}

export interface MintConfigResponse {
    mintConfigId: string;
    packPrice: string;
    merkleProof: string[];
    packType: string;
}

export interface PackDetails {
    mintConfigId: string;
    packPrice: string;
    merkleProof: string;
}

export interface PackPurchaseInput {
    buyerId: number;
    buyerAddress: `0x${string}`;
    packType: PackType;
}

export interface PackPurchaseNotif {
    buyerId: number;
    hash: `0x${string}`;
    packPrice: string;
    packType: PackType;
}

export interface PackPurchaseResponse {
    cardsMetadata: TokenURIMetadata[];
}

export interface ContractConfig {
    address: Address;
    abi: unknown;
}

export class ContractError extends Error {
    constructor(
        message: string,
        public readonly code?: number
    ) {
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

export interface OrderBook {
    bid: Bid[];
    bidder: User[];
}

export interface OrderBookEntry {
    price: number;
    quantity: number;
}

export interface Listing {
    id: number;
    buyer_id: number | null;
    seller_id: number;
    card_id: number;
    price: string; // Take price
    highest_bid: string | null; // Current highest bid
    highest_bidder_id: number | null;
    expiration_time: Date;
    signature: string;
    order_hash: string;
    order_data: Order;
    transaction_hash: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateListingRequestBody {
    user: User;
    card_id: number;
    price: string;
    signature: string;
    order_hash: string;
    order_data: Order;
}

export interface CreateListingProps {
    card_id: number;
    seller_id: number;
    price: string;
    signature: string;
    order_hash: string;
    order_data: Order;
    expiration_time: string;
}

export interface GetListingProps {
    minPrice?: string;
    maxPrice?: string;
    rarity?: string[];
    sort?: 'price_asc' | 'price_desc' | 'created_at';
}

export interface Bid {
    id: number;
    bidder_id: number;
    card_id: number;
    bid_type: BidType;
    bid_amount: string;
    signature: string;
    order_hash: string;
    order_data: Order;
    status: BidStatus;
    expiration_time: Date;
    accepted_at: Date | null;
    updated_at?: Date;
    created_at?: Date;
    listing_id?: number | null;
}

export interface ListingBid extends Bid {
    bid_type: 'listing';
    bid_status: BidStatusListed | 'withdrawn';
    listing_id: number;
}

export interface OpenBid extends Bid {
    bid_type: 'open';
    bid_status: BidStatusOpen | 'withdrawn';
}

export interface BaseBidProps {
    bidder_id: number;
    bid_amount: string;
    signature: string;
    order_hash: string;
    order_data: Order;
}

export interface CreateListingBidProps extends BaseBidProps {
    bid_type: 'listing';
    listing_id: number;
}

export interface CreateOpenBidProps extends BaseBidProps {
    bid_type: 'open';
    card_id: number;
    expiration_time: Date;
}

export interface ListedBidRequestBody {
    listing_id: number;
    bid_amount: string;
    signature: string;
    order_hash: string;
    order_data: Order;
    user: User;
}

export interface OpenBidRequestBody {
    card_id: number;
    bid_amount: string;
    signature: string;
    order_hash: string;
    order_data: Order;
    user: User;
    expiration_time: Date;
}

export interface UserBids {
    bid: Bid;
    card: Card;
    metadata: CardMetadata;
    listing: {
        id: number;
        price: string;
        expiration_time: Date;
    } | null;
    owner: {
        id: number;
        wallet_address: string;
        username: string;
        avatar_url: string;
    };
}

export interface AcceptOpenBidProps {
    bid_id: number;
    transaction_hash: string;
}

export interface CompletePurchaseProps {
    listing_id: number;
    buyer_id: number;
    transaction_hash: string;
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
    price: string;
    payment_token: string;
    expiration_time: Date;
    active: boolean;
    signature: string;
    salt: string;
    created_at: Date;
    updated_at: Date;
    buyer: `0x${string}`;
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

export interface RunnerPoolStatus {
    status: RunnerStatus;
    is_pooled: boolean;
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
    status: PostStatus;
    updated_at: Date;
    created_at: Date;
}

export interface PostUpdateRequest {
    postId: number;
    status: PostStatus;
}

export interface PostCreateRequest {
    run_id: number;
    content?: string;
}

export interface PostResponse {
    posts: {
        post: Post;
        user: {
            username: string;
            avatar_url: string | null;
            role: 'admin' | 'user' | 'runner';
            is_pooled: boolean;
        };
        run: {
            distance_m: number;
            duration_seconds: number;
            average_pace_sec: null | number;
            elevation_gain_m: null | number;
            gps_route_data: string | null;
            start_time: Date;
            end_time: Date;
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
    user_id: number;
    post_id: number;
    content: string;
    parent_comment_id?: number;
}

export interface CommentUpdateRequest {
    commentId: number;
    content: string;
}

export interface CommentQueryParams {
    page?: number;
    limit?: number;
    parent_only?: boolean;
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
        };
    }[];
    pagination?: CommentPagination;
}

export type Reaction = 'like' | 'funny' | 'insightful' | 'fire';

export type ReactionCount = Record<Reaction, number>;

export type ReactionAction = 'added' | 'removed';

export interface ReactionToggleRequest {
    user_id: number;
    post_id: number;
    comment_id: number;
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
    id: number;
    runner: RunnerProfile;
    ranking: number;
    updated_at: Date;
    created_at: Date;
}

export interface ManagerStanding {
    id: number;
    user: User;
    ranking: number;
    updated_at: Date;
    created_at: Date;
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
