import { db, eq, and, like, runners, users } from '@phyt/database';
import { DatabaseError, NotFoundError } from '@phyt/types';

interface GetAllRunnersOptions {
    search?: string;
}

export const runnerService = {
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
                    username: users.username,
                    avatar_url: users.avatar_url,
                    total_distance_m: runners.total_distance_m,
                    average_pace: runners.average_pace,
                    total_runs: runners.total_runs,
                    best_mile_time: runners.best_mile_time,
                    created_at: runners.created_at,
                    updated_at: runners.updated_at,
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id))
                .where(and(...conditions));

            return await query.orderBy(runners.total_distance_m);
        } catch (error) {
            console.error('Error getting all runners:', error);
            throw new DatabaseError('Failed to get runners');
        }
    },

    getRunnerById: async (runnerId: number) => {
        try {
            const [runner] = await db
                .select({
                    id: runners.id,
                    user_id: runners.user_id,
                    username: users.username,
                    avatar_url: users.avatar_url,
                    total_distance_m: runners.total_distance_m,
                    average_pace: runners.average_pace,
                    total_runs: runners.total_runs,
                    best_mile_time: runners.best_mile_time,
                    created_at: runners.created_at,
                    updated_at: runners.updated_at,
                })
                .from(runners)
                .innerJoin(users, eq(runners.user_id, users.id))
                .where(
                    and(
                        eq(runners.id, runnerId),
                        eq(runners.status, 'active')
                    )
                )
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
};