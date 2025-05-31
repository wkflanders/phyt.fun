// src/routes/runs.ts
import { controller } from '@/container.js';

import express, { Router } from 'express';

const router: Router = express.Router();

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

// Update a run
router.patch('/:runId', ...controller.runs.updateRun);

// Delete a run
router.delete('/:runId', ...controller.runs.deleteRun);

export { router as runRouter };
