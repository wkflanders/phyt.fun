import {
    CommentDTO,
    CommentIdDTO,
    CommentQueryParamsDTO,
    CommentsPageDTO,
    CreateCommentDTO,
    UpdateCommentDTO
} from '@phyt/dto';

import { api } from '@/lib/api';

export const COMMENT_QUERY_KEYS = {
    all: ['comments'] as const,
    lists: () => [...COMMENT_QUERY_KEYS.all, 'list'] as const,
    detail: (commentId: CommentIdDTO) =>
        [...COMMENT_QUERY_KEYS.all, commentId] as const,
    postComments: (postId: CommentIdDTO, params?: CommentQueryParamsDTO) =>
        ['postComments', postId, params] as const,
    replies: (
        commentId: CommentIdDTO,
        params?: { page?: number; limit?: number }
    ) => ['commentReplies', commentId, params] as const
};

// Function to fetch comments for a post
export async function fetchPostComments(
    postId: CommentIdDTO,
    { page = 1, limit = 20, parentOnly = false }: CommentQueryParamsDTO = {}
): Promise<CommentsPageDTO> {
    const response = await api.get<CommentsPageDTO>(
        `/comments/post/${String(postId)}`,
        {
            params: { page, limit, parentOnly }
        }
    );
    return response.data;
}

// Function to fetch replies to a comment
export async function fetchCommentReplies(
    commentId: CommentIdDTO,
    { page = 1, limit = 20 }: CommentQueryParamsDTO = {}
): Promise<CommentsPageDTO> {
    const response = await api.get<CommentsPageDTO>(
        `/comments/${String(commentId)}/replies`,
        {
            params: { page, limit }
        }
    );
    return response.data;
}

// Function to fetch a single comment by ID
export async function fetchComment(
    commentId: CommentIdDTO
): Promise<CommentDTO> {
    const response = await api.get<CommentDTO>(
        `/comments/${String(commentId)}`
    );
    return response.data;
}

// Function to create a comment or reply
export async function createComment(
    commentData: CreateCommentDTO
): Promise<CommentDTO> {
    const response = await api.post<CommentDTO>('/comments', commentData);
    return response.data;
}

// Function to update a comment
export async function updateComment(
    commentId: CommentIdDTO,
    updateData: UpdateCommentDTO
): Promise<CommentDTO> {
    const response = await api.patch<CommentDTO>(
        `/comments/${String(commentId)}`,
        updateData
    );
    return response.data;
}

// Function to delete a comment
export async function deleteComment(
    commentId: CommentIdDTO
): Promise<CommentDTO> {
    const response = await api.delete<CommentDTO>(
        `/comments/${String(commentId)}`
    );
    return response.data;
}
