
import { PermissionError } from '@phyt/models';

import { env } from '@/env.js';

import { Request, Response, NextFunction, RequestHandler } from 'express';

import { validateAuth } from './auth.js';

export const validateAdmin = [
    validateAuth,
    (req: Request, res: Response, next: NextFunction): void => {
        const { privyId } = req.body as { privyId?: string };
        if (!privyId) {
            throw new PermissionError('Missing claims payload');
        }

        if (!env.ADMIN_IDS.has(privyId)) {
            throw new PermissionError('Unauthorized');
        }

        next();
    }
] as RequestHandler[];
