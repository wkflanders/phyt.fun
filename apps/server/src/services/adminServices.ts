import { db, eq, users, runs, runners } from '@phyt/database';
import {
    DatabaseError,
    NotFoundError,
    Runner,
    Run,
    PendingRun,
    User,
    AdminService
} from '@phyt/types';

export const adminService: AdminService = {
    getPendingRunners: async (): Promise<Runner[]> => {
        try {
            const pendingRunners = await db
                .select()
                .from(runners)
                .where(eq(runners.status, 'pending'));
            return pendingRunners;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error with getPendingRunners:', error.message);
            } else {
                console.error('Error with getPendingRunners:', error);
            }
            throw new DatabaseError('Failed to get pending runners');
        }
    },

    getPendingRuns: async (): Promise<PendingRun[]> => {
        try {
            const results = await db
                .select({
                    run: runs,
                    runner: users.username
                })
                .from(runs)
                .innerJoin(runners, eq(runs.runner_id, runners.id))
                .innerJoin(users, eq(runners.user_id, users.id))
                .where(eq(runs.verification_status, 'pending'));

            const pendingRuns: PendingRun[] = results.map((item) => ({
                run: {
                    ...item.run,
                    verification_status: item.run.verification_status,
                    // Handle raw_data_json properly based on its actual type
                    raw_data_json: item.run.raw_data_json
                        ? ((typeof item.run.raw_data_json === 'string'
                              ? JSON.parse(item.run.raw_data_json)
                              : item.run.raw_data_json) as Record<
                              string,
                              unknown
                          >)
                        : null
                },
                runner: item.runner
            }));

            return pendingRuns;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error with getPendingRuns:', error.message);
            } else {
                console.error('Error with getPendingRuns:', error);
            }
            throw new DatabaseError('Failed to get pending runs');
        }
    },

    approveRunner: async (userId: number): Promise<User> => {
        try {
            const results = await db.transaction(async (tx) => {
                // Update user role and get user data in one operation
                const userResults = await tx
                    .update(users)
                    .set({ role: 'runner' })
                    .where(eq(users.id, userId))
                    .returning();

                if (userResults.length === 0) {
                    throw new NotFoundError('User not found');
                }

                // Use the user data from the update operation
                const user = userResults[0];

                await tx.insert(runners).values({
                    user_id: userId,
                    runner_wallet: user.wallet_address,
                    average_pace: null,
                    total_distance_m: 0,
                    total_runs: 0,
                    best_mile_time: null,
                    status: 'active'
                });

                return userResults;
            });

            return results[0];
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(
                    'Error with updateRunVerification:',
                    error.message
                );
            } else {
                console.error('Error with updateRunVerification:', error);
            }
            throw new DatabaseError('Error with updating run verification');
        }
    },

    updateRunVerification: async (
        runId: number,
        status: 'verified' | 'flagged'
    ): Promise<Run> => {
        try {
            const updatedRunResults = await db
                .update(runs)
                .set({
                    verification_status: status,
                    updated_at: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (updatedRunResults.length === 0) {
                throw new NotFoundError('Run not found');
            }

            const run = updatedRunResults[0];
            return {
                ...run,
                // Handle raw_data_json properly based on its actual type
                raw_data_json: run.raw_data_json
                    ? ((typeof run.raw_data_json === 'string'
                          ? JSON.parse(run.raw_data_json)
                          : run.raw_data_json) as Record<string, unknown>)
                    : null
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(
                    'Error with updateRunVerification: ',
                    error.message
                );
            } else {
                console.error('Error with updateRunVerification: ', error);
            }
            throw new DatabaseError('Error with updating run verification');
        }
    }
};
