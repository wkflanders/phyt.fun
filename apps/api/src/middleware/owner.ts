import { PermissionError } from '@phyt/models';

import { Request, Response, NextFunction } from 'express';

export const ensureOwnership = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { privyId: tokenPrivyId } = req.body as { privyId?: string };
    if (!tokenPrivyId) {
        throw new PermissionError('Missing claims payload');
    }

    const { privyId: paramPrivyId } = req.params;
    if (!paramPrivyId) {
        throw new PermissionError('Missing privyId in path');
    }

    if (paramPrivyId !== tokenPrivyId) {
        throw new PermissionError('Not authorized to access this resource');
    }

    next();
};
