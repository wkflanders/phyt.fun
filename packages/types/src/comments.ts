import { UUIDv7, Pagination, AvatarUrl } from './core.js';

export interface Comment {
    id: UUIDv7;
    postId: UUIDv7;
    userId: UUIDv7;
    parentCommentId: UUIDv7 | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    // Below are not included in the database table, but used in the API
    username?: string;
    avatarUrl?: AvatarUrl;
}

// export interface CommentWithUser extends Comment {
//     username: string;
//     avatarUrl: AvatarUrl;
// }

export interface CommentInsert {
    postId: UUIDv7;
    userId: UUIDv7;
    parentCommentId: UUIDv7 | null;
    content: string;
}

export interface CommentUpdate {
    content: string;
}

export interface CommentQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
}

export interface PaginatedComments<T = Comment> {
    comments: T[];
    pagination: Pagination;
}
