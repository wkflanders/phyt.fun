import { UserVO } from '@phyt/models';

import type {
    UserDTO,
    CreateUserDTO,
    UpdateProfileDTO,
    UpdateAvatarDTO,
    UsersPageDTO,
    UserWithStatusDTO
} from '@phyt/dto';
import type { UsersRepository } from '@phyt/repositories';
import type { UUIDv7, UserQueryParams, Transaction, Card } from '@phyt/types';

// Define Multer file type as interface rather than namespace
export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer: Buffer;
}

export type UsersService = ReturnType<typeof makeUsersService>;

/**
 * Creates user services that handle business logic for user operations
 */
export const makeUsersService = (repo: UsersRepository) => {
    // Domain operations: Return UserVO objects for internal use
    const _findById = async (userId: UUIDv7): Promise<UserVO> => {
        return await repo.findById(userId);
    };

    // Public API: Convert domain objects to DTOs
    const createUser = async (
        input: CreateUserDTO,
        file?: MulterFile
    ): Promise<UserDTO> => {
        try {
            UserVO.validateInput(input);

            // Handle avatar upload if file exists
            let avatarUrl = input.avatarUrl;
            if (file) {
                try {
                    avatarUrl = await repo.uploadAvatar(file.buffer);
                } catch (error) {
                    console.error('Error uploading avatar:', error);
                    // Continue with default avatar if upload fails
                }
            }

            const user = await repo.create({
                ...input,
                avatarUrl
            });

            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error('Error in createUser service:', error);
            throw error;
        }
    };

    const getUserById = async (userId: UUIDv7): Promise<UserDTO> => {
        try {
            const user = await _findById(userId);
            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error(`Error getting user by ID ${userId}:`, error);
            throw error;
        }
    };

    const getUserByPrivyId = async (privyId: string): Promise<UserDTO> => {
        try {
            const user = await repo.findByPrivyId(privyId);
            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error(`Error getting user by PrivyID ${privyId}:`, error);
            throw error;
        }
    };

    const getUserWithStatusByPrivyId = async (
        privyId: string
    ): Promise<UserWithStatusDTO> => {
        try {
            const userWithStatus = await repo.findByPrivyIdWithStatus(privyId);
            return userWithStatus.toDTO<UserWithStatusDTO>();
        } catch (error) {
            console.error(
                `Error getting user with status by PrivyID ${privyId}:`,
                error
            );
            throw error;
        }
    };

    const getUserWithStatusById = async (
        userId: UUIDv7
    ): Promise<UserWithStatusDTO> => {
        try {
            const userWithStatus = await repo.findByIdWithStatus(userId);
            return userWithStatus.toDTO<UserWithStatusDTO>();
        } catch (error) {
            console.error(
                `Error getting user with status by ID ${userId}:`,
                error
            );
            throw error;
        }
    };

    const getUserByWalletAddress = async (
        walletAddress: string
    ): Promise<UserDTO> => {
        try {
            const user = await repo.findByWalletAddress(walletAddress);
            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error(
                `Error getting user by wallet address ${walletAddress}:`,
                error
            );
            throw error;
        }
    };

    const getUserByEmail = async (email: string): Promise<UserDTO> => {
        try {
            const user = await repo.findByEmail(email);
            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error(`Error getting user by email ${email}:`, error);
            throw error;
        }
    };

    const getUserByUsername = async (username: string): Promise<UserDTO> => {
        try {
            const user = await repo.findByUsername(username);
            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error(`Error getting user by username ${username}:`, error);
            throw error;
        }
    };

    const updateProfile = async (
        userId: UUIDv7,
        input: UpdateProfileDTO
    ): Promise<UserDTO> => {
        try {
            UserVO.validateUpdate(input);
            const user = await repo.updateProfile(userId, input);
            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error(`Error updating profile for user ${userId}:`, error);
            throw error;
        }
    };

    const updateAvatar = async (
        userId: UUIDv7,
        input: UpdateAvatarDTO
    ): Promise<UserDTO> => {
        try {
            const user = await repo.updateAvatar(userId, input.avatarUrl);
            return user.toDTO<UserDTO>();
        } catch (error) {
            console.error(
                `Error updating avatar URL for user ${userId}:`,
                error
            );
            throw error;
        }
    };

    const updateAvatarWithFile = async (
        userId: UUIDv7,
        file: MulterFile
    ): Promise<UserDTO> => {
        try {
            const updatedUser = await repo.updateAvatarWithFile(
                userId,
                file.buffer
            );
            return updatedUser.toDTO<UserDTO>();
        } catch (error) {
            console.error(
                `Error updating avatar file for user ${userId}:`,
                error
            );
            throw error;
        }
    };

    const listUsers = async (
        params: UserQueryParams
    ): Promise<UsersPageDTO> => {
        try {
            const result = await repo.listUsers(params);
            return {
                users: result.users.map((userVO) => userVO.toDTO()),
                pagination: result.pagination
            };
        } catch (error) {
            console.error('Error listing users:', error);
            throw error;
        }
    };

    const getCardsByUserId = async (userId: string): Promise<Card[]> => {
        try {
            return await repo.findCardsById(userId as UUIDv7);
        } catch (error) {
            console.error(`Error getting cards for user ${userId}:`, error);
            throw error;
        }
    };

    const getTransactionsByUserId = async (
        userId: string
    ): Promise<Transaction[]> => {
        try {
            return await repo.findTransactionById(userId as UUIDv7);
        } catch (error) {
            console.error(
                `Error getting transactions for user ${userId}:`,
                error
            );
            throw error;
        }
    };

    return {
        createUser,
        getUserById,
        getUserByPrivyId,
        getUserWithStatusByPrivyId,
        getUserWithStatusById,
        getUserByWalletAddress,
        getUserByEmail,
        getUserByUsername,
        updateProfile,
        updateAvatar,
        updateAvatarWithFile,
        listUsers,
        getCardsByUserId,
        getTransactionsByUserId
    };
};
