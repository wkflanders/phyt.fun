import { Request, Response, RequestHandler } from 'express';

import { z } from 'zod';

import {
    ReactionSchema,
    ReactionWithUserSchema,
    ReactionCountSchema,
    ReactionToggleSchema,
    CreateReactionSchema,
    ReactionQuerySchema,
    CreateReactionDTO,
    ReactionDTO,
    ReactionWithUserDTO,
    ReactionCountDTO,
    ReactionToggleDTO
} from '@phyt/dto';
import { ReactionsService } from '@phyt/services';
import { UUIDv7 } from '@phyt/types';

import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

// Define param schemas using z.object for proper Zod schema types
const PostIdParamSchema = z.object({ postId: z.string().uuid() });
const CommentIdParamSchema = z.object({ commentId: z.string().uuid() });
const UserPostParamsSchema = z.object({
    userId: z.string().uuid(),
    postId: z.string().uuid()
});
const UserCommentParamsSchema = z.object({
    userId: z.string().uuid(),
    commentId: z.string().uuid()
});

export interface ReactionsController {
    toggleReaction: RequestHandler[];
    getPostReactions: RequestHandler[];
    getCommentReactions: RequestHandler[];
    getUserPostReactions: RequestHandler[];
    getUserCommentReactions: RequestHandler[];
    getAllReactionsForPost: RequestHandler[];
    getAllReactionsForComment: RequestHandler[];
}

interface ApiError extends Error {
    statusCode?: number;
}

export const makeReactionsController = (
    reactionsService: ReactionsService
): ReactionsController => {
    const toggleReaction = [
        validateAuth,
        validateSchema(undefined, CreateReactionSchema),
        async (
            req: Request<
                Record<string, never>,
                ReactionToggleDTO,
                CreateReactionDTO
            >,
            res: Response<ReactionToggleDTO>
        ) => {
            try {
                const { userId, postId, commentId, type } = req.body;
                const isPost = Boolean(postId);

                // The CreateReactionSchema ensures either postId or commentId exists
                // but we need to satisfy TypeScript that we have a valid entityId
                let entityId: UUIDv7;
                if (isPost && postId) {
                    entityId = postId;
                } else if (commentId) {
                    entityId = commentId;
                } else {
                    // This should never happen due to schema validation
                    throw new Error('Missing both postId and commentId');
                }

                const result = await reactionsService.toggleReaction(
                    userId,
                    entityId,
                    type,
                    isPost
                );

                res.status(200).json(result);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to toggle reaction';
                res.status(500).json({
                    error: message
                } as unknown as ReactionToggleDTO);
            }
        }
    ] as RequestHandler[];

    const getPostReactions = [
        validateAuth,
        validateSchema(PostIdParamSchema),
        async (
            req: Request<{ postId: UUIDv7 }, ReactionCountDTO>,
            res: Response<ReactionCountDTO>
        ) => {
            try {
                const { postId } = req.params;
                const counts = await reactionsService.getReactionCounts(
                    postId,
                    true
                );
                res.status(200).json(counts);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to get post reactions';
                res.status(500).json({
                    error: message
                } as unknown as ReactionCountDTO);
            }
        }
    ] as RequestHandler[];

    const getCommentReactions = [
        validateAuth,
        validateSchema(CommentIdParamSchema),
        async (
            req: Request<{ commentId: UUIDv7 }, ReactionCountDTO>,
            res: Response<ReactionCountDTO>
        ) => {
            try {
                const { commentId } = req.params;
                const counts = await reactionsService.getReactionCounts(
                    commentId,
                    false
                );
                res.status(200).json(counts);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to get comment reactions';
                res.status(500).json({
                    error: message
                } as unknown as ReactionCountDTO);
            }
        }
    ] as RequestHandler[];

    const getUserPostReactions = [
        validateAuth,
        validateSchema(UserPostParamsSchema),
        async (
            req: Request<{ userId: UUIDv7; postId: UUIDv7 }, ReactionDTO[]>,
            res: Response<ReactionDTO[]>
        ) => {
            try {
                const { userId, postId } = req.params;
                const reactions = await reactionsService.getUserReactions(
                    userId,
                    postId,
                    true
                );
                res.status(200).json(reactions);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to get user post reactions';
                res.status(500).json([]);
            }
        }
    ] as RequestHandler[];

    const getUserCommentReactions = [
        validateAuth,
        validateSchema(UserCommentParamsSchema),
        async (
            req: Request<{ userId: UUIDv7; commentId: UUIDv7 }, ReactionDTO[]>,
            res: Response<ReactionDTO[]>
        ) => {
            try {
                const { userId, commentId } = req.params;
                const reactions = await reactionsService.getUserReactions(
                    userId,
                    commentId,
                    false
                );
                res.status(200).json(reactions);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to get user comment reactions';
                res.status(500).json([]);
            }
        }
    ] as RequestHandler[];

    const getAllReactionsForPost = [
        validateAuth,
        validateSchema(PostIdParamSchema),
        async (
            req: Request<{ postId: UUIDv7 }, ReactionWithUserDTO[]>,
            res: Response<ReactionWithUserDTO[]>
        ) => {
            try {
                const { postId } = req.params;
                const reactions = await reactionsService.getReactionsWithUsers(
                    postId,
                    true
                );
                res.status(200).json(reactions);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to get all post reactions';
                res.status(500).json([]);
            }
        }
    ] as RequestHandler[];

    const getAllReactionsForComment = [
        validateAuth,
        validateSchema(CommentIdParamSchema),
        async (
            req: Request<{ commentId: UUIDv7 }, ReactionWithUserDTO[]>,
            res: Response<ReactionWithUserDTO[]>
        ) => {
            try {
                const { commentId } = req.params;
                const reactions = await reactionsService.getReactionsWithUsers(
                    commentId,
                    false
                );
                res.status(200).json(reactions);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to get all comment reactions';
                res.status(500).json([]);
            }
        }
    ] as RequestHandler[];

    return {
        toggleReaction,
        getPostReactions,
        getCommentReactions,
        getUserPostReactions,
        getUserCommentReactions,
        getAllReactionsForPost,
        getAllReactionsForComment
    };
};
