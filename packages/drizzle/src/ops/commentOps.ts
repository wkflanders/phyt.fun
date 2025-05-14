import { eq, and, isNull, desc, count } from 'drizzle-orm';

import {
    UUIDv7,
    CreateCommentInput,
    UpdateCommentInput,
    CommentQueryParams,
    Comment,
    PaginatedComments
} from '@phyt/types';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { comments, users } from '../schema.js';

const toData = (commentRow: typeof comments.$inferSelect): Comment => ({
    id: commentRow.id as UUIDv7,
    postId: commentRow.postId as UUIDv7,
    userId: commentRow.userId as UUIDv7,
    content: commentRow.content,
    parentCommentId: commentRow.parentCommentId as UUIDv7 | null,
    createdAt: commentRow.createdAt,
    updatedAt: commentRow.updatedAt
});

export type CommentDrizzleOps = ReturnType<typeof makeCommentDrizzleOps>;

export const makeCommentDrizzleOps = (db: DrizzleDB) => {
    const create = async (input: CreateCommentInput): Promise<Comment> => {
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
        const row = await db.query.comments.findFirst({
            where: eq(comments.id, commentId)
        });
        return row ? toData(row) : null;
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        const { page = 1, limit = 20 } = params;
        const off = (page - 1) * limit;

        const [{ total }] = await db
            .select({ total: count() })
            .from(comments)
            .where(cond);

        const rows = await db
            .select({ comment: comments, user: users })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(cond)
            .orderBy(desc(comments.createdAt))
            .limit(limit)
            .offset(off);

        return {
            comments: rows.map(({ comment, user }) => ({
                ...toData(comment),
                username: user?.username ?? '',
                avatarUrl: user?.avatarUrl ?? ''
            })),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / limit)
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

    const update = async (
        commentId: UUIDv7,
        input: UpdateCommentInput
    ): Promise<Comment> => {
        const [row] = await db
            .update(comments)
            .set({ content: input.content, updatedAt: new Date() })
            .where(eq(comments.id, commentId))
            .returning();
        return toData(row);
    };

    const remove = async (commentId: UUIDv7): Promise<Comment> => {
        const [row] = await db
            .delete(comments)
            .where(eq(comments.id, commentId))
            .returning();
        return toData(row);
    };

    return { create, findById, listForPost, listReplies, update, remove };
};
