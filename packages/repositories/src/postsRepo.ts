import { PostsVO } from '@phyt/models';

import type { PostsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    ISODate,
    PostInsert,
    PostUpdate,
    PostQueryParams,
    PaginatedPosts,
    PostRecord
} from '@phyt/types';

export type PostsRepository = ReturnType<typeof makePostsRepository>;

export const makePostsRepository = (ops: PostsDrizzleOps) => {
    function isDate(val: unknown): val is Date {
        return val instanceof Date;
    }

    function mapRecord(data: PostRecord | import('@phyt/types').Post): PostsVO {
        const status =
            'status' in data && typeof data.status === 'string'
                ? data.status
                : 'visible';
        return PostsVO.fromRecord({
            ...data,
            createdAt: (isDate(data.createdAt)
                ? data.createdAt.toISOString()
                : data.createdAt) as ISODate,
            updatedAt: (isDate(data.updatedAt)
                ? data.updatedAt.toISOString()
                : data.updatedAt) as ISODate,
            status
        });
    }

    const create = async (input: PostInsert): Promise<PostsVO> => {
        const data = await ops.create(input);
        return mapRecord(data);
    };

    const findById = async (postId: UUIDv7): Promise<PostsVO> => {
        const data = await ops.findById(postId);
        return mapRecord(data);
    };

    const list = async (
        params: PostQueryParams
    ): Promise<PaginatedPosts<PostsVO>> => {
        const paginatedData = await ops.list(params);

        return {
            posts: paginatedData.posts.map((p) => PostsVO.fromWithUser(p)),
            pagination: paginatedData.pagination
        };
    };

    const listByUser = async (
        userId: UUIDv7,
        params: PostQueryParams
    ): Promise<PaginatedPosts<PostsVO>> => {
        const paginatedData = await ops.listByUser(userId, params);

        return {
            posts: paginatedData.posts.map((p) => PostsVO.fromWithUser(p)),
            pagination: paginatedData.pagination
        };
    };

    const update = async (
        postId: UUIDv7,
        input: PostUpdate
    ): Promise<PostsVO> => {
        const data = await ops.update(postId, input);
        return mapRecord(data);
    };

    const remove = async (postId: UUIDv7): Promise<PostsVO> => {
        const data = await ops.remove(postId);
        return mapRecord(data);
    };

    return {
        create,
        findById,
        list,
        listByUser,
        update,
        remove
    };
};
