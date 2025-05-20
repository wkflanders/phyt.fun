import { z } from 'zod';

import {
    RunnerStatus,
    RunnerSortFields,
    RunnerSortOrder,
    Runner,
    RunnerProfile,
    RunnerActivity,
    RunnerPoolStatus
} from '@phyt/types';

import { uuidv7, PaginationSchema } from './core.js';

export const RunnerStatusSchema = z.enum(['pending', 'active', 'inactive']);

export const RunnerSortFieldsSchema = z.enum([
    'username',
    'totalDistance',
    'averagePace',
    'totalRuns',
    'bestMileTime',
    'createdAt'
]);

export const RunnerSortOrderSchema = z.enum(['asc', 'desc']);

export const RunnerQueryParamsSchema = z.object({
    search: z.string().optional(),
    sortBy: RunnerSortFieldsSchema.optional(),
    sortOrder: RunnerSortOrderSchema.optional(),
    page: z.number().optional(),
    limit: z.number().optional()
});
export type RunnerQueryParamsDTO = z.infer<typeof RunnerQueryParamsSchema>;

export const RunnerSchema = z.object({
    id: uuidv7(),
    userId: uuidv7(),
    totalDistance: z.number(),
    averagePace: z.number().nullable(),
    totalRuns: z.number(),
    bestMileTime: z.number().nullable(),
    status: RunnerStatusSchema,
    isPooled: z.boolean(),
    runnerWallet: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});
export type RunnerDTO = z.infer<typeof RunnerSchema> & Runner;

export const RunnerProfileSchema = RunnerSchema.extend({
    username: z.string(),
    avatarUrl: z.string()
});
export type RunnerProfileDTO = z.infer<typeof RunnerProfileSchema> &
    RunnerProfile;

export const RunnerActivitySchema = z.object({
    id: uuidv7(),
    runnerId: uuidv7(),
    username: z.string(),
    avatarUrl: z.string(),
    distance: z.number(),
    completedAt: z.string(),
    isPooled: z.boolean(),
    timeAgo: z.string()
});
export type RunnerActivityDTO = z.infer<typeof RunnerActivitySchema> &
    RunnerActivity;

export const RunnerPoolStatusSchema = z.object({
    status: RunnerStatusSchema,
    isPooled: z.boolean()
});
export type RunnerPoolStatusDTO = z.infer<typeof RunnerPoolStatusSchema> &
    RunnerPoolStatus;

export const CreateRunnerSchema = z.object({
    userId: uuidv7(),
    runnerWallet: z.string()
});
export type CreateRunnerDTO = z.infer<typeof CreateRunnerSchema>;
