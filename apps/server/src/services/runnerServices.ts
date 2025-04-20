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
                    runner_id: runs.runner_id,
                    distance_m: runs.distance_m,
                    completed_at: runs.end_time
                })
                .from(runs)
                .orderBy(desc(runs.end_time))
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
                                user_id: runners.user_id,
                                is_pooled: runners.is_pooled
                            })
                            .from(runners)
                            .where(eq(runners.id, run.runner_id))
                            .limit(1);

                        if (!runnerData.length) {
                            return null;
                        }

                        const runner = runnerData[0];

                        if (filter === 'pooled' && !runner.is_pooled) {
                            return null;
                        }

                        if (filter === 'following' && privyId) {
                            const userQuery = db
                                .select({
                                    id: users.id
                                })
                                .from(users)
                                .where(eq(users.privy_id, privyId))
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
                                        eq(follows.follower_id, userId),
                                        eq(
                                            follows.follow_target_id,
                                            runner.user_id
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
                                avatar_url: users.avatar_url
                            })
                            .from(users)
                            .where(eq(users.id, runner.user_id))
                            .limit(1);

                        if (!userData.length) {
                            return null;
                        }

                        const user = userData[0];

                        return {
                            id: run.id,
                            runner_id: runner.id,
                            username: user.username,
                            avatar_url: user.avatar_url,
                            distance_m: run.distance_m,
                            completed_at: run.completed_at.toISOString(),
                            is_pooled: runner.is_pooled,
                            time_ago: formatDistanceToNow(
                                new Date(run.completed_at),
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
                (activity): activity is RunnerActivity => activity !== null
            );
        } catch (err) {
            console.error('Error with getRecentActivities ', err);
            throw new DatabaseError('Failed to fetch recent activities');
        }
    },

    getRunnerActivities: async (
        runnerId: number
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
                    runner_id: runners.id,
                    username: users.username,
                    avatar_url: users.avatar_url,
                    distance_m: runs.distance_m,
                    completed_at: runs.end_time,
                    is_pooled: runners.is_pooled
                })
                .from(runs)
                .innerJoin(runners, eq(runs.runner_id, runners.id))
                .innerJoin(users, eq(runners.user_id, users.id))
                .where(eq(runs.runner_id, runnerId))
                .orderBy(desc(runs.end_time))
                .limit(10);

            return activities.map((activity) => ({
                ...activity,
                completed_at: activity.completed_at.toISOString(),
                time_ago: formatDistanceToNow(new Date(activity.completed_at), {
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
        sortBy = 'total_distance_m',
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
                    user_id: runners.user_id,
                    total_distance_m: runners.total_distance_m,
                    average_pace: runners.average_pace,
                    total_runs: runners.total_runs,
                    best_mile_time: runners.best_mile_time,
                    status: runners.status,
                    is_pooled: runners.is_pooled,
                    runner_wallet: runners.runner_wallet,
                    username: users.username,
                    avatar_url: users.avatar_url,
                    created_at: runners.created_at,
                    updated_at: runners.updated_at
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id))
                .where(and(...conditions));

            const isDesc = sortOrder === 'desc';

            // Define the valid sort fields
            const validSortFields: ValidSortField[] = [
                'username',
                'total_distance_m',
                'average_pace',
                'total_runs',
                'best_mile_time',
                'created_at'
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
                : 'total_distance_m';

            // Map sort fields to their corresponding columns
            const sortColumnMap = {
                username: users.username,
                total_distance_m: runners.total_distance_m,
                average_pace: runners.average_pace,
                total_runs: runners.total_runs,
                best_mile_time: runners.best_mile_time,
                created_at: runners.created_at
            };

            // Apply sorting
            const sortColumn = sortColumnMap[validSortBy];
            return await query.orderBy(isDesc ? desc(sortColumn) : sortColumn);
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
                .where(eq(users.privy_id, privyId))
                .limit(1);

            if (!userResults.length) {
                throw new NotFoundError('User not found');
            }

            const runnerResults = await db
                .select({
                    id: runners.id,
                    user_id: runners.user_id,
                    total_distance_m: runners.total_distance_m,
                    average_pace: runners.average_pace,
                    total_runs: runners.total_runs,
                    best_mile_time: runners.best_mile_time,
                    status: runners.status,
                    is_pooled: runners.is_pooled,
                    runner_wallet: runners.runner_wallet,
                    username: users.username,
                    avatar_url: users.avatar_url,
                    created_at: runners.created_at,
                    updated_at: runners.updated_at
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id))
                .limit(1);
            if (!runnerResults.length) {
                throw new NotFoundError('Runner not found');
            }
            return runnerResults[0];
        } catch (error: unknown) {
            console.error('Error with getRunnerByPrivyId ', error);
            throw new DatabaseError('Failed to get runner');
        }
    },

    getRunnerById: async (runnerId: number): Promise<RunnerProfile> => {
        try {
            const runnerResults = await db
                .select({
                    id: runners.id,
                    user_id: runners.user_id,
                    total_distance_m: runners.total_distance_m,
                    average_pace: runners.average_pace,
                    total_runs: runners.total_runs,
                    best_mile_time: runners.best_mile_time,
                    status: runners.status,
                    is_pooled: runners.is_pooled,
                    runner_wallet: runners.runner_wallet,
                    username: users.username,
                    avatar_url: users.avatar_url,
                    created_at: runners.created_at,
                    updated_at: runners.updated_at
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id))
                .where(eq(runners.id, runnerId))
                .limit(1);

            if (!runnerResults.length) {
                throw new NotFoundError('Runner not found');
            }

            return runnerResults[0];
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
                .where(eq(users.privy_id, privyId))
                .limit(1);

            if (!user.length) {
                throw new NotFoundError('User not found');
            }

            const runner = await db
                .select()
                .from(runners)
                .where(eq(runners.user_id, user[0].id))
                .limit(1);

            if (runner.length) {
                throw new NotFoundError('Runner not found');
            }

            return {
                status: runner[0].status,
                is_pooled: runner[0].is_pooled
            };
        } catch (error) {
            console.error('Error with getRunnerStatusByPrivyId ', error);
            throw new DatabaseError('Failed to get runner status');
        }
    }
};
