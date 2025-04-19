import { env } from '@/env';
import {
    ApiError,
    Reaction,
    ReactionCount,
    ReactionToggleRequest,
    ReactionToggleResponse
} from '@phyt/types';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const REACTION_QUERY_KEYS = {
    all: ['reactions'] as const,
    posts: {
        all: () => [...REACTION_QUERY_KEYS.all, 'posts'] as const,
        byId: (postId: number) =>
            [...REACTION_QUERY_KEYS.posts.all(), postId] as const,
        byUser: (postId: number) =>
            [...REACTION_QUERY_KEYS.posts.all(), 'user', postId] as const
    },
    comments: {
        all: () => [...REACTION_QUERY_KEYS.all, 'comments'] as const,
        byId: (commentId: number) =>
            [...REACTION_QUERY_KEYS.comments.all(), commentId] as const,
        byUser: (commentId: number) =>
            [...REACTION_QUERY_KEYS.comments.all(), 'user', commentId] as const
    }
};

export async function fetchPostReactions(
    postId: number,
    token: string
): Promise<ReactionCount> {
    const response = await fetch(
        `${API_URL}/reactions/post/${String(postId)}`,
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
            error: error.error ?? 'Failed to fetch post reactions',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch reactions for a comment
export async function fetchCommentReactions(
    commentId: number,
    token: string
): Promise<ReactionCount> {
    const response = await fetch(
        `${API_URL}/reactions/comment/${String(commentId)}`,
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
            error: error.error ?? 'Failed to fetch comment reactions',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch user's reactions for a post
export async function fetchUserPostReactions(
    postId: number,
    token: string
): Promise<Reaction[]> {
    const response = await fetch(
        `${API_URL}/reactions/user/post/${String(postId)}`,
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
            error: error.error ?? 'Failed to fetch post reactions',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch user's reactions for a comment
export async function fetchUserCommentReactions(
    commentId: number,
    token: string
): Promise<Reaction[]> {
    const response = await fetch(
        `${API_URL}/reactions/user/comment/${String(commentId)}`,
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
            error: error.error ?? 'Failed to fetch comment reactions',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to toggle a reaction (add or remove)
export async function toggleReaction(
    data: ReactionToggleRequest,
    token: string
): Promise<ReactionToggleResponse> {
    const response = await fetch(`${API_URL}/reactions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to toggle reaction',
            status: response.status
        } as ApiError;
    }

    return response.json();
}
