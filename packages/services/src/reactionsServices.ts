import {
    ReactionSchema,
    ReactionWithUserSchema,
    ReactionToggleSchema,
    ReactionCountSchema,
    ReactionDTO,
    ReactionWithUserDTO,
    ReactionCountDTO,
    ReactionToggleDTO
} from '@phyt/dto';
import { ReactionVO, NotFoundError } from '@phyt/models';

import type { ReactionsRepository } from '@phyt/repositories';
import type { UUIDv7, ReactionType, ReactionAction } from '@phyt/types';

export type ReactionsService = ReturnType<typeof makeReactionsService>;

export const makeReactionsService = (repo: ReactionsRepository) => {
    const _findExisting = async (
        userId: UUIDv7,
        postId?: UUIDv7,
        commentId?: UUIDv7,
        type?: ReactionType
    ): Promise<ReactionVO> => {
        return await repo.findExisting(userId, postId, commentId, type);
    };

    const toggleReaction = async (
        userId: UUIDv7,
        entityId: UUIDv7,
        type: ReactionType,
        isPost: boolean
    ): Promise<ReactionToggleDTO> => {
        let action: ReactionAction = 'added';
        const postId = isPost ? entityId : undefined;
        const commentId = !isPost ? entityId : undefined;

        try {
            const existingVO = await _findExisting(
                userId,
                postId,
                commentId,
                type
            );

            await repo.remove(existingVO.id);
            action = 'removed';
        } catch (error) {
            if (error instanceof NotFoundError) {
                await repo.create({
                    userId,
                    postId,
                    commentId,
                    type
                });
            } else {
                throw error;
            }
        }

        const reactionVO = isPost
            ? await repo.getReactionCountForPost(entityId)
            : await repo.getReactionCountForComment(entityId);

        const toggleResponse = {
            action,
            reaction: type,
            counts: reactionVO.counts
        };

        return ReactionToggleSchema.parse(toggleResponse) as ReactionToggleDTO;
    };

    const getReactionCounts = async (
        entityId: UUIDv7,
        isPost: boolean
    ): Promise<ReactionCountDTO> => {
        const reactionVO = isPost
            ? await repo.getReactionCountForPost(entityId)
            : await repo.getReactionCountForComment(entityId);

        return ReactionCountSchema.parse(reactionVO.counts) as ReactionCountDTO;
    };

    const getUserReactions = async (
        userId: UUIDv7,
        entityId: UUIDv7,
        isPost: boolean
    ): Promise<ReactionDTO[]> => {
        const reactionVOs = await repo.findUserReactions(
            userId,
            isPost ? entityId : undefined,
            !isPost ? entityId : undefined
        );

        return reactionVOs.map(
            (reactionVO) =>
                ReactionSchema.parse(reactionVO.toDTO()) as ReactionDTO
        );
    };

    const getReactionsWithUsers = async (
        entityId: UUIDv7,
        isPost: boolean
    ): Promise<ReactionWithUserDTO[]> => {
        const reactionVOs = await repo.findReactionsWithUsers(
            isPost ? entityId : undefined,
            !isPost ? entityId : undefined
        );

        return reactionVOs.map(
            (reactionVO) =>
                ReactionWithUserSchema.parse(
                    reactionVO.toDTO()
                ) as ReactionWithUserDTO
        );
    };

    const calculateTrendingScore = async (
        postId: UUIDv7,
        daysAgo: number
    ): Promise<number> => {
        return repo.calculateTrendingScore(postId, daysAgo);
    };

    return Object.freeze({
        toggleReaction,
        getReactionCounts,
        getUserReactions,
        getReactionsWithUsers,
        calculateTrendingScore
    });
};
