import { PostQueryParams, PostResponse, Post } from '@phyt/types';

import { api } from '@/lib/api';

export const POST_QUERY_KEYS = {
    all: ['posts'] as const,
    lists: () => [...POST_QUERY_KEYS.all, 'list'] as const,
    list: (filters: PostQueryParams) =>
        [...POST_QUERY_KEYS.lists(), filters] as const,
    details: () => [...POST_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...POST_QUERY_KEYS.details(), id] as const,
    userPosts: (userId: number, params?: { page?: number; limit?: number }) =>
        ['userPosts', userId, params] as const
};

export async function fetchPosts(
    { page = 1, limit = 10, filter = 'all' }: PostQueryParams = {},
    token: string
): Promise<PostResponse> {
    const response = await api.get<PostResponse>('/posts', {
        params: { page, limit, filter },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to fetch a specific post by ID
export async function fetchPostById(
    postId: number,
    token: string
): Promise<Post> {
    const response = await api.get<Post>(`/posts/${String(postId)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to fetch posts by a specific user
export async function fetchUserPosts(
    userId: number,
    { page = 1, limit = 10 }: PostQueryParams = {},
    token: string
): Promise<PostResponse> {
    const response = await api.get<PostResponse>(
        `/posts/user/${String(userId)}`,
        {
            params: { page, limit },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

// Function to create a new post
export async function createPost(
    postData: { run_id: number; content?: string },
    token: string
): Promise<Post> {
    const response = await api.post<Post>(`/posts`, postData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to update a post's status
export async function updatePostStatus(
    updatePostData: {
        postId: number;
        status: 'visible' | 'hidden' | 'deleted';
    },
    token: string
): Promise<Post> {
    const { postId, status } = updatePostData;
    const response = await api.patch<Post>(`/posts/${String(postId)}`, status, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// Function to delete a post
export async function deletePost(postId: number, token: string): Promise<Post> {
    const response = await api.delete<Post>(`/posts/${String(postId)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}
