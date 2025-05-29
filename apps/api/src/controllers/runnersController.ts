import {
    RunnerIdSchema,
    RunnerQueryParamsSchema,
    UpdateRunnerSchema,
    PrivyIdSchema
} from '@phyt/dto';

import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

import { RequestHandler, Request, Response } from 'express';

import type {
    PrivyIdDTO,
    RunnerDTO,
    RunnerIdDTO,
    RunnerQueryParamsDTO,
    RunnersPageDTO,
    UpdateRunnerDTO
} from '@phyt/dto';
import type { RunnersService } from '@phyt/services';

export interface RunnersController {
    getAllRunners: RequestHandler[];
    getRunnerById: RequestHandler[];
    getRunnerByPrivyId: RequestHandler[];
    updateRunner: RequestHandler[];
    deleteRunner: RequestHandler[];
}

export const makeRunnersController = ({
    runnerServices
}: {
    runnerServices: RunnersService;
}): RunnersController => {
    const getAllRunners = [
        validateAuth,
        validateSchema({ querySchema: RunnerQueryParamsSchema }),
        async (
            req: Request<
                Record<string, never>,
                RunnersPageDTO,
                Record<string, never>,
                RunnerQueryParamsDTO
            >,
            res: Response<RunnersPageDTO>
        ) => {
            const runners = await runnerServices.getAllRunners({
                params: req.query
            });
            res.status(200).json(runners);
        }
    ] as RequestHandler[];

    const getRunnerById = [
        validateAuth,
        validateSchema({ paramsSchema: RunnerIdSchema }),
        async (
            req: Request<RunnerIdDTO, RunnerDTO, Record<string, never>>,
            res: Response<RunnerDTO>
        ) => {
            const runner = await runnerServices.getRunnerById({
                runnerId: req.params
            });
            res.status(200).json(runner);
        }
    ] as RequestHandler[];

    const getRunnerByPrivyId = [
        validateAuth,
        validateSchema({ paramsSchema: PrivyIdSchema }),
        async (
            req: Request<PrivyIdDTO, RunnerDTO, Record<string, never>>,
            res: Response<RunnerDTO>
        ) => {
            const runner = await runnerServices.getRunnerByPrivyId({
                privyId: req.params
            });
            res.status(200).json(runner);
        }
    ] as RequestHandler[];

    const updateRunner = [
        validateAuth,
        validateSchema({
            paramsSchema: RunnerIdSchema,
            bodySchema: UpdateRunnerSchema
        }),
        async (
            req: Request<RunnerIdDTO, RunnerDTO, UpdateRunnerDTO>,
            res: Response<RunnerDTO>
        ) => {
            const runner = await runnerServices.updateRunner({
                runnerId: req.params,
                update: req.body
            });
            res.status(200).json(runner);
        }
    ] as RequestHandler[];

    const deleteRunner = [
        validateAuth,
        validateSchema({ paramsSchema: RunnerIdSchema }),
        async (
            req: Request<RunnerIdDTO, RunnerDTO>,
            res: Response<RunnerDTO>
        ) => {
            const runner = await runnerServices.deleteRunner({
                runnerId: req.params
            });
            res.status(200).json(runner);
        }
    ] as RequestHandler[];

    return {
        getAllRunners,
        getRunnerById,
        getRunnerByPrivyId,
        updateRunner,
        deleteRunner
    };
};
