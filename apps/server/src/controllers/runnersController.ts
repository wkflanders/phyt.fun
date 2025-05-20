import { RequestHandler, Request, Response } from 'express';

import { RunnerQueryParamsSchema } from '@phyt/dto';
import { NotFoundError, ValidationError } from '@phyt/models';

import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

import type { RunnersService } from '@phyt/services';
import type {
    UUIDv7,
    RunnerProfile,
    RunnerQueryParams,
    RunnerActivity,
    RunnerPoolStatus
} from '@phyt/types';

export interface RunnersController {
    getAllRunners: RequestHandler[];
    getRunnerById: RequestHandler[];
    getRunnerByPrivyId: RequestHandler[];
    getRunnerStatusByPrivyId: RequestHandler[];
    getRecentActivities: RequestHandler[];
    getRunnerActivities: RequestHandler[];
}

export const makeRunnersController = (
    svc: RunnersService
): RunnersController => {
    const getAllRunners = [
        validateAuth,
        validateSchema(undefined, undefined, RunnerQueryParamsSchema),
        async (
            req: Request<
                Record<string, never>,
                RunnerProfile[],
                Record<string, never>,
                RunnerQueryParams
            >,
            res: Response<RunnerProfile[]>
        ) => {
            const { search, sortBy, sortOrder } = req.query;
            const runners = await svc.getAllRunners({
                search,
                sortBy,
                sortOrder
            });
            res.status(200).json(runners);
        }
    ] as RequestHandler[];

    const getRunnerById = [
        validateAuth,
        async (
            req: Request<{ id: UUIDv7 }, RunnerProfile, Record<string, never>>,
            res: Response<RunnerProfile>
        ) => {
            const runnerId = req.params.id;
            if (!runnerId) {
                throw new ValidationError('Invalid runner id');
            }

            const runner = await svc.getRunnerById(runnerId);
            res.status(200).json(runner);
        }
    ] as RequestHandler[];

    const getRunnerByPrivyId = [
        validateAuth,
        async (
            req: Request<
                { privyId: string },
                RunnerProfile,
                Record<string, never>
            >,
            res: Response<RunnerProfile>
        ) => {
            const { privyId } = req.params;
            if (!privyId) {
                throw new ValidationError('Invalid privy id');
            }

            const runner = await svc.getRunnerByPrivyId(privyId);
            res.status(200).json(runner);
        }
    ] as RequestHandler[];

    const getRunnerStatusByPrivyId = [
        validateAuth,
        async (
            req: Request<
                { privyId: string },
                RunnerPoolStatus,
                Record<string, never>
            >,
            res: Response<RunnerPoolStatus>
        ) => {
            const { privyId } = req.params;
            if (!privyId) {
                throw new ValidationError('Invalid privy id');
            }

            const status = await svc.getRunnerStatusByPrivyId(privyId);
            res.status(200).json(status);
        }
    ] as RequestHandler[];

    const getRecentActivities = [
        validateAuth,
        async (
            req: Request<
                Record<string, never>,
                RunnerActivity[],
                Record<string, never>,
                { filter?: string }
            >,
            res: Response<RunnerActivity[]>
        ) => {
            const filter = req.query.filter;
            const activities = await svc.getRecentActivities(filter);
            res.status(200).json(activities);
        }
    ] as RequestHandler[];

    const getRunnerActivities = [
        validateAuth,
        async (
            req: Request<
                { id: UUIDv7 },
                RunnerActivity[],
                Record<string, never>
            >,
            res: Response<RunnerActivity[]>
        ) => {
            const runnerId = req.params.id;
            if (!runnerId) {
                throw new ValidationError('Invalid runner id');
            }

            const activities = await svc.getRunnerActivities(runnerId);
            res.status(200).json(activities);
        }
    ] as RequestHandler[];

    return {
        getAllRunners,
        getRunnerById,
        getRunnerByPrivyId,
        getRunnerStatusByPrivyId,
        getRecentActivities,
        getRunnerActivities
    };
};
