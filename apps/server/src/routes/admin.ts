import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { validateAdmin } from '../middleware/admin';
import { adminService } from '../services/adminServices';

const router: Router = express.Router();

// Apply both auth and admin validation to all admin routes
router.use(validateAuth);
router.use(validateAdmin);

// Get pending runners
router.get('/pending-runners', async (req, res) => {
    try {
        const runners = await adminService.getPendingRunners();
        return res.status(200).json(runners);
    } catch (error) {
        console.error('Failed to fetch pending runners:', error);
        return res.status(500).json({ error: 'Failed to fetch pending runners' });
    }
});

// Get pending runs
router.get('/pending-runs', async (req, res) => {
    try {
        const runs = await adminService.getPendingRuns();
        return res.status(200).json(runs);
    } catch (error) {
        console.error('Failed to fetch pending runs:', error);
        return res.status(500).json({ error: 'Failed to fetch pending runs' });
    }
});

// Approve runner
router.post('/runners/:id/approve', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const updatedUser = await adminService.approveRunner(userId);
        return res.status(200).json(updatedUser);
    } catch (error: any) {
        console.error('Failed to approve runner:', error);
        if (error.name === 'NotFoundError') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to approve runner' });
    }
});

// Update run verification status
router.patch('/runs/:id/verify', async (req, res) => {
    try {
        const runId = parseInt(req.params.id);
        const { status } = req.body;

        if (isNaN(runId)) {
            return res.status(400).json({ error: 'Invalid run ID' });
        }

        if (!['verified', 'flagged'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedRun = await adminService.updateRunVerification(runId, status);
        return res.status(200).json(updatedRun);
    } catch (error: any) {
        console.error('Failed to update run verification:', error);
        if (error.name === 'NotFoundError') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to update run verification' });
    }
});

export { router as adminRouter };