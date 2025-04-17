import {
    CommentUpdateRequest,
    HttpError,
    CommentQueryParams,
    CreateCommentRequest,
    CommentResponse,
    Comment,
    DatabaseError,
    NotFoundError
} from '@phyt/types';
import express, { Router, Request, Response, NextFunction } from 'express';

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
        res: Response<CommentResponse>,
        next: NextFunction
    ) => {
        try {
            const postId = parseInt(req.params.postId);
            if (isNaN(postId)) {
                throw new HttpError('Invalid post ID', 400);
            }

            const pageStr = String(req.query.page ?? '1');
            const limitStr = String(req.query.limit ?? '20');
            const result = await commentService.getPostComments(postId, {
                page: parseInt(pageStr, 10),
                limit: parseInt(limitStr, 10),
                parent_only: true
            });

            res.status(200).json(result);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
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
        res: Response<CommentResponse>,
        next: NextFunction
    ) => {
        try {
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId)) {
                throw new HttpError('Invalid comment ID', 400);
            }

            const pageStr = String(req.query.page ?? '1');
            const limitStr = String(req.query.limit ?? '20');
            const result = await commentService.getCommentReplies(commentId, {
                page: parseInt(pageStr, 10),
                limit: parseInt(limitStr, 10)
            });

            res.status(200).json(result);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

// Get a specific comment by ID
router.get(
    '/:id',
    async (
        req: Request<{ id: string }, Comment>,
        res: Response<Comment>,
        next: NextFunction
    ) => {
        try {
            const commentId = parseInt(req.params.id);
            if (isNaN(commentId)) {
                throw new HttpError('Invalid comment ID', 400);
            }

            const comment = await commentService.getCommentById(commentId);
            res.status(200).json(comment);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

// Create a new comment
router.post(
    '/',
    validateSchema(createCommentSchema),
    async (
        req: Request<Record<string, never>, Comment, CreateCommentRequest>,
        res: Response<Comment>,
        next: NextFunction
    ) => {
        try {
            const { post_id, content, parent_comment_id, user_id } = req.body;

            const comment = await commentService.createComment({
                post_id,
                user_id,
                content,
                parent_comment_id
            });

            res.status(201).json(comment);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
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
        res: Response<Comment>,
        next: NextFunction
    ) => {
        try {
            // req.body is already correctly typed
            const commentId = parseInt(req.params.id, 10);
            if (isNaN(commentId)) {
                throw new HttpError('Invalid comment ID', 400);
            }

            const { content } = req.body;
            const comment = await commentService.updateComment(commentId, {
                content: content ?? ''
            });
            res.status(200).json(comment);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

// Delete a comment
router.delete(
    '/:id',
    async (
        req: Request<{ id: string }, Comment>,
        res: Response<Comment>,
        next: NextFunction
    ) => {
        try {
            // Verify comment owner
            const commentId = parseInt(req.params.id);
            if (isNaN(commentId)) {
                throw new HttpError('Invalid comment ID', 400);
            }

            const deletedComment =
                await commentService.deleteComment(commentId);

            res.status(200).json(deletedComment);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

export { router as commentsRouter };
