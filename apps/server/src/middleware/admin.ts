import { db, eq, users } from '@phyt/database';
import { Request, Response, NextFunction } from 'express';

import { privy } from '@/lib/privyClient';

import type { User } from '@phyt/types';

interface AdminRequest extends Request {
    body: {
        user?: User;
    };
}

export const validateAdmin = async (
    req: AdminRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const accessToken = (req.cookies as Record<string, string>)[
            'privy-token'
        ];
        if (!accessToken) {
            res.status(401).json({
                error: 'No authentication token found'
            });
            return;
        }

        // Verify the token and get the user's Privy ID
        const { userId: privyId } = await privy.verifyAuthToken(accessToken);

        const user = await db
            .select()
            .from(users)
            .where(eq(users.privy_id, privyId))
            .limit(1)
            .then((results) =>
                results.length > 0 ? (results[0] as User) : null
            );

        if (user === null) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if user is an admin
        if (user.role !== 'admin') {
            res.status(403).json({
                error: 'Unauthorized - Admin access required'
            });
        }

        // Add user to request for use in route handlers
        req.body.user = user;

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};
