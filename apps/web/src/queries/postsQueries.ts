import {
    PostIdDTO,
    PostQueryParamsDTO,
    PostDTO,
    PostsPageDTO,
    UserIdDTO,
    CreatePostDTO,
    UpdatePostDTO
} from '@phyt/dto';

import { api } from '@/lib/api';

export const POST_QUERY_KEYS = {
    all: ['posts'] as const,
    lists: () => [...POST_QUERY_KEYS.all, 'list'] as const,
    list: (filters: PostQueryParamsDTO) =>
        [...POST_QUERY_KEYS.lists(), filters] as const,
    details: () => [...POST_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: PostIdDTO) => [...POST_QUERY_KEYS.details(), id] as const,
    userPosts: (
        userId: UserIdDTO,
        params?: { page?: number; limit?: number }
    ) => ['userPosts', userId, params] as const
};

export async function fetchPosts({
    page = 1,
    limit = 10,
    filter = 'all'
}: PostQueryParamsDTO = {}): Promise<PostsPageDTO> {
    const response = await api.get<PostsPageDTO>('/posts', {
        params: { page, limit, filter }
    });
    return response.data;
}

// Function to fetch a specific post by ID
export async function fetchPostById(postId: PostIdDTO): Promise<PostDTO> {
    const response = await api.get<PostDTO>(`/posts/${String(postId)}`);
    return response.data;
}

// Function to fetch posts by a specific user
export async function fetchUserPosts(
    userId: PostIdDTO,
    { page = 1, limit = 10 }: PostQueryParamsDTO = {}
): Promise<PostsPageDTO> {
    const response = await api.get<PostsPageDTO>(
        `/posts/user/${String(userId)}`,
        {
            params: { page, limit }
        }
    );
    return response.data;
}

// Function to create a new post
export async function createPost(postData: CreatePostDTO): Promise<PostDTO> {
    const response = await api.post<PostDTO>(`/posts`, postData);
    return response.data;
}

// Function to update a post's status
export async function updatePostStatus(
    updatePostData: UpdatePostDTO
): Promise<PostDTO> {
    const response = await api.patch<PostDTO>(
        `/posts/update/${String(updatePostData.postId)}`,
        updatePostData.status
    );
    return response.data;
}

// Function to delete a post
export async function deletePost(postId: PostIdDTO): Promise<PostDTO> {
    const response = await api.delete<PostDTO>(`/posts/${String(postId)}`);
    return response.data;
}
