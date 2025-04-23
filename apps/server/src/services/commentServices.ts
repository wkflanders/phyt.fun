import {
    CommentResponse,
    Comment,
    CommentCreateRequest,
    CommentUpdateRequest,
    CommentQueryParams,
    NotFoundError,
    ValidationError
} from '@phyt/types';

import type { CommentRepository } from '@/repositories/commentRepository.js';

export type CommentService = ReturnType<typeof makeCommentService>;

export const makeCommentService = (repo: CommentRepository) => {
    const createComment = async (
        comment_data: CommentCreateRequest
    ): Promise<Comment> => {
        if (!comment_data.content.trim())
            throw new ValidationError('Cannot be empty comment');
        return repo.create(comment_data);
    };

    const getPostComments = (
        post_id: number,
        params: CommentQueryParams
    ): Promise<CommentResponse> => {
        return repo.listForPost(post_id, params);
    };

    const getCommentReplies = (
        comment_id: number,
        params: CommentQueryParams
    ): Promise<CommentResponse> => {
        return repo.listReplies(comment_id, params);
    };

    const getCommentById = async (comment_id: number) => {
        const comment = await repo.findById(comment_id);
        if (!comment)
            throw new NotFoundError(`Comment ${String(comment_id)} not found`);
        return comment;
    };

    const updateComment = (comment_data: CommentUpdateRequest) => {
        const { comment_id, content } = comment_data;
        return repo.update(comment_id, content);
    };

    const deleteComment = (comment_id: number) => {
        return repo.remove(comment_id);
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
