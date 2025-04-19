import { HttpError } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

import { env } from '@/env.js';
import { privy } from '@/lib/privyClient.js';

export const validateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader?.startsWith('Bearer ')) {
            throw new HttpError('Missing Authorization header', 401);
        }

        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            throw new HttpError('Invalid Authorization header format', 401);
        }

        // Verify and type the token claims
        const claims: { userId?: string } = await privy.verifyAuthToken(
            token,
            env.PRIVY_VERIFICATION_KEY
        );

        if (!claims.userId) {
            throw new HttpError('Invalid token claims', 403);
        }

        req.auth = { privy_id: claims.userId };
        next();
    } catch (err) {
        // Safely handle unknown error
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Authentication error:', error.message);
        next(new HttpError('Authentication failed', 403));
    }
};
