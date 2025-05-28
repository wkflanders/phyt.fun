import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';
import { PostIdValueSchema } from './postsDTO.js';
import { UserIdValueSchema, UserInfoSchema } from './usersDTO.js';

import type {
    Comment,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams,
    PaginatedComments
} from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const CommentIdValueSchema = uuidv7();
export const CommentIdSchema = z.object({
    commentId: CommentIdValueSchema
});
export type CommentIdDTO = z.infer<typeof CommentIdValueSchema>;

export const CreateCommentSchema = z
    .object({
        userId: UserIdValueSchema,
        postId: PostIdValueSchema,
        content: z.string().min(1),
        parentCommentId: CommentIdValueSchema.nullable()
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
        id: CommentIdValueSchema,
        postId: PostIdValueSchema,
        userId: UserIdValueSchema,
        content: z.string(),
        parentCommentId: CommentIdValueSchema.nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        deletedAt: z.coerce.date().nullable(),
        username: UserInfoSchema.shape.username.optional(),
        avatarUrl: UserInfoSchema.shape.avatarUrl.optional()
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
