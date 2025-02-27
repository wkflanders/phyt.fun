import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { ApiError, PostsQueryParams } from '@phyt/types';
import {
    fetchPosts,
    fetchPostById,
    fetchUserPosts,
    createPost,
    updatePostStatus,
    deletePost,
    POST_QUERY_KEYS
} from '../queries/posts';

export function useGetPosts(params: PostsQueryParams = {}) {
    const { page = 1, limit = 10, filter = 'all' } = params;

    return useQuery({
        queryKey: POST_QUERY_KEYS.list({ page, limit, filter }),
        queryFn: () => fetchPosts({ page, limit, filter })
    });
}

export function useGetPost(postId: number) {
    return useQuery({
        queryKey: POST_QUERY_KEYS.detail(postId),
        queryFn: () => fetchPostById(postId),
        enabled: !!postId
    });
}

export function useUserPosts(userId: number, params: { page?: number, limit?: number; } = {}) {
    const { page = 1, limit = 10 } = params;

    return useQuery({
        queryKey: POST_QUERY_KEYS.userPosts(userId, { page, limit }),
        queryFn: () => fetchUserPosts(userId, { page, limit }),
        enabled: !!userId
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Post created successfully',
            });
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
        },
        onError: (error: ApiError) => {
            toast({
                title: 'Error',
                description: error.error || 'Failed to create post',
                variant: 'destructive',
            });
        }
    });
}

export function useUpdatePostStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: updatePostStatus,
        onSuccess: (_, variables) => {
            toast({
                title: 'Success',
                description: `Post ${variables.status === 'deleted' ? 'deleted' : 'updated'} successfully`,
            });
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.detail(variables.postId) });
        },
        onError: (error: ApiError) => {
            toast({
                title: 'Error',
                description: error.error || 'Failed to update post',
                variant: 'destructive',
            });
        }
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: deletePost,
        onSuccess: (_, postId) => {
            toast({
                title: 'Success',
                description: 'Post deleted successfully',
            });
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
            queryClient.removeQueries({ queryKey: POST_QUERY_KEYS.detail(postId) });
        },
        onError: (error: ApiError) => {
            toast({
                title: 'Error',
                description: error.error || 'Failed to delete post',
                variant: 'destructive',
            });
        }
    });
}