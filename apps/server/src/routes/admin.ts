import { HttpError, Run, DatabaseError, NotFoundError } from '@phyt/types';
import express, { Router, Request, Response, NextFunction } from 'express';

import { validateAdmin } from '@/middleware/admin.js';
import { validateAuth } from '@/middleware/auth.js';
import { adminService } from '@/services/adminServices.js';
interface VerifyRunStatus {
    status: 'verified' | 'flagged';
}

const router: Router = express.Router();

router.use(validateAuth);
router.use(validateAdmin);

// Get pending runners
router.get(
    '/pending-runners',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const runners = await adminService.getPendingRunners();
            res.status(200).json(runners);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

// Get pending runs
router.get(
    '/pending-runs',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const runs = await adminService.getPendingRuns();
            res.status(200).json(runs);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

// Approve runner
router.post(
    '/runners/:id/approve',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                throw new HttpError('Invalid user ID', 400);
            }

            const updatedUser = await adminService.approveRunner(userId);
            res.status(200).json(updatedUser);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

// Update run verification status
router.patch(
    '/runs/:id/verify',
    // type req.body as VerifyRunStatus so no cast is needed
    async (
        req: Request<{ id: string }, Run, VerifyRunStatus>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const runId = parseInt(req.params.id, 10);
            const { status } = req.body;

            if (isNaN(runId)) {
                throw new HttpError('Invalid run ID', 400);
            }

            if (!['verified', 'flagged'].includes(status)) {
                throw new HttpError('Invalid status', 400);
            }

            const updatedRun = await adminService.updateRunVerification(
                runId,
                status
            );
            res.status(200).json(updatedRun);
        } catch (err: unknown) {
            if (err instanceof DatabaseError) {
                next(new HttpError(err.message, 500));
            } else if (err instanceof NotFoundError) {
                next(new HttpError(err.message, 404));
            } else {
                const error =
                    err instanceof Error
                        ? err
                        : new HttpError(String(err), 500);
                next(error);
            }
        }
    }
);

export { router as adminRouter };
