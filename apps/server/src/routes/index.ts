import { Router } from 'express';
import { userRouter } from './users';
import { packRouter } from './packs';
import { marketplaceRouter } from './marketplace';
import { runRouter } from './runs';

const router: Router = Router();

router.use('/users', userRouter);

router.use('/packs', packRouter);

router.use('/marketplace', marketplaceRouter);

router.use('/workouts/runs', runRouter);

export default router;