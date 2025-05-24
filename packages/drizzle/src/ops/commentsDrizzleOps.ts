import { eq, and, isNull, desc, count } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { comments, users } from '../schema.js';

import type {
    UUIDv7,
    Comment,
    CommentWithUser,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams,
    PaginatedComments
} from '@phyt/types';

const toComment = (commentRow: typeof comments.$inferSelect): Comment => {
    return {
        id: commentRow.id as UUIDv7,
        postId: commentRow.postId as UUIDv7,
        userId: commentRow.userId as UUIDv7,
        content: commentRow.content,
        parentCommentId: commentRow.parentCommentId as UUIDv7 | null,
        createdAt: commentRow.createdAt,
        updatedAt: commentRow.updatedAt
    };
};

const toCommentWithUser = (
    commentRow: typeof comments.$inferSelect,
    user: typeof users.$inferSelect
): CommentWithUser => {
    return {
        ...toComment(commentRow),
        username: user.username,
        avatarUrl: user.avatarUrl
    };
};

export type CommentsDrizzleOps = ReturnType<typeof makeCommentsDrizzleOps>;

export const makeCommentsDrizzleOps = (db: DrizzleDB) => {
    const create = async (data: CommentInsert): Promise<Comment> => {
        const [row] = await db
            .insert(comments)
            .values({
                ...data,
                id: uuidv7()
            })
            .returning();

        return toComment(row);
    };

    const findById = async (commentId: UUIDv7): Promise<Comment> => {
        const [row] = await db
            .select()
            .from(comments)
            .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)))
            .limit(1);

        return toComment(row);
    };

    const listForPost = (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments<CommentWithUser>> =>
        paginate(
            params.parentOnly
                ? and(
                      eq(comments.postId, postId),
                      isNull(comments.parentCommentId),
                      isNull(comments.deletedAt)
                  )
                : and(eq(comments.postId, postId), isNull(comments.deletedAt)),
            params
        );

    const listReplies = (
        parent: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments<CommentWithUser>> =>
        paginate(
            and(
                eq(comments.parentCommentId, parent),
                isNull(comments.deletedAt)
            ),
            params
        );

    const update = async (
        commentId: UUIDv7,
        data: CommentUpdate
    ): Promise<Comment> => {
        const [row] = await db
            .update(comments)
            .set({ content: data.content, updatedAt: new Date() })
            .where(eq(comments.id, commentId))
            .returning();

        return toComment(row);
    };

    const remove = async (commentId: UUIDv7): Promise<Comment> => {
        const [row] = await db
            .update(comments)
            .set({ deletedAt: new Date() })
            .where(eq(comments.id, commentId))
            .returning();

        return toComment(row);
    };

    const unsafeRemove = async (commentId: UUIDv7): Promise<Comment> => {
        const [row] = await db
            .delete(comments)
            .where(eq(comments.id, commentId))
            .returning();

        return toComment(row);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: CommentQueryParams
    ): Promise<PaginatedComments<CommentWithUser>> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        const [{ total }] = await db
            .select({ total: count() })
            .from(comments)
            .where(cond);

        const rows = await db
            .select({ comment: comments, user: users })
            .from(comments)
            .innerJoin(users, eq(comments.userId, users.id))
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

    return {
        create,
        findById,
        listForPost,
        listReplies,
        update,
        remove,
        unsafeRemove
    };
};
