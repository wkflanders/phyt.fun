import {
    Runner,
    RunnerInsert,
    RunnerUpdate,
    PaginatedRunners,
    RunnerQueryParams,
    RunnerActivities,
    RunnerActivity
} from '@phyt/types';

import { z } from 'zod';

import { uuidv7, PaginationSchema, WalletAddressValueSchema } from './core.js';
import { RunIdValueSchema } from './runsDTO.js';
import { UserIdValueSchema, UserInfoSchema } from './usersDTO.js';

/* ---------- Inbound DTOs ---------- */
export const RunnerIdValueSchema = uuidv7();
export const RunnerIdSchema = z.object({
    runnerId: RunnerIdValueSchema
});
export type RunnerIdDTO = z.infer<typeof RunnerIdValueSchema>;

export const RunnerStatusSchema = z.enum(['pending', 'active', 'inactive']);

export const CreateRunnerSchema = z.object({
    userId: UserIdValueSchema,
    totalDistance: z.number(),
    averagePace: z.number().nullable(),
    totalRuns: z.number(),
    bestMileTime: z.number().nullable(),
    status: RunnerStatusSchema,
    isPooled: z.boolean(),
    runnerWallet: WalletAddressValueSchema
});
export type CreateRunnerDTO = z.infer<typeof CreateRunnerSchema> & RunnerInsert;

export const UpdateRunnerSchema = z.object({
    totalDistance: z.number().optional(),
    averagePace: z.number().nullable().optional(),
    totalRuns: z.number().optional(),
    bestMileTime: z.number().nullable().optional(),
    status: RunnerStatusSchema.optional(),
    isPooled: z.boolean().optional(),
    runnerWallet: WalletAddressValueSchema.optional()
});
export type UpdateRunnerDTO = z.infer<typeof UpdateRunnerSchema> & RunnerUpdate;

export const RunnerQueryParamsSchema = z.object({
    search: z.string().optional(),
    sortBy: z
        .enum([
            'username',
            'totalDistance',
            'averagePace',
            'totalRuns',
            'bestMileTime',
            'createdAt'
        ])
        .optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.number().optional(),
    limit: z.number().optional()
});
export type RunnerQueryParamsDTO = z.infer<typeof RunnerQueryParamsSchema> &
    RunnerQueryParams;

/* ---------- Outbound DTOs ---------- */
export const RunnerSchema = z.object({
    id: RunnerIdValueSchema,
    userId: UserIdValueSchema,
    totalDistance: z.number(),
    averagePace: z.number().nullable(),
    totalRuns: z.number(),
    bestMileTime: z.number().nullable(),
    status: RunnerStatusSchema,
    isPooled: z.boolean(),
    runnerWallet: WalletAddressValueSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    username: UserInfoSchema.shape.username.optional(),
    avatarUrl: UserInfoSchema.shape.avatarUrl.optional()
});
export type RunnerDTO = z.infer<typeof RunnerSchema> & Runner;

export const RunnersPageSchema = z.object({
    runners: z.array(RunnerSchema),
    pagination: PaginationSchema
});
export type RunnersPageDTO = z.infer<typeof RunnersPageSchema> &
    PaginatedRunners;

export const RunnerActivitySchema = z.object({
    runId: RunIdValueSchema,
    runnerId: RunnerIdValueSchema,
    username: UserInfoSchema.shape.username,
    avatarUrl: UserInfoSchema.shape.avatarUrl,
    distance: z.number(),
    completedAt: z.string(),
    isPooled: z.boolean(),
    timeAgo: z.string()
});
export type RunnerActivityDTO = z.infer<typeof RunnerActivitySchema> &
    RunnerActivity;

export const RunnerActivitiesSchema = z.object({
    activities: z.array(RunnerActivitySchema)
});
export type RunnerActivitiesDTO = z.infer<typeof RunnerActivitiesSchema> &
    RunnerActivities;
