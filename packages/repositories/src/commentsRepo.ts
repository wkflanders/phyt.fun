import { CommentVO } from '@phyt/models';

import type { CommentDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    ISODate,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams,
    PaginatedComments
} from '@phyt/types';

export type CommentRepository = ReturnType<typeof makeCommentRepository>;

export const makeCommentRepository = (ops: CommentDrizzleOps) => ({
    create: async (input: CommentInsert) => {
        const data = await ops.create(input);
        return CommentVO.fromRecord({
            ...data,
            createdAt: data.createdAt.toISOString() as ISODate,
            updatedAt: data.updatedAt.toISOString() as ISODate
        });
    },

    findById: async (commentId: UUIDv7) => {
        const data = await ops.findById(commentId);
        if (!data) return null;
        return CommentVO.fromRecord({
            ...data,
            createdAt: data.createdAt.toISOString() as ISODate,
            updatedAt: data.updatedAt.toISOString() as ISODate
        });
    },

    listForPost: async (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        const { comments, pagination } = await ops.listForPost(postId, params);
        return {
            comments: comments.map((comment) => ({
                ...comment,
                createdAt: new Date(comment.createdAt),
                updatedAt: new Date(comment.updatedAt)
            })),
            pagination
        };
    },

    listReplies: async (
        parentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        const { comments, pagination } = await ops.listReplies(
            parentId,
            params
        );
        return {
            comments: comments.map((comment) => ({
                ...comment,
                createdAt: new Date(comment.createdAt),
                updatedAt: new Date(comment.updatedAt)
            })),
            pagination
        };
    },

    update: async (commentId: UUIDv7, input: CommentUpdate) => {
        const data = await ops.update(commentId, input);
        return CommentVO.fromRecord({
            ...data,
            createdAt: data.createdAt.toISOString() as ISODate,
            updatedAt: data.updatedAt.toISOString() as ISODate
        });
    },

    remove: async (commentId: UUIDv7) => {
        const data = await ops.remove(commentId);
        return CommentVO.fromRecord({
            ...data,
            createdAt: data.createdAt.toISOString() as ISODate,
            updatedAt: data.updatedAt.toISOString() as ISODate
        });
    }
});
