import {
    Run,
    DatabaseError,
    NotFoundError,
    ValidationError
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { validateAdmin } from '@/middleware/admin.js';
import { validateAuth } from '@/middleware/auth.js';
import { adminService } from '@/services/adminServices.js';
interface VerifyRunStatus {
    status: 'verified' | 'flagged';
}

const router: Router = express.Router();

router.use(validateAuth);
router.use(validateAdmin);

// Get pending runners
router.get('/pending-runners', async (req: Request, res: Response) => {
    const runners = await adminService.getPendingRunners();
    res.status(200).json(runners);
});

// Get pending runs
router.get('/pending-runs', async (req: Request, res: Response) => {
    const runs = await adminService.getPendingRuns();
    res.status(200).json(runs);
});

// Approve runner
router.post('/runners/:id/approve', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        throw new ValidationError('Invalid user ID');
    }

    const updatedUser = await adminService.approveRunner(userId);
    res.status(200).json(updatedUser);
});

// Update run verification status
router.patch(
    '/runs/:id/verify',
    async (
        req: Request<{ id: string }, Run, VerifyRunStatus>,
        res: Response
    ) => {
        const runId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (isNaN(runId)) {
            throw new ValidationError('Invalid run ID');
        }

        if (!['verified', 'flagged'].includes(status)) {
            throw new ValidationError('Invalid status');
        }

        const updatedRun = await adminService.updateRunVerification(
            runId,
            status
        );
        res.status(200).json(updatedRun);
    }
);

export { router as adminRouter };
