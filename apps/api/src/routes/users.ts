import { controller } from '@/container.js';

import { Router } from 'express';

const router: Router = Router();

// Get user by ID
router.get('/id/:userId', ...controller.users.getUserById);

// Get user by Privy ID
router.get('/privy/:privyId', ...controller.users.getUserByPrivyId);

// Get user with status by Privy ID
router.get(
    '/privy/:privyId/status',
    ...controller.users.getUserWithStatusByPrivyId
);

// Get user with status by ID
router.get('/id/:userId/status', ...controller.users.getUserWithStatusById);

// Get user by wallet address
router.get(
    '/wallet/:walletAddress',
    ...controller.users.getUserByWalletAddress
);

// Get user by email
router.get('/email/:email', ...controller.users.getUserByEmail);

// Get user by username
router.get('/username/:username', ...controller.users.getUserByUsername);

// Create a new user
router.post('/', ...controller.users.createUser);

// Update user profile
router.patch('/:userId/profile', ...controller.users.updateProfile);

// Update user avatar
router.patch('/:userId/avatar', ...controller.users.updateAvatar);

// List users
router.get('/', ...controller.users.listUsers);

// Get all the cards owned by a user
// router.get('/cards/:userId', ...controller.users.getCardsByUserId);

// Get all transactions for a user
// router.get(
//     '/transactions/:userId',
//     ...controller.users.getTransactionsByUserId
// );

export { router as usersRouter };
