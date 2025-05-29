import { InputError } from '@phyt/infra';

import { uuidv7 } from 'uuidv7';

import type {
    UUIDv7,
    Comment,
    CommentInsert,
    CommentUpdate
} from '@phyt/types';

export interface CommentsVO extends Comment {
    update({ update }: { update: CommentUpdate }): CommentsVO;
    remove(): CommentsVO;
    with(options: { username?: string; avatarUrl?: string }): CommentsVO;
    toDTO<T extends Comment = Comment>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Comment;
}

export const CommentsVO = (() => {
    const make = (comment: Comment): CommentsVO => {
        const update = ({ update }: { update: CommentUpdate }): CommentsVO => {
            CommentsVO.validateUpdate(update);
            return make({
                ...comment,
                ...update,
                updatedAt: new Date()
            });
        };

        const remove = (): CommentsVO => {
            return make({
                ...comment,
                deletedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: string;
        }): CommentsVO => {
            return make({
                ...comment,
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
                ...comment,
                createdAt: new Date(comment.createdAt),
                updatedAt: new Date(comment.updatedAt),
                ...(comment.username ? { username: comment.username } : {}),
                ...(comment.avatarUrl ? { avatarUrl: comment.avatarUrl } : {}),
                ...options
            } as T;
        };

        const toJSON = (): Comment => ({ ...comment });

        return Object.freeze({
            ...toDTO(),
            update,
            remove,
            with: withOptions,
            toDTO,
            toJSON
        }) as CommentsVO;
    };

    return {
        create({ input }: { input: CommentInsert }): CommentsVO {
            CommentsVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                postId: input.postId,
                userId: input.userId,
                content: input.content,
                parentCommentId: input.parentCommentId,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });
        },

        from({
            comment,
            options
        }: {
            comment: Comment;
            options?: { username?: string; avatarUrl?: string };
        }): CommentsVO {
            if (!options) {
                return make(comment);
            }

            return make({
                ...comment,
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

        validateUpdate(update: CommentUpdate): void {
            if (!update.content || update.content.trim() === '') {
                throw new InputError('Comment content cannot be empty');
            }
        }
    };
})();
