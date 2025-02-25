import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { runnerService } from '../services/runnerServices';

const router: Router = express.Router();

router.use(validateAuth);

router.get('/', async (req, res) => {
    try {
        const search = req.query.search as string | undefined;
        const runners = await runnerService.getAllRunners({ search });
        return res.status(200).json(runners);
    } catch (error) {
        console.error('Failed to fetch runners:', error);
        return res.status(500).json({ error: 'Failed to fetch runners' });
    }
});

// Get a specific runner by ID
router.get('/runner/:id', async (req, res) => {
    try {
        const runnerId = parseInt(req.params.id);
        if (isNaN(runnerId)) {
            return res.status(400).json({ error: 'Invalid runner ID' });
        }

        const runner = await runnerService.getRunnerById(runnerId);
        return res.status(200).json(runner);
    } catch (error) {
        console.error('Failed to fetch runner:', error);
        return res.status(500).json({ error: 'Failed to fetch runner' });
    }
});

// Get all runner activities
router.get('/activities', async (req, res) => {
    try {
        const filter = req.query.filter as string | undefined;
        const activities = await runnerService.getRecentActivities(filter);
        return res.status(200).json(activities);
    } catch (error: any) {
        console.error('Failed to get all activities:', error);
        return res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to fetch runner activities'
        });
    }
});

router.get('/activities/:id', async (req, res) => {
    try {
        const runnerId = parseInt(req.params.id);
        if (isNaN(runnerId)) {
            return res.status(400).json({ error: 'Invalid runner ID' });
        }

        const activities = await runnerService.getRunnerActivities(runnerId);
        return res.status(200).json(activities);
    } catch (error: any) {
        console.error('Failed to get runner activity:', error);
        return res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to fetch runner activities'
        });
    }
});

export { router as runnerRouter };