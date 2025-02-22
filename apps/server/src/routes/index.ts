import { Router } from 'express';
import { userRouter } from './users';
import { packRouter } from './packs';
import { marketplaceRouter } from './marketplace';
import { runRouter } from './runs';
import { runnerRouter } from './runners';
import { competitionsRouter } from './competitions';

const router: Router = Router();

router.use('/users', userRouter);

router.use('/packs', packRouter);

router.use('/marketplace', marketplaceRouter);

router.use('/workouts/runs', runRouter);

router.use('/runners', runnerRouter);

router.use('/competitions', competitionsRouter);

export default router;