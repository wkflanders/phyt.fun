import { Router } from 'express';

import { controller } from '@/container.js';

const router: Router = Router();

// Get comments for a post
router.get('/post/:postId', ...controller.comments.getPostComments);

// Get replies to a comment
router.get('/replies/:commentId', ...controller.comments.getCommentReplies);

// Get a specific comment by ID
router.get('/:id', ...controller.comments.getCommentById);

// Create a new comment
router.post('/', ...controller.comments.createComment);

// Update a comment
router.patch('/:id', ...controller.comments.updateComment);

// Delete a comment
router.delete('/:id', ...controller.comments.deleteComment);

export { router as commentsRouter };
