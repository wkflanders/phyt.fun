import { CommentDrizzleOps } from '@phyt/drizzle';

import type {
    UUIDv7,
    Comment,
    CommentQueryParams,
    CreateCommentInput,
    UpdateCommentInput,
    PaginatedComments
} from '@phyt/types';

export type CommentRepository = ReturnType<typeof makeCommentRepository>;

export const makeCommentRepository = (ops: CommentDrizzleOps) => ({
    create: async (input: CreateCommentInput): Promise<Comment> => {
        return await ops.create(input);
    },
    findById: async (commentId: UUIDv7): Promise<Comment | null> => {
        return ops.findById(commentId);
    },
    listForPost: async (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        return ops.listForPost(postId, params);
    },
    listReplies: async (
        parentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        return ops.listReplies(parentId, params);
    },
    update: async (
        commentId: UUIDv7,
        input: UpdateCommentInput
    ): Promise<Comment> => {
        return await ops.update(commentId, input);
    },
    remove: async (commentId: UUIDv7): Promise<Comment> => {
        return await ops.remove(commentId);
    }
});
