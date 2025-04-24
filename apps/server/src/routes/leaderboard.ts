import { UUIDv7 } from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { validateAuth } from '@/middleware/auth.js';
import { leaderboardService } from '@/services/leaderboardServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Get runner leaderboard
router.get('/runners', async (req: Request, res: Response) => {
    const { page = '1', limit = '20', timeFrame = 'weekly' } = req.query;

    const runnerLeaderboard = await leaderboardService.getRunnerLeaderboard({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime'
    });

    res.status(200).json(runnerLeaderboard);
});

// Get manager leaderboard
router.get('/managers', async (req: Request, res: Response) => {
    const { page = '1', limit = '20', timeFrame = 'weekly' } = req.query;

    const managerLeaderboard = await leaderboardService.getManagerLeaderboard({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime'
    });

    res.status(200).json(managerLeaderboard);
});

// Get runner standing by privyId
router.get('/runner/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { timeFrame = 'weekly' } = req.query;

    if (id.includes('privy')) {
        const runnerStanding = await leaderboardService.getRunnerStanding(
            id,
            true,
            { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
        );
        res.status(200).json(runnerStanding);
    } else {
        const runnerStanding = await leaderboardService.getRunnerStanding(
            id,
            false,
            { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
        );
        res.status(200).json(runnerStanding);
    }
});

// Get manager standing by privyId
router.get('/manager/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { timeFrame = 'weekly' } = req.query;

    if (id.includes('privy')) {
        const managerStanding = await leaderboardService.getManagerStanding(
            id,
            true,
            { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
        );
        res.status(200).json(managerStanding);
    } else {
        const managerStanding = await leaderboardService.getManagerStanding(
            id,
            false,
            { timeFrame: timeFrame as 'weekly' | 'monthly' | 'allTime' }
        );
        res.status(200).json(managerStanding);
    }
});

export { router as leaderboardRouter };
