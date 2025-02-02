import { z } from "zod";

export const createUserSchema = z.object({
    email: z.string({
        required_error: "Email is required",
    }).email("Invalid email address"),
    username: z.string({
        required_error: "Username is required",
    }).min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    privy_id: z.string({
        required_error: "Privy ID is required",
    }),
    wallet_address: z.string().optional(),
});

export const purchasePackSchema = z.object({
    buyerId: z.number(),
    hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
    packPrice: z.string(),
});