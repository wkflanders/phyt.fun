import { and, count, eq, gt } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { reactions, users, comments } from '../schema.js';

import type {
    UUIDv7,
    ReactionInsert,
    Reaction,
    ReactionCount,
    ReactionWithUser,
    ReactionType
} from '@phyt/types';

const toReaction = (record: typeof reactions.$inferSelect): Reaction => ({
    id: record.id as UUIDv7,
    userId: record.userId as UUIDv7,
    postId: record.postId as UUIDv7 | null,
    commentId: record.commentId as UUIDv7 | null,
    type: record.type,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
});

const toReactionWithUser = (
    reaction: typeof reactions.$inferSelect,
    user: typeof users.$inferSelect | null
): ReactionWithUser => ({
    ...toReaction(reaction),
    username: user?.username ?? '',
    avatarUrl: user?.avatarUrl ?? ''
});

export type ReactionsDrizzleOps = ReturnType<typeof makeReactionsDrizzleOps>;

export const makeReactionsDrizzleOps = (db: DrizzleDB) => {
    const create = async (data: ReactionInsert): Promise<Reaction> => {
        const [record] = await db
            .insert(reactions)
            .values({
                ...data,
                id: uuidv7()
            })
            .returning();

        return toReaction(record);
    };

    const findById = async (reactionId: UUIDv7): Promise<Reaction> => {
        const [record] = await db
            .select()
            .from(reactions)
            .where(eq(reactions.id, reactionId))
            .limit(1);

        return toReaction(record);
    };

    const findByUserId = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7,
        type?: ReactionType
    ): Promise<Reaction> => {
        const conditions = [eq(reactions.userId, userId)];

        if (postId) {
            conditions.push(eq(reactions.postId, postId));
        } else if (commentId) {
            conditions.push(eq(reactions.commentId, commentId));
        }

        if (type) {
            conditions.push(eq(reactions.type, type));
        }

        const [record] = await db
            .select()
            .from(reactions)
            .where(and(...conditions))
            .limit(1);

        return toReaction(record);
    };

    const findReactionCountByPost = async (
        postId: UUIDv7
    ): Promise<ReactionCount> => {
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

    const findReactionCountByComment = async (
        commentId: UUIDv7
    ): Promise<ReactionCount> => {
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

    const findUserReactions = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7
    ): Promise<Reaction[]> => {
        const conditions = [eq(reactions.userId, userId)];

        if (postId) {
            conditions.push(eq(reactions.postId, postId));
        } else if (commentId) {
            conditions.push(eq(reactions.commentId, commentId));
        }

        const records = await db
            .select()
            .from(reactions)
            .where(and(...conditions));

        return records.map(toReaction);
    };

    const findReactionsWithUsers = async (
        postId?: UUIDv7,
        commentId?: UUIDv7
    ): Promise<ReactionWithUser[]> => {
        const conditions = [];

        if (postId) {
            conditions.push(eq(reactions.postId, postId));
        } else if (commentId) {
            conditions.push(eq(reactions.commentId, commentId));
        }

        const rows = await db
            .select({ reaction: reactions, user: users })
            .from(reactions)
            .leftJoin(users, eq(reactions.userId, users.id))
            .where(conditions.length ? and(...conditions) : undefined);

        return rows.map(({ reaction, user }) =>
            toReactionWithUser(reaction, user)
        );
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

    const unsafeRemove = async (reactionId: UUIDv7): Promise<Reaction> => {
        const [record] = await db
            .delete(reactions)
            .where(eq(reactions.id, reactionId))
            .returning();

        return toReaction(record);
    };

    return {
        create,
        findById,
        findByUserId,
        findReactionCountByPost,
        findReactionCountByComment,
        findUserReactions,
        findReactionsWithUsers,
        calculateTrendingScore,
        unsafeRemove
    };
};
