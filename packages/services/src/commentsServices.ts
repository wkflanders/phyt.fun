import { CommentsVO } from '@phyt/models';
import {
    UUIDv7,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams
} from '@phyt/types';

import type {
    CommentDTO,
    CommentsPageDTO,
    CommentWithUserDTO
} from '@phyt/dto';
import type { CommentsRepository } from '@phyt/repositories';

export type CommentsService = ReturnType<typeof makeCommentsService>;

export const makeCommentsService = (repo: CommentsRepository) => {
    /**
     * Domain operations: Return CommentsVO objects for internal use
     * These are not exposed outside the service
     */
    const _findById = async (commentId: UUIDv7): Promise<CommentsVO> => {
        const commentVO = await repo.findById(commentId);
        return commentVO;
    };

    /**
     * Public API: Always return plain Comment DTOs for external consumption
     */
    const createComment = async (input: CommentInsert): Promise<CommentDTO> => {
        CommentsVO.validateInput(input);

        const commentVO = await repo.create(input);
        return commentVO.toDTO<CommentDTO>();
    };

    const getPostComments = async (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentsPageDTO> => {
        const result = await repo.listForPost(postId, params);
        return {
            comments: result.comments.map((c) => c.toDTO<CommentWithUserDTO>()),
            pagination: result.pagination
        };
    };

    const getCommentReplies = async (
        commentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentsPageDTO> => {
        await _findById(commentId);
        const result = await repo.listReplies(commentId, params);
        return {
            comments: result.comments.map((c) => c.toDTO<CommentWithUserDTO>()),
            pagination: result.pagination
        };
    };

    const getCommentById = async (commentId: UUIDv7): Promise<CommentDTO> => {
        const commentVO = await _findById(commentId);
        return commentVO.toDTO<CommentDTO>();
    };

    const updateComment = async (
        commentId: UUIDv7,
        input: CommentUpdate
    ): Promise<CommentDTO> => {
        CommentsVO.validateUpdate(input);

        const savedVO = await repo.update(commentId, input);
        return savedVO.toDTO<CommentDTO>();
    };

    const deleteComment = async (commentId: UUIDv7): Promise<CommentDTO> => {
        const deletedVO = await repo.remove(commentId);
        return deletedVO.toDTO<CommentDTO>();
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
