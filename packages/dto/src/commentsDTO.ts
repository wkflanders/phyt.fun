import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';

import type {
    CommentQueryParams,
    Comment,
    PaginatedComments,
    CommentUpdate,
    CommentInsert,
    CommentWithUser
} from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const CommentIdSchema = z.object({
    commentId: uuidv7()
});
export type CommentIdDTO = z.infer<typeof CommentIdSchema>;

export const CreateCommentSchema = z
    .object({
        userId: uuidv7(), // usually injected by auth
        postId: uuidv7(),
        content: z.string().min(1),
        parentCommentId: uuidv7().nullable()
    })
    .strict();
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema> &
    CommentInsert;

export const UpdateCommentSchema = z
    .object({
        content: z.string().min(1)
    })
    .strict();
export type UpdateCommentDTO = z.infer<typeof UpdateCommentSchema> &
    CommentUpdate;

export const CommentQueryParamsSchema = z
    .object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        parentOnly: z.coerce.boolean().optional()
    })
    .strict();
export type CommentQueryParamsDTO = z.infer<typeof CommentQueryParamsSchema> &
    CommentQueryParams;

/* ---------- Outbound DTOs ---------- */
export const CommentSchema = z
    .object({
        id: uuidv7(),
        postId: uuidv7(),
        userId: uuidv7(),
        content: z.string(),
        parentCommentId: uuidv7().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type CommentDTO = z.infer<typeof CommentSchema> & Comment;

export const CommentWithUserSchema = z
    .object({
        comment: CommentSchema,
        user: z
            .object({
                username: z.string(),
                avatarUrl: z.string().nullable()
            })
            .strict()
    })
    .strict();
export type CommentWithUserDTO = z.infer<typeof CommentWithUserSchema> &
    CommentWithUser;

export const CommentsPageSchema = z
    .object({
        comments: z.array(CommentWithUserSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type CommentsPageDTO = z.infer<typeof CommentsPageSchema> &
    PaginatedComments;
