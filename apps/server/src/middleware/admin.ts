import { Request, Response, NextFunction } from 'express';
import { db, eq } from '@phyt/database';
import { users } from '@phyt/database';
import { privy } from '../lib/privyClient';

export const validateAdmin = async (
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

        // Verify the token and get the user's Privy ID
        const { userId: privyId } = await privy.verifyAuthToken(accessToken);

        // Get the user from our database
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.privy_id, privyId));

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized - Admin access required' });
        }

        // Add user to request for use in route handlers
        req.body.user = user;

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};