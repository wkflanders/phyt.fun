import { CommentVO, NotFoundError } from '@phyt/models';
import {
    UUIDv7,
    PaginatedComments,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams
} from '@phyt/types';

import type { CommentRepository } from '@phyt/repositories';

export type CommentService = ReturnType<typeof makeCommentService>;

export const makeCommentService = (repo: CommentRepository) => {
    const createComment = async (input: CommentInsert) => {
        const comment = CommentVO.create(input);

        return repo.create(input);
    };

    const getPostComments = (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        return repo.listForPost(postId, params);
    };

    const getCommentReplies = (
        commentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments> => {
        return repo.listReplies(commentId, params);
    };

    const getCommentById = async (commentId: UUIDv7) => {
        const comment = await repo.findById(commentId);
        if (!comment) {
            throw new NotFoundError(`Comment ${String(commentId)} not found`);
        }
        return comment;
    };

    const updateComment = async (commentId: UUIDv7, input: CommentUpdate) => {
        const current = await repo.findById(commentId);
        if (!current) {
            throw new NotFoundError(`Comment ${String(commentId)} not found`);
        }

        return repo.update(commentId, input);
    };

    const deleteComment = async (commentId: UUIDv7) => {
        const comment = await repo.findById(commentId);
        if (!comment)
            throw new NotFoundError(`Comment ${String(commentId)} not found`);
        return repo.remove(commentId);
    };

    return Object.freeze({
        createComment,
        getPostComments,
        getCommentReplies,
        getCommentById,
        updateComment,
        deleteComment
    });
};
