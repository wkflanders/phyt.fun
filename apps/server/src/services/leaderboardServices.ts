import {
    db,
    eq,
    desc,
    and,
    gt,
    runner_leaderboard,
    manager_leaderboard,
    runners,
    users,
    count,
    gte
} from '@phyt/database';
import {
    DatabaseError,
    RunnerStanding,
    RunnerProfile,
    ManagerStanding,
    RunnerLeaderboard,
    ManagerLeaderboard,
    LeaderboardQueryParams,
    User,
    RunnerStatus
} from '@phyt/types';
import { subDays } from 'date-fns';

import { runnerService } from './runnerServices';
import { userService } from './userServices';

interface LeaderboardParams {
    page?: number;
    limit?: number;
    timeFrame?: 'weekly' | 'monthly' | 'allTime';
}

export const leaderboardService = {
    getRunnerStanding: async (
        id: string | number,
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
                runner = await runnerService.getRunnerByPrivyId(id as string);
            } else {
                runner = await runnerService.getRunnerById(id as number);
            }

            if (!runner) {
                throw new Error('Runner not found');
            }

            const [leaderboardEntry] = await db
                .select()
                .from(runner_leaderboard)
                .where(
                    and(
                        eq(runner_leaderboard.runner_id, runner.id),
                        gte(runner_leaderboard.updated_at, startDate)
                    )
                )
                .limit(1);

            if (!leaderboardEntry) {
                throw new Error(
                    'Leaderboard entry not found for the given timeframe'
                );
            }

            return {
                id: runner.id,
                runner: runner as RunnerProfile,
                ranking: leaderboardEntry.ranking,
                updated_at: runner.updated_at,
                created_at: runner.created_at
            };
        } catch (error) {
            console.error('Error getting runner standing by id:', error);
            throw error;
        }
    },

    getManagerStanding: async (
        id: string | number,
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
                user = await userService.getUserByPrivyId(id as string);
            } else {
                user = await userService.getUserById(id as number);
            }

            if (!user) {
                throw new Error('User not found');
            }

            const [leaderboardEntry] = await db
                .select()
                .from(manager_leaderboard)
                .where(
                    and(
                        eq(manager_leaderboard.user_id, user.id),
                        gte(manager_leaderboard.updated_at, startDate)
                    )
                )
                .limit(1);

            if (!leaderboardEntry) {
                throw new Error(
                    'Leaderboard entry not found for the given timeframe'
                );
            }

            return {
                id: user.id,
                user: user as User,
                ranking: leaderboardEntry.ranking,
                updated_at: user.updated_at,
                created_at: user.created_at
            };
        } catch (error) {
            console.error('Error getting manager standing by id:', error);
            throw error;
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
                .from(runner_leaderboard)
                .where(gte(runner_leaderboard.updated_at, startDate))
                .orderBy(runner_leaderboard.ranking)
                .limit(limit)
                .offset(offset);

            const results = await Promise.all(
                leaderboardEntries.map(async (entry) => {
                    const runner = await runnerService.getRunnerById(
                        entry.runner_id
                    );
                    if (!runner) {
                        throw new Error(
                            `Runner with id ${entry.runner_id} not found`
                        );
                    }
                    return {
                        id: runner.id,
                        runner: runner as RunnerProfile,
                        ranking: entry.ranking,
                        updated_at: runner.updated_at,
                        created_at: runner.created_at
                    };
                })
            );

            const [{ value: totalRunners }] = await db
                .select({
                    value: count()
                })
                .from(runner_leaderboard)
                .where(gte(runner_leaderboard.updated_at, startDate));

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
            console.error('Error getting runner leaderboard:', error);
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
                .from(manager_leaderboard)
                .where(gte(manager_leaderboard.updated_at, startDate))
                .orderBy(manager_leaderboard.ranking)
                .limit(limit)
                .offset(offset);

            const results = await Promise.all(
                leaderboardEntries.map(async (entry) => {
                    const user = await userService.getUserById(entry.user_id);
                    if (!user) {
                        throw new Error(
                            `User with id ${entry.user_id} not found`
                        );
                    }
                    return {
                        id: user.id,
                        user: user as User,
                        ranking: entry.ranking,
                        updated_at: user.updated_at,
                        created_at: user.created_at
                    };
                })
            );

            const [{ value: totalManagers }] = await db
                .select({
                    value: count()
                })
                .from(manager_leaderboard)
                .where(gte(manager_leaderboard.updated_at, startDate));

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
            console.error('Error getting manager leaderboard:', error);
            throw new DatabaseError('Failed to get manager leaderboard');
        }
    },

    updateLeaderboards: async () => {
        try {
            // await db.transaction(async (tx) => {
            //     await tx.delete(runner_leaderboard);
            //     const runnerRankings = await tx
            //         .select({
            //             id: runners.id,
            //         })
            //         .from(runners)
            //         .where(eq(runners.status, 'active'))
            //         .orderBy(desc(runners.total_distance_m));
            //     // Insert new rankings
            //     await Promise.all(runnerRankings.map((runner, index) =>
            //         tx.insert(runner_leaderboard).values({
            //             runner_id: runner.id,
            //             ranking: index + 1
            //         })
            //     ));
            // });
            // await db.transaction(async (tx) => {
            //     await tx.delete(manager_leaderboard);
            //     const managerRankings = await tx
            //         .select({
            //             id: users.id,
            //         })
            //         .from(users)
            //         .where(eq(users.role, 'user'))
            //         .orderBy(desc(users.phytness_points));
            //     await Promise.all(managerRankings.map((user, index) =>
            //         tx.insert(manager_leaderboard).values({
            //             user_id: user.id,
            //             ranking: index + 1
            //         })
            //     ));
            // });
            // return { success: true };
        } catch (error) {
            console.error('Error updating leaderboards:', error);
            throw new DatabaseError('Failed to update leaderboards');
        }
    }
};
