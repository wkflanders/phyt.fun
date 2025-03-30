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
router.get('/pending-runners', (req, res) => {
    adminService
        .getPendingRunners()
        .then((runners) => {
            res.status(200).json(runners);
        })
        .catch((error: unknown) => {
            console.error('Failed to fetch pending runners:', error);
            res.status(500).json({ error: 'Failed to fetch pending runners' });
        });
});

// Get pending runs
router.get('/pending-runs', (req, res) => {
    adminService
        .getPendingRuns()
        .then((runs) => {
            res.status(200).json(runs);
        })
        .catch((error: unknown) => {
            console.error('Failed to fetch pending runs:', error);
            res.status(500).json({ error: 'Failed to fetch pending runs' });
        });
});

// Approve runner
router.post('/runners/:id/approve', (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    adminService
        .approveRunner(userId)
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((error: unknown) => {
            console.error('Failed to approve runner:', error);
            res.status(500).json({ error: 'Failed to approve runner' });
        });
});

// Update run verification status
router.patch('/runs/:id/verify', (req, res) => {
    const runId = parseInt(req.params.id);
    const { status } = req.body as VerifyRunStatus;

    if (isNaN(runId)) {
        return res.status(400).json({ error: 'Invalid run ID' });
    }

    if (!['verified', 'flagged'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    adminService
        .updateRunVerification(runId, status)
        .then((updatedRun) => {
            res.status(200).json(updatedRun);
        })
        .catch((error: unknown) => {
            console.error('Failed to update run verification:', error);
            if (error && typeof error === 'object' && 'name' in error) {
                if (error.name === 'NotFoundError') {
                    res.status(404).json({ error: (error as Error).message });
                } else {
                    res.status(500).json({
                        error: 'Failed to update run verification'
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Failed to update run verification'
                });
            }
        });
});

export { router as adminRouter };
