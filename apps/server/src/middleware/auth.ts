import { AuthenticationError } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

import { env } from '@/env.js';
import { privy } from '@/lib/privyClient.js';

export const validateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader?.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing authorization header');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
        throw new AuthenticationError('Missing authorization header payload');
    }

    // Verify and type the token claims
    const claims: { userId?: string } = await privy.verifyAuthToken(
        token,
        env.PRIVY_VERIFICATION_KEY
    );

    if (!claims.userId) {
        throw new AuthenticationError('Invalid token claims');
    }

    req.auth = { privy_id: claims.userId };
    next();
};
