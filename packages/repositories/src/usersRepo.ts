import { UserVO } from '@phyt/models';

import type { UserAWSOps } from '@phyt/aws';
import type { UsersDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    UserInsert,
    UserUpdate,
    UserQueryParams,
    PaginatedUsers
} from '@phyt/types';

export type UsersRepository = ReturnType<typeof makeUsersRepository>;

export const makeUsersRepository = (
    drizzleOps: UsersDrizzleOps,
    awsOps: UserAWSOps
) => {
    const save = async (input: UserInsert): Promise<UserVO> => {
        const data = await drizzleOps.create(input);
        return UserVO.from(data);
    };

    const findById = async (userId: UUIDv7): Promise<UserVO> => {
        const data = await drizzleOps.findById(userId);
        return UserVO.from(data);
    };

    const findByPrivyId = async (privyId: string): Promise<UserVO> => {
        const data = await drizzleOps.findByPrivyId(privyId);
        return UserVO.from(data);
    };

    const findByWalletAddress = async (
        walletAddress: string
    ): Promise<UserVO> => {
        const data = await drizzleOps.findByWalletAddress(walletAddress);
        return UserVO.from(data);
    };

    const findByEmail = async (email: string): Promise<UserVO> => {
        const data = await drizzleOps.findByEmail(email);
        return UserVO.from(data);
    };

    const findByUsername = async (username: string): Promise<UserVO> => {
        const data = await drizzleOps.findByUsername(username);
        return UserVO.from(data);
    };

    const findAll = async (
        params: UserQueryParams
    ): Promise<PaginatedUsers<UserVO>> => {
        const paginatedData = await drizzleOps.listUsers(params);

        return {
            users: paginatedData.users.map((user) => UserVO.from(user)),
            pagination: paginatedData.pagination
        };
    };

    const findWhitelistedWallets = async (): Promise<string[]> => {
        return await drizzleOps.findWhitelistedWallets();
    };

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
        const updatedUser = await update(userId, { avatarUrl });

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

    // This is a placeholder. Since we don't have TransactionVO,
    // we'll need to properly implement this later
    // const findTransactionById = async (
    //     userId: UUIDv7
    // ): Promise<TransactionVO> => {
    //     const rawTransactions = await drizzleOps.findTransactionById(userId);

    //     // In a real implementation, we would map these to TransactionVO objects
    //     return rawTransactions.map((tx) => {
    //         const transaction = tx.transactions;

    //         return {
    //             id: transaction.id as UUIDv7,
    //             fromUserId: transaction.fromUserId as UUIDv7 | null,
    //             toUserId: transaction.toUserId as UUIDv7 | null,
    //             cardId: transaction.cardId as UUIDv7 | null,
    //             competitionId: transaction.competitionId as UUIDv7 | null,
    //             price: transaction.price,
    //             transactionType: transaction.transactionType as TransactionType,
    //             packPurchaseId: transaction.packPurchaseId as UUIDv7 | null,
    //             hash: transaction.hash,
    //             createdAt: new Date(transaction.createdAt),
    //             updatedAt: new Date(transaction.updatedAt)
    //         };
    //     });
    // };

    // // This is a placeholder. Since we don't have CardVO,
    // // we'll need to properly implement this later
    // const findCardsById = async (userId: UUIDv7): Promise<CardVO> => {
    //     const rawCards = await drizzleOps.findCardsById(userId);

    //     // In a real implementation, we would map these to CardVO objects
    //     return rawCards.map((card) => ({
    //         id: card.id,
    //         ownerId: card.ownerId,
    //         packPurchaseId: card.packPurchaseId,
    //         tokenId: card.tokenId,
    //         acquisitionType: card.acquisitionType,
    //         isBurned: card.isBurned,
    //         createdAt: new Date(card.createdAt),
    //         updatedAt: new Date(card.updatedAt)
    //     }));
    // };

    const remove = async (userId: UUIDv7): Promise<UserVO> => {
        const data = await drizzleOps.remove(userId);
        return UserVO.from(data);
    };

    // Performance optimization: direct update without domain validation
    const update = async (
        userId: UUIDv7,
        update: UserUpdate
    ): Promise<UserVO> => {
        const updated = await drizzleOps.update(userId, update);
        return UserVO.from(updated);
    };

    return {
        save,
        findById,
        findByPrivyId,
        findByWalletAddress,
        findByEmail,
        findByUsername,
        findAll,
        findWhitelistedWallets,

        // AWS operations
        updateAvatarWithFile,
        uploadAvatar,
        deleteAvatar,
        extractFileKeyFromUrl,
        remove
    };
};
