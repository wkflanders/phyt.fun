import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';

import type {
    PostQueryParams,
    Post,
    PaginatedPosts,
    PostUpdate,
    PostInsert
} from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const PostIdSchema = z.object({
    postId: uuidv7()
});
export type PostIdDTO = z.infer<typeof PostIdSchema>;

export const CreatePostSchema = z
    .object({
        userId: uuidv7(), // usually injected by auth
        title: z.string().min(1),
        content: z.string().min(1),
        status: z.enum(['visible', 'hidden', 'deleted']).optional()
    })
    .strict();
export type CreatePostDTO = z.infer<typeof CreatePostSchema> & PostInsert;

export const UpdatePostSchema = z
    .object({
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
        userId: uuidv7().optional()
    })
    .strict();
export type PostQueryParamsDTO = z.infer<typeof PostQueryParamsSchema> &
    PostQueryParams;

/* ---------- Outbound DTOs ---------- */
export const PostSchema = z
    .object({
        id: uuidv7(),
        userId: uuidv7(),
        title: z.string(),
        content: z.string(),
        status: z.enum(['visible', 'hidden', 'deleted']),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type PostDTO = z.infer<typeof PostSchema> & Post;

export const PostWithUserSchema = z
    .object({
        id: uuidv7(),
        userId: uuidv7(),
        title: z.string(),
        content: z.string(),
        status: z.enum(['visible', 'hidden', 'deleted']),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        username: z.string(),
        avatarUrl: z.string()
    })
    .strict();
export type PostWithUserDTO = z.infer<typeof PostWithUserSchema>;

export const PostsPageSchema = z
    .object({
        posts: z.array(PostWithUserSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type PostsPageDTO = z.infer<typeof PostsPageSchema> & PaginatedPosts;
