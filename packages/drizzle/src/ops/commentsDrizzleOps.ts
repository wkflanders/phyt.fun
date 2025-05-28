import { eq, and, isNull, desc, count, InferSelectModel } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { comments, users } from '../schema.js';

import type {
    UUIDv7,
    Comment,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams,
    PaginatedComments,
    AvatarUrl
} from '@phyt/types';

const toComment = ({
    commentRow,
    username,
    avatarUrl
}: {
    commentRow: InferSelectModel<typeof comments>;
    username?: string;
    avatarUrl?: AvatarUrl;
}): Comment => {
    return {
        id: commentRow.id as UUIDv7,
        postId: commentRow.postId as UUIDv7,
        userId: commentRow.userId as UUIDv7,
        content: commentRow.content,
        parentCommentId: commentRow.parentCommentId as UUIDv7 | null,
        createdAt: commentRow.createdAt,
        updatedAt: commentRow.updatedAt,
        deletedAt: commentRow.deletedAt,
        ...(username !== undefined ? { username } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {})
    };
};

export type CommentsDrizzleOps = ReturnType<typeof makeCommentsDrizzleOps>;

export const makeCommentsDrizzleOps = ({ db }: { db: DrizzleDB }) => {
    const create = async ({
        input
    }: {
        input: CommentInsert;
    }): Promise<Comment> => {
        const [row] = await db
            .insert(comments)
            .values({
                ...input,
                id: uuidv7()
            })
            .returning();

        return toComment({ commentRow: row });
    };

    const findById = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<Comment> => {
        const [row] = await db
            .select()
            .from(comments)
            .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)))
            .limit(1);

        return toComment({ commentRow: row });
    };

    const listForPost = async ({
        postId,
        params
    }: {
        postId: UUIDv7;
        params: CommentQueryParams;
    }): Promise<PaginatedComments> =>
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

    const listReplies = async ({
        parentCommentId,
        params
    }: {
        parentCommentId: UUIDv7;
        params: CommentQueryParams;
    }): Promise<PaginatedComments> =>
        paginate(
            and(
                eq(comments.parentCommentId, parentCommentId),
                isNull(comments.deletedAt)
            ),
            params
        );

    const update = async ({
        commentId,
        update
    }: {
        commentId: UUIDv7;
        update: CommentUpdate;
    }): Promise<Comment> => {
        const [row] = await db
            .update(comments)
            .set({ ...update, updatedAt: new Date() })
            .where(eq(comments.id, commentId))
            .returning();

        return toComment({ commentRow: row });
    };

    const remove = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<Comment> => {
        const [row] = await db
            .update(comments)
            .set({ deletedAt: new Date() })
            .where(eq(comments.id, commentId))
            .returning();

        return toComment({ commentRow: row });
    };

    const unsafeRemove = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<Comment> => {
        const [row] = await db
            .delete(comments)
            .where(eq(comments.id, commentId))
            .returning();

        return toComment({ commentRow: row });
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
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
                toComment({
                    commentRow: comment,
                    username: user.username,
                    avatarUrl: user.avatarUrl
                })
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
