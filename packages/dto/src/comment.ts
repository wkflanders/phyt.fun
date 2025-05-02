import {
    UUIDv7,
    isUUIDv7,
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentQueryParams,
    CommentPagination,
    CommentResponse
} from '@phyt/models';
import { z, ZodType, ZodTypeDef } from 'zod';

type DTOSchema<T> = ZodType<T, ZodTypeDef, unknown>;

const uuidv7 = () =>
    z.string().refine(isUUIDv7, { message: 'Invalid UUIDv7' }).brand<UUIDv7>();

export const CommentSchema: DTOSchema<Comment> = z
    .object({
        id: uuidv7(),
        postId: uuidv7(),
        userId: uuidv7(),
        parentCommentId: uuidv7().nullable(),
        content: z.string(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type CommentDTO = z.infer<typeof CommentSchema>;

export const CreateCommentSchema: DTOSchema<CreateCommentRequest> = z
    .object({
        userId: uuidv7(),
        postId: uuidv7(),
        content: z.string().min(1).max(10_000),
        parentCommentId: uuidv7().nullable()
    })
    .strict();
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema: DTOSchema<UpdateCommentRequest> = z
    .object({
        commentId: uuidv7(),
        content: z.string().min(1).max(10_000)
    })
    .strict();
export type UpdateCommentDTO = z.infer<typeof UpdateCommentSchema>;

export const CommentQueryParamsSchema: DTOSchema<CommentQueryParams> = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        parentOnly: z.coerce.boolean().default(false)
    })
    .strict();
export type CommentQueryParamsDTO = z.infer<typeof CommentQueryParamsSchema>;

export const CommentPaginationSchema: DTOSchema<CommentPagination> = z
    .object({
        page: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative()
    })
    .strict();
export type CommentPaginationDTO = z.infer<typeof CommentPaginationSchema>;

export const CommentResponseSchema: DTOSchema<CommentResponse> = z
    .object({
        comments: z.array(
            z.object({
                comment: CommentSchema,
                user: z.object({
                    username: z.string(),
                    avatarUrl: z.string()
                })
            })
        ),
        pagination: CommentPaginationSchema.optional()
    })
    .strict();
export type CommentResponseDTO = z.infer<typeof CommentResponseSchema>;
