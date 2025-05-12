import { UUIDv7, Pagination, ISODate } from './core.js';

export interface Comment {
    id: UUIDv7;
    postId: UUIDv7;
    userId: UUIDv7;
    content: string;
    parentCommentId: UUIDv7 | null;
    updatedAt: Date;
    createdAt: Date;
}

export interface CommentQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
}

export interface CreateCommentInput {
    userId: UUIDv7;
    postId: UUIDv7;
    content: string;
    parentCommentId: UUIDv7 | null;
}

export interface UpdateCommentInput {
    content: string;
}

export interface CommentRecord {
    id?: UUIDv7;
    postId: UUIDv7;
    authorId: UUIDv7;
    parentCommentId?: UUIDv7 | null;
    content: string;
    createdAt: ISODate;
    updatedAt?: ISODate;
}

export interface PaginatedComments {
    comments: {
        comment: Comment;
        user: {
            username: string;
            avatarUrl: string;
        };
    }[];
    pagination?: Pagination;
}
