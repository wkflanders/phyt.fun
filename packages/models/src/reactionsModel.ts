import { uuidv7 } from 'uuidv7';

import { InputError } from './errors.js';

import type {
    UUIDv7,
    Reaction,
    ReactionInsert,
    ReactionCount,
    ReactionUpdate
} from '@phyt/types';

export interface ReactionVO extends Reaction {
    update(update: ReactionUpdate): ReactionVO;
    with(options: {
        username?: string;
        avatarUrl?: string;
        counts?: ReactionCount;
    }): ReactionVO;
    toDTO<T extends Reaction = Reaction>(options?: {
        [K in keyof T]?: T[K];
    }): T;
    toJSON(): Reaction;
}

export const ReactionVO = (() => {
    const make = (
        record: Reaction & {
            username?: string;
            avatarUrl?: string;
            counts?: ReactionCount;
        }
    ): ReactionVO => {
        const update = (updateData: ReactionUpdate): ReactionVO => {
            ReactionVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: string;
            counts?: ReactionCount;
        }): ReactionVO => {
            return make({
                ...record,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {}),
                ...(options.counts !== undefined
                    ? { counts: options.counts }
                    : {})
            });
        };

        const toDTO = <T extends Reaction = Reaction>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...record,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(record.username ? { username: record.username } : {}),
                ...(record.avatarUrl ? { avatarUrl: record.avatarUrl } : {}),
                ...(record.counts ? { counts: record.counts } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Reaction => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as ReactionVO;
    };

    return {
        create(input: ReactionInsert): ReactionVO {
            ReactionVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                userId: input.userId,
                postId: input.postId ?? null,
                commentId: input.commentId ?? null,
                type: input.type,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(
            data: Reaction,
            options?: {
                username?: string;
                avatarUrl?: string;
                counts?: ReactionCount;
            }
        ): ReactionVO {
            if (!options) {
                return make(data);
            }

            return make({
                ...data,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {}),
                ...(options.counts !== undefined
                    ? { counts: options.counts }
                    : {})
            });
        },

        validateInput(input: ReactionInsert): void {
            if (!input.userId) {
                throw new InputError('User ID is required');
            }

            if (!input.postId && !input.commentId) {
                throw new InputError(
                    'Either post ID or comment ID is required'
                );
            }
        },

        validateUpdate(input: ReactionUpdate): void {
            if (
                input.type !== 'like' &&
                input.type !== 'funny' &&
                input.type !== 'insightful'
            ) {
                throw new InputError('Invalid reaction type');
            }
        }
    };
})();
