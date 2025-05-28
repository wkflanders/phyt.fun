import { DefaultAvatar } from '@phyt/models';

import { z } from 'zod';

import {
    uuidv7,
    PaginationSchema,
    PrivyIdValueSchema,
    WalletAddressValueSchema
} from './core.js';

import type {
    User,
    UserInsert,
    UserUpdate,
    UserQueryParams,
    PaginatedUsers
} from '@phyt/types';

const EmailValueSchema = z.string().email();
export const EmailSchema = z.object({
    email: z.string().email()
});
export type EmailDTO = z.infer<typeof EmailValueSchema>;

const UsernameValueSchema = z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/);
export const UsernameSchema = z.object({
    username: UsernameValueSchema
});
export type UsernameDTO = z.infer<typeof UsernameValueSchema>;

export const UserInfoSchema = z.object({
    email: EmailValueSchema.optional(),
    username: UsernameValueSchema.optional(),
    avatarUrl: z.string().default(DefaultAvatar).optional()
});

/* ------------ Inbound DTOs ------------ */
export const UserIdValueSchema = uuidv7();
export const UserIdSchema = z.object({
    userId: UserIdValueSchema
});
export type UserIdDTO = z.infer<typeof UserIdValueSchema>;

export const UserRoleSchema = z.enum(['admin', 'user', 'runner']);

export const CreateUserSchema = z
    .object({
        email: z.string().email(),
        username: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_-]+$/),
        privyId: PrivyIdValueSchema,
        walletAddress: WalletAddressValueSchema
    })
    .strict();
export type CreateUserDTO = z.infer<typeof CreateUserSchema> & UserInsert;

export const UpdateUserSchema = z
    .object({
        email: UserInfoSchema.shape.email.optional(),
        username: UserInfoSchema.shape.username.optional(),
        privyId: PrivyIdValueSchema.optional(),
        walletAddress: WalletAddressValueSchema.optional(),
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
        id: UserIdValueSchema,
        email: z.string().email(),
        username: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_-]+$/),
        role: UserRoleSchema,
        privyId: PrivyIdValueSchema,
        avatarUrl: z.string().default(DefaultAvatar),
        walletAddress: WalletAddressValueSchema,
        phytnessPoints: z.number(),
        twitterHandle: z.string().nullable(),
        stravaHandle: z.string().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        deletedAt: z.coerce.date().nullable()
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
