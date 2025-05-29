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
    { page = 1, limit = 20, parentOnly = false }: CommentQueryParamsDTO = {},
    token: string
): Promise<CommentsPageDTO> {
    const response = await api.get<CommentsPageDTO>(
        `/comments/post/${String(postId)}`,
        {
            params: { page, limit, parentOnly },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to fetch replies to a comment
export async function fetchCommentReplies(
    commentId: CommentIdDTO,
    { page = 1, limit = 20 }: CommentQueryParamsDTO = {},
    token: string
): Promise<CommentsPageDTO> {
    const response = await api.get<CommentsPageDTO>(
        `/comments/replies/${String(commentId)}`,
        {
            params: { page, limit },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to fetch a single comment by ID
export async function fetchComment(
    commentId: CommentIdDTO,
    token: string
): Promise<CommentDTO> {
    const response = await api.get<CommentDTO>(
        `/comments/${String(commentId)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to create a comment or reply
export async function createComment(
    commentData: CreateCommentDTO,
    token: string
): Promise<CommentDTO> {
    const response = await api.post<CommentDTO>('/comments', commentData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to update a comment
export async function updateComment(
    updateCommentData: UpdateCommentDTO,
    token: string
): Promise<CommentDTO> {
    const response = await api.patch<CommentDTO>(
        '/comments',
        updateCommentData,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to delete a comment
export async function deleteComment(
    commentId: CommentIdDTO,
    token: string
): Promise<CommentDTO> {
    const response = await api.delete<CommentDTO>(
        `/comments/${String(commentId)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}
