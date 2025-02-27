import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { ApiError, CommentsQueryParams } from '@phyt/types';
import {
    fetchPostComments,
    fetchCommentReplies,
    fetchComment,
    createComment,
    updateComment,
    deleteComment,
    COMMENT_QUERY_KEYS
} from '../queries/comments';
import { POST_QUERY_KEYS } from '../queries/posts';

export function usePostComments(postId: number, params: CommentsQueryParams = {}) {
    const { page = 1, limit = 20, parentOnly = false } = params;

    return useQuery({
        queryKey: COMMENT_QUERY_KEYS.postComments(postId, { page, limit, parentOnly }),
        queryFn: () => fetchPostComments(postId, { page, limit, parentOnly }),
        enabled: !!postId
    });
}

export function useCommentReplies(commentId: number, params: { page?: number, limit?: number; } = {}) {
    const { page = 1, limit = 20 } = params;

    return useQuery({
        queryKey: COMMENT_QUERY_KEYS.replies(commentId, { page, limit }),
        queryFn: () => fetchCommentReplies(commentId, { page, limit }),
        enabled: !!commentId
    });
}

export function useComment(commentId: number) {
    return useQuery({
        queryKey: COMMENT_QUERY_KEYS.detail(commentId),
        queryFn: () => fetchComment(commentId),
        enabled: !!commentId
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: createComment,
        onSuccess: (_, variables) => {
            toast({
                title: 'Success',
                description: 'Comment added successfully',
            });

            // Invalidate relevant queries
            if (variables.parent_comment_id) {
                queryClient.invalidateQueries({
                    queryKey: COMMENT_QUERY_KEYS.replies(variables.parent_comment_id)
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
            toast({
                title: 'Error',
                description: error.error || 'Failed to add comment',
                variant: 'destructive',
            });
        }
    });
}

export function useUpdateComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: updateComment,
        onSuccess: (_, variables) => {
            toast({
                title: 'Success',
                description: 'Comment updated successfully',
            });
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.detail(variables.commentId)
            });
        },
        onError: (error: ApiError) => {
            toast({
                title: 'Error',
                description: error.error || 'Failed to update comment',
                variant: 'destructive',
            });
        }
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: deleteComment,
        onSuccess: (_, commentId) => {
            toast({
                title: 'Success',
                description: 'Comment deleted successfully',
            });
            queryClient.invalidateQueries({
                queryKey: COMMENT_QUERY_KEYS.all
            });
            queryClient.removeQueries({
                queryKey: COMMENT_QUERY_KEYS.detail(commentId)
            });
        },
        onError: (error: ApiError) => {
            toast({
                title: 'Error',
                description: error.error || 'Failed to delete comment',
                variant: 'destructive',
            });
        }
    });
}