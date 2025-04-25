import {
    UUIDv7,
    ValidationError,
    RunnerProfile,
    RunnerQueryParams,
    RunnerActivity,
    RunnerPoolStatus
} from '@phyt/types';
import express, { Request, Response, Router } from 'express';

import { validateAuth } from '@/middleware/auth.js';
import { runnerService } from '@/services/runnerServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Get all runners
router.get(
    '/',
    async (
        req: Request<undefined, RunnerProfile[], undefined, RunnerQueryParams>,
        res: Response<RunnerProfile[]>
    ) => {
        const { search, sortBy, sortOrder } = {
            search: req.query.search,
            sortBy: req.query.sortBy ?? 'totalDistance',
            sortOrder: req.query.sortOrder ?? 'desc'
        };

        const runners = await runnerService.getAllRunners({
            search,
            sortBy,
            sortOrder
        });
        res.status(200).json(runners);
    }
);

// Get runner status by privyId
router.get(
    '/:privyId/status',
    async (
        req: Request<{ privyId: string }, RunnerPoolStatus>,
        res: Response<RunnerPoolStatus>
    ) => {
        const { privyId } = req.params;

        const status = await runnerService.getRunnerStatusByPrivyId(privyId);
        res.status(200).json(status);
    }
);

// Get a specific runner by ID
router.get(
    '/runner/:id',
    async (
        req: Request<{ id: UUIDv7 }, RunnerProfile, undefined>,
        res: Response<RunnerProfile>
    ) => {
        const runnerId = req.params.id;
        if (!runnerId) {
            throw new ValidationError('Invalid runner id');
        }

        const runner = await runnerService.getRunnerById(runnerId);
        res.status(200).json(runner);
    }
);

// Get all runner activities
router.get(
    '/activities',
    async (
        req: Request<
            undefined,
            RunnerActivity[],
            undefined,
            { filter?: string }
        >,
        res: Response<RunnerActivity[]>
    ) => {
        const filter = req.query.filter;
        const activities = await runnerService.getRecentActivities(filter);
        res.status(200).json(activities);
    }
);

router.get(
    '/activities/:id',
    async (
        req: Request<{ id: UUIDv7 }, RunnerActivity[]>,
        res: Response<RunnerActivity[]>
    ) => {
        const runnerId = req.params.id;
        if (!runnerId) {
            throw new ValidationError('Invalid runner id');
        }

        const activities = await runnerService.getRunnerActivities(runnerId);
        res.status(200).json(activities);
    }
);

export { router as runnerRouter };
