import { PostsVO } from '@phyt/models';

import type { PostDTO, PostsPageDTO, PostWithUserDTO } from '@phyt/dto';
import type { PostsRepository } from '@phyt/repositories';
import type {
    UUIDv7,
    PostInsert,
    PostUpdate,
    PostQueryParams
} from '@phyt/types';

export type PostsService = ReturnType<typeof makePostsService>;

export const makePostsService = (repo: PostsRepository) => {
    const _findById = async (postId: UUIDv7): Promise<PostsVO> => {
        const postVO = await repo.findById(postId);
        return postVO;
    };

    /**
     * Public API: Always return plain Post DTOs for external consumption
     */
    const createPost = async (input: PostInsert): Promise<PostDTO> => {
        PostsVO.validateInput(input);

        const postVO = await repo.create(input);
        return postVO.toDTO<PostDTO>();
    };

    const getPosts = async (params: PostQueryParams): Promise<PostsPageDTO> => {
        const result = await repo.list(params);
        return {
            posts: result.posts.map((p) => p.toDTO<PostWithUserDTO>()),
            pagination: result.pagination
        };
    };

    const getUserPosts = async (
        userId: UUIDv7,
        params: PostQueryParams
    ): Promise<PostsPageDTO> => {
        const result = await repo.listByUser(userId, params);
        return {
            posts: result.posts.map((p) => p.toDTO<PostWithUserDTO>()),
            pagination: result.pagination
        };
    };

    const getPostById = async (postId: UUIDv7): Promise<PostDTO> => {
        const postVO = await _findById(postId);
        return postVO.toDTO<PostDTO>();
    };

    const updatePost = async (
        postId: UUIDv7,
        input: PostUpdate
    ): Promise<PostDTO> => {
        if (Object.keys(input).length > 0) {
            PostsVO.validateUpdate(input);
        }

        const savedVO = await repo.update(postId, input);
        return savedVO.toDTO<PostDTO>();
    };

    const deletePost = async (postId: UUIDv7): Promise<PostDTO> => {
        const deletedVO = await repo.remove(postId);
        return deletedVO.toDTO<PostDTO>();
    };

    return Object.freeze({
        createPost,
        getPosts,
        getUserPosts,
        getPostById,
        updatePost,
        deletePost
    });
};
