import { Request, Response } from 'express';

import { createUserSchema } from '@/lib/validation.js';
import { validateSchema } from '@/middleware/validator.js';
import { userService } from '@/services/userServices.js';

import type {
    CreateUserFormData,
    User,
    Transaction,
    CardWithMetadata,
    UserWithStatus
} from '@phyt/types';

export const userController = {
    getTransactionsByPrivyId: async (
        req: Request<{ privyId: string }>,
        res: Response<Transaction[]>
    ) => {
        const { privyId } = req.params;
        const transactions =
            await userService.getTransactionsByPrivyId(privyId);
        res.status(200).json(transactions);
    },

    getUserByPrivyId: async (
        req: Request<{ privyId: string }>,
        res: Response<User>
    ) => {
        const { privyId } = req.params;
        const user = await userService.getUserByPrivyId(privyId);
        res.status(200).json(user as User);
    },

    getUserByWalletAddress: async (
        req: Request<{ walletAddress: string }>,
        res: Response<User>
    ) => {
        const { walletAddress } = req.params;
        const user = await userService.getUserByWalletAddress(walletAddress);
        res.status(200).json(user);
    },

    getUserWithStatus: async (
        req: Request<{ privyId: string }>,
        res: Response<UserWithStatus>
    ) => {
        const { privyId } = req.params;
        const user = await userService.getUserByPrivyId(privyId, true);
        res.status(200).json(user as UserWithStatus);
    },

    createUser: [
        validateSchema(createUserSchema),
        async (
            req: Request<Record<string, never>, User, CreateUserFormData>,
            res: Response<User>
        ) => {
            const user = await userService.createUser({
                email: req.body.email,
                username: req.body.username,
                privy_id: req.body.privy_id,
                wallet_address: req.body.wallet_address,
                avatarFile: req.file
            });
            res.status(201).json(user);
        }
    ],

    getCardsByPrivyId: async (
        req: Request<{ privyId: string }>,
        res: Response<CardWithMetadata[]>
    ) => {
        const { privyId } = req.params;
        const cards = await userService.getCardsByPrivyId(privyId);
        res.status(200).json(cards);
    }
};
