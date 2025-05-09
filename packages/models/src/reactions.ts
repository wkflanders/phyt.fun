import { UUIDv7 } from './primitives.js';

export type Reaction = 'like' | 'funny' | 'insightful' | 'fire';

export type ReactionCount = Record<Reaction, number>;

export type ReactionAction = 'added' | 'removed';

export interface ReactionToggleRequest {
    userId: UUIDv7;
    postId: UUIDv7;
    commentId: UUIDv7;
    type: Reaction;
}

export interface ReactionToggleResponse {
    action: ReactionAction;
    reaction: Reaction;
}
