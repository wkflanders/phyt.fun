import { UUIDv7, Pagination, AvatarUrl } from './core.js';
import { Run } from './runs.js';

export type PostStatus = 'visible' | 'hidden' | 'deleted';
export type PostFilter = 'all' | 'following' | 'trending';

export interface Post {
    id: UUIDv7;
    userId: UUIDv7;
    runId: UUIDv7 | null;
    title: string;
    content: string;
    status: PostStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    // Below is not included in the database table, but used in the API
    username?: string;
    avatarUrl?: AvatarUrl;
    stats?: PostStats;
    run?: Run;
}

export interface PostInsert {
    userId: UUIDv7;
    runId?: UUIDv7 | null;
    title: string;
    content: string;
    status: PostStatus;
}

export interface PostUpdate {
    title?: string;
    content?: string;
    status?: PostStatus;
}

export interface PostStats {
    commentCount: number;
    reactionCount: number;
    shareCount: number;
}

export interface PostQueryParams {
    page?: number;
    limit?: number;
    userId?: UUIDv7;
    filter?: PostFilter;
}

export interface PaginatedPosts<T = Post> {
    posts: T[];
    pagination: Pagination;
}
