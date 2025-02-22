import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { competitionService } from '../services/competitionServices';

const router: Router = express.Router();

// Get all competitions
router.get('/', async (req, res) => {
    try {
        const { active, type } = req.query;

        const competitions = await competitionService.getCompetitions({
            active: active === 'true',
            type: type as string,
        });

        return res.status(200).json(competitions);
    } catch (error) {
        console.error('Failed to fetch competitions:', error);
        return res.status(500).json({ error: 'Failed to fetch competitions' });
    }
});

// Get a specific competition by ID
router.get('/:id', validateAuth, async (req, res) => {
    try {
        const competitionId = parseInt(req.params.id);
        if (isNaN(competitionId)) {
            return res.status(400).json({ error: 'Invalid competition ID' });
        }

        const competition = await competitionService.getCompetitionById(competitionId);
        return res.status(200).json(competition);
    } catch (error) {
        console.error('Failed to fetch competition:', error);
        if (error instanceof Error && error.name === 'NotFoundError') {
            return res.status(404).json({ error: 'Competition not found' });
        }
        return res.status(500).json({ error: 'Failed to fetch competition' });
    }
});

// Submit a lineup for a competition (for gamblers)
router.post('/:id/lineup', validateAuth, async (req, res) => {
    try {
        const competitionId = parseInt(req.params.id);
        const { userId, cardIds } = req.body;

        if (isNaN(competitionId)) {
            return res.status(400).json({ error: 'Invalid competition ID' });
        }

        if (!Array.isArray(cardIds) || cardIds.length === 0) {
            return res.status(400).json({ error: 'Card IDs must be a non-empty array' });
        }

        const result = await competitionService.submitLineup(competitionId, userId, cardIds);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Failed to submit lineup:', error);
        if (error instanceof Error && error.name === 'NotFoundError') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to submit lineup' });
    }
});

export { router as competitionsRouter };