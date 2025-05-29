import {
    CommentIdDTO,
    CommentQueryParamsDTO,
    CreateCommentDTO,
    UpdateCommentDTO,
    CommentsPageDTO,
    CommentDTO
} from '@phyt/dto';

import { APIError, AuthenticationError } from '@phyt/infra';

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

import { usePrivy } from '@privy-io/react-auth';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './use-toast';

export function usePostComments(
    postId: CommentIdDTO,
    params: CommentQueryParamsDTO = {}
) {
    const { page = 1, limit = 20, parentOnly = false } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<CommentsPageDTO, APIError>({
        queryKey: COMMENT_QUERY_KEYS.postComments(postId, {
            page,
            limit,
            parentOnly
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
                { page, limit, parentOnly },
                token
            );
        },
        enabled: !!postId
    });
}

export function useCommentReplies(
    commentId: CommentIdDTO,
    params: CommentQueryParamsDTO = {}
) {
    const { page = 1, limit = 20 } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<CommentsPageDTO, APIError>({
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

export function useComment(commentId: CommentIdDTO) {
    const { getAccessToken } = usePrivy();

    return useQuery<CommentDTO, APIError>({
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

    return useMutation<CommentDTO, APIError, CreateCommentDTO>({
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
            if (variables.parentCommentId) {
                queryClient.invalidateQueries({
                    queryKey: COMMENT_QUERY_KEYS.replies(
                        variables.parentCommentId
                    )
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: COMMENT_QUERY_KEYS.postComments(variables.postId)
                });
            }

            // Also invalidate the post to update comment count
            queryClient.invalidateQueries({
                queryKey: POST_QUERY_KEYS.detail(variables.postId)
            });
        },
        onError: (error: APIError) => {
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

    return useMutation<CommentDTO, APIError, UpdateCommentDTO>({
        mutationFn: async (updateCommentData) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return updateComment(updateCommentData, token);
        },
        onSuccess: (returnedComment, variables) => {
            toast({
                title: 'Success',
                description: 'Comment updated successfully'
            });
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.detail(returnedComment.id)
            });
        },
        onError: (error: APIError) => {
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

    return useMutation<CommentDTO, APIError, CommentIdDTO>({
        mutationFn: async (commentId) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return deleteComment(commentId, token);
        },
        onSuccess: (returnedComment, commentId) => {
            toast({
                title: 'Success',
                description: 'Comment deleted successfully'
            });
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.all
            });
            queryClient.removeQueries({
                queryKey: COMMENT_QUERY_KEYS.detail(returnedComment.id)
            });
        },
        onError: (error: APIError) => {
            console.error(error.message);
            toast({
                title: 'Error',
                description: 'Failed to delete comment',
                variant: 'destructive'
            });
        }
    });
}
