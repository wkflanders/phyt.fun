// src/routes/runs.ts
import express, { Router } from 'express';

import { controller } from '@/container.js';
import { validateAuth } from '@/middleware/auth.js';

const router: Router = express.Router();

// Protect all routes
router.use(validateAuth);

// Get all runs with runner info (must be before /:runId to avoid path conflicts)
router.get('/', ...controller.runs.getRunsWithRunnerInfo);

// Get all pending runs (must be before /:runId to avoid path conflicts)
router.get('/pending', ...controller.runs.getPendingRuns);

// Get all runs by a runner (must be before /:runId to avoid path conflicts)
router.get('/runner/:runnerId', ...controller.runs.getRunsByRunnerId);

// Get a single run by ID
router.get('/:runId', ...controller.runs.getRunById);

// Create a new run
router.post('/', ...controller.runs.createRun);

// Update run verification status
router.patch('/:runId/verify', ...controller.runs.updateRunVerificationStatus);

// Mark a run as posted
router.patch('/:runId/post', ...controller.runs.markRunAsPosted);

// Delete a run
router.delete('/:runId', ...controller.runs.deleteRun);

export { router as runRouter };
