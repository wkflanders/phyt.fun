import { z } from 'zod';

import { uuidv7 } from './core.js';

import type {
    Reaction,
    ReactionInsert,
    ReactionType,
    ReactionCount,
    ReactionAction,
    ReactionToggle,
    ReactionWithUser
} from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const ReactionTypeSchema = z.enum([
    'like',
    'funny',
    'insightful',
    'fire'
]);
export type ReactionTypeDTO = z.infer<typeof ReactionTypeSchema> & ReactionType;

export const CreateReactionSchema = z
    .object({
        userId: uuidv7(),
        postId: uuidv7().optional(),
        commentId: uuidv7().optional(),
        type: ReactionTypeSchema
    })
    .strict()
    .refine(
        (data) => {
            const hasPostId = Boolean(data.postId);
            const hasCommentId = Boolean(data.commentId);
            return (hasPostId || hasCommentId) && !(hasPostId && hasCommentId);
        },
        {
            message: 'Either postId or commentId must be provided, but not both'
        }
    );
export type CreateReactionDTO = z.infer<typeof CreateReactionSchema> &
    ReactionInsert;

export const ReactionIdSchema = z.object({
    reactionId: uuidv7()
});
export type ReactionIdDTO = z.infer<typeof ReactionIdSchema>;

export const ReactionQuerySchema = z
    .object({
        postId: uuidv7().optional(),
        commentId: uuidv7().optional(),
        userId: uuidv7().optional()
    })
    .refine(
        (data) => {
            // At least one of postId or commentId must be provided
            return Boolean(data.postId) || Boolean(data.commentId);
        },
        {
            message: 'Either postId or commentId must be provided'
        }
    );
export type ReactionQueryDTO = z.infer<typeof ReactionQuerySchema>;

/* ---------- Outbound DTOs ---------- */
export const ReactionSchema = z
    .object({
        id: uuidv7(),
        userId: uuidv7(),
        postId: uuidv7().optional(),
        commentId: uuidv7().optional(),
        type: ReactionTypeSchema,
        createdAt: z.coerce.date()
    })
    .strict();
export type ReactionDTO = z.infer<typeof ReactionSchema> & Reaction;

export const ReactionWithUserSchema = z
    .object({
        id: uuidv7(),
        userId: uuidv7(),
        postId: uuidv7().optional(),
        commentId: uuidv7().optional(),
        type: ReactionTypeSchema,
        createdAt: z.coerce.date(),
        username: z.string(),
        avatarUrl: z.string().nullable()
    })
    .strict();
export type ReactionWithUserDTO = z.infer<typeof ReactionWithUserSchema> &
    ReactionWithUser;

export const ReactionCountSchema = z.record(ReactionTypeSchema, z.number());
export type ReactionCountDTO = z.infer<typeof ReactionCountSchema> &
    ReactionCount;

export const ReactionActionSchema = z.enum(['added', 'removed']);
export type ReactionActionDTO = z.infer<typeof ReactionActionSchema> &
    ReactionAction;

export const ReactionToggleSchema = z.object({
    action: ReactionActionSchema,
    reaction: ReactionTypeSchema,
    counts: ReactionCountSchema
});
export type ReactionToggleDTO = z.infer<typeof ReactionToggleSchema> &
    ReactionToggle;
