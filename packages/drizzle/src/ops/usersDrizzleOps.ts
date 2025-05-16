import { eq, or } from 'drizzle-orm';

import { NotFoundError } from '@phyt/models';
import { User, UserInsert, UUIDv7, WalletAddress } from '@phyt/types';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { cards, competitions, transactions, users } from '../schema.js';

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
        const [row] = await db.insert(users).values(input).returning();
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

    return {
        create,
        findByPrivyId,
        findByWalletAddress,
        findById,
        findByEmail,
        findByUsername,
        findTransactionById,
        findCardsById
    };
};
