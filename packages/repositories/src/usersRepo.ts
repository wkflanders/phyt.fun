import { UsersVO } from '@phyt/models';

import type { AvatarAWSOps } from '@phyt/aws';
import type { UsersDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    UserInsert,
    UserUpdate,
    UserQueryParams,
    PaginatedUsers,
    WalletAddress,
    AvatarUrl
} from '@phyt/types';

export type UsersRepository = ReturnType<typeof makeUsersRepository>;

export const makeUsersRepository = ({
    drizzleOps,
    awsOps
}: {
    drizzleOps: UsersDrizzleOps;
    awsOps: AvatarAWSOps;
}) => {
    const save = async ({ input }: { input: UserInsert }): Promise<UsersVO> => {
        const record = await drizzleOps.create({ input });
        return UsersVO.from({ user: record });
    };

    const findById = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<UsersVO> => {
        const record = await drizzleOps.findById({ userId });
        return UsersVO.from({ user: record });
    };

    const findByIdWithStatus = async ({
        userId
    }: {
        userId: UUIDv7;
    }): Promise<UsersVO> => {
        const record = await drizzleOps.findByIdWithStatus({ userId });
        return UsersVO.from({ user: record });
    };

    const findByPrivyId = async ({
        privyId
    }: {
        privyId: string;
    }): Promise<UsersVO> => {
        const record = await drizzleOps.findByPrivyId({ privyId });
        return UsersVO.from({ user: record });
    };

    const findByPrivyIdWithStatus = async ({
        privyId
    }: {
        privyId: string;
    }): Promise<UsersVO> => {
        const record = await drizzleOps.findByPrivyIdWithStatus({ privyId });
        return UsersVO.from({ user: record });
    };

    const findByWalletAddress = async ({
        walletAddress
    }: {
        walletAddress: WalletAddress;
    }): Promise<UsersVO> => {
        const record = await drizzleOps.findByWalletAddress({ walletAddress });
        return UsersVO.from({ user: record });
    };

    const findByEmail = async ({
        email
    }: {
        email: string;
    }): Promise<UsersVO> => {
        const record = await drizzleOps.findByEmail({ email });
        return UsersVO.from({ user: record });
    };

    const findByUsername = async ({
        username
    }: {
        username: string;
    }): Promise<UsersVO> => {
        const record = await drizzleOps.findByUsername({ username });
        return UsersVO.from({ user: record });
    };

    const findAll = async ({
        params
    }: {
        params: UserQueryParams;
    }): Promise<PaginatedUsers<UsersVO>> => {
        const paginatedRecords = await drizzleOps.listUsers({ params });

        return {
            users: paginatedRecords.users.map((user) => UsersVO.from({ user })),
            pagination: paginatedRecords.pagination
        };
    };

    const findWhitelistedWallets = async (): Promise<WalletAddress[]> => {
        return await drizzleOps.findWhitelistedWallets();
    };

    const uploadAvatar = async (buffer: Buffer): Promise<AvatarUrl> => {
        const fileKey = await awsOps.uploadAvatar(buffer);
        return awsOps.generateAvatarUrl(fileKey);
    };

    const deleteAvatar = async (fileKey: string): Promise<void> => {
        await awsOps.deleteAvatar(fileKey);
    };

    const extractFileKeyFromUrl = (url: string): string | null => {
        return awsOps.extractFileKeyFromUrl(url);
    };

    const updateAvatarWithFile = async ({
        userId,
        buffer
    }: {
        userId: UUIDv7;
        buffer: Buffer;
    }): Promise<UsersVO> => {
        // Get current user to potentially cleanup old avatar
        const currentUser = await findById({ userId });

        // Upload file to S3 and get URL
        const avatarUrl = await uploadAvatar(buffer);

        // Update the user with the new avatar URL
        const updatedUser = await update({ userId, update: { avatarUrl } });

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

    const remove = async ({ userId }: { userId: UUIDv7 }): Promise<UsersVO> => {
        const record = await drizzleOps.remove({ userId });
        return UsersVO.from({ user: record });
    };

    // Performance optimization: direct update without domain validation
    const update = async ({
        userId,
        update
    }: {
        userId: UUIDv7;
        update: UserUpdate;
    }): Promise<UsersVO> => {
        const updated = await drizzleOps.update({ userId, update });
        return UsersVO.from({ user: updated });
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
        findByIdWithStatus,
        findByPrivyIdWithStatus,
        // AWS operations
        updateAvatarWithFile,
        uploadAvatar,
        deleteAvatar,
        extractFileKeyFromUrl,
        remove
    };
};
