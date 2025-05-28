import { AvatarUrl, Pagination, UUIDv7 } from './core.js';

export type ReactionType = 'like' | 'funny' | 'insightful' | 'fire';

export type ReactionAction = 'added' | 'removed';

export interface Reaction {
    id: UUIDv7;
    userId: UUIDv7;
    postId: UUIDv7 | null;
    commentId: UUIDv7 | null;
    type: ReactionType;
    createdAt: Date;
    updatedAt: Date;
    // Below are not included in the database table, but used in the API
    username?: string;
    avatarUrl?: AvatarUrl;
    counts?: ReactionCount;
}

export interface ReactionInsert {
    userId: UUIDv7;
    postId?: UUIDv7 | null;
    commentId?: UUIDv7 | null;
    type: ReactionType;
}

export interface ReactionUpdate {
    id?: UUIDv7;
    action: ReactionAction;
    type: ReactionType;
}

export interface ReactionCount {
    like: number;
    funny: number;
    insightful: number;
    fire: number;
}

export interface ReactionQueryParams {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedReactions<T = Reaction> {
    reactions: T[];
    pagination: Pagination;
}
