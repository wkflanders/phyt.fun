import { PostsVO } from '@phyt/models';

import type { PostsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    PostInsert,
    PostQueryParams,
    PaginatedPosts
} from '@phyt/types';

export type PostsRepository = ReturnType<typeof makePostsRepository>;

export const makePostsRepository = ({
    drizzleOps
}: {
    drizzleOps: PostsDrizzleOps;
}) => {
    const save = async ({ input }: { input: PostInsert }): Promise<PostsVO> => {
        const record = await drizzleOps.create({ input });
        return PostsVO.from({ post: record });
    };

    const findById = async ({
        postId
    }: {
        postId: UUIDv7;
    }): Promise<PostsVO> => {
        const record = await drizzleOps.findById({ postId });
        return PostsVO.from({ post: record });
    };

    const findAll = async ({
        params
    }: {
        params: PostQueryParams;
    }): Promise<PaginatedPosts<PostsVO>> => {
        const paginatedData = await drizzleOps.list({ params });

        return {
            posts: paginatedData.posts.map((p) =>
                PostsVO.from({
                    post: p,
                    options: {
                        username: p.username,
                        avatarUrl: p.avatarUrl
                    }
                })
            ),
            pagination: paginatedData.pagination
        };
    };

    const findByUser = async ({
        userId,
        params
    }: {
        userId: UUIDv7;
        params: PostQueryParams;
    }): Promise<PaginatedPosts<PostsVO>> => {
        const paginatedRecords = await drizzleOps.listByUser({
            userId,
            params
        });

        return {
            posts: paginatedRecords.posts.map((record) =>
                PostsVO.from({
                    post: record,
                    options: {
                        username: record.username,
                        avatarUrl: record.avatarUrl
                    }
                })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const remove = async ({ postId }: { postId: UUIDv7 }): Promise<PostsVO> => {
        const record = await drizzleOps.remove({ postId });
        return PostsVO.from({ post: record });
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
