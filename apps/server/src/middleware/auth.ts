import { HttpError, AuthenticatedRequest } from '@phyt/types';
import { Response, NextFunction } from 'express';

import { privy } from '@/lib/privyClient';

export const validateAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new HttpError('Missing Authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new HttpError('Invalid Authorization header format', 401);
    }
    try {
        const claims = await privy.verifyAuthToken(token);

        if (!claims.userId) {
            throw new HttpError('Invalid token claims', 401);
        }

        req.body.user.id = claims.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        throw new HttpError('Authentication failed', 401);
    }
};
