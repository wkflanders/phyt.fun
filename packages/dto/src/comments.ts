import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';

import type {
    CreateCommentInput,
    UpdateCommentInput,
    CommentQueryParams,
    Comment,
    PaginatedComments
} from '@phyt/types';

export const CommentIdSchema = z.object({
    commentId: uuidv7()
});
export type CommentIdDTO = z.infer<typeof CommentIdSchema>;

/* ---------- inbound ---------- */
export const CreateCommentSchema = z.object({
    userId: uuidv7(), // usually injected by auth
    postId: uuidv7(),
    content: z.string().min(1),
    parentCommentId: uuidv7().nullable()
});
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema> &
    CreateCommentInput;

export const UpdateCommentSchema = z.object({
    content: z.string().min(1)
});
export type UpdateCommentDTO = z.infer<typeof UpdateCommentSchema> &
    UpdateCommentInput;

export const CommentQueryParamsSchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    parentOnly: z.coerce.boolean().optional()
});
export type CommentQueryParamsDTO = z.infer<typeof CommentQueryParamsSchema> &
    CommentQueryParams;

/* ---------- outbound ---------- */
export const CommentDataSchema = z.object({
    id: uuidv7(),
    postId: uuidv7(),
    userId: uuidv7(),
    content: z.string(),
    parentCommentId: uuidv7().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});
export type CommentDataDTO = z.infer<typeof CommentDataSchema> & Comment;

export const CommentsPageSchema = z.object({
    comments: z.array(
        z.object({
            comment: CommentDataSchema,
            user: z.object({
                username: z.string(),
                avatarUrl: z.string().nullable()
            })
        })
    ),
    pagination: PaginationSchema.optional()
});
export type CommentsPageDTO = z.infer<typeof CommentsPageSchema> &
    PaginatedComments;
