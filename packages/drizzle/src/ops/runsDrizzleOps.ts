import {
    eq,
    and,
    desc,
    count,
    isNull,
    inArray,
    InferSelectModel
} from 'drizzle-orm';
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
    Runner,
    WalletAddress,
    AvatarUrl
} from '@phyt/types';

const toRun = ({
    runRow,
    username,
    avatarUrl,
    runner
}: {
    runRow: InferSelectModel<typeof runs>;
    username?: string;
    avatarUrl?: AvatarUrl;
    runner?: Runner;
}): Run => ({
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
    updatedAt: runRow.updatedAt,
    deletedAt: runRow.deletedAt,
    ...(username !== undefined ? { username } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    ...(runner !== undefined ? { runner } : {})
});

const toRunner = ({
    runnerRow,
    username,
    avatarUrl
}: {
    runnerRow: InferSelectModel<typeof runners>;
    username?: string;
    avatarUrl?: AvatarUrl;
}): Runner => ({
    id: runnerRow.id as UUIDv7,
    userId: runnerRow.userId as UUIDv7,
    totalDistance: runnerRow.totalDistance,
    averagePace: runnerRow.averagePace,
    totalRuns: runnerRow.totalRuns,
    bestMileTime: runnerRow.bestMileTime,
    status: runnerRow.status,
    isPooled: runnerRow.isPooled,
    runnerWallet: runnerRow.runnerWallet as WalletAddress,
    createdAt: runnerRow.createdAt,
    updatedAt: runnerRow.updatedAt,
    deletedAt: runnerRow.deletedAt,
    ...(username !== undefined ? { username } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {})
});

export type RunsDrizzleOps = ReturnType<typeof makeRunsDrizzleOps>;

export const makeRunsDrizzleOps = ({ db }: { db: DrizzleDB }) => {
    const create = async ({ input }: { input: RunInsert }): Promise<Run> => {
        const [row] = await db
            .insert(runs)
            .values({
                ...input,
                id: uuidv7()
            })
            .returning();

        return toRun({ runRow: row });
    };

    const createBatch = async ({
        input,
        params
    }: {
        input: RunInsert[];
        params?: RunQueryParams;
    }): Promise<PaginatedRuns> => {
        // Create all runs first
        const createdIds: UUIDv7[] = [];
        const batchSize = 50;

        for (let i = 0; i < input.length; i += batchSize) {
            const batch = input.slice(i, i + batchSize);
            const batchWithIds = batch.map((input) => ({
                ...input,
                id: uuidv7()
            }));

            const insertedRows = await db
                .insert(runs)
                .values(batchWithIds)
                .returning();

            const batchIds = insertedRows.map((row) => row.id as UUIDv7);
            createdIds.push(...batchIds);
        }

        return paginate(
            and(inArray(runs.id, createdIds), isNull(runs.deletedAt)),
            params
        );
    };

    const findById = async ({ id }: { id: UUIDv7 }): Promise<Run> => {
        const [row] = await db
            .select()
            .from(runs)
            .where(and(eq(runs.id, id), isNull(runs.deletedAt)))
            .limit(1);

        return toRun({ runRow: row });
    };

    const findByRunnerId = async ({
        runnerId,
        params
    }: {
        runnerId: UUIDv7;
        params?: RunQueryParams;
    }): Promise<PaginatedRuns> => {
        return paginate(
            and(eq(runs.runnerId, runnerId), isNull(runs.deletedAt)),
            params
        );
    };

    const listRunsWithRunnerInfo = async ({
        runnerId,
        params
    }: {
        runnerId: UUIDv7;
        params?: RunQueryParams;
    }): Promise<PaginatedRuns> => {
        return paginate(
            and(eq(runs.runnerId, runnerId), isNull(runs.deletedAt)),
            params
        );
    };

    const listPendingRuns = async (): Promise<PaginatedRuns> => {
        return paginate(
            and(eq(runs.verificationStatus, 'pending'), isNull(runs.deletedAt)),
            { page: 1, limit: 20 }
        );
    };

    const update = async ({
        runId,
        update
    }: {
        runId: UUIDv7;
        update: RunUpdate;
    }): Promise<Run> => {
        const [result] = await db
            .update(runs)
            .set({
                ...update,
                updatedAt: new Date()
            })
            .where(eq(runs.id, runId))
            .returning();

        return toRun({ runRow: result });
    };

    const remove = async ({ runId }: { runId: UUIDv7 }): Promise<Run> => {
        const [result] = await db
            .update(runs)
            .set({ deletedAt: new Date() })
            .where(eq(runs.id, runId))
            .returning();

        return toRun({ runRow: result });
    };

    const unsafeRemove = async ({ runId }: { runId: UUIDv7 }): Promise<Run> => {
        const [result] = await db
            .delete(runs)
            .where(eq(runs.id, runId))
            .returning();

        return toRun({ runRow: result });
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params?: RunQueryParams
    ): Promise<PaginatedRuns> => {
        // If no params, return all without pagination
        if (!params) {
            const rows = await db
                .select({ run: runs, runner: runners, user: users })
                .from(runs)
                .innerJoin(runners, eq(runs.runnerId, runners.id))
                .innerJoin(users, eq(runners.userId, users.id))
                .where(cond)
                .orderBy(desc(runs.createdAt), desc(runs.id));

            return {
                runs: rows.map(({ run, runner, user }) =>
                    toRun({
                        runRow: run,
                        runner: toRunner({ runnerRow: runner }),
                        username: user.username,
                        avatarUrl: user.avatarUrl
                    })
                ),
                pagination: {
                    page: 1,
                    limit: rows.length,
                    total: rows.length,
                    totalPages: 1
                }
            };
        }

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
            .innerJoin(runners, eq(runs.runnerId, runners.id))
            .innerJoin(users, eq(runners.userId, users.id))
            .where(cond)
            .orderBy(desc(runs.createdAt), desc(runs.id))
            .limit(limit)
            .offset(offset);

        return {
            runs: rows.map(({ run, runner, user }) =>
                toRun({
                    runRow: run,
                    runner: toRunner({ runnerRow: runner }),
                    username: user.username,
                    avatarUrl: user.avatarUrl
                })
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
        remove,
        unsafeRemove
    };
};
