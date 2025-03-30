// src/routes/runs.ts
import { NotFoundError, DatabaseError } from '@phyt/types';
import express, { Router } from 'express';
import { z } from 'zod';

import { workoutSchema, createPostSchema } from '../lib/validation';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { postService } from '../services/postServices';
import { runService } from '../services/runServices';

const router: Router = express.Router();

router.use(validateAuth);

router.post('/apply/:privyId', async (req, res) => {
    try {
        const { privyId } = req.params;
        const workouts = req.body;

        const result = await runService.applyAsRunner({
            privyId,
            workouts
        });

        switch (result) {
            case 'success':
                return res.status(200).json({ message: 'success' });
            case 'already_runner':
                return res.status(200).json({ message: 'already_runner' });
            case 'already_submitted':
                return res.status(200).json({ message: 'already_submitted' });
            default:
                return res.status(400).json({ error: 'failed' });
        }
    } catch (error) {
        console.error('Error in runner application:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to process application' });
    }
});

router.get('/:runnerId', async (req, res) => {
    try {
        const runnerId = parseInt(req.params.runnerId);
        if (isNaN(runnerId)) {
            return res.status(400).json({ error: 'Invalid runner ID' });
        }

        const runs = await runService.getRunnerRuns(runnerId);
        return res.status(200).json(runs);
    } catch (error) {
        console.error('Error fetching runs:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch runs' });
    }
});

// Get a specific run by ID
router.get('/:runId', async (req, res) => {
    try {
        const runId = parseInt(req.params.runId);
        if (isNaN(runId)) {
            return res.status(400).json({ error: 'Invalid run ID' });
        }

        const run = await runService.getRunById(runId);
        return res.status(200).json(run);
    } catch (error) {
        console.error('Error fetching run:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch run' });
    }
});

// Submit batch workouts
router.post(
    '/batch/:privyId',
    validateSchema(z.array(workoutSchema)),
    async (req, res) => {
        try {
            const { privyId } = req.params;
            const workouts = req.body;

            const results = await runService.createRunsBatchByPrivyId({
                privyId,
                workouts
            });

            return res.status(201).json({
                message: 'Workouts processed successfully',
                count: results.length,
                runs: results
            });
        } catch (error) {
            console.error('Failed to process workouts batch:', error);
            if (error instanceof NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            return res
                .status(500)
                .json({ error: 'Failed to process workouts batch' });
        }
    }
);

router.post(
    '/single/:privyId',
    validateSchema(workoutSchema),
    async (req, res) => {
        try {
            const { privyId } = req.params;
            const { post: toPost, ...workout } = req.body;

            const run = await runService.createRunByPrivyId({
                privyId,
                workout
            });

            let createdPost = null;
            if (toPost && run) {
                createdPost = await postService.createPost(run.id);

                await runService.markRunAsPosted(run.id);
            }

            return res.status(201).json({
                message: 'Workout processed successfully',
                run,
                post: createdPost
            });
        } catch (error) {
            console.error('Failed to process workout:', error);
            if (error instanceof NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Failed to process workout' });
        }
    }
);

router.post(
    '/:runId/post',
    validateSchema(createPostSchema),
    async (requestAnimationFrame, res) => {
        try {
            const runId = parseInt(requestAnimationFrame.params.runId);
            if (isNaN(runId)) {
                return res.status(400).json({ error: 'Invalid run Id' });
            }

            const createdPost = await postService.createPost(runId);

            await runService.markRunAsPosted(runId);

            return res.status(201).json({
                message: 'Post created successfully',
                createdPost
            });
        } catch (error) {
            console.error('Failed to create a post from run: ', error);
            if (error instanceof NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            return res
                .status(500)
                .json({ error: 'Failed to create a post from run' });
        }
    }
);

// Update run verification status
router.patch(
    '/:runId/verify',
    validateSchema(
        z.object({
            status: z.enum(['pending', 'verified', 'flagged'])
        })
    ),
    async (req, res) => {
        try {
            const runId = parseInt(req.params.runId);
            if (isNaN(runId)) {
                return res.status(400).json({ error: 'Invalid run ID' });
            }

            const { status } = req.body;
            const updatedRun = await runService.updateRunVerificationStatus({
                runId,
                status
            });

            return res.status(200).json(updatedRun);
        } catch (error) {
            console.error('Error updating run verification status:', error);
            if (error instanceof NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            return res
                .status(500)
                .json({ error: 'Failed to update run status' });
        }
    }
);

// Delete a run
router.delete('/:runId', async (req, res) => {
    try {
        const runId = parseInt(req.params.runId);
        if (isNaN(runId)) {
            return res.status(400).json({ error: 'Invalid run ID' });
        }

        const deletedRun = await runService.deleteRun(runId);
        return res.status(200).json({
            message: 'Run deleted successfully',
            run: deletedRun
        });
    } catch (error) {
        console.error('Error deleting run:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to delete run' });
    }
});

export { router as runRouter };
