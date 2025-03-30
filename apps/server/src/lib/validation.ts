import { z } from 'zod';

export const createUserSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required'
        })
        .email('Invalid email address'),
    username: z
        .string({
            required_error: 'Username is required'
        })
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            'Username can only contain letters, numbers, underscores, and hyphens'
        ),
    privy_id: z.string({
        required_error: 'Privy ID is required'
    }),
    wallet_address: z.string().optional()
});

export const purchasePackSchema = z.object({
    buyerId: z.number({ required_error: 'Buyer ID is required' }),
    hash: z
        .string({ required_error: 'Transaction hash is required' })
        .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
    packPrice: z.string({ required_error: 'Pack price is required' }),
    packType: z.enum(['scrawny', 'toned', 'swole', 'phyt']).optional()
});

export const listingSchema = z.object({
    cardId: z.number({ required_error: 'Card ID is required' }),
    price: z.string({ required_error: 'Price is required' }),
    signature: z.string({ required_error: 'Signature is required' }),
    orderHash: z.string({ required_error: 'Order hash is required' }),
    orderData: z.object(
        {
            trader: z.string({ required_error: 'Trader is required' }),
            side: z.number({ required_error: 'Side is required' }),
            collection: z.string({ required_error: 'Collection is required' }),
            token_id: z.string({ required_error: 'Token ID is required' }),
            payment_token: z.string({
                required_error: 'Payment token is required'
            }),
            price: z.string({ required_error: 'Order price is required' }),
            expiration_time: z.string({
                required_error: 'Expiration time is required'
            }),
            merkle_root: z.string({
                required_error: 'Merkle root is required'
            }),
            salt: z.string({ required_error: 'Salt is required' })
        },
        { required_error: 'Order data is required' }
    )
});

export const bidSchema = z.object({
    listingId: z.number({ required_error: 'Listing ID is required' }),
    price: z.string({ required_error: 'Price is required' }),
    signature: z.string({ required_error: 'Signature is required' }),
    orderHash: z.string({ required_error: 'Order hash is required' }),
    orderData: z.object(
        {
            trader: z.string({ required_error: 'Trader is required' }),
            side: z.number({ required_error: 'Side is required' }),
            collection: z.string({ required_error: 'Collection is required' }),
            token_id: z.string({ required_error: 'Token ID is required' }),
            payment_token: z.string({
                required_error: 'Payment token is required'
            }),
            price: z.string({ required_error: 'Order price is required' }),
            expiration_time: z.string({
                required_error: 'Expiration time is required'
            }),
            merkle_root: z.string({
                required_error: 'Merkle root is required'
            }),
            salt: z.string({ required_error: 'Salt is required' })
        },
        { required_error: 'Order data is required' }
    )
});

export const openBidSchema = z.object({
    cardId: z.number({ required_error: 'Card ID is required' }),
    price: z.string({ required_error: 'Price is required' }),
    signature: z.string({ required_error: 'Signature is required' }),
    orderHash: z.string({ required_error: 'Order hash is required' }),
    orderData: z.object(
        {
            trader: z.string({ required_error: 'Trader is required' }),
            side: z.number({ required_error: 'Side is required' }),
            collection: z.string({ required_error: 'Collection is required' }),
            token_id: z.string({ required_error: 'Token ID is required' }),
            payment_token: z.string({
                required_error: 'Payment token is required'
            }),
            price: z.string({ required_error: 'Order price is required' }),
            expiration_time: z.string({
                required_error: 'Expiration time is required'
            }),
            merkle_root: z.string({
                required_error: 'Merkle root is required'
            }),
            salt: z.string({ required_error: 'Salt is required' })
        },
        { required_error: 'Order data is required' }
    ),
    expirationTime: z.string({ required_error: 'Expiration time is required' })
});

export const workoutSchema = z.object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    duration_seconds: z.number(),
    distance_m: z.number(),
    average_pace_sec: z.number().optional().nullable(),
    calories_burned: z.number().optional().nullable(),
    step_count: z.number().optional().nullable(),
    elevation_gain_m: z.number().optional().nullable(),
    average_heart_rate: z.number().optional().nullable(),
    max_heart_rate: z.number().optional().nullable(),
    device_id: z.string().optional().nullable(),
    gps_route_data: z.string().optional().nullable()
});

export const createPostSchema = z.object({
    run_id: z.number({ required_error: 'Run ID is required' }),
    content: z.string().optional()
});

export const updatePostSchema = z.object({
    status: z.enum(['visible', 'hidden', 'deleted'])
});

export const createCommentSchema = z.object({
    post_id: z.number({ required_error: 'Post ID is required' }),
    content: z
        .string({ required_error: 'Comment content is required' })
        .min(1, 'Comment cannot be empty'),
    parent_comment_id: z.number().optional()
});

export const updateCommentSchema = z.object({
    content: z
        .string({ required_error: 'Comment content is required' })
        .min(1, 'Comment cannot be empty')
});

export const createReactionSchema = z
    .object({
        post_id: z.number().optional(),
        comment_id: z.number().optional(),
        type: z.enum(['like', 'funny', 'insightful', 'fire'], {
            required_error: 'Reaction type is required'
        })
    })
    .refine((data) => data.post_id ?? data.comment_id, {
        message: 'Either post_id or comment_id is required'
    });
