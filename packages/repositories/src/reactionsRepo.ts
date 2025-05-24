import { ReactionVO } from '@phyt/models';

import type { ReactionsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    ReactionInsert,
    ReactionType,
    ReactionWithUser,
    ReactionCount
} from '@phyt/types';

export type ReactionsRepository = ReturnType<typeof makeReactionsRepository>;

export const makeReactionsRepository = (ops: ReactionsDrizzleOps) => {
    const save = async (input: ReactionInsert): Promise<ReactionVO> => {
        const data = await ops.create(input);
        return ReactionVO.from(data);
    };

    const findById = async (reactionId: UUIDv7): Promise<ReactionVO> => {
        const data = await ops.findById(reactionId);
        return ReactionVO.from(data);
    };

    const findByUser = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7,
        type?: ReactionType
    ): Promise<ReactionVO> => {
        const data = await ops.findByUserId(userId, postId, commentId, type);
        return ReactionVO.from(data);
    };

    const findByPost = async (postId: UUIDv7): Promise<ReactionVO[]> => {
        const data = await ops.findReactionsWithUsers(postId);
        return data.map((reaction: ReactionWithUser) =>
            ReactionVO.from(reaction, {
                username: reaction.username,
                avatarUrl: reaction.avatarUrl
            })
        );
    };

    const findByComment = async (commentId: UUIDv7): Promise<ReactionVO[]> => {
        const data = await ops.findReactionsWithUsers(undefined, commentId);
        return data.map((reaction: ReactionWithUser) =>
            ReactionVO.from(reaction, {
                username: reaction.username,
                avatarUrl: reaction.avatarUrl
            })
        );
    };

    const getCountsForPost = async (postId: UUIDv7): Promise<ReactionCount> => {
        return await ops.findReactionCountByPost(postId);
    };

    const getCountsForComment = async (
        commentId: UUIDv7
    ): Promise<ReactionCount> => {
        return await ops.findReactionCountByComment(commentId);
    };

    const findUserReactions = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7
    ): Promise<ReactionVO[]> => {
        const data = await ops.findUserReactions(userId, postId, commentId);
        return data.map((reaction) => ReactionVO.from(reaction));
    };

    const findWithUsers = async (
        postId?: UUIDv7,
        commentId?: UUIDv7
    ): Promise<ReactionVO[]> => {
        const data = await ops.findReactionsWithUsers(postId, commentId);
        return data.map((reaction: ReactionWithUser) =>
            ReactionVO.from(reaction, {
                username: reaction.username,
                avatarUrl: reaction.avatarUrl
            })
        );
    };

    const calculateTrendingScore = async (
        postId: UUIDv7,
        daysAgo: number
    ): Promise<number> => {
        return ops.calculateTrendingScore(postId, daysAgo);
    };

    const remove = async (reactionId: UUIDv7): Promise<ReactionVO> => {
        const data = await ops.remove(reactionId);
        return ReactionVO.from(data);
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
        findWithUsers,
        calculateTrendingScore,
        remove
    };
};
