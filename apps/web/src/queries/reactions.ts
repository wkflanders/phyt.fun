import {
    Reaction,
    ReactionCount,
    ReactionToggleRequest,
    ReactionToggleResponse
} from '@phyt/types';

import { api } from '@/lib/api';

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
    const response = await api.get<ReactionCount>(
        `/reactions/post/${String(postId)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to fetch reactions for a comment
export async function fetchCommentReactions(
    commentId: number,
    token: string
): Promise<ReactionCount> {
    const response = await api.get<ReactionCount>(
        `/reactions/comment/${String(commentId)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to fetch user's reactions for a post
export async function fetchUserPostReactions(
    postId: number,
    token: string
): Promise<Reaction[]> {
    const response = await api.get<Reaction[]>(
        `/reactions/user/post/${String(postId)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to fetch user's reactions for a comment
export async function fetchUserCommentReactions(
    commentId: number,
    token: string
): Promise<Reaction[]> {
    const response = await api.get<Reaction[]>(
        `/reactions/user/comment/${String(commentId)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to toggle a reaction (add or remove)
export async function toggleReaction(
    reactionData: ReactionToggleRequest,
    token: string
): Promise<ReactionToggleResponse> {
    const response = await api.post<ReactionToggleResponse>(
        '/reactions',
        reactionData,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}
