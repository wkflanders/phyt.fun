import { controller } from '@/container.js';

import { Router } from 'express';

const router: Router = Router();

// Toggle a reaction on a post or comment
router.post('/', ...controller.reactions.addReaction);

// Get reactions for a post
router.get('/post/:postId', ...controller.reactions.getPostReactions);

// Get reactions for a comment
router.get('/comment/:commentId', ...controller.reactions.getCommentReactions);

// Get current user's reactions to a post
router.get(
    '/user/:userId/post/:postId',
    ...controller.reactions.getUserPostReactions
);

// Get current user's reactions to a comment
router.get(
    '/user/:userId/comment/:commentId',
    ...controller.reactions.getUserCommentReactions
);

// Get all reactions with user info for a post
router.get('/post/:postId/all', ...controller.reactions.getAllReactionsForPost);

// Get all reactions with user info for a comment
router.get(
    '/comment/:commentId/all',
    ...controller.reactions.getAllReactionsForComment
);

export { router as reactionsRouter };
