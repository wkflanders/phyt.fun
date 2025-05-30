import { UUIDv7, PaginatedCompetitions } from '@phyt/types';

import { z } from 'zod';

import { PaginationSchema, uuidv7 } from './core.js';

/* ---------- Inbound DTOs ---------- */
export const CompetitionIdSchema = z.object({
    competitionId: uuidv7()
});
export type CompetitionIdDTO = z.infer<typeof CompetitionIdSchema> & UUIDv7;

export const CompetitionCreateSchema = z.object({
    eventName: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    jackpot: z.string(),
    distance: z.number().nullable(),
    eventType: z.string().nullable()
});
export type CompetitionCreateDTO = z.infer<typeof CompetitionCreateSchema>;

export const CompetitionUpdateSchema = z.object({
    eventName: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    jackpot: z.string().optional(),
    distance: z.number().nullable().optional(),
    eventType: z.string().nullable().optional()
});
export type CompetitionUpdateDTO = z.infer<typeof CompetitionUpdateSchema>;

export const CompetitionQueryParamsSchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional()
});
export type CompetitionQueryParamsDTO = z.infer<
    typeof CompetitionQueryParamsSchema
>;

/* ---------- Outbound DTOs ---------- */
export const CompetitionSchema = z.object({
    id: uuidv7(),
    eventName: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    jackpot: z.string(),
    distance: z.number().nullable(),
    eventType: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable()
});
export type CompetitionDTO = z.infer<typeof CompetitionSchema> & UUIDv7;

export const CompetitionsPageSchema = z.object({
    competitions: z.array(CompetitionSchema),
    pagination: PaginationSchema.optional()
});
export type CompetitionsPageDTO = z.infer<typeof CompetitionsPageSchema> &
    PaginatedCompetitions;
