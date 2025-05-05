import express, { Router, Request, Response } from 'express';

import multer from 'multer';

import {
    NotFoundError,
    Transaction,
    User,
    UserWithStatus,
    CreateUserFormData,
    CardWithMetadata
} from '@phyt/types';

import { createUserSchema } from '@/lib/validation.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';
import { userService } from '@/services/userServices.js';

const router: Router = express.Router();

const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files are allowed'));
            return;
        }
        cb(null, true);
    }
});

router.use(validateAuth);

// Get all user transactions
router.get(
    '/transactions/:privyId',
    async (
        req: Request<{ privyId: string }, Transaction[]>,
        res: Response<Transaction[]>
    ) => {
        const { privyId } = req.params;

        if (!privyId) {
            throw new NotFoundError('Missing valid id');
        }

        const result = await userService.getTransactionsByPrivyId(privyId);

        res.status(200).json(result);
    }
);

// Get user by privy Id
router.get(
    '/:privyId',
    async (req: Request<{ privyId: string }, User>, res: Response<User>) => {
        const { privyId } = req.params;

        if (!privyId) {
            throw new NotFoundError('Missing valid id');
        }

        const user = await userService.getUserByPrivyId(privyId);

        res.status(200).json(user);
    }
);

router.get(
    '/:walletAddress',
    async (
        req: Request<{ walletAddress: string }, User>,
        res: Response<User>
    ) => {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            throw new NotFoundError('Missing valid wallet address');
        }

        const user = await userService.getUserByWalletAddress(walletAddress);
        res.status(200).json(user);
    }
);

/// COME BACK TO THIS TO MAKE SURE THAT STATUS WILL NEVER BE RETURNED UNDEFINED (WHAT IF HAVENT CREATED A ROW IN RUNNER TABLE FOR USER?)

// Get user by privy Id with runner status
router.get(
    '/status/:privyId',
    async (
        req: Request<{ privyId: string }, UserWithStatus>,
        res: Response<UserWithStatus>
    ) => {
        const { privyId } = req.params;

        if (!privyId) {
            throw new NotFoundError('Missing valid id');
        }

        const user = await userService.getUserByPrivyId(privyId, true);

        res.status(200).json(user);
    }
);

// Get user by email

// Get user by username

// Create new user
router.post(
    '/create',
    validateSchema(createUserSchema),
    upload.single('avatar'),
    async (
        req: Request<Record<string, never>, User, CreateUserFormData>,
        res: Response<User>
    ) => {
        const { email, username, privyId, walletAddress } = req.body;

        const newUser = await userService.createUser({
            email,
            username,
            privyId,
            walletAddress,
            avatarFile: req.file // Pass the file if it exists
        });

        res.status(201).json(newUser);
    }
);

// Get all the cards owned by a privy Id
router.get(
    '/cards/:privyId',
    async (
        req: Request<{ privyId: string }, CardWithMetadata[]>,
        res: Response<CardWithMetadata[]>
    ) => {
        const { privyId } = req.params;

        if (!privyId) {
            throw new NotFoundError('Missing valid id');
        }

        const cards = await userService.getCardsByPrivyId(privyId);

        res.status(200).json(cards);
    }
);

router.get('/');

export { router as userRouter };
