import {
    CommentQueryParams,
    CommentResponse,
    CommentCreateRequest,
    CommentUpdateRequest
} from '@phyt/types';

import { api } from '@/lib/api';

export const COMMENT_QUERY_KEYS = {
    all: ['comments'] as const,
    lists: () => [...COMMENT_QUERY_KEYS.all, 'list'] as const,
    detail: (commentId: number) =>
        [...COMMENT_QUERY_KEYS.all, commentId] as const,
    postComments: (postId: number, params?: CommentQueryParams) =>
        ['postComments', postId, params] as const,
    replies: (commentId: number, params?: { page?: number; limit?: number }) =>
        ['commentReplies', commentId, params] as const
};

// Function to fetch comments for a post
export async function fetchPostComments(
    postId: number,
    { page = 1, limit = 20, parent_only = false }: CommentQueryParams = {},
    token: string
): Promise<CommentResponse> {
    const response = await api.get<CommentResponse>(
        `/comments/post/${String(postId)}`,
        {
            params: { page, limit, parent_only },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to fetch replies to a comment
export async function fetchCommentReplies(
    commentId: number,
    { page = 1, limit = 20 }: CommentQueryParams = {},
    token: string
): Promise<CommentResponse> {
    const response = await api.get<CommentResponse>(
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
    commentId: number,
    token: string
): Promise<Comment> {
    const response = await api.get<Comment>(`/comments/${String(commentId)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to create a comment or reply
export async function createComment(
    commentData: CommentCreateRequest,
    token: string
): Promise<Comment> {
    const response = await api.post<Comment>('/comments', commentData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to update a comment
export async function updateComment(
    updateCommentData: CommentUpdateRequest,
    token: string
): Promise<Comment> {
    const response = await api.patch<Comment>('/comments', updateCommentData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to delete a comment
export async function deleteComment(
    commentId: number,
    token: string
): Promise<Comment> {
    const response = await api.delete<Comment>(
        `/comments/${String(commentId)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}
