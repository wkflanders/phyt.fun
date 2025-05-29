import { InputError } from '@phyt/infra';

import { uuidv7 } from 'uuidv7';

import type {
    UUIDv7,
    Post,
    PostInsert,
    PostUpdate,
    PostStats,
    Run,
    AvatarUrl
} from '@phyt/types';

export interface PostsVO extends Post {
    update({ update }: { update: PostUpdate }): PostsVO;
    remove(): PostsVO;
    with(options: {
        username?: string;
        avatarUrl?: AvatarUrl;
        stats?: PostStats;
        run?: Run;
    }): PostsVO;
    toDTO<T extends Post = Post>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Post;
}

export const PostsVO = (() => {
    const make = (post: Post): PostsVO => {
        const update = ({ update }: { update: PostUpdate }): PostsVO => {
            PostsVO.validateUpdate(update);
            return make({
                ...post,
                ...update,
                updatedAt: new Date()
            });
        };

        const remove = (): PostsVO => {
            return make({
                ...post,
                deletedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: string;
            stats?: PostStats;
            run?: Run;
        }): PostsVO => {
            return make({
                ...post,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {}),
                ...(options.stats !== undefined
                    ? { stats: options.stats }
                    : {}),
                ...(options.run !== undefined ? { run: options.run } : {})
            });
        };

        const toDTO = <T extends Post = Post>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...post,
                createdAt: new Date(post.createdAt),
                updatedAt: new Date(post.updatedAt),
                ...(post.username ? { username: post.username } : {}),
                ...(post.avatarUrl ? { avatarUrl: post.avatarUrl } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Post => ({ ...post });

        return Object.freeze({
            ...toDTO(),
            update,
            remove,
            with: withOptions,
            toDTO,
            toJSON
        }) as PostsVO;
    };

    return {
        create({ input }: { input: PostInsert }): PostsVO {
            PostsVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                userId: input.userId,
                title: input.title,
                content: input.content,
                runId: input.runId ?? null,
                status: input.status,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });
        },

        from({
            post,
            options
        }: {
            post: Post;
            options?: {
                username?: string;
                avatarUrl?: string;
                stats?: PostStats;
                run?: Run;
            };
        }): PostsVO {
            if (!options) {
                return make(post);
            }

            return make({
                ...post,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {}),
                ...(options.stats !== undefined
                    ? { stats: options.stats }
                    : {}),
                ...(options.run !== undefined ? { run: options.run } : {})
            });
        },

        validateInput(input: PostInsert): void {
            if (!input.userId) {
                throw new InputError('User ID is required');
            }

            if (!input.title || input.title.trim() === '') {
                throw new InputError('Post title cannot be empty');
            }

            if (!input.content || input.content.trim() === '') {
                throw new InputError('Post content cannot be empty');
            }

            if (input.status !== 'visible' && input.status !== 'hidden') {
                throw new InputError('Invalid post status');
            }
        },

        validateUpdate(update: PostUpdate): void {
            if (update.title !== undefined && update.title.trim() === '') {
                throw new InputError('Post title cannot be empty');
            }

            if (update.content !== undefined && update.content.trim() === '') {
                throw new InputError('Post content cannot be empty');
            }

            if (
                update.status !== undefined &&
                update.status !== 'visible' &&
                update.status !== 'hidden'
            ) {
                throw new InputError('Invalid post status');
            }
        }
    };
})();
