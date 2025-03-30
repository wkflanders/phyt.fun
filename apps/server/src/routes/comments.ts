import {
    CreateCommentWithAuth,
    CommentUpdateRequest,
    HttpError
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { createCommentSchema, updateCommentSchema } from '@/lib/validation';
import { validateAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { verifyUser } from '@/middleware/verifyUser';
import { commentService } from '@/services/commentServices';

const router: Router = express.Router();

router.use(validateAuth);

// Get comments for a post
router.get('/post/:postId', async (req: Request, res: Response) => {
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

    res.status(200).json(result);
});

// Get replies to a comment
router.get('/replies/:commentId', async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
        throw new HttpError('Invalid comment ID', 400);
    }

    const { page = '1', limit = '20' } = req.query;

    const result = await commentService.getCommentReplies(commentId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
    });

    res.status(200).json(result);
});

// Get a specific comment by ID
router.get('/:id', async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        throw new HttpError('Invalid comment ID', 400);
    }

    const comment = await commentService.getCommentById(commentId);
    res.status(200).json(comment);
});

// Create a new comment
router.post(
    '/',
    validateSchema(createCommentSchema),
    verifyUser,
    async (
        req: Request<Record<string, never>, unknown, CreateCommentWithAuth>,
        res: Response
    ) => {
        const { post_id, content, parent_comment_id, user_id } = req.body;

        const comment = await commentService.createComment({
            postId: post_id,
            userId: user_id,
            content,
            parentCommentId: parent_comment_id
        });

        res.status(201).json(comment);
    }
);

// Update a comment
router.patch(
    '/:id',
    validateSchema(updateCommentSchema),
    verifyUser,
    async (
        req: Request<
            { id: string },
            unknown,
            Partial<CommentUpdateRequest> & { user_id?: number }
        >,
        res: Response
    ) => {
        const commentId = parseInt(req.params.id);
        if (isNaN(commentId)) {
            throw new HttpError('Invalid comment ID', 400);
        }

        const { content } = req.body;

        const comment = await commentService.updateComment(commentId, {
            content: content ?? ''
        });

        res.status(200).json(comment);
    }
);

// Delete a comment
router.delete('/:id', verifyUser, async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        throw new HttpError('Invalid comment ID', 400);
    }

    const deletedComment = await commentService.deleteComment(commentId);

    res.status(200).json(deletedComment);
});

export { router as commentsRouter };
