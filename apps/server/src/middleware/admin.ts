import { AuthenticationError, PermissionError } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

import { userService } from '@/services/userServices.js';

import { validateAuth } from './auth.js';

export const validateAdmin = [
    validateAuth,
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.auth?.privy_id) {
            throw new AuthenticationError('Authentication failed for request');
        }

        const user = await userService.getUserByPrivyId(req.auth.privy_id);

        if (user.role !== 'admin') {
            throw new PermissionError('Unauthorized');
        }

        next();
    }
];
