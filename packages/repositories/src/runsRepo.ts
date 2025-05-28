import { RunsVO } from '@phyt/models';

import type { RunsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    RunInsert,
    RunQueryParams,
    PaginatedRuns
} from '@phyt/types';

export type RunsRepository = ReturnType<typeof makeRunsRepository>;

export const makeRunsRepository = ({
    drizzleOps
}: {
    drizzleOps: RunsDrizzleOps;
}) => {
    const save = async ({ input }: { input: RunInsert }): Promise<RunsVO> => {
        const record = await drizzleOps.create({ input });
        return RunsVO.from({ run: record });
    };

    const saveBatch = async ({
        input,
        params
    }: {
        input: RunInsert[];
        params?: RunQueryParams;
    }): Promise<PaginatedRuns<RunsVO>> => {
        const paginatedRecords = await drizzleOps.createBatch({
            input,
            params
        });
        return {
            runs: paginatedRecords.runs.map((run) => RunsVO.from({ run })),
            pagination: paginatedRecords.pagination
        };
    };

    const findById = async ({ runId }: { runId: UUIDv7 }): Promise<RunsVO> => {
        const record = await drizzleOps.findById({ id: runId });
        return RunsVO.from({ run: record });
    };

    const findByRunnerId = async ({
        runnerId,
        params
    }: {
        runnerId: UUIDv7;
        params?: RunQueryParams;
    }): Promise<PaginatedRuns<RunsVO>> => {
        const paginatedRecords = await drizzleOps.findByRunnerId({
            runnerId,
            params
        });
        return {
            runs: paginatedRecords.runs.map((run) => RunsVO.from({ run })),
            pagination: paginatedRecords.pagination
        };
    };

    const findWithRunnerInfo = async ({
        runnerId,
        params
    }: {
        runnerId: UUIDv7;
        params?: RunQueryParams;
    }): Promise<PaginatedRuns<RunsVO>> => {
        const paginatedRecords = await drizzleOps.listRunsWithRunnerInfo({
            runnerId,
            params
        });

        return {
            runs: paginatedRecords.runs.map((run) => RunsVO.from({ run })),
            pagination: paginatedRecords.pagination
        };
    };

    const findPending = async (): Promise<PaginatedRuns<RunsVO>> => {
        const paginatedRecords = await drizzleOps.listPendingRuns();
        return {
            runs: paginatedRecords.runs.map((run) => RunsVO.from({ run })),
            pagination: paginatedRecords.pagination
        };
    };

    const remove = async ({ runId }: { runId: UUIDv7 }): Promise<RunsVO> => {
        const record = await drizzleOps.remove({ runId });
        return RunsVO.from({ run: record });
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
