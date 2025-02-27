import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { createCommentSchema, updateCommentSchema } from '../lib/validation';
import { commentService } from '../services/commentServices';
import { NotFoundError, DatabaseError } from '@phyt/types';

const router: Router = express.Router();

router.use(validateAuth);

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const { page = '1', limit = '20', parentOnly = 'false' } = req.query;

        const result = await commentService.getPostComments(postId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            parentOnly: parentOnly === 'true'
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching post comments:', error);
        return res.status(500).json({ error: 'Failed to fetch post comments' });
    }
});

// Get replies to a comment
router.get('/replies/:commentId', async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const { page = '1', limit = '20' } = req.query;

        const result = await commentService.getCommentReplies(commentId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching comment replies:', error);
        return res.status(500).json({ error: 'Failed to fetch comment replies' });
    }
});

// Get a specific comment by ID
router.get('/:id', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const comment = await commentService.getCommentById(commentId);
        return res.status(200).json(comment);
    } catch (error) {
        console.error('Error fetching comment:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch comment' });
    }
});

// Create a new comment
router.post('/', validateSchema(createCommentSchema), async (req, res) => {
    try {
        const { post_id, content, parent_comment_id } = req.body;

        const comment = await commentService.createComment({
            postId: post_id,
            userId: req.body.user.id, // From auth middleware
            content,
            parentCommentId: parent_comment_id
        });

        return res.status(201).json({
            message: 'Comment created successfully',
            comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Update a comment
router.patch('/:id', validateSchema(updateCommentSchema), async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const { content } = req.body;

        // TODO: Add authorization check - user can only update their own comments
        const comment = await commentService.updateComment(commentId, { content });

        return res.status(200).json({
            message: 'Comment updated successfully',
            comment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        // TODO: Add authorization check - user can only delete their own comments
        const deletedComment = await commentService.deleteComment(commentId);

        return res.status(200).json({
            message: 'Comment deleted successfully',
            comment: deletedComment
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to delete comment' });
    }
});

export { router as commentsRouter };