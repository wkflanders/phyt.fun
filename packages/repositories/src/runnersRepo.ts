import { RunnerVO } from '@phyt/models';

import type { RunnersDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    RunnerInsert,
    RunnerUpdate,
    RunnerQueryParams,
    PaginatedRunners
} from '@phyt/types';

export type RunnersRepository = ReturnType<typeof makeRunnersRepository>;

export const makeRunnersRepository = (ops: RunnersDrizzleOps) => {
    const save = async (input: RunnerInsert): Promise<RunnerVO> => {
        const data = await ops.create(input);
        return RunnerVO.from(data);
    };

    const findById = async (runnerId: UUIDv7): Promise<RunnerVO> => {
        const data = await ops.findById(runnerId);
        return RunnerVO.from(data, {
            username: data.username,
            avatarUrl: data.avatarUrl
        });
    };

    const findByUserId = async (userId: UUIDv7): Promise<RunnerVO> => {
        const data = await ops.findByUserId(userId);
        return RunnerVO.from(data);
    };

    const findByPrivyId = async (privyId: string): Promise<RunnerVO> => {
        const data = await ops.findByPrivyId(privyId);
        return RunnerVO.from(data, {
            username: data.username,
            avatarUrl: data.avatarUrl
        });
    };

    const findAll = async (
        params: RunnerQueryParams
    ): Promise<PaginatedRunners<RunnerVO>> => {
        const paginatedData = await ops.list(params);

        return {
            runners: paginatedData.runners.map((runner) =>
                RunnerVO.from(runner, {
                    username: runner.username,
                    avatarUrl: runner.avatarUrl
                })
            ),
            pagination: paginatedData.pagination
        };
    };

    const findRandom = async (): Promise<RunnerVO> => {
        const data = await ops.findRandomRunner();
        return RunnerVO.from(data);
    };

    const remove = async (runnerId: UUIDv7): Promise<RunnerVO> => {
        const data = await ops.remove(runnerId);
        return RunnerVO.from(data);
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
