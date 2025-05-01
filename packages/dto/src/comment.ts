import { z } from 'zod';

import type {
    UUIDv7,
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentQueryParams,
    CommentPagination,
    CommentResponse
} from '@phyt/models';

const uuidv7 = () =>
    z
        .string()
        .regex(
            /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
            'Invalid uuid-v7'
        ) as unknown as z.ZodType<UUIDv7, z.ZodTypeDef, string>;

export const CommentSchema = z
    .object({
        id: uuidv7(),
        postId: uuidv7(),
        userId: uuidv7(),
        parentCommentId: uuidv7().nullable(),
        content: z.string(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
    .strict() satisfies z.ZodType<Comment, z.ZodTypeDef, unknown>;
export type CommentDTO = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = z
    .object({
        userId: uuidv7(),
        postId: uuidv7(),
        content: z.string().min(1).max(10_000),
        parentCommentId: uuidv7().nullable()
    })
    .strict() satisfies z.ZodType<CreateCommentRequest, z.ZodTypeDef, unknown>;
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema = z
    .object({
        commentId: uuidv7(),
        content: z.string().min(1).max(10_000)
    })
    .strict() satisfies z.ZodType<UpdateCommentRequest, z.ZodTypeDef, unknown>;
export type UpdateCommentDTO = z.infer<typeof UpdateCommentSchema>;

export const CommentQueryParamsSchema = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        parentOnly: z.coerce.boolean().default(true)
    })
    .strict() satisfies z.ZodType<CommentQueryParams, z.ZodTypeDef, unknown>;
export type CommentQueryParamsDTO = z.infer<typeof CommentQueryParamsSchema>;

export const CommentPaginationSchema = z
    .object({
        page: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative()
    })
    .strict() satisfies z.ZodType<CommentPagination>;
export type CommentPaginationDTO = z.infer<typeof CommentPaginationSchema>;

export const CommentResponseSchema = z
    .object({
        comments: z.array(
            z.object({
                comment: CommentSchema,
                user: z.object({
                    username: z.string(),
                    avatarUrl: z.string().nullable()
                })
            })
        ),
        pagination: CommentPaginationSchema.optional()
    })
    .strict() satisfies z.ZodType<CommentResponse, z.ZodTypeDef, unknown>;
export type CommentResponseDTO = z.infer<typeof CommentResponseSchema>;
