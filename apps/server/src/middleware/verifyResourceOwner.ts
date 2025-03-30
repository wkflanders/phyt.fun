import { AuthenticatedRequest, HttpError } from '@phyt/types';
import { Response, NextFunction } from 'express';

import { userService } from '@/services/userServices';

export function makeVerifyResourceOwner<IdType extends number | string>(
    extractId: (req: AuthenticatedRequest) => IdType | undefined,
    findOwner: (resourceId: IdType) => Promise<number>
) {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    ) => {
        try {
            const authPrivyId = req.body.auth.privy_id;
            if (!authPrivyId) {
                throw new HttpError('Missing authenticated user Privy ID', 401);
            }

            const resourceId = extractId(req);
            if (!resourceId) {
                throw new HttpError('Missing or invalid resource ID', 400);
            }

            const ownerUserId = await findOwner(resourceId); // matches <IdType>
            const owner = await userService.getUserById(ownerUserId);

            if (owner.privy_id !== authPrivyId) {
                throw new HttpError('Unauthorized: mismatched user', 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
