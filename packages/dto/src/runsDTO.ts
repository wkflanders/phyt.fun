import { z } from 'zod';

import { uuidv7, PaginationSchema } from './core.js';

import type { Run, RunInsert, PaginatedRuns, RunWithRunner } from '@phyt/types';

// Define the verification status enum
export const RunVerificationStatusSchema = z.enum([
    'pending',
    'verified',
    'flagged'
]);

/* ---------- Inbound DTOs ---------- */
export const RunIdSchema = z
    .object({
        runId: uuidv7()
    })
    .strict();
export type RunIdDTO = z.infer<typeof RunIdSchema>;

export const RunnerIdSchema = z
    .object({
        runnerId: uuidv7()
    })
    .strict();
export type RunnerIdDTO = z.infer<typeof RunnerIdSchema>;

export const RunQueryParamsSchema = z
    .object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        sortBy: z.enum(['startTime', 'distance', 'durationSeconds']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional()
    })
    .strict();
export type RunQueryParamsDTO = z.infer<typeof RunQueryParamsSchema>;

// Create a schema for creating a new run
export const CreateRunSchema = z
    .object({
        runnerId: uuidv7(),
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
        deviceId: z.string().nullable().optional(),
        gpsRouteData: z.string().nullable().optional(),
        rawDataJson: z.record(z.string(), z.unknown()).nullable().optional()
    })
    .strict();
export type CreateRunDTO = z.infer<typeof CreateRunSchema>;

// Create a schema for updating run verification status
export const UpdateRunVerificationSchema = z
    .object({
        verificationStatus: RunVerificationStatusSchema
    })
    .strict();
export type UpdateRunVerificationDTO = z.infer<
    typeof UpdateRunVerificationSchema
>;

/* ---------- Outbound DTOs ---------- */
// Basic run schema
export const RunSchema = z
    .object({
        id: uuidv7(),
        runnerId: uuidv7(),
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
        deviceId: z.string().nullable(),
        gpsRouteData: z.string().nullable(),
        isPosted: z.boolean().nullable(),
        verificationStatus: RunVerificationStatusSchema,
        rawDataJson: z.record(z.string(), z.unknown()).nullable(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
    .strict();
export type RunDTO = z.infer<typeof RunSchema>;

// Run with runner info
export const RunWithRunnerSchema = RunSchema.extend({
    runnerUsername: z.string(),
    runnerAvatarUrl: z.string().nullable()
}).strict();
export type RunWithRunnerDTO = z.infer<typeof RunWithRunnerSchema>;

// Paginated runs response
export const RunsPageSchema = z
    .object({
        runs: z.array(RunSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type RunsPageDTO = z.infer<typeof RunsPageSchema>;

// Paginated runs with runner info response
export const RunsWithRunnerPageSchema = z
    .object({
        runs: z.array(RunWithRunnerSchema),
        pagination: PaginationSchema.optional()
    })
    .strict();
export type RunsWithRunnerPageDTO = z.infer<typeof RunsWithRunnerPageSchema>;
