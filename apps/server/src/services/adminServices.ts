import { db, eq, users, runs, runners } from '@phyt/database';
import {
    UUIDv7,
    DatabaseError,
    NotFoundError,
    Runner,
    Run,
    PendingRun,
    User,
    AdminService
} from '@phyt/types';

function rethrowAsDatabaseError(message: string, err: unknown): never {
    const originalMsg = err instanceof Error ? err.message : String(err);

    console.error(`${message}:`, originalMsg);
    throw new DatabaseError(message, err);
}

export const adminService: AdminService = {
    getPendingRunners: async (): Promise<Runner[]> => {
        try {
            const pendingRunners = await db
                .select()
                .from(runners)
                .where(eq(runners.status, 'pending'));
            return pendingRunners.map((runner) => ({
                ...runner,
                id: runner.id as UUIDv7,
                userId: runner.userId as UUIDv7
            }));
        } catch (error: unknown) {
            rethrowAsDatabaseError('Failed to get pending runners', error);
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
                .innerJoin(runners, eq(runs.runnerId, runners.id))
                .innerJoin(users, eq(runners.userId, users.id))
                .where(eq(runs.verificationStatus, 'pending'));

            const pendingRuns: PendingRun[] = results.map((item) => ({
                run: {
                    ...item.run,
                    id: item.run.id as UUIDv7,
                    runnerId: item.run.runnerId as UUIDv7,
                    // Handle rawDataJson properly based on its actual type
                    rawDataJson: item.run.rawDataJson
                        ? ((typeof item.run.rawDataJson === 'string'
                              ? JSON.parse(item.run.rawDataJson)
                              : item.run.rawDataJson) as Record<
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

    approveRunner: async (userId: UUIDv7): Promise<User> => {
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
                    userId: userId,
                    runnerWallet: user.walletAddress,
                    averagePace: null,
                    totalDistance: 0,
                    totalRuns: 0,
                    bestMileTime: null,
                    status: 'active'
                });

                return userResults;
            });

            return {
                ...results[0],
                id: results[0].id as UUIDv7
            };
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
        runId: UUIDv7,
        status: 'verified' | 'flagged'
    ): Promise<Run> => {
        try {
            const updatedRunResults = await db
                .update(runs)
                .set({
                    verificationStatus: status,
                    updatedAt: new Date()
                })
                .where(eq(runs.id, runId))
                .returning();

            if (updatedRunResults.length === 0) {
                throw new NotFoundError('Run not found');
            }

            const run = updatedRunResults[0];
            return {
                ...run,
                id: run.id as UUIDv7,
                runnerId: run.runnerId as UUIDv7,
                // Handle rawDataJson properly based on its actual type
                rawDataJson: run.rawDataJson
                    ? ((typeof run.rawDataJson === 'string'
                          ? JSON.parse(run.rawDataJson)
                          : run.rawDataJson) as Record<string, unknown>)
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
