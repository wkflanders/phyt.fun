import { db, eq, or, desc } from '@phyt/database';
import { users, transactions } from '@phyt/database';
import { DatabaseError, NotFoundError, DuplicateError, ValidationError } from '@phyt/types';

export const userService = {
    getUserByPrivyId: async (privyId: string) => {
        if (!privyId) throw new ValidationError('Privy ID is required');

        try {
            const [user] = await db.select()
                .from(users)
                .where(eq(users.privy_id, privyId))
                .limit(1);
            if (!user) throw new NotFoundError('User not found');
            return user;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            throw new DatabaseError('Failed to fetch user by Privy ID');
        }
    },

    getUserByEmail: async (email: string) => {
        if (!email) throw new ValidationError('Email is required');

        try {
            const [user] = await db.select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);
            if (!user) throw new NotFoundError('User not found');
            return user;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            throw new DatabaseError('Failed to fetch user by email');
        }
    },

    getUserByUsername: async (username: string) => {
        if (!username) throw new ValidationError('Username is required');

        try {
            const [user] = await db.select()
                .from(users)
                .where(eq(users.username, username))
                .limit(1);
            if (!user) throw new NotFoundError('User not found');
            return user;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            throw new DatabaseError('Failed to fetch user by username');
        }
    },

    getTransactionsByPrivyId: async (privyId: string) => {
        if (!privyId) throw new ValidationError('Username is required');
        try {
            const [user] = await db.select()
                .from(users)
                .where(eq(users.privy_id, privyId))
                .limit(1);
            if (!user) throw new NotFoundError('User not found');

            // Fetch transactions for the user (both sent and received)
            const userTransactions = await db.select()
                .from(transactions)
                .where(
                    or(
                        eq(transactions.from_user_id, user.id),
                        eq(transactions.to_user_id, user.id)
                    ),
                )
                .orderBy(desc(transactions.created_at));

            return userTransactions;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            throw new DatabaseError('Failed to fetch user transactions');
        }
    },

    createUser: async (userData: {
        email: string;
        username: string;
        avatar_url?: string;
        privy_id: string;
        wallet_address?: string;
    }) => {
        if (!userData.email || !userData.username || !userData.privy_id) {
            throw new ValidationError('Email, username, and Privy ID are required');
        }

        try {
            const existingEmail = await userService.getUserByEmail(userData.email)
                .catch(error => {
                    if (error instanceof NotFoundError) return null;
                    throw error;
                });

            if (existingEmail) {
                throw new DuplicateError('Email already registered');
            }

            const existingUsername = await userService.getUserByUsername(userData.username)
                .catch(error => {
                    if (error instanceof NotFoundError) return null;
                    throw error;
                });

            if (existingUsername) {
                throw new DuplicateError('Username already taken');
            }

            const [newUser] = await db.insert(users)
                .values({
                    ...userData,
                    avatar_url: userData.avatar_url || 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
                    role: 'user'
                })
                .returning();
            return newUser;
        } catch (error) {
            if (error instanceof DuplicateError || error instanceof ValidationError) throw error;
            throw new DatabaseError('Failed to create user');
        }
    }
};