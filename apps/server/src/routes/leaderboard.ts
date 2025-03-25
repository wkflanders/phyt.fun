import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { leaderboardService } from '../services/leaderboardServices';

const router: Router = express.Router();

router.use(validateAuth);

// Get runner leaderboard
router.get('/runners', async (req, res) => {
    try {
        const { page = '1', limit = '20', timeFrame = 'weekly' } = req.query;

        const runnerLeaderboard = await leaderboardService.getRunnerLeaderboard({
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime'
        });

        return res.status(200).json(runnerLeaderboard);
    } catch (error) {
        console.error('Failed to fetch runner leaderboard:', error);
        return res.status(500).json({ error: 'Failed to fetch runner leaderboard' });
    }
});

// Get manager leaderboard
router.get('/managers', async (req, res) => {
    try {
        const { page = '1', limit = '20', timeFrame = 'weekly' } = req.query;

        const managerLeaderboard = await leaderboardService.getManagerLeaderboard({
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime'
        });

        return res.status(200).json(managerLeaderboard);
    } catch (error) {
        console.error('Failed to fetch manager leaderboard:', error);
        return res.status(500).json({ error: 'Failed to fetch manager leaderboard' });
    }
});

// Get runner standing by privyId
router.get('/runner/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { timeFrame = 'weekly' } = req.query;

        if (id.includes('privy')) {
            const runnerStanding = await leaderboardService.getRunnerStanding(
                id,
                true,
                { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
            );
            return res.status(200).json(runnerStanding);
        } else {
            const runnerStanding = await leaderboardService.getRunnerStanding(
                Number(id),
                false,
                { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
            );
            return res.status(200).json(runnerStanding);
        }
    } catch (error) {
        console.error('Failed to fetch runner standing:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch runner standing' });
    }
});

// Get manager standing by privyId
router.get('/manager/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { timeFrame = 'weekly' } = req.query;

        if (id.includes('privy')) {
            const managerStanding = await leaderboardService.getManagerStanding(
                id,
                true,
                { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
            );
            return res.status(200).json(managerStanding);
        } else {
            const managerStanding = await leaderboardService.getManagerStanding(
                Number(id),
                false,
                { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
            );
            return res.status(200).json(managerStanding);
        }
    } catch (error) {
        console.error('Failed to fetch manager standing:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch manager standing' });
    }
});

export { router as leaderboardRouter };