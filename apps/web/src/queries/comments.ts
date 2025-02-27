import { ApiError, CommentsQueryParams } from '@phyt/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const COMMENT_QUERY_KEYS = {
    all: ['comments'] as const,
    lists: () => [...COMMENT_QUERY_KEYS.all, 'list'] as const,
    detail: (commentId: number) => [...COMMENT_QUERY_KEYS.all, commentId] as const,
    postComments: (postId: number, params?: CommentsQueryParams) =>
        ['postComments', postId, params] as const,
    replies: (commentId: number, params?: { page?: number, limit?: number; }) =>
        ['commentReplies', commentId, params] as const
};

export async function fetchPostComments(postId: number, params: CommentsQueryParams = {}) {
    const { page = 1, limit = 20, parentOnly = false } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('parentOnly', parentOnly.toString());

    const response = await fetch(`${API_URL}/comments/post/${postId}?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to fetch comments',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch replies to a comment
export async function fetchCommentReplies(commentId: number, params: { page?: number, limit?: number; } = {}) {
    const { page = 1, limit = 20 } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    const response = await fetch(`${API_URL}/comments/replies/${commentId}?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to fetch comment replies',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch a single comment by ID
export async function fetchComment(commentId: number) {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to fetch comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to create a comment or reply
export async function createComment(data: {
    post_id: number,
    content: string,
    parent_comment_id?: number;
}) {
    const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to create comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to update a comment
export async function updateComment({
    commentId,
    content
}: {
    commentId: number,
    content: string;
}) {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to update comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to delete a comment
export async function deleteComment(commentId: number) {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to delete comment',
            status: response.status
        } as ApiError;
    }

    return response.json();
}