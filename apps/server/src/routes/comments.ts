import {
    CommentUpdateRequest,
    HttpError,
    CommentQueryParams,
    CreateCommentRequest,
    CommentResponse,
    Comment
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { createCommentSchema, updateCommentSchema } from '@/lib/validation';
import { validateAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { commentService } from '@/services/commentServices';

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
            throw new HttpError('Invalid post ID', 400);
        }

        const { page = '1', limit = '20' } = req.query;

        const result = await commentService.getPostComments(postId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
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
            throw new HttpError('Invalid comment ID', 400);
        }

        const { page = '1', limit = '20' } = req.query;

        const result = await commentService.getCommentReplies(commentId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string)
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
            throw new HttpError('Invalid comment ID', 400);
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
        req: Request<Record<string, never>, Comment, CreateCommentRequest>,
        res: Response<Comment>
    ) => {
        const { post_id, content, parent_comment_id, user_id } = req.body;

        const comment = await commentService.createComment({
            post_id,
            user_id,
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
            Partial<CommentUpdateRequest> & {
                user_id?: number;
            }
        >,
        res: Response<Comment>
    ) => {
        const typedBody = req.body as Partial<CommentUpdateRequest> & {
            user_id?: number;
        };
        const commentId = parseInt(req.params.id, 10);
        if (isNaN(commentId)) {
            throw new HttpError('Invalid comment ID', 400);
        }

        const { content } = typedBody;
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
            throw new HttpError('Invalid comment ID', 400);
        }

        const deletedComment = await commentService.deleteComment(commentId);

        res.status(200).json(deletedComment);
    }
);

export { router as commentsRouter };
