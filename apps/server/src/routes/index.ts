import { Router } from 'express';
import { userRouter } from './users';
import { packRouter } from './packs';
import { marketplaceRouter } from './marketplace';
import { runRouter } from './runs';
import { runnerRouter } from './runners';
import { competitionsRouter } from './competitions';
import { postsRouter } from './posts';
import { commentsRouter } from './comments';
import { reactionsRouter } from './reactions';
import { leaderboardRouter } from './leaderboard';

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