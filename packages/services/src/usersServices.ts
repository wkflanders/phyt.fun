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
    };

    const getUserById = async (userId: UUIDv7): Promise<UserDTO> => {
        const user = await _findById(userId);
        return user.toDTO<UserDTO>();
    };

    const getUserByPrivyId = async (privyId: string): Promise<UserDTO> => {
        const user = await repo.findByPrivyId(privyId);
        return user.toDTO<UserDTO>();
    };

    const getUserWithStatusByPrivyId = async (
        privyId: string
    ): Promise<UserWithStatusDTO> => {
        const userWithStatus = await repo.findByPrivyIdWithStatus(privyId);
        return userWithStatus.toDTO<UserWithStatusDTO>();
    };

    const getUserWithStatusById = async (
        userId: UUIDv7
    ): Promise<UserWithStatusDTO> => {
        const userWithStatus = await repo.findByIdWithStatus(userId);
        return userWithStatus.toDTO<UserWithStatusDTO>();
    };

    const getUserByWalletAddress = async (
        walletAddress: string
    ): Promise<UserDTO> => {
        const user = await repo.findByWalletAddress(walletAddress);
        return user.toDTO<UserDTO>();
    };

    const getUserByEmail = async (email: string): Promise<UserDTO> => {
        const user = await repo.findByEmail(email);
        return user.toDTO<UserDTO>();
    };

    const getUserByUsername = async (username: string): Promise<UserDTO> => {
        const user = await repo.findByUsername(username);
        return user.toDTO<UserDTO>();
    };

    const updateProfile = async (
        userId: UUIDv7,
        input: UpdateProfileDTO
    ): Promise<UserDTO> => {
        UserVO.validateUpdate(input);
        const user = await repo.updateProfile(userId, input);
        return user.toDTO<UserDTO>();
    };

    const updateAvatar = async (
        userId: UUIDv7,
        input: UpdateAvatarDTO
    ): Promise<UserDTO> => {
        const user = await repo.updateAvatar(userId, input.avatarUrl);
        return user.toDTO<UserDTO>();
    };

    const updateAvatarWithFile = async (
        userId: UUIDv7,
        file: MulterFile
    ): Promise<UserDTO> => {
        const updatedUser = await repo.updateAvatarWithFile(
            userId,
            file.buffer
        );
        return updatedUser.toDTO<UserDTO>();
    };

    const listUsers = async (
        params: UserQueryParams
    ): Promise<UsersPageDTO> => {
        const result = await repo.listUsers(params);
        return {
            users: result.users.map((userVO) => userVO.toDTO()),
            pagination: result.pagination
        };
    };

    const getCardsByUserId = async (userId: string): Promise<Card[]> => {
        return await repo.findCardsById(userId as UUIDv7);
    };

    const getTransactionsByUserId = async (
        userId: string
    ): Promise<Transaction[]> => {
        return await repo.findTransactionById(userId as UUIDv7);
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
