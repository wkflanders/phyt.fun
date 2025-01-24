import { privy } from '../lib/privyClient';
import { Request, Response, NextFunction } from 'express';


export const validateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const accessToken = req.cookies['privy-token'];
        if (!accessToken) {
            return res.status(401).json({
                error: 'No authentication token found'
            });
        }

        await privy.verifyAuthToken(accessToken);

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};