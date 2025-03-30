/* eslint-disable @typescript-eslint/no-misused-promises */
import { HttpError, CompetitionLineupRequestBody } from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { validateAuth } from '@/middleware/auth';
import { competitionService } from '@/services/competitionServices';

const router: Router = express.Router();

router.use(validateAuth);

// Get all competitions
router.get('/', async (req, res) => {
    const { active, type } = req.query;

    const competitions = await competitionService.getCompetitions({
        active: active === 'true',
        type: type as string
    });

    return res.status(200).json(competitions);
});

// Get a specific competition by ID
router.get('/:id', async (req, res) => {
    const competitionId = parseInt(req.params.id);
    if (isNaN(competitionId)) {
        throw new HttpError('Invalid competition ID', 400);
    }

    const competition =
        await competitionService.getCompetitionById(competitionId);
    return res.status(200).json(competition);
});

// Submit a lineup for a competition (for gamblers)
router.post(
    '/:id/lineup',
    async (
        req: Request<
            { id: string },
            Record<string, unknown>,
            CompetitionLineupRequestBody
        >,
        res: Response
    ) => {
        const competitionId = parseInt(req.params.id);
        const { userId, cardIds } = req.body;

        if (isNaN(competitionId)) {
            throw new HttpError('Invalid competition ID', 400);
        }

        if (!Array.isArray(cardIds) || cardIds.length === 0) {
            throw new HttpError('Invalid competition ID', 400);
        }

        const result = await competitionService.submitLineup(
            competitionId,
            userId,
            cardIds
        );
        return res.status(200).json(result);
    }
);

export { router as competitionsRouter };
