import express, { Router } from 'express';

// import { adminRouter } from './admin.js';
import { commentsRouter } from './commentsRoutes.js';
// import { competitionsRouter } from './competitions.js';
// import { leaderboardRouter } from './leaderboard.js';
// import { marketplaceRouter } from './marketplace.js';
// import { metadataRouter } from './metadata.js';
// import { packRouter } from './packs.js';
import { postsRouter } from './postsRoutes.js';
import { reactionsRouter } from './reactionsRoutes.js';
import { runnerRouter } from './runnersRoutes.js';
import { runRouter } from './runsRoutes.js';
import { usersRouter } from './usersRoutes.js';

// Create the router
const router: Router = express.Router();

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
// router.use('/admin', adminRouter);
router.use('/comments', commentsRouter);
// router.use('/competitions', competitionsRouter);
// router.use('/leaderboard', leaderboardRouter);
// router.use('/marketplace', marketplaceRouter);
// router.use('/metadata', metadataRouter);
// router.use('/packs', packRouter);
router.use('/posts', postsRouter);
router.use('/reactions', reactionsRouter);
router.use('/runners', runnerRouter);
router.use('/runs', runRouter);
router.use('/users', usersRouter);

// Exports
export { router };
