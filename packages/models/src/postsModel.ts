import { uuidv7 } from 'uuidv7';

import { InputError } from './errors.js';

import type {
    UUIDv7,
    Post,
    PostInsert,
    PostUpdate,
    PostStatus,
    PostStats,
    Run
} from '@phyt/types';

export interface PostsVO extends Post {
    update(update: PostUpdate): PostsVO;
    with(options: { username?: string; avatarUrl?: string }): PostsVO;
    toDTO<T extends Post = Post>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Post;
}

export const PostsVO = (() => {
    const make = (
        record: Post & {
            username?: string;
            avatarUrl?: string;
            stats?: PostStats;
            run?: Run;
            status?: PostStatus;
        }
    ): PostsVO => {
        const update = (updateData: PostUpdate): PostsVO => {
            PostsVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: string;
            stats?: PostStats;
            run?: Run;
            status?: PostStatus;
        }): PostsVO => {
            return make({
                ...record,
                ...(options.status !== undefined
                    ? { status: options.status }
                    : {}),
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
                ...record,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(record.username ? { username: record.username } : {}),
                ...(record.avatarUrl ? { avatarUrl: record.avatarUrl } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Post => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as PostsVO;
    };

    return {
        create(input: PostInsert): PostsVO {
            PostsVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                userId: input.userId,
                title: input.title,
                content: input.content,
                status: input.status ?? 'visible',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(
            data: Post,
            options?: {
                username?: string;
                avatarUrl?: string;
                stats?: PostStats;
                run?: Run;
                status?: PostStatus;
            }
        ): PostsVO {
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
                ...(options.stats !== undefined
                    ? { stats: options.stats }
                    : {}),
                ...(options.run !== undefined ? { run: options.run } : {}),
                ...(options.status !== undefined
                    ? { status: options.status }
                    : {})
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

            if (
                input.status !== undefined &&
                input.status !== 'visible' &&
                input.status !== 'hidden'
            ) {
                throw new InputError('Invalid post status');
            }
        },

        validateUpdate(input: PostUpdate): void {
            if (input.title !== undefined && input.title.trim() === '') {
                throw new InputError('Post title cannot be empty');
            }

            if (input.content !== undefined && input.content.trim() === '') {
                throw new InputError('Post content cannot be empty');
            }

            if (
                input.status !== undefined &&
                input.status !== 'visible' &&
                input.status !== 'hidden'
            ) {
                throw new InputError('Invalid post status');
            }
        }
    };
})();
