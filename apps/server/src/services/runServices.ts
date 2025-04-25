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
    UUIDv7,
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
                } else if (status === 'alreadyRunner') {
                    return 'alreadyRunner';
                } else {
                    return 'alreadySubmitted';
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
                    .where(eq(users.privyId, privyId));

                if (!userResults.length) {
                    throw new NotFoundError('User not found');
                }

                const user = userResults[0];

                const [runner] = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.userId, user.id));

                if (runner.status === 'pending') {
                    return 'alreadySubmitted';
                } else if (runner.status === 'active') {
                    return 'alreadyRunner';
                } else {
                    await db.insert(runners).values({
                        userId: user.id,
                        averagePace: null,
                        totalDistance: 0,
                        totalRuns: 0,
                        bestMileTime: null,
                        status: 'pending' as const,
                        isPooled: false,
                        runnerWallet: user.walletAddress
                    });

                    return 'pending';
                }
            });
        } catch (error) {
            console.error('Error with submitRunnerApplication: ', error);
            throw new DatabaseError('Failed to apply to be runner');
        }
    },

    getRunById: async (runId: UUIDv7): Promise<Run> => {
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
                id: run.id as UUIDv7,
                runnerId: run.runnerId as UUIDv7,
                rawDataJson: run.rawDataJson as Record<string, unknown> | null
            };
        } catch (error) {
            console.error('Error getting run by id:', error);
            throw new DatabaseError('Failed to get run');
        }
    },

    getRunnerRuns: async (runnerId: UUIDv7): Promise<Run[]> => {
        try {
            const runResults = await db
                .select()
                .from(runs)
                .where(eq(runs.runnerId, runnerId))
                .orderBy(runs.createdAt);

            return runResults.map((run) => ({
                ...run,
                id: run.id as UUIDv7,
                runnerId: run.runnerId as UUIDv7,
                rawDataJson: run.rawDataJson as Record<string, unknown> | null
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
                        runnerId: runner.id,
                        startTime: new Date(workout.startTime),
                        endTime: new Date(workout.endTime),
                        durationSeconds: workout.durationSeconds,
                        distance: workout.distance,
                        averagePaceSec: workout.averagePaceSec ?? null,
                        caloriesBurned: workout.caloriesBurned ?? null,
                        stepCount: workout.stepCount ?? null,
                        elevationGain: workout.elevationGain ?? null,
                        averageHeartRate: workout.averageHeartRate ?? null,
                        maxHeartRate: workout.maxHeartRate ?? null,
                        deviceId: workout.deviceId ?? null,
                        gpsRouteData: workout.gpsRouteData ?? null,
                        verificationStatus: 'pending' as const,
                        rawDataJson: workout
                    })
                    .returning();

                await runService.updateRunnerStats(runner.id);

                return {
                    ...insertedRun,
                    id: insertedRun.id as UUIDv7,
                    runnerId: insertedRun.runnerId as UUIDv7,
                    rawDataJson: insertedRun.rawDataJson as Record<
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

                // 2. Insert all
                const runsToInsert = workouts.map((workout) => ({
                    runnerId: runner.id,
                    startTime: new Date(workout.startTime),
                    endTime: new Date(workout.endTime),
                    durationSeconds: workout.durationSeconds,
                    distance: workout.distance,
                    averagePaceSec: workout.averagePaceSec ?? null,
                    caloriesBurned: workout.caloriesBurned ?? null,
                    stepCount: workout.stepCount ?? null,
                    elevationGain: workout.elevationGain ?? null,
                    averageHeartRate: workout.averageHeartRate ?? null,
                    maxHeartRate: workout.maxHeartRate ?? null,
                    deviceId: workout.deviceId ?? null,
                    gpsRouteData: workout.gpsRouteData ?? null,
                    verificationStatus: 'pending' as const,
                    rawDataJson: workout
                }));

                const insertedRuns = await db
                    .insert(runs)
                    .values(runsToInsert)
                    .returning();

                await runService.updateRunnerStats(runner.id);

                return insertedRuns.map((run) => ({
                    ...run,
                    id: run.id as UUIDv7,
                    runnerId: run.runnerId as UUIDv7,
                    rawDataJson: run.rawDataJson as Record<
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
        runId: string;
        status: RunVerificationStatus;
    }): Promise<Run> => {
        try {
            const runResults = await db
                .update(runs)
                .set({
                    verificationStatus: status,
                    updatedAt: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (!runResults.length) {
                throw new NotFoundError('Run not found');
            }

            if (status === 'verified') {
                await runService.updateRunnerStats(runResults[0].runnerId);
            }

            return {
                ...runResults[0],
                id: runResults[0].id as UUIDv7,
                runnerId: runResults[0].runnerId as UUIDv7,
                rawDataJson: runResults[0].rawDataJson as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error with updateRunVerificationStatus: ', error);
            throw new DatabaseError('Failed to update run verification status');
        }
    },

    deleteRun: async (runId: UUIDv7): Promise<Run> => {
        try {
            const runResults = await db
                .delete(runs)
                .where(eq(runs.id, runId))
                .returning();

            if (!runResults.length) {
                throw new NotFoundError('Run not found');
            }

            await runService.updateRunnerStats(runResults[0].runnerId);

            return {
                ...runResults[0],
                id: runResults[0].id as UUIDv7,
                runnerId: runResults[0].runnerId as UUIDv7,
                rawDataJson: runResults[0].rawDataJson as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error with deleteRun: ', error);
            throw new DatabaseError('Failed to delete run');
        }
    },

    markRunAsPosted: async (runId: string): Promise<Run> => {
        try {
            const runResults = await db
                .update(runs)
                .set({
                    isPosted: true,
                    updatedAt: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (!runResults.length) {
                throw new NotFoundError('Run not found');
            }

            return {
                ...runResults[0],
                id: runResults[0].id as UUIDv7,
                runnerId: runResults[0].runnerId as UUIDv7,
                rawDataJson: runResults[0].rawDataJson as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error with markRunAsPosted: ', error);
            throw new DatabaseError('Failed to mark run as posted');
        }
    },

    updateRunnerStats: async (runnerId: string): Promise<void> => {
        try {
            const runnerRuns = await db
                .select()
                .from(runs)
                .where(
                    and(
                        eq(runs.runnerId, runnerId),
                        eq(runs.verificationStatus, 'verified')
                    )
                );

            if (runnerRuns.length === 0) return;

            const totalDistance = runnerRuns.reduce(
                (sum, run) => sum + run.distance,
                0
            );
            const totalPace = runnerRuns.reduce(
                (sum, run) => sum + (run.averagePaceSec ?? 0),
                0
            );
            const averagePace = totalPace / runnerRuns.length;

            await db
                .update(runners)
                .set({
                    totalDistance: totalDistance,
                    averagePace: averagePace,
                    totalRuns: runnerRuns.length,
                    updatedAt: new Date()
                })
                .where(eq(runners.id, runnerId));
        } catch (error) {
            console.error('Error with updateRunnerStats: ', error);
            throw new DatabaseError('Failed to update runner statistics');
        }
    }
};
