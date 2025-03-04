import { privy } from '../lib/privyClient';
import { Request, Response, NextFunction } from 'express';

export const validateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Invalid Authorization header format' });
        }

        const claims = await privy.verifyAuthToken(token);

        if (!claims || !claims.userId) {
            return res.status(401).json({ error: 'Invalid token claims' });
        }

        req.userId = claims.userId;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};