import {
    CommentUpdateRequest,
    CommentQueryParams,
    CommentCreateRequest,
    CommentResponse,
    Comment,
    DatabaseError,
    NotFoundError,
    ValidationError,
    PermissionError
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { createCommentSchema, updateCommentSchema } from '@/lib/validation.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';
import { commentService } from '@/services/commentServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Get comments for a post
router.get(
    '/post/:postId',
    async (
        req: Request<
            { postId: string },
            CommentResponse,
            Record<string, never>,
            CommentQueryParams
        >,
        res: Response<CommentResponse>
    ) => {
        const postId = parseInt(req.params.postId);
        if (isNaN(postId)) {
            throw new ValidationError('Invalid post ID');
        }

        const pageStr = String(req.query.page ?? '1');
        const limitStr = String(req.query.limit ?? '20');
        const result = await commentService.getPostComments(postId, {
            page: parseInt(pageStr, 10),
            limit: parseInt(limitStr, 10),
            parent_only: true
        });

        res.status(200).json(result);
    }
);

// Get replies to a comment
router.get(
    '/replies/:commentId',
    async (
        req: Request<
            { commentId: string },
            CommentResponse,
            Record<string, never>,
            CommentQueryParams
        >,
        res: Response<CommentResponse>
    ) => {
        const commentId = parseInt(req.params.commentId);
        if (isNaN(commentId)) {
            throw new ValidationError('Invalid comment ID');
        }

        const pageStr = String(req.query.page ?? '1');
        const limitStr = String(req.query.limit ?? '20');
        const result = await commentService.getCommentReplies(commentId, {
            page: parseInt(pageStr, 10),
            limit: parseInt(limitStr, 10)
        });

        res.status(200).json(result);
    }
);

// Get a specific comment by ID
router.get(
    '/:id',
    async (req: Request<{ id: string }, Comment>, res: Response<Comment>) => {
        const commentId = parseInt(req.params.id);
        if (isNaN(commentId)) {
            throw new ValidationError('Invalid comment ID');
        }

        const comment = await commentService.getCommentById(commentId);
        res.status(200).json(comment);
    }
);

// Create a new comment
router.post(
    '/',
    validateSchema(createCommentSchema),
    async (
        req: Request<Record<string, never>, Comment, CommentCreateRequest>,
        res: Response<Comment>
    ) => {
        const { user_id, post_id, content, parent_comment_id } = req.body;

        const comment = await commentService.createComment({
            user_id,
            post_id,
            content,
            parent_comment_id
        });

        res.status(201).json(comment);
    }
);

// Update a comment
router.patch(
    '/:id',
    validateSchema(updateCommentSchema),
    // Verify comment owner
    async (
        req: Request<
            { id: string },
            Comment,
            Partial<CommentUpdateRequest> & { user_id?: number }
        >,
        res: Response<Comment>
    ) => {
        const commentId = parseInt(req.params.id, 10);
        if (isNaN(commentId)) {
            throw new ValidationError('Invalid comment ID');
        }

        const { content } = req.body;
        const comment = await commentService.updateComment(commentId, {
            content: content ?? ''
        });
        res.status(200).json(comment);
    }
);

// Delete a comment
router.delete(
    '/:id',
    async (req: Request<{ id: string }, Comment>, res: Response<Comment>) => {
        // Verify comment owner
        const commentId = parseInt(req.params.id);
        if (isNaN(commentId)) {
            throw new ValidationError('Invalid comment ID');
        }

        const deletedComment = await commentService.deleteComment(commentId);

        res.status(200).json(deletedComment);
    }
);

export { router as commentsRouter };
