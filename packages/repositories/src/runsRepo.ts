import { RunVO } from '@phyt/models';

import type { RunsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    Run,
    ISODate,
    RunQueryParams,
    PaginatedRuns,
    RunRecord,
    RunInsert,
    RunWithRunner
} from '@phyt/types';

export type RunsRepository = ReturnType<typeof makeRunsRepository>;

// Define a type for the data returned from the database with runner info
interface DbRunWithRunner extends Record<string, unknown> {
    id: UUIDv7 | string;
    runnerId: UUIDv7 | string;
    startTime: Date | string;
    endTime: Date | string;
    durationSeconds: number;
    distance: number;
    averagePaceSec: number | null;
    caloriesBurned: number | null;
    stepCount: number | null;
    elevationGain: number | null;
    averageHeartRate: number | null;
    maxHeartRate: number | null;
    deviceId: string | null;
    gpsRouteData: string | null;
    isPosted: boolean | null;
    verificationStatus: 'pending' | 'verified' | 'flagged';
    rawDataJson: Record<string, unknown> | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    runnerUsername: string;
    runnerAvatarUrl: string | null;
}

export const makeRunsRepository = (ops: RunsDrizzleOps) => {
    function isDate(val: unknown): val is Date {
        return val instanceof Date;
    }

    function mapRecord(
        data: Partial<Run> | RunRecord | Record<string, unknown>
    ): RunVO {
        // Ensure all date fields are properly formatted as ISODate strings
        const record: RunRecord = {
            id: data.id as UUIDv7,
            runnerId: data.runnerId as UUIDv7,
            startTime: (isDate(data.startTime)
                ? data.startTime.toISOString()
                : (data.startTime as string | ISODate)) as ISODate,
            endTime: (isDate(data.endTime)
                ? data.endTime.toISOString()
                : (data.endTime as string | ISODate)) as ISODate,
            durationSeconds: Number(data.durationSeconds),
            distance: Number(data.distance),
            averagePaceSec: data.averagePaceSec as number | null,
            caloriesBurned: data.caloriesBurned as number | null,
            stepCount: data.stepCount as number | null,
            elevationGain: data.elevationGain as number | null,
            averageHeartRate: data.averageHeartRate as number | null,
            maxHeartRate: data.maxHeartRate as number | null,
            deviceId: data.deviceId as string | null,
            gpsRouteData: data.gpsRouteData as string | null,
            isPosted: data.isPosted as boolean | null,
            verificationStatus: data.verificationStatus as
                | 'pending'
                | 'verified'
                | 'flagged',
            rawDataJson: data.rawDataJson as Record<string, unknown> | null,
            createdAt: (isDate(data.createdAt)
                ? data.createdAt.toISOString()
                : (data.createdAt as string | ISODate)) as ISODate,
            updatedAt: (isDate(data.updatedAt)
                ? data.updatedAt.toISOString()
                : (data.updatedAt as string | ISODate)) as ISODate
        };

        return RunVO.fromRecord(record);
    }

    const getRunById = async (id: UUIDv7): Promise<RunVO> => {
        const run = await ops.getRunById(id);
        return mapRecord(run);
    };

    const getRunsByRunnerId = async (
        runnerId: UUIDv7,
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns<RunVO>> => {
        const result = await ops.getRunsByRunnerId(runnerId, params);
        return {
            runs: result.runs.map((run) => mapRecord(run)),
            pagination: result.pagination
        };
    };

    const getRunsWithRunnerInfo = async (
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns<RunVO>> => {
        const result = await ops.getRunsWithRunnerInfo(params);
        return {
            runs: result.runs.map((run) => {
                // Cast to our defined interface for runs with runner info
                const runWithRunner = run as unknown as DbRunWithRunner;

                return RunVO.fromWithRunner({
                    id: runWithRunner.id as UUIDv7,
                    runnerId: runWithRunner.runnerId as UUIDv7,
                    startTime: runWithRunner.startTime,
                    endTime: runWithRunner.endTime,
                    durationSeconds: runWithRunner.durationSeconds,
                    distance: runWithRunner.distance,
                    averagePaceSec: runWithRunner.averagePaceSec,
                    caloriesBurned: runWithRunner.caloriesBurned,
                    stepCount: runWithRunner.stepCount,
                    elevationGain: runWithRunner.elevationGain,
                    averageHeartRate: runWithRunner.averageHeartRate,
                    maxHeartRate: runWithRunner.maxHeartRate,
                    deviceId: runWithRunner.deviceId,
                    gpsRouteData: runWithRunner.gpsRouteData,
                    isPosted: runWithRunner.isPosted,
                    verificationStatus: runWithRunner.verificationStatus,
                    rawDataJson: runWithRunner.rawDataJson,
                    createdAt: runWithRunner.createdAt,
                    updatedAt: runWithRunner.updatedAt,
                    runnerUsername: runWithRunner.runnerUsername,
                    runnerAvatarUrl: runWithRunner.runnerAvatarUrl
                } as RunWithRunner);
            }),
            pagination: result.pagination
        };
    };

    const getPendingRuns = async (): Promise<RunVO[]> => {
        const runs = await ops.getPendingRuns();
        return runs.map((run) => mapRecord(run));
    };

    const createRun = async (data: RunInsert): Promise<RunVO> => {
        const run = await ops.createRun(data);
        return mapRecord(run);
    };

    const createRunsBatch = async (runsData: RunInsert[]): Promise<RunVO[]> => {
        const runs = await ops.createRunsBatch(runsData);
        return runs.map((run) => mapRecord(run));
    };

    const updateRunVerificationStatus = async (
        runId: UUIDv7,
        status: 'pending' | 'verified' | 'flagged'
    ): Promise<RunVO> => {
        const run = await ops.updateRunVerificationStatus(runId, status);
        return mapRecord(run);
    };

    const markRunAsPosted = async (runId: UUIDv7): Promise<RunVO> => {
        const run = await ops.markRunAsPosted(runId);
        return mapRecord(run);
    };

    const deleteRun = async (runId: UUIDv7): Promise<RunVO> => {
        const run = await ops.deleteRun(runId);
        return mapRecord(run);
    };

    return {
        getRunById,
        getRunsByRunnerId,
        getRunsWithRunnerInfo,
        getPendingRuns,
        createRun,
        createRunsBatch,
        updateRunVerificationStatus,
        markRunAsPosted,
        deleteRun
    };
};
