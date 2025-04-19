import {
    ApiError,
    Reaction,
    ReactionCount,
    ReactionToggleRequest,
    ReactionToggleResponse,
    AuthenticationError
} from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { POST_QUERY_KEYS } from '@/queries/posts';
import {
    fetchPostReactions,
    fetchCommentReactions,
    fetchUserPostReactions,
    fetchUserCommentReactions,
    toggleReaction,
    REACTION_QUERY_KEYS
} from '@/queries/reactions';

export function usePostReactions(postId: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<ReactionCount, ApiError>({
        queryKey: REACTION_QUERY_KEYS.posts.byId(postId),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return fetchPostReactions(postId, token);
        },
        enabled: !!postId
    });
}

export function useCommentReactions(commentId: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<ReactionCount, ApiError>({
        queryKey: REACTION_QUERY_KEYS.comments.byId(commentId),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return fetchCommentReactions(commentId, token);
        },
        enabled: !!commentId
    });
}

export function useUserPostReactions(postId: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<Reaction[], ApiError>({
        queryKey: REACTION_QUERY_KEYS.posts.byUser(postId),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return fetchUserPostReactions(postId, token);
        },
        enabled: !!postId
    });
}

export function useUserCommentReactions(commentId: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<Reaction[], ApiError>({
        queryKey: REACTION_QUERY_KEYS.comments.byUser(commentId),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return fetchUserCommentReactions(commentId, token);
        },
        enabled: !!commentId
    });
}

export function useToggleReaction() {
    const queryClient = useQueryClient();
    const { getAccessToken } = usePrivy();

    return useMutation<ReactionToggleResponse, ApiError, ReactionToggleRequest>(
        {
            mutationFn: async (reactionData) => {
                const token = await getAccessToken();
                if (!token) {
                    throw new AuthenticationError(
                        'No token available. Is user logged in with privy?'
                    );
                }
                return toggleReaction(reactionData, token);
            },
            onSuccess: (_, variables) => {
                // Invalidate queries for reacting to a post
                if (variables.post_id) {
                    queryClient.invalidateQueries({
                        queryKey: REACTION_QUERY_KEYS.posts.byId(
                            variables.post_id
                        )
                    });
                    queryClient.invalidateQueries({
                        queryKey: REACTION_QUERY_KEYS.posts.byUser(
                            variables.post_id
                        )
                    });

                    // Also update post counts in feed
                    queryClient.invalidateQueries({
                        queryKey: POST_QUERY_KEYS.all
                    });
                    queryClient.invalidateQueries({
                        queryKey: POST_QUERY_KEYS.detail(variables.post_id)
                    });
                }

                // Invalidate queries for reacting to a comment
                if (variables.comment_id) {
                    queryClient.invalidateQueries({
                        queryKey: REACTION_QUERY_KEYS.comments.byId(
                            variables.comment_id
                        )
                    });
                    queryClient.invalidateQueries({
                        queryKey: REACTION_QUERY_KEYS.comments.byUser(
                            variables.comment_id
                        )
                    });
                }
            },
            onError: (error: ApiError) => {
                console.error('Failed to toggle reaction:', error);
            }
        }
    );
}
