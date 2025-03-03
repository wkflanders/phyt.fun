import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { createPostSchema, updatePostSchema } from '../lib/validation';
import { postService } from '../services/postServices';
import { NotFoundError, DatabaseError } from '@phyt/types';

const router: Router = express.Router();

router.use(validateAuth);

// Get all posts with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '10', filter } = req.query;
        const userId = req.body.user?.id;

        const result = await postService.getPosts({
            pageParam: parseInt(page as string),  // Changed to match pageParam in service
            limit: parseInt(limit as string),
            userId,
            filter: filter as ('following' | 'trending' | 'all') | undefined
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get a specific post by ID
router.get('/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const post = await postService.getPostById(postId);
        return res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Get posts by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const { page = '1', limit = '10' } = req.query;
        const result = await postService.getUserPosts(userId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return res.status(500).json({ error: 'Failed to fetch user posts' });
    }
});

// Create a new post (for an existing run)
router.post('/', validateSchema(createPostSchema), async (req, res) => {
    try {
        const { run_id } = req.body;
        const post = await postService.createPost(run_id);

        return res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to create post' });
    }
});

// Update a post's visibility status
router.patch('/:id', validateSchema(updatePostSchema), async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const { status } = req.body;

        // TODO: Add authorization check - user can only update their own posts
        const post = await postService.updatePostStatus(postId, status);

        return res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        // TODO: Add authorization check - user can only delete their own posts
        const deletedPost = await postService.deletePost(postId);

        return res.status(200).json(deletedPost);
    } catch (error) {
        console.error('Error deleting post:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to delete post' });
    }
});

export { router as postsRouter };