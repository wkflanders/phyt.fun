import {
    UUIDv7,
    ApiError,
    AuthenticationError,
    PostQueryParams,
    UpdatePostRequest,
    CreatePostRequest,
    PostResponse,
    Post
} from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
    fetchPosts,
    fetchPostById,
    fetchUserPosts,
    createPost,
    updatePostStatus,
    deletePost,
    POST_QUERY_KEYS
} from '@/queries/posts';

import { useToast } from './use-toast';

export function useGetPosts(params: PostQueryParams = {}) {
    const { page = 1, limit = 10, filter = 'all' } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<PostResponse, ApiError>({
        queryKey: POST_QUERY_KEYS.list({ page, limit, filter }),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in?'
                );
            }
            return fetchPosts({ page, limit, filter }, token);
        }
    });
}

export function useGetPost(postId: UUIDv7) {
    const { getAccessToken } = usePrivy();

    return useQuery<Post, ApiError>({
        queryKey: POST_QUERY_KEYS.detail(postId),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in?'
                );
            }
            return fetchPostById(postId, token);
        },
        enabled: !!postId
    });
}

export function useUserPosts(userId: UUIDv7, params: PostQueryParams = {}) {
    const { page = 1, limit = 10 } = params;
    const { getAccessToken } = usePrivy();

    return useQuery<PostResponse, ApiError>({
        queryKey: POST_QUERY_KEYS.userPosts(userId, { page, limit }),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in?'
                );
            }
            return fetchUserPosts(userId, { page, limit }, token);
        },
        enabled: !!userId
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation<Post, ApiError, CreatePostRequest>({
        mutationFn: async (postData) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in?'
                );
            }
            return createPost(postData, token);
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Post created successfully'
            });
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
        },
        onError: (error: ApiError) => {
            console.error(error.message);
            toast({
                title: 'Error',
                description: 'Failed to create post',
                variant: 'destructive'
            });
        }
    });
}

export function useUpdatePostStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation<Post, ApiError, UpdatePostRequest>({
        mutationFn: async (updatePostData) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in?'
                );
            }
            return updatePostStatus(updatePostData, token);
        },
        onSuccess: (_, variables) => {
            toast({
                title: 'Success',
                description: `Post ${variables.status === 'deleted' ? 'deleted' : 'updated'} successfully`
            });
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
            queryClient.invalidateQueries({
                queryKey: POST_QUERY_KEYS.detail(variables.post_id)
            });
        },
        onError: (error: ApiError) => {
            console.error(error.message);
            toast({
                title: 'Error',
                description: 'Failed to update post',
                variant: 'destructive'
            });
        }
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation<Post, ApiError, UUIDv7>({
        mutationFn: async (postId) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in?'
                );
            }
            return deletePost(postId, token);
        },
        onSuccess: (_, postId) => {
            toast({
                title: 'Success',
                description: 'Post deleted successfully'
            });
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
            queryClient.removeQueries({
                queryKey: POST_QUERY_KEYS.detail(postId)
            });
        },
        onError: (error: ApiError) => {
            console.error(error.message);
            toast({
                title: 'Error',
                description: 'Failed to delete post',
                variant: 'destructive'
            });
        }
    });
}
