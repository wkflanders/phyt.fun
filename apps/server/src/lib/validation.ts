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
    privyId: z.string({
        required_error: 'Privy ID is required'
    }),
    walletAddress: z
        .string({
            required_error: 'Wallet address is required'
        })
        .regex(/^0x[a-fA-F0-9]+$/, 'Wallet address must be a valid address')
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
            tokenId: z.string({ required_error: 'Token ID is required' }),
            paymentToken: z.string({
                required_error: 'Payment token is required'
            }),
            price: z.string({ required_error: 'Order price is required' }),
            expirationTime: z.string({
                required_error: 'Expiration time is required'
            }),
            merkleRoot: z.string({
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
            tokenId: z.string({ required_error: 'Token ID is required' }),
            paymentToken: z.string({
                required_error: 'Payment token is required'
            }),
            price: z.string({ required_error: 'Order price is required' }),
            expirationTime: z.string({
                required_error: 'Expiration time is required'
            }),
            merkleRoot: z.string({
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
            tokenId: z.string({ required_error: 'Token ID is required' }),
            paymentToken: z.string({
                required_error: 'Payment token is required'
            }),
            price: z.string({ required_error: 'Order price is required' }),
            expirationTime: z.string({
                required_error: 'Expiration time is required'
            }),
            merkleRoot: z.string({
                required_error: 'Merkle root is required'
            }),
            salt: z.string({ required_error: 'Salt is required' })
        },
        { required_error: 'Order data is required' }
    ),
    expirationTime: z.string({ required_error: 'Expiration time is required' })
});

export const workoutSchema = z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    durationSeconds: z.number(),
    distance: z.number(),
    averagePaceSec: z.number().optional().nullable(),
    caloriesBurned: z.number().optional().nullable(),
    stepCount: z.number().optional().nullable(),
    elevationGain: z.number().optional().nullable(),
    averageHeartRate: z.number().optional().nullable(),
    maxHeartRate: z.number().optional().nullable(),
    deviceId: z.string().optional().nullable(),
    gpsRouteData: z.string().optional().nullable()
});

export const createPostSchema = z.object({
    userId: z.number({ required_error: 'User id is required' }),
    runId: z.number({ required_error: 'Run ID is required' }),
    content: z.string().optional().nullable().default(null)
});

export const updatePostSchema = z.object({
    status: z.enum(['visible', 'hidden', 'deleted'])
});

export const createCommentSchema = z.object({
    userId: z.number({ required_error: 'User id is required' }),
    postId: z.number({ required_error: 'Post id is required' }),
    content: z
        .string({ required_error: 'Comment content is required' })
        .min(1, 'Comment cannot be empty'),
    parentCommentId: z.number().optional().nullable().default(null)
});

export const updateCommentSchema = z.object({
    commentId: z.number({ required_error: 'Comment id is required' }),
    content: z
        .string({ required_error: 'Comment content is required' })
        .min(1, 'Comment cannot be empty')
});

export const createReactionSchema = z
    .object({
        postId: z.number().optional(),
        commentId: z.number().optional(),
        type: z.enum(['like', 'funny', 'insightful', 'fire'], {
            required_error: 'Reaction type is required'
        })
    })
    .refine((data) => data.postId ?? data.commentId, {
        message: 'Either post_id or comment_id is required'
    });
