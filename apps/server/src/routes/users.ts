import express, { Router } from 'express';
import { userService } from '../services/userServices';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { createUserSchema } from '../lib/validation';
import multer from 'multer';

const router: Router = express.Router();

const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024,
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
router.get('/transactions/:privyId', async (req, res) => {
    try {
        const transactions = await userService.getTransactionsByPrivyId(req.params.privyId);
        return res.status(200).json(transactions); // Return transactions directly
    } catch (error: any) {
        console.error("Error in GET /users/:privyId/transactions:", error);
        return res.status(error.statusCode || 500).json({
            error: error.message || "Failed to fetch user transactions"
        });
    }
});

// Get user by privy Id
router.get('/:privyId', async (req, res) => {
    try {
        const user = await userService.getUserByPrivyId(req.params.privyId);
        return res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
            role: user.role,
            wallet_address: user.wallet_address,
            phytness_points: user.phytness_points,
            created_at: user.created_at,
            updated_at: user.updated_at
        });
    } catch (error: any) {
        console.error("Error in GET /:privyId:", error);
        return res.status(error.statusCode || 500).json({
            error: error.message || "Failed to fetch user data"
        });
    }
});

// Get user by privy Id with runner status
router.get('/status/:privyId', async (req, res) => {
    try {
        const user = await userService.getUserByPrivyId(req.params.privyId, true);
        return res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
            role: user.role,
            wallet_address: user.wallet_address,
            phytness_points: user.phytness_points,
            status: (user as any).status,
            created_at: user.created_at,
            updated_at: user.updated_at
        });
    } catch (error: any) {
        console.error("Error in GET /:privyId/status:", error);
        return res.status(error.statusCode || 500).json({
            error: error.message || "Failed to fetch user data"
        });
    }
});

// Get user by email

// Get user by username 

// Create new user
router.post('/create', upload.single('avatar'), async (req, res) => {
    try {
        // Validate the request body
        const validatedData = createUserSchema.parse({
            email: req.body.email,
            username: req.body.username,
            privy_id: req.body.privy_id,
            wallet_address: req.body.wallet_address || undefined
        });

        const newUser = await userService.createUser({
            ...validatedData,
            avatarFile: req.file // Pass the file if it exists
        });

        return res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            avatar_url: newUser.avatar_url,
            role: newUser.role
        });
    } catch (error: any) {
        console.error('Error in POST /create:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size cannot exceed 5MB' });
        }
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(error.statusCode || 500).json({
            error: error.message || "Failed to create user"
        });
    }
});

// Get all the cards owned by a privy Id
router.get('/cards/:privyId', async (req, res) => {
    try {
        const cards = await userService.getCardsByPrivyId(req.params.privyId);
        return res.status(200).json(cards);
    } catch (error: any) {
        console.error("Error in GET /users/:privyId/cards:", error);
        return res.status(error.statusCode || 500).json({
            error: error.message || "Failed to fetch user cards"
        });
    }
});

router.get('/');

export { router as userRouter };