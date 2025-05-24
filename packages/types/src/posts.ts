import { UUIDv7, Pagination } from './core.js';

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
}

export interface PostWithUser extends Post {
    username: string;
    avatarUrl: string;
}

export interface PostInsert {
    userId: UUIDv7;
    runId?: UUIDv7 | null;
    title: string;
    content: string;
    status?: PostStatus;
}

export interface PostUpdate {
    title?: string;
    content?: string;
    status?: PostStatus;
}

export interface PostStats {
    commentCount: number;
    reactionCount: number;
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
