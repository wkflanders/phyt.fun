import {
    HttpError,
    CreateCommentRequest,
    AuthenticatedRequest,
    AuthenticatedBody
} from '@phyt/types';
import { Response, NextFunction } from 'express';

import { userService } from '@/services/userServices';

interface VerifyUserRequest extends AuthenticatedRequest {
    body: Partial<CreateCommentRequest> & AuthenticatedBody;
}

export const verifyUser = async (
    req: VerifyUserRequest,
    res: Response,
    next: NextFunction
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
    try {
        const authPrivyId = req.body.auth.privy_id;
        if (!authPrivyId) {
            throw new HttpError('Missing authenticated user Privy ID', 401);
        }

        const { user_id } = req.body;
        if (!user_id) {
            throw new HttpError('Missing user ID in request body', 400);
        }

        const user = await userService.getUserById(user_id);

        if (user.privy_id !== authPrivyId) {
            throw new HttpError('Unauthorized: mismatched user', 403);
        }

        next();
    } catch (error) {
        next(error);
    }
};
