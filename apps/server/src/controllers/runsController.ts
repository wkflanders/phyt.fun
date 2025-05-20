import {
    RunSchema,
    RunIdSchema,
    RunnerIdSchema,
    RunQueryParamsSchema,
    UpdateRunVerificationSchema,
    CreateRunSchema
} from '@phyt/dto';

import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';

import type {
    RunDTO,
    RunIdDTO,
    RunnerIdDTO,
    RunQueryParamsDTO,
    RunsPageDTO,
    UpdateRunVerificationDTO,
    CreateRunDTO,
    RunsWithRunnerPageDTO
} from '@phyt/dto';
import type { RunsService } from '@phyt/services';
import type { Request, RequestHandler, Response } from 'express';

export interface RunsController {
    getRunById: RequestHandler[];
    getRunsByRunnerId: RequestHandler[];
    getRunsWithRunnerInfo: RequestHandler[];
    getPendingRuns: RequestHandler[];
    createRun: RequestHandler[];
    updateRunVerificationStatus: RequestHandler[];
    markRunAsPosted: RequestHandler[];
    deleteRun: RequestHandler[];
}

export const makeRunsController = (service: RunsService): RunsController => {
    const getRunById = [
        validateAuth,
        validateSchema(RunIdSchema),
        async (req: Request<RunIdDTO, RunDTO>, res: Response<RunDTO>) => {
            const run = await service.getRunById(req.params.runId);
            return res.status(200).json(run);
        }
    ] as RequestHandler[];

    const getRunsByRunnerId = [
        validateAuth,
        validateSchema(RunnerIdSchema, undefined, RunQueryParamsSchema),
        async (
            req: Request<RunnerIdDTO, RunsPageDTO, unknown, RunQueryParamsDTO>,
            res: Response<RunsPageDTO>
        ) => {
            const { page, limit, sortBy, sortOrder } = req.query;
            const runs = await service.getRunsByRunnerId(req.params.runnerId, {
                page,
                limit,
                sortBy,
                sortOrder
            });
            return res.status(200).json(runs);
        }
    ] as RequestHandler[];

    const getRunsWithRunnerInfo = [
        validateAuth,
        validateSchema(undefined, undefined, RunQueryParamsSchema),
        async (
            req: Request<
                unknown,
                RunsWithRunnerPageDTO,
                unknown,
                RunQueryParamsDTO
            >,
            res: Response<RunsWithRunnerPageDTO>
        ) => {
            const { page, limit, sortBy, sortOrder } = req.query;
            const runs = await service.getRunsWithRunnerInfo({
                page,
                limit,
                sortBy,
                sortOrder
            });
            return res.status(200).json(runs);
        }
    ] as RequestHandler[];

    const getPendingRuns = [
        validateAuth,
        async (req: Request, res: Response<RunDTO[]>) => {
            const runs = await service.getPendingRuns();
            return res.status(200).json(runs);
        }
    ] as RequestHandler[];

    const createRun = [
        validateAuth,
        validateSchema(undefined, CreateRunSchema),
        async (
            req: Request<unknown, RunDTO, CreateRunDTO>,
            res: Response<RunDTO>
        ) => {
            const run = await service.createRun(req.body);
            return res.status(201).json(run);
        }
    ] as RequestHandler[];

    const updateRunVerificationStatus = [
        validateAuth,
        validateSchema(RunIdSchema, UpdateRunVerificationSchema),
        async (
            req: Request<RunIdDTO, RunDTO, UpdateRunVerificationDTO>,
            res: Response<RunDTO>
        ) => {
            const run = await service.updateRunVerificationStatus(
                req.params.runId,
                req.body.verificationStatus
            );
            return res.status(200).json(run);
        }
    ] as RequestHandler[];

    const markRunAsPosted = [
        validateAuth,
        validateSchema(RunIdSchema),
        async (req: Request<RunIdDTO, RunDTO>, res: Response<RunDTO>) => {
            const run = await service.markRunAsPosted(req.params.runId);
            return res.status(200).json(run);
        }
    ] as RequestHandler[];

    const deleteRun = [
        validateAuth,
        validateSchema(RunIdSchema),
        async (req: Request<RunIdDTO, RunDTO>, res: Response<RunDTO>) => {
            const run = await service.deleteRun(req.params.runId);
            return res.status(200).json(run);
        }
    ] as RequestHandler[];

    return {
        getRunById,
        getRunsByRunnerId,
        getRunsWithRunnerInfo,
        getPendingRuns,
        createRun,
        updateRunVerificationStatus,
        markRunAsPosted,
        deleteRun
    };
};
