import express, { Request, Response, Router } from 'express';

import {
    NotFoundError,
    Post,
    PostResponse,
    ValidationError,
    PostQueryParams,
    PostStatus,
    UUIDv7
} from '@phyt/types';

import { createPostSchema, updatePostSchema } from '@/lib/validation.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';
import { PostService } from '@/services/postServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Get all posts with pagination and filtering
router.get(
    '/',
    async (
        req: Request<
            Record<string, never>,
            PostResponse,
            Record<string, never>,
            PostQueryParams
        >,
        res: Response<PostResponse>
    ) => {
        const { page = '1', limit = '10', filter } = req.query;

        const privyId = req.body.privyId;

        const result = await PostService.getPosts(privyId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            filter: filter as ('following' | 'trending' | 'all') | undefined
        });

        res.status(200).json(result);
    }
);

// Get a specific post by ID
router.get(
    '/:id',
    async (
        req: Request<{ id: UUIDv7 }, PostResponse>,
        res: Response<PostResponse>
    ) => {
        const postId = req.params.id;
        if (!postId) {
            throw new NotFoundError('No valid post id');
        }

        const post = await PostService.getPostById(postId);
        res.status(200).json(post);
    }
);

// Get posts by a specific user
router.get(
    '/user/:userId',
    async (
        req: Request<
            { userId: UUIDv7 },
            PostResponse[],
            Record<string, never>,
            PostQueryParams
        >,
        res: Response<PostResponse[]>
    ) => {
        const userId = req.params.userId;
        if (!userId) {
            throw new ValidationError('No valid user Id');
        }

        const { page = '1', limit = '10' } = req.query;
        const result = await PostService.getUserPostsById(userId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });

        res.status(200).json(result);
    }
);

router.post(
    '/',
    validateSchema(createPostSchema),
    async (
        req: Request<Record<string, never>, Post, { runId: UUIDv7 }>,
        res: Response<Post>
    ) => {
        const { runId } = req.body;
        const post = await PostService.createPost(runId);

        res.status(201).json(post);
    }
);

// Update a post's visibility status
router.patch(
    '/:id',
    validateSchema(updatePostSchema),
    async (
        req: Request<{ id: UUIDv7 }, Post, { status: PostStatus }>,
        res: Response<Post>
    ) => {
        const postId = req.params.id;
        if (!postId) {
            throw new ValidationError('Invalid post Id');
        }

        const { status } = req.body;

        // TODO: Add authorization check - user can only update their own posts
        const post = await PostService.updatePostStatus(postId, status);

        res.status(200).json(post);
    }
);

// Delete a post
router.delete(
    '/:id',
    async (req: Request<{ id: UUIDv7 }, Post>, res: Response<Post>) => {
        const postId = req.params.id;
        if (!postId) {
            throw new ValidationError('Invalid post ID');
        }

        // TODO: Add authorization check - user can only delete their own posts
        const deletedPost = await PostService.deletePost(postId);

        res.status(200).json(deletedPost);
    }
);

export { router as postsRouter };
