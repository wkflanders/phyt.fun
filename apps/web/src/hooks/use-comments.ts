import {
    ApiError,
    AuthenticationError,
    CommentQueryParams,
    CommentCreateRequest,
    CommentUpdateRequest,
    CommentResponse
} from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
    fetchPostComments,
    fetchCommentReplies,
    fetchComment,
    createComment,
    updateComment,
    deleteComment,
    COMMENT_QUERY_KEYS
} from '@/queries/comments';
import { POST_QUERY_KEYS } from '@/queries/posts';

import { useToast } from './use-toast';

export function usePostComments(
    postId: number,
    params: CommentQueryParams = {}
) {
    const { page = 1, limit = 20, parent_only = false } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<CommentResponse, ApiError>({
        queryKey: COMMENT_QUERY_KEYS.postComments(postId, {
            page,
            limit,
            parent_only
        }),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return fetchPostComments(
                postId,
                { page, limit, parent_only },
                token
            );
        },
        enabled: !!postId
    });
}

export function useCommentReplies(
    commentId: number,
    params: CommentQueryParams = {}
) {
    const { page = 1, limit = 20 } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<CommentResponse, ApiError>({
        queryKey: COMMENT_QUERY_KEYS.replies(commentId, { page, limit }),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }

            return fetchCommentReplies(commentId, { page, limit }, token);
        },
        enabled: !!commentId
    });
}

export function useComment(commentId: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<Comment, ApiError>({
        queryKey: COMMENT_QUERY_KEYS.detail(commentId),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return fetchComment(commentId, token);
        },
        enabled: !!commentId
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation<Comment, ApiError, CommentCreateRequest>({
        mutationFn: async (commentData) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return createComment(commentData, token);
        },
        onSuccess: (_, variables) => {
            toast({
                title: 'Success',
                description: 'Comment added successfully'
            });

            // Invalidate relevant queries
            if (variables.parent_comment_id) {
                queryClient.invalidateQueries({
                    queryKey: COMMENT_QUERY_KEYS.replies(
                        variables.parent_comment_id
                    )
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: COMMENT_QUERY_KEYS.postComments(variables.post_id)
                });
            }

            // Also invalidate the post to update comment count
            queryClient.invalidateQueries({
                queryKey: POST_QUERY_KEYS.detail(variables.post_id)
            });
        },
        onError: (error: ApiError) => {
            console.error(error.message);
            toast({
                title: 'Error',
                description: 'Failed to add comment',
                variant: 'destructive'
            });
        }
    });
}

export function useUpdateComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation<Comment, ApiError, CommentUpdateRequest>({
        mutationFn: async (commentData) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return updateComment(commentData, token);
        },
        onSuccess: (_, variables) => {
            toast({
                title: 'Success',
                description: 'Comment updated successfully'
            });
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.detail(variables.commentId)
            });
        },
        onError: (error: ApiError) => {
            console.error(error.message);
            toast({
                title: 'Error',
                description: 'Failed to update comment',
                variant: 'destructive'
            });
        }
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation<Comment, ApiError, number>({
        mutationFn: async (commentId) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return deleteComment(commentId, token);
        },
        onSuccess: (_, commentId) => {
            toast({
                title: 'Success',
                description: 'Comment deleted successfully'
            });
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.all
            });
            queryClient.removeQueries({
                queryKey: COMMENT_QUERY_KEYS.detail(commentId)
            });
        },
        onError: (error: ApiError) => {
            console.error(error.message);
            toast({
                title: 'Error',
                description: 'Failed to delete comment',
                variant: 'destructive'
            });
        }
    });
}
