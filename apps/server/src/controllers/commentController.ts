import {
    CommentQueryParams,
    CommentResponse,
    Comment,
    CommentCreateRequest,
    CommentUpdateRequest,
    UUIDv7
} from '@phyt/types';

import { createCommentSchema, updateCommentSchema } from '@/lib/validation.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

import type { CommentService } from '@/services/commentServices.js';
import type { Request, RequestHandler, Response } from 'express';

export const makeCommentController = (svc: CommentService) => ({
    getPostComments: [
        validateAuth,
        async (
            req: Request<
                { postId: UUIDv7 },
                CommentResponse,
                Record<string, never>,
                CommentQueryParams
            >,
            res: Response<CommentResponse>
        ) => {
            const { page = 1, limit = 20, parentOnly = true } = req.query;
            const data = await svc.getPostComments(req.params.postId, {
                page: page,
                limit: limit,
                parentOnly: Boolean(parentOnly)
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[],

    getCommentReplies: [
        validateAuth,
        async (
            req: Request<
                { commentId: UUIDv7 },
                CommentResponse,
                Record<string, never>,
                CommentQueryParams
            >,
            res: Response<CommentResponse>
        ) => {
            const { page = 1, limit = 20 } = req.query;
            const data = await svc.getCommentReplies(req.params.commentId, {
                page: page,
                limit: limit
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[],

    getCommentById: [
        validateAuth,
        async (
            req: Request<{ commentId: UUIDv7 }, Comment>,
            res: Response<Comment>
        ) => {
            const comment = await svc.getCommentById(req.params.commentId);
            res.status(200).json(comment);
        }
    ] as RequestHandler[],

    createComment: [
        validateAuth,
        validateSchema(createCommentSchema),
        async (
            req: Request<Record<string, never>, Comment, CommentCreateRequest>,
            res: Response<Comment>
        ) => {
            const commentData = req.body;
            const comment = await svc.createComment(commentData);
            res.status(201).json(comment);
        }
    ] as RequestHandler[],

    updateComment: [
        validateAuth,
        validateSchema(updateCommentSchema),
        async (
            req: Request<{ commentId: UUIDv7 }, Comment, { content: string }>,
            res: Response<Comment>
        ) => {
            const content = req.body.content;
            const commentId = req.params.commentId;
            const commentData: CommentUpdateRequest = { commentId, content };

            const comment = await svc.updateComment(commentData);
            res.status(201).json(comment);
        }
    ] as RequestHandler[],

    deleteComment: [
        validateAuth,
        async (
            req: Request<{ commentId: UUIDv7 }, Comment>,
            res: Response<Comment>
        ) => {
            const deleted = await svc.deleteComment(req.params.commentId);
            res.json(deleted);
        }
    ] as RequestHandler[]
});
