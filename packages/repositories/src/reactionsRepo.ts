import { ReactionsVO } from '@phyt/models';

import type { ReactionsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    ReactionInsert,
    ReactionType,
    ReactionCount,
    PaginatedReactions
} from '@phyt/types';

export type ReactionsRepository = ReturnType<typeof makeReactionsRepository>;

export const makeReactionsRepository = ({
    drizzleOps
}: {
    drizzleOps: ReactionsDrizzleOps;
}) => {
    const save = async ({
        input
    }: {
        input: ReactionInsert;
    }): Promise<ReactionsVO> => {
        const record = await drizzleOps.create({ input });
        return ReactionsVO.from({ reaction: record });
    };

    const findById = async ({
        reactionId
    }: {
        reactionId: UUIDv7;
    }): Promise<ReactionsVO> => {
        const record = await drizzleOps.findById({ reactionId });
        return ReactionsVO.from({ reaction: record });
    };

    const findByUser = async ({
        userId,
        entityId,
        entityType,
        type
    }: {
        userId: UUIDv7;
        entityId: UUIDv7;
        entityType: 'post' | 'comment';
        type?: ReactionType;
    }): Promise<ReactionsVO> => {
        const record = await drizzleOps.findByUserId({
            userId,
            entityId,
            entityType,
            type
        });
        return ReactionsVO.from({ reaction: record });
    };

    const findByPost = async ({
        postId
    }: {
        postId: UUIDv7;
    }): Promise<PaginatedReactions<ReactionsVO>> => {
        const paginatedRecords = await drizzleOps.findReactionsWithUsers({
            entityId: postId,
            entityType: 'post'
        });
        return {
            reactions: paginatedRecords.reactions.map((reaction) =>
                ReactionsVO.from({ reaction })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const findByComment = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<PaginatedReactions<ReactionsVO>> => {
        const paginatedRecords = await drizzleOps.findReactionsWithUsers({
            entityId: commentId,
            entityType: 'comment'
        });
        return {
            reactions: paginatedRecords.reactions.map((reaction) =>
                ReactionsVO.from({ reaction })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const getCountsForPost = async ({
        postId
    }: {
        postId: UUIDv7;
    }): Promise<ReactionCount> => {
        return await drizzleOps.findReactionCountByPost({ postId });
    };

    const getCountsForComment = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<ReactionCount> => {
        return await drizzleOps.findReactionCountByComment({ commentId });
    };

    const findUserReactions = async ({
        userId,
        postId,
        commentId
    }: {
        userId: UUIDv7;
        postId?: UUIDv7;
        commentId?: UUIDv7;
    }): Promise<PaginatedReactions<ReactionsVO>> => {
        const paginatedRecords = await drizzleOps.findUserReactions({
            userId,
            postId,
            commentId
        });
        return {
            reactions: paginatedRecords.reactions.map((reaction) =>
                ReactionsVO.from({ reaction })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const findByPostWithUsers = async ({
        postId
    }: {
        postId: UUIDv7;
    }): Promise<PaginatedReactions<ReactionsVO>> => {
        const paginatedRecords = await drizzleOps.findReactionsWithUsers({
            entityId: postId,
            entityType: 'post'
        });
        return {
            reactions: paginatedRecords.reactions.map((reaction) =>
                ReactionsVO.from({ reaction })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const findByCommentWithUsers = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<PaginatedReactions<ReactionsVO>> => {
        const paginatedRecords = await drizzleOps.findReactionsWithUsers({
            entityId: commentId,
            entityType: 'comment'
        });
        return {
            reactions: paginatedRecords.reactions.map((reaction) =>
                ReactionsVO.from({ reaction })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const calculateTrendingScore = async (
        postId: UUIDv7,
        daysAgo: number
    ): Promise<number> => {
        return await drizzleOps.calculateTrendingScore(postId, daysAgo);
    };

    const remove = async ({
        reactionId
    }: {
        reactionId: UUIDv7;
    }): Promise<ReactionsVO> => {
        const record = await drizzleOps.unsafeRemove({ reactionId });
        return ReactionsVO.from({ reaction: record });
    };

    return {
        save,
        findById,
        findByUser,
        findByPost,
        findByComment,
        getCountsForPost,
        getCountsForComment,
        findUserReactions,
        findByPostWithUsers,
        findByCommentWithUsers,
        calculateTrendingScore,
        remove
    };
};
