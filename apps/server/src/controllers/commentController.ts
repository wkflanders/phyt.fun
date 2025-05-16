import {
    PostIdSchema,
    CreateCommentSchema,
    UpdateCommentSchema,
    CommentQueryParamsSchema,
    CommentIdSchema
} from '@phyt/dto';

import { validateAuth } from '@/middleware/auth.js';
import { ensureOwnership } from '@/middleware/owner.js';
import { validateSchema } from '@/middleware/validator.js';

import type {
    PostIdDTO,
    CommentIdDTO,
    CommentDTO,
    CreateCommentDTO,
    UpdateCommentDTO,
    CommentQueryParamsDTO,
    CommentsPageDTO
} from '@phyt/dto';
import type { CommentsService } from '@phyt/services';
import type { Request, RequestHandler, Response } from 'express';

export const makeCommentController = (svc: CommentsService) => ({
    getPostComments: [
        validateAuth,
        validateSchema(PostIdSchema, undefined, CommentQueryParamsSchema),
        async (
            req: Request<
                PostIdDTO,
                CommentsPageDTO,
                Record<string, never>,
                CommentQueryParamsDTO
            >,
            res: Response<CommentsPageDTO>
        ) => {
            const { page = 1, limit = 20, parentOnly = true } = req.query;
            const data = await svc.getPostComments(req.params.postId, {
                page,
                limit,
                parentOnly
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[],

    getCommentReplies: [
        validateAuth,
        validateSchema(CommentIdSchema, undefined, CommentQueryParamsSchema),
        async (
            req: Request<
                CommentIdDTO,
                CommentsPageDTO,
                Record<string, never>,
                CommentQueryParamsDTO
            >,
            res: Response<CommentsPageDTO>
        ) => {
            const { page = 1, limit = 20 } = req.query;
            const data = await svc.getCommentReplies(req.params.commentId, {
                page,
                limit
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[],

    getCommentById: [
        validateAuth,
        validateSchema(CommentIdSchema),
        async (
            req: Request<CommentIdDTO, CommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const comment = await svc.getCommentById(req.params.commentId);
            res.status(200).json(comment);
        }
    ] as RequestHandler[],

    createComment: [
        validateAuth,
        validateSchema(undefined, CreateCommentSchema),
        async (
            req: Request<Record<string, never>, CommentDTO, CreateCommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const commentData = req.body;
            const comment = await svc.createComment(commentData);
            res.status(201).json(comment);
        }
    ] as RequestHandler[],

    updateComment: [
        validateAuth,
        validateSchema(CommentIdSchema, UpdateCommentSchema),
        async (
            req: Request<CommentIdDTO, CommentDTO, UpdateCommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const commentId = req.params.commentId;
            const updateCommentData = req.body;

            const comment = await svc.updateComment(
                commentId,
                updateCommentData
            );
            res.status(200).json(comment);
        }
    ] as RequestHandler[],

    deleteComment: [
        validateAuth,
        ensureOwnership,
        validateSchema(CommentIdSchema),
        async (
            req: Request<CommentIdDTO, CommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const commentId = req.params.commentId;
            const deleted = await svc.deleteComment(commentId);
            res.status(200).json(deleted);
        }
    ] as RequestHandler[]
});
