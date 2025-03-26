import { db, eq, and, like, desc, runners, runs, follows, users } from '@phyt/database';
import { DatabaseError, NotFoundError } from '@phyt/types';
import { formatDistanceToNow } from 'date-fns';

interface GetAllRunnersOptions {
    search?: string;
}

export const runnerService = {
    getRecentActivities: async (filter?: string, privyId?: string) => {
        try {
            // Fetch basic runs
            const runsData = await db.select({
                id: runs.id,
                runner_id: runs.runner_id,
                distance_m: runs.distance_m,
                completed_at: runs.end_time,
            })
                .from(runs)
                .orderBy(desc(runs.end_time))
                .limit(20);

            // If no runs data, return empty array
            if (!runsData.length) {
                return [];
            }

            // For each run, get the related runner and user data
            const activitiesWithDetails = await Promise.all(
                runsData.map(async (run) => {
                    try {
                        // Get runner data
                        const runnerData = await db.select({
                            id: runners.id,
                            user_id: runners.user_id,
                            is_pooled: runners.is_pooled
                        })
                            .from(runners)
                            .where(eq(runners.id, run.runner_id))
                            .limit(1);

                        if (!runnerData.length) {
                            return null; // Skip if runner not found
                        }

                        const runner = runnerData[0];

                        // Skip if filter is 'pooled' and runner is not pooled
                        if (filter === 'pooled' && !runner.is_pooled) {
                            return null;
                        }

                        // For following filter, check if user follows this runner
                        if (filter === 'following' && privyId) {
                            const userQuery = db.select({
                                id: users.id
                            })
                                .from(users)
                                .where(eq(users.privy_id, privyId))
                                .limit(1);

                            const userData = await userQuery;

                            if (!userData.length) {
                                return null; // Skip if user not found
                            }

                            const userId = userData[0].id;

                            const followData = await db.select()
                                .from(follows)
                                .where(
                                    and(
                                        eq(follows.follower_id, userId),
                                        eq(follows.following_id, runner.user_id)
                                    )
                                )
                                .limit(1);

                            if (!followData.length) {
                                return null; // Skip if not following
                            }
                        }

                        // Get user data
                        const userData = await db.select({
                            username: users.username,
                            avatar_url: users.avatar_url
                        })
                            .from(users)
                            .where(eq(users.id, runner.user_id))
                            .limit(1);

                        if (!userData.length) {
                            return null; // Skip if user not found
                        }

                        const user = userData[0];

                        // Combine all data
                        return {
                            id: run.id,
                            runner_id: runner.id,
                            username: user.username,
                            avatar_url: user.avatar_url,
                            distance_m: run.distance_m,
                            completed_at: run.completed_at,
                            is_pooled: runner.is_pooled,
                            time_ago: formatDistanceToNow(new Date(run.completed_at), { addSuffix: true })
                        };
                    } catch (err) {
                        console.error("Error processing run:", err);
                        return null; // Skip this run if there's an error
                    }
                })
            );

            // Filter out null values and return
            return activitiesWithDetails.filter(Boolean);
        } catch (error) {
            console.error("Error fetching runner activities:", error);
            throw new DatabaseError("Failed to fetch recent activities");
        }
    },

    getRunnerActivities: async (runnerId: number) => {
        try {
            const runner = await db.select()
                .from(runners)
                .where(eq(runners.id, runnerId))
                .limit(1);

            if (!runner.length) {
                throw new NotFoundError(`Runner with ID ${runnerId} not found`);
            }

            const activities = await db.select({
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

            return activities.map(activity => ({
                ...activity,
                time_ago: formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true })
            }));
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error(`Error fetching activities for runner ${runnerId}:`, error);
            throw new DatabaseError(`Failed to fetch activities for runner ${runnerId}`);
        }
    },

    getAllRunners: async ({ search }: GetAllRunnersOptions = {}) => {
        try {
            const conditions = [eq(runners.status, 'active')];
            if (search) {
                conditions.push(like(users.username, `%${search}%`));
            }
            let query = db
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
                    updated_at: runners.updated_at,
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id));
            // .where(and(...conditions));

            return await query.orderBy(runners.total_distance_m);
        } catch (error) {
            console.error('Error getting all runners:', error);
            throw new DatabaseError('Failed to get runners');
        }
    },

    getRunnerByPrivyId: async (privyId: string) => {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.privy_id, privyId))
                .limit(1);

            if (!user) {
                throw new NotFoundError('User not found');
            }

            const [runner] = await db
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
                    updated_at: runners.updated_at,
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id))
                .limit(1);

            return runner;
        } catch (error) {
            throw new DatabaseError('Failed to get runner');
        }
    },

    getRunnerById: async (runnerId: number) => {
        try {
            const [runner] = await db
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
                    updated_at: runners.updated_at,
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id))
                .limit(1);

            if (!runner) {
                throw new NotFoundError('Runner not found');
            }

            return runner;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get runner');
        }
    },

    getRunnerStatusByPrivyId: async (privyId: string) => {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.privy_id, privyId))
                .limit(1);

            if (!user) {
                throw new NotFoundError('User not found');
            }

            const [runner] = await db
                .select()
                .from(runners)
                .where(eq(runners.user_id, user.id))
                .limit(1);

            if (!runner) {
                throw new NotFoundError('Runner not found');
            }

            return {
                status: runner.status,
                is_pooled: runner.is_pooled
            };
        } catch (error) {
            console.error('Error getting runner status:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get runner status');
        }
    },
};