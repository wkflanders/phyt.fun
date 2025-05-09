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
import { userRouter } from './users.js';

const router: Router = Router();

router.use('/users', userRouter);

router.use('/packs', packRouter);

router.use('/marketplace', marketplaceRouter);

router.use('/workouts/runs', runRouter);

router.use('/runners', runnerRouter);

router.use('/competitions', competitionsRouter);

router.use('/posts', postsRouter);

router.use('/comments', commentsRouter);

router.use('/reactions', reactionsRouter);

router.use('/leaderboard', leaderboardRouter);

export default router;
