// src/routes/runs.ts
import express, { Router, Request, Response } from 'express';

import { z } from 'zod';

import {
    UUIDv7,
    NotFoundError,
    RunnerApplicationStatus,
    Run,
    Post,
    RunVerificationStatus
} from '@phyt/types';

import {
    workoutSchema,
    createPostSchema
} from '../../../../packages/infra/src/validation.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';
// import { postService } from '@/services/postServices.js';
import { runService } from '@/services/runServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Apply to be a runner
router.post(
    '/apply/:privyId',
    async (
        req: Request<
            { privyId: string },
            RunnerApplicationStatus,
            { workouts: Run[] }
        >,
        res: Response<RunnerApplicationStatus>
    ) => {
        const { privyId } = req.params;

        if (!privyId) {
            throw new NotFoundError('Missing valid Id');
        }

        const workouts = req.body.workouts;

        const result = await runService.processRunnerApplication({
            privyId,
            workouts
        });

        switch (result) {
            case 'success':
                res.status(200).json('success');
                break;
            case 'alreadyRunner':
                res.status(200).json('alreadyRunner');
                break;
            default:
                res.status(200).json('alreadySubmitted');
                break;
        }
    }
);

// Get all runs by a runner
router.get(
    '/:runnerId',
    async (req: Request<{ runnerId: UUIDv7 }, Run[]>, res: Response<Run[]>) => {
        const runnerId = req.params.runnerId;

        if (!runnerId) {
            throw new NotFoundError('Invalid runner Id');
        }

        const runs = await runService.getRunnerRuns(runnerId);
        res.status(200).json(runs);
    }
);

// Get a single run by Id
router.get(
    '/:runId',
    async (req: Request<{ runId: UUIDv7 }, Run>, res: Response<Run>) => {
        const runId = req.params.runId;

        if (!runId) {
            throw new NotFoundError('Invalid run Id');
        }

        const run = await runService.getRunById(runId);
        res.status(200).json(run);
    }
);

// Submit batch workouts
router.post(
    '/batch/:privyId',
    validateSchema(z.array(workoutSchema)),
    async (
        req: Request<{ privyId: string }, Run[], { workouts: Run[] }>,
        res: Response<Run[]>
    ) => {
        const { privyId } = req.params;

        if (!privyId) {
            throw new NotFoundError('Missing valid Id');
        }

        const workouts = req.body.workouts;

        const results = await runService.createRunsBatchByPrivyId({
            privyId,
            workouts
        });

        res.status(200).json(results);
    }
);

// Submit and post a run as its completed
router.post(
    '/single/:privyId',
    validateSchema(workoutSchema),
    async (
        req: Request<
            { privyId: string },
            { run: Run; post: Post | null },
            { toPost: boolean; workout: Run }
        >,
        res: Response<{ run: Run; post: Post | null }>
    ) => {
        const { privyId } = req.params;

        if (!privyId) {
            throw new NotFoundError('Missing valid Id');
        }

        const { toPost, workout } = req.body;

        const run = await runService.createRunByPrivyId({
            privyId,
            workout
        });

        let createdPost = null;
        if (toPost) {
            createdPost = await postService.createPost(run.id);

            await runService.markRunAsPosted(run.id);
        }

        res.status(201).json({ run, post: createdPost });
    }
);

// Post an already completed run
router.post(
    '/:runId/post',
    validateSchema(createPostSchema),
    async (req: Request<{ runId: UUIDv7 }, Post>, res: Response<Post>) => {
        const runId = req.params.runId;

        if (!runId) {
            throw new NotFoundError('Invalid run Id');
        }

        const createdPost = await postService.createPost(runId);

        await runService.markRunAsPosted(runId);

        res.status(201).json(createdPost);
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
    async (
        req: Request<{ runId: UUIDv7 }, Run, { status: RunVerificationStatus }>,
        res: Response<Run>
    ) => {
        const runId = req.params.runId;

        if (!runId) {
            throw new NotFoundError('Invalid run Id');
        }

        const { status } = req.body;

        if (!status.length) {
            throw new NotFoundError('Initial run status missing');
        }

        const updatedRun = await runService.updateRunVerificationStatus({
            runId,
            status
        });

        res.status(200).json(updatedRun);
    }
);

// Delete a run
router.delete(
    '/:runId',
    async (req: Request<{ runId: UUIDv7 }, Run>, res: Response<Run>) => {
        const runId = req.params.runId;

        if (!runId) {
            throw new NotFoundError('Invalid run Id');
        }

        const deletedRun = await runService.deleteRun(runId);

        res.status(200).json(deletedRun);
    }
);

export { router as runRouter };
