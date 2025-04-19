import { ApiError, CommentQueryParams, CommentResponse } from '@phyt/types';

import { env } from '@/env';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

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

export async function fetchPostComments(
    postId: number,
    params: CommentQueryParams = {},
    token: string
): Promise<CommentResponse> {
    const { page = 1, limit = 20, parent_only = false } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('parent_only', parent_only.toString());
    const response = await fetch(
        `${API_URL}/comments/post/${String(postId)}?${searchParams.toString()}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch comments',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch replies to a comment
export async function fetchCommentReplies(
    commentId: number,
    params: CommentQueryParams = {},
    token: string
): Promise<CommentResponse> {
    const { page = 1, limit = 20 } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    const response = await fetch(
        `${API_URL}/comments/replies/${String(commentId)}?${searchParams.toString()}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch comment replies',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch a single comment by ID
export async function fetchComment(
    commentId: number,
    token: string
): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments/${String(commentId)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to create a comment or reply
export async function createComment(
    commentData: {
        post_id: number;
        content: string;
        parent_comment_id?: number;
    },
    token: string
): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to create comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to update a comment
export async function updateComment(
    {
        commentId,
        content
    }: {
        commentId: number;
        content: string;
    },
    token: string
): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments/${String(commentId)}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to update comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to delete a comment
export async function deleteComment(
    commentId: number,
    token: string
): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments/${String(commentId)}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to delete comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}
