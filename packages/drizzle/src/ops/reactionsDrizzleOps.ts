import { and, count, eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

import { NotFoundError } from '@phyt/models';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { reactions, users } from '../schema.js';

import type {
    UUIDv7,
    ReactionInsert,
    Reaction,
    ReactionCount,
    ReactionWithUser,
    ReactionType
} from '@phyt/types';

const toData = (record: typeof reactions.$inferSelect): Reaction => ({
    id: record.id as UUIDv7,
    userId: record.userId as UUIDv7,
    postId: record.postId as UUIDv7 | undefined,
    commentId: record.commentId as UUIDv7 | undefined,
    type: record.type,
    createdAt: record.createdAt
});

const toReactionWithUser = (
    reaction: typeof reactions.$inferSelect,
    user: typeof users.$inferSelect | null
): ReactionWithUser => ({
    ...toData(reaction),
    username: user?.username ?? '',
    avatarUrl: user?.avatarUrl ?? null
});

// Default empty reaction count with zeros for all types
const defaultReactionCount: ReactionCount = {
    like: 0,
    funny: 0,
    insightful: 0,
    fire: 0
};

export type ReactionsDrizzleOps = ReturnType<typeof makeReactionsDrizzleOps>;

export const makeReactionsDrizzleOps = (db: DrizzleDB) => {
    const create = async (data: ReactionInsert): Promise<Reaction> => {
        const [record] = await db
            .insert(reactions)
            .values({
                id: uuidv7(),
                userId: data.userId,
                postId: data.postId,
                commentId: data.commentId,
                type: data.type
            })
            .returning();

        return toData(record);
    };

    const findById = async (reactionId: UUIDv7) => {
        const [record] = await db
            .select()
            .from(reactions)
            .where(eq(reactions.id, reactionId));

        if (!record) {
            throw new NotFoundError(`Reaction not found: ${reactionId}`);
        }

        return toData(record);
    };

    const findExisting = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7,
        type?: ReactionType
    ) => {
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
            .where(and(...conditions));

        if (!record) {
            throw new NotFoundError(`Reaction not found: ${userId}`);
        }

        return toData(record);
    };

    const remove = async (reactionId: UUIDv7) => {
        const [record] = await db
            .delete(reactions)
            .where(eq(reactions.id, reactionId))
            .returning();

        if (!record) {
            throw new NotFoundError(`Reaction not found: ${reactionId}`);
        }

        return toData(record);
    };

    const getReactionCountForPost = async (
        postId: UUIDv7
    ): Promise<ReactionCount> => {
        // Get all reaction types and counts
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

        // Update counts from the database results
        for (const row of reactionCounts) {
            result[row.type as keyof ReactionCount] = Number(row.count);
        }

        return result;
    };

    const getReactionCountForComment = async (
        commentId: UUIDv7
    ): Promise<ReactionCount> => {
        // Get all reaction types and counts
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
    ) => {
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

        return records.map(toData);
    };

    const findReactionsWithUsers = async (
        postId?: UUIDv7,
        commentId?: UUIDv7
    ) => {
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

    return {
        create,
        findById,
        findExisting,
        remove,
        getReactionCountForPost,
        getReactionCountForComment,
        findUserReactions,
        findReactionsWithUsers
    };
};
