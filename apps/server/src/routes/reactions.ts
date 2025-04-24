import {
    UUIDv7,
    ValidationError,
    ReactionToggleResponse,
    ReactionToggleRequest,
    ReactionCount,
    Reaction
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

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
        const { user_id, post_id, comment_id, type } = req.body;

        if (!user_id) {
            throw new ValidationError('Missing valid user Id');
        }

        if (!post_id) {
            throw new ValidationError('Missing valid post Id');
        }

        if (!comment_id) {
            throw new ValidationError('Missing valid comment Id');
        }

        if (!type.length) {
            throw new ValidationError('Missing valid reaction');
        }

        const result = await reactionService.toggleReaction({
            user_id,
            post_id,
            comment_id,
            type
        });

        res.status(200).json(result);
    }
);

// Get reactions for a post
router.get(
    '/:post_id',
    async (
        req: Request<{ post_id: UUIDv7 }, ReactionCount>,
        res: Response<ReactionCount>
    ) => {
        const post_id = req.params.post_id;

        if (!post_id) {
            throw new ValidationError('Invalid post ID');
        }

        const reactions = await reactionService.getPostReactions(post_id);
        res.status(200).json(reactions);
    }
);

// Get reactions for a comment
router.get(
    '/:comment_id',
    async (
        req: Request<{ comment_id: UUIDv7 }, ReactionCount>,
        res: Response<ReactionCount>
    ) => {
        const comment_id = req.params.comment_id;
        if (!comment_id) {
            throw new ValidationError('Invalid comment ID');
        }

        const reactions = await reactionService.getCommentReactions(comment_id);
        res.status(200).json(reactions);
    }
);

// Get current user's reactions to a post
router.get(
    '/:user_id/:post_id',
    async (
        req: Request<{ user_id: UUIDv7; post_id: UUIDv7 }, Reaction[]>,
        res: Response<Reaction[]>
    ) => {
        const post_id = req.params.post_id;

        if (!post_id) {
            throw new ValidationError('Invalid post ID');
        }

        const user_id = req.params.user_id;

        if (!user_id) {
            throw new ValidationError('Invalid user ID');
        }

        const reactions = await reactionService.getUserPostReactions(
            user_id,
            post_id
        );

        res.status(200).json(reactions);
    }
);

// Get current user's reactions to a comment
router.get(
    '/:user_id/:comment_id',
    async (
        req: Request<{ user_id: UUIDv7; comment_id: UUIDv7 }, Reaction[]>,
        res: Response<Reaction[]>
    ) => {
        const { user_id, comment_id } = req.params;

        if (!user_id) {
            throw new ValidationError('Missing valid user Id');
        }

        if (!comment_id) {
            throw new ValidationError('Missing valid comment Id');
        }

        const reactions = await reactionService.getUserCommentReactions(
            user_id,
            comment_id
        );
        res.status(200).json(reactions);
    }
);

export { router as reactionsRouter };
