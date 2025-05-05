import express, { Router, Request, Response } from 'express';

import {
    UUIDv7,
    ValidationError,
    ReactionToggleResponse,
    ReactionToggleRequest,
    ReactionCount,
    Reaction
} from '@phyt/types';

import { createReactionSchema } from '@/lib/validation.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';
import { reactionService } from '@/services/reactionServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Toggle a reaction on a post or comment
router.post(
    '/toggle',
    validateSchema(createReactionSchema),
    async (
        req: Request<
            Record<string, never>,
            ReactionToggleResponse,
            ReactionToggleRequest
        >,
        res: Response<ReactionToggleResponse>
    ) => {
        const { userId, postId, commentId, type } = req.body;

        if (!userId) {
            throw new ValidationError('Missing valid user Id');
        }

        if (!postId) {
            throw new ValidationError('Missing valid post Id');
        }

        if (!commentId) {
            throw new ValidationError('Missing valid comment Id');
        }

        if (!type.length) {
            throw new ValidationError('Missing valid reaction');
        }

        const result = await reactionService.toggleReaction({
            userId,
            postId,
            commentId,
            type
        });

        res.status(200).json(result);
    }
);

// Get reactions for a post
router.get(
    '/:postId',
    async (
        req: Request<{ postId: UUIDv7 }, ReactionCount>,
        res: Response<ReactionCount>
    ) => {
        const postId = req.params.postId;

        if (!postId) {
            throw new ValidationError('Invalid post ID');
        }

        const reactions = await reactionService.getPostReactions(postId);
        res.status(200).json(reactions);
    }
);

// Get reactions for a comment
router.get(
    '/:commentId',
    async (
        req: Request<{ commentId: UUIDv7 }, ReactionCount>,
        res: Response<ReactionCount>
    ) => {
        const commentId = req.params.commentId;
        if (!commentId) {
            throw new ValidationError('Invalid comment ID');
        }

        const reactions = await reactionService.getCommentReactions(commentId);
        res.status(200).json(reactions);
    }
);

// Get current user's reactions to a post
router.get(
    '/:userId/:postId',
    async (
        req: Request<{ userId: UUIDv7; postId: UUIDv7 }, Reaction[]>,
        res: Response<Reaction[]>
    ) => {
        const postId = req.params.postId;

        if (!postId) {
            throw new ValidationError('Invalid post ID');
        }

        const userId = req.params.userId;

        if (!userId) {
            throw new ValidationError('Invalid user ID');
        }

        const reactions = await reactionService.getUserPostReactions(
            userId,
            postId
        );

        res.status(200).json(reactions);
    }
);

// Get current user's reactions to a comment
router.get(
    '/:userId/:commentId',
    async (
        req: Request<{ userId: UUIDv7; commentId: UUIDv7 }, Reaction[]>,
        res: Response<Reaction[]>
    ) => {
        const { userId, commentId } = req.params;

        if (!userId) {
            throw new ValidationError('Missing valid user Id');
        }

        if (!commentId) {
            throw new ValidationError('Missing valid comment Id');
        }

        const reactions = await reactionService.getUserCommentReactions(
            userId,
            commentId
        );
        res.status(200).json(reactions);
    }
);

export { router as reactionsRouter };
