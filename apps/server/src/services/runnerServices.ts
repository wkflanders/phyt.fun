import {
    db,
    eq,
    and,
    like,
    desc,
    runners,
    runs,
    follows,
    users
} from '@phyt/database';
import {
    UUIDv7,
    NotFoundError,
    DatabaseError,
    RunnerProfile,
    RunnerActivity,
    RunnerPoolStatus,
    RunnerQueryParams,
    RunnerSortFields
} from '@phyt/types';
import { formatDistanceToNow } from 'date-fns';

export const runnerService = {
    getRecentActivities: async (
        filter?: string,
        privyId?: string
    ): Promise<RunnerActivity[]> => {
        try {
            const runsData = await db
                .select({
                    id: runs.id,
                    runnerId: runs.runnerId,
                    distance: runs.distance,
                    completedAt: runs.endTime
                })
                .from(runs)
                .orderBy(desc(runs.endTime))
                .limit(20);

            if (!runsData.length) {
                return [];
            }

            const activitiesWithDetails = await Promise.all(
                runsData.map(async (run) => {
                    try {
                        const runnerData = await db
                            .select({
                                id: runners.id,
                                userId: runners.userId,
                                isPooled: runners.isPooled
                            })
                            .from(runners)
                            .where(eq(runners.id, run.runnerId))
                            .limit(1);

                        if (!runnerData.length) {
                            return null;
                        }

                        const runner = runnerData[0];

                        if (filter === 'pooled' && !runner.isPooled) {
                            return null;
                        }

                        if (filter === 'following' && privyId) {
                            const userQuery = db
                                .select({
                                    id: users.id
                                })
                                .from(users)
                                .where(eq(users.privyId, privyId))
                                .limit(1);

                            const userData = await userQuery;

                            if (!userData.length) {
                                return null;
                            }

                            const userId = userData[0].id;

                            const followData = await db
                                .select()
                                .from(follows)
                                .where(
                                    and(
                                        eq(follows.followerId, userId),
                                        eq(
                                            follows.followTargetId,
                                            runner.userId
                                        )
                                    )
                                )
                                .limit(1);

                            if (!followData.length) {
                                return null;
                            }
                        }

                        const userData = await db
                            .select({
                                username: users.username,
                                avatarUrl: users.avatarUrl
                            })
                            .from(users)
                            .where(eq(users.id, runner.userId))
                            .limit(1);

                        if (!userData.length) {
                            return null;
                        }

                        const user = userData[0];

                        return {
                            id: run.id as UUIDv7,
                            runnerId: runner.id as UUIDv7,
                            username: user.username,
                            avatarUrl: user.avatarUrl,
                            distance: run.distance,
                            completedAt: run.completedAt.toISOString(),
                            isPooled: runner.isPooled,
                            timeAgo: formatDistanceToNow(
                                new Date(run.completedAt),
                                { addSuffix: true }
                            )
                        };
                    } catch (err) {
                        console.error('Error with activitiesWithDetails ', err);
                        throw new DatabaseError('Error processing run');
                    }
                })
            );

            // Filter out null values and return
            return activitiesWithDetails.filter(
                (activity): activity is NonNullable<typeof activity> =>
                    activity !== null
            );
        } catch (err) {
            console.error('Error with getRecentActivities ', err);
            throw new DatabaseError('Failed to fetch recent activities');
        }
    },

    getRunnerActivities: async (
        runnerId: UUIDv7
    ): Promise<RunnerActivity[]> => {
        try {
            const runner = await db
                .select()
                .from(runners)
                .where(eq(runners.id, runnerId))
                .limit(1);

            if (!runner.length) {
                throw new NotFoundError(
                    `Runner with ID ${String(runnerId)} not found`
                );
            }

            const activities = await db
                .select({
                    id: runs.id,
                    runnerId: runners.id,
                    username: users.username,
                    avatarUrl: users.avatarUrl,
                    distance: runs.distance,
                    completedAt: runs.endTime,
                    isPooled: runners.isPooled
                })
                .from(runs)
                .innerJoin(runners, eq(runs.runnerId, runners.id))
                .innerJoin(users, eq(runners.userId, users.id))
                .where(eq(runs.runnerId, runnerId))
                .orderBy(desc(runs.endTime))
                .limit(10);

            return activities.map((activity) => ({
                ...activity,
                id: activity.id as UUIDv7,
                runnerId: activity.runnerId as UUIDv7,
                completedAt: activity.completedAt.toISOString(),
                timeAgo: formatDistanceToNow(new Date(activity.completedAt), {
                    addSuffix: true
                })
            }));
        } catch (error) {
            console.error(`Error with getRunnerActivities `, error);
            throw new DatabaseError(
                `Failed to fetch activities for runner ${String(runnerId)}`
            );
        }
    },

    getAllRunners: async ({
        search,
        sortBy = 'totalDistance',
        sortOrder = 'desc'
    }: RunnerQueryParams): Promise<RunnerProfile[]> => {
        // Define the valid sort fields type
        type ValidSortField = RunnerSortFields;

        try {
            // Create base query with conditions
            const conditions = [eq(runners.status, 'active')];
            if (search) {
                conditions.push(like(users.username, `%${String(search)}%`));
            }

            // Build the query
            const query = db
                .select({
                    id: runners.id,
                    userId: runners.userId,
                    totalDistance: runners.totalDistance,
                    averagePace: runners.averagePace,
                    totalRuns: runners.totalRuns,
                    bestMileTime: runners.bestMileTime,
                    status: runners.status,
                    isPooled: runners.isPooled,
                    runnerWallet: runners.runnerWallet,
                    username: users.username,
                    avatarUrl: users.avatarUrl,
                    createdAt: runners.createdAt,
                    updatedAt: runners.updatedAt
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .where(and(...conditions));

            const isDesc = sortOrder === 'desc';

            // Define the valid sort fields
            const validSortFields: ValidSortField[] = [
                'username',
                'totalDistance',
                'averagePace',
                'totalRuns',
                'bestMileTime',
                'createdAt'
            ];

            // Type guard to check if the sortBy is valid
            const isValidSortField = (
                field: string
            ): field is ValidSortField => {
                return validSortFields.includes(field as ValidSortField);
            };

            // Validate and get the sortBy field
            const validSortBy = isValidSortField(sortBy)
                ? sortBy
                : 'totalDistance';

            // Map sort fields to their corresponding columns
            const sortColumnMap = {
                username: users.username,
                totalDistance: runners.totalDistance,
                averagePace: runners.averagePace,
                totalRuns: runners.totalRuns,
                bestMileTime: runners.bestMileTime,
                createdAt: runners.createdAt
            };

            // Apply sorting
            const sortColumn = sortColumnMap[validSortBy];
            const results = await query.orderBy(
                isDesc ? desc(sortColumn) : sortColumn
            );
            return results.map((runner) => ({
                ...runner,
                id: runner.id as UUIDv7,
                userId: runner.userId as UUIDv7
            }));
        } catch (error) {
            console.error('Error with getAllRunners ', error);
            throw new DatabaseError('Failed to get runners');
        }
    },

    getRunnerByPrivyId: async (privyId: string): Promise<RunnerProfile> => {
        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.privyId, privyId))
                .limit(1);

            if (!userResults.length) {
                throw new NotFoundError('User not found');
            }

            const runnerResults = await db
                .select({
                    id: runners.id,
                    userId: runners.userId,
                    totalDistance: runners.totalDistance,
                    averagePace: runners.averagePace,
                    totalRuns: runners.totalRuns,
                    bestMileTime: runners.bestMileTime,
                    status: runners.status,
                    isPooled: runners.isPooled,
                    runnerWallet: runners.runnerWallet,
                    username: users.username,
                    avatarUrl: users.avatarUrl,
                    createdAt: runners.createdAt,
                    updatedAt: runners.updatedAt
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .limit(1);
            if (!runnerResults.length) {
                throw new NotFoundError('Runner not found');
            }
            return {
                ...runnerResults[0],
                id: runnerResults[0].id as UUIDv7,
                userId: runnerResults[0].userId as UUIDv7
            };
        } catch (error: unknown) {
            console.error('Error with getRunnerByPrivyId ', error);
            throw new DatabaseError('Failed to get runner');
        }
    },

    getRunnerById: async (runnerId: UUIDv7): Promise<RunnerProfile> => {
        try {
            const runnerResults = await db
                .select({
                    id: runners.id,
                    userId: runners.userId,
                    totalDistance: runners.totalDistance,
                    averagePace: runners.averagePace,
                    totalRuns: runners.totalRuns,
                    bestMileTime: runners.bestMileTime,
                    status: runners.status,
                    isPooled: runners.isPooled,
                    runnerWallet: runners.runnerWallet,
                    username: users.username,
                    avatarUrl: users.avatarUrl,
                    createdAt: runners.createdAt,
                    updatedAt: runners.updatedAt
                })
                .from(runners)
                .innerJoin(users, eq(runners.userId, users.id))
                .where(eq(runners.id, runnerId))
                .limit(1);

            if (!runnerResults.length) {
                throw new NotFoundError('Runner not found');
            }

            return {
                ...runnerResults[0],
                id: runnerResults[0].id as UUIDv7,
                userId: runnerResults[0].userId as UUIDv7
            };
        } catch (error: unknown) {
            console.error('Error with getRunnerById ', error);
            throw new DatabaseError('Failed to get runner');
        }
    },

    getRunnerStatusByPrivyId: async (
        privyId: string
    ): Promise<RunnerPoolStatus> => {
        try {
            const user = await db
                .select()
                .from(users)
                .where(eq(users.privyId, privyId))
                .limit(1);

            if (!user.length) {
                throw new NotFoundError('User not found');
            }

            const runner = await db
                .select()
                .from(runners)
                .where(eq(runners.userId, user[0].id))
                .limit(1);

            if (runner.length) {
                throw new NotFoundError('Runner not found');
            }

            return {
                status: runner[0].status,
                isPooled: runner[0].isPooled
            };
        } catch (error) {
            console.error('Error with getRunnerStatusByPrivyId ', error);
            throw new DatabaseError('Failed to get runner status');
        }
    }
};
