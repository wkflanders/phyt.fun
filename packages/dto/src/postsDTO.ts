import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';
import { RunIdValueSchema, RunSchema } from './runsDTO.js';
import { UserIdValueSchema, UserInfoSchema } from './usersDTO.js';

import type {
    Post,
    PostInsert,
    PostUpdate,
    PostQueryParams,
    PaginatedPosts
} from '@phyt/types';

export const PostStatsSchema = z.object({
    commentCount: z.number(),
    reactionCount: z.number(),
    shareCount: z.number()
});

/* ---------- Inbound DTOs ---------- */
export const PostIdValueSchema = uuidv7();
export const PostIdSchema = z.object({
    postId: PostIdValueSchema
});
export type PostIdDTO = z.infer<typeof PostIdValueSchema>;

export const CreatePostSchema = z
    .object({
        userId: UserIdValueSchema,
        runId: RunIdValueSchema.nullable(),
        title: z.string().min(1),
        content: z.string().min(1),
        status: z.enum(['visible', 'hidden', 'deleted']).optional()
    })
    .strict();
export type CreatePostDTO = z.infer<typeof CreatePostSchema> & PostInsert;

export const UpdatePostSchema = z
    .object({
        postId: PostIdValueSchema.optional(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        status: z.enum(['visible', 'hidden', 'deleted']).optional()
    })
    .strict();
export type UpdatePostDTO = z.infer<typeof UpdatePostSchema> & PostUpdate;

export const PostQueryParamsSchema = z
    .object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        userId: UserIdValueSchema.optional()
    })
    .strict();
export type PostQueryParamsDTO = z.infer<typeof PostQueryParamsSchema> &
    PostQueryParams;

/* ---------- Outbound DTOs ---------- */
export const PostSchema = z
    .object({
        id: PostIdValueSchema,
        userId: UserIdValueSchema,
        runId: RunIdValueSchema.nullable(),
        title: z.string(),
        content: z.string(),
        status: z.enum(['visible', 'hidden', 'deleted']),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        deletedAt: z.coerce.date().nullable(),
        username: UserInfoSchema.shape.username.optional(),
        avatarUrl: UserInfoSchema.shape.avatarUrl.optional(),
        stats: PostStatsSchema.optional(),
        run: RunSchema.optional()
    })
    .strict();
export type PostDTO = z.infer<typeof PostSchema> & Post;

export const PostsPageSchema = z
    .object({
        posts: z.array(PostSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type PostsPageDTO = z.infer<typeof PostsPageSchema> & PaginatedPosts;
