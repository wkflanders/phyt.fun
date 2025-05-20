import { eq, and, desc, asc, sql, SQL } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

import { NotFoundError, DatabaseError } from '@phyt/models';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { runs, runners, users } from '../schema.js';

import type {
    UUIDv7,
    RunQueryParams,
    PaginatedRuns,
    Run,
    Pagination
} from '@phyt/types';

const toData = (runRow: typeof runs.$inferSelect): Run => ({
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

export type RunsDrizzleOps = ReturnType<typeof makeRunsDrizzleOps>;

export const makeRunsDrizzleOps = (db: DrizzleDB) => {
    const getRunById = async (id: UUIDv7) => {
        const result = await db.query.runs.findFirst({
            where: eq(runs.id, id)
        });

        if (!result) {
            throw new Error(`Run with id ${id} not found`);
        }

        return toData(result);
    };

    const getRunsByRunnerId = async (
        runnerId: UUIDv7,
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns> => {
        const {
            page = 1,
            limit = 20,
            sortBy = 'startTime',
            sortOrder = 'desc'
        } = params;
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(runs)
            .where(eq(runs.runnerId, runnerId));

        const totalCount = countResult[0].count;
        const totalPages = Math.ceil(totalCount / limit);

        // Get runs with pagination
        let orderBy;
        if (sortBy === 'startTime') {
            orderBy =
                sortOrder === 'asc'
                    ? asc(runs.startTime)
                    : desc(runs.startTime);
        } else if (sortBy === 'distance') {
            orderBy =
                sortOrder === 'asc' ? asc(runs.distance) : desc(runs.distance);
        } else {
            // This handles 'durationSeconds' or any other fallback
            orderBy =
                sortOrder === 'asc'
                    ? asc(runs.durationSeconds)
                    : desc(runs.durationSeconds);
        }

        const runsResult = await db.query.runs.findMany({
            where: eq(runs.runnerId, runnerId),
            orderBy: [orderBy],
            limit: limit,
            offset: offset
        });

        return {
            runs: runsResult.map(toData),
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        };
    };

    const getRunsWithRunnerInfo = async (
        params: RunQueryParams = { page: 1, limit: 20 }
    ): Promise<PaginatedRuns> => {
        const {
            page = 1,
            limit = 20,
            sortBy = 'startTime',
            sortOrder = 'desc'
        } = params;
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(runs);

        const totalCount = countResult[0].count;
        const totalPages = Math.ceil(totalCount / limit);

        // Get runs with runner info
        let orderBy;
        if (sortBy === 'startTime') {
            orderBy =
                sortOrder === 'asc'
                    ? asc(runs.startTime)
                    : desc(runs.startTime);
        } else if (sortBy === 'distance') {
            orderBy =
                sortOrder === 'asc' ? asc(runs.distance) : desc(runs.distance);
        } else {
            // This handles 'durationSeconds' or any other fallback
            orderBy =
                sortOrder === 'asc'
                    ? asc(runs.durationSeconds)
                    : desc(runs.durationSeconds);
        }

        const runsWithRunnerInfo = await db
            .select({
                id: runs.id,
                runnerId: runs.runnerId,
                startTime: runs.startTime,
                endTime: runs.endTime,
                durationSeconds: runs.durationSeconds,
                distance: runs.distance,
                averagePaceSec: runs.averagePaceSec,
                caloriesBurned: runs.caloriesBurned,
                stepCount: runs.stepCount,
                elevationGain: runs.elevationGain,
                averageHeartRate: runs.averageHeartRate,
                maxHeartRate: runs.maxHeartRate,
                deviceId: runs.deviceId,
                gpsRouteData: runs.gpsRouteData,
                isPosted: runs.isPosted,
                verificationStatus: runs.verificationStatus,
                rawDataJson: runs.rawDataJson,
                createdAt: runs.createdAt,
                updatedAt: runs.updatedAt,
                runnerUsername: users.username,
                runnerAvatarUrl: users.avatarUrl
            })
            .from(runs)
            .innerJoin(runners, eq(runs.runnerId, runners.id))
            .innerJoin(users, eq(runners.userId, users.id))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        // Transform to correct return type
        const transformedRuns = runsWithRunnerInfo.map((run) => ({
            ...toData({
                ...run,
                rawDataJson: run.rawDataJson as any
            }),
            runnerUsername: run.runnerUsername,
            runnerAvatarUrl: run.runnerAvatarUrl
        }));

        return {
            runs: transformedRuns,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        };
    };

    const getPendingRuns = async () => {
        const pendingRuns = await db.query.runs.findMany({
            where: eq(runs.verificationStatus, 'pending')
        });

        return pendingRuns.map(toData);
    };

    const createRun = async (data: {
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
    }) => {
        const id = uuidv7();
        const [result] = await db
            .insert(runs)
            .values({
                id,
                runnerId: data.runnerId,
                startTime: data.startTime,
                endTime: data.endTime,
                durationSeconds: data.durationSeconds,
                distance: data.distance,
                averagePaceSec: data.averagePaceSec ?? null,
                caloriesBurned: data.caloriesBurned ?? null,
                stepCount: data.stepCount ?? null,
                elevationGain: data.elevationGain ?? null,
                averageHeartRate: data.averageHeartRate ?? null,
                maxHeartRate: data.maxHeartRate ?? null,
                deviceId: data.deviceId ?? null,
                gpsRouteData: data.gpsRouteData ?? null,
                isPosted: false,
                verificationStatus: 'pending',
                rawDataJson: data.rawDataJson ?? null
            })
            .returning();

        return toData(result);
    };

    const createRunsBatch = async (
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
    ) => {
        // Insert one by one to avoid type issues
        const results = [];
        for (const data of runsData) {
            const result = await createRun(data);
            results.push(result);
        }
        return results;
    };

    const updateRunVerificationStatus = async (
        runId: UUIDv7,
        status: 'pending' | 'verified' | 'flagged'
    ) => {
        const [result] = await db
            .update(runs)
            .set({
                verificationStatus: status,
                updatedAt: new Date()
            })
            .where(eq(runs.id, runId))
            .returning();

        if (!result) {
            throw new Error(`Run with id ${runId} not found`);
        }

        return toData(result);
    };

    const markRunAsPosted = async (runId: UUIDv7) => {
        const [result] = await db
            .update(runs)
            .set({
                isPosted: true,
                updatedAt: new Date()
            })
            .where(eq(runs.id, runId))
            .returning();

        if (!result) {
            throw new Error(`Run with id ${runId} not found`);
        }

        return toData(result);
    };

    const deleteRun = async (runId: UUIDv7) => {
        const [result] = await db
            .delete(runs)
            .where(eq(runs.id, runId))
            .returning();

        if (!result) {
            throw new Error(`Run with id ${runId} not found`);
        }

        return toData(result);
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
