import { Router } from 'express';

import { postController } from '@/controllers/postController.js';
import { validateAuth } from '@/middleware/auth.js';

const router: Router = Router();

router.use(validateAuth);

// List posts
router.get('/', postController.getPosts);

// Get specific post by ID
router.get('/:id', postController.getPostById);

// Get posts for a user by userId
router.get('/user/:userId', postController.getUserPostsById);

// Create a post
router.post('/', postController.createPost);

// Update post status
router.patch('/:id', postController.updatePostStatus);

// Delete a post
router.delete('/:id', postController.deletePost);

export { router as postsRouter };
