import { uuidv7 } from 'uuidv7';

import { InputError } from './errors.js';

import type {
    UUIDv7,
    Comment,
    CommentInsert,
    CommentUpdate
} from '@phyt/types';

export interface CommentsVO extends Comment {
    update(update: CommentUpdate): CommentsVO;
    with(options: { username?: string; avatarUrl?: string }): CommentsVO;
    toDTO<T extends Comment = Comment>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Comment;
}

export const CommentsVO = (() => {
    const make = (
        record: Comment & {
            username?: string;
            avatarUrl?: string;
        }
    ): CommentsVO => {
        const update = (updateData: CommentUpdate): CommentsVO => {
            CommentsVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: string;
        }): CommentsVO => {
            return make({
                ...record,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {})
            });
        };

        const toDTO = <T extends Comment = Comment>(options?: {
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

        const toJSON = (): Comment => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as CommentsVO;
    };

    return {
        create(input: CommentInsert): CommentsVO {
            CommentsVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                postId: input.postId,
                userId: input.userId,
                content: input.content,
                parentCommentId: input.parentCommentId,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(
            data: Comment,
            options?: { username?: string; avatarUrl?: string }
        ): CommentsVO {
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
                    : {})
            });
        },

        validateInput(input: CommentInsert): void {
            if (
                typeof input.content === 'string' &&
                input.content.trim() === ''
            ) {
                throw new InputError('Comment content cannot be empty');
            }

            if (!input.postId) {
                throw new InputError('Post ID is required');
            }

            if (!input.userId) {
                throw new InputError('User ID is required');
            }
        },

        validateUpdate(input: CommentUpdate): void {
            if (!input.content || input.content.trim() === '') {
                throw new InputError('Comment content cannot be empty');
            }
        }
    };
})();
