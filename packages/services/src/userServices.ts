import {
    db,
    eq,
    or,
    desc,
    users,
    transactions,
    cards,
    cardMetadata,
    runners
} from '@phyt/database';
import {
    UUIDv7,
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
                    .where(eq(users.privyId, privyId))
                    .limit(1);

                if (userResults.length === 0)
                    throw new NotFoundError('User not found');
                const user = userResults[0];

                const [runner] = await db
                    .select()
                    .from(runners)
                    .where(eq(runners.userId, user.id));

                return {
                    ...user,
                    id: user.id as UUIDv7,
                    status: runner.status
                };
            } else {
                const userResults = await db
                    .select()
                    .from(users)
                    .where(eq(users.privyId, privyId))
                    .limit(1);

                if (userResults.length === 0)
                    throw new NotFoundError('User not found');

                return {
                    ...userResults[0],
                    id: userResults[0].id as UUIDv7
                };
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
                .where(eq(users.walletAddress, walletAddress))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');

            return {
                ...userResults[0],
                id: userResults[0].id as UUIDv7
            };
        } catch (error) {
            console.error('Error with getUserByWalletAddress: ', error);
            throw new DatabaseError('Failed to fetch user by wallet address');
        }
    },

    getUserById: async (id: UUIDv7): Promise<User> => {
        if (!id) throw new ValidationError('User id is required');

        try {
            const userResults = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');

            return {
                ...userResults[0],
                id: userResults[0].id as UUIDv7
            };
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

            return {
                ...userResults[0],
                id: userResults[0].id as UUIDv7
            };
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

            return {
                ...userResults[0],
                id: userResults[0].id as UUIDv7
            };
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
                .where(eq(users.privyId, privyId))
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
                        eq(transactions.fromUserId, user.id),
                        eq(transactions.toUserId, user.id)
                    )
                )
                .orderBy(desc(transactions.createdAt));

            return userTransactions.map((tx) => ({
                ...tx,
                id: tx.id as UUIDv7,
                fromUserId: tx.fromUserId as UUIDv7 | null,
                toUserId: tx.toUserId as UUIDv7 | null,
                cardId: tx.cardId as UUIDv7 | null,
                competitionId: tx.competitionId as UUIDv7 | null,
                packPurchaseId: tx.packPurchaseId as UUIDv7 | null
            }));
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
                .where(eq(users.privyId, privyId))
                .limit(1);

            if (userResults.length === 0)
                throw new NotFoundError('User not found');
            const user = userResults[0];

            const userCards = await db
                .select()
                .from(cards)
                .innerJoin(
                    cardMetadata,
                    eq(cards.tokenId, cardMetadata.tokenId)
                )
                .where(eq(cards.ownerId, user.id));

            return userCards.map(({ cards, cardMetadata }) => ({
                ...cards,
                id: cards.id as UUIDv7,
                ownerId: cards.ownerId as UUIDv7,
                packPurchaseId: cards.packPurchaseId as UUIDv7,
                metadata: {
                    ...cardMetadata,
                    runnerId: cardMetadata.runnerId as UUIDv7
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
        privyId: string;
        walletAddress: string;
        avatarFile?: Express.Multer.File;
    }): Promise<User> => {
        if (!userData.email || !userData.username || !userData.privyId) {
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
            let avatarUrl = DEFAULT_AVATAR;
            if (userData.avatarFile) {
                const fileKey = await s3Service.uploadAvatar(
                    userData.avatarFile.buffer
                );
                avatarUrl = s3Service.generateAvatarUrl(fileKey);
            }

            // Create user record
            const [newUser] = await db
                .insert(users)
                .values({
                    email: userData.email,
                    username: userData.username,
                    privyId: userData.privyId,
                    walletAddress: userData.walletAddress,
                    avatarUrl,
                    role: 'user',
                    phytnessPoints: 0
                })
                .returning();

            return {
                ...newUser,
                id: newUser.id as UUIDv7
            };
        } catch (error) {
            console.error('Error with createUser: ', error);
            throw new DatabaseError('Failed to create user');
        }
    }
};
