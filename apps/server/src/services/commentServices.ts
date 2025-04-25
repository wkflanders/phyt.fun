import {
    UUIDv7,
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
        commentData: CommentCreateRequest
    ): Promise<Comment> => {
        if (!commentData.content.trim())
            throw new ValidationError('Cannot be empty comment');
        return repo.create(commentData);
    };

    const getPostComments = (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse> => {
        return repo.listForPost(postId, params);
    };

    const getCommentReplies = (
        commentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse> => {
        return repo.listReplies(commentId, params);
    };

    const getCommentById = async (commentId: UUIDv7) => {
        const comment = await repo.findById(commentId);
        if (!comment)
            throw new NotFoundError(`Comment ${String(commentId)} not found`);
        return comment;
    };

    const updateComment = (commentData: CommentUpdateRequest) => {
        const { commentId, content } = commentData;
        return repo.update(commentId, content);
    };

    const deleteComment = (commentId: UUIDv7) => {
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
