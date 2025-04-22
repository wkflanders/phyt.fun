import { NotFoundError, CommentService, DatabaseError } from '@phyt/types';

import { commentRepository } from '@/repositories/commentRepository.js';

export const commentService: CommentService = {
    createComment: async (createCommentData) => {
        const { user_id, post_id, content, parent_comment_id } =
            createCommentData;
        try {
            return await commentRepository.create({
                user_id,
                post_id,
                content,
                parent_comment_id: parent_comment_id ?? undefined
            });
        } catch (error) {
            console.error('Error with createComment ', error);
            throw new DatabaseError('Error with creating a new comment');
        }
    },

    getPostComments: async (post_id, params = {}) => {
        const { page = 1, limit = 20, parent_only = false } = params;
        try {
            const { rows, total } = await commentRepository.listForPost(
                post_id,
                {
                    page,
                    limit,
                    parent_only
                }
            );
            return {
                comments: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error with getPostComments ', error);
            throw new DatabaseError('Failed to get post comments');
        }
    },

    getCommentReplies: async (comment_id, params) => {
        const { page = 1, limit = 20 } = params;
        try {
            const { rows, total } = await commentRepository.listReplies(
                comment_id,
                {
                    page,
                    limit
                }
            );
            return {
                comments: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error with getCommentReplies ', error);
            throw new DatabaseError('Failed to get comment replies');
        }
    },

    updateComment: async ({ comment_id, content }) => {
        try {
            const updated = await commentRepository.update({
                comment_id,
                content
            });
            // if (updated == null) {
            //     throw new NotFoundError(
            //         `Comment ${String(comment_id)} not found`
            //     );
            // }
            return updated;
        } catch (error) {
            console.error('Error with updateComment ', error);
            throw new DatabaseError('Failed to update comment');
        }
    },

    deleteComment: async (comment_id) => {
        try {
            const deleted = await commentRepository.remove(comment_id);
            // if (!deleted)
            //     throw new NotFoundError(
            //         `Comment ${String(comment_id)} not found`
            //     );
            return deleted;
        } catch (error) {
            console.error('Error with deleteComment ', error);
            throw new DatabaseError('Failed to delete comment');
        }
    },

    getCommentById: async (comment_id) => {
        try {
            const comment = await commentRepository.findById(comment_id);
            if (!comment)
                throw new NotFoundError(
                    `Comment ${String(comment_id)} not found`
                );
            return comment;
        } catch (error) {
            console.error('Error with getCommentById ', error);
            throw new DatabaseError('Failed to get comment');
        }
    }
};
