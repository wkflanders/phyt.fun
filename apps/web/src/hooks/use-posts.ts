import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { ApiError, PostQueryParams, PostUpdateRequest, PostCreateRequest, PostResponse, Post } from '@phyt/types';
import {
    fetchPosts,
    fetchPostById,
    fetchUserPosts,
    createPost,
    updatePostStatus,
    deletePost,
    POST_QUERY_KEYS
} from '../queries/posts';
import { usePrivy } from '@privy-io/react-auth';

export function useGetPosts(params: PostQueryParams = {}) {
    const { page = 1, limit = 10, filter = 'all' } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<PostResponse, ApiError>({
        queryKey: POST_QUERY_KEYS.list({ page, limit, filter }),
        queryFn: async () => {
            const token = await getAccessToken();
            return fetchPosts({ page, limit, filter }, token);
        },
    });
}

export function useGetPost(postId: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<Post, ApiError>({
        queryKey: POST_QUERY_KEYS.detail(postId),
        queryFn: async () => {
            const token = await getAccessToken();
            return fetchPostById(postId, token);
        },
        enabled: !!postId
    });
}

export function useUserPosts(userId: number, params: PostQueryParams = {}) {
    const { page = 1, limit = 10 } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<PostResponse, ApiError>({
        queryKey: POST_QUERY_KEYS.userPosts(userId, { page, limit }),
        queryFn: async () => {
            const token = await getAccessToken();
            return fetchUserPosts(userId, { page, limit }, token);
        },
        enabled: !!userId
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation<Post, ApiError, PostCreateRequest>({
        mutationFn: async (postData) => {
            const token = await getAccessToken();
            return createPost(postData, token);
        },
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
    const { getAccessToken } = usePrivy();

    return useMutation<Post, ApiError, PostUpdateRequest>({
        mutationFn: async (updatePostData) => {
            const token = await getAccessToken();
            return updatePostStatus(updatePostData, token);
        },
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
    const { getAccessToken } = usePrivy();

    return useMutation<Post, ApiError, number>({
        mutationFn: async (postId) => {
            const token = await getAccessToken();
            return deletePost(postId, token);
        },
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