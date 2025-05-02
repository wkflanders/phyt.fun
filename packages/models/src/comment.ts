import { UUIDv7 } from './uuid.js';

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

export interface CommentPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CreateCommentRequest {
    userId: UUIDv7;
    postId: UUIDv7;
    content: string;
    parentCommentId: UUIDv7 | null;
}

export interface UpdateCommentContent {
    content: string;
}

export interface CommentResponse {
    comments: {
        comment: Comment;
        user: {
            username: string;
            avatarUrl: string;
        };
    }[];
    pagination?: CommentPagination;
}
