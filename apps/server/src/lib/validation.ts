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
    buyerId: z.number({ required_error: "Buyer ID is required" }),
    hash: z.string({ required_error: "Transaction hash is required" })
        .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
    packPrice: z.string({ required_error: "Pack price is required" }),
});

export const listingSchema = z.object({
    cardId: z.number({ required_error: "Card ID is required" }),
    price: z.string({ required_error: "Price is required" }),
    signature: z.string({ required_error: "Signature is required" }),
    orderHash: z.string({ required_error: "Order hash is required" }),
    orderData: z.object({
        trader: z.string({ required_error: "Trader is required" }),
        side: z.number({ required_error: "Side is required" }),
        collection: z.string({ required_error: "Collection is required" }),
        token_id: z.string({ required_error: "Token ID is required" }),
        payment_token: z.string({ required_error: "Payment token is required" }),
        price: z.string({ required_error: "Order price is required" }),
        expiration_time: z.string({ required_error: "Expiration time is required" }),
        merkle_root: z.string({ required_error: "Merkle root is required" }),
        salt: z.string({ required_error: "Salt is required" })
    }, { required_error: "Order data is required" }),
});

export const bidSchema = z.object({
    listingId: z.number({ required_error: "Listing ID is required" }),
    price: z.string({ required_error: "Price is required" }),
    signature: z.string({ required_error: "Signature is required" }),
    orderHash: z.string({ required_error: "Order hash is required" }),
    orderData: z.object({
        trader: z.string({ required_error: "Trader is required" }),
        side: z.number({ required_error: "Side is required" }),
        collection: z.string({ required_error: "Collection is required" }),
        token_id: z.string({ required_error: "Token ID is required" }),
        payment_token: z.string({ required_error: "Payment token is required" }),
        price: z.string({ required_error: "Order price is required" }),
        expiration_time: z.string({ required_error: "Expiration time is required" }),
        merkle_root: z.string({ required_error: "Merkle root is required" }),
        salt: z.string({ required_error: "Salt is required" })
    }, { required_error: "Order data is required" })
});

export const openBidSchema = z.object({
    cardId: z.number({ required_error: "Card ID is required" }),
    price: z.string({ required_error: "Price is required" }),
    signature: z.string({ required_error: "Signature is required" }),
    orderHash: z.string({ required_error: "Order hash is required" }),
    orderData: z.object({
        trader: z.string({ required_error: "Trader is required" }),
        side: z.number({ required_error: "Side is required" }),
        collection: z.string({ required_error: "Collection is required" }),
        token_id: z.string({ required_error: "Token ID is required" }),
        payment_token: z.string({ required_error: "Payment token is required" }),
        price: z.string({ required_error: "Order price is required" }),
        expiration_time: z.string({ required_error: "Expiration time is required" }),
        merkle_root: z.string({ required_error: "Merkle root is required" }),
        salt: z.string({ required_error: "Salt is required" })
    }, { required_error: "Order data is required" }),
    expirationTime: z.string({ required_error: "Expiration time is required" })
});