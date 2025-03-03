import { ApiError, PostsQueryParams, PostsResponse, Post } from '@phyt/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const POST_QUERY_KEYS = {
    all: ['posts'] as const,
    lists: () => [...POST_QUERY_KEYS.all, 'list'] as const,
    list: (filters: PostsQueryParams) => [...POST_QUERY_KEYS.lists(), filters] as const,
    details: () => [...POST_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...POST_QUERY_KEYS.details(), id] as const,
    userPosts: (userId: number, params?: { page?: number; limit?: number; }) =>
        ['userPosts', userId, params] as const,
};

export async function fetchPosts(params: PostsQueryParams = {}, token: string | null): Promise<PostsResponse> {
    const { page = 1, limit = 10, filter = 'all' } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    if (filter !== 'all') {
        searchParams.append('filter', filter);
    }

    const response = await fetch(`${API_URL}/posts?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to fetch posts',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch a specific post by ID
export async function fetchPostById(postId: number, token: string | null): Promise<Post> {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to fetch post',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to fetch posts by a specific user
export async function fetchUserPosts(userId: number, params: { page?: number, limit?: number; } = {}, token: string | null): Promise<PostsResponse> {
    const { page = 1, limit = 10 } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    const response = await fetch(`${API_URL}/posts/user/${userId}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to fetch user posts',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to create a new post
export async function createPost(data: { run_id: number, content?: string; }, token: string | null): Promise<Post> {
    const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer: ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to create post',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to update a post's status
export async function updatePostStatus({ postId, status }: { postId: number, status: 'visible' | 'hidden' | 'deleted'; }, token: string | null): Promise<Post> {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
            "Authorization": `Bearer: ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to update post status',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

// Function to delete a post
export async function deletePost(postId: number, token: string | null): Promise<Post> {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer: ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || 'Failed to delete post',
            status: response.status
        } as ApiError;
    }

    return response.json();
}