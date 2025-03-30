import { Request, Response, NextFunction } from 'express';

import { privy } from '@/lib/privyClient';

import { HttpError } from './errorHandler';

export const validateAuth = async (
    req: Request,
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

        req.userId = claims.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        throw new HttpError('Authentication failed', 401);
    }
};
