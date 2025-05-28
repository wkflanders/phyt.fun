import { and, count, eq, gt, InferSelectModel, desc, asc } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { reactions, users, comments } from '../schema.js';

import type {
    UUIDv7,
    Reaction,
    ReactionInsert,
    ReactionCount,
    ReactionType,
    ReactionQueryParams,
    PaginatedReactions,
    AvatarUrl
} from '@phyt/types';

const toReaction = ({
    reactionRow,
    username,
    avatarUrl
}: {
    reactionRow: InferSelectModel<typeof reactions>;
    username?: string;
    avatarUrl?: AvatarUrl;
}): Reaction => ({
    id: reactionRow.id as UUIDv7,
    userId: reactionRow.userId as UUIDv7,
    postId: reactionRow.postId as UUIDv7 | null,
    commentId: reactionRow.commentId as UUIDv7 | null,
    type: reactionRow.type,
    createdAt: reactionRow.createdAt,
    updatedAt: reactionRow.updatedAt,
    ...(username !== undefined ? { username } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {})
});

export type ReactionsDrizzleOps = ReturnType<typeof makeReactionsDrizzleOps>;

export const makeReactionsDrizzleOps = ({ db }: { db: DrizzleDB }) => {
    const create = async ({
        input
    }: {
        input: ReactionInsert;
    }): Promise<Reaction> => {
        const [row] = await db
            .insert(reactions)
            .values({
                ...input,
                id: uuidv7()
            })
            .returning();

        return toReaction({ reactionRow: row });
    };

    const findById = async ({
        reactionId
    }: {
        reactionId: UUIDv7;
    }): Promise<Reaction> => {
        const [record] = await db
            .select()
            .from(reactions)
            .where(eq(reactions.id, reactionId))
            .limit(1);

        return toReaction({ reactionRow: record });
    };

    const findByUserId = async ({
        userId,
        entityId,
        entityType,
        type
    }: {
        userId: UUIDv7;
        entityId: UUIDv7;
        entityType: 'post' | 'comment';
        type?: ReactionType;
    }): Promise<Reaction> => {
        const conditions = [eq(reactions.userId, userId)];

        if (entityType === 'post') {
            conditions.push(eq(reactions.postId, entityId));
        } else {
            conditions.push(eq(reactions.commentId, entityId));
        }

        if (type) {
            conditions.push(eq(reactions.type, type));
        }

        const [record] = await db
            .select()
            .from(reactions)
            .where(and(...conditions))
            .limit(1);

        return toReaction({ reactionRow: record });
    };

    const findReactionCountByPost = async ({
        postId
    }: {
        postId: UUIDv7;
    }): Promise<ReactionCount> => {
        const reactionCounts = await db
            .select({
                type: reactions.type,
                count: count()
            })
            .from(reactions)
            .where(eq(reactions.postId, postId))
            .groupBy(reactions.type);

        const result: ReactionCount = {
            like: 0,
            funny: 0,
            insightful: 0,
            fire: 0
        };

        for (const row of reactionCounts) {
            result[row.type as keyof ReactionCount] = Number(row.count);
        }

        return result;
    };

    const findReactionCountByComment = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<ReactionCount> => {
        const reactionCounts = await db
            .select({
                type: reactions.type,
                count: count()
            })
            .from(reactions)
            .where(eq(reactions.commentId, commentId))
            .groupBy(reactions.type);

        const result: ReactionCount = {
            like: 0,
            funny: 0,
            insightful: 0,
            fire: 0
        };

        for (const row of reactionCounts) {
            result[row.type as keyof ReactionCount] = Number(row.count);
        }

        return result;
    };

    const findUserReactions = async ({
        userId,
        postId,
        commentId,
        params
    }: {
        userId: UUIDv7;
        postId?: UUIDv7;
        commentId?: UUIDv7;
        params?: ReactionQueryParams;
    }): Promise<PaginatedReactions> => {
        const conditions = [eq(reactions.userId, userId)];

        if (postId) {
            conditions.push(eq(reactions.postId, postId));
        } else if (commentId) {
            conditions.push(eq(reactions.commentId, commentId));
        }

        return paginate(and(...conditions), params);
    };

    const findReactionsWithUsers = async ({
        entityId,
        entityType,
        params
    }: {
        entityId: UUIDv7;
        entityType: 'post' | 'comment';
        params?: ReactionQueryParams;
    }): Promise<PaginatedReactions> => {
        const conditions = [];

        if (entityType === 'post') {
            conditions.push(eq(reactions.postId, entityId));
        } else {
            conditions.push(eq(reactions.commentId, entityId));
        }

        return paginateWithUsers(
            conditions.length ? and(...conditions) : undefined,
            params
        );
    };

    const paginateWithUsers = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and> | undefined,
        params: ReactionQueryParams = {}
    ): Promise<PaginatedReactions> => {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = params;
        const offset = (page - 1) * limit;

        const orderByClause =
            sortOrder === 'asc'
                ? asc(reactions[sortBy])
                : desc(reactions[sortBy]);

        const [{ total }] = await db
            .select({ total: count() })
            .from(reactions)
            .where(cond);

        const rows = await db
            .select({ reaction: reactions, user: users })
            .from(reactions)
            .leftJoin(users, eq(reactions.userId, users.id))
            .where(cond)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);

        return {
            reactions: rows.map(({ reaction, user }) => {
                return toReaction({
                    reactionRow: reaction,
                    username: user?.username ?? '',
                    avatarUrl: user?.avatarUrl ?? ''
                });
            }),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    const calculateTrendingScore = async (
        postId: UUIDv7,
        daysAgo: number
    ): Promise<number> => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

        const reactionRows = await db
            .select({ count: count() })
            .from(reactions)
            .where(
                and(
                    eq(reactions.postId, postId),
                    gt(reactions.createdAt, cutoffDate)
                )
            );
        const reactionResult = reactionRows[0] as { count: number };

        const commentRows = await db
            .select({ count: count() })
            .from(comments)
            .where(
                and(
                    eq(comments.postId, postId),
                    gt(comments.createdAt, cutoffDate)
                )
            );
        const commentResult = commentRows[0] as { count: number };

        return reactionResult.count + commentResult.count;
    };

    const listReactions = async ({
        params
    }: {
        params: ReactionQueryParams;
    }): Promise<PaginatedReactions> => {
        return paginate(undefined, params);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and> | undefined,
        params: ReactionQueryParams = {}
    ): Promise<PaginatedReactions> => {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = params;
        const offset = (page - 1) * limit;

        const orderByClause =
            sortOrder === 'asc'
                ? asc(reactions[sortBy])
                : desc(reactions[sortBy]);

        const [{ total }] = await db
            .select({ total: count() })
            .from(reactions)
            .where(cond);

        const rows = await db
            .select()
            .from(reactions)
            .where(cond)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);

        return {
            reactions: rows.map((record) =>
                toReaction({ reactionRow: record })
            ),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    const unsafeRemove = async ({
        reactionId
    }: {
        reactionId: UUIDv7;
    }): Promise<Reaction> => {
        const [record] = await db
            .delete(reactions)
            .where(eq(reactions.id, reactionId))
            .returning();

        return toReaction({ reactionRow: record });
    };

    return {
        create,
        findById,
        findByUserId,
        findReactionCountByPost,
        findReactionCountByComment,
        findUserReactions,
        findReactionsWithUsers,
        listReactions,
        calculateTrendingScore,
        unsafeRemove
    };
};
