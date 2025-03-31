import { HttpError } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

import { privy } from '@/lib/privyClient';

export const validateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new HttpError('Missing Authorization header', 401);
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new HttpError('Invalid Authorization header format', 401);
        }

        const claims = await privy.verifyAuthToken(token);

        if (!claims.userId) {
            throw new HttpError('Invalid token claims', 401);
        }

        req.auth = { privy_id: claims.userId };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        next(new HttpError('Authentication failed', 401));
    }
};
