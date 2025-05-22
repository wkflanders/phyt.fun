import { z } from 'zod';

import { CommentIdSchema } from './commentsDTO.js';
import { uuidv7 } from './core.js';
import { PostIdSchema } from './postsDTO.js';
import { UserIdSchema } from './usersDTO.js';

import type {
    UUIDv7,
    Reaction,
    ReactionInsert,
    ReactionUpdate
} from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const ReactionIdSchema = z.object({
    reactionId: uuidv7()
});
export type ReactionIdDTO = z.infer<typeof ReactionIdSchema> & UUIDv7;

export const ReactionTypeSchema = z.enum([
    'like',
    'funny',
    'insightful',
    'fire'
]);

export const ReactionActionSchema = z.enum(['added', 'removed']);

export const ReactionCountSchema = z.record(ReactionTypeSchema, z.number());

export const CreateReactionSchema = z
    .object({
        userId: UserIdSchema,
        postId: PostIdSchema.optional(),
        commentId: CommentIdSchema.optional(),
        type: ReactionTypeSchema
    })
    .strict();
export type CreateReactionDTO = z.infer<typeof CreateReactionSchema> &
    ReactionInsert;

export const ReactionUpdateSchema = z.object({
    action: ReactionActionSchema,
    reaction: ReactionTypeSchema
});
export type ReactionUpdateDTO = z.infer<typeof ReactionUpdateSchema> &
    ReactionUpdate;

/* ---------- Outbound DTOs ---------- */
export const ReactionSchema = z
    .object({
        id: ReactionIdSchema,
        userId: UserIdSchema,
        postId: PostIdSchema.nullable(),
        commentId: CommentIdSchema.nullable(),
        type: ReactionTypeSchema,
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
    })
    .strict();
export type ReactionDTO = z.infer<typeof ReactionSchema> & Reaction;
