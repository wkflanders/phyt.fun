import { UUIDv7, Pagination, ISODate } from './core.js';

export interface Comment {
    id: UUIDv7;
    postId: UUIDv7;
    userId: UUIDv7;
    parentCommentId: UUIDv7 | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommentInsert {
    postId: UUIDv7;
    userId: UUIDv7;
    parentCommentId: UUIDv7 | null;
    content: string;
}

export interface CommentUpdate {
    content: string;
}

export interface CommentWithUser extends Comment {
    username: string;
    avatarUrl: string;
}

export interface CommentQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
}

export interface PaginatedComments {
    comments: CommentWithUser[];
    pagination?: Pagination;
}

export interface CommentRecord {
    id?: UUIDv7;
    postId: UUIDv7;
    userId: UUIDv7;
    parentCommentId: UUIDv7 | null;
    content: string;
    createdAt: ISODate;
    updatedAt: ISODate;
}
