// src/routes/runs.ts
import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { workoutSchema, createPostSchema } from '../lib/validation';
import { runService } from '../services/runServices';
import { postService } from 'src/services/postServices';
import { NotFoundError, DatabaseError } from '@phyt/types';
import { z } from 'zod';

const router: Router = express.Router();

router.use(validateAuth);

router.post('/apply/:privyId', async (req, res) => {
    try {
        const { privyId } = req.params;
        const workouts = req.body;
        // user signs on to app
        // if not a runner on login, have them apply and THEN run batch send
        // disable sending button if not a runner 
        // hit apply button, which sends to this route - will send batch runs along with this route
        const status = await runService.applyToBeRunner(privyId);
        if (status === 'pending') {
            const results = await runService.createRunsBatchByPrivyId({
                privyId,
                workouts
            });
            if (results) {
                return res.status(200).json('Application submitted');
            }
        } else if (status === 'already_runner') {
            return res.status(200).json('Already a runner');
        } else if (status === 'already_submitted') {
            return res.status(200).json('Already applied');
        } else {
            return res.status(400).json('Application failed');
        }
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
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
router.post('/batch/:privyId', validateSchema(z.array(workoutSchema)), async (req, res) => {
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
        return res.status(500).json({ error: 'Failed to process workouts batch' });
    }
});

router.post('/single/:privyId', validateSchema(workoutSchema), async (req, res) => {
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
});

router.post('/:runId/post', validateSchema(createPostSchema), async (requestAnimationFrame, res) => {
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
        return res.status(500).json({ error: 'Failed to create a post from run' });
    }
});

// Update run verification status
router.patch('/:runId/verify', validateSchema(
    z.object({
        status: z.enum(['pending', 'verified', 'flagged'])
    })
), async (req, res) => {
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
        return res.status(500).json({ error: 'Failed to update run status' });
    }
});

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