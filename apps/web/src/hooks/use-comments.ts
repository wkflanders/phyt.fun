import {
    CommentIdDTO,
    CommentQueryParamsDTO,
    CreateCommentDTO,
    UpdateCommentDTO,
    CommentsPageDTO,
    CommentDTO
} from '@phyt/dto';

import { APIError } from '@phyt/infra';

import {
    fetchPostComments,
    fetchCommentReplies,
    fetchComment,
    createComment,
    updateComment,
    deleteComment,
    COMMENT_QUERY_KEYS
} from '@/queries/commentsQueries';
import { POST_QUERY_KEYS } from '@/queries/postsQueries';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './use-toast';

export function usePostComments(
    postId: CommentIdDTO,
    params: CommentQueryParamsDTO = {}
) {
    const { page = 1, limit = 20, parentOnly = false } = params;

    return useQuery<CommentsPageDTO, APIError>({
        queryKey: COMMENT_QUERY_KEYS.postComments(postId, {
            page,
            limit,
            parentOnly
        }),
        queryFn: async () => {
            return fetchPostComments(postId, { page, limit, parentOnly });
        },
        enabled: !!postId
    });
}

export function useCommentReplies(
    commentId: CommentIdDTO,
    params: CommentQueryParamsDTO = {}
) {
    const { page = 1, limit = 20 } = params;

    return useQuery<CommentsPageDTO, APIError>({
        queryKey: COMMENT_QUERY_KEYS.replies(commentId, { page, limit }),
        queryFn: async () => {
            return fetchCommentReplies(commentId, { page, limit });
        },
        enabled: !!commentId
    });
}

export function useComment(commentId: CommentIdDTO) {
    return useQuery<CommentDTO, APIError>({
        queryKey: COMMENT_QUERY_KEYS.detail(commentId),
        queryFn: async () => {
            return fetchComment(commentId);
        },
        enabled: !!commentId
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<CommentDTO, APIError, CreateCommentDTO>({
        mutationFn: async (commentData) => {
            return createComment(commentData);
        },
        onSuccess: (newComment, variables) => {
            // Invalidate post comments
            if (variables.postId) {
                queryClient.invalidateQueries({
                    queryKey: COMMENT_QUERY_KEYS.postComments(variables.postId)
                });
                // Update post stats if available
                queryClient.invalidateQueries({
                    queryKey: POST_QUERY_KEYS.detail(variables.postId)
                });
            }

            // Invalidate parent comment replies if this is a reply
            if (variables.parentCommentId) {
                queryClient.invalidateQueries({
                    queryKey: COMMENT_QUERY_KEYS.replies(
                        variables.parentCommentId
                    )
                });
            }

            toast({
                title: 'Success',
                description: 'Comment created successfully'
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create comment',
                variant: 'destructive'
            });
        }
    });
}

export function useUpdateComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<
        CommentDTO,
        APIError,
        { commentId: CommentIdDTO; updateData: UpdateCommentDTO }
    >({
        mutationFn: async ({ commentId, updateData }) => {
            return updateComment(commentId, updateData);
        },
        onSuccess: (updatedComment) => {
            queryClient.setQueryData(
                COMMENT_QUERY_KEYS.detail(updatedComment.id),
                updatedComment
            );
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.postComments(updatedComment.postId)
            });

            toast({
                title: 'Success',
                description: 'Comment updated successfully'
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update comment',
                variant: 'destructive'
            });
        }
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<CommentDTO, APIError, CommentIdDTO>({
        mutationFn: async (commentId) => {
            return deleteComment(commentId);
        },
        onSuccess: (deletedComment) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.postComments(deletedComment.postId)
            });
            queryClient.invalidateQueries({
                queryKey: POST_QUERY_KEYS.detail(deletedComment.postId)
            });

            toast({
                title: 'Success',
                description: 'Comment deleted successfully'
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete comment',
                variant: 'destructive'
            });
        }
    });
}
