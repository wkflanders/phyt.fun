import { privy } from '../lib/privyClient';
import { Request, Response, NextFunction } from 'express';


export const validateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const accessToken = req.cookies['privy-token'];
        if (!accessToken?.value) {
            return res.status(401).json({
                error: 'No authentication token found'
            });
        }

        await privy.verifyAuthToken(accessToken.value);

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};