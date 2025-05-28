import { UsersVO } from '@phyt/models';

import { UserSchema } from '@phyt/dto';

import type {
    PrivyIdDTO,
    WalletAddressDTO,
    UserIdDTO,
    UserDTO,
    CreateUserDTO,
    UpdateUserDTO,
    UserQueryParamsDTO,
    UsersPageDTO
} from '@phyt/dto';
import type { UsersRepository } from '@phyt/repositories';

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

export const makeUsersService = ({
    usersRepo
}: {
    usersRepo: UsersRepository;
}) => {
    const createUser = async ({
        input,
        file
    }: {
        input: CreateUserDTO;
        file?: MulterFile;
    }): Promise<UserDTO> => {
        const userVO = UsersVO.create({ input });
        await usersRepo.save({ input: userVO });

        if (file) {
            userVO.avatarUrl = await usersRepo.uploadAvatar(file.buffer);
        }

        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const getUserById = async ({
        userId
    }: {
        userId: UserIdDTO;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findById({ userId });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const getUserWithStatusById = async ({
        userId
    }: {
        userId: UserIdDTO;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findByIdWithStatus({ userId });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const getUserByPrivyId = async ({
        privyId
    }: {
        privyId: PrivyIdDTO;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findByPrivyId({ privyId });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const getUserWithStatusByPrivyId = async ({
        privyId
    }: {
        privyId: PrivyIdDTO;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findByPrivyIdWithStatus({ privyId });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const getUserByWalletAddress = async ({
        walletAddress
    }: {
        walletAddress: WalletAddressDTO;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findByWalletAddress({ walletAddress });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const getUserByEmail = async ({
        email
    }: {
        email: string;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findByEmail({ email });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const getUserByUsername = async ({
        username
    }: {
        username: string;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findByUsername({ username });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    const updateUser = async ({
        userId,
        update,
        file
    }: {
        userId: UserIdDTO;
        update: UpdateUserDTO;
        file?: MulterFile;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findById({ userId });
        const updateUserVO = userVO.update({ update });
        if (file) {
            updateUserVO.avatarUrl = await usersRepo.uploadAvatar(file.buffer);
        }
        const savedVO = await usersRepo.save({ input: updateUserVO });

        return UserSchema.parse(savedVO.toDTO<UserDTO>());
    };

    const updateAvatarWithFile = async ({
        userId,
        file
    }: {
        userId: UserIdDTO;
        file: MulterFile;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findById({ userId });
        userVO.avatarUrl = await usersRepo.uploadAvatar(file.buffer);
        const savedVO = await usersRepo.save({ input: userVO });
        return UserSchema.parse(savedVO.toDTO<UserDTO>());
    };

    const listUsers = async ({
        params
    }: {
        params: UserQueryParamsDTO;
    }): Promise<UsersPageDTO> => {
        const paginatedUsers = await usersRepo.findAll({ params });
        return {
            users: paginatedUsers.users.map((userVO) =>
                UserSchema.parse(userVO.toDTO<UserDTO>())
            ),
            pagination: paginatedUsers.pagination
        };
    };

    const deleteUser = async ({
        userId
    }: {
        userId: UserIdDTO;
    }): Promise<UserDTO> => {
        const userVO = await usersRepo.findById({ userId });
        const removedUserVO = userVO.remove();
        await usersRepo.save({ input: removedUserVO });
        return UserSchema.parse(userVO.toDTO<UserDTO>());
    };

    // const getCardsByUserId = async (userId: UserIdDTO): Promise<Card[]> => {
    //     return await repo.findCardsById(userId);
    // };

    // const getTransactionsByUserId = async (
    //     userId: UserIdDTO
    // ): Promise<Transaction[]> => {
    //     return await repo.findTransactionById(userId);
    // };

    return {
        createUser,
        getUserById,
        getUserByPrivyId,
        getUserWithStatusByPrivyId,
        getUserWithStatusById,
        getUserByWalletAddress,
        getUserByEmail,
        getUserByUsername,
        updateUser,
        updateAvatarWithFile,
        listUsers,
        deleteUser
        // getCardsByUserId,
        // getTransactionsByUserId
    };
};
