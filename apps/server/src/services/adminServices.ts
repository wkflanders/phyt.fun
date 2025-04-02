import { db, eq, users, runs, runners } from '@phyt/database';
import {
    DatabaseError,
    NotFoundError,
    Runner,
    Run,
    PendingRun,
    User
} from '@phyt/types';

export const adminService = {
    getPendingRunners: async (): Promise<Runner[]> => {
        try {
            const pendingRunners = await db
                .select()
                .from(runners)
                .where(eq(runners.status, 'pending'));
            return pendingRunners;
        } catch (error) {
            console.error('Error with getPendingRunners: ', error);
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
                    raw_data_json: item.run.raw_data_json as Record<
                        string,
                        unknown
                    > | null
                },
                runner: item.runner
            }));

            return pendingRuns;
        } catch (error) {
            console.error('Error with getPendingRuns: ', error);
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
        } catch (error) {
            console.error('Error with approveRunner: ', error);
            throw new DatabaseError('Error approving runner');
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
                raw_data_json: run.raw_data_json as Record<
                    string,
                    unknown
                > | null
            };
        } catch (error) {
            console.error('Error with updateRunVerification: ', error);
            throw new DatabaseError('Error with updating run verification');
        }
    }
};
