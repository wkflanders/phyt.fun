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

// GET
// All user transactions
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

// GET 
// User by Privy ID
router.get('/:privyId', async (req, res) => {
    try {
        const user = await userService.getUserByPrivyId(req.params.privyId);
        return res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
            role: user.role,
            wallet_address: user.wallet_address
        });
    } catch (error: any) {
        console.error("Error in GET /:privyId:", error);
        return res.status(error.statusCode || 500).json({
            error: error.message || "Failed to fetch user data"
        });
    }
});

// GET
// User by email


// GET
// User by username 

// POST
// Create new user
router.post('/create', validateSchema(createUserSchema), async (req, res) => {
    try {
        const { email, username, privy_id, wallet_address } = req.body;
        const newUser = await userService.createUser({
            email, username, avatarFile: req.file, privy_id, wallet_address
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
        return res.status(error.statusCode || 500).json({
            error: error.message || "Failed to create user"
        });
    }
});

export { router as userRouter };