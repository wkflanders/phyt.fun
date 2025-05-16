import { eq, and, isNull, desc, count } from 'drizzle-orm';

import { NotFoundError } from '@phyt/models';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { comments, users } from '../schema.js';

import type {
    UUIDv7,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams,
    Comment,
    PaginatedComments,
    CommentWithUser
} from '@phyt/types';

const toData = (commentRow: typeof comments.$inferSelect): Comment => ({
    id: commentRow.id as UUIDv7,
    postId: commentRow.postId as UUIDv7,
    userId: commentRow.userId as UUIDv7,
    content: commentRow.content,
    parentCommentId: commentRow.parentCommentId as UUIDv7 | null,
    createdAt: commentRow.createdAt,
    updatedAt: commentRow.updatedAt
});

const toCommentWithUser = (
    comment: typeof comments.$inferSelect,
    user: typeof users.$inferSelect | null
): CommentWithUser => ({
    ...toData(comment),
    username: user?.username ?? '',
    avatarUrl: user?.avatarUrl ?? ''
});

export type CommentsDrizzleOps = ReturnType<typeof makeCommentsDrizzleOps>;

export const makeCommentsDrizzleOps = (db: DrizzleDB) => {
    const create = async (input: CommentInsert) => {
        const [row] = await db
            .insert(comments)
            .values({
                postId: input.postId,
                userId: input.userId,
                content: input.content,
                parentCommentId: input.parentCommentId
            })
            .returning();
        return toData(row);
    };

    const findById = async (commentId: UUIDv7) => {
        const [row] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);
        if (!row) {
            throw new NotFoundError('Comment not found');
        }
        return toData(row);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        // Get total count
        const [{ total }] = await db
            .select({ total: count() })
            .from(comments)
            .where(cond);

        // Query rows
        const rows = await db
            .select({ comment: comments, user: users })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(cond)
            .orderBy(desc(comments.createdAt), desc(comments.id))
            .limit(limit)
            .offset(offset);

        return {
            comments: rows.map(({ comment, user }) =>
                toCommentWithUser(comment, user)
            ),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    const listForPost = (postId: UUIDv7, params: CommentQueryParams) =>
        paginate(
            params.parentOnly
                ? and(
                      eq(comments.postId, postId),
                      isNull(comments.parentCommentId)
                  )
                : eq(comments.postId, postId),
            params
        );

    const listReplies = (parent: UUIDv7, params: CommentQueryParams) =>
        paginate(eq(comments.parentCommentId, parent), params);

    const update = async (commentId: UUIDv7, input: CommentUpdate) => {
        const [row] = await db
            .update(comments)
            .set({ content: input.content, updatedAt: new Date() })
            .where(eq(comments.id, commentId))
            .returning();
        if (!row) {
            throw new NotFoundError('Comment not found');
        }
        return toData(row);
    };

    const remove = async (commentId: UUIDv7) => {
        const [row] = await db
            .delete(comments)
            .where(eq(comments.id, commentId))
            .returning();
        if (!row) {
            throw new NotFoundError('Comment not found');
        }
        return toData(row);
    };

    return { create, findById, listForPost, listReplies, update, remove };
};
