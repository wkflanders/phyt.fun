import { Router } from 'express';

import { commentController } from '@/controllers/commentController.js';
import { validateAuth } from '@/middleware/auth.js';

const router: Router = Router();
router.use(validateAuth);

router.get('/post/:postId', commentController.listForPost);
router.get('/replies/:commentId', commentController.listReplies);
router.get('/:id', commentController.getById);
router.post('/', commentController.create);
router.patch('/:id', commentController.update);
router.delete('/:id', commentController.remove);

export { router as commentsRouter };
