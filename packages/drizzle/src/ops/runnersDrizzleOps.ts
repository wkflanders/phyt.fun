import { eq, and, like, desc, asc, sql, SQL, or } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

import { NotFoundError, DatabaseError } from '@phyt/models';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { users, runners, runs } from '../schema.js';

import type {
    UUIDv7,
    Runner,
    RunnerProfile,
    RunnerQueryParams,
    RunnerActivity,
    RunnerPoolStatus,
    RunnerSortFields
} from '@phyt/types';

const toData = (runnerRow: typeof runners.$inferSelect): Runner => ({
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

const toRunnerProfile = (
    runner: typeof runners.$inferSelect,
    user: typeof users.$inferSelect
): RunnerProfile => ({
    ...toData(runner),
    username: user.username,
    avatarUrl: user.avatarUrl
});

export type RunnersDrizzleOps = ReturnType<typeof makeRunnersDrizzleOps>;

export const makeRunnersDrizzleOps = (db: DrizzleDB) => {
    const getAllRunners = async (
        params: RunnerQueryParams
    ): Promise<RunnerProfile[]> => {
        try {
            const conditions = [eq(runners.status, 'active')];
            if (params.search) {
                conditions.push(
                    like(users.username, `%${String(params.search)}%`)
                );
            }

            const sortBy = params.sortBy ?? 'totalDistance';
            const sortOrder = params.sortOrder ?? 'desc';

            const query = db
                .select({
                    runner: runners,
                    user: users
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .where(and(...conditions));

            let sortedQuery;
            if (sortOrder === 'desc') {
                switch (sortBy) {
                    case 'username':
                        sortedQuery = query.orderBy(desc(users.username));
                        break;
                    case 'totalDistance':
                        sortedQuery = query.orderBy(
                            desc(runners.totalDistance)
                        );
                        break;
                    case 'averagePace':
                        sortedQuery = query.orderBy(desc(runners.averagePace));
                        break;
                    case 'totalRuns':
                        sortedQuery = query.orderBy(desc(runners.totalRuns));
                        break;
                    case 'bestMileTime':
                        sortedQuery = query.orderBy(desc(runners.bestMileTime));
                        break;
                    case 'createdAt':
                        sortedQuery = query.orderBy(desc(runners.createdAt));
                        break;
                    default:
                        sortedQuery = query.orderBy(
                            desc(runners.totalDistance)
                        );
                }
            } else {
                switch (sortBy) {
                    case 'username':
                        sortedQuery = query.orderBy(asc(users.username));
                        break;
                    case 'totalDistance':
                        sortedQuery = query.orderBy(asc(runners.totalDistance));
                        break;
                    case 'averagePace':
                        sortedQuery = query.orderBy(asc(runners.averagePace));
                        break;
                    case 'totalRuns':
                        sortedQuery = query.orderBy(asc(runners.totalRuns));
                        break;
                    case 'bestMileTime':
                        sortedQuery = query.orderBy(asc(runners.bestMileTime));
                        break;
                    case 'createdAt':
                        sortedQuery = query.orderBy(asc(runners.createdAt));
                        break;
                    default:
                        sortedQuery = query.orderBy(asc(runners.totalDistance));
                }
            }

            const results = await sortedQuery;
            return results.map(({ runner, user }) =>
                toRunnerProfile(runner, user)
            );
        } catch (error) {
            console.error('Error with getAllRunners: ', error);
            throw new DatabaseError('Failed to get runners');
        }
    };

    const getRunnerById = async (runnerId: UUIDv7): Promise<RunnerProfile> => {
        try {
            const [result] = await db
                .select({
                    runner: runners,
                    user: users
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .where(eq(runners.id, runnerId))
                .limit(1);

            if (!result) {
                throw new NotFoundError('Runner not found');
            }

            return toRunnerProfile(result.runner, result.user);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error with getRunnerById: ', error);
            throw new DatabaseError('Failed to get runner');
        }
    };

    const getRunnerByPrivyId = async (
        privyId: string
    ): Promise<RunnerProfile> => {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.privyId, privyId))
                .limit(1);

            if (!user) {
                throw new NotFoundError('User not found');
            }

            const [result] = await db
                .select({
                    runner: runners,
                    user: users
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .where(eq(runners.userId, user.id))
                .limit(1);

            if (!result) {
                throw new NotFoundError('Runner not found');
            }

            return toRunnerProfile(result.runner, result.user);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error with getRunnerByPrivyId: ', error);
            throw new DatabaseError('Failed to get runner');
        }
    };

    const getRunnerStatusByPrivyId = async (
        privyId: string
    ): Promise<RunnerPoolStatus> => {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.privyId, privyId))
                .limit(1);

            if (!user) {
                throw new NotFoundError('User not found');
            }

            const [runner] = await db
                .select()
                .from(runners)
                .where(eq(runners.userId, user.id))
                .limit(1);

            if (!runner) {
                throw new NotFoundError('Runner not found');
            }

            return {
                status: runner.status,
                isPooled: runner.isPooled
            };
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error with getRunnerStatusByPrivyId: ', error);
            throw new DatabaseError('Failed to get runner status');
        }
    };

    const getRecentActivities = async (
        filter?: string
    ): Promise<RunnerActivity[]> => {
        try {
            const recentRuns = await db
                .select({
                    id: runs.id,
                    runnerId: runs.runnerId,
                    distance: runs.distance,
                    completedAt: runs.endTime
                })
                .from(runs)
                .orderBy(desc(runs.endTime))
                .limit(20);

            if (recentRuns.length === 0) {
                return [];
            }
            const runnerIds = recentRuns.map((run) => run.runnerId);

            if (runnerIds.length === 0) {
                return [];
            }

            const orConditions = runnerIds.map((id) => eq(runners.id, id));

            const runnersData = await db
                .select({
                    runner: runners,
                    user: users
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .where(or(...orConditions));

            const runnerMap = new Map(
                runnersData.map(({ runner, user }) => [
                    runner.id,
                    { runner, user }
                ])
            );

            return recentRuns
                .map((run) => {
                    const runnerData = runnerMap.get(run.runnerId);
                    if (!runnerData) return null;

                    return {
                        id: run.id as UUIDv7,
                        runnerId: run.runnerId as UUIDv7,
                        username: runnerData.user.username,
                        avatarUrl: runnerData.user.avatarUrl,
                        distance: run.distance,
                        completedAt: run.completedAt.toISOString(),
                        isPooled: runnerData.runner.isPooled,
                        timeAgo: formatTimeAgo(run.completedAt)
                    };
                })
                .filter(
                    (activity): activity is RunnerActivity => activity !== null
                );
        } catch (error) {
            console.error('Error with getRecentActivities: ', error);
            throw new DatabaseError('Failed to get recent activities');
        }
    };

    const getRunnerActivities = async (
        runnerId: UUIDv7
    ): Promise<RunnerActivity[]> => {
        try {
            const [runnerWithUser] = await db
                .select({
                    runner: runners,
                    user: users
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .where(eq(runners.id, runnerId))
                .limit(1);

            if (!runnerWithUser) {
                throw new NotFoundError('Runner not found');
            }

            const recentRuns = await db
                .select({
                    id: runs.id,
                    distance: runs.distance,
                    completedAt: runs.endTime
                })
                .from(runs)
                .where(eq(runs.runnerId, runnerId))
                .orderBy(desc(runs.endTime))
                .limit(20);

            return recentRuns.map((run) => ({
                id: run.id as UUIDv7,
                runnerId: runnerId,
                username: runnerWithUser.user.username,
                avatarUrl: runnerWithUser.user.avatarUrl,
                distance: run.distance,
                completedAt: run.completedAt.toISOString(),
                isPooled: runnerWithUser.runner.isPooled,
                timeAgo: formatTimeAgo(run.completedAt)
            }));
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error with getRunnerActivities: ', error);
            throw new DatabaseError('Failed to get runner activities');
        }
    };

    const createRunner = async (
        userId: UUIDv7,
        walletAddress: string
    ): Promise<Runner> => {
        try {
            const [row] = await db
                .insert(runners)
                .values({
                    id: uuidv7(),
                    userId,
                    status: 'active',
                    isPooled: false,
                    totalDistance: 0,
                    totalRuns: 0,
                    runnerWallet: walletAddress
                })
                .returning();

            return toData(row);
        } catch (error) {
            console.error('Error with createRunner: ', error);
            throw new DatabaseError('Failed to create runner');
        }
    };

    const updateRunnerStats = async (
        runnerId: UUIDv7,
        stats: {
            totalDistance?: number;
            totalRuns?: number;
            averagePace?: number | null;
            bestMileTime?: number | null;
        }
    ): Promise<Runner> => {
        try {
            const [row] = await db
                .update(runners)
                .set({
                    ...stats,
                    updatedAt: new Date()
                })
                .where(eq(runners.id, runnerId))
                .returning();

            if (!row) {
                throw new NotFoundError('Runner not found');
            }

            return toData(row);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error with updateRunnerStats: ', error);
            throw new DatabaseError('Failed to update runner stats');
        }
    };

    const updateRunnerPoolStatus = async (
        runnerId: UUIDv7,
        isPooled: boolean
    ): Promise<Runner> => {
        try {
            const [row] = await db
                .update(runners)
                .set({
                    isPooled,
                    updatedAt: new Date()
                })
                .where(eq(runners.id, runnerId))
                .returning();

            if (!row) {
                throw new NotFoundError('Runner not found');
            }

            return toData(row);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error with updateRunnerPoolStatus: ', error);
            throw new DatabaseError('Failed to update runner pool status');
        }
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

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds.toString()} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes.toString()} minute${
            diffInMinutes === 1 ? '' : 's'
        } ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours.toString()} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays.toString()} day${diffInDays === 1 ? '' : 's'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths.toString()} month${diffInMonths === 1 ? '' : 's'} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears.toString()} year${diffInYears === 1 ? '' : 's'} ago`;
};
