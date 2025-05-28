import { controller } from '@/container.js';

import { Router } from 'express';


const router: Router = Router();

// Get all posts (paginated)
router.get('/', ...controller.posts.getPosts);

// Get posts for a specific user
router.get('/user/:userId', ...controller.posts.getUserPosts);

// Get a specific post by ID
router.get('/:postId', ...controller.posts.getPostById);

// Create a new post
router.post('/', ...controller.posts.createPost);

// Update a post
router.patch('/:postId', ...controller.posts.updatePost);

// Delete a post
router.delete('/:postId', ...controller.posts.deletePost);

export { router as postsRouter };
