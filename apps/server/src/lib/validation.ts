import { z } from "zod";

export const createUserSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    privy_id: z.string(),
    wallet_address: z.string().optional()
});

export const purchasePackSchema = z.object({
    buyerId: z.number(),
    hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
    packPrice: z.string(),
});