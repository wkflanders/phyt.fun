import { CommentsVO } from '@phyt/models';

import { CommentSchema } from '@phyt/dto';

import type {
    PostIdDTO,
    CommentIdDTO,
    CommentDTO,
    CreateCommentDTO,
    UpdateCommentDTO,
    CommentQueryParamsDTO,
    CommentsPageDTO
} from '@phyt/dto';
import type { CommentsRepository } from '@phyt/repositories';

export type CommentsService = ReturnType<typeof makeCommentsService>;

export const makeCommentsService = ({
    commentsRepo
}: {
    commentsRepo: CommentsRepository;
}) => {
    const createComment = async ({
        input
    }: {
        input: CreateCommentDTO;
    }): Promise<CommentDTO> => {
        const commentVO = CommentsVO.create({ input });
        await commentsRepo.save({ input: commentVO });
        return CommentSchema.parse(commentVO.toDTO<CommentDTO>());
    };

    const getPostComments = async ({
        postId,
        params
    }: {
        postId: PostIdDTO;
        params: CommentQueryParamsDTO;
    }): Promise<CommentsPageDTO> => {
        const paginatedComments = await commentsRepo.findByPost({
            postId,
            params
        });
        return {
            comments: paginatedComments.comments.map((comment) =>
                CommentSchema.parse(comment.toDTO<CommentDTO>())
            ),
            pagination: paginatedComments.pagination
        };
    };

    const getCommentReplies = async ({
        parentCommentId,
        params
    }: {
        parentCommentId: CommentIdDTO;
        params: CommentQueryParamsDTO;
    }): Promise<CommentsPageDTO> => {
        const paginatedComments = await commentsRepo.findReplies({
            parentCommentId,
            params
        });
        return {
            comments: paginatedComments.comments.map((comment) =>
                CommentSchema.parse(comment.toDTO<CommentDTO>())
            ),
            pagination: paginatedComments.pagination
        };
    };

    const getCommentById = async ({
        commentId
    }: {
        commentId: CommentIdDTO;
    }): Promise<CommentDTO> => {
        const commentVO = await commentsRepo.findById({ commentId });
        return CommentSchema.parse(commentVO.toDTO<CommentDTO>());
    };

    const updateComment = async ({
        commentId,
        update
    }: {
        commentId: CommentIdDTO;
        update: UpdateCommentDTO;
    }): Promise<CommentDTO> => {
        const commentVO = (await commentsRepo.findById({ commentId })).update({
            update
        });
        await commentsRepo.save({ input: commentVO });
        return CommentSchema.parse(commentVO.toDTO<CommentDTO>());
    };

    const deleteComment = async ({
        commentId
    }: {
        commentId: CommentIdDTO;
    }): Promise<CommentDTO> => {
        const commentVO = (await commentsRepo.findById({ commentId })).remove();
        await commentsRepo.save({ input: commentVO });
        return CommentSchema.parse(commentVO.toDTO<CommentDTO>());
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
