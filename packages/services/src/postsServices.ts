import { PostsVO } from '@phyt/models';

import { PostSchema } from '@phyt/dto';

import type {
    PostIdDTO,
    UserIdDTO,
    PostDTO,
    CreatePostDTO,
    UpdatePostDTO,
    PostsPageDTO,
    PostQueryParamsDTO
} from '@phyt/dto';
import type { PostsRepository } from '@phyt/repositories';

export type PostsService = ReturnType<typeof makePostsService>;

export const makePostsService = ({
    postsRepo
}: {
    postsRepo: PostsRepository;
}) => {
    const createPost = async ({
        input
    }: {
        input: CreatePostDTO;
    }): Promise<PostDTO> => {
        const postVO = PostsVO.create({ input });
        await postsRepo.save({ input: postVO });
        return PostSchema.parse(postVO.toDTO<PostDTO>());
    };

    const getPosts = async ({
        params
    }: {
        params: PostQueryParamsDTO;
    }): Promise<PostsPageDTO> => {
        const paginatedPosts = await postsRepo.findAll({ params });
        return {
            posts: paginatedPosts.posts.map((p) =>
                PostSchema.parse(p.toDTO<PostDTO>())
            ),
            pagination: paginatedPosts.pagination
        };
    };

    const getUserPosts = async ({
        userId,
        params
    }: {
        userId: UserIdDTO;
        params: PostQueryParamsDTO;
    }): Promise<PostsPageDTO> => {
        const paginatedPosts = await postsRepo.findByUser({ userId, params });
        return {
            posts: paginatedPosts.posts.map((p) =>
                PostSchema.parse(p.toDTO<PostDTO>())
            ),
            pagination: paginatedPosts.pagination
        };
    };

    const getPostById = async ({
        postId
    }: {
        postId: PostIdDTO;
    }): Promise<PostDTO> => {
        const postVO = await postsRepo.findById({ postId });
        return PostSchema.parse(postVO.toDTO<PostDTO>());
    };

    const updatePost = async ({
        postId,
        update
    }: {
        postId: PostIdDTO;
        update: UpdatePostDTO;
    }): Promise<PostDTO> => {
        const postVO = (await postsRepo.findById({ postId })).update({
            update
        });
        await postsRepo.save({
            input: {
                userId: postVO.userId,
                runId: postVO.runId,
                title: postVO.title,
                content: postVO.content,
                status: postVO.status
            }
        });
        return PostSchema.parse(postVO.toDTO<PostDTO>());
    };

    const deletePost = async ({
        postId
    }: {
        postId: PostIdDTO;
    }): Promise<PostDTO> => {
        const postVO = await postsRepo.findById({ postId });
        await postsRepo.remove({ postId });
        return PostSchema.parse(postVO.toDTO<PostDTO>());
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
