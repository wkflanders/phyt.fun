import { RunVO } from '@phyt/models';

import type {
    RunDTO,
    RunWithRunnerDTO,
    RunsPageDTO,
    RunsWithRunnerPageDTO,
    CreateRunDTO,
    UpdateRunVerificationDTO
} from '@phyt/dto';
import type { RunsRepository } from '@phyt/repositories';
import type { UUIDv7, RunInsert, RunQueryParams } from '@phyt/types';

export type RunsService = ReturnType<typeof makeRunsServices>;

export const makeRunsServices = (repo: RunsRepository) => {
    /**
     * Domain operations: Return RunVO objects for internal use
     * These are not exposed outside the service
     */
    const _getRunById = async (runId: UUIDv7): Promise<RunVO> => {
        return await repo.getRunById(runId);
    };

    /**
     * Public API: Always return plain DTOs for external consumption
     */
    const getRunById = async (runId: UUIDv7): Promise<RunDTO> => {
        const run = await _getRunById(runId);
        return run.toDTO<RunDTO>();
    };

    const getRunsByRunnerId = async (
        runnerId: UUIDv7,
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<RunsPageDTO> => {
        const result = await repo.getRunsByRunnerId(runnerId, params);
        return {
            runs: result.runs.map((run) => run.toDTO<RunDTO>()),
            pagination: result.pagination
        };
    };

    const getRunsWithRunnerInfo = async (
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<RunsWithRunnerPageDTO> => {
        const result = await repo.getRunsWithRunnerInfo(params);
        return {
            runs: result.runs.map((run) => run.toDTO<RunWithRunnerDTO>()),
            pagination: result.pagination
        };
    };

    const getPendingRuns = async (): Promise<RunDTO[]> => {
        const runs = await repo.getPendingRuns();
        return runs.map((run) => run.toDTO<RunDTO>());
    };

    const createRun = async (data: CreateRunDTO): Promise<RunDTO> => {
        const runInsert: RunInsert = {
            ...data,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime)
        };
        const run = await repo.createRun(runInsert);
        return run.toDTO<RunDTO>();
    };

    const createRunsBatch = async (
        runsData: CreateRunDTO[]
    ): Promise<RunDTO[]> => {
        const runsInsert: RunInsert[] = runsData.map((data) => ({
            ...data,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime)
        }));
        const runs = await repo.createRunsBatch(runsInsert);
        return runs.map((run) => run.toDTO<RunDTO>());
    };

    const updateRunVerificationStatus = async (
        runId: UUIDv7,
        status: UpdateRunVerificationDTO['verificationStatus']
    ): Promise<RunDTO> => {
        const run = await repo.updateRunVerificationStatus(runId, status);
        return run.toDTO<RunDTO>();
    };

    const markRunAsPosted = async (runId: UUIDv7): Promise<RunDTO> => {
        const run = await repo.markRunAsPosted(runId);
        return run.toDTO<RunDTO>();
    };

    const deleteRun = async (runId: UUIDv7): Promise<RunDTO> => {
        const run = await repo.deleteRun(runId);
        return run.toDTO<RunDTO>();
    };

    // Helper function to help with applying run data by runner ID
    const createRunByPrivyId = async ({
        privyId,
        workout
    }: {
        privyId: string;
        workout: CreateRunDTO;
    }): Promise<RunDTO> => {
        // Implementation specific to business logic would go here
        // Placeholder implementation
        await Promise.resolve(); // Add await to satisfy linter
        throw new Error('Not implemented');
    };

    const createRunsBatchByPrivyId = async ({
        privyId,
        workouts
    }: {
        privyId: string;
        workouts: CreateRunDTO[];
    }): Promise<RunDTO[]> => {
        // Implementation specific to business logic would go here
        // Placeholder implementation
        await Promise.resolve(); // Add await to satisfy linter
        throw new Error('Not implemented');
    };

    return Object.freeze({
        getRunById,
        getRunsByRunnerId,
        getRunsWithRunnerInfo,
        getPendingRuns,
        createRun,
        createRunsBatch,
        updateRunVerificationStatus,
        markRunAsPosted,
        deleteRun,
        createRunByPrivyId,
        createRunsBatchByPrivyId
    });
};
