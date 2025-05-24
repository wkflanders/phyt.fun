import { eq, or, desc, count, isNull, and } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

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
    UUIDv7,
    User,
    UserWithStatus,
    UserInsert,
    UserUpdate,
    UserQueryParams,
    PaginatedUsers,
    WalletAddress,
    Transaction,
    Card,
    RunnerStatus
} from '@phyt/types';

const toUser = (userRow: typeof users.$inferSelect): User => {
    return {
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
    };
};

const toUserWithStatus = (
    userRow: typeof users.$inferSelect,
    status: RunnerStatus
): UserWithStatus => {
    return {
        ...toUser(userRow),
        status
    };
};

export type UsersDrizzleOps = ReturnType<typeof makeUsersDrizzleOps>;

export const makeUsersDrizzleOps = (db: DrizzleDB) => {
    const create = async (data: UserInsert): Promise<User> => {
        const [row] = await db
            .insert(users)
            .values({ ...data, id: uuidv7() })
            .returning();

        return toUser(row);
    };

    const update = async (userId: UUIDv7, data: UserUpdate): Promise<User> => {
        const [row] = await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        return toUser(row);
    };

    const findByPrivyId = async (privyId: string): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.privyId, privyId), isNull(users.deletedAt)));

        return toUser(row);
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
            .where(and(eq(users.privyId, privyId), isNull(users.deletedAt)));

        return toUserWithStatus(row.user, row.status ?? 'inactive');
    };

    const findById = async (userId: UUIDv7): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.id, userId), isNull(users.deletedAt)));

        return toUser(row);
    };

    const findByIdWithStatus = async (
        userId: UUIDv7
    ): Promise<UserWithStatus> => {
        const [row] = await db
            .select({
                user: users,
                status: runners.status
            })
            .from(users)
            .leftJoin(runners, eq(users.id, runners.userId))
            .where(and(eq(users.id, userId), isNull(users.deletedAt)));

        return toUserWithStatus(row.user, row.status ?? 'inactive');
    };

    const findByWalletAddress = async (
        walletAddress: string
    ): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.walletAddress, walletAddress),
                    isNull(users.deletedAt)
                )
            );

        return toUser(row);
    };

    const findByEmail = async (email: string): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.email, email), isNull(users.deletedAt)));

        return toUser(row);
    };

    const findByUsername = async (username: string): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.username, username), isNull(users.deletedAt)));

        return toUser(row);
    };

    const findTransactionById = async (
        userId: UUIDv7
    ): Promise<Transaction[]> => {
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
        return rows.map((row) => ({
            id: row.transactions.id as UUIDv7,
            fromUserId: row.transactions.fromUserId as UUIDv7,
            toUserId: row.transactions.toUserId as UUIDv7,
            cardId: row.transactions.cardId as UUIDv7,
            competitionId: row.transactions.competitionId as UUIDv7 | null,
            packPurchaseId: row.transactions.packPurchaseId as UUIDv7 | null,
            price: row.transactions.price,
            transactionType: row.transactions.transactionType,
            status: row.transactions.status,
            hash: row.transactions.hash,
            createdAt: row.transactions.createdAt,
            updatedAt: row.transactions.updatedAt
        }));
    };

    const findCardsById = async (userId: string): Promise<Card[]> => {
        const rows = await db
            .select()
            .from(cards)
            .where(eq(cards.ownerId, userId));
        return rows.map((row) => ({
            id: row.id as UUIDv7,
            ownerId: row.ownerId as UUIDv7,
            packPurchaseId: row.packPurchaseId as UUIDv7,
            tokenId: row.tokenId,
            acquisitionType: row.acquisitionType,
            isBurned: row.isBurned,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }));
    };

    const listUsers = async (
        params: UserQueryParams
    ): Promise<PaginatedUsers> => {
        return paginate(isNull(users.deletedAt), params);
    };

    const findWhitelistedWallets = async (): Promise<WalletAddress[]> => {
        const rows = await db
            .select({ walletAddress: users.walletAddress })
            .from(users)
            .where(isNull(users.deletedAt));
        return rows.map((row) => row.walletAddress as WalletAddress);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof or>,
        params: UserQueryParams
    ): Promise<PaginatedUsers> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        const [{ total }] = await db
            .select({ total: count() })
            .from(users)
            .where(cond);

        const rows = await db
            .select({
                user: users,
                status: runners.status
            })
            .from(users)
            .leftJoin(runners, eq(users.id, runners.userId))
            .where(cond)
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);

        return {
            users: rows.map((row) =>
                toUserWithStatus(row.user, row.status ?? 'inactive')
            ),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    const remove = async (userId: UUIDv7): Promise<User> => {
        const [row] = await db
            .update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return toUser(row);
    };

    const unsafeRemove = async (userId: UUIDv7): Promise<User> => {
        const [row] = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning();
        return toUser(row);
    };

    return {
        create,
        update,
        findByPrivyId,
        findByPrivyIdWithStatus,
        findByWalletAddress,
        findByEmail,
        findByUsername,
        findById,
        findByIdWithStatus,
        findTransactionById,
        findCardsById,
        listUsers,
        findWhitelistedWallets,
        remove,
        unsafeRemove
    };
};
