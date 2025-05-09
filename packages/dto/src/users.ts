import { z } from 'zod';

import {
    User,
    UserWithStatus,
    UserRole,
    CreateUserRequest,
    UserResponse
} from '@phyt/models';

import { uuidv7, DTOSchema, PaginationSchema } from './primitives.js';
import { RunnerStatusSchema } from './runners.js';

export const UserIdSchema = z.object({
    userId: uuidv7({
        required_error: 'UserId is required'
    })
});
export type UserIdDTO = z.infer<typeof UserIdSchema>;

const UserRoleSchema = z.enum(['admin', 'user', 'runner']);

export const userSchema = z
    .object({
        id: uuidv7({ required_error: 'User userId is required' }),
        email: z
            .string({
                required_error: 'User email is required'
            })
            .email('Invalid email address'),
        username: z
            .string({
                required_error: 'User username is required'
            })
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username must be at most 30 characters')
            .regex(
                /^[a-zA-Z0-9_-]+$/,
                'Username can only contain letters, numbers, underscores, and hyphens'
            ),
        role: UserRoleSchema,
        privyId: z.string({
            required_error: 'User privyId is required'
        }),
        avatarUrl: z
            .string()
            .default(
                'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut'
            ),
        walletAddress: z
            .string({
                required_error: 'Wallet address is required'
            })
            .regex(/^0x[a-fA-F0-9]+$/, 'Wallet address must be a valid address')
            .transform((val) => val as `0x${string}`),
        phytnessPoints: z.number().nullable(),
        twitterHandle: z.string().nullable(),
        stravaHandle: z.string().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export const UserSchema: DTOSchema<User> = userSchema;
export type UserDTO = z.infer<typeof UserSchema>;

export const userWithStatusSchema = userSchema
    .extend({
        status: RunnerStatusSchema.optional()
    })
    .strict();
export const UserWithStatusSchema: DTOSchema<User> = userWithStatusSchema;
export type UserWithStatusDTO = z.infer<typeof UserWithStatusSchema>;

// This should be validated on the client (don't waste a slow API call), but should definitely check on server when an actual api call is made to be safe
export const CreateUserSchema: DTOSchema<CreateUserRequest> = z
    .object({
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
            .transform((val) => val as `0x${string}`)
    })
    .strict();
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
