import { z } from "zod";

export const createUserSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    avatar_url: z.string().url().optional(),
    privy_id: z.string(),
    wallet_address: z.string().optional()
});