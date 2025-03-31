import {
    HttpError,
    CompetitionLineupRequestBody,
    LineupSubmissionResponse,
    Competition
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { validateAuth } from '@/middleware/auth';
import { competitionService } from '@/services/competitionServices';

const router: Router = express.Router();

router.use(validateAuth);

// Get all competitions
router.get(
    '/',
    async (
        req: Request<
            Record<string, never>,
            Competition[],
            Record<string, never>,
            { active: boolean; type: string }
        >,
        res: Response<Competition[]>
    ) => {
        const { active, type } = req.query;

        const competitions = await competitionService.getCompetitions({
            active,
            type
        });

        res.status(200).json(competitions);
    }
);

// Get a specific competition by ID
router.get(
    '/:id',
    async (
        req: Request<Record<string, never>, Competition, { id: string }>,
        res: Response<Competition>
    ) => {
        const competitionId = parseInt(req.params.id);
        if (isNaN(competitionId)) {
            throw new HttpError('Invalid competition ID', 400);
        }

        const competition =
            await competitionService.getCompetitionById(competitionId);
        res.status(200).json(competition);
    }
);

// Submit a lineup for a competition (for gamblers)
router.post(
    '/:id/lineup',
    async (
        req: Request<
            { id: string },
            LineupSubmissionResponse,
            CompetitionLineupRequestBody
        >,
        res: Response<LineupSubmissionResponse>
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
        res.status(200).json(result);
    }
);

export { router as competitionsRouter };
