import { Request, Response, NextFunction } from 'express';

import { privy } from '@/lib/privyClient';

export const validateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Missing Authorization header' });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                error: 'Invalid Authorization header format'
            });
            return;
        }

        const claims = await privy.verifyAuthToken(token);

        if (!claims.userId) {
            res.status(401).json({ error: 'Invalid token claims' });
            return;
        }

        req.userId = claims.userId;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
        return;
    }
};
