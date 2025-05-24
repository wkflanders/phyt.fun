import { RunVO } from '@phyt/models';

import type { RunsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    RunInsert,
    RunUpdate,
    RunQueryParams,
    PaginatedRuns,
    RunWithRunnerInfo
} from '@phyt/types';

export type RunsRepository = ReturnType<typeof makeRunsRepository>;

export const makeRunsRepository = (ops: RunsDrizzleOps) => {
    const save = async (input: RunInsert): Promise<RunVO> => {
        const data = await ops.create(input);
        return RunVO.from(data);
    };

    const findById = async (runId: UUIDv7): Promise<RunVO> => {
        const data = await ops.findById(runId);
        return RunVO.from(data);
    };

    const findByRunnerId = async (
        runnerId: UUIDv7,
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns<RunVO>> => {
        const paginatedData = await ops.findByRunnerId(runnerId, params);

        return {
            runs: paginatedData.runs.map((run) => {
                const runWithRunner = run as RunWithRunnerInfo;
                return RunVO.from(runWithRunner, {
                    runnerUsername: runWithRunner.username,
                    runnerAvatarUrl: runWithRunner.avatarUrl
                });
            }),
            pagination: paginatedData.pagination
        };
    };

    const findWithRunnerInfo = async (
        runnerId: UUIDv7,
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns<RunVO>> => {
        const paginatedData = await ops.listRunsWithRunnerInfo(
            runnerId,
            params
        );

        return {
            runs: paginatedData.runs.map((run) => {
                const runWithRunner = run as RunWithRunnerInfo;
                return RunVO.from(runWithRunner, {
                    runnerUsername: runWithRunner.username,
                    runnerAvatarUrl: runWithRunner.avatarUrl
                });
            }),
            pagination: paginatedData.pagination
        };
    };

    const findPending = async (): Promise<RunVO[]> => {
        const data = await ops.listPendingRuns();
        return data.map((run) => RunVO.from(run));
    };

    const saveBatch = async (input: RunInsert[]): Promise<RunVO[]> => {
        const data = await ops.createBatch(input);
        return data.map((run) => RunVO.from(run));
    };

    const remove = async (runId: UUIDv7): Promise<RunVO> => {
        const data = await ops.remove(runId);
        return RunVO.from(data);
    };

    // Performance optimization: direct update without domain validation
    // const update = async (
    //     runId: UUIDv7,
    //     update: RunUpdate
    // ): Promise<RunVO> => {
    //     const data = await ops.update(runId, update);
    //     return RunVO.from(data);
    // };

    return {
        save,
        findById,
        findByRunnerId,
        findWithRunnerInfo,
        findPending,
        saveBatch,
        remove

        // Performance methods (skip domain validation)
        // update
    };
};
