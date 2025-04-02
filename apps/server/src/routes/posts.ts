import {
    NotFoundError,
    Post,
    PostResponse,
    ValidationError,
    PostQueryParams,
    PostStatus
} from '@phyt/types';
import express, { Request, Response, Router } from 'express';

import { createPostSchema, updatePostSchema } from '@/lib/validation';
import { validateAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { postService } from '@/services/postServices';

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

        const privy_id = req.auth?.privy_id;
        if (!privy_id) {
            throw new ValidationError('Unauthorized');
        }

        const result = await postService.getPosts(privy_id, {
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
        req: Request<{ id: string }, PostResponse>,
        res: Response<PostResponse>
    ) => {
        const postId = parseInt(req.params.id);
        if (isNaN(postId)) {
            throw new NotFoundError('No valid post id');
        }

        const post = await postService.getPostById(postId);
        res.status(200).json(post);
    }
);

// Get posts by a specific user
router.get(
    '/user/:userId',
    async (
        req: Request<
            { userId: number },
            PostResponse[],
            Record<string, never>,
            PostQueryParams
        >,
        res: Response<PostResponse[]>
    ) => {
        const userId = req.params.userId;
        if (isNaN(userId)) {
            throw new ValidationError('No valid user Id');
        }

        const { page = '1', limit = '10' } = req.query;
        const result = await postService.getUserPostsById(userId, {
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
        req: Request<Record<string, never>, Post, { runId: number }>,
        res: Response<Post>
    ) => {
        const { runId } = req.body;
        const post = await postService.createPost(runId);

        res.status(201).json(post);
    }
);

// Update a post's visibility status
router.patch(
    '/:id',
    validateSchema(updatePostSchema),
    async (
        req: Request<{ id: string }, Post, { status: PostStatus }>,
        res: Response<Post>
    ) => {
        const postId = parseInt(req.params.id);
        if (isNaN(postId)) {
            throw new ValidationError('Invalid post Id');
        }

        const { status } = req.body;

        // TODO: Add authorization check - user can only update their own posts
        const post = await postService.updatePostStatus({ postId, status });

        res.status(200).json(post);
    }
);

// Delete a post
router.delete('/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
        throw new ValidationError('Invalid post ID');
    }

    // TODO: Add authorization check - user can only delete their own posts
    const deletedPost = await postService.deletePost(postId);

    res.status(200).json(deletedPost);
});

export { router as postsRouter };
