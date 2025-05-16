import { ReactionVO, NotFoundError } from '@phyt/models';

import type { ReactionsDrizzleOps } from '@phyt/drizzle';
import type { UUIDv7, ReactionInsert, ReactionType } from '@phyt/types';

export type ReactionsRepository = ReturnType<typeof makeReactionsRepository>;

export const makeReactionsRepository = (ops: ReactionsDrizzleOps) => {
    const create = async (input: ReactionInsert): Promise<ReactionVO> => {
        const data = await ops.create(input);
        return ReactionVO.fromRecord(data);
    };

    const findById = async (reactionId: UUIDv7): Promise<ReactionVO> => {
        try {
            const data = await ops.findById(reactionId);
            return ReactionVO.fromRecord(data);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new NotFoundError(`Failed to find reaction: ${reactionId}`);
        }
    };

    const findExisting = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7,
        type?: ReactionType
    ): Promise<ReactionVO> => {
        const data = await ops.findExisting(userId, postId, commentId, type);
        return ReactionVO.fromRecord(data);
    };

    const remove = async (reactionId: UUIDv7): Promise<ReactionVO> => {
        const data = await ops.remove(reactionId);
        return ReactionVO.fromRecord(data);
    };

    const getReactionsForPost = async (
        postId: UUIDv7
    ): Promise<ReactionVO[]> => {
        const data = await ops.findReactionsWithUsers(postId);
        return data.map((reaction) => ReactionVO.fromRecord(reaction));
    };

    const getReactionsForComment = async (
        commentId: UUIDv7
    ): Promise<ReactionVO[]> => {
        const data = await ops.findReactionsWithUsers(undefined, commentId);
        return data.map((reaction) => ReactionVO.fromRecord(reaction));
    };

    const getReactionCountForPost = async (
        postId: UUIDv7
    ): Promise<ReactionVO> => {
        const counts = await ops.getReactionCountForPost(postId);
        return ReactionVO.fromCount(counts);
    };

    const getReactionCountForComment = async (
        commentId: UUIDv7
    ): Promise<ReactionVO> => {
        const counts = await ops.getReactionCountForComment(commentId);
        return ReactionVO.fromCount(counts);
    };

    const findUserReactions = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7
    ): Promise<ReactionVO[]> => {
        const data = await ops.findUserReactions(userId, postId, commentId);
        return data.map((reaction) => ReactionVO.fromRecord(reaction));
    };

    const findReactionsWithUsers = async (
        postId?: UUIDv7,
        commentId?: UUIDv7
    ): Promise<ReactionVO[]> => {
        const data = await ops.findReactionsWithUsers(postId, commentId);
        return data.map((reaction) => ReactionVO.fromWithUser(reaction));
    };

    return {
        create,
        findById,
        findExisting,
        remove,
        getReactionsForPost,
        getReactionsForComment,
        getReactionCountForPost,
        getReactionCountForComment,
        findUserReactions,
        findReactionsWithUsers
    };
};
