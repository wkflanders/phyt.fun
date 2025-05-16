import { z } from 'zod';

import {
    User,
    UserWithStatus,
    UserInsert,
    DefaultAvatar,
    UserQueryParams,
    PaginatedUsers
} from '@phyt/types';

import { uuidv7, PaginationSchema } from './core.js';
import { RunnerStatusSchema } from './runnersDTO.js';

/* ------------ Shared ------------------ */
export const UserRoleSchema = z.enum(['admin', 'user', 'runner']);

/* ------------ Inbound DTOs ------------ */
export const UserIdSchema = z.object({
    userId: uuidv7()
});
export type UserIdDTO = z.infer<typeof UserIdSchema>;

export const UpdateAvatarSchema = z.object({
    avatarUrl: z.string().url()
});
export type UpdateAvatarDTO = z.infer<typeof UpdateAvatarSchema>;

export const UpdateProfileSchema = z
    .object({
        twitterHandle: z.string().nullable().optional(),
        stravaHandle: z.string().nullable().optional()
    })
    .strict();
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

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
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .transform((val) => val as `0x${string}`)
    })
    .strict();
export type CreateUserDTO = z.infer<typeof CreateUserSchema> & UserInsert;

export const UserQueryParamsSchema = z
    .object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        parentOnly: z.coerce.boolean().optional()
    })
    .strict();
export type UserQueryParamsDTO = z.infer<typeof UserQueryParamsSchema> &
    UserQueryParams;

/* ------------ Outbound DTOs ----------- */
export const UserSchema = z
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
        phytnessPoints: z.number(),
        twitterHandle: z.string().nullable(),
        stravaHandle: z.string().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type UserDTO = z.infer<typeof UserSchema> & User;

export const UserWithStatusSchema = UserSchema.extend({
    status: RunnerStatusSchema.optional()
}).strict();
export type UserWithStatusDTO = z.infer<typeof UserWithStatusSchema> &
    UserWithStatus;

export const UsersPageSchema = z
    .object({
        users: z.array(UserWithStatusSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type UsersPageDTO = z.infer<typeof UsersPageSchema> & PaginatedUsers;
