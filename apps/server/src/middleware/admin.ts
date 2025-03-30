import { db, eq, users } from '@phyt/database';
import { HttpError, User } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

import { validateAuth } from './auth';

interface AdminRequest extends Request {
    body: {
        user: User;
    };
}

export const validateAdmin = [
    validateAuth,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async (req: AdminRequest, res: Response, next: NextFunction) => {
        try {
            const privyId = req.userId;

            if (!privyId) {
                throw new HttpError('User ID not provided', 401);
            }

            const user = await db
                .select()
                .from(users)
                .where(eq(users.privy_id, privyId))
                .limit(1)
                .then((results) =>
                    results.length > 0 ? (results[0] as User) : null
                );

            if (user === null) {
                throw new HttpError('User not found', 404);
            }

            if (user.role !== 'admin') {
                throw new HttpError('Unauthorized', 404);
            }

            req.body.user = user;

            next();
        } catch (error) {
            next(error);
        }
    }
];
