import { ReactionsVO } from '@phyt/models';

import { ReactionSchema, ReactionCountSchema } from '@phyt/dto';

import type {
    UserIdDTO,
    ReactionDTO,
    CreateReactionDTO,
    ReactionCountDTO,
    EntityTypeDTO,
    EntityIdDTO,
    PostIdDTO,
    ReactionIdDTO
} from '@phyt/dto';
import type { ReactionsRepository } from '@phyt/repositories';

export type ReactionsService = ReturnType<typeof makeReactionsService>;

export const makeReactionsService = ({
    reactionsRepo
}: {
    reactionsRepo: ReactionsRepository;
}) => {
    const addReaction = async ({
        input
    }: {
        input: CreateReactionDTO;
    }): Promise<ReactionDTO> => {
        const reactionVO = ReactionsVO.create({ input });
        await reactionsRepo.save({ input: reactionVO });
        return ReactionSchema.parse(reactionVO.toDTO<ReactionDTO>());
    };

    const getReactionCounts = async ({
        entityId,
        entityType
    }: {
        entityId: EntityIdDTO;
        entityType: EntityTypeDTO;
    }): Promise<ReactionCountDTO> => {
        const reactionCount =
            entityType === 'post'
                ? await reactionsRepo.getCountsForPost({
                      postId: entityId
                  })
                : await reactionsRepo.getCountsForComment({
                      commentId: entityId
                  });
        return ReactionCountSchema.parse(reactionCount as ReactionCountDTO);
    };

    const getUserReactions = async ({
        userId,
        entityId,
        entityType
    }: {
        userId: UserIdDTO;
        entityId: EntityIdDTO;
        entityType: EntityTypeDTO;
    }): Promise<ReactionDTO[]> => {
        const reactionVOs =
            entityType === 'post'
                ? await reactionsRepo.findUserReactions({
                      userId,
                      postId: entityId
                  })
                : await reactionsRepo.findUserReactions({
                      userId,
                      commentId: entityId
                  });

        return reactionVOs.reactions.map((reactionVO) =>
            ReactionSchema.parse(reactionVO.toDTO<ReactionDTO>())
        );
    };

    const getReactions = async ({
        entityId,
        entityType
    }: {
        entityId: EntityIdDTO;
        entityType: EntityTypeDTO;
    }): Promise<ReactionDTO[]> => {
        const reactionsVOs =
            entityType === 'post'
                ? await reactionsRepo.findByPost({
                      postId: entityId
                  })
                : await reactionsRepo.findByComment({
                      commentId: entityId
                  });

        return reactionsVOs.reactions.map((reactionVO) =>
            ReactionSchema.parse(reactionVO.toDTO<ReactionDTO>())
        );
    };

    const calculateTrendingScore = async ({
        postId,
        daysAgo
    }: {
        postId: PostIdDTO;
        daysAgo: number;
    }): Promise<number> => {
        return reactionsRepo.calculateTrendingScore(postId, daysAgo);
    };

    const removeReaction = async ({
        reactionId
    }: {
        reactionId: ReactionIdDTO;
    }): Promise<ReactionDTO> => {
        const reactionVO = await reactionsRepo.remove({ reactionId });
        return ReactionSchema.parse(reactionVO.toDTO<ReactionDTO>());
    };

    return Object.freeze({
        addReaction,
        getReactionCounts,
        getUserReactions,
        getReactions,
        calculateTrendingScore,
        removeReaction
    });
};
