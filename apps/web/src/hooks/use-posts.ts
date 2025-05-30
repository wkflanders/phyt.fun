import {
    PostDTO,
    CreatePostDTO,
    UpdatePostDTO,
    PostQueryParamsDTO,
    PostsPageDTO,
    PostIdDTO,
    UserIdDTO
} from '@phyt/dto';

import { APIError } from '@phyt/infra';

import {
    fetchPosts,
    fetchPostById,
    fetchUserPosts,
    createPost,
    updatePostStatus,
    deletePost,
    POST_QUERY_KEYS
} from '@/queries/postsQueries';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './use-toast';

export function useGetPosts(params: PostQueryParamsDTO = {}) {
    const { page = 1, limit = 10, filter = 'all' } = params;

    return useQuery<PostsPageDTO, APIError>({
        queryKey: POST_QUERY_KEYS.list({ page, limit, filter }),
        queryFn: async () => {
            return fetchPosts({ page, limit, filter });
        }
    });
}

export function useGetPostById(postId: PostIdDTO) {
    return useQuery<PostDTO, APIError>({
        queryKey: POST_QUERY_KEYS.detail(postId),
        queryFn: async () => {
            return fetchPostById(postId);
        },
        enabled: !!postId
    });
}

export function useGetUserPosts(
    userId: UserIdDTO,
    params: { page?: number; limit?: number } = {}
) {
    return useQuery<PostsPageDTO, APIError>({
        queryKey: POST_QUERY_KEYS.userPosts(userId, params),
        queryFn: async () => {
            return fetchUserPosts(userId, params);
        },
        enabled: !!userId
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<PostDTO, APIError, CreatePostDTO>({
        mutationFn: async (postData) => {
            return createPost(postData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
            toast({
                title: 'Success',
                description: 'Post created successfully'
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create post',
                variant: 'destructive'
            });
        }
    });
}

export function useUpdatePostStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<PostDTO, APIError, UpdatePostDTO>({
        mutationFn: async (updateData) => {
            return updatePostStatus(updateData);
        },
        onSuccess: (updatedPost) => {
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
            queryClient.setQueryData(
                POST_QUERY_KEYS.detail(updatedPost.id),
                updatedPost
            );
            toast({
                title: 'Success',
                description: 'Post updated successfully'
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update post',
                variant: 'destructive'
            });
        }
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<PostDTO, APIError, PostIdDTO>({
        mutationFn: async (postId) => {
            return deletePost(postId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all });
            toast({
                title: 'Success',
                description: 'Post deleted successfully'
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete post',
                variant: 'destructive'
            });
        }
    });
}
