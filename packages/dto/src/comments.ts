import { z } from 'zod';

import {
    Comment,
    CreateCommentRequest,
    UpdateCommentContent,
    CommentQueryParams,
    CommentResponse
} from '@phyt/models';

import { uuidv7, DTOSchema, PaginationSchema } from './primitives.js';

export const CommentIdSchema = z.object({
    commentId: uuidv7({
        required_error: 'commentId is required'
    })
});
export type CommentIdDTO = z.infer<typeof CommentIdSchema>;

export const CommentSchema: DTOSchema<Comment> = z
    .object({
        id: uuidv7({
            required_error: 'Comment commentId is required'
        }),
        postId: uuidv7({
            required_error: 'Comment postId is required'
        }),
        userId: uuidv7({
            required_error: 'Comment userId is required'
        }),
        parentCommentId: uuidv7({
            required_error: 'Comment parentCommentId is required'
        }).nullable(),
        content: z.string({
            required_error: 'Comment content is required'
        }),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type CommentDTO = z.infer<typeof CommentSchema>;

export const CreateCommentSchema: DTOSchema<CreateCommentRequest> = z
    .object({
        userId: uuidv7({
            required_error: 'Comment userId is required'
        }),
        postId: uuidv7({
            required_error: 'Comment postId is required'
        }),
        content: z
            .string({
                required_error: 'Comment content is required'
            })
            .min(1)
            .max(10_000),
        parentCommentId: uuidv7({
            required_error: 'Comment parentCommentId is required'
        }).nullable()
    })
    .strict();
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema: DTOSchema<UpdateCommentContent> = z
    .object({
        content: z
            .string({
                required_error: 'Comment content is required'
            })
            .min(1)
            .max(10_000)
    })
    .strict();
export type UpdateCommentDTO = z.infer<typeof UpdateCommentSchema>;

export const CommentQueryParamsSchema: DTOSchema<CommentQueryParams> = z
    .object({
        page: z.coerce.number().int().positive().default(1).optional(),
        limit: z.coerce
            .number()
            .int()
            .positive()
            .max(100)
            .default(20)
            .optional(),
        parentOnly: z.coerce.boolean().default(false).optional()
    })
    .strict();
export type CommentQueryParamsDTO = z.infer<typeof CommentQueryParamsSchema>;

const CommentResponseSchema: DTOSchema<CommentResponse> = z
    .object({
        comments: z.array(
            z.object({
                comment: CommentSchema,
                user: z.object({
                    username: z.string({
                        required_error: 'Comment owner username is required'
                    }),
                    avatarUrl: z.string({
                        required_error: 'Comment cowner avatarUrl is required'
                    })
                })
            })
        ),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type CommentResponseDTO = z.infer<typeof CommentResponseSchema>;
