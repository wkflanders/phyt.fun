import { RunnerVO } from '@phyt/models';

import type { RunnersDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    RunnerInsert,
    RunnerQueryParams,
    PaginatedRunners
} from '@phyt/types';

export type RunnersRepository = ReturnType<typeof makeRunnersRepository>;

export const makeRunnersRepository = ({
    drizzleOps
}: {
    drizzleOps: RunnersDrizzleOps;
}) => {
    const save = async ({
        input
    }: {
        input: RunnerInsert;
    }): Promise<RunnerVO> => {
        const record = await drizzleOps.create({ input });
        return RunnerVO.from({ runner: record });
    };

    const findById = async ({
        runnerId
    }: {
        runnerId: UUIDv7;
    }): Promise<RunnerVO> => {
        const record = await drizzleOps.findById({ runnerId });
        return RunnerVO.from({ runner: record });
    };

    const findByUserId = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<RunnerVO> => {
        const record = await drizzleOps.findByUserId({ userId });
        return RunnerVO.from({ runner: record });
    };

    const findByPrivyId = async ({
        privyId
    }: {
        privyId: string;
    }): Promise<RunnerVO> => {
        const record = await drizzleOps.findByPrivyId({ privyId });
        return RunnerVO.from({ runner: record });
    };

    const findAll = async ({
        params
    }: {
        params: RunnerQueryParams;
    }): Promise<PaginatedRunners<RunnerVO>> => {
        const paginatedRunners = await drizzleOps.list({ params });

        return {
            runners: paginatedRunners.runners.map((runner) =>
                RunnerVO.from({ runner })
            ),
            pagination: paginatedRunners.pagination
        };
    };

    const findRandom = async (): Promise<RunnerVO> => {
        const record = await drizzleOps.findRandomRunner();
        return RunnerVO.from({ runner: record });
    };

    const remove = async ({
        runnerId
    }: {
        runnerId: UUIDv7;
    }): Promise<RunnerVO> => {
        const record = await drizzleOps.remove({ runnerId });
        return RunnerVO.from({ runner: record });
    };

    // Performance optimization: direct update without domain validation
    // const update = async (
    //     runnerId: UUIDv7,
    //     update: RunnerUpdate
    // ): Promise<RunnerVO> => {
    //     const data = await ops.update(runnerId, update);
    //     return RunnerVO.from(data);
    // };

    return {
        save,
        findById,
        findByUserId,
        findByPrivyId,
        findAll,
        findRandom,
        remove

        // Performance methods (skip domain validation)
        // update
    };
};
