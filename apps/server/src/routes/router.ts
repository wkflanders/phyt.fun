import { Router } from 'express';

import { commentsRouter } from './comments.js';
import { competitionsRouter } from './competitions.js';
import { leaderboardRouter } from './leaderboard.js';
import { marketplaceRouter } from './marketplace.js';
import { packRouter } from './packs.js';
import { postsRouter } from './posts.js';
import { reactionsRouter } from './reactions.js';
import { runnerRouter } from './runners.js';
import { runRouter } from './runs.js';
import { usersRouter } from './users.js';

const router: Router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     description: Returns a 200 OK response if the API is running
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
});

// API Routes
router.use('/comments', commentsRouter);
router.use('/users', usersRouter);

router.use('/packs', packRouter);

router.use('/marketplace', marketplaceRouter);

router.use('/workouts/runs', runRouter);

router.use('/runners', runnerRouter);

router.use('/competitions', competitionsRouter);

router.use('/posts', postsRouter);

router.use('/reactions', reactionsRouter);

router.use('/leaderboard', leaderboardRouter);

export { router };
