import { UserVO, UserWithStatusVO } from '@phyt/models';

import type { UserAWSOps } from '@phyt/aws';
import type { UsersDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    User,
    UserInsert,
    ISODate,
    UserQueryParams,
    PaginatedUsers,
    Transaction,
    TransactionType,
    Card,
    AcquisitionType
} from '@phyt/types';

export type UsersRepository = ReturnType<typeof makeUsersRepository>;

export const makeUsersRepository = (
    drizzleOps: UsersDrizzleOps,
    awsOps: UserAWSOps
) => {
    function isDate(val: unknown): val is Date {
        return val instanceof Date;
    }

    function mapRecord(data: User): UserVO {
        return UserVO.fromRecord({
            ...data,
            createdAt: (isDate(data.createdAt)
                ? data.createdAt.toISOString()
                : data.createdAt) as ISODate,
            updatedAt: (isDate(data.updatedAt)
                ? data.updatedAt.toISOString()
                : data.updatedAt) as ISODate
        });
    }

    const create = async (input: UserInsert): Promise<UserVO> => {
        const data = await drizzleOps.create(input);
        return mapRecord(data);
    };

    const findByPrivyId = async (privyId: string): Promise<UserVO> => {
        const data = await drizzleOps.findByPrivyId(privyId);
        return mapRecord(data);
    };

    const findByPrivyIdWithStatus = async (
        privyId: string
    ): Promise<UserWithStatusVO> => {
        const data = await drizzleOps.findByPrivyIdWithStatus(privyId);
        return UserVO.fromWithStatus(data);
    };

    const findByIdWithStatus = async (
        userId: UUIDv7
    ): Promise<UserWithStatusVO> => {
        const data = await drizzleOps.findByIdWithStatus(userId);
        return UserVO.fromWithStatus(data);
    };

    const findByWalletAddress = async (
        walletAddress: string
    ): Promise<UserVO> => {
        const data = await drizzleOps.findByWalletAddress(walletAddress);
        return mapRecord(data);
    };

    const findById = async (id: UUIDv7): Promise<UserVO> => {
        const data = await drizzleOps.findById(id);
        return mapRecord(data);
    };

    const findByEmail = async (email: string): Promise<UserVO> => {
        const data = await drizzleOps.findByEmail(email);
        return mapRecord(data);
    };

    const findByUsername = async (username: string): Promise<UserVO> => {
        const data = await drizzleOps.findByUsername(username);
        return mapRecord(data);
    };

    const updateProfile = async (
        userId: UUIDv7,
        data: { twitterHandle?: string | null; stravaHandle?: string | null }
    ): Promise<UserVO> => {
        const updated = await drizzleOps.updateProfile(userId, data);
        return mapRecord(updated);
    };

    const updateAvatar = async (
        userId: UUIDv7,
        avatarUrl: string
    ): Promise<UserVO> => {
        const updated = await drizzleOps.updateAvatar(userId, avatarUrl);
        return mapRecord(updated);
    };

    // Add AWS avatar operations
    const uploadAvatar = async (buffer: Buffer): Promise<string> => {
        const fileKey = await awsOps.uploadAvatar(buffer);
        return awsOps.generateAvatarUrl(fileKey);
    };

    const deleteAvatar = async (fileKey: string): Promise<void> => {
        await awsOps.deleteAvatar(fileKey);
    };

    const extractFileKeyFromUrl = (url: string): string | null => {
        return awsOps.extractFileKeyFromUrl(url);
    };

    const updateAvatarWithFile = async (
        userId: UUIDv7,
        buffer: Buffer
    ): Promise<UserVO> => {
        // Get current user to potentially cleanup old avatar
        const currentUser = await findById(userId);

        // Upload file to S3 and get URL
        const avatarUrl = await uploadAvatar(buffer);

        // Update the user with the new avatar URL
        const updatedUser = await updateAvatar(userId, avatarUrl);

        // Clean up old avatar if exists
        if (currentUser.avatarUrl) {
            try {
                const oldFileKey = extractFileKeyFromUrl(currentUser.avatarUrl);
                if (oldFileKey) {
                    await deleteAvatar(oldFileKey);
                }
            } catch (error) {
                console.warn(`Failed to delete old avatar: ${String(error)}`);
                // Non-critical error, continue
            }
        }

        return updatedUser;
    };

    const listUsers = async (
        params: UserQueryParams
    ): Promise<PaginatedUsers<UserVO>> => {
        const result = await drizzleOps.listUsers(params);

        return {
            users: result.users.map((user) =>
                mapRecord({
                    ...user,
                    // Filter out status to create clean UserVO objects
                    status: undefined
                } as User)
            ),
            pagination: result.pagination
        };
    };

    // This is a placeholder. Since we don't have TransactionVO,
    // we'll need to properly implement this later
    const findTransactionById = async (
        userId: UUIDv7
    ): Promise<Transaction[]> => {
        const rawTransactions = await drizzleOps.findTransactionById(userId);

        // In a real implementation, we would map these to TransactionVO objects
        return rawTransactions.map((tx) => {
            const transaction = tx.transactions;

            return {
                id: transaction.id as UUIDv7,
                fromUserId: transaction.fromUserId as UUIDv7 | null,
                toUserId: transaction.toUserId as UUIDv7 | null,
                cardId: transaction.cardId as UUIDv7 | null,
                competitionId: transaction.competitionId as UUIDv7 | null,
                price: transaction.price,
                transactionType: transaction.transactionType as TransactionType,
                packPurchaseId: transaction.packPurchaseId as UUIDv7 | null,
                hash: transaction.hash,
                createdAt: new Date(transaction.createdAt),
                updatedAt: new Date(transaction.updatedAt)
            };
        });
    };

    // This is a placeholder. Since we don't have CardVO,
    // we'll need to properly implement this later
    const findCardsById = async (userId: UUIDv7): Promise<Card[]> => {
        const rawCards = await drizzleOps.findCardsById(userId);

        // In a real implementation, we would map these to CardVO objects
        return rawCards.map((card) => ({
            id: card.id as UUIDv7,
            ownerId: card.ownerId as UUIDv7,
            packPurchaseId: card.packPurchaseId as UUIDv7 | null,
            tokenId: card.tokenId,
            acquisitionType: card.acquisitionType as AcquisitionType,
            isBurned: card.isBurned,
            createdAt: new Date(card.createdAt),
            updatedAt: new Date(card.updatedAt)
        }));
    };

    const findWhitelistedWallets = async (): Promise<string[]> => {
        const records = await drizzleOps.findWhitelistedWallets();
        return records;
    };

    return {
        create,
        findByPrivyId,
        findByPrivyIdWithStatus,
        findByIdWithStatus,
        findByWalletAddress,
        findById,
        findByEmail,
        findByUsername,
        updateProfile,
        updateAvatar,
        updateAvatarWithFile,
        uploadAvatar,
        deleteAvatar,
        extractFileKeyFromUrl,
        listUsers,
        findTransactionById,
        findCardsById,
        findWhitelistedWallets
    };
};
