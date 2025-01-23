import express from 'express';
import { db } from '@phyt/database';
import { users } from '@phyt/database/src/schema';
import { eq } from 'drizzle-orm';
import { validateAuth } from '../middleware/auth';

const router = express.Router();

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