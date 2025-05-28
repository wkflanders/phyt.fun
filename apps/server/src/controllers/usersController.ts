import {
    UserIdSchema,
    CreateUserSchema,
    UserQueryParamsSchema,
    PrivyIdSchema,
    WalletAddressSchema,
    UsernameSchema,
    EmailSchema,
    UpdateUserSchema
} from '@phyt/dto';

import { validateAuth } from '@/middleware/auth.js';
import { avatarUpload } from '@/middleware/multer.js';
import { ensureOwnership } from '@/middleware/owner.js';
import { validateSchema } from '@/middleware/validator.js';

import type {
    UserIdDTO,
    UserDTO,
    CreateUserDTO,
    UserQueryParamsDTO,
    UsersPageDTO,
    PrivyIdDTO,
    WalletAddressDTO,
    UsernameDTO,
    EmailDTO,
    UpdateUserDTO
} from '@phyt/dto';
import type { MulterFile, UsersService } from '@phyt/services';
import type { Request, RequestHandler, Response } from 'express';

export interface UsersController {
    getUserById: RequestHandler[];
    getUserByPrivyId: RequestHandler[];
    getUserWithStatusById: RequestHandler[];
    getUserWithStatusByPrivyId: RequestHandler[];
    getUserByWalletAddress: RequestHandler[];
    getUserByEmail: RequestHandler[];
    getUserByUsername: RequestHandler[];
    createUser: RequestHandler[];
    updateProfile: RequestHandler[];
    updateAvatar: RequestHandler[];
    listUsers: RequestHandler[];
    // getCardsByUserId: RequestHandler[];
    // getTransactionsByUserId: RequestHandler[];
}

export const makeUsersController = (svc: UsersService): UsersController => {
    const getUserById = [
        validateAuth,
        validateSchema({ paramsSchema: UserIdSchema }),
        async (req: Request<UserIdDTO, UserDTO>, res: Response<UserDTO>) => {
            const user = await svc.getUserById({
                userId: req.params
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByPrivyId = [
        validateAuth,
        validateSchema({ paramsSchema: PrivyIdSchema }),
        async (req: Request<PrivyIdDTO, UserDTO>, res: Response<UserDTO>) => {
            const user = await svc.getUserByPrivyId({
                privyId: req.params
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserWithStatusByPrivyId = [
        validateAuth,
        validateSchema({ paramsSchema: PrivyIdSchema }),
        async (req: Request<PrivyIdDTO, UserDTO>, res: Response<UserDTO>) => {
            const user = await svc.getUserWithStatusByPrivyId({
                privyId: req.params
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserWithStatusById = [
        validateAuth,
        validateSchema({ paramsSchema: UserIdSchema }),
        async (req: Request<UserIdDTO, UserDTO>, res: Response<UserDTO>) => {
            const user = await svc.getUserWithStatusById({
                userId: req.params
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByWalletAddress = [
        validateAuth,
        validateSchema({ paramsSchema: WalletAddressSchema }),
        async (
            req: Request<WalletAddressDTO, UserDTO>,
            res: Response<UserDTO>
        ) => {
            const user = await svc.getUserByWalletAddress({
                walletAddress: req.params
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByEmail = [
        validateAuth,
        validateSchema({ paramsSchema: EmailSchema }),
        async (req: Request<EmailDTO, UserDTO>, res: Response<UserDTO>) => {
            const user = await svc.getUserByEmail({
                email: req.params
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByUsername = [
        validateAuth,
        validateSchema({ paramsSchema: UsernameSchema }),
        async (req: Request<UsernameDTO, UserDTO>, res: Response<UserDTO>) => {
            const user = await svc.getUserByUsername({
                username: req.params
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const createUser = [
        validateSchema({ bodySchema: CreateUserSchema }),
        avatarUpload.single('avatar'),
        async (
            req: Request<Record<string, never>, UserDTO, CreateUserDTO>,
            res: Response<UserDTO>
        ) => {
            const userData = req.body;
            const user = await svc.createUser({
                input: userData,
                file: req.file
            });
            res.status(201).json(user);
        }
    ] as RequestHandler[];

    const updateProfile = [
        validateAuth,
        ensureOwnership,
        validateSchema({
            paramsSchema: UserIdSchema,
            bodySchema: UpdateUserSchema
        }),
        async (
            req: Request<UserIdDTO, UserDTO, UpdateUserDTO>,
            res: Response<UserDTO>
        ) => {
            const user = await svc.updateUser({
                userId: req.params,
                update: req.body
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const updateAvatar = [
        validateAuth,
        ensureOwnership,
        validateSchema({ paramsSchema: UserIdSchema }),
        avatarUpload.single('avatar'),
        async (
            req: Request<UserIdDTO, UserDTO, MulterFile>,
            res: Response<UserDTO>
        ) => {
            const user = await svc.updateAvatarWithFile({
                userId: req.params,
                file: req.file as MulterFile
            });
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const listUsers = [
        validateAuth,
        validateSchema({ querySchema: UserQueryParamsSchema }),
        async (
            req: Request<
                Record<string, never>,
                UsersPageDTO,
                Record<string, never>,
                UserQueryParamsDTO
            >,
            res: Response<UsersPageDTO>
        ) => {
            const data = await svc.listUsers({
                params: req.query
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[];

    // const getCardsByUserId = [
    //     validateAuth,
    //     validateSchema({ paramsSchema: UserIdSchema }),
    //     async (req: Request<UserIdDTO, Card[]>, res: Response<Card[]>) => {
    //         const cards = await svc.getCardsByUserId({
    //             userId: req.params
    //         });
    //         res.status(200).json(cards);
    //     }
    // ] as RequestHandler[];

    // const getTransactionsByUserId = [
    //     validateAuth,
    //     async (
    //         req: Request<{ userId: string }, Transaction[]>,
    //         res: Response<Transaction[]>
    //     ) => {
    //         const transactions = await svc.getTransactionsByUserId({
    //             userId: req.params
    //         });
    //         res.status(200).json(transactions);
    //     }
    // ] as RequestHandler[];

    return {
        getUserById,
        getUserByPrivyId,
        getUserWithStatusByPrivyId,
        getUserWithStatusById,
        getUserByWalletAddress,
        getUserByEmail,
        getUserByUsername,
        createUser,
        updateProfile,
        updateAvatar,
        listUsers
        // getCardsByUserId,
        // getTransactionsByUserId
    };
};
