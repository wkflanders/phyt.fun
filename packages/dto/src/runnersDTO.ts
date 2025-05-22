import { z } from 'zod';

import {
    UUIDv7,
    Runner,
    RunnerInsert,
    RunnerUpdate,
    PaginatedRunners,
    RunnerQueryParams
} from '@phyt/types';

import { uuidv7, PaginationSchema, WalletAddressSchema } from './core.js';
import { UserIdSchema } from './usersDTO.js';

/* ---------- Inbound DTOs ---------- */
export const RunnerIdSchema = z.object({
    runnerId: uuidv7()
});
export type RunnerIdDTO = z.infer<typeof RunnerIdSchema> & UUIDv7;

export const RunnerStatusSchema = z.enum(['pending', 'active', 'inactive']);

export const CreateRunnerSchema = z.object({
    userId: UserIdSchema,
    runnerWallet: WalletAddressSchema
});
export type CreateRunnerDTO = z.infer<typeof CreateRunnerSchema> & RunnerInsert;

export const UpdateRunnerSchema = z.object({
    status: RunnerStatusSchema,
    isPooled: z.boolean()
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
    id: RunnerIdSchema,
    userId: UserIdSchema,
    totalDistance: z.number(),
    averagePace: z.number().nullable(),
    totalRuns: z.number(),
    bestMileTime: z.number().nullable(),
    status: RunnerStatusSchema,
    isPooled: z.boolean(),
    runnerWallet: WalletAddressSchema,
    createdAt: z.date(),
    updatedAt: z.date()
});
export type RunnerDTO = z.infer<typeof RunnerSchema> & Runner;

export const RunnersPageSchema = z.object({
    runners: z.array(RunnerSchema),
    pagination: PaginationSchema
});
export type RunnersPageDTO = z.infer<typeof RunnersPageSchema> &
    PaginatedRunners;
