import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';
import { RunnerIdValueSchema, RunnerSchema } from './runnersDTO.js';
import { UserInfoSchema } from './usersDTO.js';

import type {
    Run,
    RunInsert,
    RunUpdate,
    RunQueryParams,
    PaginatedRuns
} from '@phyt/types';

export const RunVerificationStatusSchema = z.enum([
    'pending',
    'verified',
    'flagged'
]);

export const DeviceIdValueSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,255}$/);

/* ---------- Inbound DTOs ---------- */
export const RunIdValueSchema = uuidv7();
export const RunIdSchema = z.object({
    runId: RunIdValueSchema
});
export type RunIdDTO = z.infer<typeof RunIdValueSchema>;

export const CreateRunSchema = z
    .object({
        runnerId: RunnerIdValueSchema,
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        durationSeconds: z.number().int().positive(),
        distance: z.number().positive(),
        averagePaceSec: z.number().nullable().optional(),
        caloriesBurned: z.number().int().nullable().optional(),
        stepCount: z.number().int().nullable().optional(),
        elevationGain: z.number().nullable().optional(),
        averageHeartRate: z.number().int().nullable().optional(),
        maxHeartRate: z.number().int().nullable().optional(),
        deviceId: DeviceIdValueSchema.nullable().optional(),
        gpsRouteData: z.string().nullable().optional(),
        rawDataJson: z.record(z.string(), z.unknown()).nullable().optional(),
        verificationStatus: RunVerificationStatusSchema.optional()
    })
    .strict();
export type CreateRunDTO = z.infer<typeof CreateRunSchema> & RunInsert;

export const UpdateRunSchema = z
    .object({
        startTime: z.coerce.date().optional(),
        endTime: z.coerce.date().optional(),
        durationSeconds: z.number().int().positive().optional(),
        distance: z.number().positive().optional(),
        averagePaceSec: z.number().int().nullable().optional(),
        caloriesBurned: z.number().int().nullable().optional(),
        stepCount: z.number().int().nullable().optional(),
        elevationGain: z.number().nullable().optional(),
        averageHeartRate: z.number().int().nullable().optional(),
        maxHeartRate: z.number().int().nullable().optional(),
        deviceId: DeviceIdValueSchema.nullable().optional(),
        gpsRouteData: z.string().nullable().optional(),
        rawDataJson: z.record(z.string(), z.unknown()).nullable().optional(),
        isPosted: z.boolean().nullable().optional(),
        verificationStatus: RunVerificationStatusSchema.optional()
    })
    .strict();
export type UpdateRunDTO = z.infer<typeof UpdateRunSchema> & RunUpdate;

export const RunQueryParamsSchema = z
    .object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        sortBy: z.enum(['startTime', 'distance', 'durationSeconds']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional()
    })
    .strict();
export type RunQueryParamsDTO = z.infer<typeof RunQueryParamsSchema> &
    RunQueryParams;

/* ---------- Outbound DTOs ---------- */
export const RunSchema = z
    .object({
        id: RunIdValueSchema,
        runnerId: RunnerIdValueSchema,
        startTime: z.date(),
        endTime: z.date(),
        durationSeconds: z.number().int().positive(),
        distance: z.number().positive(),
        averagePaceSec: z.number().nullable(),
        caloriesBurned: z.number().int().nullable(),
        stepCount: z.number().int().nullable(),
        elevationGain: z.number().nullable(),
        averageHeartRate: z.number().int().nullable(),
        maxHeartRate: z.number().int().nullable(),
        deviceId: DeviceIdValueSchema.nullable(),
        gpsRouteData: z.string().nullable(),
        isPosted: z.boolean().nullable(),
        verificationStatus: RunVerificationStatusSchema,
        rawDataJson: z.record(z.string(), z.unknown()).nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
        deletedAt: z.date().nullable(),
        runner: RunnerSchema.optional(),
        username: UserInfoSchema.shape.username.optional(),
        avatarUrl: UserInfoSchema.shape.avatarUrl.optional()
    })
    .strict();
export type RunDTO = z.infer<typeof RunSchema> & Run;

export const RunWithRunnerSchema = z
    .object({
        run: RunSchema,
        runner: RunnerSchema
    })
    .strict();
export type RunWithRunnerDTO = z.infer<typeof RunWithRunnerSchema> & Run;

export const RunsPageSchema = z
    .object({
        runs: z.array(RunSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type RunsPageDTO = z.infer<typeof RunsPageSchema> & PaginatedRuns;

export const RunsWithRunnerPageSchema = z
    .object({
        runs: z.array(RunWithRunnerSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type RunsWithRunnerPageDTO = z.infer<typeof RunsWithRunnerPageSchema> &
    PaginatedRuns;
