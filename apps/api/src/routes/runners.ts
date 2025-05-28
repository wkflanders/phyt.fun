import { controller } from '@/container.js';

import { Router } from 'express';

const router: Router = Router();

// Get all runners
router.get('/', ...controller.runners.getAllRunners);

// Get a specific runner by ID
router.get('/runner/:id', ...controller.runners.getRunnerById);

export { router as runnerRouter };
