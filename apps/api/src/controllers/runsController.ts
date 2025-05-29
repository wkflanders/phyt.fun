import {
    RunIdSchema,
    RunnerIdSchema,
    RunQueryParamsSchema,
    CreateRunSchema,
    UpdateRunSchema
} from '@phyt/dto';

import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

import type {
    RunDTO,
    RunIdDTO,
    RunnerIdDTO,
    RunQueryParamsDTO,
    RunsPageDTO,
    CreateRunDTO,
    RunsWithRunnerPageDTO,
    UpdateRunDTO
} from '@phyt/dto';
import type { RunsService } from '@phyt/services';
import type { Request, RequestHandler, Response } from 'express';

export interface RunsController {
    getRunById: RequestHandler[];
    getRunsByRunnerId: RequestHandler[];
    getRunsWithRunnerInfo: RequestHandler[];
    getPendingRuns: RequestHandler[];
    createRun: RequestHandler[];
    updateRun: RequestHandler[];
    deleteRun: RequestHandler[];
}

export const makeRunsController = ({
    runServices
}: {
    runServices: RunsService;
}): RunsController => {
    const getRunById = [
        validateAuth,
        validateSchema({ paramsSchema: RunIdSchema }),
        async (req: Request<RunIdDTO, RunDTO>, res: Response<RunDTO>) => {
            const run = await runServices.getRunById({
                runId: req.params
            });
            return res.status(200).json(run);
        }
    ] as RequestHandler[];

    const getRunsByRunnerId = [
        validateAuth,
        validateSchema({
            paramsSchema: RunnerIdSchema,
            querySchema: RunQueryParamsSchema
        }),
        async (
            req: Request<RunnerIdDTO, RunsPageDTO, unknown, RunQueryParamsDTO>,
            res: Response<RunsPageDTO>
        ) => {
            const runs = await runServices.getRunsByRunnerId({
                runnerId: req.params,
                params: req.query
            });
            return res.status(200).json(runs);
        }
    ] as RequestHandler[];

    const getRunsWithRunnerInfo = [
        validateAuth,
        validateSchema({ querySchema: RunQueryParamsSchema }),
        async (
            req: Request<
                RunnerIdDTO,
                RunsWithRunnerPageDTO,
                unknown,
                RunQueryParamsDTO
            >,
            res: Response<RunsWithRunnerPageDTO>
        ) => {
            const runs = await runServices.getRunsWithRunnerInfo({
                runnerId: req.params,
                params: req.query
            });
            return res.status(200).json(runs);
        }
    ] as RequestHandler[];

    const getPendingRuns = [
        validateAuth,
        async (req: Request, res: Response<RunsPageDTO>) => {
            const runs = await runServices.getPendingRuns();
            return res.status(200).json(runs);
        }
    ] as RequestHandler[];

    const createRun = [
        validateAuth,
        validateSchema({ bodySchema: CreateRunSchema }),
        async (
            req: Request<unknown, RunDTO, CreateRunDTO>,
            res: Response<RunDTO>
        ) => {
            const run = await runServices.createRun({
                input: req.body
            });
            return res.status(201).json(run);
        }
    ] as RequestHandler[];

    const updateRun = [
        validateAuth,
        validateSchema({
            paramsSchema: RunIdSchema,
            bodySchema: UpdateRunSchema
        }),
        async (
            req: Request<RunIdDTO, RunDTO, UpdateRunDTO>,
            res: Response<RunDTO>
        ) => {
            const run = await runServices.updateRun({
                runId: req.params,
                update: req.body
            });
            return res.status(200).json(run);
        }
    ] as RequestHandler[];

    const deleteRun = [
        validateAuth,
        validateSchema({ paramsSchema: RunIdSchema }),
        async (req: Request<RunIdDTO, RunDTO>, res: Response<RunDTO>) => {
            const run = await runServices.deleteRun({
                runId: req.params
            });
            return res.status(200).json(run);
        }
    ] as RequestHandler[];

    return {
        getRunById,
        getRunsByRunnerId,
        getRunsWithRunnerInfo,
        getPendingRuns,
        createRun,
        updateRun,
        deleteRun
    };
};
