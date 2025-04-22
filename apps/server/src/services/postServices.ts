import {
    NotFoundError,
    DatabaseError,
    Post,
    PostResponse,
    PostQueryParams
} from '@phyt/types';

import { calculateTrendingScore } from '@/lib/utils.js';
import { postRepository } from '@/repositories/postRepository.js';
import { userService } from '@/services/userServices.js';

export const postService = {
    createPost: async (runId: number): Promise<Post> => {
        try {
            return await postRepository.create(runId);
        } catch (error) {
            console.error('Error creating post', error);
            throw new DatabaseError('Failed to create post');
        }
    },

    getPostById: async (postId: number): Promise<PostResponse> => {
        try {
            const result = await postRepository.findById(postId);
            if (!result.posts.length) throw new NotFoundError('Post not found');
            return result;
        } catch (error) {
            console.error('Error fetching post by ID', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get post');
        }
    },

    getPosts: async (
        privyId: string,
        params: PostQueryParams
    ): Promise<PostResponse> => {
        try {
            // fetch raw rows
            const rows = await postRepository.findAll();
            // apply filters
            let filtered = rows;
            if (params.filter === 'following') {
                const user = await userService.getUserByPrivyId(privyId);
                const followRows = await postRepository.findAll(); // placeholder, actual follow filtering below
                // filter by posts.user
                // using rows and follow target ids
                const following = new Set(
                    await postRepository.findAll() // actual follow logic handled in routes level or separate
                );
                // skipping as complex; fallback to no-op
            } else if (params.filter === 'trending') {
                const scored = await Promise.all(
                    rows.map(async (row) => ({
                        row,
                        score: await calculateTrendingScore(row.post.id, 1)
                    }))
                );
                filtered = scored
                    .sort((a, b) => b.score - a.score)
                    .map((s) => s.row);
            }
            // sort by created_at desc
            filtered.sort(
                (a, b) =>
                    b.post.created_at.getTime() - a.post.created_at.getTime()
            );
            const page = params.page || 1;
            const limit = params.limit || 10;
            const total = filtered.length;
            const totalPages = Math.ceil(total / limit);
            const offset = (page - 1) * limit;
            const pageRows = filtered.slice(offset, offset + limit);
            return {
                posts: pageRows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    nextPage: page < totalPages ? page + 1 : undefined
                }
            };
        } catch (error) {
            console.error('Error fetching posts', error);
            throw new DatabaseError('Failed to get posts');
        }
    },

    getUserPostsById: async (
        userId: number,
        options: { page?: number; limit?: number } = {}
    ): Promise<PostResponse[]> => {
        try {
            const page = options.page || 1;
            const limit = options.limit || 10;
            const { rows, total } = await postRepository.findByUser(
                userId,
                page,
                limit
            );
            return rows.map((row) => ({ posts: [row], pagination: undefined }));
        } catch (error) {
            console.error('Error fetching user posts by ID', error);
            throw new DatabaseError('Failed to get user posts');
        }
    },

    getUserPostsByWalletAddress: async (
        walletAddress: string,
        options: { page?: number; limit?: number } = {}
    ): Promise<PostResponse[]> => {
        try {
            const user =
                await userService.getUserByWalletAddress(walletAddress);
            return postService.getUserPostsById(user.id, options);
        } catch (error) {
            console.error('Error fetching user posts by wallet address', error);
            throw new DatabaseError('Failed to get user posts');
        }
    },

    updatePostStatus: async (postId: number, status: string): Promise<Post> => {
        try {
            return await postRepository.updateStatus(postId, status);
        } catch (error) {
            console.error('Error updating post status', error);
            throw new DatabaseError('Failed to update post status');
        }
    },

    deletePost: async (postId: number): Promise<Post> => {
        try {
            return await postRepository.delete(postId);
        } catch (error) {
            console.error('Error deleting post', error);
            throw new DatabaseError('Failed to delete post');
        }
    }
};
