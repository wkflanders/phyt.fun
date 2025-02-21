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
router.get('/:id', async (req, res) => {
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

export { router as runnerRouter };