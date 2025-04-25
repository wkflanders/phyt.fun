import {
    db,
    eq,
    and,
    runnerLeaderboard,
    managerLeaderboard,
    count,
    gte
} from '@phyt/database';
import {
    UUIDv7,
    RunnerStanding,
    ManagerStanding,
    RunnerLeaderboard,
    ManagerLeaderboard,
    DatabaseError,
    NotFoundError
} from '@phyt/types';
import { subDays } from 'date-fns';

import { runnerService } from './runnerServices.js';
import { userService } from './userServices.js';

interface LeaderboardParams {
    page?: number;
    limit?: number;
    timeFrame?: 'weekly' | 'monthly' | 'allTime';
}

export const leaderboardService = {
    getRunnerStanding: async (
        id: UUIDv7 | string,
        privy: boolean,
        { timeFrame = 'weekly' }: Pick<LeaderboardParams, 'timeFrame'> = {}
    ): Promise<RunnerStanding> => {
        try {
            const now = new Date();
            let startDate;

            switch (timeFrame) {
                case 'weekly':
                    startDate = subDays(now, 7);
                    break;
                case 'monthly':
                    startDate = subDays(now, 30);
                    break;
                case 'allTime':
                    startDate = new Date(0);
                    break;
                default:
                    startDate = subDays(now, 7);
            }

            let runner;
            if (privy) {
                runner = await runnerService.getRunnerByPrivyId(id);
            } else {
                runner = await runnerService.getRunnerById(id as UUIDv7);
            }

            const leaderboardResults = await db
                .select()
                .from(runnerLeaderboard)
                .where(
                    and(
                        eq(runnerLeaderboard.runnerId, runner.id),
                        gte(runnerLeaderboard.updatedAt, startDate)
                    )
                )
                .limit(1);

            if (leaderboardResults.length === 0) {
                throw new NotFoundError(
                    'Leaderboard entry not found for the given timeframe'
                );
            }

            return {
                id: runner.id,
                runner: runner,
                ranking: leaderboardResults[0].ranking,
                updatedAt: runner.updatedAt,
                createdAt: runner.createdAt
            };
        } catch (error) {
            console.error('Error with getRunnerStanding ', error);
            throw new DatabaseError('Error getting runner standings');
        }
    },

    getManagerStanding: async (
        id: string | UUIDv7,
        privy: boolean,
        { timeFrame = 'weekly' }: Pick<LeaderboardParams, 'timeFrame'> = {}
    ): Promise<ManagerStanding> => {
        try {
            const now = new Date();
            let startDate;

            switch (timeFrame) {
                case 'weekly':
                    startDate = subDays(now, 7);
                    break;
                case 'monthly':
                    startDate = subDays(now, 30);
                    break;
                case 'allTime':
                    startDate = new Date(0);
                    break;
                default:
                    startDate = subDays(now, 7);
            }

            let user;
            if (privy) {
                user = await userService.getUserByPrivyId(id);
            } else {
                user = await userService.getUserById(id as UUIDv7);
            }

            const leaderboardResults = await db
                .select()
                .from(managerLeaderboard)
                .where(
                    and(
                        eq(managerLeaderboard.userId, user.id),
                        gte(managerLeaderboard.updatedAt, startDate)
                    )
                )
                .limit(1);

            if (leaderboardResults.length === 0) {
                throw new NotFoundError(
                    'Leaderboard entry not found for the given timeframe'
                );
            }

            return {
                id: user.id,
                user: user,
                ranking: leaderboardResults[0].ranking,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt
            };
        } catch (error) {
            console.error('Error with getManagerStanding ', error);
            throw new DatabaseError('Error getting manager standings');
        }
    },

    getRunnerLeaderboard: async ({
        page = 1,
        limit = 20,
        timeFrame = 'weekly'
    }: LeaderboardParams = {}): Promise<RunnerLeaderboard> => {
        try {
            const offset = (page - 1) * limit;

            const now = new Date();
            let startDate;

            switch (timeFrame) {
                case 'weekly':
                    startDate = subDays(now, 7);
                    break;
                case 'monthly':
                    startDate = subDays(now, 30);
                    break;
                case 'allTime':
                    startDate = new Date(0);
                    break;
                default:
                    startDate = subDays(now, 7);
            }

            const leaderboardEntries = await db
                .select()
                .from(runnerLeaderboard)
                .where(gte(runnerLeaderboard.updatedAt, startDate))
                .orderBy(runnerLeaderboard.ranking)
                .limit(limit)
                .offset(offset);

            const results = await Promise.all(
                leaderboardEntries.map(async (entry) => {
                    const runner = await runnerService.getRunnerById(
                        entry.runnerId as UUIDv7
                    );

                    return {
                        id: runner.id,
                        runner: runner,
                        ranking: entry.ranking,
                        updatedAt: runner.updatedAt,
                        createdAt: runner.createdAt
                    };
                })
            );

            const [{ value: totalRunners }] = await db
                .select({
                    value: count()
                })
                .from(runnerLeaderboard)
                .where(gte(runnerLeaderboard.updatedAt, startDate));

            return {
                standings: results,
                pagination: {
                    page,
                    limit,
                    total: Number(totalRunners),
                    totalPages: Math.ceil(Number(totalRunners) / limit)
                }
            };
        } catch (error) {
            console.error('Error with getRunnerLeaderboard ', error);
            throw new DatabaseError('Failed to get runner leaderboard');
        }
    },

    getManagerLeaderboard: async ({
        page = 1,
        limit = 20,
        timeFrame = 'weekly'
    }: LeaderboardParams = {}): Promise<ManagerLeaderboard> => {
        try {
            const offset = (page - 1) * limit;

            const now = new Date();
            let startDate;

            switch (timeFrame) {
                case 'weekly':
                    startDate = subDays(now, 7);
                    break;
                case 'monthly':
                    startDate = subDays(now, 30);
                    break;
                case 'allTime':
                    startDate = new Date(0);
                    break;
                default:
                    startDate = subDays(now, 7);
            }

            const leaderboardEntries = await db
                .select()
                .from(managerLeaderboard)
                .where(gte(managerLeaderboard.updatedAt, startDate))
                .orderBy(managerLeaderboard.ranking)
                .limit(limit)
                .offset(offset);

            const results = await Promise.all(
                leaderboardEntries.map(async (entry) => {
                    const user = await userService.getUserById(
                        entry.userId as UUIDv7
                    );

                    return {
                        id: user.id,
                        user: user,
                        ranking: entry.ranking,
                        updatedAt: user.updatedAt,
                        createdAt: user.createdAt
                    };
                })
            );

            const [{ value: totalManagers }] = await db
                .select({
                    value: count()
                })
                .from(managerLeaderboard)
                .where(gte(managerLeaderboard.updatedAt, startDate));

            return {
                standings: results,
                pagination: {
                    page,
                    limit,
                    total: Number(totalManagers),
                    totalPages: Math.ceil(Number(totalManagers) / limit)
                }
            };
        } catch (error) {
            console.error('Error with getManagerLeaderboard ', error);
            throw new DatabaseError('Failed to get manager leaderboard');
        }
    }

    // updateLeaderboards: async () => {
    //     try {
    // await db.transaction(async (tx) => {
    //     await tx.delete(runnerLeaderboard);
    //     const runnerRankings = await tx
    //         .select({
    //             id: runners.id,
    //         })
    //         .from(runners)
    //         .where(eq(runners.status, 'active'))
    //         .orderBy(desc(runners.total_distance_m));
    //     // Insert new rankings
    //     await Promise.all(runnerRankings.map((runner, index) =>
    //         tx.insert(runnerLeaderboard).values({
    //             runner_id: runner.id,
    //             ranking: index + 1
    //         })
    //     ));
    // });
    // await db.transaction(async (tx) => {
    //     await tx.delete(managerLeaderboard);
    //     const managerRankings = await tx
    //         .select({
    //             id: users.id,
    //         })
    //         .from(users)
    //         .where(eq(users.role, 'user'))
    //         .orderBy(desc(users.phytness_points));
    //     await Promise.all(managerRankings.map((user, index) =>
    //         tx.insert(managerLeaderboard).values({
    //             userId: user.id,
    //             ranking: index + 1
    //         })
    //     ));
    // });
    // return { success: true };
    //     } catch (error) {
    //         console.error('Error updating leaderboards:', error);
    //         throw new DatabaseError('Failed to update leaderboards');
    //     }
    // }
};
