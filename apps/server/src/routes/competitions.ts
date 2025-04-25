import {
    UUIDv7,
    CompetitionLineupRequestBody,
    LineupSubmissionResponse,
    Competition,
    ValidationError
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { validateAuth } from '@/middleware/auth.js';
import { competitionService } from '@/services/competitionServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Get all competitions
router.get(
    '/',
    async (
        req: Request<
            undefined,
            Competition[],
            undefined,
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
        const competitionId = req.params.id;
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
            { id: UUIDv7 },
            LineupSubmissionResponse,
            CompetitionLineupRequestBody
        >,
        res: Response<LineupSubmissionResponse>
    ) => {
        const competitionId = req.params.id;
        const { userId, cardIds } = req.body;

        if (!Array.isArray(cardIds) || cardIds.length === 0) {
            throw new ValidationError('Invalid competition ID');
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
