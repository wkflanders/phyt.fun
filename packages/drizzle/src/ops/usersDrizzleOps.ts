import { eq, or, desc, count } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

import { NotFoundError } from '@phyt/models';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import {
    cards,
    competitions,
    transactions,
    users,
    runners
} from '../schema.js';

import type {
    User,
    UserInsert,
    UUIDv7,
    WalletAddress,
    UserQueryParams,
    PaginatedUsers,
    UserWithStatus,
    RunnerStatus
} from '@phyt/types';

const toData = (userRow: typeof users.$inferSelect): User => ({
    id: userRow.id as UUIDv7,
    email: userRow.email,
    username: userRow.username,
    role: userRow.role,
    privyId: userRow.privyId,
    avatarUrl: userRow.avatarUrl,
    walletAddress: userRow.walletAddress as WalletAddress,
    phytnessPoints: userRow.phytnessPoints,
    twitterHandle: userRow.twitterHandle,
    stravaHandle: userRow.stravaHandle,
    createdAt: userRow.createdAt,
    updatedAt: userRow.updatedAt
});

export type UsersDrizzleOps = ReturnType<typeof makeUsersDrizzleOps>;

export const makeUsersDrizzleOps = (db: DrizzleDB) => {
    const create = async (input: UserInsert): Promise<User> => {
        const [row] = await db
            .insert(users)
            .values({ ...input, id: uuidv7() })
            .returning();
        return toData(row);
    };

    const findByPrivyId = async (privyId: string): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(eq(users.privyId, privyId));
        if (!row) throw new NotFoundError('User not found');
        return toData(row);
    };

    const findByPrivyIdWithStatus = async (
        privyId: string
    ): Promise<UserWithStatus> => {
        const [row] = await db
            .select({
                user: users,
                status: runners.status
            })
            .from(users)
            .leftJoin(runners, eq(users.id, runners.userId))
            .where(eq(users.privyId, privyId));

        if (!row) throw new NotFoundError('User not found');

        return {
            ...toData(row.user),
            status: row.status as RunnerStatus | undefined
        };
    };

    const findByIdWithStatus = async (userId: UUIDv7) => {
        const [row] = await db
            .select({
                user: users,
                status: runners.status
            })
            .from(users)
            .leftJoin(runners, eq(users.id, runners.userId))
            .where(eq(users.id, userId));

        if (!row) throw new NotFoundError('User not found');

        return {
            ...toData(row.user),
            status: row.status as RunnerStatus | undefined
        };
    };

    const findByWalletAddress = async (walletAddress: string) => {
        const [row] = await db
            .select()
            .from(users)
            .where(eq(users.walletAddress, walletAddress));
        if (!row) throw new NotFoundError('User not found');
        return toData(row);
    };

    const findById = async (userId: UUIDv7) => {
        const [row] = await db.select().from(users).where(eq(users.id, userId));
        if (!row) throw new NotFoundError('User not found');
        return toData(row);
    };

    const findByEmail = async (email: string) => {
        const [row] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        if (!row) throw new NotFoundError('User not found');
        return toData(row);
    };

    const findByUsername = async (username: string) => {
        const [row] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));
        if (!row) throw new NotFoundError('User not found');
        return toData(row);
    };

    const findTransactionById = async (userId: UUIDv7) => {
        const rows = await db
            .select()
            .from(transactions)
            .leftJoin(users, eq(transactions.fromUserId, users.id))
            .leftJoin(users, eq(transactions.toUserId, users.id))
            .leftJoin(cards, eq(transactions.cardId, cards.id))
            .leftJoin(
                competitions,
                eq(transactions.competitionId, competitions.id)
            )
            .where(
                or(
                    eq(transactions.toUserId, userId),
                    eq(transactions.fromUserId, userId)
                )
            );
        return rows;
    };

    const findCardsById = async (userId: string) => {
        const rows = await db
            .select()
            .from(cards)
            .where(eq(cards.ownerId, userId));
        return rows;
    };

    const updateProfile = async (
        userId: UUIDv7,
        data: { twitterHandle?: string | null; stravaHandle?: string | null }
    ) => {
        const [row] = await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        if (!row) throw new NotFoundError('User not found');
        return toData(row);
    };

    const updateAvatar = async (userId: UUIDv7, avatarUrl: string) => {
        const [row] = await db
            .update(users)
            .set({
                avatarUrl,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        if (!row) throw new NotFoundError('User not found');
        return toData(row);
    };

    const listUsers = async (
        params: UserQueryParams
    ): Promise<PaginatedUsers> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        const [{ value: total }] = await db
            .select({ value: count() })
            .from(users);

        const rows = await db
            .select({
                user: users,
                status: runners.status
            })
            .from(users)
            .leftJoin(runners, eq(users.id, runners.userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(users.createdAt));

        const totalPages = Math.ceil(total / limit);

        return {
            users: rows.map((row) => ({
                ...toData(row.user),
                status: row.status as RunnerStatus | undefined
            })),
            pagination: {
                total: total as number,
                page,
                limit,
                totalPages
            }
        };
    };

    const findWhitelistedWallets = async (): Promise<string[]> => {
        const records = await db
            .select({ walletAddress: users.walletAddress })
            .from(users);
        return records.map((r) => r.walletAddress.toLowerCase());
    };

    return {
        create,
        findByPrivyId,
        findByPrivyIdWithStatus,
        findByWalletAddress,
        findById,
        findByEmail,
        findByUsername,
        findTransactionById,
        findCardsById,
        updateProfile,
        updateAvatar,
        listUsers,
        findByIdWithStatus,
        findWhitelistedWallets
    };
};
