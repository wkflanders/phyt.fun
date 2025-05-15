import {
    Comment,
    CommentInsert,
    CommentUpdate,
    CommentWithUser,
    CommentRecord,
    ISODate
} from '@phyt/types';

import { InputError } from './errors.js';

export interface CommentVO extends Comment {
    update(update: CommentUpdate): CommentVO;
    withUserInfo(username: string, avatarUrl: string): CommentWithUser;
    toDTO(): Comment;
    toJSON(): CommentRecord;
}

export const CommentVO = (() => {
    const make = (record: CommentRecord): CommentVO => {
        const update = (updateData: CommentUpdate) =>
            make({
                ...record,
                ...updateData,
                updatedAt: new Date().toISOString() as ISODate
            });

        const withUserInfo = (
            username: string,
            avatarUrl: string
        ): CommentWithUser => {
            if (!record.id) throw new InputError('Comment id is required');
            return {
                id: record.id,
                postId: record.postId,
                userId: record.userId,
                content: record.content,
                parentCommentId: record.parentCommentId,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                username,
                avatarUrl
            };
        };

        const toDTO = (): Comment => {
            if (!record.id) throw new InputError('Comment id is required');
            return {
                id: record.id,
                postId: record.postId,
                userId: record.userId,
                content: record.content,
                parentCommentId: record.parentCommentId,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt)
            };
        };

        const toJSON = (): CommentRecord => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            withUserInfo,
            toDTO,
            toJSON
        }) as CommentVO;
    };

    return {
        create(input: CommentInsert): CommentVO {
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

        fromRecord(record: CommentRecord): CommentVO {
            return make(record);
        },

        validate(input: CommentInsert): void {
            if (!input.content || input.content.trim() === '') {
                throw new InputError('Comment content cannot be empty');
            }

            if (!input.postId) {
                throw new InputError('Post ID is required');
            }

            if (!input.userId) {
                throw new InputError('User ID is required');
            }
        }
    };
})();
