import {
    CommentIdDTO,
    PostIdDTO,
    ReactionCountDTO,
    ReactionDTO,
    ReactionToggleDTO
} from '@phyt/dto';

import { APIError } from '@phyt/infra';

import { POST_QUERY_KEYS } from '@/queries/postsQueries';
import {
    fetchPostReactions,
    fetchCommentReactions,
    fetchUserPostReactions,
    fetchUserCommentReactions,
    toggleReaction,
    REACTION_QUERY_KEYS
} from '@/queries/reactionsQueries';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePostReactions(postId: PostIdDTO) {
    return useQuery<ReactionCountDTO, APIError>({
        queryKey: REACTION_QUERY_KEYS.posts.byPost(postId),
        queryFn: async () => {
            return fetchPostReactions(postId);
        },
        enabled: !!postId
    });
}

export function useCommentReactions(commentId: CommentIdDTO) {
    return useQuery<ReactionCountDTO, APIError>({
        queryKey: REACTION_QUERY_KEYS.comments.byComment(commentId),
        queryFn: async () => {
            return fetchCommentReactions(commentId);
        },
        enabled: !!commentId
    });
}

export function useUserPostReactions(postId: PostIdDTO) {
    return useQuery<ReactionDTO[], APIError>({
        queryKey: REACTION_QUERY_KEYS.posts.byUser(postId),
        queryFn: async () => {
            return fetchUserPostReactions(postId);
        },
        enabled: !!postId
    });
}

export function useUserCommentReactions(commentId: CommentIdDTO) {
    return useQuery<ReactionDTO[], APIError>({
        queryKey: REACTION_QUERY_KEYS.comments.byUser(commentId),
        queryFn: async () => {
            return fetchUserCommentReactions(commentId);
        },
        enabled: !!commentId
    });
}

export function useToggleReaction() {
    const queryClient = useQueryClient();

    return useMutation<ReactionDTO, APIError, ReactionToggleDTO>({
        mutationFn: async (reactionData) => {
            return toggleReaction(reactionData);
        },
        onSuccess: (_, variables) => {
            // Invalidate queries for reacting to a post
            if (variables.postId) {
                queryClient.invalidateQueries({
                    queryKey: REACTION_QUERY_KEYS.posts.byPost(variables.postId)
                });
                queryClient.invalidateQueries({
                    queryKey: REACTION_QUERY_KEYS.posts.byUser(variables.postId)
                });

                // Also update post counts in feed
                queryClient.invalidateQueries({
                    queryKey: POST_QUERY_KEYS.all
                });
                queryClient.invalidateQueries({
                    queryKey: POST_QUERY_KEYS.detail(variables.postId)
                });
            }

            // Invalidate queries for reacting to a comment
            if (variables.commentId) {
                queryClient.invalidateQueries({
                    queryKey: REACTION_QUERY_KEYS.comments.byComment(
                        variables.commentId
                    )
                });
                queryClient.invalidateQueries({
                    queryKey: REACTION_QUERY_KEYS.comments.byUser(
                        variables.commentId
                    )
                });
            }
        },
        onError: (error: APIError) => {
            console.error('Failed to toggle reaction:', error);
        }
    });
}
