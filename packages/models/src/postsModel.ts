import { InputError } from './errors.js';

import type {
    Post,
    PostInsert,
    PostUpdate,
    PostWithUser,
    PostRecord,
    ISODate
} from '@phyt/types';

export interface PostsVO extends Post {
    status: 'visible' | 'hidden' | 'deleted';
    username?: string;
    avatarUrl?: string | null;
    update(update: PostUpdate): PostsVO;
    withUserInfo(username: string, avatarUrl: string | null): PostsVO;
    toDTO<T extends Post = Post>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): PostRecord;
}

export const PostsVO = (() => {
    const make = (
        record: PostRecord & {
            status: 'visible' | 'hidden' | 'deleted';
            username?: string | null;
            avatarUrl?: string | null;
        }
    ): PostsVO => {
        const update = (updateData: PostUpdate): PostsVO => {
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const withUserInfo = (
            username: string | null,
            avatarUrl: string | null
        ): PostsVO => {
            return make({ ...record, username, avatarUrl });
        };

        const toDTO = <T extends Post = Post>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                id: record.id,
                userId: record.userId,
                title: record.title,
                content: record.content,
                status: record.status,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                ...(record.username ? { username: record.username } : {}),
                ...(record.avatarUrl !== undefined
                    ? { avatarUrl: record.avatarUrl }
                    : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): PostRecord => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            status: record.status,
            username: record.username,
            avatarUrl: record.avatarUrl,
            update,
            withUserInfo,
            toDTO,
            toJSON
        }) as PostsVO;
    };

    return {
        create(input: PostInsert): PostsVO {
            PostsVO.validateInput(input);
            return make({
                id: undefined,
                userId: input.userId,
                title: input.title,
                content: input.content,
                status: input.status ?? 'visible',
                createdAt: new Date().toISOString() as ISODate,
                updatedAt: new Date().toISOString() as ISODate
            });
        },

        fromRecord(record: PostRecord): PostsVO {
            return make(record);
        },

        fromWithUser(data: PostWithUser): PostsVO {
            return make({
                id: data.id,
                userId: data.userId,
                title: data.title,
                content: data.content,
                status: data.status,
                createdAt: (data.createdAt instanceof Date
                    ? data.createdAt.toISOString()
                    : data.createdAt) as ISODate,
                updatedAt: (data.updatedAt instanceof Date
                    ? data.updatedAt.toISOString()
                    : data.updatedAt) as ISODate,
                username: data.username,
                avatarUrl: data.avatarUrl
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
        },

        validateUpdate(input: PostUpdate): void {
            if (input.title !== undefined && input.title.trim() === '') {
                throw new InputError('Post title cannot be empty');
            }

            if (input.content !== undefined && input.content.trim() === '') {
                throw new InputError('Post content cannot be empty');
            }
        }
    };
})();
