import { HttpError } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

import { userService } from '@/services/userServices.js';

import { validateAuth } from './auth.js';

export const validateAdmin = [
    validateAuth,

    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.auth) {
                throw new HttpError('Authentication data missing', 401);
            }

            if (!req.auth.privy_id) {
                throw new HttpError('User ID not provided', 401);
            }

            const user = await userService.getUserByPrivyId(req.auth.privy_id);

            if (user.role !== 'admin') {
                throw new HttpError('Unauthorized', 403);
            }

            next();
        } catch (error) {
            console.error('Unauthorized access restricted ', error);
            throw new HttpError('Unauthorized', 403);
        }
    }
];
