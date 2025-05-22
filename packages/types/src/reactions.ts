import { UUIDv7 } from './core.js';

export type ReactionType = 'like' | 'funny' | 'insightful' | 'fire';

export interface Reaction {
    id: UUIDv7;
    userId: UUIDv7;
    postId?: UUIDv7;
    commentId?: UUIDv7;
    type: ReactionType;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReactionInsert {
    userId: UUIDv7;
    postId?: UUIDv7;
    commentId?: UUIDv7;
    type: ReactionType;
}

export interface ReactionUpdate {
    type: ReactionType;
}

export interface ReactionCount {
    like: number;
    funny: number;
    insightful: number;
    fire: number;
}

export type ReactionAction = 'added' | 'removed';

export interface ReactionToggle {
    action: ReactionAction;
    reaction: ReactionType;
    counts: ReactionCount;
}

// Deal with this later
