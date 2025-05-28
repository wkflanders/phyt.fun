import { Request, Response } from 'express';

import { createPostSchema, updatePostSchema } from '@/lib/validation.js';
import { validateSchema } from '@/middleware/validator.js';
import { postService } from '@/services/postServices.js';

import type { Post, PostResponse, PostQueryParams } from '@phyt/types';

export const postController = {
    getPosts: async (
        req: Request<{}, PostResponse, {}, PostQueryParams>,
        res: Response<PostResponse>
    ) => {
        const { page = 1, limit = 10, filter } = req.query;
        const privyId = req.auth?.privy_id;
        const result = await postService.getPosts(privyId!, {
            page: Number(page),
            limit: Number(limit),
            filter
        });
        res.status(200).json(result);
    },

    getPostById: async (
        req: Request<{ id: string }>,
        res: Response<PostResponse>
    ) => {
        const postId = Number(req.params.id);
        const result = await postService.getPostById(postId);
        res.status(200).json(result);
    },

    getUserPostsById: async (
        req: Request<{ userId: string }, PostResponse[]>,
        res: Response<PostResponse[]>
    ) => {
        const userId = Number(req.params.userId);
        const { page = '1', limit = '10' } = req.query as any;
        const result = await postService.getUserPostsById(userId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.status(200).json(result);
    },

    createPost: [
        validateSchema(createPostSchema),
        async (
            req: Request<{}, Post, { runId: number }>,
            res: Response<Post>
        ) => {
            const post = await postService.createPost(req.body.runId);
            res.status(201).json(post);
        }
    ],

    updatePostStatus: [
        validateSchema(updatePostSchema),
        async (
            req: Request<{ id: string }, Post, { status: string }>,
            res: Response<Post>
        ) => {
            const postId = Number(req.params.id);
            const { status } = req.body;
            const updated = await postService.updatePostStatus(postId, status);
            res.status(200).json(updated);
        }
    ],

    deletePost: async (req: Request<{ id: string }>, res: Response<Post>) => {
        const postId = Number(req.params.id);
        const deleted = await postService.deletePost(postId);
        res.status(200).json(deleted);
    }
};
