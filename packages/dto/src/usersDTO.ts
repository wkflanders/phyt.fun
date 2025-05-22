import { z } from 'zod';

import { DefaultAvatar } from '@phyt/models';

import { uuidv7, PaginationSchema, WalletAddressSchema } from './core.js';

import type {
    UUIDv7,
    User,
    UserInsert,
    UserUpdate,
    UserQueryParams,
    PaginatedUsers
} from '@phyt/types';

/* ------------ Inbound DTOs ------------ */
export const UserIdSchema = z.object({
    userId: uuidv7()
});
export type UserIdDTO = z.infer<typeof UserIdSchema> & UUIDv7;

export const UserRoleSchema = z.enum(['admin', 'user', 'runner']);

export const CreateUserSchema = z
    .object({
        email: z.string().email(),
        username: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_-]+$/),
        privyId: z.string(),
        walletAddress: WalletAddressSchema
    })
    .strict();
export type CreateUserDTO = z.infer<typeof CreateUserSchema> & UserInsert;

export const UpdateUserSchema = z
    .object({
        email: z.string().email().optional(),
        username: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_-]+$/)
            .optional(),
        privyId: z.string().optional(),
        walletAddress: WalletAddressSchema.optional(),
        avatarUrl: z.string().optional(),
        role: UserRoleSchema.optional(),
        phytnessPoints: z.number().optional(),
        twitterHandle: z.string().nullable().optional(),
        stravaHandle: z.string().nullable().optional()
    })
    .strict();
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema> & UserUpdate;

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
        id: UserIdSchema,
        email: z.string().email(),
        username: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_-]+$/),
        role: UserRoleSchema,
        privyId: z.string(),
        avatarUrl: z.string().default(DefaultAvatar),
        walletAddress: WalletAddressSchema,
        phytnessPoints: z.number(),
        twitterHandle: z.string().nullable(),
        stravaHandle: z.string().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type UserDTO = z.infer<typeof UserSchema> & User;

export const UsersPageSchema = z
    .object({
        users: z.array(UserSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type UsersPageDTO = z.infer<typeof UsersPageSchema> & PaginatedUsers;
