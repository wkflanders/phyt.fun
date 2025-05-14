import { z } from 'zod';

import { User, UserWithStatus, UserInsert, DefaultAvatar } from '@phyt/types';

import { uuidv7 } from './core.js';
import { RunnerStatusSchema } from './runners.js';

export const UserIdSchema = z.object({
    userId: uuidv7()
});
export type UserIdDTO = z.infer<typeof UserIdSchema>;

const UserRoleSchema = z.enum(['admin', 'user', 'runner']);

export const UpdateAvatarSchema = z.object({ avatarUrl: z.string().url() });
export type UpdateAvatarDTO = z.infer<typeof UpdateAvatarSchema>;

export const userSchema = z
    .object({
        id: uuidv7(),
        email: z.string().email('Invalid email address'),
        username: z
            .string()
            .min(3)
            .max(30)
            .regex(
                /^[a-zA-Z0-9_-]+$/,
                'Username can only contain letters, numbers, underscores, and hyphens'
            ),
        role: UserRoleSchema,
        privyId: z.string(),
        avatarUrl: z.string().default(DefaultAvatar),
        walletAddress: z
            .string()
            .regex(/^0x[a-fA-F0-9]+$/)
            .transform((val) => val as `0x${string}`),
        phytnessPoints: z.number().nullable(),
        twitterHandle: z.string().nullable(),
        stravaHandle: z.string().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export const UserSchema = userSchema;
export type UserDTO = z.infer<typeof UserSchema> & User;

export const userWithStatusSchema = userSchema
    .extend({
        status: RunnerStatusSchema.optional()
    })
    .strict();
export const UserWithStatusSchema = userWithStatusSchema;
export type UserWithStatusDTO = z.infer<typeof UserWithStatusSchema> &
    UserWithStatus;

// This should be validated on the client (don't waste a slow API call), but should definitely check on server when an actual api call is made to be safe
export const CreateUserSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        username: z
            .string()
            .min(3)
            .max(30)
            .regex(
                /^[a-zA-Z0-9_-]+$/,
                'Username can only contain letters, numbers, underscores, and hyphens'
            ),
        privyId: z.string(),
        walletAddress: z
            .string()
            .regex(/^0x[a-fA-F0-9]+$/)
            .transform((val) => val as `0x${string}`)
    })
    .strict();
export type CreateUserDTO = z.infer<typeof CreateUserSchema> & UserInsert;
