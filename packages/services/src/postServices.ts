import {
    UUIDv7,
    PostResponse,
    Post,
    PostQueryParams,
    UpdatePostRequest
} from '@phyt/types';

import type { PostRepository } from '@/repositories/postRepository.js';

export type PostService = ReturnType<typeof makePostService>;

export const makePostService = (repo: PostRepository) => {
    const createPost = async (userId: UUIDv7, runId: UUIDv7): Promise<Post> => {
        return repo.create(userId, runId);
    };

    const getPostById = async (postId: UUIDv7): Promise<PostResponse> => {
        return repo.getById(postId);
    };

    const getPosts = async (
        userId: UUIDv7,
        params: PostQueryParams
    ): Promise<PostResponse> => {
        return repo.list(userId, params);
    };

    const getUserPostsById = async (
        userId: UUIDv7,
        params: PostQueryParams
    ): Promise<PostResponse> => {
        return repo.getByUserId(userId, params);
    };

    const getUserPostsByWalletAddress = async (
        walletAddress: `0x${string}`,
        params: PostQueryParams
    ): Promise<PostResponse> => {
        return repo.getByUserWalletAddress(walletAddress, params);
    };

    const updatePostStatus = async (
        postData: UpdatePostRequest
    ): Promise<Post> => {
        const { postId, status } = postData;
        return repo.updateStatus(postId, status);
    };

    const deletePost = async (postId: UUIDv7): Promise<Post> => {
        return repo.delete(postId);
    };

    return Object.freeze({
        createPost,
        getPosts,
        getPostById,
        getUserPostsById,
        getUserPostsByWalletAddress,
        updatePostStatus,
        deletePost
    });
};
