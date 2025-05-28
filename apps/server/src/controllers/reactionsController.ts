import {
    CreateReactionSchema,
    CommentIdSchema,
    PostIdSchema,
    UserIdSchema
} from '@phyt/dto';

import { ReactionsService } from '@phyt/services';

import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

import { Request, Response, RequestHandler } from 'express';

import type {
    UserIdDTO,
    PostIdDTO,
    CommentIdDTO,
    CreateReactionDTO,
    ReactionDTO,
    ReactionCountDTO
} from '@phyt/dto';

export interface ReactionsController {
    addReaction: RequestHandler[];
    getPostReactions: RequestHandler[];
    getCommentReactions: RequestHandler[];
    getUserPostReactions: RequestHandler[];
    getUserCommentReactions: RequestHandler[];
    getAllReactionsForPost: RequestHandler[];
    getAllReactionsForComment: RequestHandler[];
}

export const makeReactionsController = (
    reactionsServices: ReactionsService
): ReactionsController => {
    const addReaction = [
        validateAuth,
        validateSchema({ bodySchema: CreateReactionSchema }),
        async (
            req: Request<Record<string, never>, ReactionDTO, CreateReactionDTO>,
            res: Response<ReactionDTO>
        ) => {
            const reaction = await reactionsServices.addReaction({
                input: req.body
            });
            res.status(200).json(reaction);
        }
    ] as RequestHandler[];

    const getPostReactions = [
        validateAuth,
        validateSchema({ paramsSchema: PostIdSchema }),
        async (
            req: Request<PostIdDTO, ReactionCountDTO, Record<string, never>>,
            res: Response<ReactionCountDTO>
        ) => {
            const counts = await reactionsServices.getReactionCounts({
                entityId: req.params,
                entityType: 'post'
            });
            res.status(200).json(counts);
        }
    ] as RequestHandler[];

    const getCommentReactions = [
        validateAuth,
        validateSchema({ paramsSchema: CommentIdSchema }),
        async (
            req: Request<CommentIdDTO, ReactionCountDTO, Record<string, never>>,
            res: Response<ReactionCountDTO>
        ) => {
            const counts = await reactionsServices.getReactionCounts({
                entityId: req.params,
                entityType: 'comment'
            });
            res.status(200).json(counts);
        }
    ] as RequestHandler[];

    const getUserPostReactions = [
        validateAuth,
        validateSchema({ paramsSchema: UserIdSchema }),
        async (
            req: Request<
                UserIdDTO,
                ReactionDTO[],
                Record<string, never>,
                PostIdDTO
            >,
            res: Response<ReactionDTO[]>
        ) => {
            const reactions = await reactionsServices.getUserReactions({
                userId: req.params,
                entityId: req.query,
                entityType: 'post'
            });
            res.status(200).json(reactions);
        }
    ] as RequestHandler[];

    const getUserCommentReactions = [
        validateAuth,
        validateSchema({ paramsSchema: UserIdSchema }),
        async (
            req: Request<
                UserIdDTO,
                ReactionDTO[],
                Record<string, never>,
                CommentIdDTO
            >,
            res: Response<ReactionDTO[]>
        ) => {
            const reactions = await reactionsServices.getUserReactions({
                userId: req.params,
                entityId: req.query,
                entityType: 'comment'
            });
            res.status(200).json(reactions);
        }
    ] as RequestHandler[];

    const getAllReactionsForPost = [
        validateAuth,
        validateSchema({ paramsSchema: PostIdSchema }),
        async (
            req: Request<PostIdDTO, ReactionDTO[], Record<string, never>>,
            res: Response<ReactionDTO[]>
        ) => {
            const reactions = await reactionsServices.getReactions({
                entityId: req.params,
                entityType: 'post'
            });
            res.status(200).json(reactions);
        }
    ] as RequestHandler[];

    const getAllReactionsForComment = [
        validateAuth,
        validateSchema({ paramsSchema: CommentIdSchema }),
        async (
            req: Request<CommentIdDTO, ReactionDTO[], Record<string, never>>,
            res: Response<ReactionDTO[]>
        ) => {
            const reactions = await reactionsServices.getReactions({
                entityId: req.params,
                entityType: 'comment'
            });
            res.status(200).json(reactions);
        }
    ] as RequestHandler[];

    return {
        addReaction,
        getPostReactions,
        getCommentReactions,
        getUserPostReactions,
        getUserCommentReactions,
        getAllReactionsForPost,
        getAllReactionsForComment
    };
};
