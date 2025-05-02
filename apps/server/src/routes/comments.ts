import { Router } from 'express';

import { service } from '@/container.js';
import { makeCommentController } from '@/controllers/commentController.js';

const ctrl = makeCommentController(service.comments);

const router: Router = Router();

// Get comments for a post
router.get('/post/:postId', ...ctrl.getPostComments);

// Get replies to a comment
router.get('/replies/:commentId', ...ctrl.getCommentReplies);

// Get a specific comment by ID
router.get('/:id', ...ctrl.getCommentById);

// Create a new comment
router.post('/', ...ctrl.createComment);

// Update a comment
router.patch('/:id', ...ctrl.updateComment);

// Delete a comment
router.delete('/:id', ...ctrl.deleteComment);

export { router as commentsRouter };
