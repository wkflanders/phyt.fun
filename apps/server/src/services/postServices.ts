import {
    UUIDv7,
    CommentResponse,
    Comment,
    CommentCreateRequest,
    CommentUpdateRequest,
    CommentQueryParams,
    NotFoundError,
    ValidationError
} from '@phyt/types';

import type { PostRepository } from '@/repositories/postRepository.js';

export type {PostService} = ReturnType<typeof makePostService>;

export const makePostService = {
    createPost: async (runId: UUIDv7): Promise<Post> => {},

    getPostById: async (postId: UUIDv7): Promise<PostResponse> => {},

    getPosts: async (
        privyId: string,
        { limit = 10, page = 1, filter }: PostQueryParams
    ): Promise<PostResponse> => {},

    getUserPostsById: async (
        userId: UUIDv7,
        { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
    ): Promise<PostResponse[]> => {},

    getUserPostsByWalletAddress: async (
        walletAddress: string,
        { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
    ): Promise<PostResponse[]> => {},

    updatePostStatus: async ({
        postId,
        status
    }: UpdatePostRequest): Promise<Post> => {},

    deletePost: async (postId: UUIDv7): Promise<Post> => {}
};
