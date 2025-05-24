import { PostsVO } from '@phyt/models';

import type { PostsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    PostInsert,
    PostUpdate,
    PostQueryParams,
    PaginatedPosts
} from '@phyt/types';

export type PostsRepository = ReturnType<typeof makePostsRepository>;

export const makePostsRepository = (ops: PostsDrizzleOps) => {
    const save = async (input: PostInsert): Promise<PostsVO> => {
        const data = await ops.create(input);
        return PostsVO.from(data);
    };

    const findById = async (postId: UUIDv7): Promise<PostsVO> => {
        const data = await ops.findById(postId);
        return PostsVO.from(data);
    };

    const findAll = async (
        params: PostQueryParams
    ): Promise<PaginatedPosts<PostsVO>> => {
        const paginatedData = await ops.list(params);

        return {
            posts: paginatedData.posts.map((p) =>
                PostsVO.from(p, {
                    username: p.username,
                    avatarUrl: p.avatarUrl
                })
            ),
            pagination: paginatedData.pagination
        };
    };

    const findByUser = async (
        userId: UUIDv7,
        params: PostQueryParams
    ): Promise<PaginatedPosts<PostsVO>> => {
        const paginatedData = await ops.listByUser(userId, params);

        return {
            posts: paginatedData.posts.map((p) =>
                PostsVO.from(p, {
                    username: p.username,
                    avatarUrl: p.avatarUrl
                })
            ),
            pagination: paginatedData.pagination
        };
    };

    const remove = async (postId: UUIDv7): Promise<PostsVO> => {
        const data = await ops.remove(postId);
        return PostsVO.from(data);
    };

    // Performance optimization: direct update without domain validation
    // const update = async (
    //     postId: UUIDv7,
    //     input: PostUpdate
    // ): Promise<PostsVO> => {
    //     const data = await ops.update(postId, input);
    //     return PostsVO.from(data);
    // };

    return {
        save,
        findById,
        findAll,
        findByUser,
        remove

        // Performance methods (skip domain validation)
        // update
    };
};
