import { eq } from 'drizzle-orm';

import { NotFoundError, DatabaseError } from '@phyt/models';

import { DrizzleDB } from '@/db.js';
import { users, runs, runners } from '@/schema.js';

import type { UUIDv7, PendingRunner, PendingRun, User, Run } from '@phyt/types';

export const makeAdminDrizzleOps = (db: DrizzleDB) => {
    return {
        async getPendingRunners(): Promise<PendingRunner[]> {
            try {
                const pendingRunners = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.status, 'pending'));

                return pendingRunners.map((runner: any) => ({
                    id: runner.id as UUIDv7,
                    username: runner.username || '',
                    email: runner.email || '',
                    createdAt: runner.createdAt || new Date(),
                    role: 'user',
                    privyId: runner.privyId || '',
                    walletAddress: runner.walletAddress || '',
                    avatarUrl: runner.avatarUrl || ''
                }));
            } catch (error: unknown) {
                const originalMsg =
                    error instanceof Error ? error.message : String(error);
                console.error(`Failed to get pending runners: ${originalMsg}`);
                throw new DatabaseError('Failed to get pending runners', error);
            }
        },

        async getPendingRuns(): Promise<PendingRun[]> {
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

                return results.map((item: any) => ({
                    run: {
                        ...item.run,
                        id: item.run.id as UUIDv7,
                        runnerId: item.run.runnerId as UUIDv7,
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
            } catch (error: unknown) {
                console.error('Failed to get pending runs:', error);
                throw new DatabaseError('Failed to get pending runs');
            }
        },

        async approveRunner(userId: UUIDv7): Promise<User> {
            try {
                const results = await db.transaction(
                    async (tx: PgDatabase<any>) => {
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
                    }
                );

                return {
                    ...results[0],
                    id: results[0].id as UUIDv7
                };
            } catch (error: unknown) {
                if (error instanceof NotFoundError) {
                    throw error;
                }
                console.error('Error with approving runner:', error);
                throw new DatabaseError('Error with approving runner');
            }
        },

        async updateRunVerification(
            runId: UUIDv7,
            status: 'verified' | 'flagged'
        ): Promise<Run> {
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
                    rawDataJson: run.rawDataJson
                        ? ((typeof run.rawDataJson === 'string'
                              ? JSON.parse(run.rawDataJson)
                              : run.rawDataJson) as Record<string, unknown>)
                        : null
                };
            } catch (error: unknown) {
                if (error instanceof NotFoundError) {
                    throw error;
                }
                console.error('Error with updating run verification:', error);
                throw new DatabaseError('Error with updating run verification');
            }
        }
    };
};
