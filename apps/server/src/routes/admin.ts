/* eslint-disable @typescript-eslint/no-misused-promises */
import { HttpError } from '@phyt/types';
import express, { Router } from 'express';

import { validateAdmin } from '@/middleware/admin';
import { validateAuth } from '@/middleware/auth';
import { adminService } from '@/services/adminServices';

interface VerifyRunStatus {
    status: 'verified' | 'flagged';
}

const router: Router = express.Router();

router.use(validateAuth);
router.use(validateAdmin);

// Get pending runners
router.get('/pending-runners', async (req, res) => {
    const runners = await adminService.getPendingRunners();
    res.status(200).json(runners);
});

// Get pending runs
router.get('/pending-runs', async (req, res) => {
    const runs = await adminService.getPendingRuns();
    res.status(200).json(runs);
});

// Approve runner
router.post('/runners/:id/approve', async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        throw new HttpError('Invalid user ID', 400);
    }

    const updatedUser = await adminService.approveRunner(userId);
    res.status(200).json(updatedUser);
});

// Update run verification status
router.patch('/runs/:id/verify', async (req, res) => {
    const runId = parseInt(req.params.id);
    const { status } = req.body as VerifyRunStatus;

    if (isNaN(runId)) {
        throw new HttpError('Invalid run ID', 400);
    }

    if (!['verified', 'flagged'].includes(status)) {
        throw new HttpError('Invalid status', 400);
    }

    const updatedRun = await adminService.updateRunVerification(runId, status);
    res.status(200).json(updatedRun);
});

export { router as adminRouter };
