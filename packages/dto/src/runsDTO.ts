import { z } from 'zod';

import { uuidv7, PaginationSchema, DeviceIdSchema } from './core.js';
import { RunnerIdSchema } from './runnersDTO.js';

import type {
    UUIDv7,
    Run,
    RunInsert,
    PaginatedRuns,
    RunUpdate,
    RunQueryParams
} from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const RunIdSchema = z
    .object({
        runId: uuidv7()
    })
    .strict();
export type RunIdDTO = z.infer<typeof RunIdSchema> & UUIDv7;

export const RunVerificationStatusSchema = z.enum([
    'pending',
    'verified',
    'flagged'
]);

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

export const CreateRunSchema = z
    .object({
        runnerId: RunnerIdSchema,
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
        deviceId: DeviceIdSchema.nullable().optional(),
        gpsRouteData: z.string().nullable().optional(),
        rawDataJson: z.record(z.string(), z.unknown()).nullable().optional()
    })
    .strict();
export type CreateRunDTO = z.infer<typeof CreateRunSchema> & RunInsert;

export const UpdateRunVerificationSchema = z
    .object({
        verificationStatus: RunVerificationStatusSchema
    })
    .strict();
export type UpdateRunVerificationDTO = z.infer<
    typeof UpdateRunVerificationSchema
> &
    RunUpdate;

/* ---------- Outbound DTOs ---------- */
export const RunSchema = z
    .object({
        id: RunIdSchema,
        runnerId: RunnerIdSchema,
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
        deviceId: DeviceIdSchema.nullable(),
        gpsRouteData: z.string().nullable(),
        isPosted: z.boolean().nullable(),
        verificationStatus: RunVerificationStatusSchema,
        rawDataJson: z.record(z.string(), z.unknown()).nullable(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
    .strict();
export type RunDTO = z.infer<typeof RunSchema> & Run;

export const RunsPageSchema = z
    .object({
        runs: z.array(RunSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type RunsPageDTO = z.infer<typeof RunsPageSchema> & PaginatedRuns;
