import {
    UserIdSchema,
    CreateUserSchema,
    UpdateProfileSchema,
    UserQueryParamsSchema
} from '@phyt/dto';
import { InputError } from '@phyt/models';

import { validateAuth } from '@/middleware/auth.js';
import { avatarUpload } from '@/middleware/multer.js';
import { ensureOwnership } from '@/middleware/owner.js';
import { validateSchema } from '@/middleware/validator.js';

import type {
    UserIdDTO,
    UserDTO,
    CreateUserDTO,
    UpdateProfileDTO,
    UserQueryParamsDTO,
    UsersPageDTO,
    UserWithStatusDTO
} from '@phyt/dto';
import type { UsersService } from '@phyt/services';
import type { Card, Transaction } from '@phyt/types';
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
    getCardsByUserId: RequestHandler[];
    getTransactionsByUserId: RequestHandler[];
}

export const makeUsersController = (svc: UsersService): UsersController => {
    const getUserById = [
        validateAuth,
        validateSchema(UserIdSchema),
        async (req: Request<UserIdDTO, UserDTO>, res: Response<UserDTO>) => {
            const user = await svc.getUserById(req.params.userId);
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByPrivyId = [
        validateAuth,
        async (
            req: Request<{ privyId: string }, UserDTO>,
            res: Response<UserDTO>
        ) => {
            const user = await svc.getUserByPrivyId(req.params.privyId);
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserWithStatusByPrivyId = [
        validateAuth,
        async (
            req: Request<{ privyId: string }, UserWithStatusDTO>,
            res: Response<UserWithStatusDTO>
        ) => {
            const user = await svc.getUserWithStatusByPrivyId(
                req.params.privyId
            );
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserWithStatusById = [
        validateAuth,
        validateSchema(UserIdSchema),
        async (
            req: Request<UserIdDTO, UserWithStatusDTO>,
            res: Response<UserWithStatusDTO>
        ) => {
            const user = await svc.getUserWithStatusById(req.params.userId);
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByWalletAddress = [
        validateAuth,
        async (
            req: Request<{ walletAddress: string }, UserDTO>,
            res: Response<UserDTO>
        ) => {
            const user = await svc.getUserByWalletAddress(
                req.params.walletAddress
            );
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByEmail = [
        validateAuth,
        async (
            req: Request<{ email: string }, UserDTO>,
            res: Response<UserDTO>
        ) => {
            const user = await svc.getUserByEmail(req.params.email);
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const getUserByUsername = [
        validateAuth,
        async (
            req: Request<{ username: string }, UserDTO>,
            res: Response<UserDTO>
        ) => {
            const user = await svc.getUserByUsername(req.params.username);
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const createUser = [
        validateSchema(undefined, CreateUserSchema),
        avatarUpload.single('avatar'),
        async (
            req: Request<Record<string, never>, UserDTO, CreateUserDTO>,
            res: Response<UserDTO>
        ) => {
            const userData = req.body;
            const user = await svc.createUser(userData, req.file);
            res.status(201).json(user);
        }
    ] as RequestHandler[];

    const updateProfile = [
        validateAuth,
        ensureOwnership,
        validateSchema(UserIdSchema, UpdateProfileSchema),
        async (
            req: Request<UserIdDTO, UserDTO, UpdateProfileDTO>,
            res: Response<UserDTO>
        ) => {
            const userId = req.params.userId;
            const profileData = req.body;
            const user = await svc.updateProfile(userId, profileData);
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const updateAvatar = [
        validateAuth,
        ensureOwnership,
        validateSchema(UserIdSchema),
        avatarUpload.single('avatar'),
        async (req: Request<UserIdDTO, UserDTO>, res: Response<UserDTO>) => {
            const userId = req.params.userId;

            if (!req.file) {
                throw new InputError('No avatar file provided');
            }

            const user = await svc.updateAvatarWithFile(userId, req.file);
            res.status(200).json(user);
        }
    ] as RequestHandler[];

    const listUsers = [
        validateAuth,
        validateSchema(undefined, undefined, UserQueryParamsSchema),
        async (
            req: Request<
                Record<string, never>,
                UsersPageDTO,
                Record<string, never>,
                UserQueryParamsDTO
            >,
            res: Response<UsersPageDTO>
        ) => {
            const { page = 1, limit = 20 } = req.query;
            const data = await svc.listUsers({
                page,
                limit
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[];

    const getCardsByUserId = [
        validateAuth,
        async (
            req: Request<{ userId: string }, Card[]>,
            res: Response<Card[]>
        ) => {
            const userId = req.params.userId;
            const cards = await svc.getCardsByUserId(userId);
            res.status(200).json(cards);
        }
    ] as RequestHandler[];

    const getTransactionsByUserId = [
        validateAuth,
        async (
            req: Request<{ userId: string }, Transaction[]>,
            res: Response<Transaction[]>
        ) => {
            const userId = req.params.userId;
            const transactions = await svc.getTransactionsByUserId(userId);
            res.status(200).json(transactions);
        }
    ] as RequestHandler[];

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
        listUsers,
        getCardsByUserId,
        getTransactionsByUserId
    };
};
