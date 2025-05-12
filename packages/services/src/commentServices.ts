import { CommentVO } from '@phyt/models';
import {
    UUIDv7,
    PaginatedComments,
    Comment,
    CreateCommentInput,
    UpdateCommentInput,
    CommentQueryParams,
    NotFoundError,
    ValidationError
} from '@phyt/types';

import type { CommentRepository } from '@phyt/repositories';

export type CommentService = ReturnType<typeof makeCommentService>;

export const makeCommentService = (repo: CommentRepository) => {
    const createComment = async (
        input: CreateCommentInput
    ): Promise<Comment> => {
        if (!input.content.trim())
            throw new ValidationError('Cannot be empty comment');
        CommentVO.create(input);
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
        if (!comment)
            throw new NotFoundError(`Comment ${String(commentId)} not found`);
        return comment;
    };

    const updateComment = async (
        commentId: UUIDv7,
        input: UpdateCommentInput
    ) => {
        const cur = await repo.findById(commentId);
        if (!cur) throw new Error('not found');
        const next = CommentVO.fromRecord(cur).updateContent({
            content: input.content
        });
        return await repo.update(commentId, next.toJSON());
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
