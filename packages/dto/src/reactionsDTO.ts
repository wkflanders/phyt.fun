import { z } from 'zod';

import { CommentIdValueSchema } from './commentsDTO.js';
import { uuidv7 } from './core.js';
import { PostIdValueSchema } from './postsDTO.js';
import { UserIdValueSchema, UserInfoSchema } from './usersDTO.js';

import type { Reaction, ReactionInsert, ReactionUpdate } from '@phyt/types';

/* ---------- Inbound DTOs ---------- */
export const ReactionIdValueSchema = uuidv7();
export const ReactionIdSchema = z.object({
    reactionId: ReactionIdValueSchema
});
export type ReactionIdDTO = z.infer<typeof ReactionIdValueSchema>;

export const EntityIdValueSchema = uuidv7();
export const EntityIdSchema = z.object({
    entityId: EntityIdValueSchema
});
export type EntityIdDTO = z.infer<typeof EntityIdValueSchema>;

export const EntityTypeSchema = z.enum(['post', 'comment']);
export type EntityTypeDTO = z.infer<typeof EntityTypeSchema>;

export const ReactionTypeSchema = z.enum([
    'like',
    'funny',
    'insightful',
    'fire'
]);
export type ReactionTypeDTO = z.infer<typeof ReactionTypeSchema>;

export const ReactionActionSchema = z.enum(['added', 'removed']);
export type ReactionActionDTO = z.infer<typeof ReactionActionSchema>;

export const CreateReactionSchema = z
    .object({
        userId: UserIdValueSchema,
        postId: PostIdValueSchema.nullable().optional(),
        commentId: CommentIdValueSchema.nullable().optional(),
        type: ReactionTypeSchema
    })
    .strict();
export type CreateReactionDTO = z.infer<typeof CreateReactionSchema> &
    ReactionInsert;

export const ReactionUpdateSchema = z.object({
    id: ReactionIdSchema.optional(),
    action: ReactionActionSchema,
    type: ReactionTypeSchema
});
export type ReactionUpdateDTO = z.infer<typeof ReactionUpdateSchema> &
    ReactionUpdate;

export const ReactionToggleSchema = z.object({
    userId: UserIdValueSchema,
    postId: PostIdValueSchema.nullable().optional(),
    commentId: CommentIdValueSchema.nullable().optional(),
    action: ReactionActionSchema,
    type: ReactionTypeSchema
});
export type ReactionToggleDTO = z.infer<typeof ReactionToggleSchema>;

/* ---------- Outbound DTOs ---------- */
export const ReactionSchema = z
    .object({
        id: ReactionIdValueSchema,
        userId: UserIdValueSchema,
        postId: PostIdValueSchema.nullable(),
        commentId: CommentIdValueSchema.nullable(),
        type: ReactionTypeSchema,
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        username: UserInfoSchema.shape.username.optional(),
        avatarUrl: UserInfoSchema.shape.avatarUrl.optional()
    })
    .strict();
export type ReactionDTO = z.infer<typeof ReactionSchema> & Reaction;

export const ReactionCountSchema = z.record(ReactionTypeSchema, z.number());
export type ReactionCountDTO = z.infer<typeof ReactionCountSchema>;
