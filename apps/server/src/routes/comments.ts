import { Router } from 'express';

import { makeCommentController } from '@/controllers/commentController.js';
import { makeCommentRepository } from '@/repositories/commentRepository.js';
import { makeCommentService } from '@/services/commentServices.js';

const repo = makeCommentRepository();
const svc = makeCommentService(repo);
const ctrl = makeCommentController(svc);

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
