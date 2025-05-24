import { UUIDv7 } from './core.js';

export type ReactionType = 'like' | 'funny' | 'insightful' | 'fire';

export interface Reaction {
    id: UUIDv7;
    userId: UUIDv7;
    postId: UUIDv7 | null;
    commentId: UUIDv7 | null;
    type: ReactionType;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReactionWithUser extends Reaction {
    username: string;
    avatarUrl: string;
}

export interface ReactionInsert {
    userId: UUIDv7;
    postId?: UUIDv7 | null;
    commentId?: UUIDv7 | null;
    type: ReactionType;
}

export interface ReactionUpdate {
    action: ReactionAction;
    type: ReactionType;
}

export interface ReactionCount {
    like: number;
    funny: number;
    insightful: number;
    fire: number;
}

export type ReactionAction = 'added' | 'removed';
