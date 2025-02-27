import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, ReactionType } from '@phyt/types';
import {
    fetchPostReactions,
    fetchCommentReactions,
    fetchUserPostReactions,
    fetchUserCommentReactions,
    toggleReaction,
    REACTION_QUERY_KEYS
} from '../queries/reactions';
import { POST_QUERY_KEYS } from '../queries/posts';

export function usePostReactions(postId: number) {
    return useQuery({
        queryKey: REACTION_QUERY_KEYS.posts.byId(postId),
        queryFn: () => fetchPostReactions(postId),
        enabled: !!postId
    });
}

export function useCommentReactions(commentId: number) {
    return useQuery({
        queryKey: REACTION_QUERY_KEYS.comments.byId(commentId),
        queryFn: () => fetchCommentReactions(commentId),
        enabled: !!commentId
    });
}

export function useUserPostReactions(postId: number) {
    return useQuery({
        queryKey: REACTION_QUERY_KEYS.posts.byUser(postId),
        queryFn: () => fetchUserPostReactions(postId),
        enabled: !!postId
    });
}

export function useUserCommentReactions(commentId: number) {
    return useQuery({
        queryKey: REACTION_QUERY_KEYS.comments.byUser(commentId),
        queryFn: () => fetchUserCommentReactions(commentId),
        enabled: !!commentId
    });
}

export function useToggleReaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleReaction,
        onSuccess: (_, variables) => {
            // Invalidate queries for reacting to a post
            if (variables.post_id) {
                queryClient.invalidateQueries({
                    queryKey: REACTION_QUERY_KEYS.posts.byId(variables.post_id)
                });
                queryClient.invalidateQueries({
                    queryKey: REACTION_QUERY_KEYS.posts.byUser(variables.post_id)
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
                    queryKey: REACTION_QUERY_KEYS.comments.byId(variables.comment_id)
                });
                queryClient.invalidateQueries({
                    queryKey: REACTION_QUERY_KEYS.comments.byUser(variables.comment_id)
                });
            }
        },
        onError: (error: ApiError) => {
            console.error('Failed to toggle reaction:', error);
        }
    });
}