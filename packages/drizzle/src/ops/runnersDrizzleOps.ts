import { randomInt } from 'node:crypto';

import { eq, and, like, desc, asc, count } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { users, runners } from '../schema.js';

import type {
    UUIDv7,
    Runner,
    RunnerInsert,
    RunnerUpdate,
    RunnerProfile,
    RunnerQueryParams,
    PaginatedRunners
} from '@phyt/types';

const toRunner = (runnerRow: typeof runners.$inferSelect): Runner => ({
    id: runnerRow.id as UUIDv7,
    userId: runnerRow.userId as UUIDv7,
    totalDistance: runnerRow.totalDistance,
    averagePace: runnerRow.averagePace,
    totalRuns: runnerRow.totalRuns,
    bestMileTime: runnerRow.bestMileTime,
    status: runnerRow.status,
    isPooled: runnerRow.isPooled,
    runnerWallet: runnerRow.runnerWallet,
    createdAt: runnerRow.createdAt,
    updatedAt: runnerRow.updatedAt
});

const toRunnerProfile = (
    runner: typeof runners.$inferSelect,
    user: typeof users.$inferSelect
): RunnerProfile => ({
    ...toRunner(runner),
    username: user.username,
    avatarUrl: user.avatarUrl
});

export type RunnersDrizzleOps = ReturnType<typeof makeRunnersDrizzleOps>;

export const makeRunnersDrizzleOps = (db: DrizzleDB) => {
    const create = async (data: RunnerInsert): Promise<Runner> => {
        const [row] = await db
            .insert(runners)
            .values({
                ...data,
                id: uuidv7()
            })
            .returning();

        return toRunner(row);
    };

    const findById = async (runnerId: UUIDv7): Promise<RunnerProfile> => {
        const [result] = await db
            .select({
                runner: runners,
                user: users
            })
            .from(runners)
            .innerJoin(users, eq(runners.userId, users.id))
            .where(eq(runners.id, runnerId))
            .limit(1);

        return toRunnerProfile(result.runner, result.user);
    };

    const findByUserId = async (userId: UUIDv7): Promise<Runner> => {
        const [row] = await db
            .select()
            .from(runners)
            .where(eq(runners.userId, userId))
            .limit(1);

        return toRunner(row);
    };

    const findByPrivyId = async (privyId: string): Promise<RunnerProfile> => {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.privyId, privyId))
            .limit(1);

        const [result] = await db
            .select({
                runner: runners,
                user: users
            })
            .from(runners)
            .innerJoin(users, eq(runners.userId, users.id))
            .where(eq(runners.userId, user.id))
            .limit(1);

        return toRunnerProfile(result.runner, result.user);
    };

    const list = async (
        params: RunnerQueryParams
    ): Promise<PaginatedRunners<RunnerProfile>> => {
        const conditions = [eq(runners.status, 'active')];
        if (params.search) {
            conditions.push(like(users.username, `%${String(params.search)}%`));
        }

        const sortBy = params.sortBy ?? 'totalDistance';
        const sortOrder = params.sortOrder ?? 'desc';

        return paginate(and(...conditions), params, sortBy, sortOrder);
    };

    const update = async (
        runnerId: UUIDv7,
        data: RunnerUpdate
    ): Promise<Runner> => {
        const [row] = await db
            .update(runners)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(runners.id, runnerId))
            .returning();

        return toRunner(row);
    };

    const remove = async (runnerId: UUIDv7): Promise<Runner> => {
        const [row] = await db
            .delete(runners)
            .where(eq(runners.id, runnerId))
            .returning();

        return toRunner(row);
    };

    const findRandomRunner = async (): Promise<Runner> => {
        const allRunners = await db.select().from(runners);
        const randomIndex = randomInt(allRunners.length);
        const randomRunner = allRunners[randomIndex];

        return toRunner(randomRunner);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: RunnerQueryParams,
        sortBy = 'totalDistance',
        sortOrder = 'desc'
    ): Promise<PaginatedRunners<RunnerProfile>> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        const [{ total }] = await db
            .select({ total: count() })
            .from(runners)
            .innerJoin(users, eq(runners.userId, users.id))
            .where(cond);

        const query = db
            .select({
                runner: runners,
                user: users
            })
            .from(runners)
            .innerJoin(users, eq(runners.userId, users.id))
            .where(cond);

        let sortedQuery;
        if (sortOrder === 'desc') {
            switch (sortBy) {
                case 'username':
                    sortedQuery = query.orderBy(desc(users.username));
                    break;
                case 'totalDistance':
                    sortedQuery = query.orderBy(desc(runners.totalDistance));
                    break;
                case 'averagePace':
                    sortedQuery = query.orderBy(desc(runners.averagePace));
                    break;
                case 'totalRuns':
                    sortedQuery = query.orderBy(desc(runners.totalRuns));
                    break;
                case 'bestMileTime':
                    sortedQuery = query.orderBy(desc(runners.bestMileTime));
                    break;
                case 'createdAt':
                    sortedQuery = query.orderBy(desc(runners.createdAt));
                    break;
                default:
                    sortedQuery = query.orderBy(desc(runners.totalDistance));
            }
        } else {
            switch (sortBy) {
                case 'username':
                    sortedQuery = query.orderBy(asc(users.username));
                    break;
                case 'totalDistance':
                    sortedQuery = query.orderBy(asc(runners.totalDistance));
                    break;
                case 'averagePace':
                    sortedQuery = query.orderBy(asc(runners.averagePace));
                    break;
                case 'totalRuns':
                    sortedQuery = query.orderBy(asc(runners.totalRuns));
                    break;
                case 'bestMileTime':
                    sortedQuery = query.orderBy(asc(runners.bestMileTime));
                    break;
                case 'createdAt':
                    sortedQuery = query.orderBy(asc(runners.createdAt));
                    break;
                default:
                    sortedQuery = query.orderBy(asc(runners.totalDistance));
            }
        }

        const results = await sortedQuery.limit(limit).offset(offset);

        return {
            runners: results.map(({ runner, user }) =>
                toRunnerProfile(runner, user)
            ),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    return {
        create,
        findById,
        findByUserId,
        findByPrivyId,
        list,
        update,
        remove,
        findRandomRunner
    };
};
