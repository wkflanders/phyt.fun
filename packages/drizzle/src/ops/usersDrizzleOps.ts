import {
    eq,
    or,
    desc,
    count,
    isNull,
    and,
    InferSelectModel
} from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import {
    users,
    runners,
    cards,
    competitions,
    transactions
} from '../schema.js';

import type {
    UUIDv7,
    PrivyId,
    User,
    UserInsert,
    UserUpdate,
    UserQueryParams,
    PaginatedUsers,
    WalletAddress,
    Transaction,
    Card,
    RunnerStatus
} from '@phyt/types';

const toUser = ({
    userRow,
    status
}: {
    userRow: InferSelectModel<typeof users>;
    status?: RunnerStatus;
}): User => {
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
        updatedAt: userRow.updatedAt,
        deletedAt: userRow.deletedAt,
        ...(status !== undefined ? { status } : {})
    };
};

export type UsersDrizzleOps = ReturnType<typeof makeUsersDrizzleOps>;

export const makeUsersDrizzleOps = ({ db }: { db: DrizzleDB }) => {
    const create = async ({ input }: { input: UserInsert }): Promise<User> => {
        const [row] = await db
            .insert(users)
            .values({ ...input, id: uuidv7() })
            .returning();

        return toUser({ userRow: row });
    };

    const update = async ({
        userId,
        update
    }: {
        userId: UUIDv7;
        update: UserUpdate;
    }): Promise<User> => {
        const [row] = await db
            .update(users)
            .set({
                ...update,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        return toUser({ userRow: row });
    };

    const findByPrivyId = async ({
        privyId
    }: {
        privyId: PrivyId;
    }): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.privyId, privyId), isNull(users.deletedAt)));

        return toUser({ userRow: row });
    };

    const findByPrivyIdWithStatus = async ({
        privyId
    }: {
        privyId: PrivyId;
    }): Promise<User> => {
        const [row] = await db
            .select({
                user: users,
                status: runners.status
            })
            .from(users)
            .leftJoin(runners, eq(users.id, runners.userId))
            .where(and(eq(users.privyId, privyId), isNull(users.deletedAt)));

        return toUser({ userRow: row.user, status: row.status ?? undefined });
    };

    const findById = async ({ userId }: { userId: UUIDv7 }): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.id, userId), isNull(users.deletedAt)));

        return toUser({ userRow: row });
    };

    const findByIdWithStatus = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<User> => {
        const [row] = await db
            .select({
                user: users,
                status: runners.status
            })
            .from(users)
            .leftJoin(runners, eq(users.id, runners.userId))
            .where(and(eq(users.id, userId), isNull(users.deletedAt)));

        return toUser({
            userRow: row.user,
            status: row.status ?? 'inactive'
        });
    };

    const findByWalletAddress = async ({
        walletAddress
    }: {
        walletAddress: WalletAddress;
    }): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.walletAddress, walletAddress),
                    isNull(users.deletedAt)
                )
            );

        return toUser({ userRow: row });
    };

    const findByEmail = async ({ email }: { email: string }): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.email, email), isNull(users.deletedAt)));

        return toUser({ userRow: row });
    };

    const findByUsername = async ({
        username
    }: {
        username: string;
    }): Promise<User> => {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.username, username), isNull(users.deletedAt)));

        return toUser({ userRow: row });
    };

    const findTransactionById = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<Transaction[]> => {
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

    const findCardsById = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<Card[]> => {
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

    const listUsers = async ({
        params
    }: {
        params: UserQueryParams;
    }): Promise<PaginatedUsers> => {
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
                toUser({ userRow: row.user, status: row.status ?? 'inactive' })
            ),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    const remove = async ({ userId }: { userId: UUIDv7 }): Promise<User> => {
        const [row] = await db
            .update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return toUser({ userRow: row });
    };

    const unsafeRemove = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<User> => {
        const [row] = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning();
        return toUser({ userRow: row });
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
