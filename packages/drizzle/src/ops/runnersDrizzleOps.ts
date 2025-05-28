import { randomInt } from 'node:crypto';

import {
    eq,
    and,
    like,
    desc,
    asc,
    count,
    isNull,
    InferSelectModel
} from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { users, runners } from '../schema.js';

import type {
    UUIDv7,
    PrivyId,
    Runner,
    RunnerInsert,
    RunnerUpdate,
    RunnerQueryParams,
    PaginatedRunners,
    AvatarUrl,
    WalletAddress
} from '@phyt/types';

const toRunner = ({
    runnerRow,
    username,
    avatarUrl
}: {
    runnerRow: InferSelectModel<typeof runners>;
    username?: string;
    avatarUrl?: AvatarUrl;
}): Runner => ({
    id: runnerRow.id as UUIDv7,
    userId: runnerRow.userId as UUIDv7,
    totalDistance: runnerRow.totalDistance,
    averagePace: runnerRow.averagePace,
    totalRuns: runnerRow.totalRuns,
    bestMileTime: runnerRow.bestMileTime,
    status: runnerRow.status,
    isPooled: runnerRow.isPooled,
    runnerWallet: runnerRow.runnerWallet as WalletAddress,
    createdAt: runnerRow.createdAt,
    updatedAt: runnerRow.updatedAt,
    deletedAt: runnerRow.deletedAt,
    ...(username !== undefined ? { username } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {})
});

export type RunnersDrizzleOps = ReturnType<typeof makeRunnersDrizzleOps>;

export const makeRunnersDrizzleOps = ({ db }: { db: DrizzleDB }) => {
    const create = async ({
        input
    }: {
        input: RunnerInsert;
    }): Promise<Runner> => {
        const [row] = await db
            .insert(runners)
            .values({
                ...input,
                id: uuidv7()
            })
            .returning();

        return toRunner({ runnerRow: row });
    };

    const findById = async ({
        runnerId
    }: {
        runnerId: UUIDv7;
    }): Promise<Runner> => {
        const [result] = await db
            .select({
                runner: runners,
                user: users
            })
            .from(runners)
            .innerJoin(users, eq(runners.userId, users.id))
            .where(
                and(
                    eq(runners.id, runnerId),
                    isNull(runners.deletedAt),
                    isNull(users.deletedAt)
                )
            )
            .limit(1);

        return toRunner({
            runnerRow: result.runner,
            username: result.user.username,
            avatarUrl: result.user.avatarUrl
        });
    };

    const findByUserId = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<Runner> => {
        const [row] = await db
            .select()
            .from(runners)
            .where(and(eq(runners.userId, userId), isNull(runners.deletedAt)))
            .limit(1);

        return toRunner({ runnerRow: row });
    };

    const findByPrivyId = async ({
        privyId
    }: {
        privyId: PrivyId;
    }): Promise<Runner> => {
        const [user] = await db
            .select()
            .from(users)
            .where(and(eq(users.privyId, privyId), isNull(users.deletedAt)))
            .limit(1);

        const [result] = await db
            .select({
                runner: runners,
                user: users
            })
            .from(runners)
            .innerJoin(users, eq(runners.userId, users.id))
            .where(
                and(
                    eq(runners.userId, user.id),
                    isNull(runners.deletedAt),
                    isNull(users.deletedAt)
                )
            )
            .limit(1);

        return toRunner({
            runnerRow: result.runner,
            username: result.user.username,
            avatarUrl: result.user.avatarUrl
        });
    };

    const list = async ({
        params
    }: {
        params: RunnerQueryParams;
    }): Promise<PaginatedRunners> => {
        const conditions = [
            eq(runners.status, 'active'),
            isNull(runners.deletedAt),
            isNull(users.deletedAt)
        ];
        if (params.search) {
            conditions.push(like(users.username, `%${String(params.search)}%`));
        }

        return paginate(and(...conditions), params);
    };

    const update = async ({
        runnerId,
        update
    }: {
        runnerId: UUIDv7;
        update: RunnerUpdate;
    }): Promise<Runner> => {
        const [row] = await db
            .update(runners)
            .set({
                ...update,
                updatedAt: new Date()
            })
            .where(eq(runners.id, runnerId))
            .returning();

        return toRunner({ runnerRow: row });
    };

    const findRandomRunner = async (): Promise<Runner> => {
        const allRunners = await db
            .select()
            .from(runners)
            .where(isNull(runners.deletedAt));
        const randomIndex = randomInt(allRunners.length);
        const randomRunner = allRunners[randomIndex];

        return toRunner({ runnerRow: randomRunner });
    };

    const remove = async ({
        runnerId
    }: {
        runnerId: UUIDv7;
    }): Promise<Runner> => {
        const [row] = await db
            .update(runners)
            .set({ deletedAt: new Date() })
            .where(eq(runners.id, runnerId))
            .returning();

        return toRunner({ runnerRow: row });
    };

    const unsafeRemove = async ({
        runnerId
    }: {
        runnerId: UUIDv7;
    }): Promise<Runner> => {
        const [row] = await db
            .delete(runners)
            .where(eq(runners.id, runnerId))
            .returning();

        return toRunner({ runnerRow: row });
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: RunnerQueryParams
    ): Promise<PaginatedRunners> => {
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

        // Condensed sorting logic
        const sortColumns = {
            username: users.username,
            totalDistance: runners.totalDistance,
            averagePace: runners.averagePace,
            totalRuns: runners.totalRuns,
            bestMileTime: runners.bestMileTime,
            createdAt: runners.createdAt
        };
        const sortBy =
            params.sortBy && params.sortBy in sortColumns
                ? params.sortBy
                : 'totalDistance';
        const column = sortColumns[sortBy];
        const orderFn = params.sortOrder === 'desc' ? desc : asc;
        const sortedQuery = query.orderBy(orderFn(column));

        const results = await sortedQuery.limit(limit).offset(offset);

        return {
            runners: results.map(({ runner, user }) =>
                toRunner({
                    runnerRow: runner,
                    username: user.username,
                    avatarUrl: user.avatarUrl
                })
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
        findRandomRunner,
        remove,
        unsafeRemove
    };
};
