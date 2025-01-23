import express, { Router } from 'express';
import { db } from '@phyt/database';
import { users } from '@phyt/database';
import { eq } from 'drizzle-orm';
import { validateAuth } from '../middleware/auth';

const router: Router = express.Router();

// Get user by Privy ID
router.get('/:privyId', validateAuth, async (req, res) => {
    try {
        const { privyId } = req.params;

        const [user] = await db.select()
            .from(users)
            .where(eq(users.privy_id, privyId))
            .limit(1);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar_url: user.avatar_url,
                role: user.role,
                wallet_address: user.wallet_address
            }
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Failed to fetch user data" });
    }
});

// Create new user
router.post('/create', async (req, res) => {
    try {
        const { email, username, avatar_url, privy_id, wallet_address } = req.body;

        if (!email || !username) {
            return res.status(400).json({ error: "Email and username are required" });
        }

        const existingUserByEmail = await db.select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUserByEmail.length > 0) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const existingUserByUsername = await db.select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUserByUsername.length > 0) {
            return res.status(409).json({ error: "Username already taken" });
        }

        const [newUser] = await db.insert(users)
            .values({
                email,
                username,
                avatar_url: avatar_url || 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
                privy_id,
                wallet_address,
                role: 'user'
            })
            .returning();

        return res.json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                avatar_url: newUser.avatar_url,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: "Failed to create user" });
    }
});

export { router as userRouter };