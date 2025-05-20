import { VerifyRunStatusSchema } from '@phyt/dto';

import { validateAdmin } from '@/middleware/admin.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

import type {
    UserDTO,
    VerifyRunStatusDTO,
    PendingRunnerDTO,
    PendingRunDTO,
    RunDTO
} from '@phyt/dto';
import type { AdminService } from '@phyt/services';
import type { UUIDv7 } from '@phyt/types';
import type { Request, RequestHandler, Response } from 'express';

export interface AdminController {
    getPendingRunners: RequestHandler[];
    getPendingRuns: RequestHandler[];
    approveRunner: RequestHandler[];
    updateRunVerification: RequestHandler[];
}

export const makeAdminController = (svc: AdminService): AdminController => {
    const getPendingRunners = [
        validateAuth,
        validateAdmin,
        async (req: Request, res: Response<PendingRunnerDTO[]>) => {
            const pendingRunners = await svc.getPendingRunners();
            res.status(200).json(pendingRunners);
        }
    ] as RequestHandler[];

    const getPendingRuns = [
        validateAuth,
        validateAdmin,
        async (req: Request, res: Response<PendingRunDTO[]>) => {
            const pendingRuns = await svc.getPendingRuns();
            res.status(200).json(pendingRuns);
        }
    ] as RequestHandler[];

    const approveRunner = [
        validateAuth,
        validateAdmin,
        async (req: Request<{ id: UUIDv7 }>, res: Response<UserDTO>) => {
            const userId = req.params.id;
            if (!userId) {
                res.status(400).json({ error: 'Invalid user ID' } as any);
                return;
            }

            const updatedUser = await svc.approveRunner(userId);
            res.status(200).json(updatedUser);
        }
    ] as RequestHandler[];

    const updateRunVerification = [
        validateAuth,
        validateAdmin,
        validateSchema(undefined, VerifyRunStatusSchema),
        async (
            req: Request<{ id: UUIDv7 }, RunDTO, VerifyRunStatusDTO>,
            res: Response<RunDTO>
        ) => {
            const runId = req.params.id;
            const { status } = req.body;

            if (!runId) {
                res.status(400).json({ error: 'Invalid run ID' } as any);
                return;
            }

            if (!['verified', 'flagged'].includes(status)) {
                res.status(400).json({ error: 'Invalid status' } as any);
                return;
            }

            const updatedRun = await svc.updateRunVerification(runId, status);
            res.status(200).json(updatedRun);
        }
    ] as RequestHandler[];

    return {
        getPendingRunners,
        getPendingRuns,
        approveRunner,
        updateRunVerification
    };
};
