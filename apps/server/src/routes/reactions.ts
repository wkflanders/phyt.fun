import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { createReactionSchema } from '../lib/validation';
import { reactionService } from '../services/reactionServices';
import { NotFoundError, DatabaseError } from '@phyt/types';

const router: Router = express.Router();

router.use(validateAuth);

// Toggle a reaction on a post or comment
router.post('/', validateSchema(createReactionSchema), async (req, res) => {
    try {
        const { post_id, comment_id, type } = req.body;

        const result = await reactionService.toggleReaction({
            userId: req.body.user.id, // From auth middleware
            postId: post_id,
            commentId: comment_id,
            type
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error toggling reaction:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to toggle reaction' });
    }
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
        return res.status(500).json({ error: 'Failed to fetch post reactions' });
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
        return res.status(500).json({ error: 'Failed to fetch comment reactions' });
    }
});

// Get current user's reactions to a post
router.get('/user/post/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const reactions = await reactionService.getUserPostReactions(req.body.user.id, postId);
        return res.status(200).json(reactions);
    } catch (error) {
        console.error('Error fetching user post reactions:', error);
        return res.status(500).json({ error: 'Failed to fetch user post reactions' });
    }
});

// Get current user's reactions to a comment
router.get('/user/comment/:commentId', async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const reactions = await reactionService.getUserCommentReactions(req.body.user.id, commentId);
        return res.status(200).json(reactions);
    } catch (error) {
        console.error('Error fetching user comment reactions:', error);
        return res.status(500).json({ error: 'Failed to fetch user comment reactions' });
    }
});

export { router as reactionsRouter };