import {
    db,
    eq,
    and,
    runs,
    runners,
    users,
    withTransaction
} from '@phyt/database';
import {
    NotFoundError,
    RunnerApplicationStatus,
    Run,
    DatabaseError,
    RunVerificationStatus
} from '@phyt/types';

import { runnerService } from '@/services/runnerServices.js';

export const runService = {
    processRunnerApplication: async ({
        privyId,
        workouts
    }: {
        privyId: string;
        workouts: Run[];
    }): Promise<RunnerApplicationStatus> => {
        try {
            return await withTransaction(async () => {
                const status =
                    await runService.submitRunnerApplication(privyId);

                if (status === 'pending') {
                    const results = await runService.createRunsBatchByPrivyId({
                        privyId,
                        workouts
                    });

                    if (results.length > 0) {
                        return 'success';
                    }
                    return 'pending';
                } else if (status === 'already_runner') {
                    return 'already_runner';
                } else {
                    return 'already_submitted';
                }
            });
        } catch (error) {
            console.error('Error with processRunnerApplication: ', error);
            throw new DatabaseError('Error applying as runner');
        }
    },

    submitRunnerApplication: async (
        privyId: string
    ): Promise<RunnerApplicationStatus> => {
        try {
            return await withTransaction(async () => {
                const userResults = await db
                    .select()
                    .from(users)
                    .where(eq(users.privy_id, privyId));

                if (!userResults.length) {
                    throw new NotFoundError('User not found');
                }

                const user = userResults[0];

                const [runner] = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.user_id, user.id));

                if (runner.status === 'pending') {
                    return 'already_submitted';
                } else if (runner.status === 'active') {
                    return 'already_runner';
                } else {
                    await db.insert(runners).values({
                        user_id: user.id,
                        average_pace: null,
                        total_distance_m: 0,
                        total_runs: 0,
                        best_mile_time: null,
                        status: 'pending' as const,
                        is_pooled: false,
                        runner_wallet: user.wallet_address
                    });

                    return 'pending';
                }
            });
        } catch (error) {
            console.error('Error with submitRunnerApplication: ', error);
            throw new DatabaseError('Failed to apply to be runner');
        }
    },

    getRunById: async (runId: number): Promise<Run> => {
        try {
            const runResults = await db
                .select()
                .from(runs)
                .where(eq(runs.id, runId))
                .limit(1);

            if (!runResults.length) {
                throw new NotFoundError('Run not found');
            }

            const run = runResults[0];

            return {
                ...run,
                raw_data_json: run.raw_data_json as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error getting run by id:', error);
            throw new DatabaseError('Failed to get run');
        }
    },

    getRunnerRuns: async (runnerId: number): Promise<Run[]> => {
        try {
            const runResults = await db
                .select()
                .from(runs)
                .where(eq(runs.runner_id, runnerId))
                .orderBy(runs.created_at);

            return runResults.map((run) => ({
                ...run,
                raw_data_json: run.raw_data_json as Record<
                    string,
                    unknown
                > | null
            }));
        } catch (error) {
            console.error('Error with getRunnerRuns: ', error);
            throw new DatabaseError('Failed to get runner runs');
        }
    },

    createRunByPrivyId: async ({
        privyId,
        workout
    }: {
        privyId: string;
        workout: Run;
    }): Promise<Run> => {
        try {
            return await withTransaction(async () => {
                const runner = await runnerService.getRunnerByPrivyId(privyId);

                const [insertedRun] = await db
                    .insert(runs)
                    .values({
                        runner_id: runner.id,
                        start_time: new Date(workout.start_time),
                        end_time: new Date(workout.end_time),
                        duration_seconds: workout.duration_seconds,
                        distance_m: workout.distance_m,
                        average_pace_sec: workout.average_pace_sec ?? null,
                        calories_burned: workout.calories_burned ?? null,
                        step_count: workout.step_count ?? null,
                        elevation_gain_m: workout.elevation_gain_m ?? null,
                        average_heart_rate: workout.average_heart_rate ?? null,
                        max_heart_rate: workout.max_heart_rate ?? null,
                        device_id: workout.device_id ?? null,
                        gps_route_data: workout.gps_route_data ?? null,
                        verification_status: 'pending' as const,
                        raw_data_json: workout
                    })
                    .returning();

                await runService.updateRunnerStats(runner.id);

                return {
                    ...insertedRun,
                    raw_data_json: insertedRun.raw_data_json as Record<
                        string,
                        unknown
                    > | null
                };
            });
        } catch (error) {
            console.error('Error in createRunByPrivyId:', error);
            throw new DatabaseError('Failed to insert run');
        }
    },
    // Need a verification algorithm function
    createRunsBatchByPrivyId: async ({
        privyId,
        workouts
    }: {
        privyId: string;
        workouts: Run[];
    }): Promise<Run[]> => {
        try {
            return await withTransaction(async () => {
                // 1. Get user and runner records
                const runner = await runnerService.getRunnerByPrivyId(privyId);

                // 2. Insert all runs
                const runsToInsert = workouts.map((workout) => ({
                    runner_id: runner.id,
                    start_time: new Date(workout.start_time),
                    end_time: new Date(workout.end_time),
                    duration_seconds: workout.duration_seconds,
                    distance_m: workout.distance_m,
                    average_pace_sec: workout.average_pace_sec ?? null,
                    calories_burned: workout.calories_burned ?? null,
                    step_count: workout.step_count ?? null,
                    elevation_gain_m: workout.elevation_gain_m ?? null,
                    average_heart_rate: workout.average_heart_rate ?? null,
                    max_heart_rate: workout.max_heart_rate ?? null,
                    device_id: workout.device_id ?? null,
                    gps_route_data: workout.gps_route_data ?? null,
                    verification_status: 'pending' as const,
                    raw_data_json: workout
                }));

                const insertedRuns = await db
                    .insert(runs)
                    .values(runsToInsert)
                    .returning();

                await runService.updateRunnerStats(runner.id);

                return insertedRuns.map((run) => ({
                    ...run,
                    raw_data_json: run.raw_data_json as Record<
                        string,
                        unknown
                    > | null
                }));
            });
        } catch (error) {
            console.error('Error in createRunsBatchByPrivyId:', error);
            throw new DatabaseError('Failed to insert batch runs');
        }
    },

    updateRunVerificationStatus: async ({
        runId,
        status
    }: {
        runId: number;
        status: RunVerificationStatus;
    }): Promise<Run> => {
        try {
            const runResults = await db
                .update(runs)
                .set({
                    verification_status: status,
                    updated_at: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (!runResults.length) {
                throw new NotFoundError('Run not found');
            }

            if (status === 'verified') {
                await runService.updateRunnerStats(runResults[0].runner_id);
            }

            return {
                ...runResults[0],
                raw_data_json: runResults[0].raw_data_json as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error with updateRunVerificationStatus: ', error);
            throw new DatabaseError('Failed to update run verification status');
        }
    },

    deleteRun: async (runId: number): Promise<Run> => {
        try {
            const runResults = await db
                .delete(runs)
                .where(eq(runs.id, runId))
                .returning();

            if (!runResults.length) {
                throw new NotFoundError('Run not found');
            }

            await runService.updateRunnerStats(runResults[0].runner_id);

            return {
                ...runResults[0],
                raw_data_json: runResults[0].raw_data_json as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error with deleteRun: ', error);
            throw new DatabaseError('Failed to delete run');
        }
    },

    markRunAsPosted: async (runId: number): Promise<Run> => {
        try {
            const runResults = await db
                .update(runs)
                .set({
                    is_posted: true,
                    updated_at: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (!runResults.length) {
                throw new NotFoundError('Run not found');
            }

            return {
                ...runResults[0],
                raw_data_json: runResults[0].raw_data_json as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error with markRunAsPosted: ', error);
            throw new DatabaseError('Failed to mark run as posted');
        }
    },

    updateRunnerStats: async (runnerId: number): Promise<void> => {
        try {
            const runnerRuns = await db
                .select()
                .from(runs)
                .where(
                    and(
                        eq(runs.runner_id, runnerId),
                        eq(runs.verification_status, 'verified')
                    )
                );

            if (runnerRuns.length === 0) return;

            const totalDistance = runnerRuns.reduce(
                (sum, run) => sum + run.distance_m,
                0
            );
            const totalPace = runnerRuns.reduce(
                (sum, run) => sum + (run.average_pace_sec ?? 0),
                0
            );
            const averagePace = totalPace / runnerRuns.length;

            await db
                .update(runners)
                .set({
                    total_distance_m: totalDistance,
                    average_pace: averagePace,
                    total_runs: runnerRuns.length,
                    updated_at: new Date()
                })
                .where(eq(runners.id, runnerId));
        } catch (error) {
            console.error('Error with updateRunnerStats: ', error);
            throw new DatabaseError('Failed to update runner statistics');
        }
    }
};
