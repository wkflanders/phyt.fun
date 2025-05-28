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

export interface CommentsController {
    getPostComments: RequestHandler[];
    getCommentReplies: RequestHandler[];
    getCommentById: RequestHandler[];
    createComment: RequestHandler[];
    updateComment: RequestHandler[];
    deleteComment: RequestHandler[];
}

export const makeCommentsController = (
    svc: CommentsService
): CommentsController => {
    const getPostComments = [
        validateAuth,
        validateSchema({
            paramsSchema: PostIdSchema,
            querySchema: CommentQueryParamsSchema
        }),
        async (
            req: Request<
                PostIdDTO,
                CommentsPageDTO,
                Record<string, never>,
                CommentQueryParamsDTO
            >,
            res: Response<CommentsPageDTO>
        ) => {
            const data = await svc.getPostComments({
                postId: req.params,
                params: req.query
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[];

    const getCommentReplies = [
        validateAuth,
        validateSchema({
            paramsSchema: CommentIdSchema,
            querySchema: CommentQueryParamsSchema
        }),
        async (
            req: Request<
                CommentIdDTO,
                CommentsPageDTO,
                Record<string, never>,
                CommentQueryParamsDTO
            >,
            res: Response<CommentsPageDTO>
        ) => {
            const data = await svc.getCommentReplies({
                parentCommentId: req.params,
                params: req.query
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[];

    const getCommentById = [
        validateAuth,
        validateSchema({
            paramsSchema: CommentIdSchema
        }),
        async (
            req: Request<CommentIdDTO, CommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const comment = await svc.getCommentById({
                commentId: req.params
            });
            res.status(200).json(comment);
        }
    ] as RequestHandler[];

    const createComment = [
        validateAuth,
        validateSchema({
            bodySchema: CreateCommentSchema
        }),
        async (
            req: Request<Record<string, never>, CommentDTO, CreateCommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const input = req.body;
            const comment = await svc.createComment({ input });
            res.status(201).json(comment);
        }
    ] as RequestHandler[];

    const updateComment = [
        validateAuth,
        validateSchema({
            paramsSchema: CommentIdSchema,
            bodySchema: UpdateCommentSchema
        }),
        async (
            req: Request<CommentIdDTO, CommentDTO, UpdateCommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const comment = await svc.updateComment({
                commentId: req.params,
                update: req.body
            });
            res.status(200).json(comment);
        }
    ] as RequestHandler[];

    const deleteComment = [
        validateAuth,
        ensureOwnership,
        validateSchema({
            paramsSchema: CommentIdSchema
        }),
        async (
            req: Request<CommentIdDTO, CommentDTO>,
            res: Response<CommentDTO>
        ) => {
            const deleted = await svc.deleteComment({
                commentId: req.params
            });
            res.status(200).json(deleted);
        }
    ] as RequestHandler[];

    return {
        getPostComments,
        getCommentReplies,
        getCommentById,
        createComment,
        updateComment,
        deleteComment
    };
};
