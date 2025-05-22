import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';
import { PostIdSchema } from './postsDTO.js';
import { UserIdSchema } from './usersDTO.js';

import type {
    UUIDv7,
    Comment,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams,
    PaginatedComments
} from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const CommentIdSchema = z.object({
    commentId: uuidv7()
});
export type CommentIdDTO = z.infer<typeof CommentIdSchema> & UUIDv7;

export const CreateCommentSchema = z
    .object({
        userId: UserIdSchema,
        postId: PostIdSchema,
        content: z.string().min(1),
        parentCommentId: CommentIdSchema.nullable()
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
        id: CommentIdSchema,
        postId: PostIdSchema,
        userId: UserIdSchema,
        content: z.string(),
        parentCommentId: CommentIdSchema.nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type CommentDTO = z.infer<typeof CommentSchema> & Comment;

export const CommentsPageSchema = z
    .object({
        comments: z.array(CommentSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type CommentsPageDTO = z.infer<typeof CommentsPageSchema> &
    PaginatedComments;
