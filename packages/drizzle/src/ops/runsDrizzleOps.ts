import { eq, and, desc, count, isNull } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { runs, runners, users } from '../schema.js';

import type {
    UUIDv7,
    Run,
    RunInsert,
    RunUpdate,
    RunQueryParams,
    PaginatedRuns,
    RunWithRunnerInfo,
    Runner
} from '@phyt/types';

const toRun = (runRow: typeof runs.$inferSelect): Run => ({
    id: runRow.id as UUIDv7,
    runnerId: runRow.runnerId as UUIDv7,
    startTime: runRow.startTime,
    endTime: runRow.endTime,
    durationSeconds: runRow.durationSeconds,
    distance: runRow.distance,
    averagePaceSec: runRow.averagePaceSec,
    caloriesBurned: runRow.caloriesBurned,
    stepCount: runRow.stepCount,
    elevationGain: runRow.elevationGain,
    averageHeartRate: runRow.averageHeartRate,
    maxHeartRate: runRow.maxHeartRate,
    deviceId: runRow.deviceId,
    gpsRouteData: runRow.gpsRouteData,
    isPosted: runRow.isPosted,
    verificationStatus: runRow.verificationStatus,
    rawDataJson: runRow.rawDataJson as Record<string, unknown> | null,
    createdAt: runRow.createdAt,
    updatedAt: runRow.updatedAt
});

const toRunner = (runnerRow: typeof runners.$inferSelect): Runner => ({
    id: runnerRow.id as UUIDv7,
    userId: runnerRow.userId as UUIDv7,
    totalDistance: runnerRow.totalDistance,
    averagePace: runnerRow.averagePace,
    totalRuns: runnerRow.totalRuns,
    bestMileTime: runnerRow.bestMileTime,
    status: runnerRow.status,
    isPooled: runnerRow.isPooled,
    runnerWallet: runnerRow.runnerWallet,
    createdAt: runnerRow.createdAt,
    updatedAt: runnerRow.updatedAt
});

const toRunWithRunnerInfo = (
    runRow: typeof runs.$inferSelect,
    runnerRow: typeof runners.$inferSelect,
    userRow: typeof users.$inferSelect
): RunWithRunnerInfo => {
    return {
        ...toRun(runRow),
        runner: toRunner(runnerRow),
        username: userRow.username,
        avatarUrl: userRow.avatarUrl
    };
};

export type RunsDrizzleOps = ReturnType<typeof makeRunsDrizzleOps>;

export const makeRunsDrizzleOps = (db: DrizzleDB) => {
    const create = async (data: RunInsert): Promise<Run> => {
        const [row] = await db
            .insert(runs)
            .values({
                ...data,
                id: uuidv7()
            })
            .returning();

        return toRun(row);
    };

    const createBatch = async (
        runsData: {
            runnerId: UUIDv7;
            startTime: Date;
            endTime: Date;
            durationSeconds: number;
            distance: number;
            averagePaceSec?: number | null;
            caloriesBurned?: number | null;
            stepCount?: number | null;
            elevationGain?: number | null;
            averageHeartRate?: number | null;
            maxHeartRate?: number | null;
            deviceId?: string | null;
            gpsRouteData?: string | null;
            rawDataJson?: Record<string, unknown> | null;
        }[]
    ): Promise<Run[]> => {
        // Insert one by one to avoid type issues
        const results = [];
        for (const data of runsData) {
            const result = await create(data);
            results.push(result);
        }
        return results;
    };

    const findById = async (id: UUIDv7): Promise<Run> => {
        const [row] = await db
            .select()
            .from(runs)
            .where(and(eq(runs.id, id), isNull(runs.deletedAt)))
            .limit(1);

        return toRun(row);
    };

    const findByRunnerId = async (
        runnerId: UUIDv7,
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns> => {
        return paginate(
            and(eq(runs.runnerId, runnerId), isNull(runs.deletedAt)),
            params
        );
    };

    const listRunsWithRunnerInfo = async (
        runnerId: UUIDv7,
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns> => {
        return paginate(
            and(eq(runs.runnerId, runnerId), isNull(runs.deletedAt)),
            params
        );
    };

    const listPendingRuns = async (): Promise<Run[]> => {
        const pendingRuns = await db.query.runs.findMany({
            where: and(
                eq(runs.verificationStatus, 'pending'),
                isNull(runs.deletedAt)
            )
        });

        return pendingRuns.map(toRun);
    };

    const update = async (runId: UUIDv7, data: RunUpdate): Promise<Run> => {
        const [result] = await db
            .update(runs)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(runs.id, runId))
            .returning();

        return toRun(result);
    };

    const remove = async (runId: UUIDv7): Promise<Run> => {
        const [result] = await db
            .delete(runs)
            .where(eq(runs.id, runId))
            .returning();

        return toRun(result);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: RunQueryParams
    ): Promise<PaginatedRuns> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        // Get total count
        const [{ total }] = await db
            .select({ total: count() })
            .from(runs)
            .where(cond);

        // Query rows
        const rows = await db
            .select({ run: runs, runner: runners, user: users })
            .from(runs)
            .leftJoin(runners, eq(runs.runnerId, runners.id))
            .leftJoin(users, eq(runners.userId, users.id))
            .where(cond)
            .orderBy(desc(runs.createdAt), desc(runs.id))
            .limit(limit)
            .offset(offset);

        return {
            runs: rows.map(({ run, runner, user }) =>
                runner && user
                    ? toRunWithRunnerInfo(run, runner, user)
                    : {
                          ...toRun(run),
                          runner: null,
                          username: '',
                          avatarUrl: ''
                      }
            ),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    return {
        create,
        findById,
        findByRunnerId,
        listRunsWithRunnerInfo,
        listPendingRuns,
        createBatch,
        update,
        remove
    };
};
