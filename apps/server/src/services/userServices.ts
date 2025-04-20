import {
    db,
    eq,
    or,
    desc,
    users,
    transactions,
    cards,
    card_metadata,
    runners
} from '@phyt/database';
import {
    DatabaseError,
    NotFoundError,
    DuplicateError,
    ValidationError,
    CardWithMetadata,
    User,
    UserWithStatus,
    Transaction
} from '@phyt/types';

import { s3Service } from '@/lib/awsClient.js';

const DEFAULT_AVATAR =
    'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export const userService = {
    getUserByPrivyId: async (
        privyId: string,
        checkStatus = false
    ): Promise<UserWithStatus | User> => {
        if (!privyId) throw new ValidationError('Privy ID is required');

        try {
            if (checkStatus) {
                const userResults = await db
                    .select()
                    .from(users)
                    .where(eq(users.privy_id, privyId))
                    .limit(1);

                if (userResults.length === 0)
                    throw new NotFoundError('User not found');
                const user = userResults[0];

                const [runner] = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.user_id, user.id));

                return {
                    ...user,
                    status: runner.status
                };
            } else {
                const userResults = await db
                    .select()
                    .from(users)
                    .where(eq(users.privy_id, privyId))
                    .limit(1);

                if (userResults.length === 0)
                    throw new NotFoundError('User not found');
                return userResults[0];
            }
        } catch (error) {
            console.error('Error with getUserByPrivyId: ', error);
            throw new DatabaseError('Failed to fetch user by Privy ID');
        }
    },

    getUserByWalletAddress: async (walletAddress: string): Promise<User> => {
        if (!walletAddress)
            throw new ValidationError('Wallet address is required');

        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.wallet_address, walletAddress))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');
            return userResults[0];
        } catch (error) {
            console.error('Error with getUserByWalletAddress: ', error);
            throw new DatabaseError('Failed to fetch user by wallet address');
        }
    },

    getUserById: async (id: number): Promise<User> => {
        if (!id) throw new ValidationError('User id is required');

        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');
            return userResults[0];
        } catch (error) {
            console.error('Error with getUserById: ', error);
            throw new DatabaseError('Failed to fetch user by ID');
        }
    },

    getUserByEmail: async (email: string): Promise<User> => {
        if (!email) throw new ValidationError('Email is required');

        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');
            return userResults[0];
        } catch (error) {
            console.error('Error with getUserByEmail: ', error);
            throw new DatabaseError('Failed to fetch user by email');
        }
    },

    getUserByUsername: async (username: string): Promise<User> => {
        if (!username) throw new ValidationError('Username is required');

        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.username, username))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');
            return userResults[0];
        } catch (error) {
            console.error('Error with getUserByUsername: ', error);
            throw new DatabaseError('Failed to fetch user by username');
        }
    },

    getTransactionsByPrivyId: async (
        privyId: string
    ): Promise<Transaction[]> => {
        if (!privyId) throw new ValidationError('Privy ID is required');

        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.privy_id, privyId))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');
            const user = userResults[0];
            // Fetch transactions for the user (both sent and received)
            const userTransactions = await db
                .select()
                .from(transactions)
                .where(
                    or(
                        eq(transactions.from_user_id, user.id),
                        eq(transactions.to_user_id, user.id)
                    )
                )
                .orderBy(desc(transactions.created_at));

            return userTransactions;
        } catch (error) {
            console.error('Error with getTransactionsByPrivyId: ', error);
            throw new DatabaseError('Failed to fetch user transactions');
        }
    },

    getCardsByPrivyId: async (privyId: string): Promise<CardWithMetadata[]> => {
        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.privy_id, privyId))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');
            const user = userResults[0];

            const userCards = await db
                .select()
                .from(cards)
                .innerJoin(
                    card_metadata,
                    eq(cards.token_id, card_metadata.token_id)
                )
                .where(eq(cards.owner_id, user.id));

            return userCards.map(({ cards, card_metadata }) => ({
                ...cards,
                metadata: {
                    ...card_metadata
                }
            }));
        } catch (error) {
            console.error('Error with getCardsByPrivyId: ', error);
            throw new DatabaseError('Failed to fetch user cards');
        }
    },

    createUser: async (userData: {
        email: string;
        username: string;
        privy_id: string;
        wallet_address: string;
        avatarFile?: Express.Multer.File;
    }): Promise<User> => {
        if (!userData.email || !userData.username || !userData.privy_id) {
            throw new ValidationError(
                'Email, username, and Privy ID are required'
            );
        }

        try {
            // Check for existing email
            const existingEmail = await userService
                .getUserByEmail(userData.email)
                .catch((error: unknown) => {
                    if (error instanceof NotFoundError) return null;
                    throw error as DatabaseError;
                });

            if (existingEmail) {
                throw new DuplicateError('Email already registered');
            }

            // Check for existing username
            const existingUsername = await userService
                .getUserByUsername(userData.username)
                .catch((error: unknown) => {
                    if (error instanceof NotFoundError) return null;
                    throw error as DatabaseError;
                });

            if (existingUsername) {
                throw new DuplicateError('Username already taken');
            }

            // Handle avatar upload if file exists
            let avatar_url = DEFAULT_AVATAR;
            if (userData.avatarFile) {
                const fileKey = await s3Service.uploadAvatar(
                    userData.avatarFile.buffer
                );
                avatar_url = s3Service.generateAvatarUrl(fileKey);
            }

            // Create user record
            const [newUser] = await db
                .insert(users)
                .values({
                    email: userData.email,
                    username: userData.username,
                    privy_id: userData.privy_id,
                    wallet_address: userData.wallet_address,
                    avatar_url,
                    role: 'user',
                    phytness_points: 0
                })
                .returning();

            return newUser;
        } catch (error) {
            console.error('Error with createUser: ', error);
            throw new DatabaseError('Failed to create user');
        }
    }
};
