/* eslint-disable @typescript-eslint/no-misused-promises */
import {
    CreateCommentRequest,
    CreateCommentWithAuth
    CommentUpdateRequest,
    HttpError
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { createCommentSchema, updateCommentSchema } from '@/lib/validation';
import { validateAuth, AuthenticatedBody } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { commentService } from '@/services/commentServices';

const router: Router = express.Router();

router.use(validateAuth);

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
        throw new HttpError('Invalid post ID', 400);
    }

    const { page = '1', limit = '20', parentOnly = 'false' } = req.query;

    const result = await commentService.getPostComments(postId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        parentOnly: parentOnly === 'true'
    });

    return res.status(200).json(result);
});

// Get replies to a comment
router.get('/replies/:commentId', async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
        throw new HttpError('Invalid comment ID', 400);
    }

    const { page = '1', limit = '20' } = req.query;

    const result = await commentService.getCommentReplies(commentId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
    });

    return res.status(200).json(result);
});

// Get a specific comment by ID
router.get('/:id', async (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        throw new HttpError('Invalid comment ID', 400);
    }

    const comment = await commentService.getCommentById(commentId);
    return res.status(200).json(comment);
});

// Create a new comment
router.post(
    '/',
    validateSchema(createCommentSchema),
    async (
        req: Request<Record<string, never>, unknown, CreateCommentWithAuth>,
        res: Response
    ) => {
        const { post_id, content, parent_comment_id } = req.body;

        const comment = await commentService.createComment({
            postId: post_id,
            userId: parseInt(req.body.user.id), // Convert string ID to number
            content,
            parentCommentId: parent_comment_id
        });

        return res.status(201).json(comment);
    }
);

// Update a comment
router.patch(
    '/:id',
    validateSchema(updateCommentSchema),
    async (
        req: Request<{ id: string }, unknown, CommentUpdateRequest>,
        res: Response
    ) => {
        const commentId = parseInt(req.params.id);
        if (isNaN(commentId)) {
            throw new HttpError('Invalid comment ID', 400);
        }

        const { content } = req.body;

        // TODO: Add authorization check - user can only update their own comments
        const comment = await commentService.updateComment(commentId, {
            content
        });

        return res.status(200).json(comment);
    }
);

// Delete a comment
router.delete('/:id', async (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        throw new HttpError('Invalid comment ID', 400);
    }

    // TODO: Add authorization check - user can only delete their own comments
    const deletedComment = await commentService.deleteComment(commentId);

    return res.status(200).json(deletedComment);
});

export { router as commentsRouter };
