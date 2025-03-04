import { db, eq, and } from '@phyt/database';
import { runs, runners, users } from '@phyt/database';
import { DatabaseError, NotFoundError } from '@phyt/types';
import { withTransaction } from '@phyt/database';

export const runService = {
    applyAsRunner: async ({ privyId, workouts }: {
        privyId: string;
        workouts: any[];
    }) => {
        try {
            return await withTransaction(async (tx) => {
                const status = await runService.applyToBeRunner(privyId);

                if (status === 'pending') {
                    const results = await runService.createRunsBatchByPrivyId({
                        privyId,
                        workouts
                    });

                    if (results && results.length > 0) {
                        return 'success';
                    }
                    return 'pending';
                } else if (status === 'already_runner') {
                    return 'already_runner';
                } else if (status === 'already_submitted') {
                    return 'already_submitted';
                }

                return 'failed';
            });
        } catch (error) {
            console.error('Error applying as runner:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to process runner application');
        }
    },

    getRunnerRuns: async (runnerId: number) => {
        try {
            return await db
                .select()
                .from(runs)
                .where(eq(runs.runner_id, runnerId))
                .orderBy(runs.created_at);
        } catch (error) {
            console.error('Error getting runner runs:', error);
            throw new DatabaseError('Failed to get runner runs');
        }
    },

    getRunById: async (runId: number) => {
        try {
            const [run] = await db
                .select()
                .from(runs)
                .where(eq(runs.id, runId))
                .limit(1);

            if (!run) {
                throw new NotFoundError('Run not found');
            }

            return run;
        } catch (error) {
            console.error('Error getting run by id:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get run');
        }
    },

    applyToBeRunner: async (privyId: string) => {
        try {
            return await withTransaction(async (tx) => {
                // 1. Get user record
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.privy_id, privyId));

                if (!user) {
                    throw new NotFoundError('User not found');
                }

                // 2. Check if user is already a runner
                const [runner] = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.user_id, user.id));

                if (runner.status === 'pending') {
                    return 'already_submitted';
                } else if (runner.status === 'active') {
                    return 'already_runner';
                }

                // 3. Create runner record
                await db
                    .insert(runners)
                    .values({
                        user_id: user.id,
                        average_pace: null,
                        total_distance_m: 0,
                        total_runs: 0,
                        best_mile_time: null,
                        status: 'pending' as const
                    });

                return 'pending';
            });
        } catch (error) {
            console.error('Error applying to be runner:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to apply to be runner');
        }
    },

    createRunByPrivyId: async ({ privyId, workout }: {
        privyId: string,
        workout: any;
    }) => {
        try {
            return await withTransaction(async (tx) => {
                // 1. Get user and runner records
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.privy_id, privyId));

                if (!user) {
                    throw new NotFoundError('User not found');
                }

                const [runner] = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.user_id, user.id));

                if (!runner) {
                    throw new NotFoundError('Runner record not found');
                }

                // 2. Insert the run
                const [insertedRun] = await db
                    .insert(runs)
                    .values({
                        runner_id: runner.id,
                        start_time: new Date(workout.start_time),
                        end_time: new Date(workout.end_time),
                        duration_seconds: workout.duration_seconds,
                        distance_m: workout.distance_m,
                        average_pace_sec: workout.average_pace_sec || null,
                        calories_burned: workout.calories_burned || null,
                        step_count: workout.step_count || null,
                        elevation_gain_m: workout.elevation_gain_m || null,
                        average_heart_rate: workout.average_heart_rate || null,
                        max_heart_rate: workout.max_heart_rate || null,
                        device_id: workout.device_id || null,
                        gps_route_data: workout.gps_route_data || null,
                        verification_status: 'pending' as const,
                        raw_data_json: workout
                    })
                    .returning();

                // 3. Update runner stats
                await updateRunnerStats(runner.id);

                return insertedRun;
            });
        } catch (error) {
            console.error('Error in createRunByPrivyId:', error);
            throw error;
        }
    },
    // Need a verification algorithm function
    createRunsBatchByPrivyId: async ({ privyId, workouts }: {
        privyId: string,
        workouts: any[];
    }) => {
        try {
            return await withTransaction(async (tx) => {
                // 1. Get user and runner records
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.privy_id, privyId));

                if (!user) {
                    throw new NotFoundError('User not found');
                }

                const [runner] = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.user_id, user.id));

                if (!runner) {
                    throw new NotFoundError('Runner record not found');
                }

                // 2. Insert all runs
                const runsToInsert = workouts.map(workout => ({
                    runner_id: runner.id,
                    start_time: new Date(workout.start_time),
                    end_time: new Date(workout.end_time),
                    duration_seconds: workout.duration_seconds,
                    distance_m: workout.distance_m,
                    average_pace_sec: workout.average_pace_sec || null,
                    calories_burned: workout.calories_burned || null,
                    step_count: workout.step_count || null,
                    elevation_gain_m: workout.elevation_gain_m || null,
                    average_heart_rate: workout.average_heart_rate || null,
                    max_heart_rate: workout.max_heart_rate || null,
                    device_id: workout.device_id || null,
                    gps_route_data: workout.gps_route_data || null,
                    verification_status: 'pending' as const,
                    raw_data_json: workout
                }));

                const insertedRuns = await db
                    .insert(runs)
                    .values(runsToInsert)
                    .returning();

                // 3. Update runner stats
                await updateRunnerStats(runner.id);

                return insertedRuns;
            });
        } catch (error) {
            console.error('Error in createRunsBatchByPrivyId:', error);
            throw error;
        }
    },

    updateRunVerificationStatus: async ({
        runId,
        status
    }: {
        runId: number,
        status: 'pending' | 'verified' | 'flagged';
    }) => {
        try {
            const [run] = await db
                .update(runs)
                .set({
                    verification_status: status,
                    updated_at: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (!run) {
                throw new NotFoundError('Run not found');
            }

            // Update runner stats if the run was verified
            if (status === 'verified') {
                await updateRunnerStats(run.runner_id);
            }

            return run;
        } catch (error) {
            console.error('Error updating run verification status:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to update run verification status');
        }
    },

    deleteRun: async (runId: number) => {
        try {
            const [deletedRun] = await db
                .delete(runs)
                .where(eq(runs.id, runId))
                .returning();

            if (!deletedRun) {
                throw new NotFoundError('Run not found');
            }

            // Update runner stats after deletion
            await updateRunnerStats(deletedRun.runner_id);

            return deletedRun;
        } catch (error) {
            console.error('Error deleting run:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to delete run');
        }
    },

    markRunAsPosted: async (runId: number) => {
        try {
            const [updatedRun] = await db
                .update(runs)
                .set({
                    is_posted: true,
                    updated_at: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();
            if (!updatedRun) {
                throw new NotFoundError('Run not found');
            }

            return updatedRun;
        } catch (error) {
            console.error('Error marking run as posted:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to mark run as posted');
        }
    }
};

async function updateRunnerStats(runnerId: number) {
    try {
        // Get all verified runs for the runner
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

        // Calculate statistics
        const totalDistance = runnerRuns.reduce((sum, run) => sum + run.distance_m, 0);
        const totalPace = runnerRuns.reduce((sum, run) => sum + (run.average_pace_sec || 0), 0);
        const averagePace = totalPace / runnerRuns.length;

        // Update runner record
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
        console.error('Error updating runner stats:', error);
        throw new DatabaseError('Failed to update runner statistics');
    }
}