import { InputError } from './errors.js';

import type {
    UUIDv7,
    ReactionType,
    Reaction,
    ReactionInsert,
    ReactionWithUser,
    ReactionCount
} from '@phyt/types';

export interface ReactionVO extends Reaction {
    readonly id: UUIDv7;
    readonly userId: UUIDv7;
    readonly postId?: UUIDv7;
    readonly commentId?: UUIDv7;
    readonly type: ReactionType;
    readonly createdAt: Date;
    readonly username?: string;
    readonly avatarUrl?: string | null;
    readonly counts?: ReactionCount;

    withUserInfo(username: string, avatarUrl: string | null): ReactionVO;
    withCounts(counts: Partial<ReactionCount>): ReactionVO;
    toDTO<T extends Reaction = Reaction>(options?: {
        [K in keyof T]?: T[K];
    }): T;
    toJSON(): Reaction;
}

export const ReactionVO = (() => {
    const make = (
        record: Reaction & {
            username?: string;
            avatarUrl?: string | null;
            counts?: ReactionCount;
        }
    ): ReactionVO => {
        const withUserInfo = (
            username: string,
            avatarUrl: string | null
        ): ReactionVO => {
            return make({ ...record, username, avatarUrl });
        };

        const withCounts = (counts: Partial<ReactionCount>): ReactionVO => {
            const normalizedCounts: ReactionCount = {
                like: typeof counts.like === 'number' ? counts.like : 0,
                funny: typeof counts.funny === 'number' ? counts.funny : 0,
                insightful:
                    typeof counts.insightful === 'number'
                        ? counts.insightful
                        : 0,
                fire: typeof counts.fire === 'number' ? counts.fire : 0
            };
            return make({ ...record, counts: normalizedCounts });
        };

        const toDTO = <T extends Reaction = Reaction>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            const base = {
                id: record.id,
                userId: record.userId,
                postId: record.postId,
                commentId: record.commentId,
                type: record.type,
                createdAt: record.createdAt
            };

            const withUsername = record.username
                ? { ...base, username: record.username }
                : base;

            const withAvatar =
                record.avatarUrl !== undefined
                    ? { ...withUsername, avatarUrl: record.avatarUrl }
                    : withUsername;

            const withReactionCounts = record.counts
                ? { ...withAvatar, counts: record.counts }
                : withAvatar;

            return {
                ...withReactionCounts,
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Reaction => ({
            id: record.id,
            userId: record.userId,
            postId: record.postId,
            commentId: record.commentId,
            type: record.type,
            createdAt: record.createdAt
        });

        return Object.freeze({
            ...toDTO(),
            withUserInfo,
            withCounts,
            toDTO,
            toJSON
        }) as ReactionVO;
    };

    return {
        create(input: ReactionInsert): ReactionVO {
            ReactionVO.validateInput(input);

            return make({
                id: crypto.randomUUID() as UUIDv7,
                userId: input.userId,
                postId: input.postId,
                commentId: input.commentId,
                type: input.type,
                createdAt: new Date()
            });
        },

        fromRecord(record: Reaction): ReactionVO {
            return make(record);
        },

        fromWithUser(data: ReactionWithUser): ReactionVO {
            return make({
                ...data
            });
        },

        fromCount(counts: Partial<ReactionCount>): ReactionVO {
            // Create a minimal reaction object with counts
            return make({
                id: 'count' as UUIDv7, // Placeholder
                userId: 'system' as UUIDv7, // Placeholder
                type: 'like', // Placeholder
                createdAt: new Date(),
                counts: {
                    like: typeof counts.like === 'number' ? counts.like : 0,
                    funny: typeof counts.funny === 'number' ? counts.funny : 0,
                    insightful:
                        typeof counts.insightful === 'number'
                            ? counts.insightful
                            : 0,
                    fire: typeof counts.fire === 'number' ? counts.fire : 0
                }
            });
        },

        validateInput(input: ReactionInsert): void {
            if (!input.userId) {
                throw new InputError('User ID is required');
            }

            const hasPostId = Boolean(input.postId);
            const hasCommentId = Boolean(input.commentId);

            if (!hasPostId && !hasCommentId) {
                throw new InputError(
                    'Either post ID or comment ID is required'
                );
            }

            if (hasPostId && hasCommentId) {
                throw new InputError('Cannot have both post ID and comment ID');
            }
        }
    };
})();
