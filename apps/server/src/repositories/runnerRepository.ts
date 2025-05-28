import {
    db,
    runners,
    users,
    runs,
    follows,
    eq,
    and,
    like,
    desc
} from '@phyt/database';
import { formatDistanceToNow } from 'date-fns';

import type {
    RunnerProfile,
    RunnerActivity,
    RunnerPoolStatus
} from '@phyt/types';

export const runnerRepository = {
    findAll: async (
        search?: string,
        sortBy?: keyof RunnerProfile,
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Promise<RunnerProfile[]> => {
        const conditions: any[] = [eq(runners.status, 'active')];
        if (search) conditions.push(like(users.username, `%${search}%`));

        const query = db
            .select<RunnerProfile>({
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

        const columnMap: Record<string, any> = {
            username: users.username,
            total_distance_m: runners.total_distance_m,
            average_pace: runners.average_pace,
            total_runs: runners.total_runs,
            best_mile_time: runners.best_mile_time,
            created_at: runners.created_at
        };
        const col = columnMap[sortBy as string] || runners.total_distance_m;
        return query.orderBy(sortOrder === 'desc' ? desc(col) : col);
    },

    findById: async (runnerId: number): Promise<RunnerProfile | null> => {
        const [row] = await db
            .select<RunnerProfile>({
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
            .limit(1)
            .execute();
        return row ?? null;
    },

    findByUserId: async (userId: number): Promise<RunnerProfile | null> => {
        const [row] = await db
            .select<RunnerProfile>({
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
            .where(eq(runners.user_id, userId))
            .limit(1)
            .execute();
        return row ?? null;
    },

    findStatusByUserId: async (
        userId: number
    ): Promise<RunnerPoolStatus | null> => {
        const [row] = await db
            .select<RunnerPoolStatus>({
                status: runners.status,
                is_pooled: runners.is_pooled
            })
            .from(runners)
            .where(eq(runners.user_id, userId))
            .limit(1)
            .execute();
        return row ?? null;
    },

    findActivities: async (runnerId: number): Promise<RunnerActivity[]> => {
        const results = await db
            .select<RunnerActivity>({
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
            .execute();

        return results.map((activity) => ({
            ...activity,
            completed_at: activity.completed_at.toISOString(),
            time_ago: formatDistanceToNow(new Date(activity.completed_at), {
                addSuffix: true
            })
        }));
    },

    findRecentActivities: async (
        filter?: string,
        userId?: number
    ): Promise<RunnerActivity[]> => {
        const runsData = await db
            .select({
                id: runs.id,
                runner_id: runs.runner_id,
                distance_m: runs.distance_m,
                completed_at: runs.end_time
            })
            .from(runs)
            .orderBy(desc(runs.end_time))
            .limit(20)
            .execute();

        const activities = await Promise.all(
            runsData.map(async (run) => {
                const runner = await runnerRepository.findById(run.runner_id);
                if (!runner) return null;
                if (filter === 'pooled' && !runner.is_pooled) return null;
                if (filter === 'following' && userId) {
                    const followsRows = await db
                        .select()
                        .from(follows)
                        .where(
                            and(
                                eq(follows.follower_id, userId),
                                eq(follows.follow_target_id, runner.user_id)
                            )
                        )
                        .limit(1)
                        .execute();
                    if (!followsRows.length) return null;
                }
                return {
                    id: run.id,
                    runner_id: run.runner_id,
                    username: runner.username,
                    avatar_url: runner.avatar_url,
                    distance_m: run.distance_m,
                    completed_at: run.completed_at.toISOString(),
                    is_pooled: runner.is_pooled,
                    time_ago: formatDistanceToNow(new Date(run.completed_at), {
                        addSuffix: true
                    })
                } as RunnerActivity;
            })
        );
        return activities.filter((a): a is RunnerActivity => a !== null);
    }
};
