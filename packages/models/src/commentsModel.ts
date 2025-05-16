import { InputError } from './errors.js';

import type {
    Comment,
    CommentInsert,
    CommentUpdate,
    CommentWithUser,
    CommentRecord,
    ISODate
} from '@phyt/types';

export interface CommentsVO extends Comment {
    username?: string;
    avatarUrl?: string | null;
    update(update: CommentUpdate): CommentsVO;
    withUserInfo(username: string, avatarUrl: string | null): CommentsVO;
    toDTO<T extends Comment = Comment>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): CommentRecord;
}

export const CommentsVO = (() => {
    const make = (
        record: CommentRecord & {
            username?: string | null;
            avatarUrl?: string | null;
        }
    ): CommentsVO => {
        const update = (updateData: CommentUpdate): CommentsVO => {
            CommentsVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const withUserInfo = (
            username: string | null,
            avatarUrl: string | null
        ): CommentsVO => {
            return make({ ...record, username, avatarUrl });
        };

        const toDTO = <T extends Comment = Comment>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                id: record.id,
                postId: record.postId,
                userId: record.userId,
                content: record.content,
                parentCommentId: record.parentCommentId,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                ...(record.username ? { username: record.username } : {}),
                ...(record.avatarUrl !== undefined
                    ? { avatarUrl: record.avatarUrl }
                    : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): CommentRecord => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            username: record.username,
            avatarUrl: record.avatarUrl,
            update,
            withUserInfo,
            toDTO,
            toJSON
        }) as CommentsVO;
    };

    return {
        create(input: CommentInsert): CommentsVO {
            CommentsVO.validateInput(input);
            return make({
                id: undefined,
                postId: input.postId,
                userId: input.userId,
                content: input.content,
                parentCommentId: input.parentCommentId,
                createdAt: new Date().toISOString() as ISODate,
                updatedAt: new Date().toISOString() as ISODate
            });
        },

        fromRecord(record: CommentRecord): CommentsVO {
            return make(record);
        },

        fromWithUser(data: CommentWithUser): CommentsVO {
            return make({
                id: data.id,
                postId: data.postId,
                userId: data.userId,
                content: data.content,
                parentCommentId: data.parentCommentId,
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
