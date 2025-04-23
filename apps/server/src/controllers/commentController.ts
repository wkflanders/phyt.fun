import {
    CommentQueryParams,
    CommentResponse,
    Comment,
    CommentCreateRequest,
    CommentUpdateRequest
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
                { post_id: string },
                CommentResponse,
                Record<string, never>,
                CommentQueryParams
            >,
            res: Response<CommentResponse>
        ) => {
            const { page = 1, limit = 20, parent_only = true } = req.query;
            const data = await svc.getPostComments(Number(req.params.post_id), {
                page: Number(page),
                limit: Number(limit),
                parent_only: Boolean(parent_only)
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[],

    getCommentReplies: [
        validateAuth,
        async (
            req: Request<
                { comment_id: string },
                CommentResponse,
                Record<string, never>,
                CommentQueryParams
            >,
            res: Response<CommentResponse>
        ) => {
            const { page = 1, limit = 20 } = req.query;
            const data = await svc.getCommentReplies(
                Number(req.params.comment_id),
                {
                    page: Number(page),
                    limit: Number(limit)
                }
            );
            res.status(200).json(data);
        }
    ] as RequestHandler[],

    getCommentById: [
        validateAuth,
        async (
            req: Request<Record<string, never>, Comment>,
            res: Response<Comment>
        ) => {
            const comment = await svc.getCommentById(Number(req.params.id));
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
            const comment_data = req.body;
            const comment = await svc.createComment(comment_data);
            res.status(201).json(comment);
        }
    ] as RequestHandler[],

    updateComment: [
        validateAuth,
        validateSchema(updateCommentSchema),
        async (
            req: Request<{ comment_id: string }, Comment, { content: string }>,
            res: Response<Comment>
        ) => {
            const content = req.body.content;
            const comment_id = Number(req.params.comment_id);
            const comment_data: CommentUpdateRequest = { comment_id, content };

            const comment = await svc.updateComment(comment_data);
            res.status(201).json(comment);
        }
    ] as RequestHandler[],

    deleteComment: [
        validateAuth,
        async (
            req: Request<{ comment_id: string }, Comment>,
            res: Response<Comment>
        ) => {
            const deleted = await svc.deleteComment(
                Number(req.params.comment_id)
            );
            res.json(deleted);
        }
    ] as RequestHandler[]
});
