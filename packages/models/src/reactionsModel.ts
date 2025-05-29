import { InputError } from '@phyt/infra';

import { uuidv7 } from 'uuidv7';

import type {
    UUIDv7,
    Reaction,
    ReactionInsert,
    ReactionCount,
    ReactionUpdate,
    AvatarUrl
} from '@phyt/types';

export interface ReactionsVO extends Reaction {
    update({ update }: { update: ReactionUpdate }): ReactionsVO;
    with(options: {
        username?: string;
        avatarUrl?: AvatarUrl;
        counts?: ReactionCount;
    }): ReactionsVO;
    toDTO<T extends Reaction = Reaction>(options?: {
        [K in keyof T]?: T[K];
    }): T;
    toJSON(): Reaction;
}

export const ReactionsVO = (() => {
    const make = (reaction: Reaction): ReactionsVO => {
        const update = ({
            update
        }: {
            update: ReactionUpdate;
        }): ReactionsVO => {
            ReactionsVO.validateUpdate(update);
            return make({
                ...reaction,
                ...update,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: AvatarUrl;
            counts?: ReactionCount;
        }): ReactionsVO => {
            return make({
                ...reaction,
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
                ...reaction,
                createdAt: new Date(reaction.createdAt),
                updatedAt: new Date(reaction.updatedAt),
                ...(reaction.username ? { username: reaction.username } : {}),
                ...(reaction.avatarUrl
                    ? { avatarUrl: reaction.avatarUrl }
                    : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Reaction => ({ ...reaction });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as ReactionsVO;
    };

    return {
        create({ input }: { input: ReactionInsert }): ReactionsVO {
            ReactionsVO.validateInput(input);
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

        from({
            reaction,
            options
        }: {
            reaction: Reaction;
            options?: {
                username?: string;
                avatarUrl?: AvatarUrl;
                counts?: ReactionCount;
            };
        }): ReactionsVO {
            if (!options) {
                return make(reaction);
            }

            return make({
                ...reaction,
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

            if (input.postId && input.commentId) {
                throw new InputError(
                    'Either post ID or comment ID is required, not both'
                );
            }
        },

        validateUpdate(update: ReactionUpdate): void {
            if (
                update.type !== 'like' &&
                update.type !== 'funny' &&
                update.type !== 'insightful'
            ) {
                throw new InputError('Invalid reaction type');
            }
        }
    };
})();
