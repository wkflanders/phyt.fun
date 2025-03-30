import { db, eq, and, users, runs, runners } from '@phyt/database';
import { DatabaseError, NotFoundError } from '@phyt/types';

export const adminService = {
    getPendingRunners: async () => {
        try {
            const pendingRunners = await db
                .select()
                .from(runners)
                .where(eq(runners.status, 'pending'));
            return pendingRunners;
        } catch (error) {
            console.error('Error getting pending runners:', error);
            throw new DatabaseError('Failed to get pending runners');
        }
    },

    getPendingRuns: async () => {
        try {
            return await db
                .select({
                    run: runs,
                    runner_name: users.username
                })
                .from(runs)
                .innerJoin(runners, eq(runs.runner_id, runners.id))
                .innerJoin(users, eq(runners.user_id, users.id))
                .where(eq(runs.verification_status, 'pending'));
        } catch (error) {
            console.error('Error getting pending runs:', error);
            throw new DatabaseError('Failed to get pending runs');
        }
    },

    approveRunner: async (userId: number) => {
        try {
            const [updatedUser] = await db.transaction(async (tx) => {
                // Update user role
                const [user] = await tx
                    .update(users)
                    .set({ role: 'runner' })
                    .where(eq(users.id, userId))
                    .returning();

                if (!user) {
                    throw new NotFoundError('User not found');
                }

                // Create runner record
                await tx.insert(runners).values({
                    user_id: userId,
                    average_pace: null,
                    total_distance_m: 0,
                    total_runs: 0,
                    best_mile_time: null
                });

                return [user];
            });

            return updatedUser;
        } catch (error) {
            console.error('Error approving runner:', error);
            throw error;
        }
    },

    updateRunVerification: async (
        runId: number,
        status: 'verified' | 'flagged'
    ) => {
        try {
            const [updatedRun] = await db
                .update(runs)
                .set({
                    verification_status: status,
                    updated_at: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (!updatedRun) {
                throw new NotFoundError('Run not found');
            }

            return updatedRun;
        } catch (error) {
            console.error('Error updating run verification:', error);
            throw error;
        }
    }
};
