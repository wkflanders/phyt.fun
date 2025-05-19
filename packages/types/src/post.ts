import { UUIDv7, Pagination, ISODate } from './core.js';

export type PostStatus = 'visible' | 'hidden' | 'deleted';
export type PostFilter = 'all' | 'following' | 'trending';

export interface Post {
    id: UUIDv7;
    userId: UUIDv7;
    title: string;
    content: string;
    status: PostStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface PostInsert {
    userId: UUIDv7;
    title: string;
    content: string;
    status?: PostStatus;
}

export interface PostUpdate {
    title?: string;
    content?: string;
    status?: PostStatus;
}

export interface PostWithUser extends Post {
    username: string;
    avatarUrl: string;
}

export interface PostWithStats extends Post {
    commentCount: number;
    reactionCount: number;
}

export interface PostWithRun extends Post {
    distance: number;
    durationSeconds: number;
    averagePaceSec: number | null;
    elevationGain: number | null;
    gpsRouteData: string | null;
    startTime: Date;
    endTime: Date;
}

export interface PostQueryParams {
    page?: number;
    limit?: number;
    userId?: UUIDv7;
    filter?: PostFilter;
}

export interface PaginatedPosts<T = PostWithUser> {
    posts: T[];
    pagination?: Pagination;
}

export interface PostRecord {
    id?: UUIDv7;
    userId: UUIDv7;
    title: string;
    content: string;
    status: PostStatus;
    createdAt: ISODate;
    updatedAt: ISODate;
}
