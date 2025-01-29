import { Router } from 'express';
import { userRouter } from './users';
import { packRouter } from './packs';

const router: Router = Router();

router.use('/users', userRouter);

router.use('/packs', packRouter);

export default router;