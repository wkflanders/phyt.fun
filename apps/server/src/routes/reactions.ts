import { NotFoundError } from '@phyt/types';
import express, { Router } from 'express';

import { createReactionSchema } from '@/lib/validation';
import { validateAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { reactionService } from '@/services/reactionServices';

const router: Router = express.Router();

router.use(validateAuth);

// Toggle a reaction on a post or comment
router.post('/', validateSchema(createReactionSchema), async (req, res) => {
    const { user_id, post_id, comment_id, type } = req.body;

    if (!user_id) {
        throw new NotFoundError('Missing valid user Id');
    }

    if (!post_id) {
        throw new NotFoundError('Missing valid post Id');
    }

    if (!comment_id) {
        throw new NotFoundError('Missing valid comment Id');
    }

    if (!type) {
        throw new NotFoundError('Missing valid reaction');
    }

    const result = await reactionService.toggleReaction({
        userId: user_id, // From auth middleware
        postId: post_id,
        commentId: comment_id,
        type
    });

    res.status(200).json(result);
});

// Get reactions for a post
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const reactions = await reactionService.getPostReactions(postId);
        return res.status(200).json(reactions);
    } catch (error) {
        console.error('Error fetching post reactions:', error);
        return res
            .status(500)
            .json({ error: 'Failed to fetch post reactions' });
    }
});

// Get reactions for a comment
router.get('/comment/:commentId', async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const reactions = await reactionService.getCommentReactions(commentId);
        return res.status(200).json(reactions);
    } catch (error) {
        console.error('Error fetching comment reactions:', error);
        return res
            .status(500)
            .json({ error: 'Failed to fetch comment reactions' });
    }
});

// Get current user's reactions to a post
router.get('/user/post/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const reactions = await reactionService.getUserPostReactions(
            req.body.user.id,
            postId
        );
        return res.status(200).json(reactions);
    } catch (error) {
        console.error('Error fetching user post reactions:', error);
        return res
            .status(500)
            .json({ error: 'Failed to fetch user post reactions' });
    }
});

// Get current user's reactions to a comment
router.get('/user/comment/:commentId', async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const reactions = await reactionService.getUserCommentReactions(
            req.body.user.id,
            commentId
        );
        return res.status(200).json(reactions);
    } catch (error) {
        console.error('Error fetching user comment reactions:', error);
        return res
            .status(500)
            .json({ error: 'Failed to fetch user comment reactions' });
    }
});

export { router as reactionsRouter };
