import { Router } from 'express';

import { commentsRouter } from './comments';
import { competitionsRouter } from './competitions';
import { leaderboardRouter } from './leaderboard';
import { marketplaceRouter } from './marketplace';
import { packRouter } from './packs';
import { postsRouter } from './posts';
import { reactionsRouter } from './reactions';
import { runnerRouter } from './runners';
import { runRouter } from './runs';
import { userRouter } from './users';

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
