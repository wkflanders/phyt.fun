import { Router } from 'express';

import { controller } from '@/container.js';

const router: Router = Router();

// Get all runners
router.get('/', ...controller.runners.getAllRunners);

// Get runner status by privyId
router.get('/:privyId/status', ...controller.runners.getRunnerStatusByPrivyId);

// Get a specific runner by ID
router.get('/runner/:id', ...controller.runners.getRunnerById);

// Get all runner activities
router.get('/activities', ...controller.runners.getRecentActivities);

// Get activities for a specific runner
router.get('/activities/:id', ...controller.runners.getRunnerActivities);

export { router as runnerRouter };
