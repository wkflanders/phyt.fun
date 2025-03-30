import { HttpError, AuthenticatedRequest } from '@phyt/types';
import { Response, NextFunction } from 'express';

import { userService } from '@/services/userServices';

import { validateAuth } from './auth';

export const validateAdmin = [
    validateAuth,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const privyId = req.body.auth.privy_id;

            if (!privyId) {
                throw new HttpError('User ID not provided', 401);
            }

            const user = await userService.getUserByPrivyId(privyId);

            if (user.role !== 'admin') {
                throw new HttpError('Unauthorized', 404);
            }

            next();
        } catch (error) {
            next(error);
        }
    }
];
