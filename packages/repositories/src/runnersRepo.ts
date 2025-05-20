import { RunnerVO, NotFoundError } from '@phyt/models';

import type { RunnersDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    Runner,
    RunnerProfile,
    RunnerQueryParams,
    ISODate
} from '@phyt/types';

export type RunnersRepository = ReturnType<typeof makeRunnersRepository>;

export const makeRunnersRepository = (ops: RunnersDrizzleOps) => {
    function isDate(val: unknown): val is Date {
        return val instanceof Date;
    }

    function mapRecord(data: Runner): RunnerVO {
        return RunnerVO.fromRecord({
            ...data,
            createdAt: (isDate(data.createdAt)
                ? data.createdAt.toISOString()
                : data.createdAt) as ISODate,
            updatedAt: (isDate(data.updatedAt)
                ? data.updatedAt.toISOString()
                : data.updatedAt) as ISODate
        });
    }

    const getAllRunners = async (
        params: RunnerQueryParams
    ): Promise<RunnerVO[]> => {
        const runners = await ops.getAllRunners(params);
        return runners.map((runner) => RunnerVO.fromProfile(runner));
    };

    const getRunnerById = async (id: UUIDv7): Promise<RunnerVO> => {
        const runner = await ops.getRunnerById(id);
        return RunnerVO.fromProfile(runner);
    };

    const getRunnerByPrivyId = async (privyId: string): Promise<RunnerVO> => {
        const runner = await ops.getRunnerByPrivyId(privyId);
        return RunnerVO.fromProfile(runner);
    };

    const getRunnerStatusByPrivyId = async (
        privyId: string
    ): Promise<RunnerVO> => {
        return await getRunnerByPrivyId(privyId);
    };

    const getRecentActivities = async (
        filter?: string
    ): Promise<RunnerVO[]> => {
        return await getAllRunners({
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
    };

    const getRunnerActivities = async (runnerId: UUIDv7): Promise<RunnerVO> => {
        return await getRunnerById(runnerId);
    };

    const createRunner = async (
        userId: UUIDv7,
        walletAddress: string
    ): Promise<RunnerVO> => {
        const runner = await ops.createRunner(userId, walletAddress);
        return mapRecord(runner);
    };

    const updateRunnerStats = async (
        runnerId: UUIDv7,
        stats: {
            totalDistance?: number;
            totalRuns?: number;
            averagePace?: number | null;
            bestMileTime?: number | null;
        }
    ): Promise<RunnerVO> => {
        const runner = await ops.updateRunnerStats(runnerId, stats);
        return mapRecord(runner);
    };

    const updateRunnerPoolStatus = async (
        runnerId: UUIDv7,
        isPooled: boolean
    ): Promise<RunnerVO> => {
        const runner = await ops.updateRunnerPoolStatus(runnerId, isPooled);
        return mapRecord(runner);
    };

    return {
        getAllRunners,
        getRunnerById,
        getRunnerByPrivyId,
        getRunnerStatusByPrivyId,
        getRecentActivities,
        getRunnerActivities,
        createRunner,
        updateRunnerStats,
        updateRunnerPoolStatus
    };
};
